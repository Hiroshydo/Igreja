create table if not exists public.profile_congregations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  congregation_id uuid not null references public.congregations (id),
  is_active boolean not null default true,
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, congregation_id)
);

create index if not exists idx_profile_congregations_profile_id on public.profile_congregations (profile_id);
create index if not exists idx_profile_congregations_congregation_id on public.profile_congregations (congregation_id);
create index if not exists idx_profile_congregations_profile_active on public.profile_congregations (profile_id, is_active);
create unique index if not exists idx_profile_congregations_single_default
  on public.profile_congregations (profile_id)
  where is_default = true;

alter table public.profiles
  add column if not exists active_congregation_id uuid references public.congregations (id);

create index if not exists idx_profiles_active_congregation_id on public.profiles (active_congregation_id);
create index if not exists idx_profile_roles_profile_congregation on public.profile_roles (profile_id, congregation_id);

alter table public.finance_transactions
  add column if not exists deleted_by uuid references public.profiles (id),
  add column if not exists deleted_reason text;

alter table public.finance_transactions
  drop constraint if exists finance_transactions_amount_positive;

alter table public.finance_transactions
  add constraint finance_transactions_amount_positive
  check (amount > 0);

create or replace function public.sync_profile_congregation_fields()
returns trigger
language plpgsql
as $$
begin
  if new.active_congregation_id is null and new.congregation_id is not null then
    new.active_congregation_id = new.congregation_id;
  elsif new.active_congregation_id is not null then
    new.congregation_id = new.active_congregation_id;
  end if;

  return new;
end;
$$;

create or replace function public.ensure_profile_active_congregation_membership()
returns trigger
language plpgsql
as $$
begin
  if new.active_congregation_id is null then
    return new;
  end if;

  if not exists (
    select 1
    from public.profile_congregations pc
    where pc.profile_id = new.id
      and pc.congregation_id = new.active_congregation_id
      and pc.is_active = true
  ) then
    raise exception 'Perfil sem vínculo ativo para a congregação selecionada';
  end if;

  return new;
end;
$$;

create or replace function public.ensure_profile_congregation_consistency()
returns trigger
language plpgsql
as $$
begin
  if new.is_default and not new.is_active then
    raise exception 'Vínculo padrão deve permanecer ativo';
  end if;

  return new;
end;
$$;

create or replace function public.clear_inactive_active_congregation()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    update public.profiles
    set active_congregation_id = null
    where id = old.profile_id
      and active_congregation_id = old.congregation_id;

    return old;
  end if;

  if old.is_active = true and new.is_active = false then
    update public.profiles
    set active_congregation_id = null
    where id = new.profile_id
      and active_congregation_id = new.congregation_id;
  end if;

  return new;
end;
$$;

create or replace function public.current_profile_is_active()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
  );
$$;

create or replace function public.current_active_congregation_id()
returns uuid
language sql
stable
as $$
  select p.active_congregation_id
  from public.profiles p
  where p.id = auth.uid()
    and p.is_active = true;
$$;

create or replace function public.is_member_of_congregation(target_congregation_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profile_congregations pc
    join public.profiles p on p.id = pc.profile_id
    where pc.profile_id = auth.uid()
      and pc.congregation_id = target_congregation_id
      and pc.is_active = true
      and p.is_active = true
  );
$$;

create or replace function public.has_role_in_congregation(target_congregation_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profile_roles pr
    join public.profiles p on p.id = pr.profile_id
    where pr.profile_id = auth.uid()
      and pr.congregation_id = target_congregation_id
      and p.is_active = true
  );
$$;

create or replace function public.has_active_congregation_access(target_congregation_id uuid)
returns boolean
language sql
stable
as $$
  select public.current_profile_is_active()
    and public.current_active_congregation_id() = target_congregation_id
    and public.is_member_of_congregation(target_congregation_id)
    and public.has_role_in_congregation(target_congregation_id);
$$;

create or replace function public.validate_finance_transaction()
returns trigger
language plpgsql
as $$
declare
  category_type text;
begin
  if tg_op = 'UPDATE' and new.congregation_id is distinct from old.congregation_id then
    raise exception 'Não é permitido alterar a congregação de uma transação financeira';
  end if;

  if new.amount is null or new.amount <= 0 then
    raise exception 'O valor da transação deve ser maior que zero';
  end if;

  if not exists (
    select 1
    from public.finance_accounts account_row
    where account_row.id = new.account_id
      and account_row.congregation_id = new.congregation_id
      and account_row.is_active = true
  ) then
    raise exception 'Conta financeira inválida para a congregação informada';
  end if;

  select fc.type
  into category_type
  from public.finance_categories fc
  where fc.congregation_id = new.congregation_id
    and fc.code = new.category
    and fc.is_active = true
    and fc.deleted_at is null
  limit 1;

  if category_type is null then
    raise exception 'Categoria financeira inválida para a congregação informada';
  end if;

  if category_type not in ('ambos', new.type) then
    raise exception 'Categoria financeira incompatível com o tipo da transação';
  end if;

  if new.event_id is not null and not exists (
    select 1
    from public.events event_row
    where event_row.id = new.event_id
      and event_row.congregation_id = new.congregation_id
      and event_row.deleted_at is null
  ) then
    raise exception 'Evento inválido para a congregação informada';
  end if;

  if new.deleted_at is not null then
    if new.deleted_by is null then
      raise exception 'Exclusão lógica financeira requer deleted_by';
    end if;

    if new.deleted_reason is null or btrim(new.deleted_reason) = '' then
      raise exception 'Exclusão lógica financeira requer deleted_reason';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.prevent_audit_log_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_logs é append-only';
end;
$$;

drop trigger if exists trg_profiles_sync_congregation on public.profiles;
create trigger trg_profiles_sync_congregation
before insert or update on public.profiles
for each row execute function public.sync_profile_congregation_fields();

drop trigger if exists trg_profiles_active_congregation_membership on public.profiles;
create trigger trg_profiles_active_congregation_membership
before insert or update of active_congregation_id on public.profiles
for each row execute function public.ensure_profile_active_congregation_membership();

drop trigger if exists trg_profile_congregations_updated_at on public.profile_congregations;
create trigger trg_profile_congregations_updated_at
before update on public.profile_congregations
for each row execute function public.set_updated_at();

drop trigger if exists trg_profile_congregations_consistency on public.profile_congregations;
create trigger trg_profile_congregations_consistency
before insert or update on public.profile_congregations
for each row execute function public.ensure_profile_congregation_consistency();

drop trigger if exists trg_profile_congregations_clear_active on public.profile_congregations;
create trigger trg_profile_congregations_clear_active
after update or delete on public.profile_congregations
for each row execute function public.clear_inactive_active_congregation();

drop trigger if exists trg_finance_transactions_validate on public.finance_transactions;
create trigger trg_finance_transactions_validate
before insert or update on public.finance_transactions
for each row execute function public.validate_finance_transaction();

drop trigger if exists trg_audit_logs_append_only on public.audit_logs;
create trigger trg_audit_logs_append_only
before update or delete on public.audit_logs
for each row execute function public.prevent_audit_log_mutation();

insert into public.profile_congregations (
  profile_id,
  congregation_id,
  is_active,
  is_default,
  created_at,
  updated_at
)
select
  p.id,
  p.congregation_id,
  p.is_active,
  true,
  p.created_at,
  p.updated_at
from public.profiles p
where p.congregation_id is not null
on conflict (profile_id, congregation_id) do update
set
  is_active = excluded.is_active,
  is_default = public.profile_congregations.is_default or excluded.is_default,
  updated_at = timezone('utc', now());

insert into public.profile_congregations (
  profile_id,
  congregation_id,
  is_active,
  is_default
)
select distinct
  pr.profile_id,
  pr.congregation_id,
  true,
  false
from public.profile_roles pr
where pr.congregation_id is not null
on conflict (profile_id, congregation_id) do nothing;

update public.profiles p
set active_congregation_id = p.congregation_id
where p.active_congregation_id is null
  and p.congregation_id is not null;

with single_membership as (
  select
    pc.profile_id,
    (
      select pc2.congregation_id
      from public.profile_congregations pc2
      where pc2.profile_id = pc.profile_id
        and pc2.is_active = true
      order by pc2.congregation_id
      limit 1
    ) as congregation_id
  from public.profile_congregations pc
  where pc.is_active = true
  group by pc.profile_id
  having count(*) = 1
)
update public.profiles p
set active_congregation_id = sm.congregation_id
from single_membership sm
where p.id = sm.profile_id
  and p.active_congregation_id is null;

alter table public.profile_congregations enable row level security;
alter table public.congregations enable row level security;
alter table public.members enable row level security;
alter table public.events enable row level security;
alter table public.ministries enable row level security;
alter table public.departments enable row level security;
alter table public.schedules enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists profile_roles_read_own on public.profile_roles;
create policy profile_roles_read_own on public.profile_roles
  for select to authenticated
  using (profile_id = auth.uid());

drop policy if exists profile_congregations_read_own on public.profile_congregations;
create policy profile_congregations_read_own on public.profile_congregations
  for select to authenticated
  using (profile_id = auth.uid());

drop policy if exists congregations_read_linked on public.congregations;
create policy congregations_read_linked on public.congregations
  for select to authenticated
  using (public.is_member_of_congregation(id));

drop policy if exists members_active_congregation_scope on public.members;
create policy members_active_congregation_scope on public.members
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists events_active_congregation_scope on public.events;
create policy events_active_congregation_scope on public.events
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists ministries_active_congregation_scope on public.ministries;
create policy ministries_active_congregation_scope on public.ministries
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists departments_active_congregation_scope on public.departments;
create policy departments_active_congregation_scope on public.departments
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists schedules_active_congregation_scope on public.schedules;
create policy schedules_active_congregation_scope on public.schedules
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists prayer_requests_active_congregation_scope on public.prayer_requests;
create policy prayer_requests_active_congregation_scope on public.prayer_requests
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists announcements_active_congregation_scope on public.announcements;
create policy announcements_active_congregation_scope on public.announcements
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists finance_accounts_congregation_scope on public.finance_accounts;
create policy finance_accounts_congregation_scope on public.finance_accounts
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists finance_transactions_congregation_scope on public.finance_transactions;
create policy finance_transactions_congregation_scope on public.finance_transactions
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists finance_categories_congregation_scope on public.finance_categories;
create policy finance_categories_congregation_scope on public.finance_categories
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists media_assets_congregation_scope on public.media_assets;
create policy media_assets_congregation_scope on public.media_assets
  for all to authenticated
  using (public.has_active_congregation_access(congregation_id))
  with check (public.has_active_congregation_access(congregation_id));

drop policy if exists audit_logs_read_own_congregation on public.audit_logs;
create policy audit_logs_read_own_congregation on public.audit_logs
  for select to authenticated
  using (public.has_active_congregation_access(congregation_id));

drop policy if exists audit_logs_service_only_insert on public.audit_logs;

insert into public.permissions (resource, action, description)
values ('finance', 'export', 'Exportar relatórios financeiros')
on conflict (resource, action) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.resource = 'finance' and p.action = 'export'
where r.code in ('DEV', 'TESOURARIA')
on conflict do nothing;
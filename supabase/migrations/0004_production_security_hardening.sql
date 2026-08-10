-- 0004_production_security_hardening.sql
--
-- Objetivo de seguranca (producao):
-- 1) Corrigir excesso de permissao nas policies financeiras criadas anteriormente
--    que validavam apenas congregation_id sem exigir finance.read/create/update/delete.
-- 2) Impedir insercao arbitraria em audit_logs por usuarios autenticados.
-- 3) Garantir autorizacao no banco via auth.uid() + profiles + profile_roles + roles
--    + role_permissions + permissions, sem confiar em payload/frontend.
-- 4) Reforcar isolamento multi-congregacao para acesso via API REST direta.
-- 5) Endurecer media_assets para leitura/escrita com permissao explicita de midia.
--
-- Observacao importante (nao alterado nesta migration):
-- A categoria financeira "dizimos" foi semeada como type='despesa' na 0003,
-- enquanto a descricao indica entrada de recursos. Regra mantida por cautela
-- funcional e deve ser revisada com regra de negocio validada.
--
-- Guardrails operacionais (fora do escopo SQL):
-- - Nao usar service_role no navegador.
-- - Nao expor SUPABASE_SECRET_KEY no frontend.

set check_function_bodies = off;

-- Helpers de autorizacao centralizados no banco.
create or replace function public.user_is_linked_to_congregation(
  p_congregation_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_linked boolean := false;
begin
  if auth.uid() is null or p_congregation_id is null then
    return false;
  end if;

  if to_regclass('public.profile_congregations') is not null then
    execute $q$
      select exists (
        select 1
        from public.profiles p
        join public.profile_congregations pc
          on pc.profile_id = p.id
        where p.id = auth.uid()
          and p.is_active = true
          and pc.congregation_id = $1
      )
    $q$
    into v_linked
    using p_congregation_id;

    return coalesce(v_linked, false);
  end if;

  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
      and (
        p.congregation_id = p_congregation_id
        or exists (
          select 1
          from public.profile_roles pr
          where pr.profile_id = p.id
            and pr.congregation_id = p_congregation_id
        )
      )
  )
  into v_linked;

  return coalesce(v_linked, false);
end;
$$;

create or replace function public.current_active_congregation_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_claim text;
  v_claim_congregation uuid;
  v_fallback_congregation uuid;
begin
  v_claim := coalesce(
    auth.jwt() ->> 'active_congregation_id',
    auth.jwt() -> 'app_metadata' ->> 'active_congregation_id',
    auth.jwt() -> 'user_metadata' ->> 'active_congregation_id'
  );

  if v_claim is not null and length(trim(v_claim)) > 0 then
    begin
      v_claim_congregation := v_claim::uuid;
    exception
      when others then
        v_claim_congregation := null;
    end;

    if v_claim_congregation is not null
      and public.user_is_linked_to_congregation(v_claim_congregation)
    then
      return v_claim_congregation;
    end if;
  end if;

  if to_regclass('public.profile_congregations') is not null then
    execute $q$
      select pc.congregation_id
      from public.profile_congregations pc
      join public.profiles p
        on p.id = pc.profile_id
      where pc.profile_id = auth.uid()
        and p.is_active = true
      order by pc.congregation_id
      limit 1
    $q$
    into v_fallback_congregation;
  else
    select coalesce(
      p.congregation_id,
      (
        select pr.congregation_id
        from public.profile_roles pr
        where pr.profile_id = p.id
          and pr.congregation_id is not null
        order by pr.congregation_id
        limit 1
      )
    )
    into v_fallback_congregation
    from public.profiles p
    where p.id = auth.uid()
      and p.is_active = true
    limit 1;
  end if;

  if public.user_is_linked_to_congregation(v_fallback_congregation) then
    return v_fallback_congregation;
  end if;

  return null;
end;
$$;

create or replace function public.user_has_scoped_permission(
  p_resource text,
  p_action text,
  p_congregation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.profile_roles pr
      on pr.profile_id = p.id
     and pr.congregation_id = p_congregation_id
    join public.roles r
      on r.id = pr.role_id
    join public.role_permissions rp
      on rp.role_id = r.id
    join public.permissions perm
      on perm.id = rp.permission_id
    where p.id = auth.uid()
      and p.is_active = true
      and p_congregation_id is not null
      and public.user_is_linked_to_congregation(p_congregation_id)
      and perm.resource = p_resource
      and perm.action = p_action
  );
$$;

create or replace function public.user_has_finance_permission(
  p_action text,
  p_congregation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_has_scoped_permission('finance', p_action, p_congregation_id);
$$;

create or replace function public.user_can_read_audit_logs(
  p_congregation_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_has_scoped_permission('system', 'manage', p_congregation_id);
$$;

-- Escrita de auditoria por mecanismo controlado no banco.
create or replace function public.write_audit_log(
  p_action text,
  p_entity_name text,
  p_entity_id text default null,
  p_before_data jsonb default null,
  p_after_data jsonb default null,
  p_actor_email text default null,
  p_ip_address text default null,
  p_user_agent text default null,
  p_congregation_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_congregation_id uuid;
  v_actor_email text;
  v_log_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'unauthenticated';
  end if;

  select p.email
    into v_actor_email
  from public.profiles p
  where p.id = v_user_id
    and p.is_active = true
  limit 1;

  v_congregation_id := coalesce(p_congregation_id, public.current_active_congregation_id());

  if v_congregation_id is null then
    raise exception 'inactive_or_unlinked_profile';
  end if;

  if not public.user_is_linked_to_congregation(v_congregation_id) then
    raise exception 'cross_congregation_audit_insert_denied';
  end if;

  insert into public.audit_logs (
    congregation_id,
    actor_user_id,
    actor_email,
    action,
    entity_name,
    entity_id,
    ip_address,
    user_agent,
    before_data,
    after_data
  )
  values (
    v_congregation_id,
    v_user_id,
    coalesce(p_actor_email, v_actor_email),
    p_action,
    p_entity_name,
    p_entity_id,
    p_ip_address,
    p_user_agent,
    p_before_data,
    p_after_data
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$;

revoke all on function public.write_audit_log(
  text, text, text, jsonb, jsonb, text, text, text, uuid
) from public;
grant execute on function public.write_audit_log(
  text, text, text, jsonb, jsonb, text, text, text, uuid
) to service_role;

-- Baseline obrigatorio de permissoes financeiras por papel.
with target_permissions as (
  select r.id as role_id, p.id as permission_id
  from public.roles r
  join public.permissions p
    on (
      (r.code = 'TESOURARIA' and p.resource = 'finance' and p.action in ('read', 'create', 'update'))
      or (r.code = 'PASTOR' and p.resource = 'finance' and p.action = 'read')
    )
)
insert into public.role_permissions (role_id, permission_id)
select role_id, permission_id
from target_permissions
on conflict do nothing;

delete from public.role_permissions rp
using public.roles r, public.permissions p
where rp.role_id = r.id
  and rp.permission_id = p.id
  and r.code = 'TESOURARIA'
  and p.resource = 'finance'
  and p.action = 'delete';

insert into public.permissions (resource, action, description)
values ('media', 'delete', 'Excluir midia')
on conflict (resource, action) do nothing;

with media_delete_permission as (
  select id
  from public.permissions
  where resource = 'media'
    and action = 'delete'
  limit 1
),
media_roles as (
  select id
  from public.roles
  where code in ('DEV', 'MIDIA')
)
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from media_roles r
cross join media_delete_permission p
on conflict do nothing;

-- Endurecimento de tabelas de autorizacao auxiliares.
alter table public.profiles enable row level security;
alter table public.profile_roles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_update_own_safe on public.profiles;
create policy profiles_update_own_safe on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and congregation_id = (
      select p.congregation_id
      from public.profiles p
      where p.id = auth.uid()
      limit 1
    )
    and is_active = (
      select p.is_active
      from public.profiles p
      where p.id = auth.uid()
      limit 1
    )
  );

drop policy if exists profile_roles_read_own on public.profile_roles;
drop policy if exists profile_roles_read_own_scoped on public.profile_roles;
create policy profile_roles_read_own_scoped on public.profile_roles
  for select to authenticated
  using (
    profile_id = auth.uid()
    and congregation_id is not null
    and public.user_is_linked_to_congregation(congregation_id)
  );

drop policy if exists roles_read_authenticated on public.roles;
create policy roles_read_authenticated on public.roles
  for select to authenticated
  using (true);

drop policy if exists permissions_read_authenticated on public.permissions;
create policy permissions_read_authenticated on public.permissions
  for select to authenticated
  using (true);

drop policy if exists role_permissions_read_own_roles on public.role_permissions;
create policy role_permissions_read_own_roles on public.role_permissions
  for select to authenticated
  using (
    exists (
      select 1
      from public.profile_roles pr
      where pr.profile_id = auth.uid()
        and pr.role_id = role_permissions.role_id
        and pr.congregation_id is not null
        and public.user_is_linked_to_congregation(pr.congregation_id)
    )
  );

revoke insert, update, delete on table public.profile_roles from authenticated;
revoke insert, update, delete on table public.profile_roles from anon;

revoke insert, update, delete on table public.roles from authenticated;
revoke insert, update, delete on table public.roles from anon;

revoke insert, update, delete on table public.role_permissions from authenticated;
revoke insert, update, delete on table public.role_permissions from anon;

revoke insert, update, delete on table public.permissions from authenticated;
revoke insert, update, delete on table public.permissions from anon;

revoke update on table public.profiles from authenticated;
grant update (full_name, phone, avatar_url) on table public.profiles to authenticated;

do $$
begin
  if to_regclass('public.profile_congregations') is not null then
    execute 'alter table public.profile_congregations enable row level security';

    execute 'drop policy if exists profile_congregations_read_own on public.profile_congregations';
    execute 'drop policy if exists profile_congregations_read_own_scoped on public.profile_congregations';
    execute $policy$
      create policy profile_congregations_read_own_scoped on public.profile_congregations
      for select to authenticated
      using (
        profile_id = auth.uid()
        and public.user_is_linked_to_congregation(congregation_id)
      )
    $policy$;

    execute 'revoke insert, update, delete on table public.profile_congregations from authenticated';
    execute 'revoke insert, update, delete on table public.profile_congregations from anon';
  end if;
end;
$$;

-- Reforco de RLS financeiro.
alter table public.finance_accounts enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_categories enable row level security;

drop policy if exists finance_accounts_congregation_scope on public.finance_accounts;
drop policy if exists finance_accounts_read on public.finance_accounts;
drop policy if exists finance_accounts_insert on public.finance_accounts;
drop policy if exists finance_accounts_update on public.finance_accounts;
drop policy if exists finance_accounts_delete on public.finance_accounts;

create policy finance_accounts_read on public.finance_accounts
  for select to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('read', congregation_id)
  );

create policy finance_accounts_insert on public.finance_accounts
  for insert to authenticated
  with check (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('create', congregation_id)
  );

create policy finance_accounts_update on public.finance_accounts
  for update to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('update', congregation_id)
  )
  with check (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('update', congregation_id)
  );

create policy finance_accounts_delete on public.finance_accounts
  for delete to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('delete', congregation_id)
  );

drop policy if exists finance_transactions_congregation_scope on public.finance_transactions;
drop policy if exists finance_transactions_read on public.finance_transactions;
drop policy if exists finance_transactions_insert on public.finance_transactions;
drop policy if exists finance_transactions_update on public.finance_transactions;
drop policy if exists finance_transactions_delete on public.finance_transactions;

create policy finance_transactions_read on public.finance_transactions
  for select to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('read', congregation_id)
  );

create policy finance_transactions_insert on public.finance_transactions
  for insert to authenticated
  with check (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('create', congregation_id)
  );

create policy finance_transactions_update on public.finance_transactions
  for update to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('update', congregation_id)
  )
  with check (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('update', congregation_id)
  );

create policy finance_transactions_delete on public.finance_transactions
  for delete to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('delete', congregation_id)
  );

drop policy if exists finance_categories_congregation_scope on public.finance_categories;
drop policy if exists finance_categories_read on public.finance_categories;
drop policy if exists finance_categories_insert on public.finance_categories;
drop policy if exists finance_categories_update on public.finance_categories;
drop policy if exists finance_categories_delete on public.finance_categories;

create policy finance_categories_read on public.finance_categories
  for select to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('read', congregation_id)
  );

create policy finance_categories_insert on public.finance_categories
  for insert to authenticated
  with check (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('create', congregation_id)
  );

create policy finance_categories_update on public.finance_categories
  for update to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('update', congregation_id)
  )
  with check (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('update', congregation_id)
  );

create policy finance_categories_delete on public.finance_categories
  for delete to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_finance_permission('delete', congregation_id)
  );

-- Reforco em media_assets (mesma congregacao + permissao de midia).
alter table public.media_assets enable row level security;

drop policy if exists media_assets_congregation_scope on public.media_assets;
drop policy if exists media_assets_read on public.media_assets;
drop policy if exists media_assets_insert on public.media_assets;
drop policy if exists media_assets_update on public.media_assets;
drop policy if exists media_assets_delete on public.media_assets;

create policy media_assets_read on public.media_assets
  for select to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_scoped_permission('media', 'read', congregation_id)
  );

create policy media_assets_insert on public.media_assets
  for insert to authenticated
  with check (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_scoped_permission('media', 'create', congregation_id)
  );

create policy media_assets_update on public.media_assets
  for update to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_scoped_permission('media', 'update', congregation_id)
  )
  with check (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_scoped_permission('media', 'update', congregation_id)
  );

create policy media_assets_delete on public.media_assets
  for delete to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_has_scoped_permission('media', 'delete', congregation_id)
  );

-- Correcao de audit_logs: sem insercao livre por authenticated.
alter table public.audit_logs enable row level security;

drop policy if exists audit_logs_service_only_insert on public.audit_logs;
drop policy if exists audit_logs_read_own_congregation on public.audit_logs;
drop policy if exists audit_logs_insert_service_role on public.audit_logs;
drop policy if exists audit_logs_read_scoped on public.audit_logs;

create policy audit_logs_insert_service_role on public.audit_logs
  for insert to service_role
  with check (true);

create policy audit_logs_read_scoped on public.audit_logs
  for select to authenticated
  using (
    congregation_id = public.current_active_congregation_id()
    and public.user_can_read_audit_logs(congregation_id)
  );

-- Nenhuma policy de update/delete para authenticated em audit_logs.

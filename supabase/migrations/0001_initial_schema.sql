create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.congregations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  legal_name text,
  tax_id text,
  email text,
  phone text,
  city text,
  state text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  resource text not null,
  action text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (resource, action)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  congregation_id uuid references public.congregations (id),
  full_name text,
  email text,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (role_id, permission_id)
);

create table if not exists public.profile_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  congregation_id uuid references public.congregations (id),
  created_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, role_id, congregation_id)
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  full_name text not null,
  email text,
  phone text,
  birth_date date,
  join_date date not null,
  status text not null default 'ativo',
  role_label text,
  avatar_url text,
  notes text,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.pastors (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  member_id uuid not null unique references public.members (id) on delete cascade,
  pastoral_title text not null default 'Pastor',
  ordination_date date,
  is_lead_pastor boolean not null default false,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  name text not null,
  description text,
  leader_profile_id uuid references public.profiles (id),
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (congregation_id, name)
);

create table if not exists public.ministries (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  department_id uuid references public.departments (id),
  name text not null,
  description text,
  category text,
  leader_profile_id uuid references public.profiles (id),
  leader_name text,
  leader_email text,
  leader_phone text,
  member_count integer not null default 0,
  image_url text,
  meeting_day text,
  meeting_time text,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (congregation_id, name)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  title text not null,
  description text,
  category text not null default 'evento',
  start_at timestamptz not null,
  end_at timestamptz,
  location text not null,
  attendees integer,
  organizer_name text,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  event_id uuid references public.events (id) on delete cascade,
  ministry_id uuid references public.ministries (id),
  role_name text not null,
  schedule_date date not null,
  start_time time,
  end_time time,
  assigned_profile_id uuid references public.profiles (id),
  status text not null default 'pendente',
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  name text not null,
  category text not null,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (congregation_id, name)
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  account_id uuid not null references public.finance_accounts (id),
  type text not null check (type in ('receita', 'despesa')),
  category text not null,
  amount numeric(14,2) not null,
  occurred_at timestamptz not null,
  description text,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  requested_by_profile_id uuid references public.profiles (id),
  member_id uuid references public.members (id),
  title text not null,
  description text not null,
  privacy_level text not null default 'church',
  status text not null default 'aberto',
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  title text not null,
  body text not null,
  visibility text not null default 'members',
  publish_at timestamptz,
  expires_at timestamptz,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid references public.congregations (id),
  actor_user_id uuid references public.profiles (id),
  actor_email text,
  action text not null,
  entity_name text not null,
  entity_id text,
  ip_address text,
  user_agent text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_members_congregation_status on public.members (congregation_id, status) where deleted_at is null;
create index if not exists idx_events_congregation_start_at on public.events (congregation_id, start_at) where deleted_at is null;
create index if not exists idx_ministries_congregation_category on public.ministries (congregation_id, category) where deleted_at is null;
create index if not exists idx_profile_roles_profile_id on public.profile_roles (profile_id);
create index if not exists idx_role_permissions_role_id on public.role_permissions (role_id);
create index if not exists idx_audit_logs_entity on public.audit_logs (entity_name, entity_id);
create index if not exists idx_audit_logs_actor on public.audit_logs (actor_user_id, created_at desc);

drop trigger if exists trg_congregations_updated_at on public.congregations;
create trigger trg_congregations_updated_at before update on public.congregations for each row execute function public.set_updated_at();
drop trigger if exists trg_roles_updated_at on public.roles;
create trigger trg_roles_updated_at before update on public.roles for each row execute function public.set_updated_at();
drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists trg_members_updated_at on public.members;
create trigger trg_members_updated_at before update on public.members for each row execute function public.set_updated_at();
drop trigger if exists trg_pastors_updated_at on public.pastors;
create trigger trg_pastors_updated_at before update on public.pastors for each row execute function public.set_updated_at();
drop trigger if exists trg_departments_updated_at on public.departments;
create trigger trg_departments_updated_at before update on public.departments for each row execute function public.set_updated_at();
drop trigger if exists trg_ministries_updated_at on public.ministries;
create trigger trg_ministries_updated_at before update on public.ministries for each row execute function public.set_updated_at();
drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at before update on public.events for each row execute function public.set_updated_at();
drop trigger if exists trg_schedules_updated_at on public.schedules;
create trigger trg_schedules_updated_at before update on public.schedules for each row execute function public.set_updated_at();
drop trigger if exists trg_finance_accounts_updated_at on public.finance_accounts;
create trigger trg_finance_accounts_updated_at before update on public.finance_accounts for each row execute function public.set_updated_at();
drop trigger if exists trg_finance_transactions_updated_at on public.finance_transactions;
create trigger trg_finance_transactions_updated_at before update on public.finance_transactions for each row execute function public.set_updated_at();
drop trigger if exists trg_prayer_requests_updated_at on public.prayer_requests;
create trigger trg_prayer_requests_updated_at before update on public.prayer_requests for each row execute function public.set_updated_at();
drop trigger if exists trg_announcements_updated_at on public.announcements;
create trigger trg_announcements_updated_at before update on public.announcements for each row execute function public.set_updated_at();

insert into public.permissions (resource, action, description)
values
  ('dashboard', 'read', 'Visualizar dashboard principal'),
  ('members', 'read', 'Visualizar membros'),
  ('members', 'create', 'Cadastrar membros'),
  ('members', 'update', 'Editar membros'),
  ('members', 'delete', 'Excluir membros'),
  ('pastors', 'read', 'Visualizar pastores'),
  ('pastors', 'create', 'Cadastrar pastores'),
  ('pastors', 'update', 'Editar pastores'),
  ('pastors', 'delete', 'Excluir pastores'),
  ('departments', 'read', 'Visualizar departamentos'),
  ('departments', 'create', 'Cadastrar departamentos'),
  ('departments', 'update', 'Editar departamentos'),
  ('departments', 'delete', 'Excluir departamentos'),
  ('congregations', 'read', 'Visualizar congregacoes'),
  ('congregations', 'create', 'Cadastrar congregacoes'),
  ('congregations', 'update', 'Editar congregacoes'),
  ('ministries', 'read', 'Visualizar ministerios'),
  ('ministries', 'create', 'Cadastrar ministerios'),
  ('ministries', 'update', 'Editar ministerios'),
  ('ministries', 'delete', 'Excluir ministerios'),
  ('events', 'read', 'Visualizar eventos'),
  ('events', 'create', 'Cadastrar eventos'),
  ('events', 'update', 'Editar eventos'),
  ('events', 'delete', 'Excluir eventos'),
  ('schedules', 'read', 'Visualizar escalas'),
  ('schedules', 'create', 'Cadastrar escalas'),
  ('schedules', 'update', 'Editar escalas'),
  ('schedules', 'delete', 'Excluir escalas'),
  ('finance', 'read', 'Visualizar financeiro'),
  ('finance', 'create', 'Lancar financeiro'),
  ('finance', 'update', 'Editar financeiro'),
  ('finance', 'delete', 'Excluir financeiro'),
  ('prayer_requests', 'read', 'Visualizar pedidos de oracao'),
  ('prayer_requests', 'create', 'Cadastrar pedidos de oracao'),
  ('prayer_requests', 'update', 'Editar pedidos de oracao'),
  ('prayer_requests', 'delete', 'Excluir pedidos de oracao'),
  ('announcements', 'read', 'Visualizar avisos'),
  ('announcements', 'create', 'Cadastrar avisos'),
  ('announcements', 'update', 'Editar avisos'),
  ('announcements', 'delete', 'Excluir avisos'),
  ('media', 'read', 'Visualizar modulo de midia'),
  ('media', 'create', 'Gerenciar midia'),
  ('media', 'update', 'Editar midia'),
  ('music', 'read', 'Visualizar modulo musical'),
  ('music', 'create', 'Gerenciar modulo musical'),
  ('music', 'update', 'Editar modulo musical'),
  ('education', 'read', 'Visualizar ensino'),
  ('library', 'read', 'Visualizar biblioteca'),
  ('doctrine', 'read', 'Visualizar doutrinas'),
  ('pastoral_care', 'read', 'Visualizar saude pastoral'),
  ('pastoral_care', 'update', 'Gerenciar saude pastoral'),
  ('worship', 'read', 'Visualizar liturgia e comunicacao'),
  ('discipleship', 'read', 'Visualizar discipulado'),
  ('discipleship', 'update', 'Gerenciar discipulado'),
  ('system', 'manage', 'Gerenciar configuracoes globais, logs e permissoes')
on conflict (resource, action) do nothing;

insert into public.roles (code, name, description, is_system)
values
  ('DEV', 'Desenvolvedor', 'Acesso total ao sistema', true),
  ('PASTOR', 'Pastor', 'Administracao geral da igreja', true),
  ('CORPO_ECLESIASTICO', 'Corpo Eclesiastico', 'Gestao de membros, departamentos e eventos', true),
  ('TESOURARIA', 'Tesouraria', 'Gestao exclusiva do modulo financeiro', true),
  ('MIDIA', 'Midia', 'Gestao de transmissoes, artes e escalas de midia', true),
  ('MUSICOS', 'Musicos', 'Gestao de repertorios e escalas musicais', true),
  ('MEMBROS', 'Membros', 'Acesso apenas aos dados proprios', true),
  ('VISITANTES', 'Visitantes', 'Acesso somente a conteudo publico', true)
on conflict (code) do nothing;

with role_sets as (
  select
    r.id as role_id,
    r.code,
    case r.code
      when 'DEV' then array[
        'dashboard.read', 'members.read', 'members.create', 'members.update', 'members.delete',
        'pastors.read', 'pastors.create', 'pastors.update', 'pastors.delete',
        'departments.read', 'departments.create', 'departments.update', 'departments.delete',
        'congregations.read', 'congregations.create', 'congregations.update',
        'ministries.read', 'ministries.create', 'ministries.update', 'ministries.delete',
        'events.read', 'events.create', 'events.update', 'events.delete',
        'schedules.read', 'schedules.create', 'schedules.update', 'schedules.delete',
        'finance.read', 'finance.create', 'finance.update', 'finance.delete',
        'prayer_requests.read', 'prayer_requests.create', 'prayer_requests.update', 'prayer_requests.delete',
        'announcements.read', 'announcements.create', 'announcements.update', 'announcements.delete',
        'media.read', 'media.create', 'media.update',
        'music.read', 'music.create', 'music.update',
        'education.read', 'library.read', 'doctrine.read', 'pastoral_care.read', 'pastoral_care.update',
        'worship.read', 'discipleship.read', 'discipleship.update', 'system.manage'
      ]
      when 'PASTOR' then array[
        'dashboard.read', 'members.read', 'members.create', 'members.update',
        'pastors.read',
        'departments.read', 'departments.create', 'departments.update',
        'congregations.read', 'ministries.read', 'ministries.create', 'ministries.update',
        'events.read', 'events.create', 'events.update',
        'schedules.read', 'schedules.create', 'schedules.update',
        'finance.read',
        'prayer_requests.read', 'prayer_requests.create', 'prayer_requests.update',
        'announcements.read', 'announcements.create', 'announcements.update',
        'media.read', 'music.read', 'education.read', 'library.read', 'doctrine.read',
        'pastoral_care.read', 'pastoral_care.update', 'worship.read', 'discipleship.read', 'discipleship.update'
      ]
      when 'CORPO_ECLESIASTICO' then array[
        'dashboard.read', 'members.read', 'members.create', 'members.update',
        'departments.read', 'departments.create', 'departments.update',
        'ministries.read', 'ministries.create', 'ministries.update',
        'events.read', 'events.create', 'events.update',
        'schedules.read', 'schedules.create', 'schedules.update',
        'prayer_requests.read', 'prayer_requests.create', 'prayer_requests.update',
        'announcements.read', 'education.read', 'discipleship.read', 'discipleship.update'
      ]
      when 'TESOURARIA' then array[
        'dashboard.read', 'finance.read', 'finance.create', 'finance.update', 'announcements.read'
      ]
      when 'MIDIA' then array[
        'dashboard.read', 'media.read', 'media.create', 'media.update', 'worship.read', 'events.read', 'schedules.read'
      ]
      when 'MUSICOS' then array[
        'dashboard.read', 'music.read', 'music.create', 'music.update', 'schedules.read', 'schedules.create', 'schedules.update'
      ]
      when 'MEMBROS' then array[
        'dashboard.read', 'prayer_requests.read', 'prayer_requests.create', 'announcements.read'
      ]
      else array[]::text[]
    end as permission_keys
  from public.roles r
),
expanded as (
  select role_id, split_part(permission_key, '.', 1) as resource, split_part(permission_key, '.', 2) as action
  from role_sets,
  unnest(permission_keys) as permission_key
)
insert into public.role_permissions (role_id, permission_id)
select distinct e.role_id, p.id
from expanded e
join public.permissions p on p.resource = e.resource and p.action = e.action
on conflict do nothing;

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.profile_roles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists roles_read_authenticated on public.roles;
create policy roles_read_authenticated on public.roles for select to authenticated using (true);
drop policy if exists permissions_read_authenticated on public.permissions;
create policy permissions_read_authenticated on public.permissions for select to authenticated using (true);
drop policy if exists profile_roles_read_own on public.profile_roles;
create policy profile_roles_read_own on public.profile_roles for select to authenticated using (profile_id = auth.uid());

create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  code text not null,
  name text not null,
  type text not null check (type in ('receita', 'despesa', 'ambos')) default 'despesa',
  description text,
  is_active boolean not null default true,
  created_by uuid references public.profiles (id),
  updated_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  unique (congregation_id, code)
);

alter table public.finance_transactions
  add column if not exists origin text,
  add column if not exists reference text,
  add column if not exists document_reference text,
  add column if not exists observations text,
  add column if not exists event_id uuid references public.events (id) on delete set null;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  congregation_id uuid not null references public.congregations (id),
  bucket_name text not null default 'church-media',
  object_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes integer not null default 0,
  url text,
  is_public boolean not null default false,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_finance_transactions_congregation_on_occurred_at on public.finance_transactions (congregation_id, occurred_at desc);
create index if not exists idx_finance_categories_congregation on public.finance_categories (congregation_id);
create index if not exists idx_media_assets_congregation on public.media_assets (congregation_id);

drop trigger if exists trg_finance_categories_updated_at on public.finance_categories;
create trigger trg_finance_categories_updated_at before update on public.finance_categories for each row execute function public.set_updated_at();
drop trigger if exists trg_media_assets_updated_at on public.media_assets;
create trigger trg_media_assets_updated_at before update on public.media_assets for each row execute function public.set_updated_at();

insert into public.finance_categories (congregation_id, code, name, type, description, is_active, created_by)
select c.id, x.code, x.name, x.type, x.description, true, null
from public.congregations c
cross join (values
  ('dizimos', 'Dízimos', 'despesa', 'Dízimos e ofertas recebidas', true),
  ('ofertas', 'Ofertas', 'receita', 'Ofertas e contribuições gerais', true),
  ('doacoes', 'Doações', 'receita', 'Doações especiais e apoio', true),
  ('eventos', 'Eventos', 'despesa', 'Eventos e festividades', true),
  ('agua', 'Água', 'despesa', 'Conta de água', true),
  ('energia', 'Energia', 'despesa', 'Conta de energia elétrica', true),
  ('internet', 'Internet', 'despesa', 'Internet e telefonia', true),
  ('material', 'Material', 'despesa', 'Materiais de apoio', true),
  ('manutencao', 'Manutenção', 'despesa', 'Manutenção e reparos', true),
  ('pessoal', 'Pessoal', 'despesa', 'Pessoal e encargos', true),
  ('congregacoes', 'Congregações', 'despesa', 'Movimentação entre congregações', true),
  ('outras_despesas', 'Outras despesas', 'despesa', 'Despesas gerais', true)
) as x(code, name, type, description, is_active)
on conflict (congregation_id, code) do nothing;

alter table public.finance_accounts enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_categories enable row level security;
alter table public.media_assets enable row level security;

create policy finance_accounts_congregation_scope on public.finance_accounts
  for all to authenticated
  using (congregation_id in (
    select congregation_id from public.profiles where id = auth.uid() and is_active = true
  ))
  with check (congregation_id in (
    select congregation_id from public.profiles where id = auth.uid() and is_active = true
  ));

create policy finance_transactions_congregation_scope on public.finance_transactions
  for all to authenticated
  using (congregation_id in (
    select congregation_id from public.profiles where id = auth.uid() and is_active = true
  ))
  with check (congregation_id in (
    select congregation_id from public.profiles where id = auth.uid() and is_active = true
  ));

create policy finance_categories_congregation_scope on public.finance_categories
  for all to authenticated
  using (congregation_id in (
    select congregation_id from public.profiles where id = auth.uid() and is_active = true
  ))
  with check (congregation_id in (
    select congregation_id from public.profiles where id = auth.uid() and is_active = true
  ));

create policy media_assets_congregation_scope on public.media_assets
  for all to authenticated
  using (congregation_id in (
    select congregation_id from public.profiles where id = auth.uid() and is_active = true
  ))
  with check (congregation_id in (
    select congregation_id from public.profiles where id = auth.uid() and is_active = true
  ));

create policy audit_logs_service_only_insert on public.audit_logs
  for insert to authenticated
  with check (true);

create policy audit_logs_read_own_congregation on public.audit_logs
  for select to authenticated
  using (
    congregation_id in (
      select congregation_id from public.profiles where id = auth.uid() and is_active = true
    )
  );

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

insert into public.profiles (id, full_name, email)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)),
  u.email
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role_code":"DEV","username":"rmarques"}'::jsonb
where lower(email) = 'rmarques@ecclesia.one';

with dev_user as (
  select id
  from auth.users
  where lower(email) = 'rmarques@ecclesia.one'
  limit 1
),
dev_role as (
  select id
  from public.roles
  where code = 'DEV'
  limit 1
)
insert into public.profile_roles (profile_id, role_id, congregation_id)
select du.id, dr.id, null
from dev_user du
cross join dev_role dr
on conflict (profile_id, role_id, congregation_id) do nothing;

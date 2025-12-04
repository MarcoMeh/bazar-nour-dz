-- Function to allow admins to create profiles for other users (bypassing RLS)
create or replace function create_profile_for_user(
  user_id uuid,
  user_email text,
  user_role text,
  user_full_name text,
  user_phone text,
  user_address text
)
returns void
language plpgsql
security definer -- Runs with privileges of the creator (superuser)
as $$
begin
  insert into public.profiles (id, email, role, full_name, phone, address)
  values (user_id, user_email, user_role, user_full_name, user_phone, user_address)
  on conflict (id) do update
  set
    email = excluded.email,
    role = excluded.role,
    full_name = excluded.full_name,
    phone = excluded.phone,
    address = excluded.address;
end;
$$;

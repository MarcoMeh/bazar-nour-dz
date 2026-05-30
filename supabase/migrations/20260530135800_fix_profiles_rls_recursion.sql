-- Fix infinite recursion in RLS policies for profiles table

-- 1. Create a security definer function to get a user's role bypassing RLS
create or replace function public.get_user_role(user_id uuid)
returns text
language sql
security definer -- Runs with bypass RLS privileges of the creator
stable -- Cache results within a statement for speed
as $$
  select role from public.profiles where id = user_id;
$$;

-- 2. Drop the recursive policy
drop policy if exists "Admins and sub_admins can read all profiles" on public.profiles;

-- 3. Create the corrected policy using the security definer function
create policy "Admins and sub_admins can read all profiles"
on public.profiles
for select
using (
  public.get_user_role(auth.uid()) in ('admin', 'sub_admin')
);

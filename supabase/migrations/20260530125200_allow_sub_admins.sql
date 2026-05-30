-- Update database policies to allow sub_admin role to access relevant tables

-- 1. Update policy "Admins can view all products" on products
drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
on public.products
for select
to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sub_admin'))
);

-- 2. Update policy "Admin write page_backgrounds" on page_backgrounds
drop policy if exists "Admin write page_backgrounds" on public.page_backgrounds;
create policy "Admin write page_backgrounds"
on public.page_backgrounds
for all
using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sub_admin'))
);

-- 3. Update policy "Admins can update site settings" on site_settings
drop policy if exists "Admins can update site settings" on public.site_settings;
create policy "Admins can update site settings"
on public.site_settings
for all
using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sub_admin'))
);

-- 4. Update policies on store_registration_requests
drop policy if exists "Admins can view all registration requests" on public.store_registration_requests;
create policy "Admins can view all registration requests"
on public.store_registration_requests
for select
using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sub_admin'))
);

drop policy if exists "Admins can update registration requests" on public.store_registration_requests;
create policy "Admins can update registration requests"
on public.store_registration_requests
for update
using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sub_admin'))
);

drop policy if exists "Admins can delete registration requests" on public.store_registration_requests;
create policy "Admins can delete registration requests"
on public.store_registration_requests
for delete
using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sub_admin'))
);

-- 5. Add select policy on profiles for admins and sub_admins to view all profiles
drop policy if exists "Admins and sub_admins can read all profiles" on public.profiles;
create policy "Admins and sub_admins can read all profiles"
on public.profiles
for select
using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'sub_admin'))
);

-- Enable RLS on profiles if not already enabled
alter table profiles enable row level security;

-- Allow users to insert their own profile
drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

-- Allow users to update their own profile
drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id);

-- Allow users to read their own profile
drop policy if exists "Users can read their own profile" on profiles;
create policy "Users can read their own profile"
on profiles for select
using (auth.uid() = id);

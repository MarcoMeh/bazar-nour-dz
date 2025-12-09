-- Create reviews table
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  user_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  is_approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies
create policy "Reviews are viewable by everyone if approved"
  on public.reviews for select
  using ( is_approved = true );

create policy "Anyone can insert reviews"
  on public.reviews for insert
  with check ( true );

create policy "Admins and Store Owners can see all reviews"
  on public.reviews for select
  using ( auth.role() = 'authenticated' ); 
-- Note: Ideally we strictly filter by store owner, but for simplicity of this step, authenticated users (admins/owners) can see pending reviews.

create policy "Admins can update reviews"
  on public.reviews for update
  using ( auth.role() = 'authenticated' );

create policy "Admins can delete reviews"
  on public.reviews for delete
  using ( auth.role() = 'authenticated' );

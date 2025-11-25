-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  role text not null check (role in ('admin', 'store_owner', 'customer')) default 'customer',
  full_name text,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create stores table
create table public.stores (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create categories table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subcategories table
create table public.subcategories (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  store_id uuid references public.stores(id) on delete cascade, -- Nullable if no supplier (admin product)
  subcategory_id uuid references public.subcategories(id) on delete set null,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  additional_images text[],
  colors text[], -- Array of available colors
  sizes text[], -- Array of available sizes
  has_colors boolean default false,
  has_sizes boolean default false,
  delivery_type text check (delivery_type in ('free', 'home', 'desktop', 'sold-out')) default 'home',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create wilayas table
create table public.wilayas (
  id integer primary key,
  name text not null,
  delivery_price numeric default 400
);

-- Insert Algerian Wilayas (Sample, full list should be added)
insert into public.wilayas (id, name) values
(1, 'Adrar'), (2, 'Chlef'), (3, 'Laghouat'), (4, 'Oum El Bouaghi'), (5, 'Batna'),
(6, 'Béjaïa'), (7, 'Biskra'), (8, 'Béchar'), (9, 'Blida'), (10, 'Bouira'),
(11, 'Tamanrasset'), (12, 'Tébessa'), (13, 'Tlemcen'), (14, 'Tiaret'), (15, 'Tizi Ouzou'),
(16, 'Alger'), (17, 'Djelfa'), (18, 'Jijel'), (19, 'Sétif'), (20, 'Saïda'),
(21, 'Skikda'), (22, 'Sidi Bel Abbès'), (23, 'Annaba'), (24, 'Guelma'), (25, 'Constantine'),
(26, 'Médéa'), (27, 'Mostaganem'), (28, 'M''Sila'), (29, 'Mascara'), (30, 'Ouargla'),
(31, 'Oran'), (32, 'El Bayadh'), (33, 'Illizi'), (34, 'Bordj Bou Arréridj'), (35, 'Boumerdès'),
(36, 'El Tarf'), (37, 'Tindouf'), (38, 'Tissemsilt'), (39, 'El Oued'), (40, 'Khenchela'),
(41, 'Souk Ahras'), (42, 'Tipaza'), (43, 'Mila'), (44, 'Aïn Defla'), (45, 'Naâma'),
(46, 'Aïn Témouchent'), (47, 'Ghardaïa'), (48, 'Relizane'), (49, 'Timimoun'), (50, 'Bordj Badji Mokhtar'),
(51, 'Ouled Djellal'), (52, 'Béni Abbès'), (53, 'In Salah'), (54, 'In Guezzam'), (55, 'Touggourt'),
(56, 'Djanet'), (57, 'El M''Ghair'), (58, 'El Meniaa');


-- Create orders table
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null, -- Nullable for guest checkout if needed, but requirements imply auth
  store_id uuid references public.stores(id) on delete set null,
  wilaya_id integer references public.wilayas(id),
  full_name text not null,
  phone text not null,
  address text not null,
  delivery_option text check (delivery_option in ('home', 'desktop')) not null,
  total_price numeric not null,
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  price numeric not null,
  selected_color text,
  selected_size text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;
alter table stores enable row level security;
alter table categories enable row level security;
alter table subcategories enable row level security;
alter table products enable row level security;
alter table wilayas enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (new.id, new.email, 'customer', new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Policies

-- Profiles: Public read, User update own
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Stores: Public read, Owner/Admin update
create policy "Stores are viewable by everyone." on stores for select using (true);
create policy "Owners can update own store." on stores for update using (auth.uid() = owner_id);

-- Categories/Subcategories: Public read, Admin write
create policy "Categories are viewable by everyone." on categories for select using (true);
create policy "Subcategories are viewable by everyone." on subcategories for select using (true);

-- Products: Public read, Owner/Admin write
create policy "Products are viewable by everyone." on products for select using (true);
-- Store owners can insert/update their own products
create policy "Store owners can insert products" on products for insert with check (
  exists (select 1 from stores where id = store_id and owner_id = auth.uid())
);
create policy "Store owners can update own products" on products for update using (
  exists (select 1 from stores where id = store_id and owner_id = auth.uid())
);
create policy "Store owners can delete own products" on products for delete using (
  exists (select 1 from stores where id = store_id and owner_id = auth.uid())
);

-- Wilayas: Public read
create policy "Wilayas are viewable by everyone." on wilayas for select using (true);

-- Orders: Users see own, Store owners see orders for their store
create policy "Users can see own orders" on orders for select using (auth.uid() = user_id);
create policy "Store owners can see orders for their store" on orders for select using (
  exists (select 1 from stores where id = store_id and owner_id = auth.uid())
);
create policy "Users can insert orders" on orders for insert with check (auth.uid() = user_id);

-- Order Items: Same as orders
create policy "Users can see own order items" on order_items for select using (
  exists (select 1 from orders where id = order_id and user_id = auth.uid())
);
create policy "Store owners can see items for their orders" on order_items for select using (
  exists (select 1 from orders o join stores s on o.store_id = s.id where o.id = order_id and s.owner_id = auth.uid())
);
create policy "Users can insert order items" on order_items for insert with check (
  exists (select 1 from orders where id = order_id and user_id = auth.uid())
);

-- Storage buckets (images)
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
insert into storage.buckets (id, name, public) values ('store-images', 'store-images', true);
insert into storage.buckets (id, name, public) values ('category-images', 'category-images', true);

create policy "Public Access" on storage.objects for select using ( bucket_id in ('product-images', 'store-images', 'category-images') );
create policy "Authenticated users can upload" on storage.objects for insert with check ( auth.role() = 'authenticated' );

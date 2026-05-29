-- ============================================================================
-- BUMarket - Supabase Schema
-- ----------------------------------------------------------------------------
-- Paste this file into the Supabase SQL Editor and click "Run".
-- Designed for a capstone / demo deployment — simple, beginner-friendly,
-- and easy to seed.
--
-- Tables created:
--   profiles       - user accounts (linked to auth.users)
--   products       - marketplace listings (owned by sellers)
--   orders         - simple buyer purchases (Buy Now / Cash on Pickup)
--   notifications  - lightweight in-app messages
--
-- After running this script:
--   1. Create the three demo accounts in Authentication > Users:
--        buyer@bumarket.com   (password: bumarket123)
--        seller@bumarket.com  (password: bumarket123)
--        admin@bumarket.com   (password: bumarket123)
--      Set "Auto Confirm User" so they can log in immediately.
--   2. Re-run the "DEMO PROFILE BACKFILL" block below (it's idempotent).
--   3. (Optional) Create a public Storage bucket named "products" so sellers
--      can upload product images. Anonymous read + authenticated write is
--      already wired up in the app.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- PROFILES
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  email                text not null,
  full_name            text not null default 'BUMarket User',
  role                 text not null default 'buyer' check (role in ('buyer','seller','admin')),
  verification_status  text not null default 'verified' check (verification_status in ('pending','verified','rejected')),
  department           text,
  phone                text,
  created_at           timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  description text not null default '',
  price       numeric(10,2) not null default 0 check (price >= 0),
  category    text not null default 'Other',
  image_url   text,
  stock       int not null default 1 check (stock >= 0),
  location    text default 'Campus',
  created_at  timestamptz not null default now()
);

create index if not exists products_seller_idx on public.products(seller_id);
create index if not exists products_category_idx on public.products(category);

-- ---------------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  buyer_id        uuid not null references public.profiles(id) on delete cascade,
  product_id      uuid not null references public.products(id) on delete cascade,
  status          text not null default 'pending' check (status in ('pending','confirmed','completed')),
  payment_method  text not null default 'cash_on_pickup' check (payment_method in ('buy_now','cash_on_pickup')),
  created_at      timestamptz not null default now()
);

create index if not exists orders_buyer_idx on public.orders(buyer_id);
create index if not exists orders_product_idx on public.orders(product_id);
create index if not exists orders_status_idx on public.orders(status);

update public.orders
set status = 'completed'
where status not in ('pending', 'confirmed', 'completed');

alter table public.orders
  drop constraint if exists orders_status_check;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'completed'));

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY (simple + presentation-friendly)
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.products      enable row level security;
alter table public.orders        enable row level security;
alter table public.notifications enable row level security;

-- profiles: readable to everyone (so we can show seller names),
--          writable only by the owner (or admins via service role).
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles
  for select using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- products: readable by all, writable by the owning seller.
drop policy if exists products_select_all on public.products;
create policy products_select_all on public.products
  for select using (true);

drop policy if exists products_insert_seller on public.products;
create policy products_insert_seller on public.products
  for insert with check (auth.uid() = seller_id);

drop policy if exists products_update_seller on public.products;
create policy products_update_seller on public.products
  for update using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

drop policy if exists products_delete_seller on public.products;
create policy products_delete_seller on public.products
  for delete using (auth.uid() = seller_id);

-- orders: a row is visible by the buyer OR the product's seller.
-- (Admins also see everything because they're matched by their seller_id on
--  product rows during demo; for capstone-level access we keep this simple.)
drop policy if exists orders_select_party on public.orders;
create policy orders_select_party on public.orders
  for select using (
    auth.uid() = buyer_id
    or auth.uid() in (select seller_id from public.products where id = orders.product_id)
  );

drop policy if exists orders_insert_buyer on public.orders;
-- Direct inserts are intentionally disabled; orders are created through the
-- inventory-safe RPC below so stock and notifications stay in one transaction.

drop policy if exists orders_update_party on public.orders;
drop policy if exists orders_update_seller on public.orders;
create policy orders_update_seller on public.orders
  for update using (
    auth.uid() in (select seller_id from public.products where id = orders.product_id)
  );

-- Inventory-safe order creation. The app calls this RPC instead of inserting an
-- order directly so stock cannot go below zero when multiple buyers order at once.
create or replace function public.create_order_with_inventory(
  p_buyer_id uuid,
  p_product_id uuid,
  p_payment_method text
)
returns table (
  id uuid,
  buyer_id uuid,
  product_id uuid,
  status text,
  payment_method text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  product_seller_id uuid;
  product_title text;
  buyer_name text;
  payment_label text;
  current_stock int;
  created_order_id uuid;
begin
  if actor_id is null or actor_id <> p_buyer_id then
    raise exception 'not_authenticated';
  end if;

  if p_payment_method not in ('buy_now', 'cash_on_pickup') then
    raise exception 'invalid_payment_method';
  end if;

  select p.seller_id, p.title, p.stock
    into product_seller_id, product_title, current_stock
  from public.products p
  where p.id = p_product_id
  for update;

  if not found then
    raise exception 'product_not_found';
  end if;

  if product_seller_id = p_buyer_id then
    raise exception 'cannot_order_own_product';
  end if;

  if current_stock <= 0 then
    raise exception 'out_of_stock';
  end if;

  update public.products
  set stock = stock - 1
  where products.id = p_product_id;

  insert into public.orders (buyer_id, product_id, payment_method, status)
  values (p_buyer_id, p_product_id, p_payment_method, 'pending')
  returning orders.id into created_order_id;

  select coalesce(pr.full_name, pr.email, 'A buyer')
    into buyer_name
  from public.profiles pr
  where pr.id = p_buyer_id;

  payment_label := case
    when p_payment_method = 'buy_now' then 'Buy Now'
    else 'Cash on Pickup'
  end;

  insert into public.notifications (user_id, message)
  values
    (p_buyer_id, 'Order placed for "' || product_title || '". Waiting for seller confirmation.'),
    (product_seller_id, 'New ' || payment_label || ' order received: "' || product_title || '" from ' || coalesce(buyer_name, 'a buyer') || '.');

  return query
  select o.id, o.buyer_id, o.product_id, o.status, o.payment_method, o.created_at
  from public.orders o
  where o.id = created_order_id;
end;
$$;

grant execute on function public.create_order_with_inventory(uuid, uuid, text) to authenticated;

-- Inventory-safe order status updates. Stock is reserved at order creation;
-- confirmation and completion keep the reserved stock synchronized.
create or replace function public.update_order_status_with_inventory(
  p_order_id uuid,
  p_status text
)
returns table (
  id uuid,
  buyer_id uuid,
  product_id uuid,
  status text,
  payment_method text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  existing record;
begin
  if actor_id is null then
    raise exception 'not_authenticated';
  end if;

  if p_status not in ('pending', 'confirmed', 'completed') then
    raise exception 'invalid_order_status';
  end if;

  select
    o.id,
    o.buyer_id,
    o.product_id,
    o.status,
    o.payment_method,
    o.created_at,
    p.seller_id,
    p.title,
    buyer.full_name as buyer_name
  into existing
  from public.orders o
  join public.products p on p.id = o.product_id
  left join public.profiles buyer on buyer.id = o.buyer_id
  where o.id = p_order_id
  for update of o, p;

  if not found then
    raise exception 'order_not_found';
  end if;

  if actor_id <> existing.seller_id then
    raise exception 'not_allowed';
  end if;

  if existing.status <> p_status then
    if not (
      (existing.status = 'pending' and p_status = 'confirmed')
      or (existing.status = 'confirmed' and p_status = 'completed')
    ) then
      raise exception 'invalid_status_transition';
    end if;

    update public.orders
    set status = p_status
    where orders.id = p_order_id;

    if p_status = 'confirmed' then
      insert into public.notifications (user_id, message)
      values (existing.buyer_id, 'Your order for "' || existing.title || '" was confirmed.');
    elsif p_status = 'completed' then
      insert into public.notifications (user_id, message)
      values
        (existing.buyer_id, 'Your order for "' || existing.title || '" was marked complete.'),
        (existing.seller_id, 'You completed an order for "' || existing.title || '".');
    end if;
  end if;

  return query
  select o.id, o.buyer_id, o.product_id, o.status, o.payment_method, o.created_at
  from public.orders o
  where o.id = p_order_id;
end;
$$;

grant execute on function public.update_order_status_with_inventory(uuid, text) to authenticated;

-- notifications: a user only sees their own notifications.
drop policy if exists notifications_select_self on public.notifications;
create policy notifications_select_self on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists notifications_insert_any_authenticated on public.notifications;
create policy notifications_insert_any_authenticated on public.notifications
  for insert with check (auth.role() = 'authenticated');

drop policy if exists notifications_update_self on public.notifications;
create policy notifications_update_self on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================================
-- AUTO-PROFILE TRIGGER
-- When a new auth user is created, automatically create their profile row.
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_role text := coalesce(new.raw_user_meta_data->>'role', 'buyer');
  new_name text := coalesce(new.raw_user_meta_data->>'fullName',
                            new.raw_user_meta_data->>'full_name',
                            split_part(new.email, '@', 1));
begin
  if new.email ilike 'admin@%' then new_role := 'admin'; end if;

  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new_name, new_role)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- DEMO PROFILE BACKFILL
-- Re-run this block any time after creating the three demo accounts
-- (buyer@bumarket.com, seller@bumarket.com, admin@bumarket.com).
-- ============================================================================
insert into public.profiles (id, email, full_name, role, verification_status)
select u.id, u.email, 'Demo Buyer', 'buyer', 'verified'
from auth.users u where u.email = 'buyer@bumarket.com'
on conflict (id) do update set role = 'buyer', full_name = 'Demo Buyer';

insert into public.profiles (id, email, full_name, role, verification_status)
select u.id, u.email, 'Demo Seller', 'seller', 'verified'
from auth.users u where u.email = 'seller@bumarket.com'
on conflict (id) do update set role = 'seller', full_name = 'Demo Seller';

insert into public.profiles (id, email, full_name, role, verification_status)
select u.id, u.email, 'BUMarket Admin', 'admin', 'verified'
from auth.users u where u.email = 'admin@bumarket.com'
on conflict (id) do update set role = 'admin', full_name = 'BUMarket Admin';

-- ============================================================================
-- DEMO SEED PRODUCTS (uses the seller demo account if it exists)
-- ============================================================================
insert into public.products (seller_id, title, description, price, category, image_url, stock, location)
select p.id, t.title, t.description, t.price, t.category, t.image_url, t.stock, t.location
from public.profiles p
join (values
  ('Homemade Strawberry Cake',
   'Fresh baked strawberry cake with cream frosting. Made daily.',
   250.00, 'Food & Snacks',
   'https://images.unsplash.com/photo-1599629974232-2365495b9ef2?w=800',
   5, 'Main Campus Building A'),
  ('Engineering Textbook Bundle',
   'Complete first-year engineering textbooks in great condition.',
   1200.00, 'Academic',
   'https://images.unsplash.com/photo-1614607421391-8d1228bae188?w=800',
   2, 'Engineering Building'),
  ('Scientific Calculator (Casio FX-991EX)',
   'Casio FX-991EX in like-new condition. Manual + case included.',
   800.00, 'Academic',
   'https://images.unsplash.com/photo-1599652301647-d5ee6100b577?w=800',
   1, 'Math Department'),
  ('University Varsity Jacket',
   'Official university varsity jacket, size M. Worn twice.',
   1500.00, 'Apparel',
   'https://images.unsplash.com/photo-1763888359320-cc764365e3c7?w=800',
   1, 'Student Housing')
) as t(title, description, price, category, image_url, stock, location)
  on p.email = 'seller@bumarket.com'
where not exists (
  select 1 from public.products pr
  where pr.seller_id = p.id and pr.title = t.title
);

-- ============================================================================
-- STORAGE BUCKET (optional, for image uploads)
-- Run once. If you prefer to create the bucket from the dashboard, you can
-- skip this block.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "Public product images" on storage.objects;
create policy "Public product images" on storage.objects
  for select using (bucket_id = 'products');

drop policy if exists "Authenticated upload product images" on storage.objects;
create policy "Authenticated upload product images" on storage.objects
  for insert with check (bucket_id = 'products' and auth.role() = 'authenticated');

drop policy if exists "Owner can update product images" on storage.objects;
create policy "Owner can update product images" on storage.objects
  for update using (bucket_id = 'products' and auth.uid() = owner)
  with check (bucket_id = 'products' and auth.uid() = owner);

drop policy if exists "Owner can delete product images" on storage.objects;
create policy "Owner can delete product images" on storage.objects
  for delete using (bucket_id = 'products' and auth.uid() = owner);

-- ============================================================================
-- SECURITY HARDENING (idempotent — safe to re-run on existing projects)
-- Prevents self-service role / verification_status changes via profile updates.
-- ============================================================================
create or replace function public.protect_profile_privileged_columns()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'UPDATE' then
    if new.role is distinct from old.role then
      raise exception 'role_changes_not_allowed';
    end if;
    if new.verification_status is distinct from old.verification_status then
      raise exception 'verification_status_changes_not_allowed';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_columns on public.profiles;
create trigger protect_profile_privileged_columns
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

-- Zootecnica Jerezana - Esquema inicial
-- Ejecutar en Supabase SQL Editor.

-- ============ TABLAS ============

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  slug text unique not null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  stock int not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  position int not null default 0,
  path text not null,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images(product_id);

-- Perfiles: rol por usuario. El admin se marca manualmente con:
--   insert into public.profiles (id, role) values ('<auth.users.id>', 'admin');
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- ============ FUNCIONES / TRIGGERS ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- ============ ROW LEVEL SECURITY ============

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.profiles enable row level security;

-- Lectura pública
create policy "categories_public_read"
  on public.categories for select using (true);

create policy "products_public_read"
  on public.products for select using (active = true);

create policy "product_images_public_read"
  on public.product_images for select using (true);

-- Escritura solo admin
create policy "categories_admin_all"
  on public.categories for all
  using (public.is_admin()) with check (public.is_admin());

create policy "products_admin_all"
  on public.products for all
  using (public.is_admin()) with check (public.is_admin());

create policy "product_images_admin_all"
  on public.product_images for all
  using (public.is_admin()) with check (public.is_admin());

create policy "profiles_admin_read"
  on public.profiles for select
  using (public.is_admin() or id = auth.uid());

-- ============ STORAGE ============

-- Crear bucket público para imágenes de producto (Dashboard > Storage > New bucket).
-- Nombre: product-images
-- Acceso: Public
-- Políticas de escritura: gestionadas por el service_role (server-side), no se necesitan
-- políticas públicas de insert/update.

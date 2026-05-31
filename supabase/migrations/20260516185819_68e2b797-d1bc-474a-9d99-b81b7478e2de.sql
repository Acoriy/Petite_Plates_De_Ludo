
-- =========================
-- ENUM des rôles
-- =========================
create type public.app_role as enum ('admin', 'user');

-- =========================
-- PROFILES
-- =========================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- =========================
-- USER ROLES (séparée pour sécurité)
-- =========================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Security definer function pour éviter récursion RLS
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can view own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Admins can view all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage roles"
  on public.user_roles for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================
-- CATEGORIES
-- =========================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  emoji text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select
  using (true);

create policy "Admins can manage categories"
  on public.categories for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================
-- RECIPES
-- =========================
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  ingredients jsonb not null default '[]'::jsonb,
  instructions jsonb not null default '[]'::jsonb,
  prep_time int not null default 0,
  cook_time int not null default 0,
  servings int not null default 4,
  difficulty text not null default 'Facile' check (difficulty in ('Facile','Moyen','Difficile')),
  cover_image text,
  gallery text[] default '{}',
  category_id uuid references public.categories(id) on delete set null,
  tags text[] default '{}',
  views int not null default 0,
  likes int not null default 0,
  featured boolean not null default false,
  status text not null default 'published' check (status in ('draft','published')),
  seo_title text,
  seo_description text,
  author_id uuid references auth.users(id) on delete set null,
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipes_status_published_idx on public.recipes (status, published_at desc);
create index recipes_category_idx on public.recipes (category_id);
create index recipes_featured_idx on public.recipes (featured) where featured = true;

alter table public.recipes enable row level security;

create policy "Published recipes are viewable by everyone"
  on public.recipes for select
  using (status = 'published' or public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage recipes"
  on public.recipes for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- =========================
-- Trigger updated_at
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.set_updated_at();
create trigger trg_recipes_updated before update on public.recipes
  for each row execute function public.set_updated_at();

-- =========================
-- Auto-create profile on signup
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- Increment views (RPC public)
-- =========================
create or replace function public.increment_recipe_views(_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.recipes set views = views + 1 where slug = _slug and status = 'published';
$$;

-- =========================
-- Storage bucket pour images recettes
-- =========================
insert into storage.buckets (id, name, public) values ('recipe-images', 'recipe-images', true);

create policy "Recipe images publicly viewable"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "Admins can upload recipe images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recipe-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can update recipe images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'recipe-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete recipe images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'recipe-images' and public.has_role(auth.uid(), 'admin'));

-- =========================
-- Seed catégories + recettes démo
-- =========================
insert into public.categories (name, slug, emoji, description, display_order) values
  ('Entrées', 'entrees', '🥗', 'Pour commencer le repas avec gourmandise', 1),
  ('Plats', 'plats', '🍝', 'Les stars de la table', 2),
  ('Desserts', 'desserts', '🍰', 'La touche sucrée de Ludo', 3),
  ('Apéros', 'aperos', '🥂', 'À grignoter entre amis', 4),
  ('Boulange', 'boulange', '🥖', 'Pains, brioches et viennoiseries maison', 5);

insert into public.recipes (slug, title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, cover_image, category_id, tags, featured, status, seo_title, seo_description)
select
  'tarte-tatin-aux-pommes',
  'Tarte Tatin aux pommes caramélisées',
  'Le classique français renversé, avec des pommes fondantes et un caramel ambré. Ludo vous donne tous ses petits secrets pour la réussir à tous les coups.',
  '[
    {"name":"Pommes Reinette","quantity":"6","unit":"pièces"},
    {"name":"Sucre","quantity":"150","unit":"g"},
    {"name":"Beurre demi-sel","quantity":"80","unit":"g"},
    {"name":"Pâte feuilletée","quantity":"1","unit":"rouleau"},
    {"name":"Vanille","quantity":"1","unit":"gousse"}
  ]'::jsonb,
  '[
    {"step":1,"text":"Préchauffez le four à 180°C. Épluchez et coupez les pommes en quartiers."},
    {"step":2,"text":"Préparez un caramel à sec avec le sucre dans le moule, ajoutez le beurre."},
    {"step":3,"text":"Disposez les pommes serrées sur le caramel, ajoutez la vanille."},
    {"step":4,"text":"Recouvrez de pâte feuilletée en rentrant les bords."},
    {"step":5,"text":"Enfournez 35 minutes. Démoulez tiède. Dégustez avec une boule de glace vanille."}
  ]'::jsonb,
  20, 35, 6, 'Facile',
  'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=1200',
  c.id,
  ARRAY['dessert','classique','pommes','automne'],
  true,
  'published',
  'Tarte Tatin aux pommes — Recette facile de Ludo',
  'La vraie recette de la tarte Tatin maison, avec un caramel ambré et des pommes fondantes. Par Les Petits Plats de Ludo.'
from public.categories c where c.slug = 'desserts';

insert into public.recipes (slug, title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, cover_image, category_id, tags, featured, status, seo_title, seo_description)
select
  'risotto-aux-champignons',
  'Risotto crémeux aux champignons de Paris',
  'Un risotto onctueux comme on aime, avec des champignons poêlés et beaucoup de parmesan. Réconfortant à souhait.',
  '[
    {"name":"Riz arborio","quantity":"300","unit":"g"},
    {"name":"Champignons de Paris","quantity":"500","unit":"g"},
    {"name":"Bouillon de volaille","quantity":"1","unit":"L"},
    {"name":"Vin blanc sec","quantity":"15","unit":"cl"},
    {"name":"Parmesan râpé","quantity":"100","unit":"g"},
    {"name":"Échalote","quantity":"2","unit":"pièces"},
    {"name":"Beurre","quantity":"50","unit":"g"}
  ]'::jsonb,
  '[
    {"step":1,"text":"Faites chauffer le bouillon. Émincez l''échalote et les champignons."},
    {"step":2,"text":"Faites suer l''échalote au beurre, ajoutez le riz et nacrez 2 min."},
    {"step":3,"text":"Déglacez au vin blanc puis ajoutez le bouillon louche par louche en remuant."},
    {"step":4,"text":"Pendant ce temps, poêlez les champignons à feu vif."},
    {"step":5,"text":"En fin de cuisson, incorporez champignons, parmesan et beurre froid. Servez aussitôt."}
  ]'::jsonb,
  15, 25, 4, 'Moyen',
  'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=1200',
  c.id,
  ARRAY['plat','italien','réconfortant'],
  true,
  'published',
  'Risotto aux champignons crémeux — Ludo',
  'Un risotto crémeux aux champignons de Paris, onctueux et réconfortant. Recette pas à pas.'
from public.categories c where c.slug = 'plats';

insert into public.recipes (slug, title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, cover_image, category_id, tags, featured, status, seo_title, seo_description)
select
  'cookies-pepites-chocolat',
  'Cookies moelleux aux pépites de chocolat',
  'Croustillants dehors, fondants dedans. La recette ultime des cookies de Ludo, avec un secret : un peu de fleur de sel sur le dessus.',
  '[
    {"name":"Farine","quantity":"250","unit":"g"},
    {"name":"Beurre","quantity":"125","unit":"g"},
    {"name":"Sucre cassonade","quantity":"150","unit":"g"},
    {"name":"Œuf","quantity":"1","unit":"pièce"},
    {"name":"Pépites de chocolat","quantity":"200","unit":"g"},
    {"name":"Levure chimique","quantity":"1/2","unit":"sachet"},
    {"name":"Fleur de sel","quantity":"1","unit":"pincée"}
  ]'::jsonb,
  '[
    {"step":1,"text":"Préchauffez le four à 180°C. Faites fondre le beurre."},
    {"step":2,"text":"Mélangez le beurre avec le sucre, ajoutez l''œuf."},
    {"step":3,"text":"Incorporez la farine et la levure, puis les pépites."},
    {"step":4,"text":"Formez des boules sur une plaque, espacez-les bien."},
    {"step":5,"text":"Enfournez 10-12 minutes. Saupoudrez de fleur de sel à la sortie."}
  ]'::jsonb,
  10, 12, 12, 'Facile',
  'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=1200',
  c.id,
  ARRAY['dessert','goûter','chocolat'],
  true,
  'published',
  'Cookies pépites de chocolat — Recette de Ludo',
  'Les cookies parfaits : croustillants, moelleux, avec beaucoup de chocolat et une pointe de fleur de sel.'
from public.categories c where c.slug = 'desserts';

insert into public.recipes (slug, title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, cover_image, category_id, tags, status)
select
  'soupe-potimarron-coco',
  'Velouté de potimarron au lait de coco',
  'Doux, parfumé et réconfortant. Une touche de gingembre frais pour réveiller le tout.',
  '[
    {"name":"Potimarron","quantity":"1","unit":"pièce"},
    {"name":"Lait de coco","quantity":"40","unit":"cl"},
    {"name":"Oignon","quantity":"1","unit":"pièce"},
    {"name":"Gingembre","quantity":"2","unit":"cm"},
    {"name":"Bouillon","quantity":"50","unit":"cl"}
  ]'::jsonb,
  '[
    {"step":1,"text":"Coupez le potimarron en cubes (gardez la peau)."},
    {"step":2,"text":"Faites revenir l''oignon et le gingembre, ajoutez le potimarron."},
    {"step":3,"text":"Couvrez de bouillon, cuisez 25 min."},
    {"step":4,"text":"Mixez avec le lait de coco. Salez, poivrez. Servez avec des graines."}
  ]'::jsonb,
  10, 25, 4, 'Facile',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200',
  c.id,
  ARRAY['entrée','automne','végétarien'],
  'published'
from public.categories c where c.slug = 'entrees';

insert into public.recipes (slug, title, description, ingredients, instructions, prep_time, cook_time, servings, difficulty, cover_image, category_id, tags, status)
select
  'brioche-tressee',
  'Brioche tressée moelleuse',
  'Une brioche aérienne, dorée et beurrée comme on les aime. Parfaite pour le petit-déjeuner du dimanche.',
  '[
    {"name":"Farine","quantity":"500","unit":"g"},
    {"name":"Beurre mou","quantity":"200","unit":"g"},
    {"name":"Sucre","quantity":"80","unit":"g"},
    {"name":"Œufs","quantity":"4","unit":"pièces"},
    {"name":"Levure boulangère","quantity":"20","unit":"g"},
    {"name":"Lait tiède","quantity":"10","unit":"cl"},
    {"name":"Sel","quantity":"1","unit":"c.à.c"}
  ]'::jsonb,
  '[
    {"step":1,"text":"Délayez la levure dans le lait tiède."},
    {"step":2,"text":"Pétrissez farine, sucre, sel, œufs et levure 10 min."},
    {"step":3,"text":"Incorporez le beurre petit à petit. Laissez pousser 1h30."},
    {"step":4,"text":"Dégazez, divisez en 3, tressez. Laissez pousser encore 1h."},
    {"step":5,"text":"Dorez à l''œuf et cuisez 25 min à 180°C."}
  ]'::jsonb,
  30, 25, 8, 'Moyen',
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200',
  c.id,
  ARRAY['boulange','petit-déjeuner'],
  'published'
from public.categories c where c.slug = 'boulange';

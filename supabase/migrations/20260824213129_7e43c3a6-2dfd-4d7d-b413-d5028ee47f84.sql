create type public.app_role as enum ('admin', 'user');
create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

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

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  image_url text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;

create table public.time_slots (
  id uuid primary key default gen_random_uuid(),
  slot_date date not null,
  start_time time not null,
  created_at timestamptz not null default now(),
  unique (slot_date, start_time)
);
grant select on public.time_slots to anon;
grant select, insert, delete on public.time_slots to authenticated;
grant all on public.time_slots to service_role;
alter table public.time_slots enable row level security;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  booking_date date not null,
  start_time time not null,
  price numeric(10,2) not null,
  duration_minutes integer not null,
  status public.booking_status not null default 'pending',
  comment text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;

create unique index bookings_active_slot_unique
on public.bookings (booking_date, start_time)
where status in ('pending', 'confirmed');

create or replace function public.validate_booking_not_past()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.booking_date < current_date then
    raise exception 'Cannot book a date in the past';
  end if;
  return new;
end
$$;

create trigger bookings_validate_not_past
before insert or update on public.bookings
for each row execute function public.validate_booking_not_past();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  insert into public.user_roles (user_id, role)
  values (new.id, 'user');
  return new;
end
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create policy "Users can view own profile" on public.profiles
for select to authenticated
using (auth.uid() = id or public.has_role(auth.uid(), 'admin'));

create policy "Users can insert own profile" on public.profiles
for insert to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
for update to authenticated
using (auth.uid() = id or public.has_role(auth.uid(), 'admin'))
with check (auth.uid() = id or public.has_role(auth.uid(), 'admin'));

create policy "Users can read own roles" on public.user_roles
for select to authenticated
using (auth.uid() = user_id);

create policy "Anyone can view active services" on public.services
for select to anon, authenticated
using (active or public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert services" on public.services
for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update services" on public.services
for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete services" on public.services
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Anyone can view time slots" on public.time_slots
for select to anon, authenticated
using (true);

create policy "Admins can insert time slots" on public.time_slots
for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete time slots" on public.time_slots
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Users can view own bookings" on public.bookings
for select to authenticated
using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));

create policy "Users can create own bookings" on public.bookings
for insert to authenticated
with check (auth.uid() = user_id and status = 'pending');

create policy "Users can cancel own bookings" on public.bookings
for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id and status = 'cancelled');

create policy "Admins can update all bookings" on public.bookings
for update to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

insert into public.services (name, description, price, duration_minutes, image_url) values
('Classic Manicure', 'Essential nail shaping, cuticle care, and a flawless lacquer finish.', 45.00, 45, '/images/services/classic-manicure.jpg'),
('Gel Polish', 'High-shine durability that lasts up to three weeks without chipping.', 65.00, 60, '/images/services/gel-polish.jpg'),
('Nail Extensions', 'Sculpted length and strength with gel or acrylic, tailored to you.', 90.00, 90, '/images/services/nail-extensions.jpg'),
('Nail Enhancements', 'Strengthen and perfect your natural nails with builder gel overlays.', 75.00, 75, '/images/services/nail-enhancements.jpg'),
('French Manicure', 'A timeless classic redefined with contemporary precision.', 65.00, 60, '/images/services/french-manicure.jpg'),
('Nail Art', 'Hand-painted detail, subtle line work, and minimalist accents.', 120.00, 75, '/images/services/nail-art.jpg'),
('Gel Polish Removal', 'Gentle, damage-free removal with nourishing aftercare.', 25.00, 30, '/images/services/gel-removal.jpg');

insert into public.time_slots (slot_date, start_time)
select d::date, t.start_time
from generate_series(current_date, current_date + 45, interval '1 day') as d
cross join (
  values
    (time '09:00'), (time '10:00'), (time '11:00'), (time '12:00'),
    (time '13:00'), (time '14:00'), (time '15:00'), (time '16:00'), (time '17:00')
) as t(start_time)
on conflict do nothing;
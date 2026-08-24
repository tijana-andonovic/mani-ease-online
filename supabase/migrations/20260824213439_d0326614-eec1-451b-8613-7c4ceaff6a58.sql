create or replace view public.booked_slots as
select booking_date, start_time
from public.bookings
where status in ('pending', 'confirmed');

grant select on public.booked_slots to anon, authenticated;

create policy "Admins can read all roles" on public.user_roles
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));
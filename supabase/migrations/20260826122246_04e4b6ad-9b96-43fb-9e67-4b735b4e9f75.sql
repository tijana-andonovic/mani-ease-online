
DROP VIEW IF EXISTS public.booked_slots;

ALTER TABLE public.time_slots ADD COLUMN IF NOT EXISTS is_booked boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.sync_slot_booked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  if tg_op in ('UPDATE','DELETE') then
    update public.time_slots ts
       set is_booked = exists (
         select 1 from public.bookings b
         where b.booking_date = ts.slot_date
           and b.start_time = ts.start_time
           and b.status <> 'cancelled'
       )
     where ts.slot_date = old.booking_date and ts.start_time = old.start_time;
  end if;

  if tg_op in ('INSERT','UPDATE') then
    update public.time_slots ts
       set is_booked = exists (
         select 1 from public.bookings b
         where b.booking_date = ts.slot_date
           and b.start_time = ts.start_time
           and b.status <> 'cancelled'
       )
     where ts.slot_date = new.booking_date and ts.start_time = new.start_time;
    return new;
  end if;

  return old;
end
$$;

REVOKE ALL ON FUNCTION public.sync_slot_booked() FROM public, anon, authenticated;

DROP TRIGGER IF EXISTS bookings_sync_slot_booked ON public.bookings;
CREATE TRIGGER bookings_sync_slot_booked
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.sync_slot_booked();

UPDATE public.time_slots ts
   set is_booked = exists (
     select 1 from public.bookings b
     where b.booking_date = ts.slot_date
       and b.start_time = ts.start_time
       and b.status <> 'cancelled'
   );

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.validate_booking_not_past() FROM authenticated, anon, public;

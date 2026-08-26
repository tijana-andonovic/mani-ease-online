
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM public, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM public;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- profiles
DROP POLICY "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING ((auth.uid() = id) OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING ((auth.uid() = id) OR private.has_role(auth.uid(), 'admin'))
  WITH CHECK ((auth.uid() = id) OR private.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY "Admins can read all roles" ON public.user_roles;
CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- services
DROP POLICY "Users can view services" ON public.services;
CREATE POLICY "Users can view services" ON public.services FOR SELECT TO authenticated
  USING (active OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can insert services" ON public.services;
CREATE POLICY "Admins can insert services" ON public.services FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can update services" ON public.services;
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can delete services" ON public.services;
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- time_slots
DROP POLICY "Admins can insert time slots" ON public.time_slots;
CREATE POLICY "Admins can insert time slots" ON public.time_slots FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can delete time slots" ON public.time_slots;
CREATE POLICY "Admins can delete time slots" ON public.time_slots FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- bookings
DROP POLICY "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT TO authenticated
  USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can update all bookings" ON public.bookings;
CREATE POLICY "Admins can update all bookings" ON public.bookings FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

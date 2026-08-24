revoke execute on function public.handle_new_user() from anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from anon;

drop policy "Anyone can view active services" on public.services;

create policy "Visitors can view active services" on public.services
for select to anon
using (active);

create policy "Users can view services" on public.services
for select to authenticated
using (active or public.has_role(auth.uid(), 'admin'));
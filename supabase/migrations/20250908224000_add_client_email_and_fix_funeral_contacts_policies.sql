-- Add optional email to clients
alter table public.clients
  add column if not exists email text;

-- Ensure RLS allows inserts/updates by owner for funeral_contacts
drop policy if exists "Only owner can access funeral contacts" on public.funeral_contacts;

create policy "Owner access funeral contacts"
  on public.funeral_contacts
  for all
  using (auth.uid() = entrepreneur_id)
  with check (auth.uid() = entrepreneur_id);



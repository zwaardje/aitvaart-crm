-- FUNERAL CONTACTS (many contacts per funeral)
create table if not exists public.funeral_contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references public.profiles(id) on delete cascade,
  funeral_id uuid not null references public.funerals(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  relation text,
  is_primary boolean default false,
  notes text,
  unique(funeral_id, client_id)
);

alter table public.funeral_contacts enable row level security;

create policy "Only owner can access funeral contacts"
  on public.funeral_contacts for all using (auth.uid() = entrepreneur_id);

-- Trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_funeral_contacts_updated_at on public.funeral_contacts;
create trigger set_funeral_contacts_updated_at
before update on public.funeral_contacts
for each row execute procedure public.set_updated_at();



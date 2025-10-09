-- Make funeral_contacts more flexible
-- Allow contacts without full client records

-- Drop the existing NOT NULL constraint on client_id
alter table public.funeral_contacts 
  alter column client_id drop not null;

-- Add direct contact fields for when client_id is null
alter table public.funeral_contacts 
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone_number text,
  add column if not exists email text;

-- Add a check constraint: either client_id OR (first_name AND last_name) must be provided
alter table public.funeral_contacts
  add constraint funeral_contacts_client_or_name_required
  check (
    client_id is not null 
    or 
    (first_name is not null and last_name is not null)
  );

-- Update the unique constraint to be more flexible
-- Drop old constraint
alter table public.funeral_contacts
  drop constraint if exists funeral_contacts_funeral_id_client_id_key;

-- Add new constraint that prevents duplicate contacts based on name when client_id is null
create unique index funeral_contacts_unique_client 
  on public.funeral_contacts(funeral_id, client_id) 
  where client_id is not null;

create unique index funeral_contacts_unique_name
  on public.funeral_contacts(funeral_id, first_name, last_name)
  where client_id is null;


-- Create pricelist_items table (organization-wide)
create table if not exists public.pricelist_items (
  id uuid primary key default gen_random_uuid(),
  entrepreneur_id uuid not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  subtitle text,
  description text,
  default_quantity integer not null default 1,
  price_incl numeric not null,
  vat_rate numeric,
  unit text,
  supplier_id uuid references public.suppliers(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz
);

alter table public.pricelist_items enable row level security;

-- Policies: members of the same organization can see and manage their items
create policy if not exists "pricelist_items_select"
  on public.pricelist_items
  for select
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = pricelist_items.organization_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy if not exists "pricelist_items_insert"
  on public.pricelist_items
  for insert
  with check (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = pricelist_items.organization_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy if not exists "pricelist_items_update"
  on public.pricelist_items
  for update
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = pricelist_items.organization_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = pricelist_items.organization_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );

create policy if not exists "pricelist_items_delete"
  on public.pricelist_items
  for delete
  using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = pricelist_items.organization_id
        and m.user_id = auth.uid()
        and m.status = 'active'
    )
  );



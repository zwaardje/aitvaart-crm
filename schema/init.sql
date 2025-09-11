-- ============================================
-- PROFILES (funeral directors)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  full_name text,
  company_name text,
  phone_number text,
  avatar_url text
);

alter table profiles enable row level security;

create policy "Profiles are viewable by owner only"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Trigger to auto-create profile
create function public.handle_new_user()
returns trigger
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================
-- DECEASED
-- ============================================
create table public.deceased (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references profiles(id) on delete cascade,

  first_names text not null,
  preferred_name text,
  last_name text not null,
  date_of_birth date,
  place_of_birth text,
  gender text check (gender in ('male', 'female', 'other')),
  social_security_number text unique,
  date_of_death timestamp with time zone,
  street text,
  house_number text,
  house_number_addition text,
  postal_code text,
  city text,
  coffin_registration_number text
);

alter table deceased enable row level security;

create policy "Only owner can access deceased records"
  on deceased for all using (auth.uid() = entrepreneur_id);


-- ============================================
-- CLIENTS
-- ============================================
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references profiles(id) on delete cascade,

  preferred_name text not null,
  last_name text not null,
  gender text check (gender in ('male', 'female', 'other')),
  date_of_birth date,
  place_of_birth text,
  street text,
  house_number text,
  house_number_addition text,
  postal_code text,
  city text,
  phone_number text
);

alter table clients enable row level security;

create policy "Only owner can access client records"
  on clients for all using (auth.uid() = entrepreneur_id);

-- ============================================
-- COMPANY BRANDING (house style per company)
-- ============================================
create table public.company_branding (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references profiles(id) on delete cascade,

  logo_url text,                     -- link naar logo (Supabase Storage)
  primary_color text,                -- hex code (bv. #004080)
  secondary_color text,
  accent_color text,
  header_font text,                  -- bv. "Roboto", "Times New Roman"
  body_font text,
  footer_text text,                  -- standaard footer in brieven
  letterhead_template_url text       -- optioneel: complete template in storage
);

alter table company_branding enable row level security;

create policy "Only owner can access company branding"
  on company_branding for all using (auth.uid() = entrepreneur_id);


-- ============================================
-- SUPPLIERS (per entrepreneur)
-- ============================================
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references profiles(id) on delete cascade,

  name text not null,
  contact_person text,
  phone_number text,
  email text,
  address text,
  postal_code text,
  city text,
  type text, -- e.g. "flowers", "coffin", "venue", "catering", "printing"
  notes text
);

alter table suppliers enable row level security;

create policy "Only owner can access suppliers"
  on suppliers for all using (auth.uid() = entrepreneur_id);


-- ============================================
-- SUPPLIER PRICE LISTS (agreements per supplier)
-- ============================================
create table public.supplier_pricelists (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references profiles(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,

  product_name text not null,
  description text,
  unit text, -- e.g. "per piece", "per hour", "per day"
  base_price numeric(12,2) not null,
  discount_percent numeric(5,2) default 0,
  valid_from date default now(),
  valid_to date
);

alter table supplier_pricelists enable row level security;

create policy "Only owner can access supplier pricelists"
  on supplier_pricelists for all using (auth.uid() = entrepreneur_id);


-- ============================================
-- FUNERALS
-- ============================================
create table public.funerals (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references profiles(id) on delete cascade,

  deceased_id uuid not null references deceased(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,

  location text,
  signing_date date,
  funeral_director text
);

alter table funerals enable row level security;

create policy "Only owner can access funeral records"
  on funerals for all using (auth.uid() = entrepreneur_id);


-- ============================================
-- FUNERAL SUPPLIERS (suppliers used per funeral)
-- ============================================
create table public.funeral_suppliers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references profiles(id) on delete cascade,
  funeral_id uuid not null references funerals(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,

  product_name text not null,
  quantity numeric(12,2) default 1,
  unit_price numeric(12,2) not null,
  total_price numeric(12,2) generated always as (quantity * unit_price) stored,
  notes text
);

alter table funeral_suppliers enable row level security;

create policy "Only owner can access funeral suppliers"
  on funeral_suppliers for all using (auth.uid() = entrepreneur_id);


-- ============================================
-- DOCUMENTS (per funeral)
-- ============================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references profiles(id) on delete cascade,

  funeral_id uuid not null references funerals(id) on delete cascade,

  file_name text not null,
  file_type text,
  file_size bigint,
  storage_path text not null, -- Supabase Storage reference
  description text
);

alter table documents enable row level security;

create policy "Only owner can access documents"
  on documents for all using (auth.uid() = entrepreneur_id);


-- ============================================
-- SUPABASE STORAGE SETUP FOR DOCUMENTS
-- ============================================
insert into storage.buckets (id, name)
  values ('funeral-documents', 'funeral-documents')
  on conflict do nothing;

create policy "Documents are accessible to owner only"
  on storage.objects
  for select using (
    bucket_id = 'funeral-documents'
    and (auth.uid())::text = (storage.foldername(name))[1] -- folder structure: entrepreneur_id/document.pdf
  );

create policy "Only owner can insert documents"
  on storage.objects
  for insert with check (
    bucket_id = 'funeral-documents'
    and (auth.uid())::text = (storage.foldername(name))[1]
  );



-- ============================================
-- FUNERAL ESTIMATES (initial cost estimates)
-- ============================================
create table public.funeral_estimates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references profiles(id) on delete cascade,
  funeral_id uuid not null references funerals(id) on delete cascade,

  version int default 1,                  -- meerdere versies van een offerte
  valid_until date,                        -- tot wanneer is de schatting geldig
  notes text
);

alter table funeral_estimates enable row level security;

create policy "Only owner can access funeral estimates"
  on funeral_estimates for all using (auth.uid() = entrepreneur_id);


-- ============================================
-- FUNERAL FINAL INVOICES (definitive offer/invoice)
-- ============================================
create table public.funeral_final_invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references profiles(id) on delete cascade,
  funeral_id uuid not null references funerals(id) on delete cascade,

  invoice_number text unique not null,    -- uniek factuurnummer
  issue_date date default now(),
  due_date date,
  total_amount numeric(12,2),             -- totaal eindbedrag
  notes text
);

alter table funeral_final_invoices enable row level security;

create policy "Only owner can access funeral invoices"
  on funeral_final_invoices for all using (auth.uid() = entrepreneur_id);


-- ============================================
-- FUNERAL ESTIMATE ITEMS (detailed cost lines per estimate)
-- ============================================
create table public.funeral_estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references funeral_estimates(id) on delete cascade,
  supplier_id uuid not null references suppliers(id) on delete cascade,

  product_name text not null,
  quantity numeric(12,2) default 1,
  unit_price numeric(12,2) not null,
  total_price numeric(12,2) generated always as (quantity * unit_price) stored
);

alter table funeral_estimate_items enable row level security;

create policy "Only owner can access funeral estimate items"
  on funeral_estimate_items for all using (
    auth.uid() = (
      select entrepreneur_id 
      from funeral_estimates 
      where id = funeral_estimate_items.estimate_id
    )
  );

-- ============================================
-- FUNERAL INVOICE ITEMS (detailed cost lines per final invoice)
-- ============================================
create table public.funeral_invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references funeral_final_invoices(id) on delete cascade,
  supplier_id uuid references suppliers(id),

  product_name text not null,
  quantity numeric(12,2) default 1,
  unit_price numeric(12,2) not null,
  total_price numeric(12,2) generated always as (quantity * unit_price) stored
);

alter table funeral_invoice_items enable row level security;

create policy "Only owner can access funeral invoice items"
  on funeral_invoice_items for all using (
    auth.uid() = (
      select entrepreneur_id 
      from funeral_final_invoices 
      where id = funeral_invoice_items.invoice_id
    )
  );


-- ============================================
-- VIEWS (created after all tables)
-- ============================================

-- ============================================
-- VIEW: Funeral cost breakdown (per supplier & product)
-- ============================================
create view public.funeral_cost_breakdown as
select 
  f.id as funeral_id,
  f.entrepreneur_id,
  s.id as supplier_id,
  s.name as supplier_name,
  fs.product_name,
  fs.quantity,
  fs.unit_price,
  fs.total_price,
  fs.created_at,
  fs.updated_at
from funerals f
join funeral_suppliers fs on f.id = fs.funeral_id
join suppliers s on fs.supplier_id = s.id;

-- Enable Row Level Security on the view
alter view public.funeral_cost_breakdown set (security_barrier = true);


-- ============================================
-- VIEW: Funeral cost estimation
-- ============================================
create view public.funeral_costs as
select 
  f.id as funeral_id,
  f.entrepreneur_id,
  coalesce(sum(fs.total_price), 0) as total_cost,
  count(distinct fs.supplier_id) as supplier_count,
  min(fs.created_at) as first_supplier_added,
  max(fs.updated_at) as last_updated
from funerals f
left join funeral_suppliers fs 
  on f.id = fs.funeral_id
group by f.id, f.entrepreneur_id;

-- Enable Row Level Security on the view
alter view public.funeral_costs set (security_barrier = true);

-- ============================================
-- MULTI-USER SUPPORT: TEAMS/ORGANIZATIONS
-- ============================================

-- ============================================
-- ORGANIZATIONS (companies/teams)
-- ============================================
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  name text not null,
  description text,
  website text,
  phone_number text,
  email text,
  address text,
  postal_code text,
  city text,
  country text default 'Netherlands',
  
  -- Billing information
  billing_email text,
  billing_address text,
  billing_postal_code text,
  billing_city text,
  
  -- Subscription/plan info
  plan_type text default 'basic' check (plan_type in ('basic', 'premium', 'enterprise')),
  max_users integer default 5,
  is_active boolean default true
);

alter table organizations enable row level security;

-- ============================================
-- ORGANIZATION MEMBERS (users in organizations)
-- ============================================
create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  
  role text not null default 'member' check (role in ('owner', 'admin', 'editor', 'viewer')),
  status text not null default 'active' check (status in ('active', 'pending', 'suspended')),
  
  -- Permissions (granular control)
  can_manage_users boolean default false,
  can_manage_funerals boolean default true,
  can_manage_clients boolean default true,
  can_manage_suppliers boolean default true,
  can_view_financials boolean default false,
  can_manage_settings boolean default false,
  
  -- Invitation info
  invited_by uuid references profiles(id),
  invited_at timestamp with time zone,
  joined_at timestamp with time zone,
  
  unique(organization_id, user_id)
);

alter table organization_members enable row level security;

-- ============================================
-- FUNERAL TEAM ASSIGNMENTS (specific funerals can be assigned to team members)
-- ============================================
create table public.funeral_team_assignments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  funeral_id uuid not null references funerals(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  
  role text not null default 'assigned' check (role in ('assigned', 'primary', 'backup')),
  permissions text[] default '{"view", "edit"}'::text[] check (permissions <@ '{"view", "edit", "delete", "manage"}'::text[]),
  
  assigned_by uuid references profiles(id),
  assigned_at timestamp with time zone default now(),
  
  unique(funeral_id, user_id)
);

alter table funeral_team_assignments enable row level security;

-- ============================================
-- UPDATE EXISTING TABLES FOR MULTI-USER SUPPORT
-- ============================================

-- Add organization_id to existing tables
alter table profiles add column if not exists organization_id uuid references organizations(id);
alter table deceased add column if not exists organization_id uuid references organizations(id);
alter table clients add column if not exists organization_id uuid references organizations(id);
alter table company_branding add column if not exists organization_id uuid references organizations(id);
alter table suppliers add column if not exists organization_id uuid references organizations(id);
alter table supplier_pricelists add column if not exists organization_id uuid references organizations(id);
alter table funerals add column if not exists organization_id uuid references organizations(id);
alter table funeral_suppliers add column if not exists organization_id uuid references organizations(id);
alter table documents add column if not exists organization_id uuid references organizations(id);
alter table funeral_estimates add column if not exists organization_id uuid references organizations(id);
alter table funeral_final_invoices add column if not exists organization_id uuid references organizations(id);
alter table funeral_contacts add column if not exists organization_id uuid references organizations(id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Organizations: Users can only see organizations they're members of
create policy "Users can view organizations they belong to"
  on organizations for select using (
    id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization owners can manage their organization"
  on organizations for all using (
    id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and role = 'owner' and status = 'active'
    )
  );

-- Organization Members: Users can see members of their organizations
create policy "Users can view organization members"
  on organization_members for select using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization admins can manage members"
  on organization_members for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and role in ('owner', 'admin') and status = 'active'
    )
  );

-- Funeral Team Assignments: Users can see assignments for funerals they have access to
create policy "Users can view funeral team assignments"
  on funeral_team_assignments for select using (
    funeral_id in (
      select f.id 
      from funerals f
      join organization_members om on f.organization_id = om.organization_id
      where om.user_id = auth.uid() and om.status = 'active'
    )
  );

create policy "Users can manage funeral team assignments"
  on funeral_team_assignments for all using (
    funeral_id in (
      select f.id 
      from funerals f
      join organization_members om on f.organization_id = om.organization_id
      where om.user_id = auth.uid() and om.status = 'active' and om.role in ('owner', 'admin', 'editor')
    )
  );

-- ============================================
-- UPDATE EXISTING RLS POLICIES FOR MULTI-USER
-- ============================================

-- Drop old policies
drop policy if exists "Only owner can access deceased records" on deceased;
drop policy if exists "Only owner can access client records" on clients;
drop policy if exists "Only owner can access company branding" on company_branding;
drop policy if exists "Only owner can access suppliers" on suppliers;
drop policy if exists "Only owner can access supplier pricelists" on supplier_pricelists;
drop policy if exists "Only owner can access funeral records" on funerals;
drop policy if exists "Only owner can access funeral suppliers" on funeral_suppliers;
drop policy if exists "Only owner can access documents" on documents;
drop policy if exists "Only owner can access funeral estimates" on funeral_estimates;
drop policy if exists "Only owner can access funeral invoices" on funeral_final_invoices;
drop policy if exists "Only owner can access funeral estimate items" on funeral_estimate_items;
drop policy if exists "Only owner can access funeral invoice items" on funeral_invoice_items;
drop policy if exists "Owner access funeral contacts" on funeral_contacts;

-- Create new multi-user policies
create policy "Organization members can access deceased records"
  on deceased for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization members can access client records"
  on clients for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization members can access company branding"
  on company_branding for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization members can access suppliers"
  on suppliers for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization members can access supplier pricelists"
  on supplier_pricelists for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization members can access funeral records"
  on funerals for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization members can access funeral suppliers"
  on funeral_suppliers for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization members can access documents"
  on documents for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization members can access funeral estimates"
  on funeral_estimates for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization members can access funeral invoices"
  on funeral_final_invoices for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Organization members can access funeral estimate items"
  on funeral_estimate_items for all using (
    estimate_id in (
      select fe.id 
      from funeral_estimates fe
      join organization_members om on fe.organization_id = om.organization_id
      where om.user_id = auth.uid() and om.status = 'active'
    )
  );

create policy "Organization members can access funeral invoice items"
  on funeral_invoice_items for all using (
    invoice_id in (
      select fi.id 
      from funeral_final_invoices fi
      join organization_members om on fi.organization_id = om.organization_id
      where om.user_id = auth.uid() and om.status = 'active'
    )
  );

create policy "Organization members can access funeral contacts"
  on funeral_contacts for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user has permission for a specific action
create or replace function public.user_has_permission(
  user_uuid uuid,
  permission_name text,
  organization_uuid uuid default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  member_record organization_members%rowtype;
begin
  -- Get user's organization membership
  select * into member_record
  from organization_members
  where user_id = user_uuid 
    and status = 'active'
    and (organization_uuid is null or organization_id = organization_uuid)
  limit 1;
  
  if not found then
    return false;
  end if;
  
  -- Check specific permissions based on role and permission name
  case permission_name
    when 'manage_users' then
      return member_record.can_manage_users or member_record.role in ('owner', 'admin');
    when 'manage_funerals' then
      return member_record.can_manage_funerals or member_record.role in ('owner', 'admin', 'editor');
    when 'manage_clients' then
      return member_record.can_manage_clients or member_record.role in ('owner', 'admin', 'editor');
    when 'manage_suppliers' then
      return member_record.can_manage_suppliers or member_record.role in ('owner', 'admin', 'editor');
    when 'view_financials' then
      return member_record.can_view_financials or member_record.role in ('owner', 'admin');
    when 'manage_settings' then
      return member_record.can_manage_settings or member_record.role in ('owner', 'admin');
    else
      return false;
  end case;
end;
$$;

-- Function to get user's organization
create or replace function public.get_user_organization(user_uuid uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  org_id uuid;
begin
  select organization_id into org_id
  from organization_members
  where user_id = user_uuid and status = 'active'
  limit 1;
  
  return org_id;
end;
$$;

-- ============================================
-- TRIGGERS FOR AUTOMATIC ORGANIZATION ASSIGNMENT
-- ============================================

-- Function to automatically assign organization_id to new records
create or replace function public.assign_organization_id()
returns trigger
language plpgsql
as $$
declare
  user_org_id uuid;
begin
  -- Get user's organization
  select get_user_organization(auth.uid()) into user_org_id;
  
  -- Assign organization_id if not already set
  if new.organization_id is null and user_org_id is not null then
    new.organization_id := user_org_id;
  end if;
  
  return new;
end;
$$;

-- Create triggers for all tables that need organization_id
create trigger assign_organization_to_profiles
  before insert on profiles
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_deceased
  before insert on deceased
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_clients
  before insert on clients
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_company_branding
  before insert on company_branding
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_suppliers
  before insert on suppliers
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_supplier_pricelists
  before insert on supplier_pricelists
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_funerals
  before insert on funerals
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_funeral_suppliers
  before insert on funeral_suppliers
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_documents
  before insert on documents
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_funeral_estimates
  before insert on funeral_estimates
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_funeral_final_invoices
  before insert on funeral_final_invoices
  for each row execute procedure assign_organization_id();

create trigger assign_organization_to_funeral_contacts
  before insert on funeral_contacts
  for each row execute procedure assign_organization_id();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

create index idx_organization_members_user_id on organization_members(user_id);
create index idx_organization_members_organization_id on organization_members(organization_id);
create index idx_organization_members_status on organization_members(status);
create index idx_funeral_team_assignments_funeral_id on funeral_team_assignments(funeral_id);
create index idx_funeral_team_assignments_user_id on funeral_team_assignments(user_id);

-- ============================================
-- INITIAL DATA MIGRATION
-- ============================================

-- Create default organization for existing users
insert into organizations (id, name, description, plan_type, max_users)
select 
  gen_random_uuid(),
  coalesce(p.company_name, p.full_name, 'Default Organization'),
  'Auto-created organization for existing user',
  'basic',
  5
from profiles p
where p.organization_id is null;

-- Assign existing users to their default organization
update profiles 
set organization_id = (
  select o.id 
  from organizations o 
  where o.name = coalesce(profiles.company_name, profiles.full_name, 'Default Organization')
  limit 1
)
where organization_id is null;

-- Create organization memberships for existing users
insert into organization_members (organization_id, user_id, role, status, joined_at)
select 
  p.organization_id,
  p.id,
  'owner',
  'active',
  p.created_at
from profiles p
where p.organization_id is not null;

-- Update all existing records with organization_id
update deceased set organization_id = (
  select organization_id from profiles where id = deceased.entrepreneur_id
) where organization_id is null;

update clients set organization_id = (
  select organization_id from profiles where id = clients.entrepreneur_id
) where organization_id is null;

update company_branding set organization_id = (
  select organization_id from profiles where id = company_branding.entrepreneur_id
) where organization_id is null;

update suppliers set organization_id = (
  select organization_id from profiles where id = suppliers.entrepreneur_id
) where organization_id is null;

update supplier_pricelists set organization_id = (
  select organization_id from profiles where id = supplier_pricelists.entrepreneur_id
) where organization_id is null;

update funerals set organization_id = (
  select organization_id from profiles where id = funerals.entrepreneur_id
) where organization_id is null;

update funeral_suppliers set organization_id = (
  select organization_id from profiles where id = funeral_suppliers.entrepreneur_id
) where organization_id is null;

update documents set organization_id = (
  select organization_id from profiles where id = documents.entrepreneur_id
) where organization_id is null;

update funeral_estimates set organization_id = (
  select organization_id from profiles where id = funeral_estimates.entrepreneur_id
) where organization_id is null;

update funeral_final_invoices set organization_id = (
  select organization_id from profiles where id = funeral_final_invoices.entrepreneur_id
) where organization_id is null;

update funeral_contacts set organization_id = (
  select organization_id from profiles where id = funeral_contacts.entrepreneur_id
) where organization_id is null;

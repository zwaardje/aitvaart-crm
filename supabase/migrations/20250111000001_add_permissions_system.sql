-- ============================================
-- PERMISSIONS SYSTEM
-- ============================================

-- ============================================
-- PERMISSIONS (definieer alle beschikbare permissions)
-- ============================================
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  name text not null unique, -- e.g., "manage_users", "view_financials"
  display_name text not null, -- e.g., "Manage Users", "View Financials"
  description text,
  category text not null, -- e.g., "user_management", "financial", "funeral_management"
  is_system_permission boolean default false, -- System permissions can't be deleted
  is_active boolean default true
);

-- ============================================
-- ROLE PERMISSIONS (welke permissions heeft een rol)
-- ============================================
create table public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  
  role text not null, -- e.g., "owner", "admin", "editor", "viewer"
  permission_id uuid not null references permissions(id) on delete cascade,
  
  -- Optioneel: specifieke context waar deze permission geldt
  context text, -- e.g., "own_funerals", "all_funerals", "specific_funeral"
  
  unique(role, permission_id, context)
);

-- ============================================
-- USER PERMISSIONS (specifieke permissions per gebruiker)
-- ============================================
create table public.user_permissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  user_id uuid not null references profiles(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  
  -- Grant of deny deze permission
  granted boolean not null default true,
  
  -- Optioneel: specifieke context
  context text, -- e.g., "funeral_123", "own_funerals"
  
  -- Wie heeft deze permission toegekend
  granted_by uuid references profiles(id),
  granted_at timestamp with time zone default now(),
  
  -- Tot wanneer is deze permission geldig
  expires_at timestamp with time zone,
  
  unique(user_id, organization_id, permission_id, context)
);

-- ============================================
-- PERMISSION GROUPS (logische groepering van permissions)
-- ============================================
create table public.permission_groups (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  name text not null unique, -- e.g., "user_management", "financial_management"
  display_name text not null, -- e.g., "User Management", "Financial Management"
  description text,
  category text not null,
  is_active boolean default true
);

-- ============================================
-- PERMISSION GROUP MEMBERSHIPS
-- ============================================
create table public.permission_group_memberships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  
  group_id uuid not null references permission_groups(id) on delete cascade,
  permission_id uuid not null references permissions(id) on delete cascade,
  
  unique(group_id, permission_id)
);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Permissions: Everyone can read, only system admins can modify
alter table permissions enable row level security;
create policy "Everyone can view permissions"
  on permissions for select using (true);

-- Role permissions: Everyone can read, only system admins can modify
alter table role_permissions enable row level security;
create policy "Everyone can view role permissions"
  on role_permissions for select using (true);

-- User permissions: Users can view their own permissions, admins can manage
alter table user_permissions enable row level security;
create policy "Users can view their own permissions"
  on user_permissions for select using (user_id = auth.uid());

create policy "Organization admins can manage user permissions"
  on user_permissions for all using (
    organization_id in (
      select organization_id 
      from organization_members 
      where user_id = auth.uid() 
        and role in ('owner', 'admin') 
        and status = 'active'
    )
  );

-- Permission groups: Everyone can read
alter table permission_groups enable row level security;
create policy "Everyone can view permission groups"
  on permission_groups for select using (true);

-- Permission group memberships: Everyone can read
alter table permission_group_memberships enable row level security;
create policy "Everyone can view permission group memberships"
  on permission_group_memberships for select using (true);

-- ============================================
-- INITIAL PERMISSIONS DATA
-- ============================================

-- Insert permission groups
insert into permission_groups (name, display_name, description, category) values
('user_management', 'User Management', 'Manage users and their access', 'administration'),
('funeral_management', 'Funeral Management', 'Manage funerals and related data', 'core'),
('client_management', 'Client Management', 'Manage clients and contacts', 'core'),
('supplier_management', 'Supplier Management', 'Manage suppliers and pricing', 'core'),
('financial_management', 'Financial Management', 'View and manage financial data', 'financial'),
('system_settings', 'System Settings', 'Manage organization settings', 'administration'),
('document_management', 'Document Management', 'Manage documents and files', 'core');

-- Insert permissions
insert into permissions (name, display_name, description, category, is_system_permission) values
-- User Management
('manage_users', 'Manage Users', 'Invite, edit, and remove users', 'user_management', true),
('view_users', 'View Users', 'View user list and details', 'user_management', true),
('assign_roles', 'Assign Roles', 'Assign roles to users', 'user_management', true),
('manage_permissions', 'Manage Permissions', 'Grant and revoke specific permissions', 'user_management', true),

-- Funeral Management
('create_funerals', 'Create Funerals', 'Create new funerals', 'funeral_management', true),
('edit_funerals', 'Edit Funerals', 'Edit existing funerals', 'funeral_management', true),
('delete_funerals', 'Delete Funerals', 'Delete funerals', 'funeral_management', true),
('view_funerals', 'View Funerals', 'View funeral details', 'funeral_management', true),
('assign_funeral_team', 'Assign Funeral Team', 'Assign team members to funerals', 'funeral_management', true),

-- Client Management
('create_clients', 'Create Clients', 'Create new clients', 'client_management', true),
('edit_clients', 'Edit Clients', 'Edit existing clients', 'client_management', true),
('delete_clients', 'Delete Clients', 'Delete clients', 'client_management', true),
('view_clients', 'View Clients', 'View client details', 'client_management', true),

-- Supplier Management
('create_suppliers', 'Create Suppliers', 'Create new suppliers', 'supplier_management', true),
('edit_suppliers', 'Edit Suppliers', 'Edit existing suppliers', 'supplier_management', true),
('delete_suppliers', 'Delete Suppliers', 'Delete suppliers', 'supplier_management', true),
('view_suppliers', 'View Suppliers', 'View supplier details', 'supplier_management', true),
('manage_pricing', 'Manage Pricing', 'Manage supplier pricing and contracts', 'supplier_management', true),

-- Financial Management
('view_financials', 'View Financials', 'View financial data and reports', 'financial_management', true),
('create_invoices', 'Create Invoices', 'Create invoices and estimates', 'financial_management', true),
('edit_invoices', 'Edit Invoices', 'Edit invoices and estimates', 'financial_management', true),
('delete_invoices', 'Delete Invoices', 'Delete invoices and estimates', 'financial_management', true),
('view_costs', 'View Costs', 'View cost breakdowns and pricing', 'financial_management', true),

-- System Settings
('manage_organization', 'Manage Organization', 'Edit organization settings', 'system_settings', true),
('manage_branding', 'Manage Branding', 'Edit company branding and templates', 'system_settings', true),
('view_analytics', 'View Analytics', 'View usage analytics and reports', 'system_settings', true),

-- Document Management
('upload_documents', 'Upload Documents', 'Upload documents and files', 'document_management', true),
('view_documents', 'View Documents', 'View and download documents', 'document_management', true),
('delete_documents', 'Delete Documents', 'Delete documents and files', 'document_management', true);

-- Assign permissions to groups
insert into permission_group_memberships (group_id, permission_id)
select 
  pg.id as group_id,
  p.id as permission_id
from permission_groups pg
join permissions p on p.category = pg.name;

-- ============================================
-- ROLE PERMISSIONS (default permissions per rol)
-- ============================================

-- Owner: All permissions
insert into role_permissions (role, permission_id)
select 'owner', id from permissions where is_active = true;

-- Admin: Most permissions except system management
insert into role_permissions (role, permission_id)
select 'admin', id from permissions 
where is_active = true 
  and name not in ('manage_organization', 'manage_permissions');

-- Editor: Core functionality permissions
insert into role_permissions (role, permission_id)
select 'editor', id from permissions 
where is_active = true 
  and category in ('funeral_management', 'client_management', 'supplier_management', 'document_management')
  and name not in ('delete_funerals', 'delete_clients', 'delete_suppliers', 'delete_documents');

-- Viewer: Read-only permissions
insert into role_permissions (role, permission_id)
select 'viewer', id from permissions 
where is_active = true 
  and name like 'view_%';

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user has specific permission
create or replace function public.user_has_permission(
  user_uuid uuid,
  permission_name text,
  organization_uuid uuid default null,
  context text default null
)
returns boolean
language plpgsql
security definer
as $$
declare
  has_permission boolean := false;
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
  
  -- Check role-based permissions first
  select exists(
    select 1 
    from role_permissions rp
    join permissions p on rp.permission_id = p.id
    where rp.role = member_record.role
      and p.name = permission_name
      and p.is_active = true
      and (rp.context is null or rp.context = context)
  ) into has_permission;
  
  if has_permission then
    return true;
  end if;
  
  -- Check specific user permissions (overrides role permissions)
  select exists(
    select 1 
    from user_permissions up
    join permissions p on up.permission_id = p.id
    where up.user_id = user_uuid
      and up.organization_id = member_record.organization_id
      and p.name = permission_name
      and p.is_active = true
      and up.granted = true
      and (up.expires_at is null or up.expires_at > now())
      and (up.context is null or up.context = context)
  ) into has_permission;
  
  return has_permission;
end;
$$;

-- Function to get all user permissions
create or replace function public.get_user_permissions(
  user_uuid uuid,
  organization_uuid uuid default null
)
returns table(
  permission_name text,
  granted boolean,
  source text, -- 'role' or 'user'
  context text
)
language plpgsql
security definer
as $$
begin
  return query
  with user_role_permissions as (
    select 
      p.name as permission_name,
      true as granted,
      'role' as source,
      rp.context
    from organization_members om
    join role_permissions rp on rp.role = om.role
    join permissions p on rp.permission_id = p.id
    where om.user_id = user_uuid
      and om.status = 'active'
      and (organization_uuid is null or om.organization_id = organization_uuid)
      and p.is_active = true
  ),
  user_specific_permissions as (
    select 
      p.name as permission_name,
      up.granted,
      'user' as source,
      up.context
    from user_permissions up
    join permissions p on up.permission_id = p.id
    where up.user_id = user_uuid
      and (organization_uuid is null or up.organization_id = organization_uuid)
      and p.is_active = true
      and (up.expires_at is null or up.expires_at > now())
  )
  select * from user_specific_permissions
  union all
  select * from user_role_permissions urp
  where not exists (
    select 1 from user_specific_permissions usp 
    where usp.permission_name = urp.permission_name 
      and (usp.context = urp.context or (usp.context is null and urp.context is null))
  );
end;
$$;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

create index idx_permissions_name on permissions(name);
create index idx_permissions_category on permissions(category);
create index idx_role_permissions_role on role_permissions(role);
create index idx_user_permissions_user_id on user_permissions(user_id);
create index idx_user_permissions_organization_id on user_permissions(organization_id);
create index idx_user_permissions_permission_id on user_permissions(permission_id);
create index idx_permission_groups_name on permission_groups(name);
create index idx_permission_group_memberships_group_id on permission_group_memberships(group_id);

-- ============================================
-- UPDATE EXISTING ORGANIZATION_MEMBERS TABLE
-- ============================================

-- Remove the old permission columns from organization_members
-- (We'll keep them for now for backward compatibility, but they'll be deprecated)
alter table organization_members 
  add column if not exists legacy_permissions jsonb default '{}';

-- Migrate existing permissions to the new system
update organization_members 
set legacy_permissions = jsonb_build_object(
  'can_manage_users', can_manage_users,
  'can_manage_funerals', can_manage_funerals,
  'can_manage_clients', can_manage_clients,
  'can_manage_suppliers', can_manage_suppliers,
  'can_view_financials', can_view_financials,
  'can_manage_settings', can_manage_settings
);

-- Add comments to indicate deprecation
comment on column organization_members.can_manage_users is 'DEPRECATED: Use user_permissions table instead';
comment on column organization_members.can_manage_funerals is 'DEPRECATED: Use user_permissions table instead';
comment on column organization_members.can_manage_clients is 'DEPRECATED: Use user_permissions table instead';
comment on column organization_members.can_manage_suppliers is 'DEPRECATED: Use user_permissions table instead';
comment on column organization_members.can_view_financials is 'DEPRECATED: Use user_permissions table instead';
comment on column organization_members.can_manage_settings is 'DEPRECATED: Use user_permissions table instead';

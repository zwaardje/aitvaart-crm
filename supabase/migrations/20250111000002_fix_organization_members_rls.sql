-- Fix infinite recursion in organization_members RLS policies
-- ============================================

-- Drop all existing policies that might conflict
drop policy if exists "Users can view organization members" on organization_members;
drop policy if exists "Organization admins can manage members" on organization_members;
drop policy if exists "Only owner can access funeral notes" on funeral_notes;
drop policy if exists "Only owner can access funeral scenarios" on funeral_scenarios;
drop policy if exists "Only owner can access funeral costs" on funeral_costs;
drop policy if exists "Only owner can access intake records" on intake;
drop policy if exists "Only owner can access deceased records" on deceased;
drop policy if exists "Only owner can access funeral records" on funerals;
drop policy if exists "Only owner can access client records" on clients;
drop policy if exists "Only owner can access supplier records" on suppliers;
drop policy if exists "Only owner can access supplier pricelist records" on supplier_pricelists;
drop policy if exists "Only owner can access funeral supplier records" on funeral_suppliers;
drop policy if exists "Only owner can access document records" on documents;
drop policy if exists "Only owner can access funeral estimate records" on funeral_estimates;
drop policy if exists "Only owner can access funeral invoice records" on funeral_final_invoices;
drop policy if exists "Only owner can access funeral estimate item records" on funeral_estimate_items;
drop policy if exists "Only owner can access funeral invoice item records" on funeral_invoice_items;
drop policy if exists "Only owner can access funeral contact records" on funeral_contacts;
drop policy if exists "Only owner can access company branding records" on company_branding;

-- Create a function to check if user is member of organization
-- This avoids the infinite recursion by using a different approach
create or replace function is_organization_member(org_id uuid, user_uuid uuid default auth.uid())
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1 
    from organization_members 
    where organization_id = org_id 
      and user_id = user_uuid 
      and status = 'active'
  );
$$;

-- Create a function to check if user is admin/owner of organization
create or replace function is_organization_admin(org_id uuid, user_uuid uuid default auth.uid())
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1 
    from organization_members 
    where organization_id = org_id 
      and user_id = user_uuid 
      and role in ('owner', 'admin')
      and status = 'active'
  );
$$;

-- Create new policies that use these functions instead of subqueries
create policy "Users can view organization members"
  on organization_members for select using (
    is_organization_member(organization_id)
  );

create policy "Organization admins can manage members"
  on organization_members for all using (
    is_organization_admin(organization_id)
  );

-- Also fix the other policies that reference organization_members
-- Update organization policies to use the new functions
drop policy if exists "Users can view organizations they belong to" on organizations;
drop policy if exists "Organization owners can manage their organization" on organizations;

create policy "Users can view organizations they belong to"
  on organizations for select using (
    is_organization_member(id)
  );

create policy "Organization owners can manage their organization"
  on organizations for all using (
    is_organization_admin(id)
  );

-- Update other policies that reference organization_members
-- We'll create a more efficient approach using a materialized view or function
-- For now, let's create a simple policy that doesn't cause recursion

-- Update funeral team assignment policies
drop policy if exists "Users can view funeral team assignments" on funeral_team_assignments;
drop policy if exists "Users can manage funeral team assignments" on funeral_team_assignments;

create policy "Users can view funeral team assignments"
  on funeral_team_assignments for select using (
    funeral_id in (
      select f.id 
      from funerals f
      where is_organization_member(f.organization_id)
    )
  );

create policy "Users can manage funeral team assignments"
  on funeral_team_assignments for all using (
    funeral_id in (
      select f.id 
      from funerals f
      where is_organization_member(f.organization_id)
    )
  );

-- Update all other policies that reference organization_members
-- We'll use the new functions to avoid recursion

-- Update client policies
drop policy if exists "Organization members can access client records" on clients;
create policy "Organization members can access client records"
  on clients for all using (
    is_organization_member(organization_id)
  );

-- Update company branding policies
drop policy if exists "Organization members can access company branding" on company_branding;
create policy "Organization members can access company branding"
  on company_branding for all using (
    is_organization_member(organization_id)
  );

-- Update supplier policies
drop policy if exists "Organization members can access suppliers" on suppliers;
create policy "Organization members can access suppliers"
  on suppliers for all using (
    is_organization_member(organization_id)
  );

-- Update supplier pricelist policies
drop policy if exists "Organization members can access supplier pricelists" on supplier_pricelists;
create policy "Organization members can access supplier pricelists"
  on supplier_pricelists for all using (
    is_organization_member(organization_id)
  );

-- Update funeral policies
drop policy if exists "Organization members can access funeral records" on funerals;
create policy "Organization members can access funeral records"
  on funerals for all using (
    is_organization_member(organization_id)
  );

-- Update funeral supplier policies
drop policy if exists "Organization members can access funeral suppliers" on funeral_suppliers;
create policy "Organization members can access funeral suppliers"
  on funeral_suppliers for all using (
    is_organization_member(organization_id)
  );

-- Update document policies
drop policy if exists "Organization members can access documents" on documents;
create policy "Organization members can access documents"
  on documents for all using (
    is_organization_member(organization_id)
  );

-- Update funeral estimate policies
drop policy if exists "Organization members can access funeral estimates" on funeral_estimates;
create policy "Organization members can access funeral estimates"
  on funeral_estimates for all using (
    is_organization_member(organization_id)
  );

-- Update funeral invoice policies
drop policy if exists "Organization members can access funeral invoices" on funeral_final_invoices;
create policy "Organization members can access funeral invoices"
  on funeral_final_invoices for all using (
    is_organization_member(organization_id)
  );

-- Update funeral estimate item policies
drop policy if exists "Organization members can access funeral estimate items" on funeral_estimate_items;
create policy "Organization members can access funeral estimate items"
  on funeral_estimate_items for select using (
    estimate_id in (
      select fe.id 
      from funeral_estimates fe
      where is_organization_member(fe.organization_id)
    )
  );

-- Update funeral invoice item policies
drop policy if exists "Organization members can access funeral invoice items" on funeral_invoice_items;
create policy "Organization members can access funeral invoice items"
  on funeral_invoice_items for select using (
    invoice_id in (
      select fi.id 
      from funeral_final_invoices fi
      where is_organization_member(fi.organization_id)
    )
  );

-- Update funeral contact policies
drop policy if exists "Organization members can access funeral contacts" on funeral_contacts;
create policy "Organization members can access funeral contacts"
  on funeral_contacts for all using (
    is_organization_member(organization_id)
  );

-- Update deceased policies
drop policy if exists "Organization members can access deceased records" on deceased;
create policy "Organization members can access deceased records"
  on deceased for all using (
    is_organization_member(organization_id)
  );

-- Update funeral notes policies
drop policy if exists "Organization members can access funeral notes" on funeral_notes;
create policy "Organization members can access funeral notes"
  on funeral_notes for all using (
    funeral_id in (
      select f.id 
      from funerals f
      where is_organization_member(f.organization_id)
    )
  );

-- Update funeral scenarios policies
drop policy if exists "Organization members can access funeral scenarios" on funeral_scenarios;
create policy "Organization members can access funeral scenarios"
  on funeral_scenarios for all using (
    funeral_id in (
      select f.id 
      from funerals f
      where is_organization_member(f.organization_id)
    )
  );

-- Update funeral costs policies
drop policy if exists "Organization members can access funeral costs" on funeral_costs;
create policy "Organization members can access funeral costs"
  on funeral_costs for all using (
    funeral_id in (
      select f.id 
      from funerals f
      where is_organization_member(f.organization_id)
    )
  );

-- Update intake policies
drop policy if exists "Organization members can access intake records" on intake;
create policy "Organization members can access intake records"
  on intake for all using (
    is_organization_member(organization_id)
  );

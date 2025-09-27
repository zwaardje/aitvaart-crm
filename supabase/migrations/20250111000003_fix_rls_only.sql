-- Fix infinite recursion in organization_members RLS policies
-- ============================================

-- Drop the problematic policies first
drop policy if exists "Users can view organization members" on organization_members;
drop policy if exists "Organization admins can manage members" on organization_members;

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

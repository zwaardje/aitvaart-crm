-- Migration: Fix clients RLS policy for INSERT operations
-- This migration adds the missing WITH CHECK clause to the clients RLS policy
-- to allow INSERT operations. It also handles cases where organization_id is null
-- by checking entrepreneur_id as a fallback.

-- Drop existing policy
drop policy if exists "Organization members can access client records" on clients;

-- Create updated policy with both USING and WITH CHECK clauses
-- This allows INSERT operations (requires WITH CHECK) while maintaining
-- access control for SELECT, UPDATE, and DELETE (requires USING)
create policy "Organization members can access client records"
  on clients 
  for all 
  using (
    -- Allow access if user is member of organization (when organization_id is set)
    -- OR if user is the entrepreneur (handles null organization_id and backwards compatibility)
    (organization_id is not null and is_organization_member(organization_id))
    or (auth.uid() = entrepreneur_id)
  )
  with check (
    -- Same logic for INSERT/UPDATE operations
    (organization_id is not null and is_organization_member(organization_id))
    or (auth.uid() = entrepreneur_id)
  );

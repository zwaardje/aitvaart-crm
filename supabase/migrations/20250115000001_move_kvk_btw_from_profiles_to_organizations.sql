-- Move KVK and BTW numbers from profiles to organizations
-- This migration assumes that each profile belongs to one organization

-- First, update organizations with KVK/BTW data from their owner's profile
UPDATE public.organizations 
SET 
  kvk_number = profiles.kvk_number,
  btw_number = profiles.btw_number
FROM public.profiles
JOIN public.organization_members ON profiles.id = organization_members.user_id
WHERE organizations.id = organization_members.organization_id
  AND organization_members.role = 'owner'
  AND profiles.kvk_number IS NOT NULL;

-- Remove KVK and BTW columns from profiles table
ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS kvk_number,
  DROP COLUMN IF EXISTS btw_number;

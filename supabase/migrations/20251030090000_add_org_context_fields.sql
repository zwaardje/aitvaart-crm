-- Add simple context fields to organizations
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS wish_intake_notes text,
  ADD COLUMN IF NOT EXISTS cost_estimate_notes text,
  ADD COLUMN IF NOT EXISTS kvk_number text,
  ADD COLUMN IF NOT EXISTS btw_number text;



-- Migration: Add funeral status field
-- This migration adds a status enum and field to the funerals table for better status tracking

-- Create enum for funeral status
CREATE TYPE funeral_status AS ENUM (
  'planning',     -- Funeral is in planning phase
  'active',       -- Funeral is active/ongoing
  'completed',    -- Funeral has been completed
  'cancelled'     -- Funeral has been cancelled
);

-- Add status column to funerals table
ALTER TABLE public.funerals 
ADD COLUMN status funeral_status DEFAULT 'planning';

-- Add index for better query performance
CREATE INDEX idx_funerals_status ON public.funerals(status);

-- Update existing funerals based on current data
-- If there's a signing_date, mark as completed
UPDATE public.funerals 
SET status = 'completed' 
WHERE signing_date IS NOT NULL;

-- If there's a funeral_director but no signing_date, mark as active
UPDATE public.funerals 
SET status = 'active' 
WHERE funeral_director IS NOT NULL 
  AND signing_date IS NULL 
  AND status = 'planning';

-- Add comment for documentation
COMMENT ON COLUMN public.funerals.status IS 'Current status of the funeral: planning, active, completed, or cancelled';
COMMENT ON TYPE funeral_status IS 'Enum for funeral status tracking';

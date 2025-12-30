-- Make section and item_type nullable in funeral_scenarios table
-- This allows scenarios to be created with only title and description
ALTER TABLE funeral_scenarios 
  ALTER COLUMN section DROP NOT NULL,
  ALTER COLUMN item_type DROP NOT NULL;


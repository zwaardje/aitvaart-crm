-- Add website column to suppliers table
ALTER TABLE suppliers 
ADD COLUMN website TEXT;

-- Add comment to the column
COMMENT ON COLUMN suppliers.website IS 'Website URL of the supplier';

-- Update the full text search index to include website
DROP INDEX IF EXISTS suppliers_fts_idx;
CREATE INDEX suppliers_fts_idx ON suppliers 
USING gin(to_tsvector('dutch', 
  COALESCE(name, '') || ' ' || 
  COALESCE(contact_person, '') || ' ' || 
  COALESCE(email, '') || ' ' || 
  COALESCE(type, '') || ' ' || 
  COALESCE(notes, '') || ' ' ||
  COALESCE(website, '')
));

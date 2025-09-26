-- Add full text search capabilities to the CRM
-- This migration adds FTS columns and indexes to enable fast text searching

-- ============================================
-- FUNERAL NOTES FTS
-- ============================================
ALTER TABLE public.funeral_notes 
ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  to_tsvector('dutch', title || ' ' || COALESCE(content, ''))
) STORED;

CREATE INDEX idx_funeral_notes_fts ON public.funeral_notes USING gin(fts);

-- ============================================
-- FUNERAL SUPPLIERS (COSTS) FTS
-- ============================================
ALTER TABLE public.funeral_suppliers 
ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  to_tsvector('dutch', product_name || ' ' || COALESCE(notes, ''))
) STORED;

CREATE INDEX idx_funeral_suppliers_fts ON public.funeral_suppliers USING gin(fts);

-- ============================================
-- FUNERALS FTS
-- ============================================
ALTER TABLE public.funerals 
ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  to_tsvector('dutch', 
    COALESCE(location, '') || ' ' || 
    COALESCE(funeral_director, '')
  )
) STORED;

CREATE INDEX idx_funerals_fts ON public.funerals USING gin(fts);

-- ============================================
-- FUNERAL CONTACTS FTS
-- ============================================
ALTER TABLE public.funeral_contacts 
ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  to_tsvector('dutch', 
    COALESCE(relation, '') || ' ' || 
    COALESCE(notes, '')
  )
) STORED;

CREATE INDEX idx_funeral_contacts_fts ON public.funeral_contacts USING gin(fts);

-- ============================================
-- CLIENTS FTS
-- ============================================
ALTER TABLE public.clients 
ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  to_tsvector('dutch', 
    preferred_name || ' ' || 
    last_name || ' ' || 
    COALESCE(email, '') || ' ' || 
    COALESCE(phone_number, '') || ' ' ||
    COALESCE(street, '') || ' ' ||
    COALESCE(city, '')
  )
) STORED;

CREATE INDEX idx_clients_fts ON public.clients USING gin(fts);

-- ============================================
-- DECEASED FTS
-- ============================================
ALTER TABLE public.deceased 
ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  to_tsvector('dutch', 
    first_names || ' ' || 
    last_name || ' ' || 
    COALESCE(preferred_name, '') || ' ' ||
    COALESCE(street, '') || ' ' ||
    COALESCE(city, '')
  )
) STORED;

CREATE INDEX idx_deceased_fts ON public.deceased USING gin(fts);

-- ============================================
-- COMPREHENSIVE SEARCH FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION search_all_entities(
  search_term text,
  limit_count integer DEFAULT 50
)
RETURNS TABLE (
  entity_type text,
  entity_id uuid,
  title text,
  content text,
  created_at timestamptz,
  rank real
) AS $$
BEGIN
  RETURN QUERY
  -- Funeral notes
  SELECT 
    'note'::text as entity_type,
    fn.id as entity_id,
    fn.title as title,
    LEFT(fn.content, 200) as content,
    fn.created_at,
    ts_rank(fn.fts, to_tsquery('dutch', search_term)) as rank
  FROM public.funeral_notes fn
  WHERE fn.fts @@ to_tsquery('dutch', search_term)
    AND fn.entrepreneur_id = auth.uid()
  
  UNION ALL
  
  -- Funeral suppliers (costs)
  SELECT 
    'cost'::text as entity_type,
    fs.id as entity_id,
    fs.product_name as title,
    LEFT(COALESCE(fs.notes, ''), 200) as content,
    fs.created_at,
    ts_rank(fs.fts, to_tsquery('dutch', search_term)) as rank
  FROM public.funeral_suppliers fs
  WHERE fs.fts @@ to_tsquery('dutch', search_term)
    AND fs.entrepreneur_id = auth.uid()
  
  UNION ALL
  
  -- Funeral contacts
  SELECT 
    'contact'::text as entity_type,
    fc.id as entity_id,
    COALESCE(c.preferred_name || ' ' || c.last_name, 'Contact') as title,
    LEFT(COALESCE(fc.notes, ''), 200) as content,
    fc.created_at,
    ts_rank(fc.fts, to_tsquery('dutch', search_term)) as rank
  FROM public.funeral_contacts fc
  JOIN public.clients c ON fc.client_id = c.id
  WHERE fc.fts @@ to_tsquery('dutch', search_term)
    AND fc.entrepreneur_id = auth.uid()
  
  UNION ALL
  
  -- Funerals (via deceased name and funeral details)
  SELECT 
    'funeral'::text as entity_type,
    f.id as entity_id,
    COALESCE(d.preferred_name || ' ' || d.last_name, d.first_names || ' ' || d.last_name) as title,
    LEFT(COALESCE(f.location, ''), 200) as content,
    f.created_at,
    GREATEST(
      ts_rank(f.fts, to_tsquery('dutch', search_term)),
      ts_rank(d.fts, to_tsquery('dutch', search_term))
    ) as rank
  FROM public.funerals f
  JOIN public.deceased d ON f.deceased_id = d.id
  WHERE (f.fts @@ to_tsquery('dutch', search_term) OR d.fts @@ to_tsquery('dutch', search_term))
    AND f.entrepreneur_id = auth.uid()
  
  ORDER BY rank DESC, created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

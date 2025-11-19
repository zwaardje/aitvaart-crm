-- Add funeral_id filter to search_all_entities function
-- This allows filtering search results by a specific funeral

CREATE OR REPLACE FUNCTION search_all_entities(
  search_term text,
  limit_count integer DEFAULT 50,
  funeral_id uuid DEFAULT NULL
)
RETURNS TABLE (
  entity_type text,
  entity_id uuid,
  title text,
  content text,
  created_at timestamptz,
  rank real
) AS $$
DECLARE
  v_funeral_id uuid;
BEGIN
  v_funeral_id := funeral_id;
  
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
    AND (v_funeral_id IS NULL OR fn.funeral_id = v_funeral_id)
  
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
    AND (v_funeral_id IS NULL OR fs.funeral_id = v_funeral_id)
  
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
    AND (v_funeral_id IS NULL OR fc.funeral_id = v_funeral_id)
  
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
    AND (v_funeral_id IS NULL OR f.id = v_funeral_id)
  
  ORDER BY rank DESC, created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


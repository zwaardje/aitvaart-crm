-- Create pricelist_items table (organization-wide)
create table if not exists public.pricelist_items (
  id uuid primary key default gen_random_uuid(),
  entrepreneur_id uuid not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  subtitle text,
  description text,
  default_quantity integer not null default 1,
  price_incl numeric not null,
  vat_rate numeric,
  unit text,
  supplier_id uuid references public.suppliers(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz
);


-- Ensure RLS is enabled
ALTER TABLE public.pricelist_items ENABLE ROW LEVEL SECURITY;

--- SELECT: members of the same organization can read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p
    JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'pricelist_items_select'
      AND n.nspname = 'public'
      AND c.relname = 'pricelist_items'
  ) THEN
    CREATE POLICY pricelist_items_select
      ON public.pricelist_items
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.organization_members m
          WHERE m.organization_id = organization_id
            AND m.user_id = (SELECT auth.uid())
            AND m.status = 'active'
        )
      );
  END IF;
END
$$;


-- INSERT: members of the organization can insert items for that organization;
-- also ensure entrepreneur_id equals auth.uid() (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p
    JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'pricelist_items_insert'
      AND n.nspname = 'public'
      AND c.relname = 'pricelist_items'
  ) THEN
    CREATE POLICY pricelist_items_insert
      ON public.pricelist_items
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.organization_members m
          WHERE m.organization_id = organization_id
            AND m.user_id = (SELECT auth.uid())
            AND m.status = 'active'
        )
        AND entrepreneur_id = (SELECT auth.uid())
      );
  END IF;
END
$$;


-- UPDATE: organization members can update;
-- prevent changing organization_id by comparing new value to stored value;
-- restrict updates to organization members (USING checks existing row);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p
    JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'pricelist_items_update'
      AND n.nspname = 'public'
      AND c.relname = 'pricelist_items'
  ) THEN
    CREATE POLICY pricelist_items_update
      ON public.pricelist_items
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.organization_members m
          WHERE m.organization_id = organization_id    -- here organization_id refers to the existing/stored row
            AND m.user_id = (SELECT auth.uid())
            AND m.status = 'active'
        )
      )
      WITH CHECK (
        -- Ensure organization_id is unchanged: compare new (unqualified organization_id) to stored row via alias
        organization_id = (
          SELECT p.organization_id
          FROM public.pricelist_items p
          WHERE p.id = pricelist_items.id
        )
        -- Optionally ensure entrepreneur remains or is the current user:
        -- AND entrepreneur_id = (SELECT auth.uid())
      );
  END IF;
END
$$;


-- DELETE: organization members can delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policy p
    JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE p.polname = 'pricelist_items_delete'
      AND n.nspname = 'public'
      AND c.relname = 'pricelist_items'
  ) THEN
    CREATE POLICY pricelist_items_delete
      ON public.pricelist_items
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.organization_members m
          WHERE m.organization_id = organization_id
            AND m.user_id = (SELECT auth.uid())
            AND m.status = 'active'
        )
      );
  END IF;
END
$$;
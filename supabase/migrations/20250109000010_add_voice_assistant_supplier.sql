-- Add a default "Voice Assistant" supplier for costs added via voice
-- This supplier is used when costs are added without a specific supplier

-- First, check if we need to add organization_id to suppliers
-- (it should already exist from multi-user migration)

-- Insert default voice assistant supplier for each entrepreneur/organization
-- This will be done via a trigger or manually per organization

-- For now, we'll create a function to get or create the voice assistant supplier
create or replace function public.get_or_create_voice_assistant_supplier(
  p_entrepreneur_id uuid,
  p_organization_id uuid default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_supplier_id uuid;
begin
  -- Try to find existing voice assistant supplier for this entrepreneur
  select id into v_supplier_id
  from public.suppliers
  where entrepreneur_id = p_entrepreneur_id
    and name = 'Voice Assistant - Algemene Kosten'
  limit 1;

  -- If not found, create it
  if v_supplier_id is null then
    insert into public.suppliers (
      entrepreneur_id,
      organization_id,
      name,
      type,
      notes
    ) values (
      p_entrepreneur_id,
      p_organization_id,
      'Voice Assistant - Algemene Kosten',
      'general',
      'Automatisch aangemaakte leverancier voor kosten toegevoegd via voice assistant'
    )
    returning id into v_supplier_id;
  end if;

  return v_supplier_id;
end;
$$;


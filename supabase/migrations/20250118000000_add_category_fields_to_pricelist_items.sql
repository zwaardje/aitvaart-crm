-- Add category and subcategory fields to pricelist_items table
alter table public.pricelist_items
  add column if not exists category text,
  add column if not exists subcategory text,
  add column if not exists website_url text,
  add column if not exists ai_remark text;


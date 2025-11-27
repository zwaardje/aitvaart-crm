-- Migration: Add client fields
-- This migration adds missing fields to the clients table (first_names, marital_status)

-- Add first_names column to clients table
alter table public.clients
add column first_names text;

-- Add marital_status column to clients table with check constraint
alter table public.clients
add column marital_status text check (marital_status in ('single', 'married', 'divorced', 'widowed', 'registered_partnership'));

-- Add comments for documentation
comment on column public.clients.first_names is 'First names of the client';
comment on column public.clients.marital_status is 'Marital status of the client: single, married, divorced, widowed, or registered_partnership';


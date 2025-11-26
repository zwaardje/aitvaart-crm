-- Migration: Add deceased fields and funeral time
-- This migration adds missing fields to the deceased table (marital_status, place_of_death, insurance_company, policy_number)
-- and adds funeral_time to the funerals table

-- Add marital_status column to deceased table with check constraint
alter table public.deceased
add column marital_status text check (marital_status in ('single', 'married', 'divorced', 'widowed', 'registered_partnership'));

-- Add place_of_death column to deceased table
alter table public.deceased
add column place_of_death text;

-- Add insurance_company column to deceased table
alter table public.deceased
add column insurance_company text;

-- Add policy_number column to deceased table
alter table public.deceased
add column policy_number text;

-- Add funeral_time column to funerals table
alter table public.funerals
add column funeral_time time;

-- Add comments for documentation
comment on column public.deceased.marital_status is 'Marital status of the deceased: single, married, divorced, widowed, or registered_partnership';
comment on column public.deceased.place_of_death is 'Place where the deceased passed away';
comment on column public.deceased.insurance_company is 'Insurance company name for the deceased';
comment on column public.deceased.policy_number is 'Insurance policy number for the deceased';
comment on column public.funerals.funeral_time is 'Time of the funeral service';


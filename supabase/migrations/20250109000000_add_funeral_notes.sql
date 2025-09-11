-- FUNERAL NOTES (multiple notes per funeral)
create table if not exists public.funeral_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  entrepreneur_id uuid not null references public.profiles(id) on delete cascade,
  funeral_id uuid not null references public.funerals(id) on delete cascade,
  title text not null,
  content text not null,
  is_important boolean default false,
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.funeral_notes enable row level security;

create policy "Only owner can access funeral notes"
  on public.funeral_notes for all using (auth.uid() = entrepreneur_id);

-- Trigger to maintain updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_funeral_notes_updated_at on public.funeral_notes;
create trigger set_funeral_notes_updated_at
before update on public.funeral_notes
for each row execute procedure public.set_updated_at();

-- Index for better performance
create index if not exists idx_funeral_notes_funeral_id on public.funeral_notes(funeral_id);
create index if not exists idx_funeral_notes_created_at on public.funeral_notes(created_at desc);

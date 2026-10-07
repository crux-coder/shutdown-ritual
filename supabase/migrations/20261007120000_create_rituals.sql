-- Rituals: recurring routines a user runs at the start or end of their day.

create type public.ritual_moment as enum ('start_of_day', 'end_of_day');

-- Integrations a ritual can pull from. Not wired up yet — selecting one only
-- records the intent. Add new ones with `alter type ... add value`.
create type public.ritual_integration as enum ('gmail', 'github', 'linear', 'notion');

create table public.rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text check (char_length(description) <= 500),
  moment public.ritual_moment not null default 'end_of_day',
  -- ISO weekdays, matching Postgres `extract(isodow ...)`: 1 = Monday … 7 = Sunday.
  days smallint[] not null
    check (cardinality(days) > 0 and days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]),
  integrations public.ritual_integration[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rituals_user_id_idx on public.rituals (user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rituals_set_updated_at
  before update on public.rituals
  for each row execute function public.set_updated_at();

alter table public.rituals enable row level security;

create policy "Users can view their own rituals"
  on public.rituals for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own rituals"
  on public.rituals for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own rituals"
  on public.rituals for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own rituals"
  on public.rituals for delete
  to authenticated
  using ((select auth.uid()) = user_id);

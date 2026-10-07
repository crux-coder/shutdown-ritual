-- Profiles: one row per user, holding their name and how far they've got
-- through onboarding, so it can be resumed from any device.

-- Onboarding steps in order, with 'complete' always last. Add new steps with
-- `alter type public.onboarding_step add value '...' before 'complete'`, and
-- mirror them in src/lib/onboarding.ts.
create type public.onboarding_step as enum ('name', 'first_ritual', 'complete');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text check (char_length(first_name) <= 50),
  last_name text check (char_length(last_name) <= 50),
  -- IANA name, e.g. 'Europe/Sarajevo'. Decides which day "today" is.
  time_zone text,
  onboarding_step public.onboarding_step not null default 'name',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Every new user starts with a profile at the first onboarding step.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Existing users: names used to live in auth user metadata.
insert into public.profiles (id, first_name, last_name, onboarding_step)
select
  u.id,
  nullif(u.raw_user_meta_data ->> 'first_name', ''),
  nullif(u.raw_user_meta_data ->> 'last_name', ''),
  case
    when coalesce(u.raw_user_meta_data ->> 'first_name', '') = '' then 'name'
    when exists (select 1 from public.rituals r where r.user_id = u.id) then 'complete'
    else 'first_ritual'
  end::public.onboarding_step
from auth.users u
on conflict (id) do nothing;

-- Ritual completions: one row per ritual per day it was done.

create table public.ritual_completions (
  ritual_id uuid not null references public.rituals (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- The user's local date, so a late-evening ritual counts for that evening.
  completed_on date not null,
  completed_at timestamptz not null default now(),
  primary key (ritual_id, completed_on)
);

create index ritual_completions_user_id_completed_on_idx
  on public.ritual_completions (user_id, completed_on);

alter table public.ritual_completions enable row level security;

create policy "Users can view their own completions"
  on public.ritual_completions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can complete their own rituals"
  on public.ritual_completions for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.rituals r
      where r.id = ritual_id and r.user_id = (select auth.uid())
    )
  );

create policy "Users can undo their own completions"
  on public.ritual_completions for delete
  to authenticated
  using ((select auth.uid()) = user_id);

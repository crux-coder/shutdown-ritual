-- Reflections: a few words the user writes as they shut down, one row per
-- local date. The note for tomorrow is shown at the start of the next day.

create table public.reflections (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- The user's local date, matching profiles.day_shut_down_on.
  reflected_on date not null,
  went_well text check (char_length(went_well) <= 500),
  tomorrow text check (char_length(tomorrow) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, reflected_on)
);

create trigger reflections_set_updated_at
  before update on public.reflections
  for each row execute function public.set_updated_at();

alter table public.reflections enable row level security;

create policy "Users can view their own reflections"
  on public.reflections for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own reflections"
  on public.reflections for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own reflections"
  on public.reflections for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own reflections"
  on public.reflections for delete
  to authenticated
  using ((select auth.uid()) = user_id);

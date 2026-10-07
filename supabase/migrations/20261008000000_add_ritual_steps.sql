-- Steps: a ritual can be a short checklist, ticked off one step at a time.
-- Rituals without steps are ticked off whole, as before.

-- Keep in sync with MAX_STEPS and MAX_STEP_LENGTH in src/lib/rituals/options.ts.
create function public.ritual_steps_are_valid(steps text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select cardinality(steps) <= 10
    and coalesce(
      (select bool_and(char_length(s) between 1 and 100) from unnest(steps) s),
      true
    );
$$;

alter table public.rituals
  add column steps text[] not null default '{}'
    check (public.ritual_steps_are_valid(steps));

-- Steps ticked off, one row per step per day. Steps are identified by their
-- index in rituals.steps, so editing a ritual's steps clears its ticks (see
-- the trigger below) rather than leaving them on the wrong steps.
create table public.ritual_step_checks (
  ritual_id uuid not null references public.rituals (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- The user's local date, matching ritual_completions.completed_on.
  checked_on date not null,
  step smallint not null check (step between 0 and 9),
  checked_at timestamptz not null default now(),
  primary key (ritual_id, checked_on, step)
);

create index ritual_step_checks_user_id_checked_on_idx
  on public.ritual_step_checks (user_id, checked_on);

alter table public.ritual_step_checks enable row level security;

create policy "Users can view their own step checks"
  on public.ritual_step_checks for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can check their own steps"
  on public.ritual_step_checks for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.rituals r
      where r.id = ritual_id and r.user_id = (select auth.uid())
    )
  );

create policy "Users can uncheck their own steps"
  on public.ritual_step_checks for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create function public.clear_ritual_step_checks()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  delete from public.ritual_step_checks where ritual_id = new.id;
  return new;
end;
$$;

create trigger rituals_clear_step_checks
  after update of steps on public.rituals
  for each row
  when (old.steps is distinct from new.steps)
  execute function public.clear_ritual_step_checks();

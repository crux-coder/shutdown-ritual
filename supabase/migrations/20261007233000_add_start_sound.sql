-- The sound played when the user finishes their start-of-day rituals, and
-- "dawn" as a choice for either moment. Ids match SOUNDS in
-- src/lib/sounds.ts; add new ones to both checks.

alter table public.profiles
  drop constraint profiles_shutdown_sound_check,
  add constraint profiles_shutdown_sound_check
    check (shutdown_sound in ('dusk', 'dawn', 'none')),
  add column start_sound text not null default 'dawn'
    check (start_sound in ('dusk', 'dawn', 'none'));

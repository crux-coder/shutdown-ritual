-- The sound played when the user shuts down for the day. Ids match SOUNDS in
-- src/lib/sounds.ts; add new ones to both.

alter table public.profiles
  add column shutdown_sound text not null default 'dusk'
    check (shutdown_sound in ('dusk', 'none'));

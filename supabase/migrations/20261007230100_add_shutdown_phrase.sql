-- The phrase the user types to close their day, after Cal Newport's
-- "Schedule shutdown, complete." Keep the default in sync with
-- DEFAULT_SHUTDOWN_PHRASE in src/lib/profile.ts.

alter table public.profiles
  add column shutdown_phrase text not null default 'Schedule shutdown, complete.'
    check (char_length(btrim(shutdown_phrase)) between 1 and 80);

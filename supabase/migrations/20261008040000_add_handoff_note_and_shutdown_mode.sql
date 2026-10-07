-- A note the user leaves for their next day as they shut down, and whether
-- shutting down takes typing the phrase or a single button.

alter table public.profiles
  -- Free text, shown at the start of the next day until dismissed.
  add column handoff_note text
    check (char_length(handoff_note) <= 500),
  -- The user's local date the note was written on, matching
  -- day_shut_down_on; it shows on any later day.
  add column handoff_note_on date,
  add column shutdown_mode text not null default 'phrase'
    check (shutdown_mode in ('phrase', 'button'));

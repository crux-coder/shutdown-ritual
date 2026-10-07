-- Onboarding no longer has a ritual step: finishing it gives the user a
-- ready-made "Shutdown for the day" ritual, and Today introduces it with a
-- welcome card, then offers to tailor it after the first shutdown.

alter table public.profiles
  -- When the user put away the welcome card on Today.
  add column welcome_dismissed_at timestamptz,
  -- When the user put away the "make it your own" card after their first
  -- shutdown.
  add column tailor_nudge_dismissed_at timestamptz;

-- People who already use the app don't need either card.
update public.profiles
set welcome_dismissed_at = now(), tailor_nudge_dismissed_at = now()
where onboarding_step = 'complete';

-- Anyone part-way through the old ritual step gets the default ritual (keep
-- it in sync with DEFAULT_RITUAL in src/lib/rituals/templates.ts) and is done.
insert into public.rituals (user_id, title, steps, moment, days)
select
  p.id,
  'Shutdown for the day',
  array[
    'Check for anything truly urgent; park the rest',
    'Capture every open task somewhere you trust',
    'Look over tomorrow’s calendar'
  ],
  'end_of_day',
  array[1, 2, 3, 4, 5]::smallint[]
from public.profiles p
where p.onboarding_step = 'first_ritual'
  and not exists (select 1 from public.rituals r where r.user_id = p.id);

update public.profiles
set onboarding_step = 'complete'
where onboarding_step = 'first_ritual';

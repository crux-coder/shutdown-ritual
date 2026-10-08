-- Start-of-day rituals are gone for now: every ritual belongs to the end of
-- the day, so the moment a ritual runs at no longer needs storing, and
-- neither do the start-of-day sound or starting the day early.

-- Their completions and step checks go with them.
delete from public.rituals where moment = 'start_of_day';

alter table public.rituals drop column moment;
drop type public.ritual_moment;

alter table public.profiles
  drop column start_sound,
  drop column day_started_early_on;

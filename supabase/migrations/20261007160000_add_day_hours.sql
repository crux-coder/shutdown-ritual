-- When the user's day starts and ends, in their local time. Decides which
-- rituals are up next on the home page, and when reminders go out.

alter type public.onboarding_step add value 'day_hours' before 'first_ritual';

alter table public.profiles
  add column day_starts_at time not null default '09:00',
  add column day_ends_at time not null default '17:30',
  add constraint profiles_day_hours_check check (day_ends_at > day_starts_at);

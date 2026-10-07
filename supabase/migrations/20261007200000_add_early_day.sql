-- The last local date the user chose to start, or end, their day before the
-- rituals would open on their own. Compared with today's date, so each
-- choice lasts until midnight and applies on every device.

alter table public.profiles
  add column day_started_early_on date,
  add column day_ended_early_on date;

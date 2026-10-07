-- The last local date the user shut down for, once their end-of-day rituals
-- were done. The home page stays in its quiet shut-down view until midnight,
-- or until they reopen the day.

alter table public.profiles
  add column day_shut_down_on date;

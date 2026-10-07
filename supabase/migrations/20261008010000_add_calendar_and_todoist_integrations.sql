-- Google Calendar and Todoist join the integrations a ritual can pull from.
-- Linear and Notion stay in the enum for rituals that already have them, but
-- the app no longer offers them; saving such a ritual drops them.

alter type public.ritual_integration add value if not exists 'google_calendar';
alter type public.ritual_integration add value if not exists 'todoist';

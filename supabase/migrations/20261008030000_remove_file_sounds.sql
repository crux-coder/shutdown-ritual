-- The two file-based sounds are gone (the audio wasn't ours to ship). Anyone
-- who picked one goes back to the default for that moment.

update public.profiles
set start_sound = 'dawn'
where start_sound in ('windows-xp-startup', 'windows-xp-shutdown');

update public.profiles
set shutdown_sound = 'dusk'
where shutdown_sound in ('windows-xp-startup', 'windows-xp-shutdown');

alter table public.profiles
  drop constraint profiles_start_sound_check,
  add constraint profiles_start_sound_check
    check (start_sound in ('dawn', 'dusk', 'none')),
  drop constraint profiles_shutdown_sound_check,
  add constraint profiles_shutdown_sound_check
    check (shutdown_sound in ('dawn', 'dusk', 'none'));

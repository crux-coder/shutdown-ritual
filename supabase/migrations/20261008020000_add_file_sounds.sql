-- Two sounds played from audio files in public/sounds. Ids match SOUNDS in
-- src/lib/sounds.ts; add new ones to both checks.

alter table public.profiles
  drop constraint profiles_start_sound_check,
  add constraint profiles_start_sound_check
    check (start_sound in (
      'dawn', 'dusk', 'windows-xp-startup', 'windows-xp-shutdown', 'none'
    )),
  drop constraint profiles_shutdown_sound_check,
  add constraint profiles_shutdown_sound_check
    check (shutdown_sound in (
      'dawn', 'dusk', 'windows-xp-startup', 'windows-xp-shutdown', 'none'
    ));

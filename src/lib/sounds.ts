// Sounds the app can play: some synthesized in the browser, some audio files
// in public/sounds (labelled with their file names). Each one has an id,
// stored as the user's choice in profiles.start_sound and
// profiles.shutdown_sound (keep their check constraints in sync) and passed
// back in to playSound().

const FILE_SOUNDS = {
  "windows-xp-startup": "Windows XP Startup.mp3",
  "windows-xp-shutdown": "Windows XP Shutdown.mp3",
} as const;

type FileSoundId = keyof typeof FILE_SOUNDS;

// "Windows XP Startup.mp3" → "Windows XP Startup"
function fileLabel(file: string) {
  return file.replace(/\.[^.]+$/, "");
}

export const SOUNDS = [
  { id: "dawn", label: "Dawn" },
  { id: "dusk", label: "Dusk" },
  {
    id: "windows-xp-startup",
    label: fileLabel(FILE_SOUNDS["windows-xp-startup"]),
  },
  {
    id: "windows-xp-shutdown",
    label: fileLabel(FILE_SOUNDS["windows-xp-shutdown"]),
  },
  { id: "none", label: "No sound" },
] as const;

export type SoundId = (typeof SOUNDS)[number]["id"];

export function isSoundId(value: string): value is SoundId {
  return SOUNDS.some((s) => s.id === value);
}

// Match the profiles.start_sound and shutdown_sound column defaults.
export const DEFAULT_START_SOUND: SoundId = "dawn";
export const DEFAULT_SHUTDOWN_SOUND: SoundId = "dusk";

const PLAYERS: Record<
  Exclude<SoundId, FileSoundId>,
  (ctx: AudioContext) => void
> = {
  dawn: playDawn,
  dusk: playDusk,
  none: () => {},
};

function isFileSound(id: SoundId): id is FileSoundId {
  return id in FILE_SOUNDS;
}

const FILE_VOLUME = 0.6;

let context: AudioContext | null = null;

// Must be called from a user gesture (a click), or browsers keep it muted.
export function playSound(id: SoundId): void {
  if (id === "none" || typeof window === "undefined") return;
  try {
    if (isFileSound(id)) {
      const audio = new Audio(`/sounds/${encodeURIComponent(FILE_SOUNDS[id])}`);
      audio.volume = FILE_VOLUME;
      // Rejects if the browser blocks playback; nothing to do about it here.
      void audio.play().catch(() => {});
      return;
    }
    context ??= new AudioContext();
    void context.resume();
    PLAYERS[id](context);
  } catch {
    // Sound is a nicety; never let it break the action it accompanies.
  }
}

// A warm, slow swell that dims away, like lights going down — about as long
// as the shut-down screen takes to settle in.
const DUSK_SECONDS = 2.4;

function playDusk(ctx: AudioContext) {
  const start = ctx.currentTime + 0.02;
  const end = start + DUSK_SECONDS;

  // The whole sound swells in, then fades to nothing.
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, start);
  out.gain.exponentialRampToValueAtTime(0.14, start + 0.6);
  out.gain.setValueAtTime(0.14, start + 0.9);
  out.gain.exponentialRampToValueAtTime(0.0001, end);
  out.connect(ctx.destination);

  // Brightness closes down over the sound: the "dimming".
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.5;
  filter.frequency.setValueAtTime(1600, start);
  filter.frequency.exponentialRampToValueAtTime(320, end);
  filter.connect(out);

  // An open D chord (D3, A3, D4, F♯4, A4), quieter as it goes up.
  const notes = [146.83, 220.0, 293.66, 369.99, 440.0];
  notes.forEach((frequency, i) => {
    const level = 0.5 / (i + 1);
    // Two slightly detuned voices per note for a soft, breathing warmth.
    for (const cents of [-5, 5]) {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = frequency;
      osc.detune.value = cents;

      const voice = ctx.createGain();
      voice.gain.value = level;
      osc.connect(voice).connect(filter);
      osc.start(start);
      osc.stop(end + 0.05);
    }
  });
}

// Dusk turned around: a bright chord that rises in note by note and opens up,
// like light coming in, for the morning rituals being done.
const DAWN_SECONDS = 2.2;
const DAWN_NOTE_GAP = 0.12;

function playDawn(ctx: AudioContext) {
  const start = ctx.currentTime + 0.02;
  const end = start + DAWN_SECONDS;

  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, start);
  out.gain.exponentialRampToValueAtTime(0.12, start + 0.5);
  out.gain.setValueAtTime(0.12, start + 1.0);
  out.gain.exponentialRampToValueAtTime(0.0001, end);
  out.connect(ctx.destination);

  // Brightness opens up as the notes arrive: the "brightening".
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.5;
  filter.frequency.setValueAtTime(500, start);
  filter.frequency.exponentialRampToValueAtTime(2600, start + 1.2);
  filter.connect(out);

  // A G chord (G3, D4, G4, B4, D5), each note entering a beat after the one
  // below it, quieter as it goes up.
  const notes = [196.0, 293.66, 392.0, 493.88, 587.33];
  notes.forEach((frequency, i) => {
    const onset = start + i * DAWN_NOTE_GAP;
    const level = 0.45 / (i + 1);
    for (const cents of [-4, 4]) {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = frequency;
      osc.detune.value = cents;

      const voice = ctx.createGain();
      voice.gain.setValueAtTime(0.0001, start);
      voice.gain.setValueAtTime(0.0001, onset);
      voice.gain.exponentialRampToValueAtTime(level, onset + 0.15);
      osc.connect(voice).connect(filter);
      osc.start(start);
      osc.stop(end + 0.05);
    }
  });
}

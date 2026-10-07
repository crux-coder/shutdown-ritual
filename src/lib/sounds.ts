// Sounds the app can play, synthesized in the browser — no audio files.
// Each one has an id, so a user's choice can later be stored as a plain
// string (e.g. a profile column) and passed back in to playSound().

export const SOUNDS = [
  { id: "dusk", label: "Dusk" },
  { id: "none", label: "No sound" },
] as const;

export type SoundId = (typeof SOUNDS)[number]["id"];

// Until it's configurable, everyone hears this on shutdown.
export const DEFAULT_SHUTDOWN_SOUND: SoundId = "dusk";

const PLAYERS: Record<SoundId, (ctx: AudioContext) => void> = {
  dusk: playDusk,
  none: () => {},
};

let context: AudioContext | null = null;

// Must be called from a user gesture (a click), or browsers keep it muted.
export function playSound(id: SoundId): void {
  if (id === "none" || typeof window === "undefined") return;
  try {
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

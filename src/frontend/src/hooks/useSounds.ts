// Premium Sound Engine — Web Audio API only (no audio files)
// Singleton module-level instance shared across the app

export type SoundName =
  | "splash"
  | "login"
  | "tap"
  | "purchase"
  | "deposit"
  | "withdrawal"
  | "spin"
  | "win"
  | "error"
  | "dismiss"
  | "balance_tick";

const MUTE_KEY = "fsc_sound_muted";

let audioCtx: AudioContext | null = null;
let isMuted = localStorage.getItem(MUTE_KEY) === "true";
let spinOsc: OscillatorNode | null = null;
let spinGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

async function resumeCtx(ctx: AudioContext) {
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      // ignore
    }
  }
}

function playChime(
  frequencies: number[],
  durations: number[],
  type: OscillatorType = "sine",
  gainVolume = 0.18,
) {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;
  resumeCtx(ctx);
  let time = ctx.currentTime;
  for (let i = 0; i < frequencies.length; i++) {
    const freq = frequencies[i];
    const dur = durations[i];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(gainVolume, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.start(time);
    osc.stop(time + dur);
    time += dur * 0.8;
  }
}

function playSingleTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  gainVolume = 0.18,
) {
  const ctx = getAudioContext();
  if (!ctx || isMuted) return;
  resumeCtx(ctx);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(gainVolume, ctx.currentTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

const soundHandlers: Record<SoundName, () => void> = {
  splash: () => {
    // Elegant rising 3-note chime C5→E5→G5
    playChime([523.25, 659.25, 783.99], [0.08, 0.08, 0.08], "sine", 0.15);
  },

  login: () => {
    // Warm ascending 2-note D5→F#5
    playChime([587.33, 739.99], [0.1, 0.1], "sine", 0.16);
  },

  tap: () => {
    // Very short soft click, 30ms, 800hz triangle
    playSingleTone(800, 0.03, "triangle", 0.12);
  },

  purchase: () => {
    // Triumphant fanfare C5→E5→G5→C6 rapid ascending then sustain
    playChime(
      [523.25, 659.25, 783.99, 1046.5],
      [0.07, 0.07, 0.07, 0.22],
      "sine",
      0.18,
    );
  },

  deposit: () => {
    // Friendly 2-tone chime D5→A5
    playChime([587.33, 880.0], [0.08, 0.1], "sine", 0.15);
  },

  withdrawal: () => {
    // Descending G4→E4→C4, slightly percussive
    playChime([392.0, 329.63, 261.63], [0.1, 0.1, 0.12], "triangle", 0.14);
  },

  spin: () => {
    // Handled separately via startSpin/stopSpin
    startSpin();
  },

  win: () => {
    // Joyful C5→E5→G5→C6 fanfare with slight reverb feel
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;
    resumeCtx(ctx);
    const notes = [
      { freq: 523.25, time: 0, dur: 0.15 },
      { freq: 659.25, time: 0.1, dur: 0.15 },
      { freq: 783.99, time: 0.2, dur: 0.15 },
      { freq: 1046.5, time: 0.3, dur: 0.35 },
    ];
    for (const { freq, time, dur } of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + time + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + time + dur,
      );
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur);
    }
  },

  error: () => {
    // Low descending Bb3→F3, slight buzz
    playChime([233.08, 174.61], [0.1, 0.12], "sawtooth", 0.1);
  },

  dismiss: () => {
    // Soft pop, 40ms, 600hz sine
    playSingleTone(600, 0.04, "sine", 0.13);
  },

  balance_tick: () => {
    // Very subtle high ping, 20ms, 1200hz
    playSingleTone(1200, 0.02, "sine", 0.06);
  },
};

export function playSound(name: SoundName): void {
  if (isMuted) return;
  try {
    soundHandlers[name]?.();
  } catch {
    // Swallow audio errors silently
  }
}

let spinActive = false;

export function startSpin(): void {
  if (isMuted || spinActive) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  resumeCtx(ctx);
  spinActive = true;

  spinOsc = ctx.createOscillator();
  spinGain = ctx.createGain();
  spinOsc.connect(spinGain);
  spinGain.connect(ctx.destination);

  spinOsc.type = "sine";
  spinOsc.frequency.setValueAtTime(200, ctx.currentTime);
  spinOsc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 3.5);

  spinGain.gain.setValueAtTime(0, ctx.currentTime);
  spinGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
  spinGain.gain.setValueAtTime(0.08, ctx.currentTime + 3.4);
  spinGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.5);

  spinOsc.start(ctx.currentTime);
  spinOsc.stop(ctx.currentTime + 3.6);

  spinOsc.onended = () => {
    spinActive = false;
    spinOsc = null;
    spinGain = null;
  };
}

export function stopSpin(): void {
  if (!spinActive) return;
  spinActive = false;
  try {
    if (spinGain) {
      const ctx = getAudioContext();
      if (ctx) {
        spinGain.gain.setValueAtTime(spinGain.gain.value, ctx.currentTime);
        spinGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      }
    }
    if (spinOsc) {
      spinOsc.stop(audioCtx ? audioCtx.currentTime + 0.15 : 0);
    }
  } catch {
    // ignore
  }
  spinOsc = null;
  spinGain = null;
}

export function isSoundMuted(): boolean {
  return isMuted;
}

export function toggleSoundMute(): boolean {
  isMuted = !isMuted;
  localStorage.setItem(MUTE_KEY, String(isMuted));
  return isMuted;
}

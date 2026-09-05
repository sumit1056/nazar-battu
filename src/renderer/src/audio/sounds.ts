import ghantaBellUrl from '../assets/ghanta-ring.wav';

let audioCtx: AudioContext | null = null;
let bellAudio: HTMLAudioElement | null = null;

if (typeof Audio !== 'undefined') {
  try {
    bellAudio = new Audio(ghantaBellUrl);
    bellAudio.preload = 'auto';
    bellAudio.volume = 0.36;
  } catch {
    bellAudio = null;
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/** Pure glass crystal clink for the Evil Eye */
function playGlassClink(ctx: AudioContext, volume: number): void {
  const now = ctx.currentTime;
  const freqs = [1760.0, 2640.0, 3520.0]; // A6 & harmonics

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq + idx * 25, now);

    const initialGain = volume * (idx === 0 ? 0.6 : 0.3);
    gain.gain.setValueAtTime(initialGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  });
}

/** Deep resonant bronze gong for Mahakal Demon Mask */
function playGongResonance(ctx: AudioContext, volume: number): void {
  const now = ctx.currentTime;
  const freqs = [220.0, 330.0, 554.3]; // A3, E4, C#5 triad

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = idx === 0 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const initialGain = volume * (idx === 0 ? 0.7 : 0.35);
    gain.gain.setValueAtTime(initialGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.9);
  });
}

/** Gentle organic wooden / thread chime for Nimbu-Mirchi */
function playOrganicChime(ctx: AudioContext, volume: number): void {
  const now = ctx.currentTime;
  const freqs = [523.25, 659.25]; // C5 & E5 warm acoustic interval

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq + idx * 8, now);

    const initialGain = volume * (idx === 0 ? 0.5 : 0.25);
    gain.gain.setValueAtTime(initialGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  });
}

/** Generic synthesized chime fallback */
function playSynthChime(volume = 0.25): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const freqs = [1046.5, 2093.0]; // C6 & C7
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq + idx * 15, now);

    const initialGain = volume * (idx === 0 ? 0.8 : 0.4);
    gain.gain.setValueAtTime(initialGain, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  });
}

/**
 * Play charm-specific tactile audio feedback when tapped or grabbed.
 */
export function playChime(charmId = 'nimbu-mirchi', volume = 0.25): void {
  const ctx = getAudioContext();

  // 1. Ghanta gets the authentic loud bronze temple bell!
  if (charmId === 'ghanta' && bellAudio) {
    try {
      bellAudio.currentTime = 0;
      bellAudio.volume = Math.max(0.05, Math.min(1.0, volume * 1.4));
      bellAudio.play().catch(() => playSynthChime(volume));
      return;
    } catch {
      // Fallback
    }
  }

  // 2. Evil Eye gets crystal glass clink
  if (charmId === 'evil-eye' && ctx) {
    playGlassClink(ctx, volume);
    return;
  }

  // 3. Mahakal Demon Mask gets deep bronze gong resonance
  if (charmId === 'mahakal-mask' && ctx) {
    playGongResonance(ctx, volume);
    return;
  }

  // 4. Nimbu-Mirchi gets gentle organic thread chime
  if (charmId === 'nimbu-mirchi' && ctx) {
    playOrganicChime(ctx, volume);
    return;
  }

  playSynthChime(volume);
}

/**
 * Play an airy swish / whoosh sound when the talisman is flung with velocity.
 * @param velocity Magnitude of velocity (typically 5 to 30)
 */
export function playSwish(velocity = 15, volume = 0.2): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const duration = Math.min(0.4, Math.max(0.15, velocity * 0.015));

  // Synthesize soft filtered white noise
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(600, now);
  filter.frequency.exponentialRampToValueAtTime(1400, now + duration * 0.5);
  filter.frequency.exponentialRampToValueAtTime(400, now + duration);
  filter.Q.setValueAtTime(2, now);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(volume, now + duration * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration);
}

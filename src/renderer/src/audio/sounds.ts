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
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/** Synthesized backup chime */
function playSynthChime(volume = 0.25): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Dual tone chime: fundamental + harmonic
  const freqs = [1046.5, 2093.0]; // C6 & C7
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq + (idx * 15), now);

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
 * Play an authentic temple brass bell chime when the talisman is tapped or grabbed.
 */
export function playChime(volume = 0.25): void {
  if (bellAudio) {
    try {
      bellAudio.currentTime = 0;
      bellAudio.volume = Math.max(0.05, Math.min(1.0, volume * 1.4));
      bellAudio.play().catch(() => {
        playSynthChime(volume);
      });
      return;
    } catch {
      // Fallback to synth if audio element fails
    }
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
  filter.frequency.setValueAtTime(400, now);
  filter.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.5);
  filter.frequency.exponentialRampToValueAtTime(300, now + duration);
  filter.Q.setValueAtTime(2.5, now);

  const gain = ctx.createGain();
  const scaledGain = Math.min(0.4, Math.max(0.05, volume * (velocity / 15)));
  gain.gain.setValueAtTime(scaledGain, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + duration + 0.05);
}

/**
 * Play a light flutter when cursor breezes past the charm.
 */
export function playBreezeSound(volume = 0.08): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);

  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.25);
}

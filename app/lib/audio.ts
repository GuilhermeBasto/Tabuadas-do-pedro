/**
 * Tiny Web Audio synthesizer for game SFX.
 * No audio files — generates retro arcade beeps from oscillators.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.1,
) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = volume;
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export const sfx = {
  correct() {
    tone(523, 0.1);
    setTimeout(() => tone(659, 0.1), 80);
    setTimeout(() => tone(784, 0.15), 160);
  },
  wrong() {
    tone(200, 0.2, "sawtooth", 0.08);
    setTimeout(() => tone(150, 0.3, "sawtooth", 0.08), 100);
  },
  coin() {
    tone(988, 0.08, "square", 0.08);
    setTimeout(() => tone(1318, 0.12, "square", 0.08), 60);
  },
  star() {
    tone(523, 0.08);
    setTimeout(() => tone(659, 0.08), 80);
    setTimeout(() => tone(784, 0.08), 160);
    setTimeout(() => tone(1047, 0.2), 240);
  },
  click() {
    tone(440, 0.05, "square", 0.06);
  },
  bossHit() {
    // sharp punchy hit
    tone(180, 0.06, "square", 0.12);
    setTimeout(() => tone(120, 0.1, "sawtooth", 0.1), 40);
  },
  bossDefeat() {
    // long fanfare descending then ascending
    tone(523, 0.12);
    setTimeout(() => tone(659, 0.12), 100);
    setTimeout(() => tone(784, 0.12), 200);
    setTimeout(() => tone(1047, 0.18), 300);
    setTimeout(() => tone(1319, 0.32), 460);
  },
  purchase() {
    // cheerful cash-register-ish chime
    tone(880, 0.08, "square", 0.1);
    setTimeout(() => tone(1175, 0.1, "square", 0.1), 70);
    setTimeout(() => tone(1568, 0.16, "triangle", 0.1), 150);
  },
  powerup() {
    tone(660, 0.06, "triangle", 0.1);
    setTimeout(() => tone(990, 0.1, "triangle", 0.1), 50);
  },
};

/**
 * Audio contexts must be unlocked on first user gesture.
 * Call this once during app init.
 */
export function initAudioUnlock() {
  if (typeof window === "undefined") return;
  const unlock = () => {
    getCtx();
  };
  window.addEventListener("touchstart", unlock, { once: true });
  window.addEventListener("click", unlock, { once: true });
}

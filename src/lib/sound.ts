/**
 * مؤثرات صوتية خفيفة تُولَّد داخل المتصفح (دون ملفات صوتية خارجية).
 * لا يُنشأ سياق الصوت إلا عند أول تفاعل من المستخدمة، ويمكن كتمه.
 */
let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.08) {
  const c = audio();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.05),
  correct: () => {
    tone(523, 0, 0.12, 'triangle');
    tone(659, 0.1, 0.12, 'triangle');
    tone(784, 0.2, 0.2, 'triangle');
  },
  wrong: () => {
    tone(330, 0, 0.14, 'sine', 0.06);
    tone(262, 0.12, 0.2, 'sine', 0.06);
  },
  stamp: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.07));
  },
  train: () => {
    tone(440, 0, 0.18, 'square', 0.03);
    tone(392, 0.2, 0.25, 'square', 0.03);
  },
};

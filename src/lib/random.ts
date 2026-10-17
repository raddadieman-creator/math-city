/** مولّد أعداد عشوائية قابل للإعادة (يساعد في الاختبار) */
export type Rng = () => number;

export function createRng(seed = Date.now()): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** عدد بعدد منازل محدد، دون صفر في البداية */
export function numberWithDigits(rng: Rng, digits: number): number {
  return randInt(rng, 10 ** (digits - 1), 10 ** digits - 1);
}

/** عدد بلا أصفار مكررة إن طُلب ذلك (يجعل أسئلة القيمة المنزلية أوضح) */
export function distinctDigitNumber(rng: Rng, digits: number): number {
  const pool = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  return Number(pool.slice(0, digits).join(''));
}

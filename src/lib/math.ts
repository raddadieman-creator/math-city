import { digitsOf } from './numbers';

/** التقريب إلى أقرب منزلة (٥ فأكثر يُقرَّب إلى الأعلى) */
export function roundTo(n: number, place: number): number {
  const low = Math.floor(n / place) * place;
  return n - low >= place / 2 ? low + place : low;
}

export function roundingBounds(n: number, place: number) {
  const low = Math.floor(n / place) * place;
  return { low, high: low + place, mid: low + place / 2 };
}

/** أول منزلة مختلفة بين عددين لهما عدد المنازل نفسه (‎-1 إذا تساويا أو اختلف طولهما) */
export function firstDifferentPlace(a: number, b: number): number {
  const da = digitsOf(a);
  const db = digitsOf(b);
  if (da.length !== db.length) return -1;
  for (let i = da.length - 1; i >= 0; i--) if (da[i] !== db[i]) return i;
  return -1;
}

/** الحمل في الجمع العمودي: carries[i] = ما يُحمل إلى المنزلة i */
export function additionCarries(operands: number[]): number[] {
  const total = operands.reduce((s, x) => s + x, 0);
  const len = String(total).length;
  const ds = operands.map(digitsOf);
  const carries = new Array(len + 1).fill(0);
  let carry = 0;
  for (let i = 0; i < len; i++) {
    const s = ds.reduce((acc, d) => acc + (d[i] ?? 0), 0) + carry;
    carry = Math.floor(s / 10);
    carries[i + 1] = carry;
  }
  return carries;
}

export function hasCarry(operands: number[]): boolean {
  return additionCarries(operands).some((c) => c > 0);
}

export interface BorrowResult {
  /** أرقام المطروح منه بعد إعادة التجميع (index 0 = الآحاد) */
  working: number[];
  /** هل تغيّرت هذه المنزلة بإعادة التجميع */
  changed: boolean[];
  original: number[];
}

/** إعادة التجميع في الطرح بالطريقة المعتادة (الاستلاف من أقرب منزلة غير صفرية) */
export function subtractionRegroup(a: number, b: number): BorrowResult {
  const original = digitsOf(a);
  const working = [...original];
  const db = digitsOf(b);
  const changed = new Array(working.length).fill(false);
  for (let i = 0; i < working.length; i++) {
    const bi = db[i] ?? 0;
    if (working[i] < bi) {
      let j = i + 1;
      while (working[j] === 0) j++;
      working[j] -= 1;
      changed[j] = true;
      for (let k = j - 1; k > i; k--) {
        working[k] = 9;
        changed[k] = true;
      }
      working[i] += 10;
      changed[i] = true;
    }
  }
  return { working, changed, original };
}

export function needsBorrow(a: number, b: number): boolean {
  return subtractionRegroup(a, b).changed.some(Boolean);
}

/** هل يحتوي العدد على صفر في منزلة داخلية (يُستخدم في الطرح بوجود الأصفار) */
export function hasInnerZero(n: number): boolean {
  const d = digitsOf(n);
  return d.slice(0, -1).some((x) => x === 0);
}

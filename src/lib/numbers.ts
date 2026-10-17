import { settings } from '../config/settings';

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** تحويل الأرقام الإنجليزية إلى أرقام عربية (٠-٩) للعرض */
export function toArabicDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]);
}

/** تحويل أي أرقام عربية أو فارسية إلى إنجليزية للمعالجة الداخلية */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
}

/** عرض عدد بأرقام عربية مع فاصل الآلاف العربي (٬) */
export function fmt(n: number, withSeparator = true): string {
  const negative = n < 0;
  const s = String(Math.abs(Math.trunc(n)));
  const grouped = withSeparator && s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '٬') : s;
  return (negative ? '−' : '') + toArabicDigits(grouped);
}

/**
 * قراءة إدخال الطالبة: يقبل الأرقام العربية والإنجليزية والفارسية،
 * ويتجاهل فواصل الآلاف والمسافات. يعيد null إذا لم يكن عددًا صحيحًا.
 */
export function parseNumberInput(raw: string): number | null {
  const cleaned = toLatinDigits(raw.trim())
    .replace(/[٬،,'’\s  _]/g, '')
    .replace(/^[+]/, '');
  if (cleaned === '' || !/^-?\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isSafeInteger(n) ? n : null;
}

/* ------------------------------------------------------------------ */
/*  المنازل                                                            */
/* ------------------------------------------------------------------ */

export const PLACE_NAMES = [
  'الآحاد',
  'العشرات',
  'المئات',
  'الآلاف',
  'عشرات الآلاف',
  'مئات الآلاف',
  'الملايين',
] as const;

/** اسم المنزلة بصيغة المفرد للسؤال: «منزلة الآحاد» */
export function placeName(index: number): string {
  return PLACE_NAMES[index];
}

export function placeValueOf(index: number): number {
  return 10 ** index;
}

export function digitsOf(n: number): number[] {
  // الخانة 0 = الآحاد
  return String(n)
    .split('')
    .reverse()
    .map(Number);
}

/** الصورة التحليلية: ٣٠٬٠٠٠ + ٥٬٠٠٠ + ٤٠٠ + ٢٠ + ١ (تُعاد الأجزاء من الأكبر للأصغر) */
export function expandedParts(n: number): number[] {
  const d = digitsOf(n);
  const parts: number[] = [];
  for (let i = d.length - 1; i >= 0; i--) {
    if (d[i] !== 0) parts.push(d[i] * 10 ** i);
  }
  return parts;
}

/* ------------------------------------------------------------------ */
/*  الصيغة اللفظية بالعربية                                            */
/* ------------------------------------------------------------------ */

const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const TEENS = [
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
];
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const HUNDRED_PREFIX = ['', '', '', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان', 'تسع'];

function hundredWord(h: number, construct: boolean): string {
  const m = settings.hundredSpelling;
  if (h === 1) return m;
  if (h === 2) return construct ? m.replace(/ة$/, 'تا') : m.replace(/ة$/, 'تان');
  return HUNDRED_PREFIX[h] + m;
}

function belowHundred(n: number): string {
  if (n === 0) return '';
  if (n < 10) return ONES[n];
  if (n < 20) return TEENS[n - 10];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS[t] : `${ONES[o]} و${TENS[t]}`;
}

/** كتابة عدد من ١ إلى ٩٩٩ (construct: صيغة الإضافة مثل «مئتا ألف») */
function triplet(n: number, construct = false): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (h > 0) parts.push(hundredWord(h, construct && rest === 0));
  if (rest > 0) parts.push(belowHundred(rest));
  return parts.join(' و');
}

/** تمييز الآلاف أو الملايين بحسب العدد */
function scaled(count: number, one: string, two: string, plural: string, accusative: string): string {
  if (count === 1) return one;
  if (count === 2) return two;
  const rest = count % 100;
  if (count < 100) {
    if (count <= 10) return `${triplet(count)} ${plural}`;
    return `${triplet(count)} ${accusative}`;
  }
  // ١٠٠ فأكثر
  if (rest === 0) return `${triplet(count, true)} ${one}`;
  if (rest <= 10) return `${triplet(count)} ${plural}`;
  return `${triplet(count)} ${accusative}`;
}

/**
 * هل يُكتب هذا العدد بصيغة لفظية متفق عليها؟
 * نستبعد في الأسئلة اللفظية حالات الآلاف من نوع ١٠١٬٠٠٠ و٣٠٥٬٠٠٠ التي
 * تتعدد صيغ قراءتها في الاستعمال.
 */
export function hasUnambiguousWords(n: number): boolean {
  const groups = [Math.floor(n / 1000) % 1000, Math.floor(n / 1_000_000) % 1000];
  return groups.every((g) => g < 100 || g % 100 === 0 || g % 100 >= 11);
}

/** الصيغة اللفظية لعدد صحيح من ٠ إلى ٩٩٩٬٩٩٩٬٩٩٩ */
export function toArabicWords(n: number): string {
  if (n === 0) return 'صفر';
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor(n / 1000) % 1000;
  const units = n % 1000;
  const parts: string[] = [];
  if (millions > 0) parts.push(scaled(millions, 'مليون', 'مليونان', 'ملايين', 'مليونًا'));
  if (thousands > 0) parts.push(scaled(thousands, 'ألف', 'ألفان', 'آلاف', 'ألفًا'));
  if (units > 0) parts.push(triplet(units));
  return parts.join(' و');
}

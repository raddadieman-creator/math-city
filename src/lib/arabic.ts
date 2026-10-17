import { fmt } from './numbers';
import { settings } from '../config/settings';

/** صيغ المعدود: [مفرد، مثنى، جمع (٣–١٠)، تمييز منصوب (١١–٩٩)] */
const NOUNS = {
  riyal: ['ريال', 'ريالان', 'ريالات', 'ريالًا'],
  vote: ['صوت', 'صوتان', 'أصوات', 'صوتًا'],
  tree: ['شجرة', 'شجرتان', 'أشجار', 'شجرة'],
  row: ['صف', 'صفّان', 'صفوف', 'صفًّا'],
  car: ['عربة', 'عربتان', 'عربات', 'عربة'],
  time: ['مرة', 'مرتان', 'مرات', 'مرة'],
} as const;

export type NounKey = keyof typeof NOUNS;

/** المعدود المناسب للعدد (يُكتب العدد بالأرقام قبله) */
export function nounFor(n: number, key: NounKey): string {
  const [one, two, plural, acc] = NOUNS[key];
  const r = n % 100;
  if (n === 1) return one;
  if (n === 2) return two;
  if (r === 0 || r === 1 || r === 2) return one;
  if (r >= 3 && r <= 10) return plural;
  return acc;
}

/** عبارة عددية كاملة: «١٢٥ ريالًا»، «صفّان»، «شجرة واحدة» */
export function countPhrase(n: number, key: NounKey): string {
  const [one, two] = NOUNS[key];
  if (n === 1) return key === 'tree' || key === 'car' || key === 'time' ? `${one} واحدة` : `${one} واحد`;
  if (n === 2) return two;
  return `${fmt(n)} ${nounFor(n, key)}`;
}

/** «أقرب عشرة / مئة / ألف / عشرة آلاف» */
export function placeWord(p: number): string {
  const map: Record<number, string> = {
    10: 'عشرة',
    100: settings.hundredSpelling,
    1000: 'ألف',
    10000: 'عشرة آلاف',
  };
  return map[p] ?? fmt(p);
}

export const PRAISE = [
  'أحسنتِ!',
  'رائع يا بانية المدينة!',
  'إجابة موفقة!',
  'ممتاز، فكرتِ بدقة!',
  'عمل جميل!',
  'بارك الله فيكِ!',
  'تفكير ذكي!',
  'أنتِ مهندسة ماهرة!',
];

export const TRY_AGAIN = [
  'قريبة! جرّبي مرة أخرى.',
  'لا بأس، المحاولة جزء من التعلّم.',
  'فكّري مرة ثانية، أنتِ قادرة.',
  'اقتربتِ، انظري إلى التلميح.',
];

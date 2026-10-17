/**
 * مولّدات الأسئلة لكل مهارة.
 * كل مولّد دالة صرفة: تأخذ مولّد أعداد عشوائية وتعيد سؤالًا كاملًا
 * (نص، تمثيل بصري، إجابة، تلميح، شرح). الواجهة لا تحسب أي إجابة بنفسها.
 */
import { settings, placesCount } from '../config/settings';
import {
  fmt,
  toArabicWords,
  hasUnambiguousWords,
  digitsOf,
  expandedParts,
  placeName,
} from '../lib/numbers';
import { countPhrase, placeWord } from '../lib/arabic';
import { roundTo, roundingBounds, firstDifferentPlace, hasCarry, needsBorrow, subtractionRegroup } from '../lib/math';
import { type Rng, randInt, pick, shuffle, numberWithDigits, distinctDigitNumber } from '../lib/random';
import type { ChoiceOption, Question, SkillId, ShopItem, Token, VoteRow, Visual } from './types';

/* ------------------------------------------------------------------ */
/*  أدوات مساعدة                                                       */
/* ------------------------------------------------------------------ */

const num = (v: number): Token => ({ t: 'num', v });
const op = (v: '+' | '−' | '×' | '='): Token => ({ t: 'op', v });
const blank: Token = { t: 'blank' };

function joinWith(values: number[], o: '+' | '−' | '×'): Token[] {
  const out: Token[] = [];
  values.forEach((v, i) => {
    if (i > 0) out.push(op(o));
    out.push(num(v));
  });
  return out;
}

/** يبني خيارات فريدة: الإجابة الصحيحة + مشتتات مختلفة عنها ومختلفة فيما بينها */
function buildOptions<T>(
  rng: Rng,
  correct: T,
  distractors: T[],
  count: number,
  key: (x: T) => string,
  toOption: (x: T) => ChoiceOption,
): { options: ChoiceOption[]; answer: number } {
  const seen = new Set([key(correct)]);
  const chosen: T[] = [];
  for (const d of shuffle(rng, distractors)) {
    if (chosen.length >= count - 1) break;
    const k = key(d);
    if (!seen.has(k)) {
      seen.add(k);
      chosen.push(d);
    }
  }
  const all = shuffle(rng, [correct, ...chosen]);
  return { options: all.map(toOption), answer: all.findIndex((x) => key(x) === key(correct)) };
}

function numberOptions(rng: Rng, correct: number, distractors: number[], count = 4) {
  const valid = distractors.filter((d) => Number.isInteger(d) && d >= 0);
  return buildOptions(rng, correct, valid, count, (x) => String(x), (x) => ({ label: fmt(x) }));
}

function housesDigits(rng: Rng): number {
  return randInt(rng, Math.min(settings.houses.minPlaces, placesCount()), placesCount());
}

/**
 * الصورة التحليلية تُرسم والآحاد في أقصى اليمين كما في كتاب الطالبة:
 * التعبير يُعرض من اليمين إلى اليسار، فنرتّب الأجزاء من الأصغر إلى الأكبر.
 */
function onesFirst(parts: number[]): number[] {
  return [...parts].sort((a, b) => a - b);
}

function expandedTokens(n: number): Token[] {
  return joinWith(onesFirst(expandedParts(n)), '+');
}

function describePlaces(n: number): string {
  const d = digitsOf(n);
  return d
    .map((digit, i) => ({ digit, i }))
    .reverse()
    .map(({ digit, i }) => `${fmt(digit)} في ${placeName(i)}`)
    .join('، ');
}

/* ------------------------------------------------------------------ */
/*  أ. حي المنازل — القيمة المنزلية                                    */
/* ------------------------------------------------------------------ */

function pvBuild(rng: Rng): Question {
  const P = housesDigits(rng);
  const n = distinctDigitNumber(rng, P);
  const useWords = rng() < 0.5 && hasUnambiguousWords(n);
  const parts = expandedParts(n);
  return {
    kind: 'build',
    skill: 'pv-build',
    story: 'وصلت أسرة جديدة إلى حي المنازل، فلنكتب رقم منزلها على البوابة.',
    prompt: useWords
      ? `ضعي كل رقم في منزلته لتبني العدد: «${toArabicWords(n)}»`
      : 'ضعي كل رقم في منزلته لتبني العدد الذي صورته التحليلية:',
    visual: useWords ? undefined : { type: 'expr', tokens: expandedTokens(n) },
    target: n,
    places: P,
    tiles: shuffle(rng, digitsOf(n)),
    hint: useWords
      ? 'ما يأتي قبل كلمة «ألف» أو «آلاف» يوضع في منازل الآلاف، وما بعدها في الآحاد والعشرات والمئات.'
      : `ابدئي بأكبر جزء: ${fmt(parts[0])} يعني أن الرقم ${fmt(digitsOf(n)[P - 1])} في منزلة ${placeName(P - 1)}.`,
    explain: `العدد هو ${fmt(n)}: ${describePlaces(n)}.`,
    explainVisual: { type: 'placeChart', n, places: P },
  };
}

function pvDigit(rng: Rng): Question {
  const P = housesDigits(rng);
  const n = distinctDigitNumber(rng, P);
  const i = randInt(rng, 0, P - 1);
  const d = digitsOf(n)[i];
  const value = d * 10 ** i;
  const askPlace = rng() < 0.5;
  const others = Array.from({ length: P }, (_, k) => k).filter((k) => k !== i);
  const base = {
    skill: 'pv-digit' as SkillId,
    story: 'كل رقم في العدد يسكن منزلًا، وقيمته تتغير بحسب منزله.',
    explain: `الرقم ${fmt(d)} في منزلة ${placeName(i)}، لذلك قيمته ${fmt(value)}.`,
    explainVisual: { type: 'placeChart', n, places: P, highlight: i } as Visual,
  };
  if (askPlace) {
    const { options, answer } = buildOptions(
      rng,
      i,
      others,
      4,
      String,
      (k) => ({ label: `منزلة ${placeName(k)}` }),
    );
    return {
      ...base,
      kind: 'choice',
      prompt: `في أي منزلة يقع الرقم ${fmt(d)} في العدد ${fmt(n)}؟`,
      options,
      answer,
      hint: 'ابدئي العدّ من أقصى يمين العدد: الآحاد، ثم العشرات، ثم المئات، ثم الآلاف…',
      hintVisual: { type: 'placeChart', n, places: P },
    };
  }
  const { options, answer } = numberOptions(
    rng,
    value,
    others.map((k) => d * 10 ** k),
  );
  return {
    ...base,
    kind: 'choice',
    prompt: `ما قيمة الرقم ${fmt(d)} في العدد ${fmt(n)}؟`,
    options,
    answer,
    hint: 'حدّدي منزلة الرقم أولًا، ثم اكتبي الرقم وبعده أصفارًا بعدد المنازل التي على يمينه.',
    hintVisual: { type: 'placeChart', n, places: P },
  };
}

function unambiguousNumber(rng: Rng, digits: number): number {
  for (let k = 0; k < 200; k++) {
    const n = numberWithDigits(rng, digits);
    if (hasUnambiguousWords(n)) return n;
  }
  return 10 ** (digits - 1) * 3 + 25;
}

function pvRead(rng: Rng): Question {
  const P = housesDigits(rng);
  const n = unambiguousNumber(rng, P);
  const words = toArabicWords(n);
  if (rng() < 0.5) {
    return {
      kind: 'number',
      skill: 'pv-read',
      story: 'وصلت رسالة إلى مكتب البريد فيها عدد مكتوب بالحروف.',
      prompt: `اكتبي هذا العدد بالأرقام: «${words}»`,
      answer: n,
      hint: 'ما يأتي قبل «ألف» أو «آلاف» يُكتب في منازل الآلاف. وإذا خلت منزلة من الرقم فاكتبي فيها صفرًا.',
      explain: `«${words}» يُكتب ${fmt(n)}.`,
      explainVisual: { type: 'placeChart', n, places: P },
    };
  }
  const d = digitsOf(n);
  const candidates: number[] = [];
  // تبديل رقمين متجاورين
  for (let i = 0; i < d.length - 1; i++) {
    const c = [...d];
    [c[i], c[i + 1]] = [c[i + 1], c[i]];
    if (c[c.length - 1] !== 0) candidates.push(Number([...c].reverse().join('')));
  }
  // تغيير رقم واحد
  for (let i = 0; i < d.length; i++) {
    const c = [...d];
    c[i] = (c[i] + randInt(rng, 1, 8)) % 10;
    if (c[c.length - 1] !== 0) candidates.push(Number([...c].reverse().join('')));
  }
  const valid = candidates.filter((x) => hasUnambiguousWords(x) && x !== n);
  const { options, answer } = buildOptions(rng, n, valid, 3, String, (x) => ({ label: toArabicWords(x) }));
  return {
    kind: 'choice',
    skill: 'pv-read',
    story: 'نريد أن نكتب رقم المبنى الجديد بالحروف على لوحته.',
    prompt: `اختاري الصيغة اللفظية الصحيحة للعدد ${fmt(n)}`,
    options,
    answer,
    hint: 'اقرئي الأرقام التي في منازل الآلاف أولًا ثم قولي «ألف»، ثم اقرئي المئات والعشرات والآحاد.',
    hintVisual: { type: 'placeChart', n, places: P },
    explain: `${fmt(n)} يُقرأ: «${words}».`,
  };
}

/** عدد فيه صفر واحد على الأقل في منزلة داخلية */
function numberWithInnerZero(rng: Rng, P: number): number {
  const d = Array.from({ length: P }, () => randInt(rng, 1, 9));
  const z = randInt(rng, 0, P - 2);
  d[z] = 0;
  return Number([...d].reverse().join(''));
}

function pvForms(rng: Rng): Question {
  const P = housesDigits(rng);
  const form = randInt(rng, 0, 2);
  const n = numberWithInnerZero(rng, P);
  const parts = expandedParts(n);
  const base = {
    skill: 'pv-forms' as SkillId,
    story: 'في مكتب تخطيط الحي نكتب الأعداد بصور مختلفة.',
    explainVisual: { type: 'placeChart', n, places: P } as Visual,
  };
  if (form === 0) {
    // من التحليلية إلى القياسية
    const d = digitsOf(n);
    const compact = Number(d.filter((x) => x !== 0).reverse().join(''));
    const shifted: number[] = [];
    for (let i = 0; i < d.length - 1; i++) {
      if (d[i] === 0 || d[i + 1] === 0) {
        const c = [...d];
        [c[i], c[i + 1]] = [c[i + 1], c[i]];
        if (c[c.length - 1] !== 0) shifted.push(Number([...c].reverse().join('')));
      }
    }
    const { options, answer } = numberOptions(rng, n, [compact, n * 10, ...shifted, n + 10 ** randInt(rng, 0, P - 1)]);
    return {
      ...base,
      kind: 'choice',
      prompt: 'ما الصورة القياسية لهذا العدد؟',
      visual: { type: 'expr', tokens: expandedTokens(n) },
      options,
      answer,
      hint: 'انتبهي للمنزلة التي لا يظهر لها جزء في الصورة التحليلية؛ نكتب فيها صفرًا.',
      explain: `الصورة القياسية هي ${fmt(n)}، والصفر يحفظ المنزلة الفارغة.`,
    };
  }
  if (form === 1) {
    // من القياسية إلى التحليلية
    const d = digitsOf(n);
    const nonzero = d
      .map((x, i) => ({ x, i }))
      .filter((o) => o.x !== 0)
      .reverse();
    // خطأ شائع: تجاهل الصفر فتنزاح المنازل
    const ignoringZero = nonzero.map((o, k) => o.x * 10 ** (nonzero.length - 1 - k));
    const extraZero = parts.map((p, k) => (k === 0 ? p * 10 : p));
    const fewerZero = parts.map((p, k) => (k === 0 ? p / 10 : p));
    const candidates = [ignoringZero, extraZero, fewerZero].filter(
      (arr) => arr.reduce((s, x) => s + x, 0) !== n && arr.every((x) => Number.isInteger(x)),
    );
    const { options, answer } = buildOptions(
      rng,
      parts,
      candidates,
      Math.min(4, candidates.length + 1),
      (arr) => arr.join('+'),
      (arr) => ({ label: onesFirst(arr).map((x) => fmt(x)).join(' + '), tokens: joinWith(onesFirst(arr), '+') }),
    );
    return {
      ...base,
      kind: 'choice',
      prompt: `ما الصورة التحليلية للعدد ${fmt(n)}؟`,
      options,
      answer,
      hint: 'اكتبي قيمة كل رقم في منزلته، ولا تكتبي جزءًا للمنزلة التي فيها صفر.',
      explain: `قيمة كل رقم: ${describePlaces(n)}، فنجمع قيمها.`,
    };
  }
  // جزء مفقود في الصورة التحليلية
  const shown = onesFirst(parts);
  // لا نُخفي أكبر جزء (آخر جزء يسارًا)
  const missingPart = shown[randInt(rng, 0, shown.length - 2)];
  const missing = parts.indexOf(missingPart);
  const tokens: Token[] = [num(n), op('=')];
  shown.forEach((p, k) => {
    if (k > 0) tokens.push(op('+'));
    tokens.push(p === missingPart ? blank : num(p));
  });
  return {
    ...base,
    kind: 'number',
    prompt: 'ما الجزء المفقود في الصورة التحليلية؟',
    tokens,
    answer: parts[missing],
    hint: 'حدّدي الرقم الذي لم تُكتب قيمته بعد، ثم حدّدي منزلته.',
    explain: `الجزء المفقود هو ${fmt(parts[missing])}.`,
    explainVisual: {
      type: 'group',
      items: [
        { type: 'expr', tokens: tokens.map((t) => (t.t === 'blank' ? num(parts[missing]) : t)) },
        { type: 'placeChart', n, places: P },
      ],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  ب. محطة الأعداد — المقارنة والترتيب                               */
/* ------------------------------------------------------------------ */

function digitsLen(n: number) {
  return String(n).length;
}

function stationNumber(rng: Rng): number {
  const { min, max } = settings.station;
  const P = randInt(rng, digitsLen(min), digitsLen(max));
  return Math.min(max, Math.max(min, numberWithDigits(rng, P)));
}

function comparePair(rng: Rng): [number, number] {
  const { min, max } = settings.station;
  const a = stationNumber(rng);
  const r = rng();
  if (r < 0.12) return [a, a];
  if (r < 0.8) {
    // العدد نفسه مع اختلاف من منزلة معينة
    const d = digitsOf(a);
    for (let k = 0; k < 50; k++) {
      const i = randInt(rng, 0, d.length - 1);
      const c = [...d];
      c[i] = (c[i] + randInt(rng, 1, 9)) % 10;
      for (let j = 0; j < i; j++) c[j] = randInt(rng, 0, 9);
      const b = Number([...c].reverse().join(''));
      if (c[c.length - 1] !== 0 && b !== a && b >= min && b <= max) return [a, b];
    }
  }
  let b = stationNumber(rng);
  while (b === a) b = stationNumber(rng);
  return [a, b];
}

function cmpCompare(rng: Rng): Question {
  const [a, b] = comparePair(rng);
  const answer: '>' | '<' | '=' = a > b ? '>' : a < b ? '<' : '=';
  const place = firstDifferentPlace(a, b);
  const relation = answer === '>' ? 'أكبر من' : answer === '<' ? 'أصغر من' : 'يساوي';
  let hint: string;
  let explain: string;
  if (digitsLen(a) !== digitsLen(b)) {
    hint = 'عدّي منازل كل عدد. العدد الذي له منازل أكثر هو الأكبر.';
    explain = `العدد ${fmt(Math.max(a, b))} له منازل أكثر، لذلك ${fmt(a)} ${relation} ${fmt(b)}.`;
  } else if (place === -1) {
    hint = 'قارني الرقمين في كل منزلة، من أكبر منزلة إلى الآحاد. هل وجدتِ أي اختلاف؟';
    explain = `جميع الأرقام متساوية في كل المنازل، لذلك ${fmt(a)} يساوي ${fmt(b)}.`;
  } else {
    const da = digitsOf(a)[place];
    const db = digitsOf(b)[place];
    hint = `ابدئي من أكبر منزلة. أول منزلة مختلفة هي منزلة ${placeName(place)}؛ قارني الرقمين فيها.`;
    explain = `أول منزلة مختلفة هي ${placeName(place)}: الرقم ${fmt(da)} ${da > db ? 'أكبر من' : 'أصغر من'} الرقم ${fmt(db)}، لذلك ${fmt(a)} ${relation} ${fmt(b)}.`;
  }
  return {
    kind: 'compare',
    skill: 'cmp-compare',
    story: 'قطاران يصلان إلى المحطة، وعلى كل قطار عدد ركاب. أي القطارين يحمل ركابًا أكثر؟',
    prompt: 'اختاري العلامة المناسبة بين العددين',
    a,
    b,
    answer,
    hint,
    hintVisual: { type: 'compare', a, b, highlightPlace: place >= 0 ? place : undefined },
    explain,
    explainVisual: { type: 'compare', a, b, sign: answer, highlightPlace: place >= 0 ? place : undefined },
  };
}

function cmpOrder(rng: Rng): Question {
  const { min, max, trainCars } = settings.station;
  const P = randInt(rng, digitsLen(min), digitsLen(max));
  const sameLead = rng() < 0.7;
  const lead = randInt(rng, 1, 9);
  const items = new Set<number>();
  let guard = 0;
  while (items.size < trainCars && guard++ < 500) {
    const n = sameLead
      ? lead * 10 ** (P - 1) + randInt(rng, 0, 10 ** (P - 1) - 1)
      : numberWithDigits(rng, P);
    if (n >= min && n <= max) items.add(n);
  }
  const direction = rng() < 0.5 ? 'asc' : 'desc';
  const sorted = [...items].sort((x, y) => (direction === 'asc' ? x - y : y - x));
  return {
    kind: 'order',
    skill: 'cmp-order',
    story: 'نريد ترتيب عربات قطار المدينة بحسب أرقامها قبل انطلاقه.',
    prompt:
      direction === 'asc'
        ? 'رتّبي العربات تصاعديًا: من الأصغر إلى الأكبر، تبدأ من العربة ١'
        : 'رتّبي العربات تنازليًا: من الأكبر إلى الأصغر، تبدأ من العربة ١',
    items: shuffle(rng, [...items]),
    direction,
    hint: 'قارني أرقام أكبر منزلة أولًا، فإذا تساوت انتقلي إلى المنزلة التي تليها.',
    explain: `الترتيب الصحيح: ${sorted.map((x) => fmt(x)).join('، ثم ')}.`,
  };
}

/* ------------------------------------------------------------------ */
/*  ج. حديقة التقريب                                                  */
/* ------------------------------------------------------------------ */

function roundNumber(rng: Rng, p: number): number {
  const { min, max } = settings.garden;
  const lo = Math.max(min, p + 1);
  const hi = Math.max(lo + p, Math.min(max, p * 100 - 1));
  if (rng() < 0.15) {
    const low = Math.floor(randInt(rng, lo, hi) / p) * p;
    return low + p / 2;
  }
  for (let k = 0; k < 100; k++) {
    const n = randInt(rng, lo, hi);
    if (n % p !== 0) return n;
  }
  return lo + 1;
}

function roundingQuestion(rng: Rng, p: number): Question {
  const n = roundNumber(rng, p);
  const { low, high, mid } = roundingBounds(n, p);
  const ans = roundTo(n, p);
  const skill = `round-${p}` as SkillId;
  const atMid = n === mid;
  const explain = atMid
    ? `${fmt(n)} يقع على نقطة المنتصف تمامًا، والقاعدة أن نقرّبه إلى العدد الأكبر: ${fmt(high)}.`
    : n > mid
      ? `${fmt(n)} أكبر من نقطة المنتصف ${fmt(mid)}، فهو أقرب إلى ${fmt(high)}.`
      : `${fmt(n)} أصغر من نقطة المنتصف ${fmt(mid)}، فهو أقرب إلى ${fmt(low)}.`;
  const base = {
    skill,
    story: 'نزرع شجرة عند أقرب علامة على ممر الحديقة.',
    prompt: `قرّبي العدد ${fmt(n)} إلى أقرب ${placeWord(p)}`,
    visual: { type: 'numberLine', n, low, high } as Visual,
    hint: `${fmt(n)} يقع بين ${fmt(low)} و${fmt(high)}، ونقطة المنتصف ${fmt(mid)}. هل العدد أصغر من نقطة المنتصف، أم يساويها أو أكبر منها؟`,
    explain,
    explainVisual: { type: 'numberLine', n, low, high, reveal: true } as Visual,
  };
  if (rng() < 0.6) {
    const others = settings.garden.roundTo.filter((q) => q !== p && n > q).map((q) => roundTo(n, q));
    const extra = [ans === low ? low - p : high + p];
    const distract = [low, high, ...others, ...extra].filter((x) => x !== ans && x >= 0);
    // نبقي الطرفين دائمًا ضمن الخيارات
    const must = [low, high].filter((x) => x !== ans);
    const rest = distract.filter((x) => !must.includes(x));
    const { options, answer } = buildOptions(rng, ans, [...must, ...rest.slice(0, 1)], 3, String, (x) => ({
      label: fmt(x),
    }));
    return { ...base, kind: 'choice', options, answer };
  }
  return { ...base, kind: 'number', answer: ans };
}

/* ------------------------------------------------------------------ */
/*  د. سوق المدينة — الجمع والطرح                                     */
/* ------------------------------------------------------------------ */

const SHOP: { name: string; icon: string; min: number; max: number }[] = [
  { name: 'حقيبة مدرسية', icon: '🎒', min: 45, max: 185 },
  { name: 'آلة حاسبة', icon: '🧮', min: 25, max: 95 },
  { name: 'كرة قدم', icon: '⚽', min: 35, max: 125 },
  { name: 'علبة ألوان', icon: '🖍️', min: 15, max: 65 },
  { name: 'قاموس', icon: '📘', min: 40, max: 150 },
  { name: 'كرسي', icon: '🪑', min: 90, max: 265 },
  { name: 'مجسم الكرة الأرضية', icon: '🌍', min: 60, max: 245 },
  { name: 'مجهر', icon: '🔬', min: 180, max: 950 },
  { name: 'تلسكوب', icon: '🔭', min: 300, max: 950 },
  { name: 'طابعة', icon: '🖨️', min: 250, max: 890 },
  { name: 'ساعة حائط', icon: '🕰️', min: 30, max: 115 },
  { name: 'مصباح مكتب', icon: '💡', min: 40, max: 145 },
  { name: 'مجموعة كتب قصص', icon: '📚', min: 75, max: 320 },
];

function shopItems(rng: Rng, count: number): ShopItem[] {
  return shuffle(rng, SHOP)
    .slice(0, count)
    .map((it) => ({
      name: it.name,
      icon: it.icon,
      price: randInt(rng, it.min, Math.min(it.max, settings.market.maxItemPrice)),
    }));
}

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

function addTotal(rng: Rng): Question {
  let items = shopItems(rng, randInt(rng, 2, 3));
  for (let k = 0; k < 30 && !hasCarry(items.map((i) => i.price)); k++) items = shopItems(rng, items.length);
  const prices = items.map((i) => i.price);
  const total = sum(prices);
  return {
    kind: 'number',
    skill: 'add-total',
    story: 'تجهّز معلمة المدينة فصلًا جديدًا، واشترت هذه الأشياء من السوق.',
    prompt: 'ما مجموع أسعار هذه المشتريات؟',
    visual: { type: 'receipt', items },
    answer: total,
    unit: 'ريال',
    hint: 'اكتبي الأسعار بعضها تحت بعض بمحاذاة المنازل، واجمعي من الآحاد. إذا زاد مجموع منزلة على ٩ فأعيدي التجميع.',
    hintVisual: { type: 'column', op: '+', operands: prices, stage: 'problem' },
    stepVisual: { type: 'column', op: '+', operands: prices, stage: 'regroup' },
    explain: `مجموع المشتريات ${countPhrase(total, 'riyal')}.`,
    explainVisual: { type: 'column', op: '+', operands: prices, stage: 'solved' },
  };
}

function subChange(rng: Rng): Question {
  const items = shopItems(rng, randInt(rng, 2, 3));
  const prices = items.map((i) => i.price);
  const total = sum(prices);
  const budgets = [500, 1000, 1500, 2000, 2500, 3000].filter((b) => b > total + 20);
  const budget = budgets.length ? pick(rng, budgets.slice(0, 3)) : Math.ceil((total + 100) / 500) * 500;
  const rest = budget - total;
  return {
    kind: 'number',
    skill: 'sub-change',
    story: `معكِ ميزانية ${countPhrase(budget, 'riyal')} لشراء أدوات لمكتبة المدينة.`,
    prompt: 'كم ريالًا يتبقى بعد شراء هذه الأشياء؟',
    visual: { type: 'receipt', items, budget },
    answer: rest,
    unit: 'ريال',
    hint: 'احسبي مجموع المشتريات أولًا، ثم اطرحيه من الميزانية.',
    hintVisual: { type: 'column', op: '+', operands: prices, stage: 'solved' },
    stepVisual: { type: 'column', op: '−', operands: [budget, total], stage: 'regroup' },
    explain: `مجموع المشتريات ${countPhrase(total, 'riyal')}، وبطرحه من الميزانية يتبقى ${countPhrase(rest, 'riyal')}.`,
    explainVisual: { type: 'column', op: '−', operands: [budget, total], stage: 'solved' },
  };
}

function budgetEnough(rng: Rng): Question {
  const items = shopItems(rng, randInt(rng, 2, 3));
  const prices = items.map((i) => i.price);
  const total = sum(prices);
  let budget = total;
  while (budget === total) {
    const delta = randInt(rng, 10, 90) * (rng() < 0.5 ? -1 : 1);
    budget = Math.max(10, Math.round((total + delta) / 10) * 10);
  }
  const enough = budget >= total;
  return {
    kind: 'choice',
    skill: 'budget-enough',
    story: 'تريد صاحبة المتجر أن تعرف: هل تكفي الميزانية لشراء كل الأشياء؟',
    prompt: `الميزانية ${countPhrase(budget, 'riyal')}. هل تكفي لشراء هذه الأشياء؟`,
    visual: { type: 'receipt', items },
    options: [{ label: 'نعم، الميزانية تكفي' }, { label: 'لا، الميزانية لا تكفي' }],
    answer: enough ? 0 : 1,
    hint: 'اجمعي الأسعار، ثم قارني المجموع بالميزانية.',
    hintVisual: { type: 'column', op: '+', operands: prices, stage: 'problem' },
    explain: enough
      ? `المجموع ${countPhrase(total, 'riyal')}، وهو أصغر من الميزانية ${fmt(budget)}، إذن تكفي ويتبقى ${countPhrase(budget - total, 'riyal')}.`
      : `المجموع ${countPhrase(total, 'riyal')}، وهو أكبر من الميزانية ${fmt(budget)}، إذن لا تكفي وينقص ${countPhrase(total - budget, 'riyal')}.`,
    explainVisual: { type: 'compare', a: total, b: budget, sign: total > budget ? '>' : '<' },
  };
}

function operand(rng: Rng, minDigits = 3): number {
  const maxD = digitsLen(settings.market.maxOperand);
  return Math.min(settings.market.maxOperand, numberWithDigits(rng, randInt(rng, minDigits, maxD)));
}

function addRegroup(rng: Rng): Question {
  let a = operand(rng);
  let b = operand(rng);
  for (let k = 0; k < 50 && !hasCarry([a, b]); k++) {
    a = operand(rng);
    b = operand(rng);
  }
  return columnQuestion('add-regroup', '+', [a, b], 'يجمع عمال السوق صناديق الفاكهة التي وصلت اليوم.');
}

function subRegroup(rng: Rng): Question {
  for (let k = 0; k < 200; k++) {
    const a = operand(rng, 3);
    const b = operand(rng, 3);
    if (a - b >= 100 && needsBorrow(a, b) && !digitsOf(a).includes(0)) {
      return columnQuestion('sub-regroup', '−', [a, b], 'باع السوق جزءًا من البضاعة، فكم بقي في المخزن؟');
    }
  }
  return columnQuestion('sub-regroup', '−', [742, 368], 'باع السوق جزءًا من البضاعة، فكم بقي في المخزن؟');
}

function subZeros(rng: Rng): Question {
  for (let k = 0; k < 300; k++) {
    const D = randInt(rng, 3, digitsLen(settings.market.maxOperand));
    // عدد فيه صفر في العشرات (وأحيانًا في المئات أيضًا)
    const d = Array.from({ length: D }, () => randInt(rng, 1, 9));
    d[1] = 0;
    if (D >= 4 && rng() < 0.5) d[2] = 0;
    if (rng() < 0.4) d[0] = 0;
    const a = Number([...d].reverse().join(''));
    const b = randInt(rng, 10 ** (D - 2), a - 1);
    const reg = subtractionRegroup(a, b);
    if (needsBorrow(a, b) && reg.changed[1] && reg.original[1] === 0) {
      return columnQuestion('sub-zeros', '−', [a, b], 'معكِ مبلغ في صندوق السوق، ودفعتِ منه ثمن البضاعة.');
    }
  }
  return columnQuestion('sub-zeros', '−', [4003, 1268], 'معكِ مبلغ في صندوق السوق، ودفعتِ منه ثمن البضاعة.');
}

function columnQuestion(skill: SkillId, o: '+' | '−', operands: number[], story: string): Question {
  const answer = o === '+' ? sum(operands) : operands[0] - operands[1];
  const hint =
    skill === 'add-regroup'
      ? 'ابدئي من الآحاد. إذا كان مجموع المنزلة ١٠ أو أكثر، فاكتبي الآحاد واحملي ١ إلى المنزلة التالية.'
      : skill === 'sub-zeros'
        ? 'عندما يكون في المنزلة صفر، استلفي من أقرب منزلة غير صفرية؛ فيصبح الصفر ٩ في المنازل التي بينهما.'
        : 'ابدئي من الآحاد. إذا كان الرقم العلوي أصغر من السفلي، فأعيدي التجميع: استلفي ١ من المنزلة التالية (أي ١٠).';
  return {
    kind: 'number',
    skill,
    story,
    prompt: o === '+' ? 'أوجدي ناتج الجمع' : 'أوجدي ناتج الطرح',
    visual: { type: 'column', op: o, operands, stage: 'problem' },
    answer,
    hint,
    stepVisual: { type: 'column', op: o, operands, stage: 'regroup' },
    explain: `الناتج ${fmt(answer)}. ${o === '+' ? 'جمعنا كل منزلة مع حمل ما زاد على ٩.' : 'طرحنا كل منزلة بعد إعادة التجميع عند الحاجة.'}`,
    explainVisual: { type: 'column', op: o, operands, stage: 'solved' },
  };
}

/* ------------------------------------------------------------------ */
/*  هـ. ورشة البناء — التقدير                                         */
/* ------------------------------------------------------------------ */

const MATERIALS = ['الخشب', 'الطلاء', 'الإسمنت', 'الحديد', 'الزجاج', 'البلاط', 'الأبواب', 'النوافذ', 'الإنارة'];

function workshopPair(rng: Rng, p: number, o: '+' | '−'): [number, number] {
  const { min, max } = settings.workshop;
  for (let k = 0; k < 300; k++) {
    let a = randInt(rng, Math.max(min, p), max);
    let b = randInt(rng, Math.max(min, p), max);
    if (o === '−' && a < b) [a, b] = [b, a];
    if (a % p === 0 || b % p === 0 || a === b) continue;
    if (o === '−' && roundTo(a, p) <= roundTo(b, p)) continue;
    return [a, b];
  }
  return o === '+' ? [3456, 2781] : [7812, 3265];
}

function estimateValue(o: '+' | '−', a: number, b: number, p: number) {
  return o === '+' ? roundTo(a, p) + roundTo(b, p) : roundTo(a, p) - roundTo(b, p);
}

function estimateQuestion(rng: Rng, o: '+' | '−'): Question {
  const p = pick(rng, settings.workshop.roundTo);
  const [a, b] = workshopPair(rng, p, o);
  const [m1, m2] = shuffle(rng, MATERIALS);
  const est = estimateValue(o, a, b, p);
  const exact = o === '+' ? a + b : a - b;
  const floorEst =
    o === '+' ? Math.floor(a / p) * p + Math.floor(b / p) * p : Math.floor(a / p) * p - Math.floor(b / p) * p;
  const otherPlaces = [10, 100, 1000].filter((q) => q !== p).map((q) => estimateValue(o, a, b, q));
  const { options, answer } = numberOptions(rng, est, [exact, floorEst, ...otherPlaces, est + p, est - p]);
  return {
    kind: 'choice',
    skill: o === '+' ? 'est-sum' : 'est-diff',
    story:
      o === '+'
        ? `تبني الورشة مبنى جديدًا. تكلفة ${m1} ${countPhrase(a, 'riyal')}، وتكلفة ${m2} ${countPhrase(b, 'riyal')}.`
        : `تكلفة ${m1} ${countPhrase(a, 'riyal')}، وتكلفة ${m2} ${countPhrase(b, 'riyal')}.`,
    prompt:
      o === '+'
        ? `قدّري مجموع التكلفتين بالتقريب إلى أقرب ${placeWord(p)}`
        : `قدّري الفرق بين التكلفتين بالتقريب إلى أقرب ${placeWord(p)}`,
    visual: { type: 'expr', tokens: [num(a), op(o), num(b)] },
    options,
    answer,
    hint: `قرّبي كل عدد إلى أقرب ${placeWord(p)} أولًا؛ مثلًا ${fmt(a)} يصبح ${fmt(roundTo(a, p))}. ثم ${o === '+' ? 'اجمعي' : 'اطرحي'} العددين المقرَّبين.`,
    explain: `${fmt(a)} يُقرَّب إلى ${fmt(roundTo(a, p))}، و${fmt(b)} يُقرَّب إلى ${fmt(roundTo(b, p))}، فيكون التقدير ${fmt(est)}. الناتج الدقيق ${fmt(exact)} قريب منه.`,
    explainVisual: { type: 'estimate', op: o, a, b, place: p, showExact: true },
  };
}

function estExact(rng: Rng): Question {
  const o: '+' | '−' = rng() < 0.5 ? '+' : '−';
  const p = pick(rng, settings.workshop.roundTo);
  const [a, b] = workshopPair(rng, p, o);
  const est = estimateValue(o, a, b, p);
  const exact = o === '+' ? a + b : a - b;
  return {
    kind: 'number',
    skill: 'est-exact',
    story: `قدّرت المهندسة ${o === '+' ? 'مجموع التكلفتين' : 'الفرق بين التكلفتين'} بـ ${countPhrase(est, 'riyal')}، والآن تحتاج الناتج الدقيق لكتابة الفاتورة.`,
    prompt: `احسبي الناتج الدقيق، ثم قارنيه بالتقدير ${fmt(est)}`,
    visual: { type: 'column', op: o, operands: [a, b], stage: 'problem' },
    answer: exact,
    unit: 'ريال',
    hint: 'احسبي عموديًا بدءًا من الآحاد. يجب أن يكون الناتج قريبًا من التقدير؛ فإن كان بعيدًا فراجعي الحساب.',
    stepVisual: { type: 'column', op: o, operands: [a, b], stage: 'regroup' },
    explain: `الناتج الدقيق ${fmt(exact)}، والتقدير ${fmt(est)}؛ الفرق بينهما ${fmt(Math.abs(exact - est))} فقط، فالتقدير ساعدنا على التحقق من معقولية الإجابة.`,
    explainVisual: { type: 'estimate', op: o, a, b, place: p, showExact: true },
  };
}

const WHEN_SCENARIOS: { text: string; exact: boolean; why: string }[] = [
  {
    text: 'هل يكفي مبلغ ١٠٬٠٠٠ ريال لشراء خشب بـ ٣٬١٨٥ ريالًا وطلاء بـ ٢٬٩٤٠ ريالًا؟',
    exact: false,
    why: 'التقدير نحو ٦٬٠٠٠، وهو أقل بكثير من ١٠٬٠٠٠، فلا نحتاج إلى حساب دقيق للإجابة.',
  },
  {
    text: 'كم ريالًا يدفع المقاول بالضبط للمحاسب ثمن الإسمنت والحديد؟',
    exact: true,
    why: 'الدفع يحتاج المبلغ الصحيح تمامًا، فالتقدير هنا لا يكفي.',
  },
  {
    text: 'تريد المهندسة أن تعرف تقريبًا عدد أكياس الرمل اللازمة لسور الحديقة.',
    exact: false,
    why: 'كلمة «تقريبًا» تعني أن التقدير يكفي.',
  },
  {
    text: 'كتابة المبلغ في فاتورة شراء الأبواب.',
    exact: true,
    why: 'الفاتورة تُكتب بالمبلغ الدقيق.',
  },
  {
    text: 'معرفة هل ستكون تكلفة المشروع قريبة من ٥٬٠٠٠ ريال أم من ٨٬٠٠٠ ريال.',
    exact: false,
    why: 'السؤال عن القرب من عدد معيّن، فالتقدير يكفي.',
  },
  {
    text: 'حساب الباقي الذي يعيده البائع للمقاولة بعد الدفع.',
    exact: true,
    why: 'الباقي يجب أن يكون صحيحًا تمامًا حتى لا يضيع أي ريال.',
  },
  {
    text: 'إخبار السكان بعدد الأشجار التي ستُزرع في الحديقة تقريبًا.',
    exact: false,
    why: 'المطلوب عدد تقريبي، فالتقدير مناسب.',
  },
  {
    text: 'تسجيل عدد الطوب المستلَم بالضبط في دفتر المخزن.',
    exact: true,
    why: 'التسجيل في الدفتر يحتاج العدد الدقيق.',
  },
];

function estWhen(rng: Rng): Question {
  const s = pick(rng, WHEN_SCENARIOS);
  return {
    kind: 'choice',
    skill: 'est-when',
    story: 'في ورشة البناء نختار: هل يكفينا التقدير أم نحتاج الناتج الدقيق؟',
    prompt: s.text,
    options: [{ label: 'يكفي التقدير' }, { label: 'نحتاج الناتج الدقيق' }],
    answer: s.exact ? 1 : 0,
    hint: 'إذا كان السؤال عن دفع مبلغ أو تسجيله أو حساب الباقي فنحتاج الدقة. وإذا كان عن «تقريبًا» أو «هل يكفي» فغالبًا يكفي التقدير.',
    explain: s.why,
  };
}

/* ------------------------------------------------------------------ */
/*  و. مركز إحصاء المدينة — البيانات                                  */
/* ------------------------------------------------------------------ */

const PROJECTS: { label: string; icon: string }[] = [
  { label: 'حديقة', icon: '🌳' },
  { label: 'مكتبة', icon: '📚' },
  { label: 'ملعب', icon: '⚽' },
  { label: 'مسبح', icon: '🏊' },
  { label: 'متحف علوم', icon: '🔬' },
  { label: 'مركز فنون', icon: '🎨' },
];

const SURVEY_TITLES = [
  'تصويت سكان الحي الشمالي على المشروع الجديد',
  'تصويت سكان الحي الشرقي على المشروع الجديد',
  'تصويت طالبات مدرسة المدينة على المشروع الجديد',
  'تصويت سكان حي المنازل على المشروع الجديد',
];

export function makeSurvey(rng: Rng, title?: string): { title: string; rows: VoteRow[]; step: number } {
  const { categories, scaleStep, maxVotes } = settings.stats;
  const k = Math.max(3, Math.min(categories, PROJECTS.length));
  const possible = Array.from({ length: Math.floor(maxVotes / scaleStep) }, (_, i) => (i + 1) * scaleStep);
  const values = shuffle(rng, possible).slice(0, k);
  const rows = shuffle(rng, PROJECTS)
    .slice(0, k)
    .map((p, i) => ({ ...p, value: values[i] }));
  return { title: title ?? pick(rng, SURVEY_TITLES), rows, step: scaleStep };
}

function statsQuestion(rng: Rng, skill: SkillId): Question {
  const s = makeSurvey(rng);
  const show: 'table' | 'bars' | 'both' =
    skill === 'data-table' ? 'table' : skill === 'data-bars' ? 'bars' : pick(rng, ['table', 'bars', 'both'] as const);
  const visual: Visual = { type: 'votes', title: s.title, rows: s.rows, show, step: s.step };
  const explainVisual: Visual = { type: 'votes', title: s.title, rows: s.rows, show: 'both', step: s.step };
  const story = 'يختار سكان المدينة مشروعهم الجديد بالتصويت.';
  const byValue = [...s.rows].sort((x, y) => y.value - x.value);

  if (skill === 'data-table' || skill === 'data-bars') {
    const r = pick(rng, s.rows);
    if (skill === 'data-table' && rng() < 0.5) {
      const { options, answer } = buildOptions(
        rng,
        r.label,
        s.rows.map((x) => x.label),
        s.rows.length,
        String,
        (x) => ({ label: x }),
      );
      return {
        kind: 'choice',
        skill,
        story,
        prompt: `أي مشروع حصل على ${countPhrase(r.value, 'vote')}؟`,
        visual,
        options,
        answer,
        hint: `ابحثي في عمود عدد الأصوات عن العدد ${fmt(r.value)}، ثم انظري إلى اسم المشروع في الصف نفسه.`,
        explain: `في الجدول: مشروع «${r.label}» حصل على ${countPhrase(r.value, 'vote')}.`,
        explainVisual,
      };
    }
    return {
      kind: 'number',
      skill,
      story,
      prompt: `كم صوتًا حصل عليه مشروع «${r.label}»؟`,
      visual,
      answer: r.value,
      hint:
        skill === 'data-bars'
          ? `انظري إلى نهاية عمود «${r.label}» ثم اتبعي الخط إلى المحور. كل خط يمثل ${countPhrase(s.step, 'vote')}.`
          : `ابحثي عن صف «${r.label}» في الجدول، ثم اقرئي العدد المقابل له.`,
      explain: `مشروع «${r.label}» حصل على ${countPhrase(r.value, 'vote')}.`,
      explainVisual,
    };
  }
  if (skill === 'data-most-least') {
    const most = rng() < 0.5;
    const target = most ? byValue[0] : byValue[byValue.length - 1];
    const { options, answer } = buildOptions(
      rng,
      target.label,
      s.rows.map((x) => x.label),
      s.rows.length,
      String,
      (x) => ({ label: x }),
    );
    return {
      kind: 'choice',
      skill,
      story,
      prompt: most ? 'أي مشروع حصل على أكثر الأصوات؟' : 'أي مشروع حصل على أقل الأصوات؟',
      visual,
      options,
      answer,
      hint: most ? 'ابحثي عن أطول عمود أو أكبر عدد في الجدول.' : 'ابحثي عن أقصر عمود أو أصغر عدد في الجدول.',
      explain: `مشروع «${target.label}» حصل على ${countPhrase(target.value, 'vote')}، وهو ${most ? 'أكبر' : 'أصغر'} عدد بين المشاريع.`,
      explainVisual,
    };
  }
  if (skill === 'data-diff') {
    const [x, y] = shuffle(rng, s.rows).slice(0, 2).sort((p, q) => q.value - p.value);
    const diff = x.value - y.value;
    return {
      kind: 'number',
      skill,
      story,
      prompt: `كم صوتًا يزيد «${x.label}» على «${y.label}»؟`,
      visual,
      answer: diff,
      hint: 'اقرئي عدد أصوات كل مشروع، ثم اطرحي العدد الأصغر من الأكبر.',
      explain: `«${x.label}» ${countPhrase(x.value, 'vote')}، و«${y.label}» ${countPhrase(y.value, 'vote')}، والفرق بينهما ${countPhrase(diff, 'vote')}.`,
      explainVisual: {
        type: 'group',
        items: [explainVisual, { type: 'expr', tokens: [num(x.value), op('−'), num(y.value), op('='), num(diff)] }],
      },
    };
  }
  // data-total
  const total = sum(s.rows.map((r) => r.value));
  return {
    kind: 'number',
    skill: 'data-total',
    story,
    prompt: 'كم عدد جميع المشاركين في التصويت؟ (كل مشارك صوّت مرة واحدة)',
    visual,
    answer: total,
    hint: 'اجمعي أصوات جميع المشاريع.',
    explain: `مجموع الأصوات ${fmt(total)}، إذن عدد المشاركين ${fmt(total)}.`,
    explainVisual: {
      type: 'group',
      items: [
        explainVisual,
        { type: 'expr', tokens: [...joinWith(s.rows.map((r) => r.value), '+'), op('='), num(total)] },
      ],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  ز. ممشى الأنماط — الأنماط والجمل العددية                          */
/* ------------------------------------------------------------------ */

function ruleText(step: number, add: boolean) {
  return add ? `أضيفي ${fmt(step)} في كل مرة` : `اطرحي ${fmt(step)} في كل مرة`;
}

function makePattern(rng: Rng, length: number) {
  const step = pick(rng, settings.walkway.steps);
  const add = rng() < 0.65;
  const maxStart = settings.walkway.maxStart;
  let start: number;
  if (add) start = randInt(rng, 0, maxStart);
  else start = randInt(rng, step * (length + 1), Math.max(step * (length + 1), maxStart) + step * length);
  // بداية من مضاعفات الخطوة الكبيرة تجعل النمط أوضح
  if (step >= 10 && rng() < 0.6) start = Math.round(start / step) * step;
  const seq = Array.from({ length }, (_, i) => start + (add ? 1 : -1) * step * i);
  return { step, add, seq };
}

function patNext(rng: Rng): Question {
  const { step, add, seq } = makePattern(rng, 6);
  const shown = seq.slice(0, 5);
  const theme = rng() < 0.5 ? 'flowers' : 'tiles';
  return {
    kind: 'number',
    skill: 'pat-next',
    story: theme === 'flowers' ? 'نزرع زهور الممشى بحسب نمط عددي.' : 'نرصف بلاط الشارع بحسب نمط عددي.',
    prompt: 'ما العدد التالي في النمط؟',
    visual: { type: 'pattern', seq: [...shown, null], theme },
    answer: seq[5],
    hint: 'كم يزيد أو ينقص كل عدد عن العدد الذي قبله؟ هل الفرق نفسه في كل مرة؟',
    explain: `القاعدة: ${ruleText(step, add)}، لذلك العدد التالي ${fmt(seq[5])}.`,
    explainVisual: { type: 'pattern', seq, theme },
  };
}

function patRule(rng: Rng): Question {
  const { step, add, seq } = makePattern(rng, 5);
  const otherSteps = settings.walkway.steps.filter((s) => s !== step);
  const candidates = [
    { s: step, a: !add },
    ...shuffle(rng, otherSteps)
      .slice(0, 3)
      .map((s) => ({ s, a: add })),
  ];
  const { options, answer } = buildOptions(
    rng,
    { s: step, a: add },
    candidates,
    4,
    (x) => `${x.s}${x.a}`,
    (x) => ({ label: ruleText(x.s, x.a) }),
  );
  return {
    kind: 'choice',
    skill: 'pat-rule',
    story: 'كتب مهندس الممشى قاعدة البلاط، لكن اللوحة سقطت!',
    prompt: 'ما قاعدة هذا النمط؟',
    visual: { type: 'pattern', seq, theme: 'tiles' },
    options,
    answer,
    hint: 'اطرحي كل عددين متتاليين: هل الأعداد تزيد أم تنقص؟ وبكم؟',
    explain: `كل عدد ${add ? 'يزيد' : 'ينقص'} ${fmt(step)} عن الذي قبله، فالقاعدة: ${ruleText(step, add)}.`,
  };
}

function patMissing(rng: Rng): Question {
  const { step, add, seq } = makePattern(rng, 6);
  const hole = randInt(rng, 1, 4);
  const shown = seq.map((v, i) => (i === hole ? null : v));
  return {
    kind: 'number',
    skill: 'pat-missing',
    story: 'سقطت زهرة من الممشى! ما العدد الذي كان مكتوبًا عليها؟',
    prompt: 'ما العدد المفقود في النمط؟',
    visual: { type: 'pattern', seq: shown, theme: 'flowers' },
    answer: seq[hole],
    hint: 'اكتشفي القاعدة من عددين متجاورين ظاهرين، ثم طبّقيها على المكان الفارغ.',
    explain: `القاعدة: ${ruleText(step, add)}، فالعدد المفقود ${fmt(seq[hole])}.`,
    explainVisual: { type: 'pattern', seq, theme: 'flowers' },
  };
}

function numSentence(rng: Rng): Question {
  const M = settings.walkway.sentenceMax;
  const form = randInt(rng, 0, 3);
  const a = randInt(rng, 10, Math.floor(M / 2));
  const b = randInt(rng, 10, Math.floor(M / 2));
  const c = a + b;
  let tokens: Token[];
  let answer: number;
  let full: Token[];
  let hint: string;
  if (form === 0) {
    tokens = [num(a), op('+'), blank, op('='), num(c)];
    answer = b;
    full = [num(a), op('+'), num(b), op('='), num(c)];
    hint = `ما العدد الذي إذا أضفناه إلى ${fmt(a)} صار ${fmt(c)}؟ لإيجاده اطرحي ${fmt(a)} من ${fmt(c)}.`;
  } else if (form === 1) {
    tokens = [blank, op('+'), num(b), op('='), num(c)];
    answer = a;
    full = [num(a), op('+'), num(b), op('='), num(c)];
    hint = `لإيجاد الجزء المفقود في الجمع، اطرحي الجزء المعروف ${fmt(b)} من الناتج ${fmt(c)}.`;
  } else if (form === 2) {
    tokens = [num(c), op('−'), blank, op('='), num(a)];
    answer = b;
    full = [num(c), op('−'), num(b), op('='), num(a)];
    hint = `ما العدد الذي إذا طرحناه من ${fmt(c)} بقي ${fmt(a)}؟ اطرحي ${fmt(a)} من ${fmt(c)}.`;
  } else {
    tokens = [blank, op('−'), num(b), op('='), num(a)];
    answer = c;
    full = [num(c), op('−'), num(b), op('='), num(a)];
    hint = `العدد المفقود هو الكل قبل الطرح: اجمعي ${fmt(b)} و${fmt(a)}.`;
  }
  return {
    kind: 'number',
    skill: 'num-sentence',
    story: 'على بلاطة في الممشى جملة عددية ينقصها عدد.',
    prompt: 'ما العدد المناسب في المربع؟',
    tokens,
    answer,
    hint,
    explain: `العدد المناسب ${fmt(answer)}، ويمكن التحقق بالتعويض في الجملة.`,
    explainVisual: { type: 'expr', tokens: full },
  };
}

/* ------------------------------------------------------------------ */
/*  ح. مزرعة المدينة — الضرب                                          */
/* ------------------------------------------------------------------ */

function factors(rng: Rng, maxRows?: number): [number, number] {
  const { minFactor, maxFactor } = settings.farm;
  return [randInt(rng, minFactor, Math.min(maxRows ?? maxFactor, maxFactor)), randInt(rng, minFactor, maxFactor)];
}

function repeated(v: number, times: number): Token[] {
  return joinWith(Array.from({ length: times }, () => v), '+');
}

function mulArray(rng: Rng): Question {
  const [r, c] = factors(rng);
  return {
    kind: 'number',
    skill: 'mul-array',
    story: 'زرع المزارعون أشجار النخيل في صفوف متساوية.',
    prompt: `في المزرعة ${countPhrase(r, 'row')}، وفي كل صف ${countPhrase(c, 'tree')}. كم شجرة في المزرعة؟`,
    visual: { type: 'array', rows: r, cols: c },
    answer: r * c,
    hint: `عدد الأشجار في صف واحد ${fmt(c)}. اجمعي ${fmt(c)} بعدد الصفوف، أو اضربي عدد الصفوف في عدد الأشجار في كل صف.`,
    stepVisual: { type: 'array', rows: r, cols: c, groupRows: true },
    explain: `${countPhrase(r, 'row')} في كل منها ${countPhrase(c, 'tree')}، فعدد الأشجار ${fmt(r * c)}.`,
    explainVisual: {
      type: 'group',
      items: [
        { type: 'expr', tokens: [...repeated(c, r), op('='), num(r * c)] },
        { type: 'expr', tokens: [num(r), op('×'), num(c), op('='), num(r * c)] },
      ],
    },
  };
}

function mulRepeated(rng: Rng): Question {
  const [r, c] = factors(rng, 5);
  const correct = { v: c, t: r };
  const candidates = [
    { v: c, t: r + 1 },
    { v: c, t: Math.max(1, r - 1) },
    { v: c + 1, t: r },
    { v: Math.max(1, c - 1), t: r },
  ].filter((x) => x.v * x.t !== r * c && x.t >= 2 && x.v >= 2);
  const { options, answer } = buildOptions(
    rng,
    correct,
    candidates,
    4,
    (x) => `${x.v}x${x.t}`,
    (x) => ({ label: Array.from({ length: x.t }, () => fmt(x.v)).join(' + '), tokens: repeated(x.v, x.t) }),
  );
  return {
    kind: 'choice',
    skill: 'mul-repeated',
    story: 'نريد كتابة عدد أشجار المزرعة بجملة جمع متكرر.',
    prompt: `${countPhrase(r, 'row')}، في كل صف ${countPhrase(c, 'tree')}. أي جملة جمع متكرر تمثل الصفوف؟`,
    visual: { type: 'array', rows: r, cols: c },
    options,
    answer,
    hint: `كل صف فيه ${fmt(c)}، فنكرر العدد ${fmt(c)} بعدد الصفوف.`,
    stepVisual: { type: 'array', rows: r, cols: c, groupRows: true },
    explain: `نكرر ${fmt(c)} بعدد الصفوف (${fmt(r)})، والمجموع ${fmt(r * c)}، وهو يساوي ناتج الضرب.`,
    explainVisual: { type: 'expr', tokens: [...repeated(c, r), op('='), num(r * c)] },
  };
}

function mulFact(rng: Rng): Question {
  const [r, c] = factors(rng);
  return {
    kind: 'number',
    skill: 'mul-fact',
    story: 'تعبئ المزرعة صناديق التمر في صفوف متساوية.',
    prompt: 'أوجدي ناتج الضرب',
    tokens: [num(r), op('×'), num(c), op('='), blank],
    answer: r * c,
    hint: `تخيّلي ${countPhrase(r, 'row')} في كل منها ${fmt(c)}، واجمعي.`,
    hintVisual: { type: 'array', rows: r, cols: c, groupRows: true },
    explain: `الناتج ${fmt(r * c)}.`,
    explainVisual: { type: 'expr', tokens: [num(r), op('×'), num(c), op('='), num(r * c)] },
  };
}

/* ------------------------------------------------------------------ */
/*  السجل                                                              */
/* ------------------------------------------------------------------ */

export const GENERATORS: Record<SkillId, (rng: Rng) => Question> = {
  'pv-build': pvBuild,
  'pv-digit': pvDigit,
  'pv-read': pvRead,
  'pv-forms': pvForms,
  'cmp-compare': cmpCompare,
  'cmp-order': cmpOrder,
  'round-10': (r) => roundingQuestion(r, 10),
  'round-100': (r) => roundingQuestion(r, 100),
  'round-1000': (r) => roundingQuestion(r, 1000),
  'round-10000': (r) => roundingQuestion(r, 10000),
  'add-total': addTotal,
  'sub-change': subChange,
  'budget-enough': budgetEnough,
  'add-regroup': addRegroup,
  'sub-regroup': subRegroup,
  'sub-zeros': subZeros,
  'est-sum': (r) => estimateQuestion(r, '+'),
  'est-diff': (r) => estimateQuestion(r, '−'),
  'est-exact': estExact,
  'est-when': estWhen,
  'data-table': (r) => statsQuestion(r, 'data-table'),
  'data-bars': (r) => statsQuestion(r, 'data-bars'),
  'data-most-least': (r) => statsQuestion(r, 'data-most-least'),
  'data-diff': (r) => statsQuestion(r, 'data-diff'),
  'data-total': (r) => statsQuestion(r, 'data-total'),
  'pat-next': patNext,
  'pat-rule': patRule,
  'pat-missing': patMissing,
  'num-sentence': numSentence,
  'mul-array': mulArray,
  'mul-repeated': mulRepeated,
  'mul-fact': mulFact,
};

export function generate(skill: SkillId, rng: Rng): Question {
  return GENERATORS[skill](rng);
}

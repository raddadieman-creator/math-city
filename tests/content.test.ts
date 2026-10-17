import { describe, it, expect } from 'vitest';
import { GENERATORS } from '../src/content/generators';
import { buildQuestions, buildMission } from '../src/content/session';
import { DISTRICTS } from '../src/content/districts';
import { createRng } from '../src/lib/random';
import {
  toArabicWords,
  parseNumberInput,
  fmt,
  digitsOf,
  placeName,
  hasUnambiguousWords,
  expandedParts,
} from '../src/lib/numbers';
import { subtractionRegroup, additionCarries, roundTo } from '../src/lib/math';
import { nounFor } from '../src/lib/arabic';
import type { Question, Token, Visual } from '../src/content/types';
import { settings } from '../src/config/settings';

const N = 600;

/** تقييم تعبير بسيط من اليسار إلى اليمين منطقيًا (ترتيب الرموز) */
function evalSide(tokens: Token[]): number {
  let acc = 0;
  let pending: '+' | '−' | '×' = '+';
  // الضرب أولًا غير مطلوب في أسئلتنا (لا تختلط العمليات)
  for (const t of tokens) {
    if (t.t === 'num') {
      if (pending === '+') acc += t.v;
      else if (pending === '−') acc -= t.v;
      else acc *= t.v;
    } else if (t.t === 'op' && t.v !== '=') pending = t.v;
  }
  return acc;
}

function equationHolds(tokens: Token[]): boolean {
  const sides: Token[][] = [[]];
  for (const t of tokens) {
    if (t.t === 'op' && t.v === '=') sides.push([]);
    else sides[sides.length - 1].push(t);
  }
  const vals = sides.map(evalSide);
  return vals.every((v) => v === vals[0]);
}

function fill(tokens: Token[], v: number): Token[] {
  return tokens.map((t) => (t.t === 'blank' ? { t: 'num', v } : t));
}

function numericLabel(label: string): number | null {
  return parseNumberInput(label);
}

function independentRound(n: number, p: number) {
  return Math.floor(n / p + 0.5) * p;
}

function expected(q: Question): number | null {
  const v = q.visual as Visual | undefined;
  switch (q.skill) {
    case 'add-total':
      if (v?.type === 'receipt') return v.items.reduce((s, i) => s + i.price, 0);
      return null;
    case 'sub-change':
      if (v?.type === 'receipt') return v.budget! - v.items.reduce((s, i) => s + i.price, 0);
      return null;
    case 'add-regroup':
    case 'sub-regroup':
    case 'sub-zeros':
    case 'est-exact':
      if (v?.type === 'column') return v.op === '+' ? v.operands[0] + v.operands[1] : v.operands[0] - v.operands[1];
      return null;
    case 'round-10':
    case 'round-100':
    case 'round-1000':
    case 'round-10000':
      if (v?.type === 'numberLine') return independentRound(v.n, v.high - v.low);
      return null;
    case 'mul-array':
      if (v?.type === 'array') return v.rows * v.cols;
      return null;
    case 'pat-next':
    case 'pat-missing': {
      if (v?.type !== 'pattern') return null;
      const s = v.seq;
      const idx = s.indexOf(null);
      const known = s.map((x, i) => ({ x, i })).filter((o) => o.x !== null) as { x: number; i: number }[];
      const d = (known[1].x - known[0].x) / (known[1].i - known[0].i);
      return known[0].x + d * (idx - known[0].i);
    }
    default:
      return null;
  }
}

describe('الصيغة اللفظية', () => {
  it('أعداد معروفة', () => {
    expect(toArabicWords(35421)).toBe('خمسة وثلاثون ألفًا وأربعمئة وواحد وعشرون');
    expect(toArabicWords(1000)).toBe('ألف');
    expect(toArabicWords(2000)).toBe('ألفان');
    expect(toArabicWords(3000)).toBe('ثلاثة آلاف');
    expect(toArabicWords(10000)).toBe('عشرة آلاف');
    expect(toArabicWords(12000)).toBe('اثنا عشر ألفًا');
    expect(toArabicWords(11005)).toBe('أحد عشر ألفًا وخمسة');
    expect(toArabicWords(100000)).toBe('مئة ألف');
    expect(toArabicWords(200000)).toBe('مئتا ألف');
    expect(toArabicWords(250300)).toBe('مئتان وخمسون ألفًا وثلاثمئة');
    expect(toArabicWords(999999)).toBe('تسعمئة وتسعة وتسعون ألفًا وتسعمئة وتسعة وتسعون');
    expect(toArabicWords(1250000)).toBe('مليون ومئتان وخمسون ألفًا');
    expect(toArabicWords(212)).toBe('مئتان واثنا عشر');
    expect(toArabicWords(7)).toBe('سبعة');
  });
  it('استبعاد الصيغ متعددة القراءة', () => {
    expect(hasUnambiguousWords(305000)).toBe(false);
    expect(hasUnambiguousWords(101000)).toBe(false);
    expect(hasUnambiguousWords(325000)).toBe(true);
    expect(hasUnambiguousWords(45000)).toBe(true);
  });
});

describe('الأرقام والإدخال', () => {
  it('قراءة الأرقام العربية والإنجليزية', () => {
    expect(parseNumberInput('٣٥٬٤٢١')).toBe(35421);
    expect(parseNumberInput('35,421')).toBe(35421);
    expect(parseNumberInput(' ۳۵ ')).toBe(35);
    expect(parseNumberInput('٣5٤')).toBe(354);
    expect(parseNumberInput('abc')).toBeNull();
    expect(parseNumberInput('')).toBeNull();
    expect(parseNumberInput('3.5')).toBeNull();
  });
  it('العرض بأرقام عربية', () => {
    expect(fmt(35421)).toBe('٣٥٬٤٢١');
    expect(fmt(999)).toBe('٩٩٩');
    expect(fmt(1000000)).toBe('١٬٠٠٠٬٠٠٠');
  });
  it('المعدود', () => {
    expect(nounFor(5, 'riyal')).toBe('ريالات');
    expect(nounFor(25, 'riyal')).toBe('ريالًا');
    expect(nounFor(100, 'riyal')).toBe('ريال');
    expect(nounFor(1500, 'riyal')).toBe('ريال');
    expect(nounFor(1205, 'riyal')).toBe('ريالات');
  });
});

describe('إعادة التجميع والتقريب', () => {
  it('الطرح بوجود الأصفار', () => {
    const r = subtractionRegroup(4003, 1268);
    expect(r.working).toEqual([13, 9, 9, 3]);
    expect(r.changed).toEqual([true, true, true, true]);
  });
  it('الطرح دون حاجة لإعادة التجميع', () => {
    expect(subtractionRegroup(987, 123).changed.some(Boolean)).toBe(false);
  });
  it('الحمل في الجمع', () => {
    expect(additionCarries([458, 276])).toEqual([0, 1, 1, 0]);
  });
  it('إعادة التجميع تحفظ قيمة العدد', () => {
    const rng = createRng(7);
    for (let k = 0; k < 2000; k++) {
      const a = Math.floor(rng() * 9000) + 1000;
      const b = Math.floor(rng() * a);
      const r = subtractionRegroup(a, b);
      const value = r.working.reduce((s, d, i) => s + d * 10 ** i, 0);
      expect(value).toBe(a);
      const db = digitsOf(b);
      r.working.forEach((d, i) => expect(d).toBeGreaterThanOrEqual(db[i] ?? 0));
    }
  });
  it('التقريب', () => {
    expect(roundTo(2350, 100)).toBe(2400);
    expect(roundTo(2349, 100)).toBe(2300);
    expect(roundTo(45, 10)).toBe(50);
    expect(roundTo(35421, 1000)).toBe(35000);
  });
});

describe('كل المولّدات', () => {
  for (const [skill, gen] of Object.entries(GENERATORS)) {
    it(`${skill}: أسئلة صحيحة ومتسقة`, () => {
      const rng = createRng(skill.length * 977 + 13);
      for (let k = 0; k < N; k++) {
        const q = gen(rng);
        expect(q.skill).toBe(skill);
        expect(q.prompt.length).toBeGreaterThan(5);
        expect(q.hint.length).toBeGreaterThan(5);
        expect(q.explain.length).toBeGreaterThan(5);
        // لا علامات عمليات داخل النصوص العادية (تُعرض في التعبيرات فقط)
        for (const text of [q.prompt, q.hint, q.explain, q.story ?? '']) {
          expect(text).not.toMatch(/[<>=×÷−]|\d\s*[+-]\s*\d/);
          expect(text).not.toMatch(/undefined|NaN/);
        }

        if (q.kind === 'choice') {
          expect(q.options.length).toBeGreaterThanOrEqual(2);
          const labels = q.options.map((o) => o.label);
          expect(new Set(labels).size).toBe(labels.length);
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(q.options.length);
          // خيارات التعبيرات: إجابة واحدة فقط مجموعها صحيح
          const withTokens = q.options.filter((o) => o.tokens);
          if (withTokens.length === q.options.length) {
            const sums = q.options.map((o) => evalSide(o.tokens!));
            const target = sums[q.answer];
            expect(sums.filter((s) => s === target).length).toBe(1);
          }
          const exp = expected(q);
          if (exp !== null) {
            const nums = labels.map(numericLabel);
            expect(nums[q.answer]).toBe(exp);
            expect(nums.filter((x) => x === exp).length).toBe(1);
          }
        }
        if (q.kind === 'number') {
          expect(Number.isInteger(q.answer)).toBe(true);
          expect(q.answer).toBeGreaterThanOrEqual(0);
          const exp = expected(q);
          if (exp !== null) expect(q.answer).toBe(exp);
          if (q.tokens) {
            expect(q.tokens.filter((t) => t.t === 'blank').length).toBe(1);
            expect(equationHolds(fill(q.tokens, q.answer))).toBe(true);
          }
        }
        if (q.kind === 'compare') {
          const s = q.a > q.b ? '>' : q.a < q.b ? '<' : '=';
          expect(q.answer).toBe(s);
        }
        if (q.kind === 'order') {
          expect(new Set(q.items).size).toBe(q.items.length);
          expect(q.items.length).toBe(settings.station.trainCars);
        }
        if (q.kind === 'build') {
          expect(String(q.target).length).toBe(q.places);
          expect([...q.tiles].sort()).toEqual([...digitsOf(q.target)].sort());
          expect(new Set(q.tiles).size).toBe(q.tiles.length);
        }
      }
    });
  }

  it('قيمة الرقم ومنزلته', () => {
    const rng = createRng(99);
    for (let k = 0; k < N; k++) {
      const q = GENERATORS['pv-digit'](rng);
      if (q.kind !== 'choice' || q.explainVisual?.type !== 'placeChart') throw new Error('shape');
      const { n, highlight } = q.explainVisual;
      const i = highlight!;
      const d = digitsOf(n)[i];
      const correct = q.options[q.answer].label;
      expect([`منزلة ${placeName(i)}`, fmt(d * 10 ** i)]).toContain(correct);
      // الرقم غير مكرر في العدد
      expect(digitsOf(n).filter((x) => x === d).length).toBe(1);
    }
  });

  it('القراءة والكتابة', () => {
    const rng = createRng(5);
    for (let k = 0; k < N; k++) {
      const q = GENERATORS['pv-read'](rng);
      if (q.kind === 'number') expect(q.prompt).toContain(toArabicWords(q.answer));
      if (q.kind === 'choice') {
        const n = parseNumberInput(q.prompt.split(' ').pop()!)!;
        expect(q.options[q.answer].label).toBe(toArabicWords(n));
      }
    }
  });

  it('الصورة التحليلية', () => {
    const rng = createRng(11);
    for (let k = 0; k < N; k++) {
      const q = GENERATORS['pv-forms'](rng);
      if (q.explainVisual?.type !== 'placeChart' && q.explainVisual?.type !== 'group') throw new Error('shape');
      if (q.kind === 'choice' && q.visual?.type === 'expr') {
        const n = evalSide(q.visual.tokens);
        expect(numericLabel(q.options[q.answer].label)).toBe(n);
      }
      if (q.kind === 'choice' && !q.visual) {
        const n = parseNumberInput(q.prompt.replace(/[^\d٠-٩٬]/g, ''))!;
        expect(evalSide(q.options[q.answer].tokens!)).toBe(n);
        expect(q.options[q.answer].tokens!.filter((t) => t.t === 'num').map((t) => (t as { v: number }).v)).toEqual(
          expandedParts(n),
        );
      }
    }
  });

  it('التقدير: الخيار الصحيح هو مجموع أو فرق المقرَّبين', () => {
    const rng = createRng(21);
    for (const skill of ['est-sum', 'est-diff'] as const) {
      for (let k = 0; k < N; k++) {
        const q = GENERATORS[skill](rng);
        if (q.kind !== 'choice' || q.explainVisual?.type !== 'estimate') throw new Error('shape');
        const { a, b, place, op } = q.explainVisual;
        const est =
          op === '+'
            ? independentRound(a, place) + independentRound(b, place)
            : independentRound(a, place) - independentRound(b, place);
        expect(numericLabel(q.options[q.answer].label)).toBe(est);
        expect(est).toBeGreaterThan(0);
      }
    }
  });

  it('البيانات: الإجابة تطابق الجدول والرسم', () => {
    for (const skill of ['data-table', 'data-bars', 'data-most-least', 'data-diff', 'data-total'] as const) {
      const rng = createRng(skill.length * 31);
      for (let k = 0; k < N; k++) {
        const q = GENERATORS[skill](rng);
        if (q.visual?.type !== 'votes') throw new Error('shape');
        const rows = q.visual.rows;
        const values = rows.map((r) => r.value);
        expect(new Set(values).size).toBe(values.length);
        values.forEach((v) => {
          expect(v % settings.stats.scaleStep).toBe(0);
          expect(v).toBeLessThanOrEqual(settings.stats.maxVotes);
          expect(v).toBeGreaterThan(0);
        });
        const label = (s: string) => rows.find((r) => s.includes(`«${r.label}»`));
        if (skill === 'data-total' && q.kind === 'number') expect(q.answer).toBe(values.reduce((s, x) => s + x, 0));
        if (skill === 'data-diff' && q.kind === 'number') {
          const m = [...q.prompt.matchAll(/«([^»]+)»/g)].map((x) => rows.find((r) => r.label === x[1])!);
          expect(q.answer).toBe(m[0].value - m[1].value);
          expect(q.answer).toBeGreaterThan(0);
        }
        if ((skill === 'data-table' || skill === 'data-bars') && q.kind === 'number') {
          expect(q.answer).toBe(label(q.prompt)!.value);
        }
        if (skill === 'data-most-least' && q.kind === 'choice') {
          const most = q.prompt.includes('أكثر');
          const target = most ? Math.max(...values) : Math.min(...values);
          expect(rows.find((r) => r.label === q.options[q.answer].label)!.value).toBe(target);
        }
      }
    }
  });

  it('الجمع المتكرر يمثل الصفوف', () => {
    const rng = createRng(3);
    for (let k = 0; k < N; k++) {
      const q = GENERATORS['mul-repeated'](rng);
      if (q.kind !== 'choice' || q.visual?.type !== 'array') throw new Error('shape');
      const toks = q.options[q.answer].tokens!.filter((t) => t.t === 'num') as { v: number }[];
      expect(toks.length).toBe(q.visual.rows);
      toks.forEach((t) => expect(t.v).toBe(q.visual!.type === 'array' ? q.visual.cols : -1));
    }
  });

  it('الطرح بوجود الأصفار يستلف عبر صفر', () => {
    const rng = createRng(8);
    for (let k = 0; k < N; k++) {
      const q = GENERATORS['sub-zeros'](rng);
      if (q.visual?.type !== 'column') throw new Error('shape');
      const [a, b] = q.visual.operands;
      expect(a).toBeGreaterThan(b);
      expect(digitsOf(a).slice(0, -1)).toContain(0);
    }
  });

  it('التقريب: أسئلة الاختيار تحتوي الطرفين', () => {
    const rng = createRng(4);
    for (let k = 0; k < N; k++) {
      const q = GENERATORS['round-100'](rng);
      if (q.kind !== 'choice' || q.visual?.type !== 'numberLine') continue;
      const nums = q.options.map((o) => numericLabel(o.label));
      expect(nums).toContain(q.visual.low);
      expect(nums).toContain(q.visual.high);
    }
  });
});

describe('الجلسات والمهمة الختامية', () => {
  it('كل حي يولّد مهماته دون تكرار', () => {
    for (const id of Object.keys(DISTRICTS) as (keyof typeof DISTRICTS)[]) {
      const rng = createRng(id.length);
      for (let k = 0; k < 50; k++) {
        const qs = buildQuestions(id, rng, settings.tasksPerDistrict);
        expect(qs.length).toBe(settings.tasksPerDistrict);
        const skills = new Set(qs.map((q) => q.skill));
        expect(skills.size).toBe(Math.min(DISTRICTS[id].skills.length, settings.tasksPerDistrict));
      }
    }
  });
  it('المهمة الختامية', () => {
    const rng = createRng(1);
    for (let k = 0; k < 100; k++) {
      const steps = buildMission(rng);
      expect(steps.length).toBeGreaterThanOrEqual(3);
      expect(steps.map((s) => s.district)).toEqual(['station', 'workshop', 'market', 'stats', 'walkway']);
    }
  });
  it('المهمة الختامية تتكيف مع الدروس المفعّلة', () => {
    const backup = { ...settings.station, ...{} };
    settings.station.enabled = false;
    settings.workshop.enabled = false;
    settings.stats.enabled = false;
    try {
      const steps = buildMission(createRng(2));
      expect(steps.length).toBeGreaterThanOrEqual(3);
      expect(steps.map((s) => s.district)).not.toContain('station');
    } finally {
      settings.station.enabled = backup.enabled;
      settings.workshop.enabled = true;
      settings.stats.enabled = true;
    }
  });
});

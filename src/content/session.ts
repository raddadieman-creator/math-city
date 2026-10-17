import { settings, enabledDistricts, type DistrictId } from '../config/settings';
import { type Rng, shuffle, pick } from '../lib/random';
import { countPhrase } from '../lib/arabic';
import { DISTRICTS } from './districts';
import { generate } from './generators';
import type { Question, SkillId } from './types';

function key(q: Question): string {
  return JSON.stringify([q.prompt, q.visual, (q as { tokens?: unknown }).tokens, (q as { items?: unknown }).items]);
}

/** مجموعة أسئلة لحي: تغطي المهارات بالتناوب، دون تكرار سؤال */
export function buildQuestions(district: DistrictId, rng: Rng, count: number, focus?: SkillId[]): Question[] {
  const skills = focus && focus.length ? focus : DISTRICTS[district].skills;
  const order: SkillId[] = [];
  while (order.length < count) order.push(...shuffle(rng, skills));
  const seen = new Set<string>();
  return order.slice(0, count).map((s) => {
    let q = generate(s, rng);
    for (let k = 0; k < 10 && seen.has(key(q)); k++) q = generate(s, rng);
    seen.add(key(q));
    return q;
  });
}

/* ------------------------------------------------------------------ */
/*  المهمة الختامية: افتتاح حديقة المدينة                              */
/* ------------------------------------------------------------------ */

export interface MissionStep {
  district: DistrictId;
  title: string;
  question: Question;
}

const EQUIPMENT = [
  { label: 'نافورة', icon: '⛲' },
  { label: 'أراجيح', icon: '🎠' },
  { label: 'مقاعد ظليلة', icon: '🪑' },
  { label: 'ممر دراجات', icon: '🚲' },
];

function equipmentVote(rng: Rng): Question {
  const step = settings.stats.scaleStep;
  const possible = Array.from({ length: Math.floor(settings.stats.maxVotes / step) }, (_, i) => (i + 1) * step);
  const values = shuffle(rng, possible).slice(0, EQUIPMENT.length);
  const rows = EQUIPMENT.map((e, i) => ({ ...e, value: values[i] }));
  const top = [...rows].sort((a, b) => b.value - a.value)[0];
  const opts = shuffle(rng, rows);
  return {
    kind: 'choice',
    skill: 'data-most-least',
    story: 'صوّت السكان على التجهيز الذي يريدونه أولًا في الحديقة.',
    prompt: 'أي تجهيز اختاره أكثر السكان؟',
    visual: { type: 'votes', title: 'تصويت السكان على تجهيزات الحديقة', rows, show: 'bars', step },
    options: opts.map((r) => ({ label: r.label })),
    answer: opts.findIndex((r) => r.label === top.label),
    hint: 'ابحثي عن أطول عمود.',
    explain: `«${top.label}» حصل على ${countPhrase(top.value, 'vote')}، وهو أطول عمود؛ لذلك سنبدأ به.`,
    explainVisual: { type: 'votes', title: 'تصويت السكان على تجهيزات الحديقة', rows, show: 'both', step },
  };
}

type StepMaker = { district: DistrictId; title: string; make: (rng: Rng) => Question };

const STORY: StepMaker[] = [
  {
    district: 'station',
    title: 'تجهيز مواقع العمل',
    make: (rng) => ({
      ...generate('cmp-order', rng),
      story: 'وصلت عربات مواد البناء إلى الحديقة، ولكل موقع عمل رقم. رتّبيها لتصل إلى مواقعها.',
    }),
  },
  {
    district: 'houses',
    title: 'رقم بوابة الحديقة',
    make: (rng) => ({ ...generate('pv-digit', rng), story: 'نكتب رقم بوابة الحديقة على اللوحة.' }),
  },
  {
    district: 'workshop',
    title: 'تقدير تكلفة الأدوات',
    make: (rng) => ({ ...generate('est-sum', rng), story: 'قبل الشراء، نقدّر تكلفة أدوات الزراعة والطلاء.' }),
  },
  {
    district: 'garden',
    title: 'مسافة الممر',
    make: (rng) => {
      const p = pick(rng, settings.garden.roundTo);
      return { ...generate(`round-${p}` as SkillId, rng), story: 'نقرّب طول ممر الحديقة لنطلب البلاط المناسب.' };
    },
  },
  {
    district: 'market',
    title: 'المجموع والباقي',
    make: (rng) => ({
      ...generate('sub-change', rng),
      story: `اشترينا تجهيزات الحديقة من السوق، ومعنا ميزانية محددة.`,
    }),
  },
  {
    district: 'stats',
    title: 'رأي السكان',
    make: equipmentVote,
  },
  {
    district: 'walkway',
    title: 'زهور الممشى',
    make: (rng) => {
      let q = generate('pat-next', rng);
      for (let k = 0; k < 20 && !(q.visual?.type === 'pattern' && q.visual.theme === 'flowers'); k++) {
        q = generate('pat-next', rng);
      }
      return { ...q, story: 'نزرع زهور ممشى الحديقة بحسب نمط، فما العدد على الزهرة التالية؟' };
    },
  },
  {
    district: 'farm',
    title: 'أشجار الحديقة',
    make: (rng) => ({ ...generate('mul-array', rng), story: 'تزرع المزرعة أشجار الحديقة في صفوف متساوية.' }),
  },
];

/** خطوات المهمة الختامية تتكيف مع الأحياء المفعّلة (٣ إلى ٥ خطوات) */
export function buildMission(rng: Rng): MissionStep[] {
  const enabled = new Set(enabledDistricts());
  const core: DistrictId[] = ['station', 'workshop', 'market', 'stats', 'walkway'];
  const extra: DistrictId[] = ['houses', 'garden', 'farm'];
  let chosen = STORY.filter((s) => core.includes(s.district) && enabled.has(s.district));
  for (const id of extra) {
    if (chosen.length >= 3) break;
    const s = STORY.find((x) => x.district === id);
    if (s && enabled.has(id)) chosen.push(s);
  }
  // الحفاظ على ترتيب القصة
  chosen = STORY.filter((s) => chosen.includes(s));
  return chosen.map((s) => ({ district: s.district, title: s.title, question: s.make(rng) }));
}

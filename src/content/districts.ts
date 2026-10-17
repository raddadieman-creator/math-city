/**
 * تعريف أحياء المدينة: الاسم، الدرس، المهارات، المثال التفاعلي، وأثر الإنجاز.
 * لتعديل نص أو مثال، عدّلي هنا. لتفعيل حي أو إخفائه استخدمي src/config/settings.ts
 */
import { settings, type DistrictId } from '../config/settings';
import { fmt } from '../lib/numbers';
import type { DistrictDef, SkillId } from './types';

export const SKILL_NAMES: Record<SkillId, string> = {
  'pv-build': 'بناء عدد بوضع الأرقام في منازلها',
  'pv-digit': 'تحديد منزلة الرقم وقيمته',
  'pv-read': 'قراءة الأعداد وكتابتها',
  'pv-forms': 'التحويل بين الصورة القياسية والتحليلية',
  'cmp-compare': 'مقارنة عددين',
  'cmp-order': 'ترتيب الأعداد تصاعديًا وتنازليًا',
  'round-10': 'التقريب إلى أقرب عشرة',
  'round-100': `التقريب إلى أقرب ${settings.hundredSpelling}`,
  'round-1000': 'التقريب إلى أقرب ألف',
  'round-10000': 'التقريب إلى أقرب عشرة آلاف',
  'add-total': 'حساب مجموع المشتريات',
  'sub-change': 'حساب المبلغ المتبقي',
  'budget-enough': 'الحكم على كفاية الميزانية',
  'add-regroup': 'الجمع مع إعادة التجميع',
  'sub-regroup': 'الطرح مع إعادة التجميع',
  'sub-zeros': 'الطرح بوجود الأصفار',
  'est-sum': 'تقدير المجموع',
  'est-diff': 'تقدير الفرق',
  'est-exact': 'مقارنة الناتج الدقيق بالتقدير',
  'est-when': 'متى يكفي التقدير ومتى نحتاج الدقة',
  'data-table': 'قراءة جدول البيانات',
  'data-bars': 'قراءة التمثيل بالأعمدة',
  'data-most-least': 'تحديد الأكثر والأقل',
  'data-diff': 'حساب الفرق بين الأصوات',
  'data-total': 'حساب مجموع المشاركين',
  'pat-next': 'إكمال نمط عددي',
  'pat-rule': 'اكتشاف قاعدة النمط',
  'pat-missing': 'إيجاد العدد المفقود في النمط',
  'num-sentence': 'حل جمل عددية',
  'mul-array': 'الضرب بالصفوف والأعمدة',
  'mul-repeated': 'ربط الضرب بالجمع المتكرر',
  'mul-fact': 'حقائق الضرب',
};

const roundingSkills = (): SkillId[] =>
  settings.garden.roundTo.filter((p) => [10, 100, 1000, 10000].includes(p)).map((p) => `round-${p}` as SkillId);

export const DISTRICTS: Record<DistrictId, DistrictDef> = {
  houses: {
    id: 'houses',
    icon: '🏠',
    name: 'حي المنازل',
    topic: 'القيمة المنزلية',
    role: 'لكل رقم منزل، وقيمته تتغير بحسب المنزل الذي يسكنه.',
    reward: 'تُضاء نوافذ المنازل وتُرفع أرقامها على البوابات.',
    color: '#FF8A7A',
    skills: ['pv-build', 'pv-digit', 'pv-read', 'pv-forms'],
    example: () => [
      {
        text: 'هذا العدد ٣٥٬٤٢١ يسكن في خمسة منازل. اضغطي على أي رقم لتري قيمته.',
        visual: { type: 'placeChart', n: 35421, places: 5, interactive: true },
      },
      {
        text: 'الرقم ٥ يسكن في منزلة الآلاف، لذلك قيمته ٥٬٠٠٠ وليست ٥ فقط.',
        visual: { type: 'placeChart', n: 35421, places: 5, highlight: 3 },
      },
      {
        text: 'عندما نجمع قيم الأرقام كلها نحصل على الصورة التحليلية للعدد.',
        visual: {
          type: 'expr',
          tokens: [
            { t: 'num', v: 35421 },
            { t: 'op', v: '=' },
            { t: 'num', v: 30000 },
            { t: 'op', v: '+' },
            { t: 'num', v: 5000 },
            { t: 'op', v: '+' },
            { t: 'num', v: 400 },
            { t: 'op', v: '+' },
            { t: 'num', v: 20 },
            { t: 'op', v: '+' },
            { t: 'num', v: 1 },
          ],
        },
      },
    ],
  },
  station: {
    id: 'station',
    icon: '🚆',
    name: 'محطة الأعداد',
    topic: 'المقارنة والترتيب',
    role: 'ننظّم القطارات بمقارنة الأعداد وترتيبها.',
    reward: 'ينطلق قطار المدينة على سكته.',
    color: '#4FC3E8',
    skills: ['cmp-compare', 'cmp-order'],
    example: () => [
      {
        text: 'نقارن ٤٧٬٣٨٢ و٤٧٬٢٩٥. نبدأ من أكبر منزلة: عشرات الآلاف متساوية، والآلاف متساوية.',
        visual: { type: 'compare', a: 47382, b: 47295 },
      },
      {
        text: 'أول منزلة مختلفة هي المئات: ٣ أكبر من ٢.',
        visual: { type: 'compare', a: 47382, b: 47295, highlightPlace: 2 },
      },
      {
        text: 'إذن ٤٧٬٣٨٢ أكبر من ٤٧٬٢٩٥. فتحة العلامة تتجه دائمًا نحو العدد الأكبر.',
        visual: { type: 'compare', a: 47382, b: 47295, highlightPlace: 2, sign: '>' },
      },
    ],
  },
  garden: {
    id: 'garden',
    icon: '🌳',
    name: 'حديقة التقريب',
    topic: 'التقريب',
    role: 'نزرع الأشجار عند أقرب علامة على ممر الحديقة.',
    reward: 'تمتلئ الحديقة بالأشجار وتعمل النافورة.',
    color: '#5ED6B4',
    get skills() {
      return roundingSkills();
    },
    example: () => [
      {
        text: `نريد تقريب ${fmt(2370)} إلى أقرب ${settings.hundredSpelling}. يقع بين ${fmt(2300)} و${fmt(2400)}.`,
        visual: { type: 'numberLine', n: 2370, low: 2300, high: 2400 },
      },
      {
        text: `نقطة المنتصف ${fmt(2350)}. العدد ${fmt(2370)} أكبر منها، فهو أقرب إلى ${fmt(2400)}.`,
        visual: { type: 'numberLine', n: 2370, low: 2300, high: 2400, reveal: true },
      },
      {
        text: `وإذا وقع العدد على نقطة المنتصف تمامًا، مثل ${fmt(2350)}، نقرّبه إلى العدد الأكبر ${fmt(2400)}.`,
        visual: { type: 'numberLine', n: 2350, low: 2300, high: 2400, reveal: true },
      },
    ],
  },
  market: {
    id: 'market',
    icon: '🛒',
    name: 'سوق المدينة',
    topic: 'الجمع والطرح',
    role: 'نشتري أدوات المدرسة ونحسب المجموع والباقي.',
    reward: 'تُفتح مظلات السوق الملوّنة.',
    color: '#FFC94D',
    skills: ['add-total', 'sub-change', 'budget-enough', 'add-regroup', 'sub-regroup', 'sub-zeros'],
    example: () => [
      {
        text: 'نجمع ٤٥٨ و٢٧٦. نكتب العددين بعضهما تحت بعض بحيث تتحاذى المنازل.',
        visual: { type: 'column', op: '+', operands: [458, 276], stage: 'problem' },
      },
      {
        text: 'الآحاد: ٨ و٦ مجموعهما ١٤؛ نكتب ٤ ونحمل ١ إلى العشرات. العشرات: ٥ و٧ و١ مجموعها ١٣؛ نكتب ٣ ونحمل ١.',
        visual: { type: 'column', op: '+', operands: [458, 276], stage: 'regroup' },
      },
      {
        text: 'المئات: ٤ و٢ و١ مجموعها ٧. الناتج ٧٣٤.',
        visual: { type: 'column', op: '+', operands: [458, 276], stage: 'solved' },
      },
      {
        text: 'وفي الطرح بوجود الأصفار نستلف من أقرب منزلة غير صفرية، فتتحول الأصفار التي بينها إلى ٩.',
        visual: { type: 'column', op: '−', operands: [4003, 1268], stage: 'regroup' },
      },
    ],
  },
  workshop: {
    id: 'workshop',
    icon: '🏗️',
    name: 'ورشة البناء',
    topic: 'التقدير',
    role: 'نقدّر تكلفة البناء قبل الحساب الدقيق.',
    reward: 'ترتفع الرافعة ويُبنى برج جديد.',
    color: '#FFA94D',
    skills: ['est-sum', 'est-diff', 'est-exact', 'est-when'],
    example: () => [
      {
        text: 'تكلفة الخشب ٣٬٤٥٦ ريالًا، والطلاء ٢٬٧٨١ ريالًا. نقدّر المجموع بالتقريب إلى أقرب ألف.',
        visual: { type: 'estimate', op: '+', a: 3456, b: 2781, place: 1000 },
      },
      {
        text: 'التقدير ٦٬٠٠٠، والناتج الدقيق ٦٬٢٣٧. التقدير قريب، ويكفي لمعرفة هل الميزانية مناسبة.',
        visual: { type: 'estimate', op: '+', a: 3456, b: 2781, place: 1000, showExact: true },
      },
    ],
  },
  stats: {
    id: 'stats',
    icon: '📊',
    name: 'مركز الإحصاء',
    topic: 'تمثيل البيانات',
    role: 'نقرأ تصويت السكان لاختيار مشروعهم الجديد.',
    reward: 'تُرفع أعلام الإحصاء وتظهر لوحة النتائج.',
    color: '#9B8CFF',
    skills: ['data-table', 'data-bars', 'data-most-least', 'data-diff', 'data-total'],
    example: () => [
      {
        text: 'هذه نتائج تصويت السكان في جدول وفي تمثيل بالأعمدة. البيانات نفسها في الاثنين.',
        visual: {
          type: 'votes',
          title: 'تصويت السكان على المشروع الجديد',
          show: 'both',
          step: settings.stats.scaleStep,
          rows: [
            { label: 'حديقة', icon: '🌳', value: 30 },
            { label: 'مكتبة', icon: '📚', value: 25 },
            { label: 'ملعب', icon: '⚽', value: 35 },
          ],
        },
      },
      {
        text: 'أطول عمود هو «ملعب» بخمسة وثلاثين صوتًا، فهو الأكثر. وكل خط أفقي في الرسم يمثل خمسة أصوات.',
      },
    ],
  },
  walkway: {
    id: 'walkway',
    icon: '🌷',
    name: 'ممشى الأنماط',
    topic: 'الأنماط والجمل العددية',
    role: 'نزرع الزهور ونرصف البلاط بحسب قاعدة.',
    reward: 'تتفتح زهور الممشى ويُرصف البلاط.',
    color: '#FF7EB6',
    skills: ['pat-next', 'pat-rule', 'pat-missing', 'num-sentence'],
    example: () => [
      {
        text: 'انظري إلى هذه الزهور: ١٢٥، ١٥٠، ١٧٥، ٢٠٠… كل عدد يزيد ٢٥ عن الذي قبله.',
        visual: { type: 'pattern', seq: [125, 150, 175, 200, null], theme: 'flowers' },
      },
      {
        text: 'القاعدة: أضيفي ٢٥ في كل مرة، فالعدد التالي ٢٢٥.',
        visual: { type: 'pattern', seq: [125, 150, 175, 200, 225], theme: 'flowers' },
      },
    ],
  },
  farm: {
    id: 'farm',
    icon: '🌴',
    name: 'مزرعة المدينة',
    topic: 'الضرب',
    role: 'نزرع النخيل في صفوف متساوية ونعدّه بالضرب.',
    reward: 'تثمر النخيل وتمتلئ المزرعة.',
    color: '#8BC34A',
    skills: ['mul-array', 'mul-repeated', 'mul-fact'],
    example: () => [
      {
        text: 'في المزرعة ٣ صفوف، في كل صف ٤ نخلات.',
        visual: { type: 'array', rows: 3, cols: 4 },
      },
      {
        text: 'نجمع الصفوف: ٤ و٤ و٤ تساوي ١٢، وهذا يساوي ناتج ضرب ٣ في ٤.',
        visual: {
          type: 'group',
          items: [
            { type: 'array', rows: 3, cols: 4, groupRows: true },
            {
              type: 'expr',
              tokens: [
                { t: 'num', v: 4 },
                { t: 'op', v: '+' },
                { t: 'num', v: 4 },
                { t: 'op', v: '+' },
                { t: 'num', v: 4 },
                { t: 'op', v: '=' },
                { t: 'num', v: 3 },
                { t: 'op', v: '×' },
                { t: 'num', v: 4 },
                { t: 'op', v: '=' },
                { t: 'num', v: 12 },
              ],
            },
          ],
        },
      },
    ],
  },
};

import type { DistrictId } from '../config/settings';

/** رمز داخل تعبير رياضي يُعرض من اليمين إلى اليسار دون انعكاس */
export type Token =
  | { t: 'num'; v: number }
  | { t: 'op'; v: '+' | '−' | '×' | '=' }
  | { t: 'blank' }
  | { t: 'text'; v: string };

export interface VoteRow {
  label: string;
  icon: string;
  value: number;
}

export interface ShopItem {
  name: string;
  icon: string;
  price: number;
}

export type Visual =
  | { type: 'placeChart'; n: number; places: number; highlight?: number; interactive?: boolean }
  | { type: 'expr'; tokens: Token[] }
  | { type: 'compare'; a: number; b: number; highlightPlace?: number; sign?: '>' | '<' | '=' }
  | { type: 'numberLine'; n: number; low: number; high: number; reveal?: boolean }
  | {
      type: 'column';
      op: '+' | '−';
      operands: number[];
      stage: 'problem' | 'regroup' | 'solved';
    }
  | { type: 'receipt'; items: ShopItem[]; budget?: number; showTotal?: boolean }
  | { type: 'votes'; title: string; rows: VoteRow[]; show: 'table' | 'bars' | 'both'; step: number }
  | { type: 'pattern'; seq: (number | null)[]; theme: 'flowers' | 'tiles' }
  | { type: 'array'; rows: number; cols: number; groupRows?: boolean }
  | { type: 'estimate'; op: '+' | '−'; a: number; b: number; place: number; showExact?: boolean }
  | { type: 'group'; items: Visual[] };

export interface ChoiceOption {
  /** نص الخيار */
  label: string;
  /** تعبير رياضي بديل عن النص (يُعرض بالاتجاه الصحيح) */
  tokens?: Token[];
}

interface QuestionBase {
  skill: SkillId;
  prompt: string;
  /** سطر سياق قصير من قصة المدينة */
  story?: string;
  visual?: Visual;
  hint: string;
  hintVisual?: Visual;
  /** شرح بصري مختصر يظهر بعد المحاولة الخاطئة الثانية */
  stepVisual?: Visual;
  /** لماذا الإجابة صحيحة */
  explain: string;
  explainVisual?: Visual;
}

export type Question = QuestionBase &
  (
    | { kind: 'choice'; options: ChoiceOption[]; answer: number }
    | { kind: 'number'; answer: number; unit?: string; tokens?: Token[] }
    | { kind: 'compare'; a: number; b: number; answer: '>' | '<' | '=' }
    | { kind: 'order'; items: number[]; direction: 'asc' | 'desc' }
    | { kind: 'build'; target: number; places: number; tiles: number[] }
  );

export type SkillId =
  | 'pv-build'
  | 'pv-digit'
  | 'pv-read'
  | 'pv-forms'
  | 'cmp-compare'
  | 'cmp-order'
  | 'round-10'
  | 'round-100'
  | 'round-1000'
  | 'round-10000'
  | 'add-total'
  | 'sub-change'
  | 'budget-enough'
  | 'add-regroup'
  | 'sub-regroup'
  | 'sub-zeros'
  | 'est-sum'
  | 'est-diff'
  | 'est-exact'
  | 'est-when'
  | 'data-table'
  | 'data-bars'
  | 'data-most-least'
  | 'data-diff'
  | 'data-total'
  | 'pat-next'
  | 'pat-rule'
  | 'pat-missing'
  | 'num-sentence'
  | 'mul-array'
  | 'mul-repeated'
  | 'mul-fact';

export interface ExampleStep {
  text: string;
  visual?: Visual;
}

export interface DistrictDef {
  id: DistrictId;
  name: string;
  topic: string;
  /** وصف دور المكان في المدينة */
  role: string;
  /** ما يتغير في المدينة عند إنجاز الحي */
  reward: string;
  color: string;
  /** رمز تعبيري يمثل الحي في البطاقات */
  icon: string;
  skills: SkillId[];
  example: () => ExampleStep[];
}

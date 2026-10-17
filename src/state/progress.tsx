import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DISTRICTS } from '../content/districts';
import type { SkillId } from '../content/types';
import { defaultProjectInfo, enabledDistricts, settings, type DistrictId } from '../config/settings';
import { setSoundEnabled } from '../lib/sound';

const KEY = 'math-city-progress-v1';

export interface DistrictProgress {
  /** عدد المهمات المستقلة المنجزة في المحاولة الحالية */
  tasksDone: number;
  stamp: boolean;
  /** عدد المرات التي أُنجز فيها الحي كاملًا */
  completions: number;
  /** تاريخ الحصول على الختم أول مرة (ISO) */
  stampedAt?: string;
}

export interface SkillStat {
  attempts: number;
  firstTry: number;
}

export interface Progress {
  version: 1;
  started: boolean;
  info: typeof defaultProjectInfo;
  /** اسم الطالبة التي تستخدم الموقع الآن (يظهر في الترحيب والجواز) */
  playerName: string;
  districts: Partial<Record<DistrictId, DistrictProgress>>;
  skills: Partial<Record<SkillId, SkillStat>>;
  bricks: number;
  finalDone: boolean;
  finalAt?: string;
  /** تاريخ إصدار الجواز (أول دخول للمدينة) */
  issuedAt?: string;
  sound: boolean;
}

function fresh(): Progress {
  return {
    version: 1,
    started: false,
    info: { ...defaultProjectInfo },
    playerName: '',
    districts: {},
    skills: {},
    bricks: 0,
    finalDone: false,
    sound: true,
  };
}

function load(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fresh();
    const p = JSON.parse(raw) as Progress;
    if (p.version !== 1) return fresh();
    // الحقول الفارغة المحفوظة تأخذ القيم الافتراضية من الإعدادات
    const info = { ...defaultProjectInfo };
    (Object.keys(info) as (keyof typeof info)[]).forEach((k) => {
      if (p.info?.[k]?.trim()) info[k] = p.info[k];
    });
    return { ...fresh(), ...p, info, playerName: typeof p.playerName === 'string' ? p.playerName : '' };
  } catch {
    return fresh();
  }
}

function save(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* التخزين غير متاح (وضع التصفح الخاص مثلًا): يستمر الموقع دون حفظ */
  }
}

/** المهارة متقنة إذا أجابت الطالبة عن ٧٠٪ أو أكثر من أسئلتها من المحاولة الأولى */
export function isMastered(s: SkillStat) {
  return s.attempts > 0 && s.firstTry / s.attempts >= 0.7;
}

interface Ctx {
  progress: Progress;
  recordAnswer: (skill: SkillId, firstTry: boolean) => void;
  completeTask: (d: DistrictId) => void;
  completeDistrict: (d: DistrictId) => void;
  resetDistrictRun: (d: DistrictId) => void;
  setInfo: (info: Partial<Progress['info']>) => void;
  setPlayerName: (name: string) => void;
  setStarted: () => void;
  setFinalDone: () => void;
  toggleSound: () => void;
  resetAll: () => void;
  districtProgress: (d: DistrictId) => DistrictProgress;
  cityLevel: number;
  weakSkills: (d?: DistrictId) => SkillId[];
}

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(load);

  useEffect(() => save(progress), [progress]);
  useEffect(() => setSoundEnabled(progress.sound), [progress.sound]);

  const districtProgress = useCallback(
    (d: DistrictId): DistrictProgress => progress.districts[d] ?? { tasksDone: 0, stamp: false, completions: 0 },
    [progress.districts],
  );

  const update = (fn: (p: Progress) => Progress) => setProgress((p) => fn(p));

  const value = useMemo<Ctx>(() => {
    const enabled = enabledDistricts();
    const totalTasks = enabled.length * settings.tasksPerDistrict;
    const doneTasks = enabled.reduce((s, d) => {
      const dp = progress.districts[d];
      return s + (dp ? (dp.stamp ? settings.tasksPerDistrict : dp.tasksDone) : 0);
    }, 0);
    return {
      progress,
      districtProgress,
      cityLevel: totalTasks ? doneTasks / totalTasks : 0,
      recordAnswer: (skill, firstTry) =>
        update((p) => {
          const s = p.skills[skill] ?? { attempts: 0, firstTry: 0 };
          return {
            ...p,
            bricks: p.bricks + 1,
            skills: { ...p.skills, [skill]: { attempts: s.attempts + 1, firstTry: s.firstTry + (firstTry ? 1 : 0) } },
          };
        }),
      completeTask: (d) =>
        update((p) => {
          const dp = p.districts[d] ?? { tasksDone: 0, stamp: false, completions: 0 };
          return { ...p, districts: { ...p.districts, [d]: { ...dp, tasksDone: Math.min(dp.tasksDone + 1, settings.tasksPerDistrict) } } };
        }),
      completeDistrict: (d) =>
        update((p) => {
          const dp = p.districts[d] ?? { tasksDone: 0, stamp: false, completions: 0 };
          return {
            ...p,
            districts: {
              ...p.districts,
              [d]: {
                tasksDone: settings.tasksPerDistrict,
                stamp: true,
                completions: dp.completions + 1,
                stampedAt: dp.stampedAt ?? new Date().toISOString(),
              },
            },
          };
        }),
      resetDistrictRun: (d) =>
        update((p) => {
          const dp = p.districts[d];
          if (!dp || dp.stamp) return p;
          return { ...p, districts: { ...p.districts, [d]: { ...dp, tasksDone: 0 } } };
        }),
      setInfo: (info) => update((p) => ({ ...p, info: { ...p.info, ...info } })),
      setPlayerName: (name) => update((p) => ({ ...p, playerName: name })),
      setStarted: () => update((p) => ({ ...p, started: true, issuedAt: p.issuedAt ?? new Date().toISOString() })),
      setFinalDone: () => update((p) => ({ ...p, finalDone: true, finalAt: p.finalAt ?? new Date().toISOString() })),
      toggleSound: () => update((p) => ({ ...p, sound: !p.sound })),
      resetAll: () => setProgress((p) => ({ ...fresh(), started: true, issuedAt: new Date().toISOString(), sound: p.sound, info: p.info, playerName: p.playerName })),
      weakSkills: (d) => {
        const skills = d ? DISTRICTS[d].skills : enabled.flatMap((x) => DISTRICTS[x].skills);
        return skills.filter((s) => {
          const st = progress.skills[s];
          return st && !isMastered(st);
        });
      },
    };
  }, [progress, districtProgress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const c = useContext(ProgressContext);
  if (!c) throw new Error('ProgressProvider مفقود');
  return c;
}

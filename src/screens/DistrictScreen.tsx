import { useMemo, useRef, useState, useEffect } from 'react';
import { settings, enabledDistricts, type DistrictId } from '../config/settings';
import { DISTRICTS, SKILL_NAMES } from '../content/districts';
import { buildQuestions } from '../content/session';
import type { SkillId } from '../content/types';
import { createRng } from '../lib/random';
import { navigate } from '../lib/router';
import { sfx } from '../lib/sound';
import { useProgress } from '../state/progress';
import { QuestionCard, type Outcome } from '../components/QuestionCard';
import { Noha } from '../components/Noha';
import { Num } from '../components/Num';
import { VisualView } from '../components/Visuals';
import { fmt } from '../lib/numbers';
import { Confetti } from '../components/Confetti';
import { GoldStamp, GoldCoin, arabicShortDate } from '../components/GoldStamp';

const REWARD_ICON: Record<DistrictId, string> = {
  houses: '💡',
  station: '🚃',
  garden: '🌳',
  market: '⛱️',
  workshop: '🧱',
  stats: '🚩',
  walkway: '🌷',
  farm: '🌴',
};

const REWARD_LINE: Record<DistrictId, string> = {
  houses: 'أضأتِ نافذة جديدة في حي المنازل!',
  station: 'أضفتِ عربة إلى قطار المدينة!',
  garden: 'زرعتِ شجرة في حديقة التقريب!',
  market: 'فتحتِ مظلة جديدة في السوق!',
  workshop: 'بنيتِ طابقًا جديدًا!',
  stats: 'ارتفعت أعمدة لوحة الإحصاء!',
  walkway: 'تفتّحت زهرتان في الممشى!',
  farm: 'نمت نخلات جديدة في المزرعة!',
};

type Phase = 'intro' | 'guided' | 'tasks' | 'result';

function RewardStrip({ id, done, total }: { id: DistrictId; done: number; total: number }) {
  return (
    <div className="reward-strip" aria-label={`تقدّم الحي: ${fmt(done)} من ${fmt(total)}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={`reward-slot ${i < done ? 'is-on' : ''}`} aria-hidden="true">
          {REWARD_ICON[id]}
        </span>
      ))}
    </div>
  );
}

export function DistrictScreen({ id, practice }: { id: DistrictId; practice: string | null }) {
  const d = DISTRICTS[id];
  const { districtProgress, recordAnswer, completeTask, completeDistrict, resetDistrictRun, weakSkills } = useProgress();
  const dp = districtProgress(id);
  const isPractice = practice !== null;
  const [phase, setPhase] = useState<Phase>(isPractice || dp.stamp ? 'tasks' : 'intro');
  const [step, setStep] = useState(0);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<{ skill: SkillId; firstTry: boolean }[]>([]);
  const [toast, setToast] = useState('');
  const [newStamp, setNewStamp] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const seed = useRef(Date.now());
  const example = useMemo(() => d.example(), [d]);
  const focus = useMemo(() => (practice === 'weak' ? weakSkills(id) : undefined), []); // eslint-disable-line react-hooks/exhaustive-deps

  const guided = useMemo(() => buildQuestions(id, createRng(seed.current), settings.guidedPerDistrict), [id]);
  const tasks = useMemo(
    () => buildQuestions(id, createRng(seed.current + 1), settings.tasksPerDistrict, focus),
    [id, focus],
  );

  useEffect(() => {
    if (phase === 'tasks' && !isPractice) resetDistrictRun(id);
    topRef.current?.scrollIntoView({ block: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const nextQuestion = () => {
    setToast('');
    window.setTimeout(() => topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 30);
  };

  const onGuidedDone = () => {
    if (index + 1 < guided.length) {
      setIndex(index + 1);
      nextQuestion();
    } else {
      setIndex(0);
      setPhase('tasks');
    }
  };

  const onTaskDone = (o: Outcome) => {
    const q = tasks[index];
    recordAnswer(q.skill, o.firstTry);
    const r = [...results, { skill: q.skill, firstTry: o.firstTry }];
    setResults(r);
    if (!dp.stamp && !isPractice) completeTask(id);
    if (index + 1 < tasks.length) {
      setIndex(index + 1);
      nextQuestion();
      setToast(REWARD_LINE[id]);
    } else {
      setNewStamp(!dp.stamp);
      completeDistrict(id);
      sfx.stamp();
      setPhase('result');
    }
  };

  const enabled = enabledDistricts();
  const nextDistrict = enabled[(enabled.indexOf(id) + 1) % enabled.length];

  return (
    <main className="page district-page" style={{ ['--c' as string]: d.color }}>
      <div ref={topRef} className="scroll-anchor" />
      <header className={`district-head ${phase === 'intro' || phase === 'result' ? '' : 'is-compact'}`}>
        <span className="district-badge" aria-hidden="true">
          {d.icon}
        </span>
        <div>
          <h1>
            {d.name}
            {dp.stamp && (
              <span className="stamp-mini" title="حصلتِ على ختم هذا الحي">
                <GoldCoin size={30} />
              </span>
            )}
          </h1>
          <p className="district-topic">{d.topic}</p>
        </div>
      </header>

      {phase === 'intro' && (
        <section className="intro">
          <Noha>
            {d.role} {dp.stamp ? 'أنجزتِ هذا الحي من قبل، ويمكنكِ التدرّب مرة أخرى.' : `عند إنجاز المهمات: ${d.reward}`}
          </Noha>
          <div className="example-card">
            <div className="example-head">
              <h2>مثال تفاعلي</h2>
              <span className="example-count">
                <Num v={step + 1} /> / <Num v={example.length} />
              </span>
            </div>
            <p className="example-text" aria-live="polite">
              {example[step].text}
            </p>
            {example[step].visual && (
              <div className="q-visual">
                <VisualView v={example[step].visual!} />
              </div>
            )}
            <div className="row-actions">
              <button type="button" className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
                السابق
              </button>
              {step < example.length - 1 && (
                <button type="button" className="btn btn-secondary" onClick={() => setStep(step + 1)}>
                  الخطوة التالية
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIndex(0);
                  setPhase('guided');
                }}
              >
                فهمت، لنبدأ
              </button>
            </div>
          </div>
          <div className="skip-row">
            <button
              type="button"
              className="btn btn-link"
              onClick={() => {
                setIndex(0);
                setPhase('tasks');
              }}
            >
              الانتقال مباشرة إلى المهمات
            </button>
          </div>
        </section>
      )}

      {phase === 'guided' && (
        <section>
          <div className="phase-bar">
            <span className="phase-chip">تدريب مع تلميح</span>
            <span>
              <Num v={index + 1} /> من <Num v={guided.length} />
            </span>
          </div>
          <QuestionCard
            key={`g${index}`}
            q={guided[index]}
            guided
            onDone={onGuidedDone}
            nextLabel={index + 1 < guided.length ? 'التالي' : 'إلى المهمات'}
          />
        </section>
      )}

      {phase === 'tasks' && (
        <section>
          <div className="phase-bar tasks-bar">
            <span className="phase-chip">{isPractice ? 'تدريب إضافي' : 'المهمة'} <Num v={index + 1} /> / <Num v={tasks.length} /></span>
            <RewardStrip id={id} done={results.length} total={tasks.length} />
            {dp.stamp && !isPractice && results.length === 0 && (
              <button type="button" className="btn btn-link btn-sm" onClick={() => { setStep(0); setPhase('intro'); }}>
                المثال
              </button>
            )}
          </div>
          {toast && (
            <p className="toast" role="status">
              {REWARD_ICON[id]} {toast}
            </p>
          )}
          <QuestionCard
            key={`t${index}`}
            q={tasks[index]}
            onDone={onTaskDone}
            nextLabel={index + 1 < tasks.length ? 'المهمة التالية' : 'عرض النتيجة'}
          />
        </section>
      )}

      {phase === 'result' && <Result id={id} results={results} newStamp={newStamp} nextDistrict={nextDistrict} />}
    </main>
  );
}

function Result({
  id,
  results,
  newStamp,
  nextDistrict,
}: {
  id: DistrictId;
  results: { skill: SkillId; firstTry: boolean }[];
  newStamp: boolean;
  nextDistrict: DistrictId;
}) {
  const d = DISTRICTS[id];
  const bySkill = new Map<SkillId, { n: number; ok: number }>();
  results.forEach((r) => {
    const s = bySkill.get(r.skill) ?? { n: 0, ok: 0 };
    bySkill.set(r.skill, { n: s.n + 1, ok: s.ok + (r.firstTry ? 1 : 0) });
  });
  const mastered = [...bySkill].filter(([, s]) => s.ok === s.n).map(([k]) => k);
  const needs = [...bySkill].filter(([, s]) => s.ok < s.n).map(([k]) => k);
  const firstTry = results.filter((r) => r.firstTry).length;

  return (
    <section className="result" aria-labelledby="result-title">
      <Confetti pieces={60} />
      <div className="stamp-rays" aria-hidden="true" />
      <div className="result-stamp">
        <GoldStamp icon={d.icon} name={d.name} ribbon={d.color} earned isNew={newStamp} size={200} rotate={-6} date={arabicShortDate(new Date().toISOString())} />
      </div>
      <h2 id="result-title">{newStamp ? 'حصلتِ على الختم الذهبي!' : 'أحسنتِ، أتممتِ المهمات!'}</h2>
      {newStamp && <p className="result-sub">أُضيف الختم إلى جوازكِ.</p>}
      <p className="result-reward">{d.reward}</p>
      <p>
        أجبتِ عن <Num v={firstTry} /> من <Num v={results.length} /> مهمات من المحاولة الأولى. المهم أنكِ وصلتِ إلى الحل في كل
        مرة.
      </p>
      <div className="skill-lists">
        {mastered.length > 0 && (
          <div className="skill-list good">
            <h3>مهارات أنجزتِها</h3>
            <ul>
              {mastered.map((s) => (
                <li key={s}>⭐ {SKILL_NAMES[s]}</li>
              ))}
            </ul>
          </div>
        )}
        {needs.length > 0 && (
          <div className="skill-list practice">
            <h3>مهارات تحتاج تدريبًا إضافيًا</h3>
            <ul>
              {needs.map((s) => (
                <li key={s}>🌱 {SKILL_NAMES[s]}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="row-actions wrap">
        <button type="button" className="btn btn-primary" onClick={() => navigate('/city')}>
          شاهدي مدينتك
        </button>
        {newStamp && (
          <button type="button" className="btn btn-gold" onClick={() => navigate('/passport')}>
            افتحي الجواز
          </button>
        )}
        {needs.length > 0 && (
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/d/${id}?practice=weak&t=${Date.now()}`)}>
            تدرّبي مجددًا
          </button>
        )}
        {nextDistrict !== id && (
          <button type="button" className="btn btn-ghost" onClick={() => navigate(`/d/${nextDistrict}`)}>
            الحي التالي: {DISTRICTS[nextDistrict].name}
          </button>
        )}
      </div>
    </section>
  );
}

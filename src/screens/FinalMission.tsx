import { useMemo, useRef, useState, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { buildMission } from '../content/session';
import { DISTRICTS } from '../content/districts';
import { enabledDistricts, branding } from '../config/settings';
import { createRng } from '../lib/random';
import { sfx } from '../lib/sound';
import { useProgress } from '../state/progress';
import { QuestionCard } from '../components/QuestionCard';
import { Noha } from '../components/Noha';
import { Num } from '../components/Num';
import { ParkScene } from '../components/CityMap';
import { navigate } from '../lib/router';
import { fmt } from '../lib/numbers';
import { Confetti } from '../components/Confetti';
import { GoldStamp } from '../components/GoldStamp';
import { ExportBar } from '../components/ExportBar';
import { Emblem } from '../components/Emblem';

function formatDates(d: Date) {
  try {
    const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    const greg = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    return `${hijri} — ${greg}`;
  } catch {
    return d.toLocaleDateString();
  }
}

export function AchievementCard({ innerRef, fixed = false }: { innerRef?: Ref<HTMLDivElement>; fixed?: boolean }) {
  const { progress, districtProgress } = useProgress();
  const ids = enabledDistricts();
  const stamped = ids.filter((id) => districtProgress(id).stamp);
  const { studentName, grade, school, teacher } = progress.info;
  const name = studentName.trim() || 'بانية المدينة';
  const date = formatDates(progress.finalAt ? new Date(progress.finalAt) : new Date());
  return (
    <div ref={innerRef} className={`ach-card ${fixed ? 'is-fixed' : ''}`} aria-label={branding.cardName}>
      <div className="ach-frame">
        {['tr', 'tl', 'br', 'bl'].map((c) => (
          <span key={c} className={`ach-corner ${c}`} aria-hidden="true" />
        ))}
        <header className="ach-head">
          <span className="ach-brand">
            <Emblem size={fixed ? 58 : 46} />
            <span>
              <span className="ach-city">{branding.cityName}</span>
              <span className="ach-kind">{branding.cityKind}</span>
            </span>
          </span>
          <span className="ach-date">{date}</span>
        </header>

        <h2 className="ach-title">{branding.cardName}</h2>
        <p className="ach-give">تُهدى هذه البطاقة إلى</p>
        <p className="ach-name">{name}</p>
        <p className="ach-text">
          لإتمامها مهمة «افتتاح حديقة المدينة» واستخدامها الترتيب والتقدير والحساب وقراءة البيانات والأنماط لبناء مرافق
          المدينة.
        </p>

        {stamped.length > 0 && (
          <ul className="ach-stamps" aria-label="الأختام الذهبية">
            {stamped.map((id, k) => (
              <li key={id}>
                <GoldStamp icon={DISTRICTS[id].icon} name={DISTRICTS[id].name} ribbon={DISTRICTS[id].color} earned size={fixed ? 84 : 70} rotate={[-8, 6, -4, 9][k % 4]} />
              </li>
            ))}
          </ul>
        )}

        <footer className="ach-sign">
          <div className="ach-sig">
            <span className="ach-sig-name">{name}</span>
            <span className="ach-sig-role">الطالبة</span>
          </div>
          <div className="ach-seal">
            <GoldStamp icon="⛲" name="حديقة المدينة" ribbon="#34D6A6" earned special size={fixed ? 128 : 104} rotate={-6} />
          </div>
          <div className="ach-sig">
            <span className="ach-sig-name">{teacher.trim() || '—'}</span>
            <span className="ach-sig-role">المعلمة</span>
          </div>
        </footer>
        {(grade.trim() || school.trim()) && (
          <p className="ach-school">
            {grade.trim() && `الصف ${grade.trim()}`}
            {grade.trim() && school.trim() && ' — '}
            {school.trim()}
          </p>
        )}
        <p className="ach-foot">بطاقة تذكارية من مشروع مدرسي تعليمي</p>
      </div>
    </div>
  );
}

function CardExport() {
  const [stage, setStage] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prepare = () =>
    new Promise<HTMLElement | null>((resolve) => {
      setStage(true);
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(ref.current)));
    });
  return (
    <>
      <ExportBar prepare={prepare} filename="بطاقة-الإنجاز.png" what="البطاقة" onDone={() => setStage(false)} />
      {stage &&
        createPortal(
          <div className="export-stage" aria-hidden="true">
            <AchievementCard innerRef={ref} fixed />
          </div>,
          document.body,
        )}
    </>
  );
}

export function FinalMission() {
  const { setFinalDone, progress, districtProgress } = useProgress();
  const steps = useMemo(() => buildMission(createRng(Date.now())), []);
  const [phase, setPhase] = useState<'intro' | 'steps' | 'done'>('intro');
  const [index, setIndex] = useState(0);
  const topRef = useRef<HTMLDivElement>(null);
  const ids = enabledDistricts();
  const stamps = ids.filter((id) => districtProgress(id).stamp).length;

  const scrollTop = () => window.setTimeout(() => topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 30);

  return (
    <main className="page final-page" style={{ ['--c' as string]: '#34D6A6' }}>
      <div ref={topRef} className="scroll-anchor" />
      <header className="district-head">
        <a href="#/city" className="btn btn-ghost btn-sm back-btn">
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M7 4 L13 10 L7 16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          الخريطة
        </a>
        <span className="district-badge" aria-hidden="true">
          ⛲
        </span>
        <div>
          <h1>افتتاح حديقة المدينة</h1>
          <p className="district-topic">المهمة الختامية</p>
        </div>
      </header>

      {phase !== 'done' && (
        <ol className="mission-steps" aria-label="خطوات المهمة">
          {steps.map((s, i) => (
            <li
              key={i}
              className={`${phase === 'steps' && i === index ? 'is-current' : ''} ${phase === 'steps' && i < index ? 'is-done' : ''}`}
              style={{ ['--c' as string]: DISTRICTS[s.district].color }}
              aria-current={phase === 'steps' && i === index ? 'step' : undefined}
            >
              <span className="ms-num">{phase === 'steps' && i < index ? '✓' : <Num v={i + 1} />}</span>
              <span className="ms-title">{s.title}</span>
            </li>
          ))}
        </ol>
      )}

      {phase === 'intro' && (
        <section className="intro">
          <ParkScene open={progress.finalDone} />
          <Noha>
            قررت المدينة افتتاح حديقة جديدة، وتحتاج إلى مساعدتكِ في <Num v={steps.length} /> خطوات. كل خطوة تستخدم مهارة
            تعلّمتِها في أحد الأحياء.
            {stamps < ids.length && (
              <>
                {' '}
                (أنجزتِ <Num v={stamps} /> من <Num v={ids.length} /> أحياء، ويمكنكِ البدء الآن أو إكمال الأحياء أولًا.)
              </>
            )}
          </Noha>
          <div className="row-actions">
            <button
              type="button"
              className="btn btn-primary btn-xl"
              onClick={() => {
                setPhase('steps');
                setIndex(0);
              }}
            >
              {progress.finalDone ? 'أعيدي المهمة' : 'ابدئي المهمة'}
            </button>
            {progress.finalDone && (
              <button type="button" className="btn btn-secondary" onClick={() => setPhase('done')}>
                عرض بطاقة الإنجاز
              </button>
            )}
          </div>
        </section>
      )}

      {phase === 'steps' && (
        <QuestionCard
          key={index}
          q={steps[index].question}
          label={`الخطوة ${fmt(index + 1)}: ${steps[index].title}`}
          nextLabel={index + 1 < steps.length ? 'الخطوة التالية' : 'افتتاح الحديقة'}
          onDone={() => {
            if (index + 1 < steps.length) {
              setIndex(index + 1);
              scrollTop();
            } else {
              setFinalDone();
              sfx.stamp();
              setPhase('done');
              scrollTop();
            }
          }}
        />
      )}

      {phase === 'done' && (
        <section className="final-done">
          <Confetti pieces={70} />
          <div className="opening">
            <ParkScene open />
            <p className="opening-ribbon">🎉 افتُتحت حديقة المدينة! 🎉</p>
          </div>
          <Noha mood="cheer">أحسنتِ! استخدمتِ الترتيب والتقدير والحساب وقراءة البيانات والأنماط لافتتاح الحديقة.</Noha>
          <AchievementCard />
          <CardExport />
          <div className="row-actions wrap no-print">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/city')}>
              العودة إلى المدينة
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

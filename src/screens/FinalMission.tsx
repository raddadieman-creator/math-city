import { useMemo, useRef, useState } from 'react';
import { buildMission } from '../content/session';
import { DISTRICTS } from '../content/districts';
import { enabledDistricts } from '../config/settings';
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

function formatDates(d: Date) {
  try {
    const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    const greg = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    return `${hijri} — ${greg}`;
  } catch {
    return d.toLocaleDateString();
  }
}

export function AchievementCard() {
  const { progress, districtProgress } = useProgress();
  const ids = enabledDistricts();
  const stamped = ids.filter((id) => districtProgress(id).stamp);
  const { studentName, grade, school, teacher } = progress.info;
  return (
    <div className="print-card" aria-label="بطاقة الإنجاز">
      <div className="pc-inner">
        <div className="pc-top">
          <span className="pc-brand">مدينة الرياضيات</span>
          <span className="pc-kind">بطاقة إنجاز</span>
        </div>
        <ParkScene open />
        <h2 className="pc-title">افتتاح حديقة المدينة</h2>
        <p className="pc-text">
          أتمّت <strong>{studentName.trim() || 'بانية المدينة'}</strong> مهمة «افتتاح حديقة المدينة» في مدينة الرياضيات،
          واستخدمت الرياضيات لبناء مرافق المدينة وحل مشكلاتها.
        </p>
        {stamped.length > 0 && (
          <ul className="pc-stamps">
            {stamped.map((id, k) => (
              <li key={id}>
                <GoldStamp icon={DISTRICTS[id].icon} name={DISTRICTS[id].name} ribbon={DISTRICTS[id].color} earned size={74} rotate={[-8, 6, -4, 9][k % 4]} />
              </li>
            ))}
          </ul>
        )}
        <dl className="pc-meta">
          {grade.trim() && (
            <div>
              <dt>الصف</dt>
              <dd>{grade}</dd>
            </div>
          )}
          {school.trim() && (
            <div>
              <dt>المدرسة</dt>
              <dd>{school}</dd>
            </div>
          )}
          {teacher.trim() && (
            <div>
              <dt>المعلمة</dt>
              <dd>{teacher}</dd>
            </div>
          )}
          <div>
            <dt>التاريخ</dt>
            <dd>{formatDates(new Date())}</dd>
          </div>
        </dl>
        <p className="pc-foot">بطاقة تذكارية من مشروع مدرسي تعليمي.</p>
      </div>
    </div>
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
          <div className="row-actions wrap no-print">
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
              اطبعي بطاقة الإنجاز
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/city')}>
              العودة إلى المدينة
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

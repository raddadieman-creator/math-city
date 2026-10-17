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
          <div className="row-actions wrap">
            <button type="button" className="btn btn-gold" onClick={() => navigate('/passport')}>
              شاهدي الختم الكبير في جوازكِ
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

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { enabledDistricts, projectTagline } from '../config/settings';
import { DISTRICTS, SKILL_NAMES } from '../content/districts';
import { generate } from '../content/generators';
import { createRng } from '../lib/random';
import { navigate } from '../lib/router';
import { fmt } from '../lib/numbers';
import { isMastered, useProgress } from '../state/progress';
import { CityMap } from '../components/CityMap';
import { QuestionCard } from '../components/QuestionCard';
import { NohaFace } from '../components/Noha';
import { Num } from '../components/Num';
import { ProjectInfoForm } from '../components/ProjectInfoForm';
import { GoldStamp } from '../components/GoldStamp';
import { rankFor } from './Passport';

function Slide({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="slide" aria-roledescription="شريحة" aria-label={title}>
      <h2 className="slide-title">{title}</h2>
      {children}
    </section>
  );
}

export function Tour() {
  const { progress, districtProgress } = useProgress();
  const [i, setI] = useState(0);
  const [editing, setEditing] = useState(false);
  const [seed, setSeed] = useState(1);
  const ids = enabledDistricts();
  const demo = useMemo(() => generate(ids.includes('station') ? 'cmp-compare' : DISTRICTS[ids[0]].skills[0], createRng(Date.now() + seed)), [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const { studentName, grade, school, teacher } = progress.info;
  const allSkills = ids.flatMap((id) => DISTRICTS[id].skills);
  const learned = allSkills.filter((s) => {
    const st = progress.skills[s];
    return st && isMastered(st);
  });
  const practiced = allSkills.filter((s) => progress.skills[s] && !learned.includes(s));

  const slides: { title: string; body: ReactNode }[] = [
    {
      title: 'فكرة المشروع',
      body: (
        <div className="slide-intro">
          <NohaFace size={110} mood="cheer" />
          <h1 className="tour-name">
            مدينة الرياضيات
            <span>ابني مدينتك بذكائك</span>
          </h1>
          <p className="tour-tagline">{projectTagline}.</p>
          {!editing ? (
            <dl className="tour-info">
              <div>
                <dt>الطالبة</dt>
                <dd>{studentName || '—'}</dd>
              </div>
              <div>
                <dt>الصف</dt>
                <dd>{grade || '—'}</dd>
              </div>
              <div>
                <dt>المدرسة</dt>
                <dd>{school || '—'}</dd>
              </div>
              <div>
                <dt>المعلمة</dt>
                <dd>{teacher || '—'}</dd>
              </div>
            </dl>
          ) : (
            <ProjectInfoForm compact />
          )}
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(!editing)}>
            {editing ? 'حفظ البيانات' : 'تعديل البيانات'}
          </button>
        </div>
      ),
    },
    {
      title: 'خريطة المدينة',
      body: (
        <div className="slide-map">
          <p>
            في المدينة <Num v={ids.length} /> أحياء، وكل حي يعلّمنا درسًا من الرياضيات. كل إجابة صحيحة تطوّر المدينة: تُضاء
            المنازل، وتُزرع الأشجار، وينطلق القطار.
          </p>
          <div className="map-wrap small">
            <CityMap preview />
          </div>
          <ul className="tour-districts">
            {ids.map((id) => (
              <li key={id} style={{ ['--c' as string]: DISTRICTS[id].color }}>
                <strong>{DISTRICTS[id].name}</strong>: {DISTRICTS[id].topic}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      title: 'مثال تفاعلي من الأنشطة',
      body: (
        <div>
          <QuestionCard key={seed} q={demo} onDone={() => setSeed((s) => s + 1)} nextLabel="مثال آخر" />
        </div>
      ),
    },
    {
      title: 'جواز الإنجازات',
      body: (
        <div>
          <ul className="tour-stamps">
            {ids.map((id, k) => {
              const dp = districtProgress(id);
              const d = DISTRICTS[id];
              return (
                <li key={id}>
                  <GoldStamp icon={d.icon} name={d.name} ribbon={d.color} earned={dp.stamp} size={118} rotate={dp.stamp ? [-8, 6, -4, 9][k % 4] : 0} />
                </li>
              );
            })}
            <li>
              <GoldStamp icon="⛲" name="حديقة المدينة" ribbon="#34D6A6" earned={progress.finalDone} special size={118} rotate={-3} />
            </li>
          </ul>
          <p className="tour-note">
            حصلتُ على <Num v={ids.filter((id) => districtProgress(id).stamp).length} /> من <Num v={ids.length} /> أختام ذهبية،
            ورتبتي في المدينة: «{rankFor(ids.filter((id) => districtProgress(id).stamp).length, ids.length).title}».
          </p>
        </div>
      ),
    },
    {
      title: 'ما تعلّمته',
      body: (
        <div className="learned">
          {learned.length > 0 ? (
            <ul className="learned-list">
              {learned.map((s) => (
                <li key={s}>⭐ {SKILL_NAMES[s]}</li>
              ))}
            </ul>
          ) : (
            <p className="tour-note">ستظهر هنا المهارات التي أتقنتُها بعد حل مهمات الأحياء.</p>
          )}
          {practiced.length > 0 && (
            <>
              <h3>وما زلتُ أتدرّب على:</h3>
              <ul className="learned-list soft">
                {practiced.map((s) => (
                  <li key={s}>🌱 {SKILL_NAMES[s]}</li>
                ))}
              </ul>
            </>
          )}
          <p className="tour-note">تعلّمتُ أن الرياضيات تساعدنا على تنظيم المدينة: نرتّب ونقارن ونقدّر ونحسب ونقرأ البيانات.</p>
        </div>
      ),
    },
  ];

  const go = (n: number) => setI(Math.max(0, Math.min(slides.length - 1, n)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && ['INPUT', 'TEXTAREA'].includes(t.tagName)) return;
      // في الواجهة العربية: السهم الأيسر للتالي والأيمن للسابق
      if (e.key === 'ArrowLeft') setI((x) => Math.min(slides.length - 1, x + 1));
      if (e.key === 'ArrowRight') setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [slides.length]);

  return (
    <main className="tour">
      <div className="tour-bar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/city')}>
          إنهاء الجولة
        </button>
        <span className="tour-count" aria-live="polite">
          {fmt(i + 1)} / {fmt(slides.length)} — {slides[i].title}
        </span>
      </div>
      <div className="tour-stage">
        <Slide title={slides[i].title}>{slides[i].body}</Slide>
      </div>
      <nav className="tour-nav" aria-label="التنقل بين الشرائح">
        <button type="button" className="btn btn-ghost" disabled={i === 0} onClick={() => go(i - 1)}>
          السابق
        </button>
        <div className="tour-dots">
          {slides.map((s, k) => (
            <button
              key={k}
              type="button"
              className={`dot ${k === i ? 'is-on' : ''}`}
              aria-label={`الشريحة ${fmt(k + 1)}: ${s.title}`}
              aria-current={k === i ? 'step' : undefined}
              onClick={() => go(k)}
            />
          ))}
        </div>
        <button type="button" className="btn btn-primary" disabled={i === slides.length - 1} onClick={() => go(i + 1)}>
          التالي
        </button>
      </nav>
    </main>
  );
}

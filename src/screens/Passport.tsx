import { useEffect, useRef, useState, type ReactNode } from 'react';
import { enabledDistricts, type DistrictId } from '../config/settings';
import { DISTRICTS, SKILL_NAMES } from '../content/districts';
import type { SkillId } from '../content/types';
import { isMastered, useProgress, type Progress } from '../state/progress';
import { navigate, useMedia } from '../lib/router';
import { fmt } from '../lib/numbers';
import { sfx } from '../lib/sound';
import { Num } from '../components/Num';
import { ProjectInfoForm } from '../components/ProjectInfoForm';
import { GoldStamp, arabicShortDate } from '../components/GoldStamp';

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-body" onClick={(e) => e.stopPropagation()}>
        <h2 id="dlg-title">{title}</h2>
        <p id="dlg-body">{body}</p>
        <div className="row-actions">
          <button ref={cancelRef} type="button" className="btn btn-ghost" onClick={onClose}>
            إلغاء
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- الرتب ---------------- */

export const RANKS = [
  { min: 0, title: 'زائرة المدينة', icon: '🎒' },
  { min: 1, title: 'مستكشفة الأحياء', icon: '🧭' },
  { min: 3, title: 'بانية ماهرة', icon: '🧱' },
  { min: 6, title: 'مهندسة المدينة', icon: '📐' },
  { min: 8, title: 'عمدة مدينة الرياضيات', icon: '👑' },
];

export function rankFor(stamps: number, total: number) {
  const scaled = total ? Math.round((stamps / total) * 8) : 0;
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (scaled >= r.min) idx = i;
  });
  return { ...RANKS[idx], index: idx, next: RANKS[idx + 1] };
}

/** رقم جواز ثابت مشتق من الاسم */
function passportNumber(name: string) {
  let h = 7;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 100000;
  return (
    <>
      م ر{' '}
      <bdi dir="ltr">
        {fmt(2026, false)}-{fmt(h, false).padStart(5, '٠')}
      </bdi>
    </>
  );
}

function fullDate(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/* ---------------- رسم صورة حاملة الجواز ---------------- */

function HolderPortrait() {
  return (
    <svg viewBox="0 0 120 140" className="pp-photo-svg" aria-hidden="true">
      <rect width="120" height="140" fill="#D6F4FF" />
      <circle cx="96" cy="22" r="10" fill="#FFE066" />
      <path d="M18 140 C 18 108 36 96 60 96 C 84 96 102 108 102 140 Z" fill="#34D6A6" stroke="#2A2B5F" strokeWidth="3" />
      <path d="M26 74 C 22 40 42 22 60 22 C 80 22 100 40 96 74 C 96 98 82 112 60 112 C 38 112 26 98 26 74 Z" fill="#8E7CFF" stroke="#2A2B5F" strokeWidth="3" />
      <ellipse cx="60" cy="68" rx="24" ry="26" fill="#F6C9A8" />
      <circle cx="51" cy="65" r="3.6" fill="#2A2B5F" />
      <circle cx="69" cy="65" r="3.6" fill="#2A2B5F" />
      <circle cx="45" cy="75" r="4" fill="#FF9F95" opacity="0.6" />
      <circle cx="75" cy="75" r="4" fill="#FF9F95" opacity="0.6" />
      <path d="M52 79 Q 60 87 68 79" stroke="#9A4A3E" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M84 36 l2.6 5.4 5.8 .8 -4.2 4 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.2 -4 5.8 -.8 z" fill="#FFC53D" stroke="#2A2B5F" strokeWidth="1.5" />
    </svg>
  );
}

function Emblem({ size = 120 }: { size?: number }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className="pp-emblem" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 4" />
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
        <rect x="26" y="56" width="16" height="28" />
        <path d="M23 58 L34 46 L45 58" />
        <rect x="46" y="38" width="16" height="46" />
        <rect x="66" y="60" width="14" height="24" />
        <rect x="82" y="50" width="12" height="34" />
        <line x1="20" y1="84" x2="100" y2="84" />
      </g>
      <g fill="currentColor">
        <rect x="50" y="44" width="3" height="4" />
        <rect x="55" y="44" width="3" height="4" />
        <rect x="50" y="54" width="3" height="4" />
        <rect x="55" y="54" width="3" height="4" />
        <path d="M60 14 l3 6 6.6 1 -4.8 4.6 1.2 6.6 -6 -3.2 -6 3.2 1.2 -6.6 -4.8 -4.6 6.6 -1 z" />
      </g>
      <text x="60" y="102" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">
        + − × =
      </text>
    </svg>
  );
}

/* ---------------- الصفحات ---------------- */

function Page({ num, title, children, className = '' }: { num: number; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`pp-page ${className}`} aria-label={title}>
      <div className="pp-watermark" aria-hidden="true">
        <Emblem size={220} />
      </div>
      <header className="pp-page-head">
        <h2>{title}</h2>
      </header>
      <div className="pp-page-body">{children}</div>
      <footer className="pp-page-num" aria-hidden="true">
        {fmt(num)}
      </footer>
    </section>
  );
}

function IdentityPage({ progress, stamps, total }: { progress: Progress; stamps: number; total: number }) {
  const { studentName, grade, school, teacher } = progress.info;
  const rank = rankFor(stamps, total);
  const toNext = rank.next ? Math.max(0, Math.ceil((rank.next.min / 8) * total) - stamps) : 0;
  const mrzName = (studentName.trim() || 'بانية المدينة').replace(/\s+/g, '‹');
  return (
    <Page num={1} title="صفحة البيانات" className="pp-identity">
      <div className="pp-id-grid">
        <div className="pp-photo">
          <HolderPortrait />
          <span className="pp-photo-seal" aria-hidden="true">
            <Emblem size={46} />
          </span>
        </div>
        <dl className="pp-fields">
          <div className="pp-field wide">
            <dt>الاسم</dt>
            <dd>{studentName.trim() || '—'}</dd>
          </div>
          <div className="pp-field">
            <dt>الصف</dt>
            <dd>{grade.trim() || '—'}</dd>
          </div>
          <div className="pp-field">
            <dt>رقم الجواز</dt>
            <dd className="pp-no">{passportNumber(studentName)}</dd>
          </div>
          <div className="pp-field wide">
            <dt>المدرسة</dt>
            <dd>{school.trim() || '—'}</dd>
          </div>
          <div className="pp-field">
            <dt>المعلمة</dt>
            <dd>{teacher.trim() || '—'}</dd>
          </div>
          <div className="pp-field">
            <dt>تاريخ الإصدار</dt>
            <dd>{fullDate(progress.issuedAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="pp-rank">
        <span className="pp-rank-icon" aria-hidden="true">
          {rank.icon}
        </span>
        <div className="pp-rank-text">
          <span className="pp-rank-label">الرتبة في المدينة</span>
          <strong className="pp-rank-title">{rank.title}</strong>
          {rank.next ? (
            <span className="pp-rank-next">
              {toNext === 1 ? 'ختم واحد' : <><Num v={toNext} /> أختام</>} للوصول إلى رتبة «{rank.next.title}»
            </span>
          ) : (
            <span className="pp-rank-next">أعلى رتبة في المدينة!</span>
          )}
        </div>
        <ol className="pp-rank-ladder" aria-label="سلّم الرتب">
          {RANKS.map((r, i) => (
            <li key={r.title} className={i <= rank.index ? 'is-on' : ''} title={r.title}>
              <span aria-hidden="true">{r.icon}</span>
              <span className="sr-only">{r.title}</span>
            </li>
          ))}
        </ol>
      </div>

      <p className="pp-mrz" aria-hidden="true" dir="rtl">
        ‹‹مدينة‹الرياضيات‹‹{mrzName}‹‹{fmt(stamps)}‹{fmt(total)}‹‹‹‹‹‹
      </p>
    </Page>
  );
}

const ROTS = [-9, 6, -4, 10, -7, 4, -11, 7];

function StampsPage({ ids, num }: { ids: DistrictId[]; num: number }) {
  const { districtProgress } = useProgress();
  const earned = ids.filter((id) => districtProgress(id).stamp).length;
  return (
    <Page num={num} title="أختام الأحياء" className="pp-visas">
      <p className="pp-visa-count">
        <Num v={earned} /> من <Num v={ids.length} /> أختام ذهبية
      </p>
      <ul className="pp-stamp-grid">
        {ids.map((id, i) => {
          const d = DISTRICTS[id];
          const dp = districtProgress(id);
          return (
            <li key={id}>
              {dp.stamp ? (
                <GoldStamp icon={d.icon} name={d.name} ribbon={d.color} earned rotate={ROTS[i % ROTS.length]} size={128} date={arabicShortDate(dp.stampedAt)} />
              ) : (
                <a href={`#/d/${id}`} className="pp-stamp-link" aria-label={`اذهبي إلى ${d.name} لتحصلي على ختمه`}>
                  <GoldStamp icon={d.icon} name={d.name} earned={false} rotate={0} size={128} />
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </Page>
  );
}

function GrandPage({ num, progress, stamps, total }: { num: number; progress: Progress; stamps: number; total: number }) {
  return (
    <Page num={num} title="الختم الكبير" className="pp-grand">
      <div className="pp-grand-stamp">
        <GoldStamp icon="⛲" name="حديقة المدينة" ribbon="#34D6A6" earned={progress.finalDone} special size={190} rotate={-4} date={arabicShortDate(progress.finalAt)} />
      </div>
      {progress.finalDone ? (
        <p className="pp-grand-text">افتتحتِ حديقة المدينة بنجاح، وهذا أكبر ختم في الجواز.</p>
      ) : (
        <>
          <p className="pp-grand-text">يُمنح هذا الختم عند إتمام المهمة الختامية «افتتاح حديقة المدينة».</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/final')}>
            إلى المهمة الختامية
          </button>
        </>
      )}
      <div className="pp-meter" aria-label={`الأختام المجموعة ${fmt(stamps)} من ${fmt(total)}`}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={i < stamps ? 'is-on' : ''} aria-hidden="true" />
        ))}
      </div>
    </Page>
  );
}

function SkillsPage({ num }: { num: number }) {
  const { progress } = useProgress();
  const ids = enabledDistricts();
  const rows = ids.flatMap((id) => DISTRICTS[id].skills.map((s) => ({ s, id })));
  const tried = rows.filter(({ s }) => progress.skills[s]);
  const mastered = tried.filter(({ s }) => isMastered(progress.skills[s]!));
  const needs = tried.filter(({ s }) => !isMastered(progress.skills[s]!));
  return (
    <Page num={num} title="تأشيرات المهارات" className="pp-skills">
      {tried.length === 0 && <p className="muted">تظهر هنا تأشيرة لكل مهارة بعد حل مهماتها.</p>}
      {mastered.length > 0 && (
        <ul className="pp-visa-list">
          {mastered.map(({ s, id }) => (
            <li key={s} className="pp-visa is-ok" style={{ ['--c' as string]: DISTRICTS[id].color }}>
              <span className="pp-visa-icon" aria-hidden="true">
                {DISTRICTS[id].icon}
              </span>
              <span className="pp-visa-text">{SKILL_NAMES[s as SkillId]}</span>
              <span className="pp-visa-mark">متقنة</span>
            </li>
          ))}
        </ul>
      )}
      {needs.length > 0 && (
        <>
          <h3 className="pp-sub">تحتاج تدريبًا إضافيًا</h3>
          <ul className="pp-visa-list">
            {needs.map(({ s, id }) => (
              <li key={s} className="pp-visa is-practice" style={{ ['--c' as string]: DISTRICTS[id].color }}>
                <span className="pp-visa-icon" aria-hidden="true">
                  {DISTRICTS[id].icon}
                </span>
                <span className="pp-visa-text">{SKILL_NAMES[s as SkillId]}</span>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(`/d/${id}?practice=weak&t=${Date.now()}`)}>
                  تدرّبي مجددًا
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Page>
  );
}

/* ---------------- الشاشة ---------------- */

export function Passport() {
  const { progress, districtProgress, resetAll } = useProgress();
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<'next' | 'prev' | null>(null);
  const wide = useMedia('(min-width: 900px)');
  const ids = enabledDistricts();
  const stamps = ids.filter((id) => districtProgress(id).stamp).length;
  const name = progress.info.studentName.trim();

  const pages = [
    <IdentityPage key="id" progress={progress} stamps={stamps} total={ids.length} />,
    <StampsPage key="st" ids={ids} num={2} />,
    <GrandPage key="gr" num={3} progress={progress} stamps={stamps} total={ids.length} />,
    <SkillsPage key="sk" num={4} />,
  ];
  const per = wide ? 2 : 1;
  const spreads = Math.ceil(pages.length / per);
  const current = Math.min(spread, spreads - 1);
  const shown = pages.slice(current * per, current * per + per);

  const go = (dir: 'next' | 'prev') => {
    const n = dir === 'next' ? current + 1 : current - 1;
    if (n < 0 || n >= spreads) return;
    sfx.tap();
    setTurn(dir);
    setSpread(n);
  };

  return (
    <main className="page passport-page">
      <h1 className="sr-only">جواز مدينة الرياضيات</h1>
      {!open ? (
        <section className="pp-closed" aria-labelledby="pp-title">
          <button
            type="button"
            className="pp-cover"
            onClick={() => {
              sfx.stamp();
              setOpen(true);
            }}
            aria-label="افتحي الجواز"
          >
            <span className="pp-cover-band" aria-hidden="true" />
            <span className="pp-cover-top">مدينة الرياضيات</span>
            <Emblem size={150} />
            <span id="pp-title" className="pp-cover-title">
              جواز مدينة الرياضيات
            </span>
            <span className="pp-cover-name">{name || 'بانية المدينة'}</span>
            <span className="pp-cover-count">
              <Num v={stamps} /> / <Num v={ids.length} /> ختم ذهبي
            </span>
            <span className="pp-cover-chip" aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-primary btn-xl" onClick={() => setOpen(true)}>
            افتحي الجواز
          </button>
        </section>
      ) : (
        <section className="pp-book-wrap" aria-label="جواز مدينة الرياضيات">
          <div className="pp-book-bar">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
              إغلاق الجواز
            </button>
            <span className="pp-book-pos">
              {wide ? 'صفحتان' : 'صفحة'} <Num v={current + 1} /> من <Num v={spreads} />
            </span>
          </div>
          <div className={`pp-book ${wide ? 'is-spread' : 'is-single'}`}>
            <div key={current} className={`pp-spread ${turn ? `turn-${turn}` : 'turn-open'}`}>
              {shown}
            </div>
          </div>
          <nav className="pp-book-nav" aria-label="تقليب صفحات الجواز">
            <button type="button" className="btn btn-ghost" disabled={current === 0} onClick={() => go('prev')}>
              <span className="lg-only">الصفحة </span>السابقة
            </button>
            <div className="pp-tabs">
              {Array.from({ length: spreads }, (_, k) => (
                <button
                  key={k}
                  type="button"
                  className={`dot ${k === current ? 'is-on' : ''}`}
                  aria-label={`الصفحة ${fmt(k + 1)}`}
                  aria-current={k === current ? 'page' : undefined}
                  onClick={() => {
                    setTurn(k > current ? 'next' : 'prev');
                    setSpread(k);
                  }}
                />
              ))}
            </div>
            <button type="button" className="btn btn-primary" disabled={current === spreads - 1} onClick={() => go('next')}>
              <span className="lg-only">الصفحة </span>التالية
            </button>
          </nav>
        </section>
      )}

      <section className="card" aria-labelledby="info-title">
        <h2 id="info-title">بيانات المشروع</h2>
        <ProjectInfoForm />
      </section>

      <section className="card danger-zone">
        <h2>بدء رحلة جديدة</h2>
        <p>يحذف الأختام والتقدّم المحفوظ في هذا الجهاز، ويُبقي بيانات المشروع.</p>
        <button type="button" className="btn btn-danger" onClick={() => setConfirm(true)}>
          بدء رحلة جديدة
        </button>
      </section>

      <ConfirmDialog
        open={confirm}
        title="هل تريدين بدء رحلة جديدة؟"
        body="سيُحذف كل التقدّم والأختام المحفوظة. لا يمكن التراجع عن ذلك."
        confirmLabel="نعم، ابدئي من جديد"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          resetAll();
          setConfirm(false);
          navigate('/city');
        }}
      />
    </main>
  );
}

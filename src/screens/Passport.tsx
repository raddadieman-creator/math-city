import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { enabledDistricts, branding, type DistrictId } from '../config/settings';
import { DISTRICTS, SKILL_NAMES } from '../content/districts';
import type { SkillId } from '../content/types';
import { isMastered, useProgress, type Progress } from '../state/progress';
import { navigate, useMedia } from '../lib/router';
import { fmt } from '../lib/numbers';
import { sfx } from '../lib/sound';
import { Num } from '../components/Num';
import { GoldStamp, arabicShortDate } from '../components/GoldStamp';
import { Emblem } from '../components/Emblem';
import { ExportBar } from '../components/ExportBar';

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
  { min: 8, title: `نجمة ${branding.cityName}`, icon: '👑' },
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

/** صورة حاملة الجواز: أميرة ببشرة حنطية وشعر بني متوسط الطول */
function HolderPortrait() {
  return (
    <svg viewBox="0 0 120 140" className="pp-photo-svg" aria-hidden="true">
      <defs>
        <linearGradient id="hpBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE6F3" />
          <stop offset="1" stopColor="#E9E2FF" />
        </linearGradient>
        <linearGradient id="hpHair" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9A6338" />
          <stop offset="1" stopColor="#7A4A26" />
        </linearGradient>
        <linearGradient id="hpDress" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF9CCB" />
          <stop offset="1" stopColor="#F26FAE" />
        </linearGradient>
        <linearGradient id="hpGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE68A" />
          <stop offset="1" stopColor="#E8A912" />
        </linearGradient>
      </defs>
      <rect width="120" height="140" fill="url(#hpBg)" />
      <g fill="#FFFFFF" opacity="0.9">
        <path d="M14 22 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" />
        <path d="M104 48 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 z" />
        <circle cx="20" cy="54" r="1.4" />
        <circle cx="100" cy="20" r="1.6" />
      </g>

      {/* الشعر الخلفي (بني متوسط، يصل إلى الكتفين) */}
      <path d="M33 60 C 30 36 44 24 60 24 C 76 24 90 36 87 60 C 88 76 93 88 92 98 C 91 104 86 106 82 102 C 80 106 75 106 73 102 L 47 102 C 45 106 40 106 38 102 C 34 106 29 104 28 98 C 27 88 32 76 33 60 Z" fill="url(#hpHair)" stroke="#2A2B5F" strokeWidth="2.4" strokeLinejoin="round" />

      {/* الفستان */}
      <path d="M22 140 C 22 118 34 103 48 100 L 72 100 C 86 103 98 118 98 140 Z" fill="url(#hpDress)" stroke="#2A2B5F" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="32" cy="113" r="8.5" fill="#FFC2DE" stroke="#2A2B5F" strokeWidth="2.2" />
      <circle cx="88" cy="113" r="8.5" fill="#FFC2DE" stroke="#2A2B5F" strokeWidth="2.2" />
      <path d="M46 100 Q 60 112 74 100" fill="#FFE1EF" stroke="#2A2B5F" strokeWidth="2" />
      {/* الرقبة */}
      <path d="M53.5 87 L 53.5 100 Q 60 104 66.5 100 L 66.5 87 Z" fill="#D9A378" stroke="#2A2B5F" strokeWidth="2" />
      {/* عقد ذهبي */}
      <path d="M51 99.5 Q 60 108 69 99.5" fill="none" stroke="#E8A912" strokeWidth="1.8" />
      <circle cx="60" cy="105" r="2.6" fill="#8E7CFF" stroke="#2A2B5F" strokeWidth="1.2" />

      {/* الوجه (بشرة حنطية) */}
      <ellipse cx="60" cy="66" rx="24" ry="25" fill="#E6B98F" stroke="#2A2B5F" strokeWidth="2.4" />

      {/* خصلات جانبية */}
      <path d="M36 52 C 31 66 32 84 36 96 C 38 99 41 97 40 93 C 41 84 41 76 42 66 Z" fill="url(#hpHair)" stroke="#2A2B5F" strokeWidth="2" strokeLinejoin="round" />
      <path d="M84 52 C 89 66 88 84 84 96 C 82 99 79 97 80 93 C 79 84 79 76 78 66 Z" fill="url(#hpHair)" stroke="#2A2B5F" strokeWidth="2" strokeLinejoin="round" />
      {/* الغُرّة */}
      <path d="M35 56 C 36 38 48 31 60 31 C 73 31 85 38 85 56 C 78 50 70 46 62 45 C 58 50 50 54 42 54 C 40 55 37 56 35 56 Z" fill="url(#hpHair)" stroke="#2A2B5F" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M70 37 Q 76 40 79 46" stroke="#C08654" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M46 38 Q 54 34 62 36" stroke="#C08654" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />

      {/* التاج */}
      <g stroke="#2A2B5F" strokeWidth="1.8" strokeLinejoin="round">
        <path d="M44 34 L 46 20 L 53 28 L 60 16 L 67 28 L 74 20 L 76 34 Z" fill="url(#hpGold)" />
        <rect x="43" y="32" width="34" height="5" rx="2.5" fill="url(#hpGold)" />
        <circle cx="46" cy="19" r="2.2" fill="#FFF3B0" />
        <circle cx="60" cy="15" r="2.6" fill="#FFF3B0" />
        <circle cx="74" cy="19" r="2.2" fill="#FFF3B0" />
      </g>
      <circle cx="60" cy="27.5" r="3" fill="#FF6FA8" stroke="#2A2B5F" strokeWidth="1.4" />
      <circle cx="51" cy="34.5" r="1.5" fill="#5ED6F2" />
      <circle cx="69" cy="34.5" r="1.5" fill="#5ED6F2" />

      {/* الحاجبان */}
      <path d="M45 59 Q 50 56.5 55 58.5" stroke="#6B4022" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M65 58.5 Q 70 56.5 75 59" stroke="#6B4022" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* العينان */}
      <ellipse cx="50" cy="67" rx="4.4" ry="5.4" fill="#4A2A18" />
      <ellipse cx="70" cy="67" rx="4.4" ry="5.4" fill="#4A2A18" />
      <circle cx="51.6" cy="65" r="1.7" fill="#fff" />
      <circle cx="71.6" cy="65" r="1.7" fill="#fff" />
      <circle cx="48.8" cy="69.4" r="0.8" fill="#fff" />
      <circle cx="68.8" cy="69.4" r="0.8" fill="#fff" />
      <path d="M44.6 63.6 Q 50 60 55.4 63.6" stroke="#2A2B5F" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M64.6 63.6 Q 70 60 75.4 63.6" stroke="#2A2B5F" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M44.8 63.8 L 43 62.4" stroke="#2A2B5F" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M75.2 63.8 L 77 62.4" stroke="#2A2B5F" strokeWidth="1.4" strokeLinecap="round" />
      {/* الخدود والأنف والابتسامة */}
      <ellipse cx="43.5" cy="75" rx="4.4" ry="2.8" fill="#FF8C9E" opacity="0.45" />
      <ellipse cx="76.5" cy="75" rx="4.4" ry="2.8" fill="#FF8C9E" opacity="0.45" />
      <path d="M59 72.5 Q 60 74 61 72.5" stroke="#B47A52" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M54 78 Q 60 83.5 66 78" stroke="#B5405A" strokeWidth="2" fill="#F4A0AE" strokeLinecap="round" strokeLinejoin="round" />
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
  const { grade, school, teacher } = progress.info;
  const studentName = progress.playerName;
  const rank = rankFor(stamps, total);
  const toNext = rank.next ? Math.max(0, Math.ceil((rank.next.min / 8) * total) - stamps) : 0;
  const mrzName = (studentName.trim() || 'بانية المدينة').replace(/\s+/g, '‹');
  return (
    <Page num={1} title="صفحة البيانات" className="pp-identity">
      <div className="pp-id-grid">
        <div className="pp-photo">
          <HolderPortrait />
          <span className="pp-photo-seal" aria-hidden="true">
            <Emblem size={34} />
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
        ‹‹{branding.cityName.replace(/\s+/g, '‹')}‹‹{mrzName}‹‹{fmt(stamps)}‹{fmt(total)}‹‹‹‹‹‹
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

/* ---------------- نسخة التحميل والطباعة ---------------- */

function PassportSheet({ innerRef, progress, ids, stamps }: { innerRef: Ref<HTMLDivElement>; progress: Progress; ids: DistrictId[]; stamps: number }) {
  return (
    <div ref={innerRef} className="pp-sheet">
      <header className="pp-sheet-head">
        <span className="pp-sheet-emblem">
          <Emblem size={64} />
        </span>
        <div>
          <strong>{branding.passportName}</strong>
          <span>
            {progress.playerName.trim() || 'بانية المدينة'} — <Num v={stamps} /> / <Num v={ids.length} /> ختم ذهبي
          </span>
        </div>
      </header>
      <div className="pp-sheet-grid">
        <IdentityPage progress={progress} stamps={stamps} total={ids.length} />
        <StampsPage ids={ids} num={2} />
      </div>
      <div className="pp-sheet-grid pp-sheet-row2">
        <GrandPage num={3} progress={progress} stamps={stamps} total={ids.length} />
        <SkillsPage num={4} />
      </div>
    </div>
  );
}

function PassportExport({ progress, ids, stamps }: { progress: Progress; ids: DistrictId[]; stamps: number }) {
  const [stage, setStage] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prepare = () =>
    new Promise<HTMLElement | null>((resolve) => {
      setStage(true);
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(ref.current)));
    });
  return (
    <>
      <ExportBar prepare={prepare} filename="جواز-المدينة.png" what="الجواز" onDone={() => setStage(false)} />
      {stage &&
        createPortal(
          <div className="export-stage" aria-hidden="true">
            <PassportSheet innerRef={ref} progress={progress} ids={ids} stamps={stamps} />
          </div>,
          document.body,
        )}
    </>
  );
}

/* ---------------- الشاشة ---------------- */

export function Passport() {
  const { progress, districtProgress, resetAll, setPlayerName } = useProgress();
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<'next' | 'prev' | null>(null);
  const wide = useMedia('(min-width: 900px)');
  const ids = enabledDistricts();
  const stamps = ids.filter((id) => districtProgress(id).stamp).length;
  const name = progress.playerName.trim();

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
      <h1 className="sr-only">{branding.passportName}</h1>
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
            <span className="pp-cover-top">{branding.cityName}</span>
            <Emblem size={150} />
            <span id="pp-title" className="pp-cover-title">
              {branding.passportName}
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
          <PassportExport progress={progress} ids={ids} stamps={stamps} />
        </section>
      ) : (
        <section className="pp-book-wrap" aria-label={branding.passportName}>
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
          <PassportExport progress={progress} ids={ids} stamps={stamps} />
        </section>
      )}

      <section className="card" aria-labelledby="info-title">
        <h2 id="info-title">اسمكِ في الجواز</h2>
        <div className="field">
          <label htmlFor="pp-player-name">اسم حاملة الجواز</label>
          <input
            id="pp-player-name"
            type="text"
            value={progress.playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            autoComplete="name"
            maxLength={40}
            placeholder="اكتبي اسمكِ"
          />
        </div>
      </section>

      <section className="card danger-zone">
        <h2>بدء رحلة جديدة</h2>
        <p>يحذف الأختام والتقدّم المحفوظ في هذا الجهاز، ويُبقي الاسم.</p>
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

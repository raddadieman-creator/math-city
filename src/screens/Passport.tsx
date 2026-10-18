import { useEffect, useId, useRef, useState, type ReactNode, type Ref } from 'react';
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

/** صورة حاملة الجواز: أميرة بأسلوب الأنيمي، بشرة حنطية وشعر بني متوسط الطول */
function HolderPortrait() {
  const u = 'hp' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg viewBox="0 0 240 280" className="pp-photo-svg" aria-hidden="true">
      <defs>
        <radialGradient id={`${u}Bg`} cx="0.5" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#FFF5FB" />
          <stop offset="0.6" stopColor="#FBDCEE" />
          <stop offset="1" stopColor="#DECFFF" />
        </radialGradient>
        <linearGradient id={`${u}Hair`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#94603A" />
          <stop offset="1" stopColor="#6B4022" />
        </linearGradient>
        <linearGradient id={`${u}HairFront`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#A9713F" />
          <stop offset="1" stopColor="#83512B" />
        </linearGradient>
        <linearGradient id={`${u}Skin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EAC09A" />
          <stop offset="1" stopColor="#F2CCA8" />
        </linearGradient>
        <linearGradient id={`${u}Iris`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B170B" />
          <stop offset="0.5" stopColor="#7A4420" />
          <stop offset="1" stopColor="#E0A85C" />
        </linearGradient>
        <linearGradient id={`${u}Dress`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFBEDD" />
          <stop offset="1" stopColor="#EE82BA" />
        </linearGradient>
        <linearGradient id={`${u}Gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF2B0" />
          <stop offset="0.5" stopColor="#F7C948" />
          <stop offset="1" stopColor="#D9980F" />
        </linearGradient>
        <radialGradient id={`${u}Blush`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FF8DA2" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FF8DA2" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${u}EyeL`}><path d="M86 140 C 87 127 107 122 115 133 C 118 146 111 158 101 158 C 92 158 86 150 86 140 Z" /></clipPath>
        <clipPath id={`${u}EyeR`}><path d="M154 140 C 153 127 133 122 125 133 C 122 146 129 158 139 158 C 148 158 154 150 154 140 Z" /></clipPath>
      </defs>

      {/* الخلفية */}
      <rect width="240" height="280" fill={`url(#${u}Bg)`} />
      <g fill="#FFFFFF">
        <circle cx="28" cy="58" r="10" opacity="0.35" />
        <circle cx="212" cy="100" r="13" opacity="0.3" />
        <circle cx="204" cy="30" r="6" opacity="0.5" />
        <path d="M34 116 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 z" opacity="0.95" />
        <path d="M208 156 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" opacity="0.95" />
        <path d="M190 58 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 z" opacity="0.9" />
      </g>

      {/* الشعر الخلفي (بني متوسط الطول، يتجاوز الكتفين قليلًا) */}
      <path d="M120 40 C 80 40 60 72 60 112 C 60 150 56 186 50 216 C 46 234 54 246 66 242 C 70 252 84 254 90 244 L 150 244 C 156 254 170 252 174 242 C 186 246 194 234 190 216 C 184 186 180 150 180 112 C 180 72 160 40 120 40 Z" fill={`url(#${u}Hair)`} stroke="#4A2A14" strokeWidth="1.5" strokeLinejoin="round" />

      {/* الرقبة والفستان */}
      <path d="M112 176 L 112 202 Q 120 207 128 202 L 128 176 Z" fill="#DCA67B" />
      <path d="M38 280 C 42 238 70 210 102 200 L 138 200 C 170 210 198 238 202 280 Z" fill={`url(#${u}Dress)`} stroke="#A3477A" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M56 238 C 48 222 62 206 82 208 C 92 218 88 236 74 242 C 66 244 60 242 56 238 Z" fill="#FFD3E8" stroke="#A3477A" strokeWidth="1.3" />
      <path d="M184 238 C 192 222 178 206 158 208 C 148 218 152 236 166 242 C 174 244 180 242 184 238 Z" fill="#FFD3E8" stroke="#A3477A" strokeWidth="1.3" />
      <path d="M98 200 Q 103 215 111 209 Q 120 220 129 209 Q 137 215 142 200 Z" fill="#FFFFFF" stroke="#D08AAE" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="120" cy="219" r="5" fill={`url(#${u}Gold)`} stroke="#A86F0C" strokeWidth="1" />
      <circle cx="120" cy="219" r="2.4" fill="#FF6FA8" />

      {/* الوجه */}
      <path d="M72 100 C 72 134 82 158 100 172 Q 120 186 140 172 C 158 158 168 134 168 100 Z" fill={`url(#${u}Skin)`} stroke="#A0653F" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M74 108 Q 120 128 166 108 L 166 100 L 74 100 Z" fill="#D29A70" opacity="0.35" />

      {/* الحاجبان */}
      <path d="M90 121 Q 100 117 110 119.5" stroke="#5A321A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M150 121 Q 140 117 130 119.5" stroke="#5A321A" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* العين اليسرى */}
      <path d="M86 140 C 87 127 107 122 115 133 C 118 146 111 158 101 158 C 92 158 86 150 86 140 Z" fill="#FFFFFF" />
      <g clipPath={`url(#${u}EyeL)`}>
        <ellipse cx="101.5" cy="143" rx="12" ry="15" fill={`url(#${u}Iris)`} />
        <ellipse cx="101.5" cy="142" rx="5.6" ry="7.6" fill="#22110A" />
        <ellipse cx="102" cy="152" rx="7.5" ry="3.4" fill="#F6CC86" opacity="0.6" />
        <path d="M86 128 L 118 128 L 118 133 Q 102 126 86 136 Z" fill="#000" opacity="0.12" />
      </g>
      <ellipse cx="97.5" cy="137" rx="3.8" ry="4.8" fill="#FFFFFF" />
      <circle cx="106.5" cy="148" r="1.9" fill="#FFFFFF" />
      <circle cx="104.5" cy="135.5" r="1.1" fill="#FFFFFF" opacity="0.9" />
      <path d="M84 140 C 86 124 109 119 117.5 131 L 117 134.5 C 108 125 91 128 86.5 141 Z" fill="#2A160B" />
      <path d="M85 136 Q 81 133 80 129" stroke="#2A160B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M87 131 Q 85 127 85.5 124" stroke="#2A160B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M94 157 Q 102 160 110 155" stroke="#8A5232" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* العين اليمنى */}
      <path d="M154 140 C 153 127 133 122 125 133 C 122 146 129 158 139 158 C 148 158 154 150 154 140 Z" fill="#FFFFFF" />
      <g clipPath={`url(#${u}EyeR)`}>
        <ellipse cx="138.5" cy="143" rx="12" ry="15" fill={`url(#${u}Iris)`} />
        <ellipse cx="138.5" cy="142" rx="5.6" ry="7.6" fill="#22110A" />
        <ellipse cx="138" cy="152" rx="7.5" ry="3.4" fill="#F6CC86" opacity="0.6" />
        <path d="M154 128 L 122 128 L 122 133 Q 138 126 154 136 Z" fill="#000" opacity="0.12" />
      </g>
      <ellipse cx="133.5" cy="137" rx="3.8" ry="4.8" fill="#FFFFFF" />
      <circle cx="142.5" cy="148" r="1.9" fill="#FFFFFF" />
      <circle cx="140.5" cy="135.5" r="1.1" fill="#FFFFFF" opacity="0.9" />
      <path d="M156 140 C 154 124 131 119 122.5 131 L 123 134.5 C 132 125 149 128 153.5 141 Z" fill="#2A160B" />
      <path d="M155 136 Q 159 133 160 129" stroke="#2A160B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M153 131 Q 155 127 154.5 124" stroke="#2A160B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <path d="M146 157 Q 138 160 130 155" stroke="#8A5232" strokeWidth="1" fill="none" strokeLinecap="round" />

      {/* الخدود */}
      <ellipse cx="89" cy="163" rx="11" ry="6" fill={`url(#${u}Blush)`} />
      <ellipse cx="151" cy="163" rx="11" ry="6" fill={`url(#${u}Blush)`} />
      {/* الأنف والفم */}
      <path d="M120 160 Q 121.6 163 119.6 164" stroke="#B57651" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M112.5 169 Q 120 177 127.5 169 Q 120 172 112.5 169 Z" fill="#D9566F" stroke="#A8384F" strokeWidth="1.1" strokeLinejoin="round" />

      {/* الخصلات الجانبية */}
      <path d="M74 104 C 66 132 64 166 68 192 C 70 206 66 218 60 224 C 72 224 80 212 80 198 C 82 172 80 138 84 112 Z" fill={`url(#${u}HairFront)`} stroke="#4A2A14" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M166 104 C 174 132 176 166 172 192 C 170 206 174 218 180 224 C 168 224 160 212 160 198 C 158 172 160 138 156 112 Z" fill={`url(#${u}HairFront)`} stroke="#4A2A14" strokeWidth="1.3" strokeLinejoin="round" />

      {/* الغُرّة المنسدلة */}
      <path d="M66 118 C 60 68 88 42 120 42 C 152 42 180 68 174 118 C 170 106 166 98 160 92 C 160 104 156 112 150 116 C 150 104 146 96 138 90 C 138 102 132 110 124 114 C 124 102 120 94 112 90 C 108 102 102 110 94 114 C 96 104 96 98 92 92 C 86 102 80 110 72 114 C 72 106 72 100 70 96 C 68 104 66 110 66 118 Z" fill={`url(#${u}HairFront)`} stroke="#4A2A14" strokeWidth="1.4" strokeLinejoin="round" />
      {/* لمعة الشعر */}
      <path d="M82 70 Q 120 54 158 70 Q 156 78 150 77 Q 120 66 90 77 Q 84 78 82 70 Z" fill="#DDA673" opacity="0.6" />
      <path d="M112 92 Q 114 100 112 108 M138 90 Q 142 98 142 106 M92 94 Q 92 100 90 106" stroke="#5E3618" strokeWidth="0.9" fill="none" opacity="0.45" />

      {/* التاج */}
      <g stroke="#A86F0C" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M90 58 Q 120 47 150 58 L 148 64 Q 120 54 92 64 Z" fill={`url(#${u}Gold)`} />
        <path d="M110 53 L 114 40 L 120 26 L 126 40 L 130 53 Q 120 50 110 53 Z" fill={`url(#${u}Gold)`} />
        <path d="M96 57 L 99 45 L 105 54 Z" fill={`url(#${u}Gold)`} />
        <path d="M144 57 L 141 45 L 135 54 Z" fill={`url(#${u}Gold)`} />
      </g>
      <path d="M120 34 l3.5 6.5 -3.5 6.5 -3.5 -6.5 z" fill="#FF5E9E" stroke="#A8305F" strokeWidth="1" />
      <circle cx="119" cy="38" r="1" fill="#FFFFFF" />
      <circle cx="99" cy="45" r="2" fill="#7FE0FF" stroke="#2E8AAE" strokeWidth="0.8" />
      <circle cx="141" cy="45" r="2" fill="#7FE0FF" stroke="#2E8AAE" strokeWidth="0.8" />
      <circle cx="120" cy="26" r="2.2" fill="#FFFBE0" stroke="#A86F0C" strokeWidth="0.8" />
      <circle cx="108" cy="56" r="1.4" fill="#FFFFFF" />
      <circle cx="132" cy="56" r="1.4" fill="#FFFFFF" />
      {/* وردة في الشعر */}
      <g transform="translate(160 84)">
        <g fill="#FF9EC8" stroke="#C2457F" strokeWidth="1">
          <circle cx="0" cy="-6" r="5" /><circle cx="5.7" cy="-1.8" r="5" /><circle cx="3.5" cy="4.9" r="5" /><circle cx="-3.5" cy="4.9" r="5" /><circle cx="-5.7" cy="-1.8" r="5" />
        </g>
        <circle r="3.4" fill={`url(#${u}Gold)`} stroke="#A86F0C" strokeWidth="0.8" />
        <circle cx="-1" cy="-1" r="1" fill="#FFFFFF" />
      </g>
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

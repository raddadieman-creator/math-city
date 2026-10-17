import { backTarget, goBack } from '../lib/router';
import { DISTRICTS } from '../content/districts';
import type { DistrictId } from '../config/settings';

/** اسم الصفحة كما تفهمه الطالبة */
export function pageName(path: string): string {
  const [base] = path.split('?');
  const parts = base.split('/').filter(Boolean);
  if (parts.length === 0) return 'البداية';
  if (parts[0] === 'city') return 'الخريطة';
  if (parts[0] === 'passport') return 'الجواز';
  if (parts[0] === 'final') return 'الحديقة';
  if (parts[0] === 'tour') return 'الجولة';
  if (parts[0] === 'd' && parts[1] && parts[1] in DISTRICTS) return DISTRICTS[parts[1] as DistrictId].name;
  return 'الصفحة السابقة';
}

/** زر «رجوع» يعيد إلى الصفحة السابقة فعلًا (وليس إلى الصفحة الرئيسية دائمًا) */
export function BackButton({ path, className = '' }: { path: string; className?: string }) {
  void path; // يعاد رسم الزر مع كل تغيّر في المسار
  const dest = pageName(backTarget());
  return (
    <button
      type="button"
      className={`back-button ${className}`}
      onClick={goBack}
      aria-label={`رجوع إلى ${dest}`}
      title={`رجوع إلى ${dest}`}
    >
      <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M7 4 L13 10 L7 16" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="back-text">
        <span className="back-main">رجوع</span>
        <span className="back-dest">إلى {dest}</span>
      </span>
    </button>
  );
}

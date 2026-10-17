import type { ReactNode } from 'react';

type Mood = 'happy' | 'think' | 'cheer';

/** المرشدة «نُهى»: شخصية كرتونية مرسومة داخل المشروع */
export function NohaFace({ mood = 'happy', size = 88 }: { mood?: Mood; size?: number }) {
  return (
    <svg className={`noha noha-${mood}`} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="62" r="56" fill="#DFF5FC" />
      {/* الحجاب */}
      <path d="M22 70 C 18 32 42 14 60 14 C 80 14 102 32 98 70 C 98 96 84 112 60 112 C 36 112 22 96 22 70 Z" fill="#FF7F6E" />
      <path d="M30 104 C 40 96 50 94 60 94 C 70 94 80 96 90 104 C 82 112 70 116 60 116 C 50 116 38 112 30 104 Z" fill="#E86A5A" />
      {/* الوجه */}
      <ellipse cx="60" cy="64" rx="27" ry="29" fill="#F6C9A8" />
      {/* العينان */}
      {mood === 'cheer' ? (
        <>
          <path d="M44 60 Q 49 54 54 60" stroke="#24324A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M66 60 Q 71 54 76 60" stroke="#24324A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="49" cy="60" r="4.2" fill="#24324A" />
          <circle cx="71" cy="60" r="4.2" fill="#24324A" />
          <circle cx="50.5" cy="58.5" r="1.4" fill="#fff" />
          <circle cx="72.5" cy="58.5" r="1.4" fill="#fff" />
        </>
      )}
      {/* الخدان */}
      <circle cx="42" cy="72" r="5" fill="#FF9F95" opacity="0.6" />
      <circle cx="78" cy="72" r="5" fill="#FF9F95" opacity="0.6" />
      {/* الفم */}
      {mood === 'think' ? (
        <path d="M53 78 Q 60 75 67 78" stroke="#9A4A3E" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M50 75 Q 60 86 70 75" stroke="#9A4A3E" strokeWidth="3" fill={mood === 'cheer' ? '#fff' : 'none'} strokeLinecap="round" />
      )}
      {/* نجمة صغيرة على الحجاب */}
      <path d="M86 34 l3 6 6 1 -4.5 4 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4 6 -1 z" fill="#FFC94D" />
      {mood === 'think' && <text x="96" y="30" fontSize="20" fill="#24324A">؟</text>}
    </svg>
  );
}

export function Noha({ children, mood = 'happy', compact = false }: { children: ReactNode; mood?: Mood; compact?: boolean }) {
  return (
    <div className={`noha-say ${compact ? 'is-compact' : ''}`}>
      <NohaFace mood={mood} size={compact ? 60 : 84} />
      <div className="bubble" role="note">
        <span className="bubble-name">نُهى</span>
        <div className="bubble-text">{children}</div>
      </div>
    </div>
  );
}

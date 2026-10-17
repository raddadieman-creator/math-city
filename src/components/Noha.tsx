import { useId, type ReactNode } from 'react';

type Mood = 'happy' | 'think' | 'cheer';

const INK = '#2A2B5F';

/**
 * المرشدة «نُهى»: بنت كرتونية في العاشرة، بشعر بني مرفوع في ضفيرتين
 * بشريطتين ورديتين وطوق عليه نجمة، وعينين كبيرتين، وتحمل قلمًا سحريًا.
 * ثلاث حالات: happy ترحّب وتشرح، think تقدّم تلميحًا، cheer تحتفل.
 */
export function NohaFace({ mood = 'happy', size = 88 }: { mood?: Mood; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const skin = `sk${uid}`;
  const hair = `hr${uid}`;
  const HAIR_DARK = '#4A2C1F';
  return (
    <svg className={`noha noha-${mood}`} width={size} height={size} viewBox="0 0 140 140" aria-hidden="true">
      <defs>
        <radialGradient id={skin} cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#FFE6D3" />
          <stop offset="1" stopColor="#F5C3A0" />
        </radialGradient>
        <linearGradient id={hair} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A5236" />
          <stop offset="1" stopColor="#5E3624" />
        </linearGradient>
      </defs>

      {/* هالة خلفية */}
      <circle cx="70" cy="72" r="64" fill="#FFF0F7" />
      <circle cx="70" cy="72" r="64" fill="none" stroke="#FFD1E6" strokeWidth="4" strokeDasharray="3 7" />

      {/* الضفيرتان خلف الرأس */}
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M30 52 C 14 54 10 76 18 92 C 24 104 36 102 38 90 C 40 78 38 64 30 52 Z" fill={`url(#${hair})`} />
        <path d="M110 52 C 126 54 130 76 122 92 C 116 104 104 102 102 90 C 100 78 102 64 110 52 Z" fill={`url(#${hair})`} />
      </g>
      {/* الشريطتان */}
      {[
        [30, 50],
        [110, 50],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="2.2" strokeLinejoin="round">
          <path d="M0 0 L-11 -8 L-11 8 Z" fill="#FF7AB8" />
          <path d="M0 0 L11 -8 L11 8 Z" fill="#FF7AB8" />
          <circle r="4" fill="#FFC53D" />
        </g>
      ))}

      {/* الكتفان والقميص */}
      <path d="M28 138 C 30 112 48 101 70 101 C 92 101 110 112 112 138 Z" fill="#34D6A6" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M56 103 Q 70 116 84 103 L 80 101 Q 70 108 60 101 Z" fill="#fff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="64" y="94" width="12" height="10" rx="4" fill={`url(#${skin})`} />
      {/* شارة المرشدة */}
      <g transform="translate(92 122)">
        <circle r="9" fill="#FFC53D" stroke={INK} strokeWidth="2.5" />
        <path d="M0 -5 L1.6 -1.6 L5.3 -1.4 L2.4 1 L3.3 4.7 L0 2.7 L-3.3 4.7 L-2.4 1 L-5.3 -1.4 L-1.6 -1.6 Z" fill="#fff" />
      </g>

      {/* الشعر خلف الوجه */}
      <path d="M34 72 C 30 38 50 20 70 20 C 92 20 110 38 106 72 C 104 80 100 84 96 86 L 44 86 C 40 84 36 80 34 72 Z" fill={`url(#${hair})`} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />

      {/* الوجه */}
      <ellipse cx="70" cy="70" rx="29" ry="30" fill={`url(#${skin})`} stroke={INK} strokeWidth="3" />
      {/* الأذنان */}
      <ellipse cx="41" cy="72" rx="4.5" ry="6" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="99" cy="72" rx="4.5" ry="6" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.5" />

      {/* الغُرّة */}
      <path
        d="M41 62 C 42 42 56 32 70 32 C 86 32 98 42 99 62 C 92 54 84 50 76 50 C 78 54 78 56 76 58 C 70 52 60 50 52 52 C 50 56 46 60 41 62 Z"
        fill={`url(#${hair})`}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M56 40 C 62 36 70 35 78 37" fill="none" stroke="#B07A5A" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* الطوق والنجمة */}
      <path d="M40 58 C 44 34 96 34 100 58" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <path d="M40 58 C 44 34 96 34 100 58" fill="none" stroke="#8E7CFF" strokeWidth="4" strokeLinecap="round" />
      <path
        transform="translate(88 37) rotate(12)"
        d="M0 -9 L2.7 -2.8 L9 -2.8 L4 1.1 L5.8 7.8 L0 4 L-5.8 7.8 L-4 1.1 L-9 -2.8 L-2.7 -2.8 Z"
        fill="#FFC53D"
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* الحاجبان */}
      <g fill="none" stroke={HAIR_DARK} strokeWidth="2.6" strokeLinecap="round">
        {mood === 'think' ? (
          <>
            <path d="M50 57 Q 56 53 62 56" />
            <path d="M78 55 Q 84 52 90 56" />
          </>
        ) : (
          <>
            <path d="M50 58 Q 56 55 62 58" />
            <path d="M78 58 Q 84 55 90 58" />
          </>
        )}
      </g>

      {/* العينان */}
      {mood === 'cheer' ? (
        <g fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round">
          <path d="M51 68 Q 57 60 63 68" />
          <path d="M77 68 Q 83 60 89 68" />
        </g>
      ) : (
        <g>
          {[57, 83].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="68" rx="7.5" ry="8.8" fill="#fff" stroke={INK} strokeWidth="2.4" />
              <ellipse cx={cx + (mood === 'think' ? 1.5 : 0)} cy={mood === 'think' ? 65.5 : 69} rx="5.2" ry="6.2" fill="#3B2A55" />
              <circle cx={cx + 2} cy={mood === 'think' ? 63 : 66.5} r="2.2" fill="#fff" />
              <circle cx={cx - 1.6} cy={mood === 'think' ? 68 : 72} r="1" fill="#fff" />
              <path d={`M${cx + 6} 61 l3 -3 M${cx + 7.5} 64 l3.5 -1.5`} stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
            </g>
          ))}
        </g>
      )}

      {/* الأنف والخدّان */}
      <path d="M69 76 Q 70 78 72 77" fill="none" stroke="#C98366" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="48" cy="81" rx="6" ry="4" fill="#FF8FB1" opacity="0.55" />
      <ellipse cx="92" cy="81" rx="6" ry="4" fill="#FF8FB1" opacity="0.55" />

      {/* الفم */}
      {mood === 'think' ? (
        <path d="M63 85 Q 70 90 77 84" fill="none" stroke="#9A3F4E" strokeWidth="3" strokeLinecap="round" />
      ) : mood === 'cheer' ? (
        <path d="M60 82 Q 70 97 80 82 Z" fill="#E2546E" stroke="#9A3F4E" strokeWidth="2.5" strokeLinejoin="round" />
      ) : (
        <path d="M61 83 Q 70 92 79 83" fill="none" stroke="#9A3F4E" strokeWidth="3" strokeLinecap="round" />
      )}

      {/* اليد والقلم السحري */}
      {mood === 'think' ? (
        <g>
          <circle cx="46" cy="98" r="8" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.5" />
          <g transform="translate(116 22)">
            <circle r="13" fill="#fff" stroke={INK} strokeWidth="2.5" />
            <text x="0" y="6" textAnchor="middle" fontSize="18" fontWeight="800" fill="#8E74F2">
              ؟
            </text>
          </g>
        </g>
      ) : (
        <g className={mood === 'cheer' ? 'noha-wand is-up' : 'noha-wand'}>
          <line x1="112" y1={mood === 'cheer' ? 56 : 106} x2="126" y2={mood === 'cheer' ? 26 : 82} stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <line x1="112" y1={mood === 'cheer' ? 56 : 106} x2="126" y2={mood === 'cheer' ? 26 : 82} stroke="#FF7AB8" strokeWidth="2" strokeLinecap="round" />
          <path
            transform={`translate(127 ${mood === 'cheer' ? 22 : 78})`}
            d="M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3 Z"
            fill="#FFC53D"
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="110" cy={mood === 'cheer' ? 60 : 108} r="8" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.5" />
        </g>
      )}

      {mood === 'cheer' && (
        <g fill="#FFC53D" className="noha-sparkle">
          <path d="M16 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
          <path d="M28 14 l1.4 3.5 3.5 1.4 -3.5 1.4 -1.4 3.5 -1.4 -3.5 -3.5 -1.4 3.5 -1.4 z" />
        </g>
      )}
    </svg>
  );
}

export function Noha({ children, mood = 'happy', compact = false }: { children: ReactNode; mood?: Mood; compact?: boolean }) {
  return (
    <div className={`noha-say ${compact ? 'is-compact' : ''}`}>
      <NohaFace mood={mood} size={compact ? 72 : 96} />
      <div className="bubble" role="note">
        <span className="bubble-name">
          نُهى <small>مرشدة المدينة</small>
        </span>
        <div className="bubble-text">{children}</div>
      </div>
    </div>
  );
}

/** تعريف بمهام نُهى الثلاث (يظهر في الصفحة الأولى) */
export function NohaRoles() {
  const roles = [
    { icon: '👀', title: 'أشرح لكِ', text: 'أعرض مثالًا قصيرًا قبل كل حي.' },
    { icon: '💡', title: 'أساعدكِ', text: 'اضغطي «تلميح من نُهى» متى احتجتِ.' },
    { icon: '🎉', title: 'أحتفل معكِ', text: 'كل إجابة صحيحة تبني شيئًا في المدينة.' },
  ];
  return (
    <ul className="noha-roles" aria-label="ماذا تفعل نُهى؟">
      {roles.map((r) => (
        <li key={r.title}>
          <span className="nr-icon" aria-hidden="true">
            {r.icon}
          </span>
          <strong>{r.title}</strong>
          <span>{r.text}</span>
        </li>
      ))}
    </ul>
  );
}

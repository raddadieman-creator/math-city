import { useId, type ReactNode } from 'react';

type Mood = 'happy' | 'think' | 'cheer';

const INK = '#2A2B5F';

/**
 * المرشدة «نُهى»: شخصية كرتونية بعينين كبيرتين وحجاب بنفسجي ووردة،
 * تحمل قلمًا سحريًا بنجمة. ثلاث حالات:
 *  happy: ترحّب وتشرح، think: تقدّم تلميحًا، cheer: تحتفل.
 */
export function NohaFace({ mood = 'happy', size = 88 }: { mood?: Mood; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const skin = `sk${uid}`;
  const scarf = `sc${uid}`;
  return (
    <svg className={`noha noha-${mood}`} width={size} height={size} viewBox="0 0 140 140" aria-hidden="true">
      <defs>
        <radialGradient id={skin} cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#FFE3CF" />
          <stop offset="1" stopColor="#F7C6A3" />
        </radialGradient>
        <linearGradient id={scarf} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B9A4FF" />
          <stop offset="1" stopColor="#8E74F2" />
        </linearGradient>
      </defs>

      {/* هالة خلفية */}
      <circle cx="70" cy="72" r="64" fill="#FFF0F7" />
      <circle cx="70" cy="72" r="64" fill="none" stroke="#FFD1E6" strokeWidth="4" strokeDasharray="3 7" />

      {/* الكتفان والثوب */}
      <path d="M26 138 C 28 112 46 100 70 100 C 94 100 112 112 114 138 Z" fill="#34D6A6" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M58 104 L70 118 L82 104" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* شارة المرشدة */}
      <g transform="translate(92 120)">
        <circle r="9" fill="#FFC53D" stroke={INK} strokeWidth="2.5" />
        <path d="M0 -5 L1.6 -1.6 L5.3 -1.4 L2.4 1 L3.3 4.7 L0 2.7 L-3.3 4.7 L-2.4 1 L-5.3 -1.4 L-1.6 -1.6 Z" fill="#fff" />
      </g>

      {/* الحجاب */}
      <path
        d="M24 78 C 18 38 44 14 70 14 C 98 14 122 38 116 78 C 114 100 98 112 70 112 C 42 112 26 100 24 78 Z"
        fill={`url(#${scarf})`}
        stroke={INK}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M36 70 C 36 42 52 28 70 28 C 88 28 104 42 104 70" fill="none" stroke="#D9CCFF" strokeWidth="4" strokeLinecap="round" />

      {/* الوجه */}
      <ellipse cx="70" cy="70" rx="30" ry="31" fill={`url(#${skin})`} stroke={INK} strokeWidth="3" />

      {/* العينان */}
      {mood === 'cheer' ? (
        <g fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round">
          <path d="M51 66 Q 57 58 63 66" />
          <path d="M77 66 Q 83 58 89 66" />
        </g>
      ) : (
        <g>
          {[57, 83].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy="66" rx="7.5" ry="9" fill="#fff" stroke={INK} strokeWidth="2.5" />
              <ellipse cx={cx + (mood === 'think' ? 1.5 : 0)} cy={mood === 'think' ? 63 : 67} rx="5" ry="6.2" fill={INK} />
              <circle cx={cx + 2} cy={mood === 'think' ? 60.5 : 64.5} r="2.1" fill="#fff" />
              <circle cx={cx - 1.6} cy={mood === 'think' ? 66 : 70} r="1" fill="#fff" />
              <path d={`M${cx - 7} 58 l-3 -3 M${cx + 7} 58 l3 -3`} stroke={INK} strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}
        </g>
      )}

      {/* الخدّان */}
      <ellipse cx="47" cy="80" rx="6" ry="4" fill="#FF8FB1" opacity="0.55" />
      <ellipse cx="93" cy="80" rx="6" ry="4" fill="#FF8FB1" opacity="0.55" />

      {/* الفم */}
      {mood === 'think' ? (
        <path d="M64 86 Q 70 83 76 86" fill="none" stroke="#9A3F4E" strokeWidth="3" strokeLinecap="round" />
      ) : mood === 'cheer' ? (
        <path d="M60 81 Q 70 96 80 81 Z" fill="#E2546E" stroke="#9A3F4E" strokeWidth="2.5" strokeLinejoin="round" />
      ) : (
        <path d="M61 82 Q 70 91 79 82" fill="none" stroke="#9A3F4E" strokeWidth="3" strokeLinecap="round" />
      )}

      {/* وردة الحجاب */}
      <g transform="translate(103 34)">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="0" cy="-7" rx="5" ry="7" fill="#FF8FB1" stroke={INK} strokeWidth="1.8" transform={`rotate(${r})`} />
        ))}
        <circle r="4.5" fill="#FFC53D" stroke={INK} strokeWidth="1.8" />
      </g>

      {/* اليد والقلم السحري */}
      {mood === 'think' ? (
        <g>
          <circle cx="44" cy="96" r="8" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.5" />
          <g transform="translate(112 20)">
            <circle r="13" fill="#fff" stroke={INK} strokeWidth="2.5" />
            <text x="0" y="6" textAnchor="middle" fontSize="18" fontWeight="800" fill="#8E74F2">
              ؟
            </text>
          </g>
        </g>
      ) : (
        <g className={mood === 'cheer' ? 'noha-wand is-up' : 'noha-wand'}>
          <line x1="112" y1={mood === 'cheer' ? 54 : 104} x2="126" y2={mood === 'cheer' ? 24 : 80} stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <line x1="112" y1={mood === 'cheer' ? 54 : 104} x2="126" y2={mood === 'cheer' ? 24 : 80} stroke="#FF7AB8" strokeWidth="2" strokeLinecap="round" />
          <path
            transform={`translate(127 ${mood === 'cheer' ? 20 : 76})`}
            d="M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3 Z"
            fill="#FFC53D"
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="110" cy={mood === 'cheer' ? 58 : 106} r="8" fill={`url(#${skin})`} stroke={INK} strokeWidth="2.5" />
        </g>
      )}

      {mood === 'cheer' && (
        <g fill="#FFC53D" className="noha-sparkle">
          <path d="M18 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
          <path d="M30 14 l1.4 3.5 3.5 1.4 -3.5 1.4 -1.4 3.5 -1.4 -3.5 -3.5 -1.4 3.5 -1.4 z" />
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

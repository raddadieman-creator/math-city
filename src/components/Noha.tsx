import { useId, type ReactNode } from 'react';

type Mood = 'happy' | 'think' | 'cheer';


/**
 * المرشدة «نُهى»: روبوتة لطيفة برأس أبيض مستدير، وشاشة وجه بعينين مضيئتين،
 * وأذنين ورديتين، وهوائي بقلب، وفيونكة. ثلاث حالات:
 * happy ترحّب وتشرح، think تقدّم تلميحًا، cheer تحتفل.
 */
export function NohaFace({ mood = 'happy', size = 88 }: { mood?: Mood; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `${n}${uid}`;
  const EDGE = '#A898E0';
  const GLOW = '#8FF5FF';
  const eyes = [63, 97];
  const eyeY = 68;
  const armsUp = mood === 'cheer';
  return (
    <svg className={`noha noha-${mood}`} width={size} height={size} viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <radialGradient id={id('bg')} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#FFF7FC" />
          <stop offset="1" stopColor="#EFE6FF" />
        </radialGradient>
        <linearGradient id={id('shell')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E6DEFF" />
        </linearGradient>
        <linearGradient id={id('screen')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3A3F86" />
          <stop offset="1" stopColor="#272B60" />
        </linearGradient>
        <radialGradient id={id('heart')} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#FFE0EF" />
          <stop offset="1" stopColor="#FF7AB8" />
        </radialGradient>
      </defs>

      <circle cx="80" cy="80" r="76" fill={`url(#${id('bg')})`} />
      <circle cx="80" cy="80" r="76" fill="none" stroke="#D9CCFF" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />

      {/* ظل الطفو */}
      <ellipse cx="80" cy="152" rx="30" ry="4.5" fill="#B9A8E8" opacity="0.35" className="noha-shadow" />

      <g className="noha-bot">
        {/* الذراعان */}
        {armsUp ? (
          <g fill={`url(#${id('shell')})`} stroke={EDGE} strokeWidth="2.2">
            <rect x="34" y="92" width="14" height="30" rx="7" transform="rotate(-35 41 118)" />
            <rect x="112" y="92" width="14" height="30" rx="7" transform="rotate(35 119 118)" />
          </g>
        ) : (
          <g fill={`url(#${id('shell')})`} stroke={EDGE} strokeWidth="2.2">
            <rect x="40" y="110" width="14" height="28" rx="7" transform="rotate(14 47 112)" />
            <rect x="106" y="110" width="14" height="28" rx="7" transform="rotate(-14 113 112)" />
          </g>
        )}

        {/* الجسم */}
        <rect x="52" y="102" width="56" height="44" rx="22" fill={`url(#${id('shell')})`} stroke={EDGE} strokeWidth="2.4" />
        <rect x="63" y="112" width="34" height="22" rx="9" fill={`url(#${id('screen')})`} />
        <text x="80" y="128" textAnchor="middle" fontSize="11" fontWeight="800" fill={GLOW} fontFamily="sans-serif" letterSpacing="1" direction="ltr" style={{ unicodeBidi: "bidi-override" }}>
          + × =
        </text>

        {/* الرقبة */}
        <rect x="72" y="96" width="16" height="10" rx="4" fill="#D8CCFF" stroke={EDGE} strokeWidth="1.8" />

        {/* الهوائي */}
        <line x1="80" y1="30" x2="80" y2="14" stroke={EDGE} strokeWidth="3" strokeLinecap="round" />
        <path
          className="noha-antenna"
          d="M80 16 C 76 10 69 12 70 18 C 71 23 78 26 80 28 C 82 26 89 23 90 18 C 91 12 84 10 80 16 Z"
          transform="translate(0 -10)"
          fill={`url(#${id('heart')})`}
          stroke="#E85A9C"
          strokeWidth="1.4"
        />

        {/* الأذنان */}
        {[28, 132].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="66" r="11" fill="#FFC2DD" stroke={EDGE} strokeWidth="2.2" />
            <circle cx={cx} cy="66" r="5" fill="#FF8FC0" />
          </g>
        ))}

        {/* الرأس */}
        <rect x="32" y="28" width="96" height="74" rx="36" fill={`url(#${id('shell')})`} stroke={EDGE} strokeWidth="2.6" />
        <path d="M46 40 Q 80 26 114 40" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.9" />

        {/* الفيونكة */}
        <g transform="translate(110 32) rotate(18)" stroke="#E85A9C" strokeWidth="1.4" strokeLinejoin="round">
          <path d="M0 0 L-11 -7 L-11 7 Z" fill="#FF9DCB" />
          <path d="M0 0 L11 -7 L11 7 Z" fill="#FF9DCB" />
          <circle r="3.6" fill="#FFC2DD" />
        </g>

        {/* شاشة الوجه */}
        <rect x="42" y="44" width="76" height="48" rx="22" fill={`url(#${id('screen')})`} />
        <rect x="46" y="47" width="30" height="6" rx="3" fill="#fff" opacity="0.12" />

        {/* العينان */}
        {mood === 'cheer' ? (
          <g fill="none" stroke={GLOW} strokeWidth="4" strokeLinecap="round">
            {eyes.map((cx) => (
              <path key={cx} d={`M${cx - 8} ${eyeY + 3} Q${cx} ${eyeY - 7} ${cx + 8} ${eyeY + 3}`} />
            ))}
          </g>
        ) : (
          <g>
            {eyes.map((cx) => {
              const up = mood === 'think' ? -3 : 0;
              return (
                <g key={cx}>
                  <ellipse cx={cx} cy={eyeY + up} rx="8" ry="10" fill={GLOW} />
                  <ellipse cx={cx} cy={eyeY + up} rx="8" ry="10" fill="none" stroke="#C8FBFF" strokeWidth="1.5" opacity="0.7" />
                  <ellipse cx={cx - 2.6} cy={eyeY - 3.6 + up} rx="3" ry="3.6" fill="#fff" />
                  <circle cx={cx + 3} cy={eyeY + 4 + up} r="1.5" fill="#fff" />
                </g>
              );
            })}
          </g>
        )}

        {/* الخدّان */}
        <g fill="#FF8FC0" opacity="0.85">
          <rect x="47" y="78" width="10" height="5" rx="2.5" />
          <rect x="103" y="78" width="10" height="5" rx="2.5" />
        </g>

        {/* الفم */}
        {mood === 'cheer' ? (
          <path d="M72 80 Q80 90 88 80 Z" fill="#FF8FC0" stroke={GLOW} strokeWidth="1.6" strokeLinejoin="round" />
        ) : mood === 'think' ? (
          <path d="M75 83 Q78 81 80 83 Q82 85 85 83" fill="none" stroke={GLOW} strokeWidth="2.2" strokeLinecap="round" />
        ) : (
          <path d="M73 81 Q80 87 87 81" fill="none" stroke={GLOW} strokeWidth="2.6" strokeLinecap="round" />
        )}

        {/* القلم السحري */}
        {mood !== 'think' && (
          <g className={armsUp ? 'noha-wand is-up' : 'noha-wand'}>
            <line x1={armsUp ? 128 : 116} y1={armsUp ? 92 : 136} x2={armsUp ? 140 : 132} y2={armsUp ? 62 : 110} stroke={EDGE} strokeWidth="3.4" strokeLinecap="round" />
            <line x1={armsUp ? 128 : 116} y1={armsUp ? 92 : 136} x2={armsUp ? 140 : 132} y2={armsUp ? 62 : 110} stroke="#FFB3D6" strokeWidth="1.8" strokeLinecap="round" />
            <path
              transform={`translate(${armsUp ? 141 : 133} ${armsUp ? 58 : 106})`}
              d="M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3 Z"
              fill="#FFD45A"
              stroke="#E0A200"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </g>
        )}
      </g>

      {mood === 'think' && (
        <g>
          <g transform="translate(134 26)">
            <circle r="13" fill="#fff" stroke="#C9A2FF" strokeWidth="2" />
            <text x="0" y="6" textAnchor="middle" fontSize="17" fontWeight="800" fill="#7C4FB8">
              ؟
            </text>
          </g>
          <circle cx="120" cy="42" r="2.4" fill="#C9A2FF" />
        </g>
      )}

      {mood === 'cheer' && (
        <g fill="#FFD45A" className="noha-sparkle">
          <path d="M18 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
          <path d="M32 18 l1.4 3.5 3.5 1.4 -3.5 1.4 -1.4 3.5 -1.4 -3.5 -3.5 -1.4 3.5 -1.4 z" />
          <path d="M118 10 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 z" />
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

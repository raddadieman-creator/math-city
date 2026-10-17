import { useId, type ReactNode } from 'react';

type Mood = 'happy' | 'think' | 'cheer';


/**
 * المرشدة «نُهى» بأسلوب الرسوم المتحركة: عينان كبيرتان لامعتان، شعر طويل
 * بخصلات ولمعة، مشبك نجمة، وقلم سحري. ثلاث حالات:
 * happy ترحّب وتشرح، think تقدّم تلميحًا، cheer تحتفل.
 */
export function NohaFace({ mood = 'happy', size = 88 }: { mood?: Mood; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `${n}${uid}`;
  const LINE = '#3A2230';
  const eyes = [66.5, 93.5];
  const eyeY = 73;
  return (
    <svg className={`noha noha-${mood}`} width={size} height={size} viewBox="0 0 160 160" aria-hidden="true">
      <defs>
        <radialGradient id={id('bg')} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#FFF6FB" />
          <stop offset="1" stopColor="#FFE1EF" />
        </radialGradient>
        <linearGradient id={id('hair')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E3E52" />
          <stop offset="0.55" stopColor="#4E2A3E" />
          <stop offset="1" stopColor="#7A4660" />
        </linearGradient>
        <radialGradient id={id('skin')} cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#FFF1E6" />
          <stop offset="1" stopColor="#FAD3BC" />
        </radialGradient>
        <linearGradient id={id('iris')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B1F45" />
          <stop offset="0.55" stopColor="#7C4FB8" />
          <stop offset="1" stopColor="#C9A2FF" />
        </linearGradient>
        <linearGradient id={id('top')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B8E8FF" />
          <stop offset="1" stopColor="#8FD3F5" />
        </linearGradient>
        <clipPath id={id('clip')}>
          <circle cx="80" cy="80" r="76" />
        </clipPath>
      </defs>

      <circle cx="80" cy="80" r="76" fill={`url(#${id('bg')})`} />
      <circle cx="80" cy="80" r="76" fill="none" stroke="#FFC4DE" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />

      <g clipPath={`url(#${id('clip')})`}>
        {/* الشعر الخلفي الطويل */}
        <path
          d="M40 62 C38 26 60 12 80 12 C102 12 124 26 120 62 C122 94 128 126 136 162 L24 162 C32 126 38 94 40 62 Z"
          fill={`url(#${id('hair')})`}
          stroke={LINE}
          strokeWidth="1.6"
        />
        {/* القميص */}
        <path d="M34 164 C36 134 56 120 80 120 C104 120 124 134 126 164 Z" fill={`url(#${id('top')})`} stroke={LINE} strokeWidth="1.6" />
        <path d="M62 121 L80 140 L98 121 C92 119 86 118 80 118 C74 118 68 119 62 121 Z" fill="#fff" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
        <g transform="translate(80 136)" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round">
          <path d="M0 0 L-12 -6 L-12 7 Z" fill="#FF8FC0" />
          <path d="M0 0 L12 -6 L12 7 Z" fill="#FF8FC0" />
          <path d="M-2 2 L-6 14 L0 10 L6 14 L2 2 Z" fill="#FF8FC0" />
          <circle r="3.4" fill="#FFB3D6" />
        </g>
      </g>

      {/* الرقبة */}
      <path d="M71 96 L71 120 Q80 126 89 120 L89 96 Z" fill={`url(#${id('skin')})`} stroke={LINE} strokeWidth="1.4" />
      <path d="M71 104 Q80 110 89 104 L89 98 L71 98 Z" fill="#E9B79C" opacity="0.6" />

      {/* الوجه */}
      <path
        d="M52 62 C52 40 66 30 80 30 C94 30 108 40 108 62 C108 82 98 97 80 103 C62 97 52 82 52 62 Z"
        fill={`url(#${id('skin')})`}
        stroke={LINE}
        strokeWidth="1.6"
      />

      {/* خصلتان جانبيتان */}
      <path d="M55 46 C44 66 44 96 49 118 C55 104 57 86 60 64 Z" fill={`url(#${id('hair')})`} stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M105 46 C116 66 116 96 111 118 C105 104 103 86 100 64 Z" fill={`url(#${id('hair')})`} stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" />

      {/* الغُرّة بخصلات مدببة */}
      <path
        d="M50 64 C48 34 66 22 82 22 C99 22 114 36 110 64 C108 56 104 50 98 46 C99 51 98 54 95 56 C92 49 86 44 79 42 C80 47 78 51 74 53 C72 48 68 45 63 45 C57 48 53 55 50 64 Z"
        fill={`url(#${id('hair')})`}
        stroke={LINE}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* لمعة الشعر */}
      <path d="M58 36 Q80 25 103 36 Q80 31 58 41 Z" fill="#fff" opacity="0.4" />
      <path d="M45 80 Q44 96 47 108" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />

      {/* مشبك النجمة */}
      <path
        transform="translate(103 41) rotate(14)"
        d="M0 -8 L2.4 -2.5 L8 -2.5 L3.6 1 L5.2 7 L0 3.6 L-5.2 7 L-3.6 1 L-8 -2.5 L-2.4 -2.5 Z"
        fill="#FFD45A"
        stroke={LINE}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="110" cy="35" r="1.6" fill="#fff" />

      {/* الحاجبان */}
      <g fill="none" stroke="#8A5468" strokeWidth="1.4" strokeLinecap="round" opacity="0.7">
        {mood === 'think' ? (
          <>
            <path d="M60 58 Q66 55.5 72 57.5" />
            <path d="M88 56.5 Q94 54.5 100 57.5" />
          </>
        ) : (
          <>
            <path d="M60 59 Q66 57 72 59" />
            <path d="M88 59 Q94 57 100 59" />
          </>
        )}
      </g>

      {/* العينان */}
      {mood === 'cheer' ? (
        <g fill="none" stroke={LINE} strokeWidth="3" strokeLinecap="round">
          {eyes.map((cx) => (
            <path key={cx} d={`M${cx - 8} ${eyeY + 2} Q${cx} ${eyeY - 8} ${cx + 8} ${eyeY + 2}`} />
          ))}
        </g>
      ) : (
        <g>
          {eyes.map((cx, k) => {
            const up = mood === 'think' ? -2.5 : 0;
            const side = mood === 'think' ? 1.5 : 0;
            const outer = k === 0 ? -1 : 1;
            return (
              <g key={cx}>
                <ellipse cx={cx} cy={eyeY} rx="9.6" ry="11.6" fill="#fff" />
                <ellipse cx={cx + side} cy={eyeY + 1 + up} rx="7.8" ry="10" fill={`url(#${id('iris')})`} />
                <ellipse cx={cx + side} cy={eyeY + 1.5 + up} rx="3.4" ry="4.6" fill="#241229" />
                <ellipse cx={cx + side - 2.8} cy={eyeY - 3.4 + up} rx="3.4" ry="4" fill="#fff" />
                <circle cx={cx + side + 3} cy={eyeY + 5 + up} r="1.5" fill="#fff" />
                <path d={`M${cx - 6} ${eyeY + 7 + up} Q${cx + side} ${eyeY + 10 + up} ${cx + 6} ${eyeY + 6 + up}`} fill="none" stroke="#E9D8FF" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
                {/* الرموش العلوية */}
                <path
                  d={`M${cx - 10.5} ${eyeY - 3} Q${cx} ${eyeY - 15} ${cx + 10.5} ${eyeY - 3}`}
                  fill="none"
                  stroke={LINE}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path d={`M${cx + 10.5 * outer} ${eyeY - 3} l${3.5 * outer} -3`} stroke={LINE} strokeWidth="2.2" strokeLinecap="round" />
                <path d={`M${cx - 5} ${eyeY + 10.5} Q${cx} ${eyeY + 12} ${cx + 5} ${eyeY + 10.5}`} fill="none" stroke={LINE} strokeWidth="1" opacity="0.5" />
              </g>
            );
          })}
        </g>
      )}

      {/* الخدّان */}
      <g opacity="0.55">
        <ellipse cx="59" cy="87" rx="7" ry="3.8" fill="#FF9DBF" />
        <ellipse cx="101" cy="87" rx="7" ry="3.8" fill="#FF9DBF" />
      </g>
      <g stroke="#F07AA5" strokeWidth="1.1" strokeLinecap="round" opacity="0.8">
        <path d="M55 88 l2 -3 M59 88 l2 -3 M63 88 l2 -3" />
        <path d="M97 88 l2 -3 M101 88 l2 -3 M105 88 l2 -3" />
      </g>

      {/* الأنف */}
      <path d="M80 84 l-1 2.5" stroke="#D99A80" strokeWidth="1.5" strokeLinecap="round" />

      {/* الفم */}
      {mood === 'cheer' ? (
        <g>
          <path d="M73 91 Q80 101 87 91 Z" fill="#E55C7E" stroke={LINE} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M76 96 Q80 99 84 96" fill="#FF9DB4" />
        </g>
      ) : mood === 'think' ? (
        <path d="M76 93 Q80 95 84 92" fill="none" stroke={LINE} strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <path d="M74 92 Q80 97 86 92" fill="none" stroke={LINE} strokeWidth="1.8" strokeLinecap="round" />
      )}

      {/* اليد والقلم السحري */}
      {mood === 'think' ? (
        <g>
          <g transform="translate(130 28)">
            <circle r="13" fill="#fff" stroke="#C9A2FF" strokeWidth="2" />
            <text x="0" y="6" textAnchor="middle" fontSize="17" fontWeight="800" fill="#7C4FB8">
              ؟
            </text>
          </g>
          <circle cx="114" cy="44" r="2.4" fill="#C9A2FF" />
          <circle cx="110" cy="52" r="1.6" fill="#C9A2FF" />
        </g>
      ) : (
        <g className={mood === 'cheer' ? 'noha-wand is-up' : 'noha-wand'}>
          <line x1="124" y1={mood === 'cheer' ? 66 : 124} x2="140" y2={mood === 'cheer' ? 34 : 96} stroke={LINE} strokeWidth="3.4" strokeLinecap="round" />
          <line x1="124" y1={mood === 'cheer' ? 66 : 124} x2="140" y2={mood === 'cheer' ? 34 : 96} stroke="#FF9DC8" strokeWidth="1.8" strokeLinecap="round" />
          <path
            transform={`translate(141 ${mood === 'cheer' ? 30 : 92})`}
            d="M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3 Z"
            fill="#FFD45A"
            stroke={LINE}
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="122" cy={mood === 'cheer' ? 70 : 128} r="6.5" fill={`url(#${id('skin')})`} stroke={LINE} strokeWidth="1.4" />
        </g>
      )}

      {mood === 'cheer' && (
        <g fill="#FFD45A" className="noha-sparkle">
          <path d="M22 40 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" />
          <path d="M36 22 l1.4 3.5 3.5 1.4 -3.5 1.4 -1.4 3.5 -1.4 -3.5 -3.5 -1.4 3.5 -1.4 z" />
          <path d="M128 12 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 z" />
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

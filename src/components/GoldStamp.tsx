import { useId } from 'react';

/**
 * ختم ذهبي على شكل وسام بحافة مسنّنة وشريطين ملونين.
 * - earned: ذهبي لامع مع لمعة تتحرك وبريق.
 * - غير مكتسب: ظل منقّط باهت ينتظر الإنجاز.
 * - isNew: يهبط الختم بقوة مع انفجار ذهبي.
 */
export function GoldStamp({
  icon,
  name,
  ribbon = '#FF6B5B',
  earned,
  size = 150,
  isNew = false,
  date,
  rotate = -6,
  special = false,
}: {
  icon: string;
  name: string;
  ribbon?: string;
  earned: boolean;
  size?: number;
  isNew?: boolean;
  date?: string;
  rotate?: number;
  special?: boolean;
}) {
  const uid = useId().replace(/:/g, '');
  const g = `g${uid}`;
  const gd = `gd${uid}`;
  const sh = `sh${uid}`;
  const clip = `c${uid}`;
  const arc = `a${uid}`;
  const teeth = special ? 32 : 24;
  const seal = Array.from({ length: teeth * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 92 : 82;
    const a = (Math.PI * i) / teeth - Math.PI / 2;
    return `${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  const label = earned ? `ختم ${name}${date ? `، بتاريخ ${date}` : ''}` : `ختم ${name}: لم يُحصل عليه بعد`;

  return (
    <figure
      className={`gstamp ${earned ? 'is-earned' : 'is-locked'} ${isNew ? 'is-new' : ''} ${special ? 'is-special' : ''}`}
      style={{ width: size, ['--rot' as string]: `${rotate}deg` }}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 200 236" className="gstamp-svg" aria-hidden="true">
        <defs>
          <radialGradient id={g} cx="38%" cy="30%" r="80%">
            <stop offset="0" stopColor="#FFFBD6" />
            <stop offset="0.28" stopColor="#FFE27A" />
            <stop offset="0.62" stopColor="#F5B92E" />
            <stop offset="1" stopColor="#C98A12" />
          </radialGradient>
          <linearGradient id={gd} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#E9A92A" />
            <stop offset="0.5" stopColor="#FFD861" />
            <stop offset="1" stopColor="#B57708" />
          </linearGradient>
          <linearGradient id={sh} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={clip}>
            <polygon points={seal} />
          </clipPath>
          <path id={arc} d="M 38 100 A 62 62 0 0 1 162 100" />
        </defs>

        {earned && (
          <g className="gstamp-ribbons">
            <path d="M70 150 L52 228 L70 214 L84 232 L98 160 Z" fill={ribbon} stroke="#2A2B5F" strokeWidth="3" strokeLinejoin="round" />
            <path d="M130 150 L148 228 L130 214 L116 232 L102 160 Z" fill={ribbon} stroke="#2A2B5F" strokeWidth="3" strokeLinejoin="round" />
            <path d="M74 160 L62 212 M126 160 L138 212" stroke="#fff" strokeOpacity="0.45" strokeWidth="4" />
          </g>
        )}

        {earned && special && (
          <g className="gstamp-rays">
            {Array.from({ length: 16 }, (_, i) => (
              <path key={i} d="M100 100 L95 0 L105 0 Z" fill="#FFD861" opacity="0.55" transform={`rotate(${i * 22.5} 100 100)`} />
            ))}
          </g>
        )}

        <polygon
          points={seal}
          fill={earned ? `url(#${g})` : '#F1F5FC'}
          stroke={earned ? '#8A5A00' : '#B6C4E0'}
          strokeWidth="3.5"
          strokeDasharray={earned ? undefined : '7 6'}
          strokeLinejoin="round"
        />
        <circle cx="100" cy="100" r="72" fill={earned ? `url(#${gd})` : 'none'} stroke={earned ? '#8A5A00' : '#C9D5EC'} strokeWidth="3" />
        <circle cx="100" cy="100" r="64" fill={earned ? `url(#${g})` : '#F8FAFE'} stroke={earned ? '#A86F05' : '#D4DEEF'} strokeWidth="2" />
        <circle cx="100" cy="100" r="68" fill="none" stroke={earned ? '#FFF3B8' : '#DCE4F2'} strokeWidth="1.6" strokeDasharray="2 5" />

        <text className="gstamp-arc" fill={earned ? '#6B4300' : '#9AAAC8'} fontSize="21" fontWeight="800" fontFamily="'Baloo Bhaijaan 2', 'IBM Plex Sans Arabic', sans-serif">
          <textPath href={`#${arc}`} startOffset="50%" textAnchor="middle">
            {name}
          </textPath>
        </text>

        <text x="100" y="128" textAnchor="middle" className="gstamp-icon" fontSize={special ? 58 : 56} style={{ opacity: earned ? 1 : 0.28, filter: earned ? undefined : 'grayscale(1)' }}>
          {icon}
        </text>

        {earned ? (
          <g fill="#FFF7C2" stroke="#8A5A00" strokeWidth="1.5" strokeLinejoin="round">
            {[-26, 0, 26].map((dx) => (
              <path
                key={dx}
                transform={`translate(${100 + dx} ${150 + (dx === 0 ? 2 : 0)}) scale(${dx === 0 ? 1.15 : 0.9})`}
                d="M0 -8 L2.4 -2.5 L8 -2.5 L3.6 1 L5.2 7 L0 3.6 L-5.2 7 L-3.6 1 L-8 -2.5 L-2.4 -2.5 Z"
              />
            ))}
          </g>
        ) : (
          <text x="100" y="160" textAnchor="middle" className="gstamp-lock" fill="#9AAAC8" fontSize="18">
            🔒
          </text>
        )}

        {earned && (
          <g clipPath={`url(#${clip})`}>
            <rect className="gstamp-shine" x="-120" y="-20" width="60" height="240" fill={`url(#${sh})`} transform="rotate(20 100 100)" />
          </g>
        )}
      </svg>
      {earned && (
        <span className="gstamp-sparkles" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      )}
      {isNew && <span className="gstamp-burst" aria-hidden="true" />}
      {date && earned && <figcaption className="gstamp-date">{date}</figcaption>}
    </figure>
  );
}

/** وسام ذهبي صغير يُستخدم بدل علامة الصح */
export function GoldCoin({ size = 26 }: { size?: number }) {
  return (
    <svg className="gcoin" width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="17" fill="#FFD24A" stroke="#8A5A00" strokeWidth="3" />
      <circle cx="20" cy="20" r="12" fill="#FFE98A" stroke="#C98A12" strokeWidth="1.5" />
      <path d="M20 11 L22.6 17 L29 17 L23.9 20.8 L25.8 27 L20 23.3 L14.2 27 L16.1 20.8 L11 17 L17.4 17 Z" fill="#E59A0C" />
    </svg>
  );
}

export function arabicShortDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-arab', { day: 'numeric', month: 'long' }).format(new Date(iso));
  } catch {
    return undefined;
  }
}

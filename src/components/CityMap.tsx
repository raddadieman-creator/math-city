import { useState, type KeyboardEvent, type ReactNode } from 'react';
import { settings, branding, type DistrictId } from '../config/settings';
import { DISTRICTS } from '../content/districts';
import { useProgress } from '../state/progress';
import { useMedia, useReducedMotion } from '../lib/router';
import { fmt } from '../lib/numbers';
import { sfx } from '../lib/sound';

type Pt = [number, number];
interface Layout {
  w: number;
  h: number;
  sky: number;
  track: number;
  pos: Record<DistrictId, Pt>;
  park: Pt;
  scale: number;
}

const WIDE: Layout = {
  w: 1200,
  h: 880,
  sky: 70,
  track: 108,
  scale: 1,
  pos: {
    houses: [1040, 270],
    station: [747, 270],
    garden: [453, 270],
    market: [160, 270],
    workshop: [160, 700],
    stats: [453, 700],
    walkway: [747, 700],
    farm: [1040, 700],
  },
  park: [600, 478],
};

const TALL: Layout = {
  w: 520,
  h: 1620,
  sky: 50,
  track: 82,
  scale: 1,
  pos: {
    houses: [384, 240],
    station: [136, 390],
    garden: [384, 540],
    market: [136, 690],
    workshop: [384, 1080],
    stats: [136, 1230],
    walkway: [384, 1380],
    farm: [136, 1530],
  },
  park: [260, 880],
};

/* ---------------- رسومات المباني ---------------- */

const LIT = '#FFE27A';
const DARK_WIN = '#BFE6F5';

function House({ x, w, h, roof, lit }: { x: number; w: number; h: number; roof: string; lit: [boolean, boolean] }) {
  const top = 40 - h;
  return (
    <g>
      <rect x={x - w / 2} y={top} width={w} height={h} rx={4} fill="#FFF6E8" stroke="#24324A" strokeWidth={2} />
      <path d={`M ${x - w / 2 - 8} ${top + 2} L ${x} ${top - 34} L ${x + w / 2 + 8} ${top + 2} Z`} fill={roof} stroke="#24324A" strokeWidth={2} strokeLinejoin="round" />
      <rect x={x - w / 2 + 8} y={top + 12} width={14} height={14} rx={2} fill={lit[0] ? LIT : DARK_WIN} stroke="#24324A" strokeWidth={1.5} className={lit[0] ? 'win-lit' : ''} />
      <rect x={x + w / 2 - 22} y={top + 12} width={14} height={14} rx={2} fill={lit[1] ? LIT : DARK_WIN} stroke="#24324A" strokeWidth={1.5} className={lit[1] ? 'win-lit' : ''} />
      <rect x={x - 8} y={40 - 24} width={16} height={24} rx={3} fill="#B07A47" />
    </g>
  );
}

function HousesArt({ level, done }: { level: number; done: boolean }) {
  const n = done ? 6 : level;
  const lit = (k: number) => n > k;
  return (
    <g>
      <House x={-56} w={56} h={64} roof="#FF7F6E" lit={[lit(0), lit(1)]} />
      <House x={6} w={64} h={84} roof="#FFC94D" lit={[lit(2), lit(3)]} />
      <House x={66} w={50} h={58} roof="#4FC3E8" lit={[lit(4), lit(5)]} />
      {done && (
        <g>
          <line x1={-90} y1={40} x2={-90} y2={-20} stroke="#24324A" strokeWidth={3} />
          <circle cx={-90} cy={-24} r={8} fill={LIT} className="lamp-glow" />
        </g>
      )}
    </g>
  );
}

function StationArt({ done }: { done: boolean }) {
  return (
    <g>
      <rect x={-90} y={30} width={180} height={12} rx={4} fill="#C9D3E0" />
      <rect x={-70} y={-40} width={140} height={72} rx={8} fill="#DFF5FC" stroke="#24324A" strokeWidth={2} />
      <path d="M -80 -38 Q 0 -96 80 -38 Z" fill="#4FC3E8" stroke="#24324A" strokeWidth={2} />
      <circle cx={0} cy={-52} r={14} fill="#fff" stroke="#24324A" strokeWidth={2} />
      <line x1={0} y1={-52} x2={0} y2={-61} stroke="#24324A" strokeWidth={2} strokeLinecap="round" />
      <line x1={0} y1={-52} x2={7} y2={-52} stroke="#24324A" strokeWidth={2} strokeLinecap="round" />
      {[-48, -16, 16].map((x) => (
        <rect key={x} x={x} y={-24} width={26} height={30} rx={13} fill={done ? LIT : DARK_WIN} stroke="#24324A" strokeWidth={1.5} />
      ))}
      <rect x={46} y={-24} width={18} height={56} rx={3} fill="#B07A47" />
    </g>
  );
}

function Tree({ x, y, s = 1, c = '#3FAE6B' }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-3} y={-4} width={6} height={18} rx={2} fill="#B07A47" />
      <circle cx={0} cy={-14} r={15} fill={c} stroke="#24324A" strokeWidth={1.5} />
      <circle cx={-6} cy={-18} r={4} fill="#fff" opacity={0.3} />
    </g>
  );
}

function GardenArt({ level, done }: { level: number; done: boolean }) {
  const spots: [number, number][] = [
    [-70, 18],
    [70, 18],
    [-40, -14],
    [40, -14],
    [-78, -30],
    [78, -30],
  ];
  const n = done ? 6 : level;
  return (
    <g>
      <ellipse cx={0} cy={22} rx={98} ry={30} fill="#9BE3B7" stroke="#24324A" strokeWidth={2} />
      <path d="M -10 50 Q 0 20 10 -2" stroke="#F3E2B8" strokeWidth={14} fill="none" strokeLinecap="round" />
      {spots.slice(0, n).map(([x, y], i) => (
        <Tree key={i} x={x} y={y} s={0.95} c={i % 2 ? '#52C27E' : '#3FAE6B'} />
      ))}
      {done ? (
        <g>
          <ellipse cx={0} cy={0} rx={24} ry={8} fill="#4FC3E8" stroke="#24324A" strokeWidth={2} />
          <path className="fountain-water" d="M 0 -2 Q -10 -34 -20 -4 M 0 -2 Q 10 -34 20 -4 M 0 -2 L 0 -38" stroke="#4FC3E8" strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <g opacity={0.6}>
          <ellipse cx={0} cy={0} rx={24} ry={8} fill="#E0E6EE" stroke="#24324A" strokeWidth={2} strokeDasharray="4 4" />
        </g>
      )}
    </g>
  );
}

function Stall({ x, colored, color }: { x: number; colored: boolean; color: string }) {
  return (
    <g>
      <rect x={x - 26} y={-6} width={52} height={46} rx={4} fill="#FFF6E8" stroke="#24324A" strokeWidth={2} />
      <path
        d={`M ${x - 32} -6 L ${x - 24} -32 L ${x + 24} -32 L ${x + 32} -6 Z`}
        fill={colored ? color : '#E0E6EE'}
        stroke="#24324A"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {colored &&
        [-16, 0, 16].map((d) => <path key={d} d={`M ${x + d - 4} -32 L ${x + d - 6} -6 L ${x + d + 2} -6 L ${x + d + 4} -32 Z`} fill="#fff" opacity={0.7} />)}
      <rect x={x - 18} y={10} width={36} height={10} rx={3} fill="#FFC94D" />
      <circle cx={x - 8} cy={8} r={4} fill="#FF7F6E" />
      <circle cx={x + 6} cy={8} r={4} fill="#8BC34A" />
    </g>
  );
}

function MarketArt({ level, done }: { level: number; done: boolean }) {
  const n = done ? 3 : Math.ceil((level / settings.tasksPerDistrict) * 3);
  return (
    <g>
      <Stall x={-60} colored={n > 0} color="#FF7F6E" />
      <Stall x={0} colored={n > 1} color="#4FC3E8" />
      <Stall x={60} colored={n > 2} color="#5ED6B4" />
      {done && (
        <g>
          <path d="M -92 -44 Q 0 -70 92 -44" stroke="#24324A" strokeWidth={1.5} fill="none" />
          {Array.from({ length: 9 }, (_, i) => {
            const x = -84 + i * 21;
            const y = -44 - Math.sin((i / 8) * Math.PI) * 20;
            return <path key={i} d={`M ${x - 6} ${y} L ${x + 6} ${y} L ${x} ${y + 12} Z`} fill={['#FF7F6E', '#FFC94D', '#4FC3E8', '#5ED6B4'][i % 4]} />;
          })}
        </g>
      )}
    </g>
  );
}

function WorkshopArt({ level, done }: { level: number; done: boolean }) {
  const floors = done ? 6 : 1 + level;
  return (
    <g>
      <rect x={-90} y={34} width={180} height={8} rx={3} fill="#D9C7A3" />
      {Array.from({ length: floors }, (_, i) => (
        <g key={i}>
          <rect x={-24} y={34 - (i + 1) * 18} width={56} height={18} fill={i % 2 ? '#FFA94D' : '#FFC94D'} stroke="#24324A" strokeWidth={1.5} />
          <rect x={-16} y={34 - (i + 1) * 18 + 5} width={10} height={8} fill={done ? LIT : DARK_WIN} />
          <rect x={14} y={34 - (i + 1) * 18 + 5} width={10} height={8} fill={done ? LIT : DARK_WIN} />
        </g>
      ))}
      {/* الرافعة */}
      <g>
        <rect x={-74} y={-76} width={8} height={112} fill="#FFC94D" stroke="#24324A" strokeWidth={1.5} />
        <rect x={-74} y={-80} width={110} height={8} fill="#FFC94D" stroke="#24324A" strokeWidth={1.5} />
        <line x1={20} y1={-72} x2={20} y2={-50} stroke="#24324A" strokeWidth={1.5} className={done ? '' : 'crane-rope'} />
        <rect x={12} y={-50} width={16} height={10} fill="#FF7F6E" stroke="#24324A" strokeWidth={1.5} />
      </g>
      {done && (
        <g>
          <line x1={4} y1={34 - floors * 18} x2={4} y2={34 - floors * 18 - 22} stroke="#24324A" strokeWidth={2} />
          <path d={`M 4 ${34 - floors * 18 - 22} l 18 6 l -18 6 z`} fill="#5ED6B4" />
        </g>
      )}
    </g>
  );
}

function StatsArt({ level, done }: { level: number; done: boolean }) {
  const t = done ? 1 : level / settings.tasksPerDistrict;
  const bars = [0.5, 0.85, 0.65, 1];
  return (
    <g>
      <rect x={-72} y={-40} width={144} height={80} rx={8} fill="#EEEBFF" stroke="#24324A" strokeWidth={2} />
      <path d="M -82 -38 L 0 -72 L 82 -38 Z" fill="#9B8CFF" stroke="#24324A" strokeWidth={2} strokeLinejoin="round" />
      <rect x={-56} y={-28} width={112} height={50} rx={4} fill="#fff" stroke="#24324A" strokeWidth={1.5} />
      {bars.map((b, i) => {
        const h = Math.max(4, 40 * b * Math.max(0.15, t));
        return <rect key={i} x={-46 + i * 26} y={18 - h} width={16} height={h} rx={2} fill={['#4FC3E8', '#5ED6B4', '#FFC94D', '#FF8A7A'][i]} />;
      })}
      <rect x={-10} y={24} width={20} height={16} fill="#B07A47" />
      {done &&
        [-60, 60].map((x) => (
          <g key={x}>
            <line x1={x} y1={-44} x2={x} y2={-84} stroke="#24324A" strokeWidth={2} />
            <path d={`M ${x} -84 l 20 7 l -20 7 z`} fill={x < 0 ? '#FF7F6E' : '#FFC94D'} className="flag-wave" />
          </g>
        ))}
    </g>
  );
}

function Flower({ x, y, c, open }: { x: number; y: number; c: string; open: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={0} y1={0} x2={0} y2={12} stroke="#3FAE6B" strokeWidth={2} />
      {open ? (
        <>
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx={0} cy={-6} rx={4} ry={6} fill={c} transform={`rotate(${r})`} />
          ))}
          <circle r={3} fill="#FFC94D" />
        </>
      ) : (
        <ellipse cx={0} cy={-2} rx={3} ry={5} fill="#7CCB8F" />
      )}
    </g>
  );
}

function WalkwayArt({ level, done }: { level: number; done: boolean }) {
  const open = done ? 12 : level * 2;
  const tiles = done ? 8 : Math.max(2, level + 2);
  const path = 'M -92 30 C -40 30 -50 -20 0 -20 C 50 -20 40 30 92 30';
  const colors = ['#FF7EB6', '#FF7F6E', '#9B8CFF', '#FFC94D'];
  const fl: [number, number][] = [
    [-80, 10], [-62, 2], [-44, -16], [-26, -36], [-6, -40], [14, -40],
    [34, -36], [52, -16], [70, 2], [86, 10], [-20, 34], [20, 34],
  ];
  return (
    <g>
      <ellipse cx={0} cy={12} rx={100} ry={40} fill="#C8F0DD" stroke="#24324A" strokeWidth={2} />
      <path d={path} stroke="#F3E2B8" strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={path} stroke="#E2C98F" strokeWidth={22} fill="none" strokeDasharray={`14 6`} strokeDashoffset={0} pathLength={8 * 20} style={{ strokeDasharray: `14 6`, strokeDashoffset: 0 }} opacity={0.35 + (tiles / 8) * 0.65} />
      {fl.map(([x, y], i) => (
        <Flower key={i} x={x} y={y} c={colors[i % 4]} open={i < open} />
      ))}
    </g>
  );
}

function PalmTree({ x, y, s = 1, fruit }: { x: number; y: number; s?: number; fruit: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -2 0 Q 0 -16 2 -30 L 5 -30 Q 4 -16 4 0 Z" fill="#B07A47" />
      <path d="M 3 -30 C -10 -40 -20 -34 -24 -28 C -14 -34 -6 -32 3 -30 Z" fill="#3FAE6B" />
      <path d="M 3 -30 C 16 -40 26 -34 30 -28 C 20 -34 12 -32 3 -30 Z" fill="#3FAE6B" />
      <path d="M 3 -30 C -4 -44 6 -50 12 -48 C 6 -44 4 -38 3 -30 Z" fill="#52C27E" />
      <path d="M 3 -30 C 10 -44 0 -50 -6 -48 C 0 -44 2 -38 3 -30 Z" fill="#52C27E" />
      {fruit && (
        <>
          <circle cx={0} cy={-26} r={3} fill="#E8892B" />
          <circle cx={6} cy={-25} r={3} fill="#E8892B" />
        </>
      )}
    </g>
  );
}

function FarmArt({ level, done }: { level: number; done: boolean }) {
  const total = 9;
  const n = done ? total : Math.round((level / settings.tasksPerDistrict) * total);
  return (
    <g>
      <path d="M -96 40 L -70 -20 L 70 -20 L 96 40 Z" fill="#E7C98E" stroke="#24324A" strokeWidth={2} strokeLinejoin="round" />
      {[0, 1, 2].map((r) => (
        <line key={r} x1={-84 + r * 6} y1={-2 + r * 18} x2={84 - r * 6} y2={-2 + r * 18} stroke="#C9A66B" strokeWidth={3} />
      ))}
      {Array.from({ length: total }, (_, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const x = (c - 1) * (46 + r * 6);
        const y = -4 + r * 18;
        return i < n ? <PalmTree key={i} x={x} y={y} s={0.75 + r * 0.08} fruit={done} /> : <circle key={i} cx={x} cy={y} r={3} fill="#9C7A45" />;
      })}
      <g transform="translate(-84 -26)">
        <rect x={-14} y={-24} width={30} height={26} fill="#FF7F6E" stroke="#24324A" strokeWidth={1.5} />
        <path d="M -18 -22 L 1 -38 L 20 -22 Z" fill="#B54A3D" stroke="#24324A" strokeWidth={1.5} />
      </g>
    </g>
  );
}

export function ParkArt({ open }: { open: boolean }) {
  return (
    <g>
      <ellipse cx={0} cy={10} rx={150} ry={62} fill={open ? '#9BE3B7' : '#D6EFE2'} stroke="#24324A" strokeWidth={2} />
      {open ? (
        <g>
          <ellipse cx={0} cy={12} rx={40} ry={13} fill="#4FC3E8" stroke="#24324A" strokeWidth={2} />
          <path className="fountain-water" d="M 0 8 Q -18 -48 -34 6 M 0 8 Q 18 -48 34 6 M 0 8 L 0 -52" stroke="#4FC3E8" strokeWidth={4} fill="none" strokeLinecap="round" />
          {[-110, -80, 80, 110].map((x, i) => (
            <Tree key={x} x={x} y={i % 2 ? 20 : -6} s={1.1} c={i % 2 ? '#52C27E' : '#3FAE6B'} />
          ))}
          {[-60, 60].map((x, i) => (
            <g key={x} className="balloon">
              <line x1={x} y1={-20} x2={x} y2={-60} stroke="#24324A" strokeWidth={1} />
              <ellipse cx={x} cy={-70} rx={10} ry={13} fill={i ? '#FF7EB6' : '#FFC94D'} />
            </g>
          ))}
        </g>
      ) : (
        <g>
          {Array.from({ length: 13 }, (_, i) => (
            <rect key={i} x={-132 + i * 22} y={-10} width={6} height={36} rx={2} fill="#C9A66B" />
          ))}
          <rect x={-136} y={-2} width={272} height={6} fill="#C9A66B" />
          <rect x={-60} y={-46} width={120} height={34} rx={8} fill="#fff" stroke="#24324A" strokeWidth={2} />
          <text x={0} y={-23} textAnchor="middle" className="park-soon">قريبًا</text>
        </g>
      )}
    </g>
  );
}

function districtArt(id: DistrictId, level: number, done: boolean): ReactNode {
  switch (id) {
    case 'houses':
      return <HousesArt level={level} done={done} />;
    case 'station':
      return <StationArt done={done} />;
    case 'garden':
      return <GardenArt level={level} done={done} />;
    case 'market':
      return <MarketArt level={level} done={done} />;
    case 'workshop':
      return <WorkshopArt level={level} done={done} />;
    case 'stats':
      return <StatsArt level={level} done={done} />;
    case 'walkway':
      return <WalkwayArt level={level} done={done} />;
    case 'farm':
      return <FarmArt level={level} done={done} />;
  }
}

/* ---------------- الخريطة ---------------- */

function roadPath(points: Pt[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const my = (y0 + y1) / 2;
    d += Math.abs(y1 - y0) < 40 ? ` L ${x1} ${y1}` : ` C ${x0} ${my} ${x1} ${my} ${x1} ${y1}`;
  }
  return d;
}

export function CityMap({
  onSelect,
  onPark,
  preview = false,
}: {
  onSelect?: (id: DistrictId) => void;
  onPark?: () => void;
  preview?: boolean;
}) {
  const { districtProgress, progress } = useProgress();
  const tall = useMedia('(max-aspect-ratio: 4/5), (max-width: 620px)');
  const reduced = useReducedMotion();
  const L = tall ? TALL : WIDE;
  const [active, setActive] = useState<DistrictId | null>(null);
  const path = settings.suggestedPath;
  const enabled = path.filter((id) => settings[id].enabled);
  const stationDone = settings.station.enabled && districtProgress('station').stamp;

  const roadPts: Pt[] = [];
  path.forEach((id, i) => {
    const [x, y] = L.pos[id];
    roadPts.push([x, y + 4]);
    if (i === 3) roadPts.push([L.park[0], L.park[1] + 20]);
  });

  const choose = (id: DistrictId) => {
    if (preview || !onSelect) return;
    sfx.tap();
    setActive(id);
    window.setTimeout(() => onSelect(id), reduced ? 0 : 260);
  };
  const key = (fn: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  };

  const trackPath = `M ${L.w + 80} ${L.track} L -120 ${L.track}`;

  return (
    <svg
      className={`city-map ${preview ? 'is-preview' : ''} ${tall ? 'is-tall' : ''}`}
      viewBox={`0 0 ${L.w} ${L.h}`}
      role={preview ? 'img' : 'group'}
      aria-label={`خريطة ${branding.cityName}`}
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FD8FF" />
          <stop offset="1" stopColor="#D6F4FF" />
        </linearGradient>
        <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C9F5DE" />
          <stop offset="1" stopColor="#A8EBC9" />
        </linearGradient>
        <pattern id="grass" width="70" height="70" patternUnits="userSpaceOnUse">
          <path d="M10 44 l3 -7 l3 7 M44 16 l3 -7 l3 7" stroke="#8FDFB3" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="56" cy="54" r="2.6" fill="#FFF3A6" />
          <circle cx="26" cy="12" r="2.2" fill="#FFC2DC" />
        </pattern>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#2A2B5F" floodOpacity="0.18" />
        </filter>
      </defs>
      {/* السماء والأرض */}
      <rect x={0} y={0} width={L.w} height={L.h} fill="url(#ground)" />
      <rect x={0} y={0} width={L.w} height={L.h} fill="url(#grass)" />
      <rect x={0} y={0} width={L.w} height={L.sky} fill="url(#sky)" />
      <g transform={`translate(${L.w - 70} ${L.sky / 2 + 6})`} aria-hidden="true">
        <g className={reduced ? '' : 'sun-rays'}>
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={-3} y={-44} width={6} height={14} rx={3} fill="#FFC53D" transform={`rotate(${i * 30})`} />
          ))}
        </g>
        <circle r={24} fill="#FFE066" stroke="#F2A20C" strokeWidth={3} />
        <circle cx={-7} cy={-3} r={2.6} fill="#2A2B5F" />
        <circle cx={7} cy={-3} r={2.6} fill="#2A2B5F" />
        <path d="M -8 7 Q 0 14 8 7" stroke="#2A2B5F" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </g>
      <g className="clouds" aria-hidden="true">
        {[0.22, 0.55, 0.82].map((f, i) => (
          <g key={i} className={`cloud-drift d${i}`} transform={`translate(${L.w * f} ${L.sky * (0.35 + (i % 2) * 0.2)})`}>
            <ellipse cx={0} cy={4} rx={40} ry={13} fill="#fff" />
            <circle cx={-14} cy={-2} r={13} fill="#fff" />
            <circle cx={10} cy={-6} r={16} fill="#fff" />
          </g>
        ))}
      </g>
      <g className={reduced ? '' : 'birds'} aria-hidden="true" stroke="#2A2B5F" strokeWidth={2.4} fill="none" strokeLinecap="round">
        <path d={`M ${L.w * 0.4} ${L.sky * 0.5} q 6 -6 12 0 q 6 -6 12 0`} />
        <path d={`M ${L.w * 0.44} ${L.sky * 0.75} q 5 -5 10 0 q 5 -5 10 0`} />
      </g>
      {/* الطريق */}
      <path d={roadPath(roadPts)} stroke="#F3E2B8" strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={roadPath(roadPts)} stroke="#fff" strokeWidth={3} fill="none" strokeDasharray="14 14" strokeLinecap="round" />

      {!reduced && !preview && (
        <g aria-hidden="true">
          <g>
            <rect x={-18} y={-12} width={36} height={18} rx={6} fill="#FF7AB8" stroke="#2A2B5F" strokeWidth={2} />
            <rect x={-10} y={-20} width={20} height={10} rx={4} fill="#D6F4FF" stroke="#2A2B5F" strokeWidth={2} />
            <circle cx={-9} cy={7} r={4.5} fill="#2A2B5F" />
            <circle cx={9} cy={7} r={4.5} fill="#2A2B5F" />
            <animateMotion dur="38s" repeatCount="indefinite" rotate="0" path={roadPath(roadPts)} />
          </g>
        </g>
      )}

      {/* سكة القطار */}
      <g aria-hidden="true">
        <line x1={0} x2={L.w} y1={L.track + 12} y2={L.track + 12} stroke="#8A97A8" strokeWidth={4} />
        {Array.from({ length: Math.ceil(L.w / 24) }, (_, i) => (
          <rect key={i} x={i * 24} y={L.track + 7} width={12} height={10} rx={2} fill="#B9A27E" />
        ))}
        <g className="city-train">
          <g transform={`translate(0 ${-L.track})`}>
            <TrainShape y={L.track} />
          </g>
          {stationDone && !reduced ? (
            <animateMotion dur="14s" repeatCount="indefinite" path={trackPath} />
          ) : (
            <animateMotion dur="0.01s" fill="freeze" path={`M ${L.pos.station[0]} ${L.track} L ${L.pos.station[0] + 0.1} ${L.track}`} />
          )}
        </g>
      </g>

      {/* حديقة المدينة (المهمة الختامية) */}
      <g
        className={`bldg park ${preview ? '' : 'is-clickable'}`}
        transform={`translate(${L.park[0]} ${L.park[1]})`}
        role={preview ? undefined : 'button'}
        tabIndex={preview ? undefined : 0}
        aria-label={`حديقة المدينة — المهمة الختامية${progress.finalDone ? '، افتُتحت' : ''}`}
        onClick={() => !preview && onPark?.()}
        onKeyDown={key(() => !preview && onPark?.())}
      >
        <ellipse className="bldg-focus" cx={0} cy={10} rx={162} ry={74} />
        <g className="bldg-art" filter="url(#soft)">
          <ParkArt open={progress.finalDone} />
        </g>
        <g transform="translate(0 92)">
          <rect x={tall ? -150 : -104} y={-19} width={tall ? 300 : 208} height={38} rx={19} className="bldg-label park-label" />
          <text x={0} y={7} textAnchor="middle" className="bldg-name">
            {progress.finalDone ? 'حديقة المدينة 🎉' : 'افتتاح حديقة المدينة'}
          </text>
        </g>
      </g>

      {/* الأحياء */}
      {path.map((id) => {
        const [x, y] = L.pos[id];
        const on = settings[id].enabled;
        if (!on) {
          return (
            <g key={id} transform={`translate(${x} ${y})`} aria-hidden="true" opacity={0.6}>
              <rect x={-80} y={-30} width={160} height={70} rx={12} fill="#EEF2F6" stroke="#B9C4D2" strokeDasharray="6 6" />
              <text x={0} y={10} textAnchor="middle" className="bldg-soon">مساحة قادمة</text>
            </g>
          );
        }
        const dp = districtProgress(id);
        const d = DISTRICTS[id];
        const order = enabled.indexOf(id) + 1;
        return (
          <g
            key={id}
            className={`bldg ${active === id ? 'is-active' : ''} ${preview ? '' : 'is-clickable'}`}
            transform={`translate(${x} ${y})`}
            role={preview ? undefined : 'button'}
            tabIndex={preview ? undefined : 0}
            aria-label={`${order}. ${d.name} — ${d.topic}${dp.stamp ? '، تم الإنجاز' : `، أُنجز ${fmt(dp.tasksDone)} من ${fmt(settings.tasksPerDistrict)}`}`}
            onClick={() => choose(id)}
            onKeyDown={key(() => choose(id))}
          >
            <rect className="bldg-focus" x={-124} y={-124} width={248} height={258} rx={34} />
            {/* منصة المحطة */}
            <rect x={-112} y={-106} width={224} height={232} rx={30} fill="#2A2B5F" />
            <rect x={-112} y={-112} width={224} height={232} rx={30} fill="#FFFFFF" />
            <rect
              className="lot"
              x={-112}
              y={-112}
              width={224}
              height={232}
              rx={30}
              fill={`${d.color}2E`}
              stroke={dp.stamp ? '#C98A12' : '#2A2B5F'}
              strokeWidth={dp.stamp ? 5 : 3.5}
            />
            <rect x={-104} y={-104} width={208} height={150} rx={24} fill="#fff" opacity={0.6} />
            <ellipse cx={0} cy={44} rx={94} ry={14} fill={d.color} opacity={0.35} />
            <g className="bldg-art" filter="url(#soft)">
              {districtArt(id, dp.tasksDone, dp.stamp)}
            </g>
            {/* لافتة المحطة */}
            <g transform="translate(0 84)">
              <rect x={-100} y={-17} width={200} height={40} rx={20} fill="#2A2B5F" />
              <rect x={-100} y={-21} width={200} height={40} rx={20} className="bldg-label" style={{ fill: d.color }} />
              <circle cx={80} cy={-1} r={14} fill="#fff" stroke="#2A2B5F" strokeWidth={2} />
              <text x={80} y={5} textAnchor="middle" className="bldg-order" style={{ fill: '#2A2B5F' }}>
                {fmt(order)}
              </text>
              <text x={-10} y={6} textAnchor="middle" className="bldg-name on-color">
                {d.name}
              </text>
            </g>
            {/* تقدم المهمات أعلى المنصة */}
            {!dp.stamp && (
              <g transform="translate(0 -92)">
                {Array.from({ length: settings.tasksPerDistrict }, (_, k) => (
                  <circle
                    key={k}
                    cx={(k - (settings.tasksPerDistrict - 1) / 2) * -16}
                    cy={0}
                    r={5.5}
                    fill={k < dp.tasksDone ? d.color : '#fff'}
                    stroke="#2A2B5F"
                    strokeWidth={1.8}
                  />
                ))}
              </g>
            )}
            {dp.stamp && (
              <g transform="translate(-86 -86)" className="map-medal">
                <path d="M -9 6 L -14 30 L -7 25 L -2 32 L 2 10 Z" fill="#FF6B5B" stroke="#2A2B5F" strokeWidth={2} />
                <path d="M 9 6 L 14 30 L 7 25 L 2 32 L -2 10 Z" fill="#3EC5F2" stroke="#2A2B5F" strokeWidth={2} />
                <circle r={19} fill="#FFD24A" stroke="#8A5A00" strokeWidth={3} />
                <circle r={13} fill="#FFE98A" stroke="#C98A12" strokeWidth={1.5} />
                <path d="M0 -9 L2.7 -2.8 L9 -2.8 L4 1.1 L5.8 7.8 L0 4 L-5.8 7.8 L-4 1.1 L-9 -2.8 L-2.7 -2.8 Z" fill="#E59A0C" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function TrainShape({ y }: { y: number }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <g transform="translate(-60 -22)">
        {[0, 1].map((k) => (
          <g key={k} transform={`translate(${36 + k * 40} 4)`}>
            <rect x={0} y={0} width={36} height={22} rx={5} fill={k ? '#5ED6B4' : '#FFC94D'} stroke="#24324A" strokeWidth={1.5} />
            <rect x={5} y={4} width={10} height={8} rx={2} fill="#DFF5FC" />
            <rect x={20} y={4} width={10} height={8} rx={2} fill="#DFF5FC" />
            <circle cx={8} cy={24} r={4} fill="#24324A" />
            <circle cx={28} cy={24} r={4} fill="#24324A" />
          </g>
        ))}
        <g>
          <rect x={0} y={4} width={34} height={22} rx={6} fill="#FF7F6E" stroke="#24324A" strokeWidth={1.5} />
          <rect x={2} y={-6} width={14} height={12} rx={3} fill="#FF7F6E" stroke="#24324A" strokeWidth={1.5} />
          <rect x={5} y={-3} width={8} height={6} rx={1} fill="#DFF5FC" />
          <circle cx={8} cy={28} r={4} fill="#24324A" />
          <circle cx={26} cy={28} r={4} fill="#24324A" />
        </g>
      </g>
    </g>
  );
}

/** مشهد حديقة المدينة بعد الافتتاح (يُستخدم في المهمة الختامية) */
export function ParkScene({ open }: { open: boolean }) {
  return (
    <svg className="park-scene" viewBox="-180 -110 360 200" role="img" aria-label={open ? 'حديقة المدينة مفتوحة وفيها نافورة وأشجار' : 'حديقة المدينة قبل الافتتاح'}>
      <ParkArt open={open} />
    </svg>
  );
}

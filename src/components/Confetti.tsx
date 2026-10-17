import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useReducedMotion } from '../lib/router';

const COLORS = ['#FF6B5B', '#FFC53D', '#3EC5F2', '#34D6A6', '#8E7CFF', '#FF7AB8'];

/** احتفال قصير بقصاصات ملونة عند الإجابة الصحيحة (يُلغى مع تقليل الحركة) */
export function Confetti({ pieces = 34 }: { pieces?: number }) {
  const reduced = useReducedMotion();
  const [on, setOn] = useState(true);
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: 10 + Math.random() * 80,
        dx: (Math.random() - 0.5) * 260,
        rot: Math.random() * 720 - 360,
        delay: Math.random() * 0.25,
        color: COLORS[i % COLORS.length],
        shape: i % 3,
      })),
    [pieces],
  );
  useEffect(() => {
    const t = window.setTimeout(() => setOn(false), 1900);
    return () => window.clearTimeout(t);
  }, []);
  if (reduced || !on) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => (
        <span
          key={i}
          className={`confetti-bit s${b.shape}`}
          style={
            {
              left: `${b.left}%`,
              background: b.color,
              animationDelay: `${b.delay}s`,
              '--dx': `${b.dx}px`,
              '--rot': `${b.rot}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

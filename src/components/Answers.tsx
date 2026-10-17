import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { Question } from '../content/types';
import { fmt, parseNumberInput, PLACE_NAMES, toLatinDigits } from '../lib/numbers';
import { Num, Expr, CompareSign } from './Num';
import { usePlacement } from './usePlacement';

export interface AnswerProps<Q> {
  q: Q;
  locked: boolean;
  onSubmit: (correct: boolean) => void;
}

type ChoiceQ = Extract<Question, { kind: 'choice' }>;
type NumberQ = Extract<Question, { kind: 'number' }>;
type CompareQ = Extract<Question, { kind: 'compare' }>;
type OrderQ = Extract<Question, { kind: 'order' }>;
type BuildQ = Extract<Question, { kind: 'build' }>;

/* ---------------- اختيار من متعدد ---------------- */

const KEYS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

export function ChoiceAnswer({ q, locked, onSubmit }: AnswerProps<ChoiceQ>) {
  const [wrong, setWrong] = useState<number[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const long = q.options.some((o) => o.label.length > 24);
  return (
    <div className={`choices ${long ? 'is-long' : ''}`} role="group" aria-label="الخيارات">
      {q.options.map((o, i) => {
        const isCorrect = locked && i === q.answer;
        return (
          <button
            key={i}
            type="button"
            className={`choice ${wrong.includes(i) ? 'is-wrong' : ''} ${isCorrect ? 'is-correct' : ''} ${picked === i ? 'is-picked' : ''}`}
            disabled={locked || wrong.includes(i)}
            onClick={() => {
              setPicked(i);
              const ok = i === q.answer;
              if (!ok) setWrong((w) => [...w, i]);
              onSubmit(ok);
            }}
          >
            <span className="choice-key" aria-hidden="true">{KEYS[i]}</span>
            <span className="choice-body">{o.tokens ? <Expr tokens={o.tokens} size="sm" /> : o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- إدخال عدد ---------------- */

export function NumberAnswer({ q, locked, onSubmit }: AnswerProps<NumberQ>) {
  const [raw, setRaw] = useState('');
  const [error, setError] = useState('');
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const parsed = parseNumberInput(raw);

  // إبقاء السؤال وزر الإجابة ظاهرين عند ظهور لوحة مفاتيح الجوال
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      if (document.activeElement === inputRef.current) {
        formRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  const showPreview = raw.trim() !== '' && parsed !== null && toLatinDigits(raw).replace(/\D/g, '') !== '' && fmt(parsed) !== raw.trim();

  return (
    <form
      ref={formRef}
      className="number-answer"
      onSubmit={(e) => {
        e.preventDefault();
        if (locked) return;
        if (parsed === null) {
          setError('اكتبي عددًا بالأرقام فقط، مثل ٢٥٠ أو 250.');
          return;
        }
        setError('');
        onSubmit(parsed === q.answer);
      }}
    >
      {q.tokens && (
        <div className="number-expr">
          <Expr tokens={q.tokens} size="lg" blankContent={parsed !== null ? <Num v={parsed} /> : '؟'} />
        </div>
      )}
      <label htmlFor={id} className="number-label">
        {q.prompt}
      </label>
      <div className="number-row">
        <input
          ref={inputRef}
          id={id}
          className="number-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          dir="ltr"
          value={raw}
          disabled={locked}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-help`}
          onChange={(e) => {
            setRaw(e.target.value);
            setError('');
          }}
          onFocus={() => {
            window.setTimeout(() => formRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350);
          }}
          placeholder="؟"
        />
        {q.unit && <span className="number-unit">{q.unit}</span>}
        <button type="submit" className="btn btn-primary" disabled={locked || raw.trim() === ''}>
          تحقّقي
        </button>
      </div>
      <p id={`${id}-help`} className={`number-help ${error ? 'is-error' : ''}`} aria-live="polite">
        {error || (showPreview && parsed !== null ? <>قرأتُ إجابتكِ: <Num v={parsed} /></> : 'يمكنكِ الكتابة بالأرقام العربية أو الإنجليزية.')}
      </p>
    </form>
  );
}

/* ---------------- المقارنة ---------------- */

const SIGNS: { s: '>' | '<' | '='; label: string }[] = [
  { s: '>', label: 'أكبر من' },
  { s: '<', label: 'أصغر من' },
  { s: '=', label: 'يساوي' },
];

export function CompareAnswer({ q, locked, onSubmit }: AnswerProps<CompareQ>) {
  const [wrong, setWrong] = useState<string[]>([]);
  const [chosen, setChosen] = useState<'>' | '<' | '=' | null>(null);
  return (
    <div className="compare-answer">
      <div className="compare-view big" dir="rtl" aria-live="polite">
        <span className="train-badge">
          <span aria-hidden="true">🚆</span>
          <Num v={q.a} />
        </span>
        <CompareSign sign={locked ? q.answer : chosen && !wrong.includes(chosen) ? chosen : null} size={52} />
        <span className="train-badge">
          <span aria-hidden="true">🚆</span>
          <Num v={q.b} />
        </span>
      </div>
      <div className="sign-buttons" role="group" aria-label="اختاري العلامة">
        {SIGNS.map(({ s, label }) => (
          <button
            key={s}
            type="button"
            className={`choice sign-btn ${wrong.includes(s) ? 'is-wrong' : ''} ${locked && s === q.answer ? 'is-correct' : ''}`}
            disabled={locked || wrong.includes(s)}
            onClick={() => {
              setChosen(s);
              const ok = s === q.answer;
              if (!ok) setWrong((w) => [...w, s]);
              onSubmit(ok);
            }}
          >
            <CompareSign sign={s} size={34} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <p className="tiny-note">العدد الأول على اليمين. فتحة العلامة تتجه نحو العدد الأكبر.</p>
    </div>
  );
}

/* ---------------- ترتيب عربات القطار ---------------- */

function DragGhost({ drag, label }: { drag: { x: number; y: number } | null; label: ReactNode }) {
  if (!drag) return null;
  return (
    <div className="drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
      {label}
    </div>
  );
}

export function OrderAnswer({ q, locked, onSubmit }: AnswerProps<OrderQ>) {
  const n = q.items.length;
  const P = usePlacement(n, n, locked);
  const [wrongSlots, setWrongSlots] = useState<number[]>([]);
  const sorted = [...q.items].sort((x, y) => (q.direction === 'asc' ? x - y : y - x));
  const ordinal = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة'];

  return (
    <div className="order-answer">
      <div className="train" dir="rtl">
        <div className="engine" aria-hidden="true">
          <svg viewBox="0 0 90 70">
            <rect x="8" y="18" width="62" height="34" rx="8" fill="#FF7F6E" />
            <rect x="46" y="6" width="26" height="22" rx="5" fill="#FF7F6E" />
            <rect x="51" y="10" width="16" height="12" rx="3" fill="#DFF5FC" />
            <rect x="14" y="8" width="10" height="14" rx="2" fill="#24324A" />
            <circle cx="24" cy="56" r="9" fill="#24324A" />
            <circle cx="56" cy="56" r="9" fill="#24324A" />
            <path d="M70 46 L86 56 L70 56 Z" fill="#FFC94D" />
          </svg>
        </div>
        {Array.from({ length: n }, (_, slot) => {
          const tile = P.placed[slot];
          return (
            <button
              key={slot}
              type="button"
              data-slot={slot}
              className={`car-slot ${tile !== null ? 'is-filled' : ''} ${P.selected !== null ? 'is-target' : ''} ${wrongSlots.includes(slot) ? 'is-wrong' : ''} ${locked ? 'is-done' : ''}`}
              onClick={() => P.onSlotClick(slot)}
              aria-label={`العربة ${ordinal[slot] ?? fmt(slot + 1)}: ${tile !== null ? fmt(q.items[tile]) : 'فارغة'}`}
            >
              <span className="car-index">
                <Num v={slot + 1} />
              </span>
              {tile !== null ? (
                <span
                  className={`car ${P.selected === tile ? 'is-selected' : ''}`}
                  onPointerDown={P.onPointerDown(tile)}
                >
                  <Num v={q.items[tile]} />
                </span>
              ) : (
                <span className="car-empty">ضعي عربة</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="pool" data-pool onClick={P.onPoolClick} aria-label="العربات المتاحة">
        {P.pool.length === 0 && !locked && <span className="pool-empty">انقري على عربة داخل القطار لتحريكها</span>}
        {P.selected !== null && P.placed.includes(P.selected) && !locked && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); P.onPoolClick(); }}>
            إخراج العربة المحددة
          </button>
        )}
        {P.pool.map((tile) => (
          <button
            key={tile}
            type="button"
            className={`car loose ${P.selected === tile ? 'is-selected' : ''}`}
            aria-pressed={P.selected === tile}
            onPointerDown={P.onPointerDown(tile)}
            onClick={(e) => {
              e.stopPropagation();
              P.onTileClick(tile);
            }}
          >
            <Num v={q.items[tile]} />
          </button>
        ))}
      </div>
      <p className="tiny-note">انقري على عربة ثم على مكانها في القطار، أو اسحبيها إليه.</p>
      <div className="row-actions">
        <button type="button" className="btn btn-ghost" onClick={() => { P.reset(); setWrongSlots([]); }} disabled={locked}>
          إعادة الترتيب
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!P.full || locked}
          onClick={() => {
            const wrong = P.placed.map((t, i) => (t !== null && q.items[t] === sorted[i] ? -1 : i)).filter((i) => i >= 0);
            setWrongSlots(wrong);
            onSubmit(wrong.length === 0);
          }}
        >
          تحقّقي
        </button>
      </div>
      <DragGhost drag={P.drag} label={P.drag ? <Num v={q.items[P.drag.tile]} /> : null} />
    </div>
  );
}

/* ---------------- بناء عدد في المنازل ---------------- */

export function BuildAnswer({ q, locked, onSubmit }: AnswerProps<BuildQ>) {
  const P = usePlacement(q.tiles.length, q.places, locked);
  const [wrongSlots, setWrongSlots] = useState<number[]>([]);
  const target = String(q.target).split('').reverse().map(Number);
  const built = P.full ? Number(P.placed.map((t) => q.tiles[t!]).reverse().join('')) : null;
  return (
    <div className="build-answer">
      <div className="place-chart slots" dir="rtl">
        {Array.from({ length: q.places }, (_, slot) => {
          const tile = P.placed[slot];
          return (
            <button
              key={slot}
              type="button"
              data-slot={slot}
              className={`house slot ${tile !== null ? 'is-filled' : ''} ${P.selected !== null ? 'is-target' : ''} ${wrongSlots.includes(slot) ? 'is-wrong' : ''} ${slot % 3 === 2 && slot < q.places - 1 ? 'period-end' : ''}`}
              onClick={() => P.onSlotClick(slot)}
              aria-label={`منزلة ${PLACE_NAMES[slot]}: ${tile !== null ? fmt(q.tiles[tile]) : 'فارغة'}`}
            >
              <span className="house-roof" aria-hidden="true" />
              <span className="house-name">{PLACE_NAMES[slot]}</span>
              <span className="house-digit">
                {tile !== null ? (
                  <span className={`digit-tile in-slot ${P.selected === tile ? 'is-selected' : ''}`} onPointerDown={P.onPointerDown(tile)}>
                    <Num v={q.tiles[tile]} />
                  </span>
                ) : (
                  <span className="slot-empty">؟</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="pool" data-pool onClick={P.onPoolClick} aria-label="الأرقام المتاحة">
        {P.pool.map((tile) => (
          <button
            key={tile}
            type="button"
            className={`digit-tile ${P.selected === tile ? 'is-selected' : ''}`}
            aria-pressed={P.selected === tile}
            aria-label={`الرقم ${fmt(q.tiles[tile])}`}
            onPointerDown={P.onPointerDown(tile)}
            onClick={(e) => {
              e.stopPropagation();
              P.onTileClick(tile);
            }}
          >
            <Num v={q.tiles[tile]} />
          </button>
        ))}
        {P.pool.length === 0 && !locked && <span className="pool-empty">انقري على رقم داخل منزل لتحريكه</span>}
        {P.selected !== null && P.placed.includes(P.selected) && !locked && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); P.onPoolClick(); }}>
            إخراج الرقم المحدد
          </button>
        )}
      </div>
      <p className="tiny-note">انقري على رقم ثم على منزله، أو اسحبيه إليه.</p>
      {built !== null && (
        <p className="built-preview">
          العدد الذي بنيتِه: <Num v={built} />
        </p>
      )}
      <div className="row-actions">
        <button type="button" className="btn btn-ghost" onClick={() => { P.reset(); setWrongSlots([]); }} disabled={locked}>
          إفراغ المنازل
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!P.full || locked}
          onClick={() => {
            const wrong = P.placed.map((t, i) => (t !== null && q.tiles[t] === target[i] ? -1 : i)).filter((i) => i >= 0);
            setWrongSlots(wrong);
            onSubmit(wrong.length === 0);
          }}
        >
          تحقّقي
        </button>
      </div>
      <DragGhost drag={P.drag} label={P.drag ? <Num v={q.tiles[P.drag.tile]} /> : null} />
    </div>
  );
}

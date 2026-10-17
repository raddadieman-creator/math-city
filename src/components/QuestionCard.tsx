import { useEffect, useMemo, useRef, useState } from 'react';
import type { Question } from '../content/types';
import { VisualView } from './Visuals';
import { ChoiceAnswer, NumberAnswer, CompareAnswer, OrderAnswer, BuildAnswer } from './Answers';
import { NohaFace } from './Noha';
import { Num } from './Num';
import { Confetti } from './Confetti';
import { PRAISE, TRY_AGAIN } from '../lib/arabic';
import { fmt } from '../lib/numbers';
import { sfx } from '../lib/sound';

export interface Outcome {
  firstTry: boolean;
  revealed: boolean;
}

function answerText(q: Question) {
  switch (q.kind) {
    case 'choice':
      return q.options[q.answer].label;
    case 'number':
      return <Num v={q.answer} />;
    case 'compare':
      return (
        <>
          <Num v={q.a} /> {q.answer === '>' ? 'أكبر من' : q.answer === '<' ? 'أصغر من' : 'يساوي'} <Num v={q.b} />
        </>
      );
    case 'order': {
      const s = [...q.items].sort((x, y) => (q.direction === 'asc' ? x - y : y - x));
      return s.map((x) => fmt(x)).join('، ثم ');
    }
    case 'build':
      return <Num v={q.target} />;
  }
}

export function QuestionCard({
  q,
  guided = false,
  label,
  onDone,
  nextLabel = 'التالي',
}: {
  q: Question;
  guided?: boolean;
  label?: string;
  onDone: (o: Outcome) => void;
  nextLabel?: string;
}) {
  const [wrong, setWrong] = useState(0);
  const [status, setStatus] = useState<'answering' | 'correct' | 'revealed'>('answering');
  const [msg, setMsg] = useState('');
  const feedbackRef = useRef<HTMLDivElement>(null);
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], []);
  const locked = status !== 'answering';
  const showHint = guided || wrong > 0;

  // يُستخدم فقط في الاختبارات الآلية (يُفعَّل بمفتاح خاص في التخزين المحلي)
  useEffect(() => {
    try {
      if (window.localStorage.getItem('math-city-e2e')) (window as unknown as { __mcq: Question }).__mcq = q;
    } catch {
      /* لا شيء */
    }
  }, [q]);

  useEffect(() => {
    if (status !== 'answering' || wrong > 0) {
      window.setTimeout(() => feedbackRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 80);
    }
  }, [status, wrong]);

  const submit = (ok: boolean) => {
    if (ok) {
      sfx.correct();
      setStatus('correct');
    } else {
      sfx.wrong();
      setWrong((w) => w + 1);
      setMsg(TRY_AGAIN[wrong % TRY_AGAIN.length]);
    }
  };

  const answerProps = { locked, onSubmit: submit };
  const isNumber = q.kind === 'number';

  return (
    <article className="q-card" aria-labelledby="q-prompt">
      {label && <div className="q-label">{label}</div>}
      {q.story && (
        <p className="q-story">
          <span className="q-story-pin" aria-hidden="true">📍</span>
          {q.story}
        </p>
      )}
      {!isNumber && (
        <h2 id="q-prompt" className="q-prompt">
          {q.prompt}
        </h2>
      )}
      {isNumber && <h2 id="q-prompt" className="sr-only">{q.prompt}</h2>}
      {q.visual && (
        <div className="q-visual">
          <VisualView v={q.visual} />
        </div>
      )}

      {showHint && status === 'answering' && (
        <div className="hint-box" role="status">
          <NohaFace mood="think" size={52} />
          <div>
            <strong className="hint-title">{guided && wrong === 0 ? 'تلميح نُهى قبل أن تبدئي' : 'تلميح'}</strong>
            <p>{q.hint}</p>
            {q.hintVisual && (
              <div className="hint-visual">
                <VisualView v={q.hintVisual} />
              </div>
            )}
            {wrong >= 2 && q.stepVisual && (
              <div className="hint-visual">
                <strong className="hint-title">شرح بصري</strong>
                <VisualView v={q.stepVisual} />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="q-answer">
        {q.kind === 'choice' && <ChoiceAnswer q={q} {...answerProps} />}
        {q.kind === 'number' && <NumberAnswer q={q} {...answerProps} />}
        {q.kind === 'compare' && <CompareAnswer q={q} {...answerProps} />}
        {q.kind === 'order' && <OrderAnswer q={q} {...answerProps} />}
        {q.kind === 'build' && <BuildAnswer q={q} {...answerProps} />}
      </div>

      <div ref={feedbackRef} aria-live="polite" className="feedback-zone">
        {status === 'answering' && wrong > 0 && (
          <div className="feedback is-wrong">
            <span>{msg}</span>
            {wrong >= 2 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus('revealed')}>
                أريني الحل
              </button>
            )}
          </div>
        )}
        {status === 'correct' && <Confetti />}
        {status !== 'answering' && (
          <div className={`feedback ${status === 'correct' ? 'is-right' : 'is-shown'}`}>
            <div className="feedback-head">
              <NohaFace mood={status === 'correct' ? 'cheer' : 'happy'} size={56} />
              <div>
                <strong className="feedback-title">
                  {status === 'correct' ? praise : 'لا بأس، هذا هو الحل:'}
                </strong>
                {status === 'revealed' && <p className="reveal-answer">الإجابة: {answerText(q)}</p>}
                <p>
                  <span className="why">لماذا؟ </span>
                  {q.explain}
                </p>
              </div>
            </div>
            {q.explainVisual &&
              (status === 'revealed' ? (
                <div className="q-visual explain-visual">
                  <VisualView v={q.explainVisual} />
                </div>
              ) : (
                <details className="explain-more">
                  <summary>شاهدي الشرح بالرسم</summary>
                  <div className="q-visual explain-visual">
                    <VisualView v={q.explainVisual} />
                  </div>
                </details>
              ))}
            <button
              type="button"
              className="btn btn-primary btn-next is-sticky"
              autoFocus
              onClick={() => onDone({ firstTry: status === 'correct' && wrong === 0, revealed: status === 'revealed' })}
            >
              {nextLabel}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

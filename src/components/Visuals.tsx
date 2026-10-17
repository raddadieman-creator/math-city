import { useState, type ReactNode } from 'react';
import type { Visual, VoteRow, ShopItem } from '../content/types';
import { settings } from '../config/settings';
import { digitsOf, fmt, PLACE_NAMES } from '../lib/numbers';
import { additionCarries, subtractionRegroup, roundTo } from '../lib/math';
import { countPhrase, placeWord } from '../lib/arabic';
import { Num, Expr, CompareSign } from './Num';

export function VisualView({ v }: { v: Visual }) {
  switch (v.type) {
    case 'placeChart':
      return <PlaceChart n={v.n} places={v.places} highlight={v.highlight} interactive={v.interactive} />;
    case 'expr':
      return <Expr tokens={v.tokens} size="lg" />;
    case 'compare':
      return <CompareView a={v.a} b={v.b} highlightPlace={v.highlightPlace} sign={v.sign ?? null} />;
    case 'numberLine':
      return <NumberLine n={v.n} low={v.low} high={v.high} reveal={v.reveal} />;
    case 'column':
      return <ColumnOp op={v.op} operands={v.operands} stage={v.stage} />;
    case 'receipt':
      return <Receipt items={v.items} budget={v.budget} />;
    case 'votes':
      return <Votes title={v.title} rows={v.rows} show={v.show} step={v.step} />;
    case 'pattern':
      return <Pattern seq={v.seq} theme={v.theme} />;
    case 'array':
      return <ArrayView rows={v.rows} cols={v.cols} groupRows={v.groupRows} />;
    case 'estimate':
      return <EstimateView op={v.op} a={v.a} b={v.b} place={v.place} showExact={v.showExact} />;
    case 'group':
      return (
        <div className="vis-group">
          {v.items.map((x, i) => (
            <VisualView key={i} v={x} />
          ))}
        </div>
      );
  }
}

/* ---------------- لوحة المنازل ---------------- */

const HOUSE_COLORS = ['#FF8A7A', '#FFC94D', '#5ED6B4', '#4FC3E8', '#9B8CFF', '#FF7EB6', '#8BC34A'];

export function PlaceChart({
  n,
  places,
  highlight,
  interactive,
}: {
  n: number;
  places: number;
  highlight?: number;
  interactive?: boolean;
}) {
  const d = digitsOf(n);
  const [picked, setPicked] = useState<number | null>(highlight ?? null);
  const shown = interactive ? picked : highlight ?? null;
  return (
    <div className="place-chart-wrap">
      <div className="place-chart" dir="rtl" role="group" aria-label={`لوحة المنازل للعدد ${fmt(n)}`}>
        {Array.from({ length: places }, (_, i) => {
          const digit = d[i] ?? 0;
          const content = (
            <>
              <span className="house-roof" style={{ background: HOUSE_COLORS[i] }} aria-hidden="true" />
              <span className="house-name">{PLACE_NAMES[i]}</span>
              <span className="house-digit">
                <Num v={digit} />
              </span>
            </>
          );
          const cls = `house ${shown === i ? 'is-hl' : ''} ${i % 3 === 2 && i < places - 1 ? 'period-end' : ''}`;
          return interactive ? (
            <button
              type="button"
              key={i}
              className={cls}
              onClick={() => setPicked(i)}
              aria-pressed={picked === i}
              aria-label={`الرقم ${fmt(digit)} في منزلة ${PLACE_NAMES[i]}`}
            >
              {content}
            </button>
          ) : (
            <div key={i} className={cls}>
              {content}
            </div>
          );
        })}
      </div>
      {shown !== null && shown !== undefined && (
        <p className="place-value-note" aria-live="polite">
          الرقم <Num v={d[shown] ?? 0} /> في منزلة {PLACE_NAMES[shown]}، قيمته <strong><Num v={(d[shown] ?? 0) * 10 ** shown} /></strong>
        </p>
      )}
    </div>
  );
}

/* ---------------- المقارنة ---------------- */

function DigitsHighlighted({ n, place }: { n: number; place?: number }) {
  const s = fmt(n);
  // نحدد موضع الرقم في السلسلة المعروضة مع الفواصل
  const chars = s.split('');
  let digitIndexFromRight = -1;
  const out = chars
    .map((c, idx) => ({ c, idx }))
    .reverse()
    .map(({ c, idx }) => {
      if (c !== '٬') digitIndexFromRight++;
      const hl = c !== '٬' && digitIndexFromRight === place;
      return { c, idx, hl };
    })
    .reverse();
  return (
    <bdi className="num cmp-num" dir="ltr">
      {out.map(({ c, idx, hl }) => (
        <span key={idx} className={hl ? 'digit-hl' : undefined}>
          {c}
        </span>
      ))}
    </bdi>
  );
}

export function CompareView({
  a,
  b,
  highlightPlace,
  sign,
}: {
  a: number;
  b: number;
  highlightPlace?: number;
  sign: '>' | '<' | '=' | null;
}) {
  return (
    <div className="compare-view" dir="rtl">
      <DigitsHighlighted n={a} place={highlightPlace} />
      <CompareSign sign={sign} />
      <DigitsHighlighted n={b} place={highlightPlace} />
    </div>
  );
}

/* ---------------- خط الأعداد ---------------- */

export function NumberLine({ n, low, high, reveal }: { n: number; low: number; high: number; reveal?: boolean }) {
  const W = 640;
  const x0 = 50;
  const x1 = W - 50;
  const pos = (v: number) => x0 + ((v - low) / (high - low)) * (x1 - x0);
  const mid = (low + high) / 2;
  const nx = pos(n);
  const nearest = n >= mid ? high : low;
  const ticks = Array.from({ length: 11 }, (_, i) => low + ((high - low) * i) / 10);
  return (
    <figure className="number-line">
      <svg viewBox={`0 0 ${W} 170`} role="img" aria-label={`خط أعداد من ${fmt(low)} إلى ${fmt(high)}، ونقطة المنتصف ${fmt(mid)}، والعدد ${fmt(n)}`}>
        <line x1={x0 - 20} y1={110} x2={x1 + 20} y2={110} className="nl-axis" />
        {ticks.map((t, i) => (
          <line key={i} x1={pos(t)} x2={pos(t)} y1={i % 5 === 0 ? 96 : 102} y2={i % 5 === 0 ? 124 : 118} className="nl-tick" />
        ))}
        {/* الطرفان ونقطة المنتصف */}
        <g className="nl-end">
          <circle cx={x0} cy={110} r={9} />
          <text x={x0} y={152} textAnchor="middle">{fmt(low)}</text>
        </g>
        <g className="nl-end">
          <circle cx={x1} cy={110} r={9} />
          <text x={x1} y={152} textAnchor="middle">{fmt(high)}</text>
        </g>
        <g className="nl-mid">
          <line x1={pos(mid)} x2={pos(mid)} y1={88} y2={132} />
          <text x={pos(mid)} y={152} textAnchor="middle">{fmt(mid)}</text>
          <text x={pos(mid)} y={80} textAnchor="middle" className="nl-small">المنتصف</text>
        </g>
        {/* العدد المطلوب */}
        <g className="nl-point">
          <line x1={nx} x2={nx} y1={46} y2={104} />
          <circle cx={nx} cy={110} r={7} />
          <rect x={nx - 46} y={8} width={92} height={36} rx={18} />
          <text x={nx} y={33} textAnchor="middle">{fmt(n)}</text>
        </g>
        {reveal && (
          <g className="nl-reveal">
            <circle cx={pos(nearest)} cy={110} r={15} className="nl-near" />
            {Math.abs(pos(nearest) - nx) > 50 && (
              <path d={`M ${nx} 98 Q ${(nx + pos(nearest)) / 2} 62 ${pos(nearest) + (nearest > n ? -14 : 14)} 96`} markerEnd="url(#nl-arrow)" />
            )}
            <defs>
              <marker id="nl-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
          </g>
        )}
      </svg>
      {reveal && (
        <figcaption>
          الأقرب: <Num v={nearest} />
        </figcaption>
      )}
    </figure>
  );
}

/* ---------------- الجمع والطرح العمودي ---------------- */

const SHORT_PLACE = ['آحاد', 'عشرات', 'مئات', 'آلاف', 'ع. آلاف', 'م. آلاف', 'ملايين'];

export function ColumnOp({ op, operands, stage }: { op: '+' | '−'; operands: number[]; stage: 'problem' | 'regroup' | 'solved' }) {
  const result = op === '+' ? operands.reduce((s, x) => s + x, 0) : operands[0] - operands[1];
  const width = Math.max(...operands.map((x) => String(x).length), String(result).length);
  const signLeft = settings.columnSignSide === 'left';
  const cols = width + 1;
  // نبني صفوفًا من اليسار إلى اليمين (أرقام العدد تُكتب من اليسار)
  const pad = (n: number | null, mark?: (i: number) => string | undefined) => {
    const d = n === null ? [] : digitsOf(n);
    return Array.from({ length: width }, (_, k) => {
      const place = width - 1 - k;
      return { place, digit: d[place], cls: mark?.(place) };
    });
  };
  const carries = op === '+' ? additionCarries(operands) : [];
  const regroup = op === '−' ? subtractionRegroup(operands[0], operands[1]) : null;
  const showWork = stage !== 'problem';

  const cell = (content: ReactNode, key: string, cls = '') => (
    <span key={key} className={`col-cell ${cls}`}>
      {content}
    </span>
  );
  const signCell = (s: string, key: string) => cell(s, key, 'col-sign col-last');
  const empty = (key: string) => cell('', key, 'col-empty');

  const row = (cells: ReactNode[], sign: ReactNode) => (signLeft ? [sign, ...cells] : [...cells, sign]);

  const rows: ReactNode[] = [];
  // رؤوس المنازل
  rows.push(
    ...row(
      pad(null).map(({ place }) => cell(SHORT_PLACE[place] ?? '', `h${place}`, 'col-head')),
      empty('hs'),
    ),
  );
  // صف الحمل أو إعادة التجميع
  if (showWork && op === '+') {
    rows.push(
      ...row(
        pad(null).map(({ place }) =>
          cell(carries[place] ? <Num v={carries[place]} /> : '', `c${place}`, 'col-carry'),
        ),
        empty('cs'),
      ),
    );
  }
  if (showWork && regroup) {
    rows.push(
      ...row(
        pad(null).map(({ place }) =>
          cell(regroup.changed[place] ? <Num v={regroup.working[place]} sep={false} /> : '', `r${place}`, 'col-carry'),
        ),
        empty('rs'),
      ),
    );
  }
  operands.forEach((o, idx) => {
    const isLast = idx === operands.length - 1;
    rows.push(
      ...row(
        pad(o).map(({ place, digit }) =>
          cell(
            digit === undefined ? '' : <Num v={digit} />,
            `o${idx}-${place}`,
            `col-digit ${showWork && regroup && idx === 0 && regroup.changed[place] ? 'col-crossed' : ''} ${isLast ? 'col-last' : ''}`,
          ),
        ),
        isLast ? signCell(op, `s${idx}`) : empty(`s${idx}`),
      ),
    );
  });
  // الناتج
  const rd = digitsOf(result);
  rows.push(
    ...row(
      pad(null).map(({ place }) =>
        cell(
          stage === 'solved' && rd[place] !== undefined ? <Num v={rd[place]} /> : '',
          `res${place}`,
          `col-result ${stage === 'solved' ? 'is-solved' : ''}`,
        ),
      ),
      empty('ress'),
    ),
  );

  const label =
    `${op === '+' ? 'جمع' : 'طرح'} عمودي: ${operands.map((x) => fmt(x)).join(op === '+' ? ' زائد ' : ' ناقص ')}` +
    (stage === 'solved' ? ` يساوي ${fmt(result)}` : '');
  return (
    <div className="column-op" role="img" aria-label={label}>
      <div className="column-grid" dir="ltr" style={{ gridTemplateColumns: `repeat(${cols}, var(--col-w))` }}>
        {rows}
      </div>
      {showWork && op === '+' && carries.some(Boolean) && <p className="col-note">الأرقام الصغيرة في الأعلى هي ما حملناه بعد إعادة التجميع.</p>}
      {showWork && regroup && regroup.changed.some(Boolean) && (
        <p className="col-note">الأرقام الصغيرة في الأعلى هي قيم المنازل بعد إعادة التجميع، والمشطوبة هي القيم الأصلية.</p>
      )}
    </div>
  );
}

/* ---------------- فاتورة السوق ---------------- */

export function Receipt({ items, budget }: { items: ShopItem[]; budget?: number }) {
  return (
    <div className="receipt">
      <div className="receipt-head">🧾 قائمة المشتريات</div>
      <ul>
        {items.map((it, i) => (
          <li key={i}>
            <span className="receipt-icon" aria-hidden="true">
              {it.icon}
            </span>
            <span className="receipt-name">{it.name}</span>
            <span className="receipt-price">
              {countPhrase(it.price, 'riyal')}
            </span>
          </li>
        ))}
      </ul>
      {budget !== undefined && (
        <div className="receipt-budget">
          الميزانية: <strong>{countPhrase(budget, 'riyal')}</strong>
        </div>
      )}
    </div>
  );
}

/* ---------------- التصويت: جدول وأعمدة ---------------- */

export function Votes({ title, rows, show, step }: { title: string; rows: VoteRow[]; show: 'table' | 'bars' | 'both'; step: number }) {
  return (
    <figure className="votes">
      <figcaption className="votes-title">{title}</figcaption>
      <div className={`votes-body ${show === 'both' ? 'is-both' : ''}`}>
        {(show === 'table' || show === 'both') && (
          <table className="votes-table">
            <thead>
              <tr>
                <th scope="col">المشروع</th>
                <th scope="col">عدد الأصوات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}>
                  <td>
                    <span aria-hidden="true">{r.icon}</span> {r.label}
                  </td>
                  <td>
                    <Num v={r.value} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {(show === 'bars' || show === 'both') && <BarChart rows={rows} step={step} />}
      </div>
    </figure>
  );
}

function BarChart({ rows, step }: { rows: VoteRow[]; step: number }) {
  const max = Math.max(settings.stats.maxVotes, ...rows.map((r) => r.value));
  const top = Math.ceil(max / step) * step;
  const W = 460;
  const H = 300;
  const padR = 56; // المحور على اليمين
  const padL = 14;
  const padT = 30;
  const padB = 64;
  const plotW = W - padR - padL;
  const plotH = H - padT - padB;
  const y = (v: number) => padT + plotH - (v / top) * plotH;
  const slot = plotW / rows.length;
  const barW = Math.min(64, slot * 0.6);
  const colors = ['#4FC3E8', '#5ED6B4', '#FFC94D', '#FF8A7A', '#9B8CFF', '#FF7EB6'];
  const lines = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  return (
    <svg
      className="bar-chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`تمثيل بالأعمدة: ${rows.map((r) => `${r.label} ${fmt(r.value)}`).join('، ')}. كل خط يساوي ${fmt(step)}`}
    >
      {lines.map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} className={v === 0 ? 'bc-base' : 'bc-grid'} />
          <text x={W - padR + 10} y={y(v) + 6} className="bc-ylabel" textAnchor="start">
            {fmt(v)}
          </text>
        </g>
      ))}
      <text x={W - 4} y={14} className="bc-axis-title" textAnchor="start">
        الأصوات
      </text>
      {rows.map((r, i) => {
        // الترتيب من اليمين إلى اليسار ليطابق ترتيب الجدول من الأعلى
        const cx = W - padR - slot * (i + 0.5);
        return (
          <g key={r.label}>
            <rect x={cx - barW / 2} y={y(r.value)} width={barW} height={y(0) - y(r.value)} rx={6} fill={colors[i % colors.length]} />
            <text x={cx} y={H - padB + 26} textAnchor="middle" className="bc-icon">
              {r.icon}
            </text>
            <text x={cx} y={H - padB + 52} textAnchor="middle" className="bc-xlabel">
              {r.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- الأنماط ---------------- */

export function Pattern({ seq, theme }: { seq: (number | null)[]; theme: 'flowers' | 'tiles' }) {
  return (
    <div className={`pattern pattern-${theme}`} dir="rtl" role="list" aria-label="نمط عددي">
      {seq.map((v, i) => (
        <div key={i} role="listitem" className={`pattern-item ${v === null ? 'is-missing' : ''}`}>
          {theme === 'flowers' ? (
            <svg viewBox="0 0 100 100" aria-hidden="true" className="flower">
              {Array.from({ length: 6 }, (_, k) => (
                <ellipse key={k} cx="50" cy="22" rx="16" ry="22" transform={`rotate(${k * 60} 50 50)`} className={`petal p${i % 4}`} />
              ))}
              <circle cx="50" cy="50" r="24" className="flower-center" />
            </svg>
          ) : (
            <span className="tile" aria-hidden="true" />
          )}
          <span className="pattern-value">{v === null ? '؟' : <Num v={v} />}</span>
          {v === null && <span className="sr-only">عدد مفقود</span>}
        </div>
      ))}
    </div>
  );
}

/* ---------------- مصفوفة الأشجار ---------------- */

function Palm({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2.5" y="0" width="5" height="16" rx="2" fill="#B07A47" />
      <path d="M0 2 C -10 -4 -14 2 -16 6 C -10 2 -5 2 0 2 Z" fill="#3FAE6B" />
      <path d="M0 2 C 10 -4 14 2 16 6 C 10 2 5 2 0 2 Z" fill="#3FAE6B" />
      <path d="M0 2 C -6 -10 2 -14 6 -12 C 2 -8 0 -4 0 2 Z" fill="#52C27E" />
      <path d="M0 2 C 6 -10 -2 -14 -6 -12 C -2 -8 0 -4 0 2 Z" fill="#52C27E" />
    </g>
  );
}

export function ArrayView({ rows, cols, groupRows }: { rows: number; cols: number; groupRows?: boolean }) {
  const cw = 38;
  const rh = 40;
  const labelW = groupRows ? 44 : 0;
  const W = cols * cw + 20 + labelW;
  const H = rows * rh + 16;
  return (
    <svg
      className="array-view"
      viewBox={`0 0 ${W} ${H}`}
      style={{ maxWidth: Math.min(W * 1.4, 520) }}
      role="img"
      aria-label={`${countPhrase(rows, 'row')}، في كل صف ${countPhrase(cols, 'tree')}`}
    >
      {Array.from({ length: rows }, (_, r) => (
        <g key={r}>
          {groupRows && (
            <>
              <rect x={6 + labelW} y={8 + r * rh} width={cols * cw + 8} height={rh - 4} rx={10} className="array-row" />
              <text x={labelW - 6} y={8 + r * rh + rh / 2 + 6} textAnchor="end" className="array-label">
                {fmt(cols)}
              </text>
            </>
          )}
          {Array.from({ length: cols }, (_, c) => (
            <Palm key={c} x={10 + labelW + c * cw + cw / 2} y={8 + r * rh + 18} s={1} />
          ))}
        </g>
      ))}
    </svg>
  );
}

/* ---------------- التقدير ---------------- */

export function EstimateView({
  op,
  a,
  b,
  place,
  showExact,
}: {
  op: '+' | '−';
  a: number;
  b: number;
  place: number;
  showExact?: boolean;
}) {
  const ra = roundTo(a, place);
  const rb = roundTo(b, place);
  const est = op === '+' ? ra + rb : ra - rb;
  const exact = op === '+' ? a + b : a - b;
  return (
    <div className="estimate-view">
      <table>
        <thead>
          <tr>
            <th scope="col">العدد</th>
            <th scope="col">مقرَّبًا إلى أقرب {placeWord(place)}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><Num v={a} /></td>
            <td><Num v={ra} /></td>
          </tr>
          <tr>
            <td><Num v={b} /></td>
            <td><Num v={rb} /></td>
          </tr>
        </tbody>
      </table>
      <div className="estimate-lines">
        <div>
          <span className="est-tag">التقدير</span>
          <Expr tokens={[{ t: 'num', v: ra }, { t: 'op', v: op }, { t: 'num', v: rb }, { t: 'op', v: '=' }, { t: 'num', v: est }]} />
        </div>
        {showExact && (
          <div>
            <span className="est-tag exact">الدقيق</span>
            <Expr tokens={[{ t: 'num', v: a }, { t: 'op', v: op }, { t: 'num', v: b }, { t: 'op', v: '=' }, { t: 'num', v: exact }]} />
          </div>
        )}
      </div>
    </div>
  );
}


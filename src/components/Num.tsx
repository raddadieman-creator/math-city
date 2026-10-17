import type { ReactNode } from 'react';
import { fmt } from '../lib/numbers';
import type { Token } from '../content/types';

/** عدد بأرقام عربية معزول عن اتجاه النص المحيط */
export function Num({ v, sep = true, className = '' }: { v: number; sep?: boolean; className?: string }) {
  return (
    <bdi className={`num ${className}`} dir="ltr">
      {fmt(v, sep)}
    </bdi>
  );
}

const OP_LABEL: Record<string, string> = { '+': 'زائد', '−': 'ناقص', '×': 'ضرب', '=': 'يساوي' };

/**
 * تعبير رياضي يُقرأ من اليمين إلى اليسار كما في الكتاب العربي:
 * كل رمز في خلية مستقلة، فلا تنعكس الأرقام ولا العلامات.
 */
export function Expr({ tokens, blankContent, size = 'md' }: { tokens: Token[]; blankContent?: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  const spoken = tokens
    .map((t) => (t.t === 'num' ? fmt(t.v) : t.t === 'op' ? OP_LABEL[t.v] : t.t === 'blank' ? 'فراغ' : t.v))
    .join(' ');
  return (
    <div className={`expr expr-${size}`} dir="rtl" role="math" aria-label={spoken}>
      {tokens.map((t, i) => {
        if (t.t === 'num') return <Num key={i} v={t.v} className="expr-num" />;
        if (t.t === 'op')
          return (
            <span key={i} className="expr-op" aria-hidden="true">
              {t.v}
            </span>
          );
        if (t.t === 'blank')
          return (
            <span key={i} className="expr-blank">
              {blankContent ?? '؟'}
            </span>
          );
        return (
          <span key={i} className="expr-text">
            {t.v}
          </span>
        );
      })}
    </div>
  );
}

/**
 * علامة المقارنة مرسومة: الفتحة تتجه دائمًا نحو العدد الأكبر.
 * في الواجهة العربية يكون العدد الأول على اليمين.
 * '>' تعني: الأول (يمين) أكبر من الثاني (يسار).
 */
export function CompareSign({ sign, size = 40 }: { sign: '>' | '<' | '=' | null; size?: number }) {
  const label = sign === '>' ? 'أكبر من' : sign === '<' ? 'أصغر من' : sign === '=' ? 'يساوي' : 'علامة فارغة';
  return (
    <svg className="cmp-sign" width={size} height={size} viewBox="0 0 40 40" role="img" aria-label={label}>
      {sign === null && <rect x="4" y="4" width="32" height="32" rx="8" className="cmp-empty" />}
      {sign === '>' && <polyline points="32,8 8,20 32,32" />}
      {sign === '<' && <polyline points="8,8 32,20 8,32" />}
      {sign === '=' && (
        <>
          <line x1="8" y1="14" x2="32" y2="14" />
          <line x1="8" y1="26" x2="32" y2="26" />
        </>
      )}
    </svg>
  );
}

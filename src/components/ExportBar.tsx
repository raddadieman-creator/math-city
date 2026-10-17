import { useState } from 'react';
import { downloadNodeAsPng, printNode } from '../lib/exporter';

/**
 * زرّا «تحميل صورة» و«طباعة» لعنصر في الصفحة.
 * prepare: يُستدعى قبل التحميل أو الطباعة ليجهّز العنصر (مثل عرض نسخة الطباعة) ويعيده.
 */
export function ExportBar({
  prepare,
  filename,
  what,
  onDone,
}: {
  prepare: () => Promise<HTMLElement | null>;
  filename: string;
  what: string;
  onDone?: () => void;
}) {
  const [busy, setBusy] = useState<'png' | 'print' | null>(null);
  const [msg, setMsg] = useState('');

  const run = async (kind: 'png' | 'print') => {
    setBusy(kind);
    setMsg('');
    const node = await prepare();
    if (!node) {
      setBusy(null);
      onDone?.();
      return;
    }
    if (kind === 'png') {
      const ok = await downloadNodeAsPng(node, filename);
      setMsg(ok ? `حُمّلت صورة ${what}.` : 'تعذّر التحميل في هذا المتصفح. جرّبي زر الطباعة، ثم اختاري «حفظ بصيغة PDF».');
      onDone?.();
    } else {
      printNode(node);
      window.setTimeout(() => onDone?.(), 1600);
    }
    setBusy(null);
  };

  return (
    <div className="export-bar no-print no-export">
      <button type="button" className="btn btn-gold" disabled={busy !== null} onClick={() => run('png')}>
        <span aria-hidden="true">⬇️</span> {busy === 'png' ? 'جارٍ التحميل…' : `تحميل ${what}`}
      </button>
      <button type="button" className="btn btn-ghost" disabled={busy !== null} onClick={() => run('print')}>
        <span aria-hidden="true">🖨️</span> طباعة {what}
      </button>
      <p className="export-msg" role="status" aria-live="polite">
        {msg}
      </p>
    </div>
  );
}

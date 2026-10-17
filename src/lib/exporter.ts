import { toPng } from 'html-to-image';

/** يحوّل عنصرًا من الصفحة إلى صورة PNG ويحمّلها على الجهاز */
export async function downloadNodeAsPng(node: HTMLElement, filename: string): Promise<boolean> {
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const dataUrl = await toPng(node, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
      // نستبعد الأزرار والعناصر المخصصة للشاشة فقط
      filter: (el) => !(el instanceof HTMLElement && el.classList?.contains('no-export')),
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return true;
  } catch {
    return false;
  }
}

/** يطبع عنصرًا واحدًا فقط: نعلّمه، ثم نفتح نافذة الطباعة، ثم نزيل العلامة */
export function printNode(node: HTMLElement) {
  node.setAttribute('data-print-target', '');
  document.documentElement.classList.add('is-printing');
  const done = () => {
    node.removeAttribute('data-print-target');
    document.documentElement.classList.remove('is-printing');
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  window.setTimeout(() => {
    window.print();
    // بعض المتصفحات لا تطلق afterprint
    window.setTimeout(done, 1500);
  }, 60);
}

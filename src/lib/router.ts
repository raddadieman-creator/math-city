import { useEffect, useState } from 'react';

/**
 * توجيه بسيط بعلامة # (hash routing) حتى تعمل الروابط المباشرة وتحديث الصفحة
 * على أي استضافة ثابتة دون إعدادات إضافية.
 */
export function currentPath(): string {
  const h = window.location.hash.replace(/^#/, '');
  return h.startsWith('/') ? h : '/';
}

export function navigate(path: string) {
  if (currentPath() === path) return;
  window.location.hash = path;
}

/* ===== سجل التنقل داخل الموقع (لزر «رجوع») ===== */
const STACK_KEY = 'math-city-nav-stack';
let navStack: string[] = [];

function saveStack() {
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(navStack.slice(-40)));
  } catch {
    /* التخزين غير متاح: نكتفي بالذاكرة */
  }
}

function initStack() {
  if (typeof window === 'undefined') return;
  const here = currentPath();
  try {
    const saved = JSON.parse(sessionStorage.getItem(STACK_KEY) || '[]');
    if (Array.isArray(saved) && saved.length && saved[saved.length - 1] === here) navStack = saved;
  } catch {
    /* تجاهل */
  }
  if (!navStack.length) navStack = [here];
  saveStack();
  window.addEventListener('hashchange', () => {
    const p = currentPath();
    if (navStack.length > 1 && navStack[navStack.length - 2] === p) navStack.pop();
    else if (navStack[navStack.length - 1] !== p) navStack.push(p);
    saveStack();
  });
}
initStack();

/** الصفحة «الأم» لكل صفحة، تُستخدم عند فتح الموقع مباشرة على صفحة داخلية */
export function parentPath(path: string): string {
  const base = path.split('?')[0];
  if (base === '/' || base === '') return '/';
  if (base === '/city') return '/';
  if (base === '/tour') return '/';
  return '/city';
}

/** الصفحة التي سيعود إليها زر «رجوع» */
export function backTarget(): string {
  return navStack.length > 1 ? navStack[navStack.length - 2] : parentPath(currentPath());
}

/** يرجع خطوة واحدة إلى الصفحة السابقة داخل الموقع */
export function goBack() {
  if (navStack.length > 1) {
    window.history.back();
    return;
  }
  // فُتح الموقع مباشرة على هذه الصفحة: نستبدلها بالصفحة الأم حتى لا يدور الرجوع في حلقة
  const parent = parentPath(currentPath());
  if (parent === currentPath()) return;
  navStack = [parent];
  saveStack();
  window.location.replace(`#${parent}`);
}

export function useHashPath(): string {
  const [path, setPath] = useState(currentPath);
  useEffect(() => {
    const on = () => {
      setPath(currentPath());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}

export function useReducedMotion(): boolean {
  const q = '(prefers-reduced-motion: reduce)';
  const [v, setV] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(q).matches);
  useEffect(() => {
    const m = window.matchMedia?.(q);
    if (!m) return;
    const on = () => setV(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return v;
}

export function useMedia(query: string): boolean {
  const [v, setV] = useState(() => typeof window !== 'undefined' && window.matchMedia?.(query).matches);
  useEffect(() => {
    const m = window.matchMedia?.(query);
    if (!m) return;
    const on = () => setV(m.matches);
    on();
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, [query]);
  return v;
}

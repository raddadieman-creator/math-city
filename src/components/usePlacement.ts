import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { sfx } from '../lib/sound';

/**
 * منطق الوضع في الخانات: يدعم
 *  - النقر: اختيار البطاقة ثم النقر على الخانة (بديل السحب والإفلات)
 *  - السحب والإفلات باللمس أو الماوس (Pointer Events)
 *  - لوحة المفاتيح: البطاقات والخانات أزرار، فتعمل بـ Enter والمسافة
 */
export interface PlacementState {
  /** placed[slot] = رقم البطاقة الموضوعة في الخانة أو null */
  placed: (number | null)[];
  selected: number | null;
  drag: { tile: number; x: number; y: number } | null;
}

export function usePlacement(tileCount: number, slotCount: number, locked: boolean) {
  const [placed, setPlaced] = useState<(number | null)[]>(() => Array(slotCount).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<PlacementState['drag']>(null);
  const start = useRef<{ tile: number; x: number; y: number; id: number } | null>(null);
  const lastDrop = useRef<{ tile: number; t: number } | null>(null);

  const slotOf = useCallback((tile: number) => placed.indexOf(tile), [placed]);

  const placeTile = useCallback(
    (tile: number, slot: number) => {
      setPlaced((prev) => {
        const next = [...prev];
        const from = next.indexOf(tile);
        const occupant = next[slot];
        if (from >= 0) next[from] = occupant; // تبديل إذا جاءت من خانة أخرى
        next[slot] = tile;
        return next;
      });
      setSelected(null);
      sfx.tap();
    },
    [],
  );

  const returnTile = useCallback((tile: number) => {
    setPlaced((prev) => prev.map((t) => (t === tile ? null : t)));
    setSelected(null);
  }, []);

  const onTileClick = (tile: number) => {
    if (locked) return;
    // تجاهل النقرة التي يولّدها المتصفح مباشرة بعد إفلات البطاقة نفسها
    const ld = lastDrop.current;
    if (ld && ld.tile === tile && performance.now() - ld.t < 300) return;
    setSelected((s) => (s === tile ? null : tile));
  };

  const onSlotClick = (slot: number) => {
    if (locked) return;
    if (selected !== null) {
      placeTile(selected, slot);
      return;
    }
    const occ = placed[slot];
    if (occ !== null) setSelected(occ);
  };

  const onPoolClick = () => {
    if (locked) return;
    if (selected !== null && slotOf(selected) >= 0) returnTile(selected);
  };

  const onPointerDown = (tile: number) => (e: RPointerEvent) => {
    if (locked || e.button > 0) return;
    start.current = { tile, x: e.clientX, y: e.clientY, id: e.pointerId };
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const s = start.current;
      if (!s || e.pointerId !== s.id) return;
      const dist = Math.hypot(e.clientX - s.x, e.clientY - s.y);
      if (dist > 8 || drag) {
        e.preventDefault();
        setDrag({ tile: s.tile, x: e.clientX, y: e.clientY });
      }
    };
    const up = (e: PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s || !drag) return;
      lastDrop.current = { tile: s.tile, t: performance.now() };
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const slotEl = el?.closest('[data-slot]') as HTMLElement | null;
      if (slotEl) placeTile(s.tile, Number(slotEl.dataset.slot));
      else if (el?.closest('[data-pool]')) returnTile(s.tile);
      setDrag(null);
    };
    const cancel = () => {
      start.current = null;
      setDrag(null);
    };
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
    };
  }, [drag, placeTile, returnTile]);

  const reset = () => {
    setPlaced(Array(slotCount).fill(null));
    setSelected(null);
  };

  const pool = Array.from({ length: tileCount }, (_, i) => i).filter((i) => !placed.includes(i));

  return {
    placed,
    selected,
    drag,
    pool,
    full: placed.every((p) => p !== null),
    onTileClick,
    onSlotClick,
    onPoolClick,
    onPointerDown,
    reset,
  };
}

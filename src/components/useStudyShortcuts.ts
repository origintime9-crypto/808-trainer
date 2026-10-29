import { useEffect, useRef } from 'react';

export function useStudyShortcuts(actions: { reveal?: () => void; rate?: (n: number) => void; save?: () => void; next?: () => void; confirm?:()=>void }) {
  const ref = useRef(actions);
  ref.current = actions;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('input,textarea,select,[contenteditable="true"],[role="textbox"],dialog[open],[data-shortcuts-off]') || document.querySelector('dialog[open]')) return;
      // 已聚焦的按钮、链接保留浏览器原生 Space 行为。
      if ((e.code === 'Space'||e.key==='Enter') && target?.closest('button,a,summary')) return;
      const fn = e.code === 'Space' ? ref.current.reveal : e.key === 's' || e.key === 'S' ? ref.current.save
        : e.key === 'Enter' ? ref.current.confirm : e.key === 'ArrowRight' ? ref.current.next : /^[1-4]$/.test(e.key) && ref.current.rate ? () => ref.current.rate?.(Number(e.key)) : undefined;
      if (fn) { e.preventDefault(); fn(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

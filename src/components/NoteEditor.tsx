import { useCallback, useEffect, useRef, useState } from 'react';
import { app } from '../state';

// 云端刷新不覆盖正在编辑的草稿；停顿或离开输入框后追加一条笔记记录。
export function NoteEditor({ problemId, note, onError }: { problemId: string; note: string; onError: (message: string) => void }) {
  const [draft, setDraft] = useState(note);
  const [message, setMessage] = useState('');
  const draftRef = useRef(note);
  const savedRef = useRef(note);
  const dirty = useRef(false);
  const mounted = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const errorRef = useRef(onError);
  errorRef.current = onError;

  useEffect(() => {
    savedRef.current = note;
    if (!dirty.current) { draftRef.current = note; setDraft(note); }
  }, [note]);

  const save = useCallback(() => {
    clearTimeout(timer.current);
    if (!dirty.current) return;
    const text = draftRef.current.trim();
    try {
      if (text !== savedRef.current) app.record({ kind: 'note', problemId, text });
      savedRef.current = text; dirty.current = false;
      if (mounted.current) { setMessage('笔记已保存'); errorRef.current(''); }
    } catch {
      if (mounted.current) { setMessage('笔记尚未保存'); errorRef.current('浏览器未能保存笔记，请先导出备份并检查存储空间。'); }
    }
  }, [problemId]);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    mounted.current = true;
    const flush = () => saveRef.current();
    // 先保存草稿，云同步的 pagehide 处理才能一并上传。
    window.addEventListener('pagehide', flush, true);
    return () => {
      mounted.current = false;
      window.removeEventListener('pagehide', flush, true);
      saveRef.current();
    };
  }, [problemId]);

  return <>
    <textarea className="note" aria-label="我的笔记" value={draft} maxLength={20000}
      placeholder="记下这道题的关键点、易错点……（停顿 1 秒自动保存）"
      onChange={e => {
        draftRef.current = e.target.value; dirty.current = true; setDraft(e.target.value); setMessage('正在保存笔记…');
        clearTimeout(timer.current);
        timer.current = setTimeout(save, 1000);
      }}
      onBlur={() => {
        save();
        if (!dirty.current) { draftRef.current = savedRef.current; setDraft(savedRef.current); }
      }}
    />
    <p className="muted small" aria-live="polite">{message || '输入停顿 1 秒后自动保存，离开输入框也会立即保存。'}</p>
  </>;
}

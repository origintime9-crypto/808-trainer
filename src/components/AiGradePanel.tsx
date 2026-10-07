import { useEffect, useRef, useState } from 'react';
import { compressPhoto, gradePhotos, normalizeAiMarkdown } from '../ai/grade';
import { buildGradePrompt, copyText } from '../ai/prompt';
import { useSyncStatus } from '../engine/sync';
import { useSettings } from '../state';
import type { AiResult, Problem } from '../types';
import { GRADE_LABELS } from '../types';
import { Md } from './Markdown';

export function AiGradePanel({ problem, onResult, disabled, maxScore }: { problem: Problem; onResult: (r: AiResult) => void; disabled: boolean; maxScore?: number }) {
  const settings = useSettings();
  const { health } = useSyncStatus();
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [raw, setRaw] = useState('');
  const [result, setResult] = useState<AiResult | null>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  const enabled = health?.ai && settings.aiEnabled;
  const choose = async (files: FileList | null) => {
    if (!files) return;
    if (files.length > 3) { setMessage('最多选择 3 张照片'); return; }
    setBusy(true); setMessage('正在缩小照片…');
    try { const values = await Promise.all(Array.from(files).map(compressPhoto)); if (mounted.current) { setPhotos(values); setMessage('照片已准备好，点击「开始 AI 批改」发送。'); } }
    catch (e) { if (mounted.current) setMessage((e as Error).message); }
    finally { if (mounted.current) setBusy(false); }
  };
  const grade = async () => {
    setBusy(true); setMessage('正在识别并批改…'); setRaw('');
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 65000);
    try {
      const output = await gradePhotos(problem, health!.model, settings.syncKey, photos, controller.current.signal, maxScore);
      if (!mounted.current) return;
      setResult(output.result); setPhotos([]);
      if (output.result) { onResult(output.result); setMessage('已预填自评和错因，请核对后点击「记录」。'); }
      else { setRaw(output.raw); setMessage('模型返回格式未能识别，请阅读原文并手动评分。'); }
    } catch (e) { if (mounted.current) setMessage(e instanceof Error && e.name === 'AbortError' ? '批改已取消或超时，可以重试' : (e as Error).message); }
    finally { clearTimeout(timeout); if (mounted.current) setBusy(false); }
  };
  return <section className="card ai-panel">
    <div className="card-head"><h3>手写作答批改</h3><span className="muted small">可选</span></div>
    {enabled ? <>
      <p className="muted small">选择 1–3 张照片。开始批改后，照片会发送到已配置的模型服务；本程序只保存文字点评。</p>
      <input aria-label="作答照片" type="file" accept="image/*" capture="environment" multiple disabled={busy || disabled} onChange={e => { void choose(e.target.files); e.target.value = ''; }} />
      <div className="photo-previews">{photos.map((src, i) => <img src={src} key={i} alt={`待批改照片 ${i + 1}`} />)}</div>
      <div className="actions"><button disabled={busy || disabled || !photos.length} className="primary" onClick={() => void grade()}>开始 AI 批改</button>{busy && <button onClick={() => controller.current?.abort()}>取消批改</button>}</div>
    </> : <p className="muted small">{health?.ai ? '可在设置中开启拍照批改。' : '可复制提示词到 ChatGPT，附上手写照片批改。'}</p>}
    <button onClick={() => void copyText(buildGradePrompt(problem, maxScore)).then(ok => setMessage(ok ? '已复制，粘贴到 ChatGPT 后附上作答照片。' : '复制失败，请检查剪贴板权限。'))}>复制批改提示词</button>
    {message && <p className="hint" role="status">{message}</p>}
    {result && <div><p><b>AI 建议：{GRADE_LABELS[result.grade]}</b>{result.score !== undefined && ` · 估分 ${result.score}`}</p><h3>关键步骤转写</h3><Md preserveBadMath>{normalizeAiMarkdown(result.transcript)}</Md>{result.steps?.map((s, i) => <Md key={i} preserveBadMath>{normalizeAiMarkdown((s.ok ? '✓ ' : '× ') + s.step + '：' + s.comment)}</Md>)}<Md preserveBadMath>{normalizeAiMarkdown(result.feedback)}</Md></div>}
    {raw && <pre className="ai-raw">{raw}</pre>}
  </section>;
}

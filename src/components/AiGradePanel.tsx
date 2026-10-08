import { useEffect, useRef, useState } from 'react';
import { compressPhoto, gradePhotos, normalizeAiMarkdown, parseExternalGrade } from '../ai/grade';
import { buildExternalGradePrompt, copyText } from '../ai/prompt';
import { useSyncStatus } from '../engine/sync';
import { useSettings } from '../state';
import type { AiResult, Problem } from '../types';
import { GRADE_LABELS } from '../types';
import { Md } from './Markdown';

export function AiGradePanel({ problem, onResult, disabled, maxScore }: { problem: Problem; onResult: (r: AiResult | null) => void; disabled: boolean; maxScore?: number }) {
  const settings = useSettings();
  const { health } = useSyncStatus();
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [raw, setRaw] = useState('');
  const [result, setResult] = useState<AiResult | null>(null);
  const [external, setExternal] = useState('');
  const [source, setSource] = useState<'Gemini' | 'ChatGPT'>('Gemini');
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  const enabled = health?.ai && settings.aiEnabled;
  const choose = async (files: FileList | null) => {
    if (!files) return;
    if (files.length > 3) { setMessage('最多选择 3 张照片'); return; }
    setResult(null); setRaw(''); setPhotos([]); onResult(null);
    setBusy(true); setMessage('正在缩小照片…');
    try { const values = await Promise.all(Array.from(files).map(compressPhoto)); if (mounted.current) { setPhotos(values); setMessage('照片已准备好，点击「开始 AI 批改」发送。'); } }
    catch (e) { if (mounted.current) setMessage((e as Error).message); }
    finally { if (mounted.current) setBusy(false); }
  };
  const grade = async () => {
    setBusy(true); setMessage('正在识别并批改…'); setRaw(''); setResult(null); onResult(null);
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
  const importResult = () => {
    setResult(null); setRaw(''); onResult(null);
    const parsed = parseExternalGrade(external, problem, source, maxScore);
    if (!parsed) { setMessage(`未读取到本题（${problem.id}）的有效批改。请复制当前题提示词，粘贴模型返回的完整 JSON；不会保存这次输入。`); return; }
    setResult(parsed); setPhotos([]); setExternal(''); onResult(parsed);
    setMessage('已读取文字批改并预填评分。请先核对转写，再确认评分和错因，点击「记录」才计入学习统计。');
  };
  return <section className="card ai-panel">
    <div className="card-head"><h3>手写作答批改</h3><span className="muted small">可选</span></div>
    {enabled ? <>
      <p className="muted small">选择 1–3 张照片。开始批改后，照片会发送到已配置的模型服务；本程序只保存文字点评。</p>
      <input aria-label="作答照片" type="file" accept="image/*" capture="environment" multiple disabled={busy || disabled} onChange={e => { void choose(e.target.files); e.target.value = ''; }} />
      <div className="photo-previews">{photos.map((src, i) => <img src={src} key={i} alt={`待批改照片 ${i + 1}`} />)}</div>
      <div className="actions"><button disabled={busy || disabled || !photos.length} className="primary" onClick={() => void grade()}>开始 AI 批改</button>{busy && <button onClick={() => controller.current?.abort()}>取消批改</button>}</div>
    </> : <p className="muted small">{health?.ai ? '可在设置中开启拍照批改。' : '可复制提示词到 Gemini 或 ChatGPT，附上手写照片批改。'}</p>}
    <div className="actions"><button onClick={() => void copyText(buildExternalGradePrompt(problem, maxScore)).then(ok => setMessage(ok ? '已复制。粘贴到 Gemini 或 ChatGPT，附上作答照片；将返回的 JSON 粘贴到下方。' : '复制失败，请检查剪贴板权限。'))}>复制批改提示词</button><a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer">打开 Gemini</a></div>
    <details className="external-grade">
      <summary>粘贴 Gemini / ChatGPT 批改结果</summary>
      <p className="muted small">接口忙碌时，可在模型网页上传照片批改，再粘贴文字结果。本题题号 {problem.id}。读取只预填建议，确认「记录」后才保存和同步。</p>
      <label>批改来源<select value={source} disabled={busy || disabled} onChange={e => setSource(e.target.value as 'Gemini' | 'ChatGPT')}><option>Gemini</option><option>ChatGPT</option></select></label>
      <label>批改结果 JSON<textarea aria-label="批改结果 JSON" value={external} maxLength={200000} rows={6} disabled={busy || disabled} onChange={e => setExternal(e.target.value)} placeholder="粘贴按当前题提示词返回的完整 JSON" /></label>
      <button disabled={busy || disabled || !external.trim()} onClick={importResult}>读取批改结果</button>
    </details>
    {message && <p className="hint" role="status">{message}</p>}
    {result && <div><p><b>AI 建议：{GRADE_LABELS[result.grade]}</b>{result.score !== undefined && ` · 估分 ${result.score}`}</p><h3>关键步骤转写</h3><Md preserveBadMath>{normalizeAiMarkdown(result.transcript)}</Md>{result.steps?.map((s, i) => <Md key={i} preserveBadMath>{normalizeAiMarkdown((s.ok ? '✓ ' : '× ') + s.step + '：' + s.comment)}</Md>)}<Md preserveBadMath>{normalizeAiMarkdown(result.feedback)}</Md><p className="muted small">请核对公式、正负号和下标。最终学习统计采用你确认的评分；若转写有误，可忽略本次建议后手动评分。</p><button disabled={busy || disabled} onClick={() => { setResult(null); onResult(null); setMessage('已忽略本次 AI 建议，请按实际作答手动评分。'); }}>忽略 AI 建议</button></div>}
    {raw && <pre className="ai-raw">{raw}</pre>}
  </section>;
}

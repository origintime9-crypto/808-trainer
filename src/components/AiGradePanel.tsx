import { useEffect, useRef, useState } from 'react';
import { compressPhoto, gradePhotos, normalizeAiMarkdown, parseExternalGrade } from '../ai/grade';
import { buildExternalGradePrompt, copyText } from '../ai/prompt';
import { useSyncStatus } from '../engine/sync';
import { useSettings } from '../state';
import type { AiResult, Problem, RecognitionReview } from '../types';
import { GRADE_LABELS } from '../types';
import { Md } from './Markdown';
import { gradeFigures } from '../ai/figures';
import { GradeApiError, type GradeDiagnostic } from '../ai/errors';

export function AiGradePanel({ problem, onResult, onRecognition, disabled, maxScore }: { problem: Problem; onResult: (r: AiResult | null) => void; onRecognition: (r: RecognitionReview | null) => void; disabled: boolean; maxScore?: number }) {
  const settings = useSettings();
  const { health } = useSyncStatus();
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [raw, setRaw] = useState('');
  const [result, setResult] = useState<AiResult | null>(null);
  const [external, setExternal] = useState('');
  const [source, setSource] = useState<'Gemini' | 'ChatGPT'>('Gemini');
  const [recognition, setRecognition] = useState('');
  const [transcript, setTranscript] = useState('');
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [failure, setFailure] = useState<GradeDiagnostic | null>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  const enabled = health?.ai && settings.aiEnabled;
  const figures = gradeFigures(problem);
  const questionFigures = figures.filter(f => f.kind === '题图').length;
  const referenceFigures = figures.length - questionFigures;
  const resetReview = () => { setRecognition(''); setTranscript(''); onRecognition(null); };
  const review = (status: string, text = transcript) => {
    setRecognition(status); setTranscript(text);
    const changed = text.trim() && text.trim() !== result?.transcript.trim() && !/data:image\//i.test(text);
    onRecognition(status === 'checked' || status === 'unreadable' ? { status } : status === 'corrected' && changed ? { status: 'corrected', transcript: text } : null);
  };
  const choose = async (files: FileList | null) => {
    if (!files) return;
    if (files.length > 3) { setMessage('最多选择 3 张照片'); return; }
    setResult(null); setRaw(''); setPhotos([]); setFailure(null); onResult(null); resetReview();
    setBusy(true); setMessage('正在缩小照片…');
    try { const values = await Promise.all(Array.from(files).map(compressPhoto)); if (mounted.current) { setPhotos(values); setMessage('照片已准备好，点击「开始 AI 批改」发送。'); } }
    catch (e) { if (mounted.current) setMessage((e as Error).message); }
    finally { if (mounted.current) setBusy(false); }
  };
  const grade = async () => {
    setBusy(true); setMessage('正在准备题图、识别并批改…'); setRaw(''); setResult(null); setFailure(null); onResult(null); resetReview();
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 65000);
    try {
      const output = await gradePhotos(problem, health!.model, settings.syncKey, photos, controller.current.signal, maxScore);
      if (!mounted.current) return;
      setResult(output.result); setPhotos([]);
      if (output.result) { setTranscript(output.result.transcript); onResult(output.result); setMessage('已预填评分和错因。请先复核转写，再确认评分并点击「记录」。'); }
      else { setRaw(output.raw); setFallbackOpen(true); setMessage('模型返回格式未能识别，请阅读原文并手动评分，或使用下方备用批改。'); }
    } catch (e) { if (mounted.current) { setFallbackOpen(true); setFailure(e instanceof GradeApiError ? e.diagnostic : null); setMessage(e instanceof Error && e.name === 'AbortError' ? '批改已取消或超时，可重试或使用下方备用批改。' : (e as Error).message); } }
    finally { clearTimeout(timeout); if (mounted.current) setBusy(false); }
  };
  const importResult = () => {
    setResult(null); setRaw(''); setFailure(null); onResult(null); resetReview();
    const parsed = parseExternalGrade(external, problem, source, maxScore);
    if (!parsed) { setMessage(`未读取到本题（${problem.id}）的有效批改。请复制当前题提示词，粘贴模型返回的完整 JSON；不会保存这次输入。`); return; }
    setResult(parsed); setTranscript(parsed.transcript); setPhotos([]); setExternal(''); onResult(parsed);
    setMessage('已读取文字批改并预填评分。请先核对转写，再确认评分和错因，点击「记录」才计入学习统计。');
  };
  return <section className="card ai-panel">
    <div className="card-head"><h3>手写作答批改</h3><span className="muted small">可选</span></div>
    {enabled ? <>
      <p className="muted small">选择 1–3 张照片。开始批改后，照片会发送到已配置的模型服务；本程序只保存文字点评。</p>
      {!!figures.length && <p className="muted small">同时附上本题 {questionFigures} 张题图、{referenceFigures} 张参考解答图，分别标注；仅对你的作答照片评分。题图加载失败时会停止发送。</p>}
      <input aria-label="作答照片" type="file" accept="image/*" capture="environment" multiple disabled={busy || disabled} onChange={e => { void choose(e.target.files); e.target.value = ''; }} />
      <div className="photo-previews">{photos.map((src, i) => <img src={src} key={i} alt={`待批改照片 ${i + 1}`} />)}</div>
      <div className="actions"><button disabled={busy || disabled || !photos.length} className="primary" onClick={() => void grade()}>开始 AI 批改</button>{busy && <button onClick={() => controller.current?.abort()}>取消批改</button>}</div>
    </> : <p className="muted small">{health?.ai ? '可在设置中开启拍照批改。' : '可复制提示词到 Gemini 或 ChatGPT，附上手写照片批改。'}</p>}
    <div className="actions"><button onClick={() => void copyText(buildExternalGradePrompt(problem, maxScore)).then(ok => setMessage(ok ? '已复制。粘贴到 Gemini 或 ChatGPT，附上作答照片；将返回的 JSON 粘贴到下方。' : '复制失败，请检查剪贴板权限。'))}>复制批改提示词</button><a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer">打开 Gemini</a></div>
    {message && <p className="hint" role="status">{message}</p>}
    {failure && <div className="grade-failure">
      {failure.kind === 'daily-quota' ? <p className="muted small">每日额度需以 AI Studio 显示的重置时间或额度调整为准。</p> : failure.retryAfterSeconds && <p className="muted small">服务建议至少等待 {failure.retryAfterSeconds} 秒后再试。</p>}
      {health?.model.startsWith('gemini-') && ['limited', 'daily-quota', 'billing'].includes(failure.kind) && <p className="muted small">在 Google AI Studio 查看当前项目的调用限额和计费状态。同一项目换 Key 共用额度。<a href="https://aistudio.google.com/usage" target="_blank" rel="noopener noreferrer">查看 Gemini 调用用量</a></p>}
      {failure.kind === 'busy' && <p className="muted small">本次模型服务忙碌，稍后可重试。也可直接使用已展开的网页备用入口，批改后再确认记录。</p>}
    </div>}
    <details className="external-grade" open={fallbackOpen} onToggle={e => setFallbackOpen(e.currentTarget.open)}>
      <summary>粘贴 Gemini / ChatGPT 批改结果</summary>
      <p className="muted small">接口忙碌时，可在模型网页上传照片批改，再粘贴文字结果。本题题号 {problem.id}。读取只预填建议，确认「记录」后才保存和同步。</p>
      <label>批改来源<select value={source} disabled={busy || disabled} onChange={e => setSource(e.target.value as 'Gemini' | 'ChatGPT')}><option>Gemini</option><option>ChatGPT</option></select></label>
      <label>批改结果 JSON<textarea aria-label="批改结果 JSON" value={external} maxLength={200000} rows={6} disabled={busy || disabled} onChange={e => setExternal(e.target.value)} placeholder="粘贴按当前题提示词返回的完整 JSON" /></label>
      <button disabled={busy || disabled || !external.trim()} onClick={importResult}>读取批改结果</button>
    </details>
    {result && <div><p><b>AI 建议：{GRADE_LABELS[result.grade]}</b>{result.score !== undefined && ` · 估分 ${result.score}`}</p><h3>关键步骤转写</h3><Md preserveBadMath>{normalizeAiMarkdown(result.transcript)}</Md>
      <div className="recognition-review"><label>转写复核<select aria-label="转写复核" value={recognition} disabled={busy || disabled} onChange={e => review(e.target.value)}><option value="">请核对公式、正负号和下标</option><option value="checked">转写正确</option><option value="corrected">转写有误，我来修正</option><option value="unreadable">照片看不清，按实际作答自评</option></select></label>
      {recognition === 'corrected' && <div><label>修正后的转写<textarea aria-label="修正后的转写" value={transcript} maxLength={50000} rows={6} disabled={busy || disabled} onChange={e => review('corrected', e.target.value)} /></label><Md preserveBadMath>{normalizeAiMarkdown(transcript)}</Md><p className="muted small">修正后请重新选择评分和错因。原点评依据原转写，修正内容保留用于复核。</p></div>}
      {recognition === 'unreadable' && <p className="muted small">请按纸上实际作答重新选择评分和错因，或忽略本次建议后重新拍照。</p>}
      </div>{recognition && recognition !== 'checked' && <p className="muted small">以下是依据原转写给出的 AI 点评。</p>}{result.steps?.map((s, i) => <Md key={i} preserveBadMath>{normalizeAiMarkdown((s.ok ? '✓ ' : '× ') + s.step + '：' + s.comment)}</Md>)}<Md preserveBadMath>{normalizeAiMarkdown(result.feedback)}</Md><p className="muted small">最终学习统计采用你确认的评分。先选择转写复核情况，再点击「记录」保存和同步。</p><button disabled={busy || disabled} onClick={() => { setResult(null); onResult(null); resetReview(); setMessage('已忽略本次 AI 建议，请按实际作答手动评分。'); }}>忽略 AI 建议</button></div>}
    {raw && <pre className="ai-raw">{raw}</pre>}
  </section>;
}

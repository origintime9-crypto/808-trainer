import { useRef, useState } from 'react';
import { cards, papers, problems } from '../content';
import { eventStorageError, exportJson, parseImport, rawEventStorage } from '../engine/store';
import { dateLabel } from '../format';
import { app, useEvents, useSettings } from '../state';
import { refreshHealth, syncNow, useSyncStatus } from '../engine/sync';

export function SettingsPage() {
  const settings = useSettings();
  const events = useEvents();
  const sync = useSyncStatus();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const storageError = eventStorageError();

  const download = (text: string, name: string) => {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const doExport = () => {
    const d = new Date();
    download(exportJson(events), `808进度_${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}.json`);
    try { app.updateSettings({ lastExport: Date.now() }); setMsg(`已导出 ${events.length} 条记录。`); }
    catch { setMsg('文件已导出，浏览器未能保存导出时间。'); }
  };

  const doImport = async (file: File) => {
    try {
      const added = app.importEvents(parseImport(await file.text()));
      setMsg(`导入完成，新增 ${added} 条记录（重复的已自动跳过）。`);
    } catch (e) {
      setMsg(`导入失败：${(e as Error).message}`);
    }
  };

  const num = (v: string, min: number, max: number) => Math.min(max, Math.max(min, Math.round(Number(v) || 0)));

  return (
    <div>
      <section className="card form">
        <h2>学习设置</h2>
        <label>
          初试日期
          <input type="date" value={settings.examDate} onChange={(e) => e.target.value && app.updateSettings({ examDate: e.target.value })} />
        </label>
        <label>
          每日新卡数
          <input type="number" min={0} max={100} value={settings.newCardsPerDay} onChange={(e) => app.updateSettings({ newCardsPerDay: num(e.target.value, 0, 100) })} />
        </label>
        <label>
          每日推荐新题数
          <input type="number" min={0} max={30} value={settings.newProblemsPerDay} onChange={(e) => app.updateSettings({ newProblemsPerDay: num(e.target.value, 0, 30) })} />
        </label>
        <p className="muted small">复习间隔最长 21 天，且不会排到考试日之后。</p>
      </section>

      <section className="card form">
        <h2>云同步与拍照批改</h2>
        <p className="muted small">电脑和手机使用同一个网址、同一个同步口令，即可合并进度。口令只保存在当前设备，导出文件不包含口令。</p>
        <label>同步口令<input key={settings.syncKey} type="password" autoComplete="off" defaultValue={settings.syncKey} placeholder="填写你设置的同步口令" onBlur={e => app.updateSettings({ syncKey: e.target.value.trim() })} /></label>
        <div className="actions"><button className="primary" disabled={sync.phase === 'syncing' || !settings.syncKey || !sync.health?.sync} onClick={() => void syncNow()}>立即同步</button><button onClick={() => void refreshHealth()}>检测服务状态</button></div>
        <p role="status" className="hint">{sync.message}{sync.lastSync && ` · 最近同步 ${dateLabel(sync.lastSync)}`}</p>
        <label className="check-label"><input type="checkbox" checked={settings.aiEnabled} disabled={!sync.health?.ai} onChange={e => app.updateSettings({ aiEnabled: e.target.checked })} />开启拍照 AI 批改</label>
        <p className="muted small">{sync.health?.ai ? `模型：${sync.health.model}。每次批改前由你选择照片并点击发送。` : '服务端还没有配置图片模型，可以先使用「复制批改提示词」。'}</p>
      </section>

      <section className="card form">
        <h2>备份与迁移</h2>
        {storageError && <div role="alert" className="banner"><p>{storageError}</p><button onClick={() => {
          try { download(rawEventStorage(), '808原始记录_待恢复.json'); setMsg('已下载原始记录，请妥善保留。'); }
          catch { setMsg('浏览器禁止读取本机记录，请检查隐私设置。'); }
        }}>下载原始记录</button></div>}
        <p className="muted small">
          进度保存在当前浏览器里。换设备或清理浏览器数据前请先导出；在另一台设备上导入即可合并进度（不会重复）。
          {settings.lastExport ? ` 上次导出：${dateLabel(settings.lastExport)}。` : ' 还没有导出过。'}
        </p>
        <div className="actions">
          <button className="primary" disabled={!!storageError} onClick={doExport}>导出进度</button>
          <button onClick={() => fileRef.current?.click()}>导入进度</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void doImport(f);
              e.target.value = '';
            }}
          />
        </div>
        {msg && <p className="hint">{msg}</p>}
        <button
          className="danger small"
          onClick={() => {
            if (confirm('确定清空此浏览器的做题和复习记录吗？请先导出备份。云端记录不会删除，重新同步会恢复。')) {
              try { app.clearEvents(); setMsg('已清空。'); }
              catch { setMsg('清空失败，浏览器无法写入本机存储。'); }
            }
          }}
        >
          清空本机记录
        </button>
      </section>

      <section className="card">
        <h2>题库概况</h2>
        <p>
          试卷 {papers.length} 套，题目 {problems.length} 道，知识卡片 {cards.length} 张；本机记录 {events.length} 条。
        </p>
        <p className="muted small">
          解答独立求解，数值与变换关系用 SymPy 复核；标「已勘误」的题写明资料中的错误。回忆卷内容不清或缺失时标「存疑」，请结合题目说明使用。
        </p>
      </section>
    </div>
  );
}

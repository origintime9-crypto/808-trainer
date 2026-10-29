import { useState } from 'react';
import { Md } from '../components/Markdown';
import { cardById } from '../content/cardContent';
import { dailyPlan } from '../engine/dailyPlan';
import { kpLabel } from '../format';
import { app, useDerived, useEvents, useSettings } from '../state';
import { RATING_LABELS, type CardRating } from '../types';
import { useStudyShortcuts } from '../components/useStudyShortcuts';
import { LearningDrawer } from '../components/LearningDrawer';

export function ReviewPage() {
  const { sched, mi, now } = useDerived();
  const events = useEvents();
  const settings = useSettings();
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [error, setError] = useState('');
  const [drawer,setDrawer]=useState(false);

  const q = dailyPlan(sched, events, settings, mi, now).cards;
  const realDue = q.due.filter((id) => q.remedial.includes(id)||!sched.cards.has(id)||sched.cards.get(id)!.card.due.getTime() <= now);
  const ahead = q.due.filter((id) => !realDue.includes(id));
  const order = [...realDue, ...q.fresh, ...ahead];
  const requested=new URLSearchParams(window.location.hash.split('?')[1]??'').get('card');
  const currentId = requested&&order.includes(requested)?requested:order[0];
  const card = currentId ? cardById.get(currentId) : undefined;
  useStudyShortcuts({reveal:()=>{if(card&&!flipped)setFlipped(true);},rate:n=>{if(card&&flipped)rate(n as CardRating);}});

  if (!card) {
    return (
      <section className="card center">
        <h2>本段热身已完成</h2>
        <p className="muted">本次复习 {done} 张。今日热身按时间预算安排，尚未安排的到期卡片保留在后续计划。</p>
        <a className="button primary" href="#/today">回到今日，继续核心推导</a>
      </section>
    );
  }

  const isNew = !sched.cards.has(card.id)||q.fresh.includes(card.id);
  const rate = (r: CardRating) => {
    try {
      app.record({ kind: 'review', cardId: card.id, rating: r });
      setError(''); setFlipped(false); setDone((d) => d + 1);
    } catch { setError('复习记录未保存，请检查浏览器存储空间并导出备份。'); }
  };

  return (
    <div className="review">
      <div className="toolbar">
        <span className="muted">到期 {realDue.length} · 新卡 {q.fresh.length} · 学习中 {ahead.length} · 本次已复习 {done}</span>
        <button onClick={()=>setDrawer(true)}>变换对照</button>
      </div>
      <p className="small muted shortcut-legend"><kbd>Space</kbd> 显示答案 · <kbd>1–4</kbd> 评分并进入下一张</p>
      {drawer&&<LearningDrawer type="transforms" onClose={()=>setDrawer(false)}/>}
      <section className="card flash">
        <div className="chips">
          {isNew && <span className="badge">新卡</span>}
          {q.remedial.includes(card.id)&&<span className="badge warn">错因回溯 · 补前置基础</span>}
          {card.kps.map((k) => <span key={k} className="chip">{kpLabel(k)}</span>)}
        </div>
        <div className="front"><Md>{card.front}</Md></div>
        {error && <p role="alert" className="hint">{error}</p>}
        {flipped ? (
          <>
            <hr />
            <div className="back"><Md>{card.back}</Md></div>
            <div className="rate-buttons">
              {RATING_LABELS.map((label, i) => (
                <button key={label} className={`rate r${i + 1}`} onClick={() => rate((i + 1) as CardRating)}>{label}</button>
              ))}
            </div>
          </>
        ) : (
          <button className="primary wide" onClick={() => setFlipped(true)}>显示答案</button>
        )}
      </section>
    </div>
  );
}

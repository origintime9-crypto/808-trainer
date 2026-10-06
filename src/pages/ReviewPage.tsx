import { useState } from 'react';
import { Md } from '../components/Markdown';
import { cardById } from '../content';
import { cardQueue } from '../engine/queue';
import { kpLabel } from '../format';
import { app, useDerived, useEvents, useSettings } from '../state';
import { RATING_LABELS, type CardRating } from '../types';

export function ReviewPage() {
  const { sched, mi, now } = useDerived();
  const events = useEvents();
  const settings = useSettings();
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [error, setError] = useState('');

  const q = cardQueue(sched, events, settings, mi, now);
  const realDue = q.due.filter((id) => sched.cards.get(id)!.card.due.getTime() <= now);
  const ahead = q.due.filter((id) => !realDue.includes(id));
  const order = [...realDue, ...q.fresh, ...ahead];
  const currentId = order[0];
  const card = currentId ? cardById.get(currentId) : undefined;

  if (!card) {
    return (
      <section className="card center">
        <h2>今天的卡片复习完成了</h2>
        <p className="muted">本次复习 {done} 张。到期的卡片会在今日页提醒。</p>
        <a className="button primary" href="#/today">回到今日</a>
      </section>
    );
  }

  const isNew = q.fresh.includes(card.id);
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
      </div>
      <section className="card flash">
        <div className="chips">
          {isNew && <span className="badge">新卡</span>}
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

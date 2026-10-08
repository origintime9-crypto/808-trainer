import { useState } from 'react';
import { kpPapers, patternPapers, paperYears } from '../content';
import { masteryStatus, rankKnowledge, rankPatterns, tagTotals, type Ranked } from '../engine/mastery';
import { go, stars } from '../format';
import { useDerived, useEvents } from '../state';
import { MISTAKE_TAGS } from '../types';

function Table({ rows, kind }: { rows: Ranked[]; kind: 'kp' | 'pattern' }) {
  return (
    <div className="table-wrap">
      <table className="rank">
        <thead>
          <tr>
            <th>{kind === 'kp' ? '知识点' : '题型'}</th>
            <th>星级</th>
            <th>真题出现</th>
            <th>掌握度</th>
            <th>练习</th>
            <th title="808重点、真题频次、原卷分值、薄弱程度、遗忘风险和待测需求">优先级</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const tested = r.mastery.attempts + r.mastery.reviews > 0;
            const years = paperYears((kind === 'kp' ? kpPapers : patternPapers).get(r.id));
            return (
              <tr key={r.id} onClick={() => go(`#/practice?${kind === 'kp' ? 'kp' : 'pattern'}=${r.id}`)}>
                <td>{r.name}</td>
                <td className="stars">{stars(r.stars)}</td>
                <td className="small">{years.length ? years.map((y) => String(y).slice(2)).join(' ') : '—'}</td>
                <td>
                  {tested ? (
                    <div className="bar" title={`${Math.round(r.mastery.m * 100)}%`}>
                      <i style={{ width: `${Math.round(r.mastery.m * 100)}%` }} className={r.mastery.m < 0.45 ? 'low' : r.mastery.m < 0.7 ? 'mid' : 'high'} />
                      <span>{Math.round(r.mastery.m * 100)}%</span>
                    </div>
                  ) : (
                    <span className="muted">未测</span>
                  )}
                </td>
                <td className="small">{r.mastery.uniqueProblems} 道不同题 / {r.mastery.reviews} 次卡片</td>
                <td title={'重点 ' + r.stars + ' 星 · 中北真题 ' + r.years + ' 套 · 原卷权重 ' + r.factors.exam.toFixed(2) + ' · 遗忘风险 ' + Math.round(r.mastery.forgetting*100) + '%'}>
                  {(r.priority * 100).toFixed(0)}
                  <div className="small muted">{masteryStatus(r.mastery)}{tested?' · 记忆 '+Math.round(r.mastery.retention*100)+'%':''}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AnalysisPage() {
  const { mi } = useDerived();
  const events = useEvents();
  const [tab, setTab] = useState<'kp' | 'pattern'>('kp');
  const [showLow, setShowLow] = useState(false);
  const totals = tagTotals(events);
  const max = Math.max(1, ...Object.values(totals));
  const rows = tab === 'kp' ? rankKnowledge(mi).filter((r) => showLow || r.stars >= 3) : rankPatterns(mi);

  return (
    <div>
      <section className="card">
        <h2>错因分布</h2>
        {Object.values(totals).every((v) => v === 0) ? (
          <p className="muted">还没有错题记录。</p>
        ) : (
          <ul className="tag-dist">
            {MISTAKE_TAGS.map((t) => (
              <li key={t}>
                <span>{t}</span>
                <div className="bar"><i style={{ width: `${(totals[t] / max) * 100}%` }} className="low" /><span>{totals[t]}</span></div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card">
        <div className="tabs">
          <button className={tab === 'kp' ? 'on' : ''} onClick={() => setTab('kp')}>按知识点</button>
          <button className={tab === 'pattern' ? 'on' : ''} onClick={() => setTab('pattern')}>按题型</button>
          {tab === 'kp' && (
            <label className="small">
              <input type="checkbox" checked={showLow} onChange={(e) => setShowLow(e.target.checked)} /> 显示 1–2 星
            </label>
          )}
        </div>
        <p className="muted small">按808考点重要程度、薄弱程度和遗忘风险排序。少量记录需继续换题验证，反复一道题不会判定整个考点稳固。<a href="#/readiness">查看808适配水平 →</a></p>
        <Table rows={rows} kind={tab} />
      </section>
    </div>
  );
}

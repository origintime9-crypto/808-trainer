import { patternById } from '../content/catalog';
import { trainingForProblem } from '../content/training';
import type { Problem } from '../types';
import { Md } from './Markdown';

export function ProgressiveHints({ problem:p, level, advance }: { problem:Problem; level:number; advance:()=>void }) {
  const skill = trainingForProblem(p).find(s=>s.id!=='method') ?? trainingForProblem(p).at(-1)!;
  const hints = p.hints ?? [patternById.get(p.pattern??'')?.method.split('\n')[0] ?? skill.checkpoints[0].hint,
    skill.checkpoints.slice(1).map(c=>`${c.prompt}\n\n${c.hint}`).join('\n\n')];
  return <section className="card progressive-hints" aria-label="分步提示">
    <div className="card-head"><h3>分步提示</h3><span className="badge">有提示训练</span></div>
    <p className="muted small">每次只看一级，再返回草稿继续推导。查看完整解析前可先检查自己的中间结果。</p>
    {level >= 1 && <div className="hint-step"><b>① 破题思路</b><Md>{hints[0]}</Md></div>}
    {level >= 2 && <div className="hint-step"><b>② {p.hints?'关键中间式':'通用检查点'}</b><Md>{hints[1]}</Md></div>}
    <button onClick={advance}>{level===0?'① 查看破题思路':level===1?'② 展开关键步骤':'③ 查看完整解析'}</button>
  </section>;
}

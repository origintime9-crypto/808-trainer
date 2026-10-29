import { transformColumns, transformConditions, transformRows } from '../content/transformSheet';
import { Md } from './Markdown';

export function TransformSheet() {
  return <div className="transform-sheet">
    <p className="muted">按相同性质横向核对；双边与单边的初态项分开使用。</p>
    <p className="small muted">左右滑动表格，可对照 CTFT、DTFT、拉氏与 z 变换。</p>
    <div className="sheet-scroll" tabIndex={0} aria-label="四种变换对照，可横向滚动"><table>
      <thead><tr><th scope="col">性质</th>{transformColumns.map(c=><th scope="col" key={c}>{c}</th>)}</tr></thead>
      <tbody>{transformRows.map(r=><tr key={r.name}><th scope="row">{r.name}</th>{r.cells.map((c,i)=><td key={i}><Md>{c}</Md></td>)}</tr>)}</tbody>
    </table></div>
    <Md>{transformConditions}</Md>
    <p className="small muted">性质约定参照 <a href="https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/pages/lecture-notes/" target="_blank" rel="noreferrer">MIT 6.003 公开课程讲义</a>，公式按本站符号重新整理；它是学习辅助，考试范围仍以中北资料核对为准。</p>
  </div>;
}

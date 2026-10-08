export function StudyNav({ active }: { active: 'practice' | 'knowledge' | 'mock' | 'readiness' }) {
  return <nav className="study-nav" aria-label="刷题方式">
    {[['practice','题库筛选'],['knowledge','知识分类'],['mock','模拟组卷'],['readiness','808水平']].map(([id,title])=>
      <a key={id} href={`#/${id}`} className={active===id?'on':''} aria-current={active===id?'page':undefined}>{title}</a>)}
  </nav>;
}

import { lazy, Suspense, useEffect, useState } from 'react';
const AnalysisPage = lazy(() => import('./pages/AnalysisPage').then(m => ({ default: m.AnalysisPage })));
const MistakesPage = lazy(() => import('./pages/MistakesPage').then(m => ({ default: m.MistakesPage })));
const PracticePage = lazy(() => import('./pages/PracticePage').then(m => ({ default: m.PracticePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
import { TodayPage } from './pages/TodayPage';
import { connectSync, syncStatusLabel, useSyncStatus } from './engine/sync';
import { eventStorageError } from './engine/store';
import { useEvents } from './state';
import { mockSessions, validMockSession } from './engine/mock';
import { Icon } from './components/Icon';
import { LoadBoundary } from './components/LoadBoundary';

const ProblemPage = lazy(() => import('./pages/ProblemPage').then(m => ({ default: m.ProblemPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage').then(m => ({ default: m.ReviewPage })));
const ExamPage = lazy(() => import('./pages/ExamPage').then(m => ({ default: m.ExamPage })));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage').then(m => ({ default: m.KnowledgePage })));
const MockPage = lazy(() => import('./pages/MockPage').then(m => ({ default: m.MockPage })));
const MockExamPage = lazy(() => import('./pages/MockExamPage').then(m => ({ default: m.MockExamPage })));
const ReadinessPage = lazy(() => import('./pages/ReadinessPage').then(m => ({ default: m.ReadinessPage })));
const TrainingPage = lazy(() => import('./pages/TrainingPage').then(m => ({ default: m.TrainingPage })));
const GuidePage = lazy(() => import('./pages/GuidePage').then(m => ({ default: m.GuidePage })));

const TABS = [
  { path: 'today', label: '今日', icon: 'today' },
  { path: 'practice', label: '刷题', icon: 'practice' },
  { path: 'review', label: '卡片', icon: 'review' },
  { path: 'mistakes', label: '错题', icon: 'mistakes' },
  { path: 'analysis', label: '薄弱点', icon: 'analysis' },
  { path: 'settings', label: '设置', icon: 'settings' },
] as const;

function Brand({href}:{href:string}) {
  return <a className="brand" href={href} aria-label="808 信号与系统"><span className="brand-mark">808</span><span className="brand-copy">信号与系统<small>中北大学 · 2027</small></span></a>;
}

function useRoute(): string {
  const read = () => window.location.hash.replace(/^#\/?/, '') || 'today';
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function App() {
  useEffect(connectSync, []);
  const sync = useSyncStatus();
  const events = useEvents();
  const storageError = eventStorageError();
  const route = useRoute();
  const locked = mockSessions(events).find(s=>s.mode==='strict'&&s.finished===undefined&&validMockSession(s));
  useEffect(()=>{if(locked&&route!==`mock/${locked.id}`)window.location.hash=`#/mock/${locked.id}`;},[locked?.id,route]);
  const [path] = route.split('?');
  const [section, arg] = path.split('/');
  const active = ['p', 'exam', 'knowledge', 'mock', 'readiness','train','guide'].includes(section) ? 'practice' : section;
  const pageTitle:Record<string,string>={today:'今日学习',practice:'题库练习',review:'记忆卡片',mistakes:'错题巩固',analysis:'薄弱点分析',settings:'学习设置',knowledge:'知识分类',readiness:'808 适配水平',guide:'复习依据',train:'专项训练',mock:'整卷模考',exam:'原卷训练',p:'独立作答'};
  const dateLabel=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'long',timeZone:'Asia/Shanghai'}).format(new Date());

  let page;
  if(locked) page=<MockExamPage key={locked.id} id={locked.id}/>;
  else if (section === 'p' && arg) page = <ProblemPage key={arg} id={decodeURIComponent(arg)} />;
  else if (section === 'exam' && arg) page = <ExamPage key={arg} paper={decodeURIComponent(arg)} />;
  else if (section === 'practice') page = <PracticePage />;
  else if (section === 'knowledge') page = <KnowledgePage />;
  else if (section === 'readiness') page = <ReadinessPage />;
  else if (section === 'guide') page = <GuidePage />;
  else if(section==='train'&&arg)page=<TrainingPage key={route} id={decodeURIComponent(arg)}/>;
  else if (section === 'mock' && arg) page = <MockExamPage key={arg} id={decodeURIComponent(arg)}/>;
  else if (section === 'mock') page = <MockPage/>;
  else if (section === 'review') page = <ReviewPage />;
  else if (section === 'mistakes') page = <MistakesPage />;
  else if (section === 'analysis') page = <AnalysisPage />;
  else if (section === 'settings') page = <SettingsPage />;
  else page = <TodayPage />;

  return (
    <div className={`app ${locked?'exam-focus':''}`}>
      {!locked&&<aside className="sidebar">
        <Brand href="#/today"/>
        <p className="nav-caption">学习空间</p>
        <nav className="tabs-top" aria-label="主导航">
          {TABS.map(t=><a key={t.path} href={`#/${t.path}`} className={active===t.path?'on':''} aria-current={active===t.path?'page':undefined}><Icon name={t.icon}/><span>{t.label}</span>{active===t.path&&<span className="nav-dot" aria-hidden="true"/>}</a>)}
        </nav>
        <div className="sidebar-footer"><div className="sidebar-exam"><Icon name="target"/><b>把练过，变成会做。</b><p>独立作答 · 跨日复测</p><a href="#/mock">开始整卷训练 <Icon name="arrow"/></a></div><a className="sidebar-guide" href="#/guide"><Icon name="book"/>复习依据与重点核对</a></div>
      </aside>}
      <header className="top">
        <Brand href={locked?`#/mock/${locked.id}`:'#/today'}/>
        <div className="workspace-heading"><span>学习工作台</span><b>{locked?'严格模考':pageTitle[section]??'今日学习'}</b></div>
        <span className="workspace-date">{dateLabel}</span>
        {locked?<span className="badge">严格模考进行中</span>:<a className={`sync-pill ${sync.phase}`} href="#/settings" title={sync.message} aria-live="polite">{syncStatusLabel(sync)}</a>}
      </header>
      <main>{storageError && active !== 'settings' && <a className="banner" href="#/settings" role="alert">{storageError}</a>}<LoadBoundary resetKey={route}><Suspense fallback={<section className="card">正在打开…</section>}>{page}</Suspense></LoadBoundary></main>
      {!locked&&<nav className="tabs-bottom" aria-label="手机导航">
        {TABS.map((t) => (
          <a key={t.path} href={`#/${t.path}`} className={active === t.path ? 'on' : ''} aria-current={active===t.path?'page':undefined}>
            <Icon name={t.icon}/>
            {t.label}
          </a>
        ))}
      </nav>}
    </div>
  );
}

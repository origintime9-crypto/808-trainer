import { lazy, Suspense, useEffect, useState } from 'react';
import { AnalysisPage } from './pages/AnalysisPage';
import { MistakesPage } from './pages/MistakesPage';
import { PracticePage } from './pages/PracticePage';
import { SettingsPage } from './pages/SettingsPage';
import { TodayPage } from './pages/TodayPage';
import { connectSync, syncStatusLabel, useSyncStatus } from './engine/sync';
import { eventStorageError } from './engine/store';
import { useEvents } from './state';

const ProblemPage = lazy(() => import('./pages/ProblemPage').then(m => ({ default: m.ProblemPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage').then(m => ({ default: m.ReviewPage })));
const ExamPage = lazy(() => import('./pages/ExamPage').then(m => ({ default: m.ExamPage })));

const TABS = [
  { path: 'today', label: '今日', icon: '◎' },
  { path: 'practice', label: '刷题', icon: '✎' },
  { path: 'review', label: '卡片', icon: '❏' },
  { path: 'mistakes', label: '错题', icon: '✗' },
  { path: 'analysis', label: '薄弱点', icon: '▤' },
  { path: 'settings', label: '设置', icon: '⚙' },
];

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
  useEvents();
  const storageError = eventStorageError();
  const route = useRoute();
  const [path] = route.split('?');
  const [section, arg] = path.split('/');
  const active = ['p', 'exam'].includes(section) ? 'practice' : section;

  let page;
  if (section === 'p' && arg) page = <ProblemPage key={arg} id={decodeURIComponent(arg)} />;
  else if (section === 'exam' && arg) page = <ExamPage key={arg} paper={decodeURIComponent(arg)} />;
  else if (section === 'practice') page = <PracticePage />;
  else if (section === 'review') page = <ReviewPage />;
  else if (section === 'mistakes') page = <MistakesPage />;
  else if (section === 'analysis') page = <AnalysisPage />;
  else if (section === 'settings') page = <SettingsPage />;
  else page = <TodayPage />;

  return (
    <div className="app">
      <header className="top">
        <a className="brand" href="#/today">808 信号与系统</a>
        <nav className="tabs-top">
          {TABS.map((t) => (
            <a key={t.path} href={`#/${t.path}`} className={active === t.path ? 'on' : ''}>{t.label}</a>
          ))}
        </nav>
        <a className={`sync-pill ${sync.phase}`} href="#/settings" title={sync.message} aria-live="polite">{syncStatusLabel(sync)}</a>
      </header>
      <main>{storageError && active !== 'settings' && <a className="banner" href="#/settings" role="alert">{storageError}</a>}<Suspense fallback={<section className="card">正在打开…</section>}>{page}</Suspense></main>
      <nav className="tabs-bottom">
        {TABS.map((t) => (
          <a key={t.path} href={`#/${t.path}`} className={active === t.path ? 'on' : ''}>
            <span className="icon">{t.icon}</span>
            {t.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

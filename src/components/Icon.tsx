export type IconName = 'today' | 'practice' | 'review' | 'mistakes' | 'analysis' | 'settings' | 'arrow' | 'clock' | 'target' | 'book' | 'check';

const paths:Record<IconName,string>={
  today:'M4 5h16v15H4z M8 3v4 M16 3v4 M4 10h16 M8 14h3 M8 17h6',
  practice:'M4 20l4-1L20 7l-3-3L5 16z M14 7l3 3 M4 20h16',
  review:'M5 7h14v14H5z M8 3h14v14 M9 11h6 M9 15h4',
  mistakes:'M5 3h11l4 4v14H5z M15 3v5h5 M9 12l6 5 M15 12l-6 5',
  analysis:'M4 20h17 M7 16v-4 M12 16V7 M17 16V4',
  settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',
  arrow:'M4 12h15 M13 6l6 6-6 6',
  clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6l4 2',
  target:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10 M12 11v2',
  book:'M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1z M12 6v14',
  check:'M5 12l4 4L19 6',
};

export function Icon({name,className=''}:{name:IconName;className?:string}) {
  return <svg className={`ui-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>;
}

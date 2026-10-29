import { lazy, Suspense, useEffect, useRef } from 'react';
const TransformSheet=lazy(()=>import('./TransformSheet').then(m=>({default:m.TransformSheet})));
const SignalLab=lazy(()=>import('./SignalLab').then(m=>({default:m.SignalLab})));

export function LearningDrawer({type,onClose}:{type:'transforms'|'lab';onClose:()=>void}) {
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{dialog.current?.showModal();return()=>dialog.current?.close();},[]);
  const title=type==='transforms'?'三大变换对照':'信号与系统交互实验';
  return <dialog className="learning-drawer" ref={dialog} aria-label={title} onCancel={onClose} onClose={onClose}>
    <div className="drawer-head"><h2>{title}</h2><button autoFocus onClick={onClose} aria-label="关闭学习抽屉">关闭 ×</button></div>
    <div className="drawer-content"><Suspense fallback={<p>正在打开学习辅助…</p>}>{type==='transforms'?<TransformSheet/>:<SignalLab/>}</Suspense></div>
  </dialog>;
}

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { INK_LIMIT, loadInk, saveInk, type InkPoint, type InkStroke } from '../engine/scratchpad';

const WIDTH=1000,HEIGHT=625;
function draw(ctx:CanvasRenderingContext2D,stroke:InkStroke) {
  ctx.save();ctx.globalCompositeOperation=stroke.erase?'destination-out':'source-over';
  ctx.strokeStyle='#243c60';ctx.fillStyle='#243c60';ctx.lineCap='round';ctx.lineJoin='round';
  for(let i=0;i<stroke.points.length;i++) {
    const p=stroke.points[i],previous=stroke.points[Math.max(0,i-1)];
    const width=stroke.erase?24:1.5+4*(p.pressure||.4);
    ctx.lineWidth=width;
    if(i===0){ctx.beginPath();ctx.arc(p.x*WIDTH,p.y*HEIGHT,width/2,0,Math.PI*2);ctx.fill();}
    else{ctx.beginPath();ctx.moveTo(previous.x*WIDTH,previous.y*HEIGHT);ctx.lineTo(p.x*WIDTH,p.y*HEIGHT);ctx.stroke();}
  }
  ctx.restore();
}

export function Scratchpad({ storageKey }: {storageKey:string}) {
  const canvas=useRef<HTMLCanvasElement>(null),strokes=useRef<InkStroke[]>([]),redo=useRef<InkStroke[]>([]);
  const active=useRef<{id:number;stroke:InkStroke}|null>(null),persistable=useRef(true),penActive=useRef(false);
  const [ready,setReady]=useState(false),[tool,setTool]=useState<'pen'|'erase'>('pen'),[penOnly,setPenOnly]=useState(false);
  const [status,setStatus]=useState('正在读取本机草稿…'),[revision,setRevision]=useState(0);
  const paint=()=>{const ctx=canvas.current?.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,WIDTH,HEIGHT);strokes.current.forEach(s=>draw(ctx,s));if(active.current)draw(ctx,active.current.stroke);};
  const persist=()=>{
    setRevision(n=>n+1);
    if(!persistable.current)return;
    setStatus('正在保存…');
    // 事务保存独立快照，后续移动不会改变正在写入的数据。
    void saveInk(storageKey,structuredClone(strokes.current)).then(()=>setStatus('草稿已保存到这台设备'),()=>setStatus('草稿保存失败，请下载图片留存'));
  };
  useEffect(()=>{
    let live=true;
    loadInk(storageKey).then(rows=>{if(live){strokes.current=rows;setReady(true);setStatus('草稿已保存到这台设备');paint();setRevision(n=>n+1);}},()=>{
      if(live){persistable.current=false;setReady(true);setStatus('本机草稿存储不可用，临时书写后请下载图片');}
    });
    const stop=()=>finish();window.addEventListener('pagehide',stop);
    return()=>{live=false;window.removeEventListener('pagehide',stop);finish();};
  },[storageKey]);
  const point=(e:PointerEvent|ReactPointerEvent<HTMLCanvasElement>):InkPoint=>{
    const rect=canvas.current!.getBoundingClientRect();
    return {x:Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height)),pressure:Math.max(0,Math.min(1,e.pointerType==='pen'?e.pressure||.4:.5))};
  };
  const down=(e:ReactPointerEvent<HTMLCanvasElement>)=>{
    if(!ready||active.current||e.pointerType==='touch'&&(penOnly||penActive.current||e.width>35||e.height>35)||e.pointerType==='mouse'&&e.button!==0)return;
    if(strokes.current.length>=2000||strokes.current.reduce((v,s)=>v+s.points.length,0)>=INK_LIMIT){setStatus('草稿已达上限，请下载后清空再写');return;}
    if(e.pointerType==='pen'){penActive.current=true;setPenOnly(true);}
    e.preventDefault();canvas.current!.setPointerCapture(e.pointerId);
    active.current={id:e.pointerId,stroke:{erase:tool==='erase'||e.button===5,points:[point(e)]}};paint();
  };
  const move=(e:ReactPointerEvent<HTMLCanvasElement>)=>{
    const a=active.current;if(!a||a.id!==e.pointerId)return;e.preventDefault();
    const samples=e.nativeEvent.getCoalescedEvents?.()??[];
    const remaining=INK_LIMIT-strokes.current.reduce((v,s)=>v+s.points.length,0)-a.stroke.points.length;
    const points=(samples.length?samples:[e.nativeEvent]).slice(0,Math.max(0,remaining)).map(point);
    a.stroke.points.push(...points);paint();
  };
  function finish() {
    const a=active.current;if(!a)return;
    active.current=null;penActive.current=false;strokes.current.push(a.stroke);redo.current=[];persist();
  }
  const download=()=>{
    finish();paint();const output=document.createElement('canvas');output.width=WIDTH;output.height=HEIGHT;
    const ctx=output.getContext('2d')!;ctx.fillStyle='#fff';ctx.fillRect(0,0,WIDTH,HEIGHT);ctx.drawImage(canvas.current!,0,0);
    output.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='808-草稿.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  };
  return <section className="card scratchpad" data-shortcuts-off data-ink-revision={revision}>
    <div className="card-head"><h3>手写草稿</h3><span className="badge">本机保存</span></div>
    <div className="scratch-tools" role="group" aria-label="草稿工具">
      <button aria-pressed={tool==='pen'} onClick={()=>setTool('pen')}>笔</button><button aria-pressed={tool==='erase'} onClick={()=>setTool('erase')}>橡皮</button>
      <button disabled={!strokes.current.length} onClick={()=>{finish();const s=strokes.current.pop();if(s)redo.current.push(s);paint();persist();}}>撤销</button>
      <button disabled={!redo.current.length} onClick={()=>{const s=redo.current.pop();if(s)strokes.current.push(s);paint();persist();}}>重做</button>
      <button disabled={!ready} onClick={()=>{if(!strokes.current.length||confirm('清空本题在这台设备上的草稿？')){active.current=null;strokes.current=[];redo.current=[];paint();persist();}}}>清空</button>
      <button onClick={download} disabled={!ready}>下载图片</button>
    </div>
    <label className="check-label small"><input type="checkbox" checked={penOnly} onChange={e=>setPenOnly(e.target.checked)}/>仅触控笔（忽略手掌和手指）</label>
    <canvas width={WIDTH} height={HEIGHT} ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} aria-label="手写草稿绘图区域，支持鼠标、手指和触控笔"/>
    <p className="small muted" role="status">{status}。草稿不参与评分、不上传云端；模考仍需标记本题完成。</p>
  </section>;
}

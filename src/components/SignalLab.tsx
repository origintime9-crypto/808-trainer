import { useState } from 'react';
import { hasAliasing, poleMagnitude, rectangleOverlap } from '../engine/signalLab';
import { Md } from './Markdown';

export function SignalLab() {
  const [tab,setTab]=useState('convolution'),[t,setT]=useState(.5),[sigma,setSigma]=useState(.5),[omega0,setOmega0]=useState(2),[sampling,setSampling]=useState(3);
  const overlap=rectangleOverlap(t),x=(v:number)=>90+v*160;
  const values=Array.from({length:201},(_,i)=>poleMagnitude(i/25,sigma,omega0));
  const peak=Math.max(...values),path=values.map((v,i)=>`${i?'L':'M'}${45+i*2.5},${205-v/peak*160}`).join(' ');
  return <div className="signal-lab">
    <div className="chips" role="group" aria-label="选择交互实验">{[['convolution','图解卷积'],['poles','极点与频响'],['sampling','频谱混叠']].map(([id,title])=><button key={id} aria-pressed={tab===id} className={tab===id?'primary':''} onClick={()=>setTab(id)}>{title}</button>)}</div>
    <p className="small muted">以下是可调参数的教学示例，用来理解关系，不是当前题目的答案。</p>
    {tab==='convolution'&&<>
      <Md>{String.raw`固定 $x(\tau)=1_{[0,1]}(\tau)$。先把 $h(\tau)=1_{[0,1]}(\tau)$ 翻转为 $h(-\tau)=1_{[-1,0]}(\tau)$，再平移成 $h(t-\tau)=1_{[t-1,t]}(\tau)$。两者相乘仅保留重叠区间，积分就是重叠长度。`}</Md>
      <label className="lab-slider">平移 t = {t.toFixed(2)}<input aria-label="卷积平移 t" type="range" min={-.5} max={2.5} step={.05} value={t} onChange={e=>setT(Number(e.target.value))}/></label>
      <svg viewBox="0 0 600 250" role="img" aria-label={`两个矩形重叠长度 ${overlap.length.toFixed(2)}`}>
        <path d="M25 195H570" stroke="#a0aebf"/><path d={`M${x(0)} 195V65H${x(1)}V195`} fill="none" stroke="#2b527f" strokeWidth="3"/>
        <path d={`M${x(t-1)} 195V110H${x(t)}V195`} fill="none" stroke="#d38936" strokeWidth="3"/>
        {overlap.length>0&&<rect x={x(overlap.low)} y={130} width={overlap.length*160} height={65} fill="#47a89f" opacity=".35"/>}
        <text x={x(0)} y="220">0</text><text x={x(1)} y="220">1</text><text x="26" y="35" fill="#2b527f">蓝：x(τ)</text><text x="205" y="35" fill="#a26a22">橙：h(t−τ)</text><text x="390" y="35">绿：相乘非零区间</text>
      </svg>
      <p className="lab-result">积分限：[max(0,t−1), min(1,t)]；{overlap.length>0?`本次为 [${overlap.low.toFixed(2)}, ${overlap.high.toFixed(2)}]`:'上下限无交集，积分为零'}。 y(t) = <b>{overlap.length.toFixed(2)}</b></p>
      <Md>{String.raw`$$y(t)=\begin{cases}t,&0\le t\le1\\2-t,&1<t\le2\\0,&\text{其他}\end{cases}$$`}</Md>
    </>}
    {tab==='poles'&&<>
      <Md>{String.raw`示例因果系统 $H(s)=1/[(s+\sigma)^2+\omega_0^2]$，极点为 $-\sigma\pm j\omega_0$。将共轭极点拖近虚轴，观察峰值变化。`}</Md>
      <label className="lab-slider">极点实部 −σ = −{sigma.toFixed(2)}<input aria-label="极点衰减 σ" type="range" min={.1} max={2} step={.05} value={sigma} onChange={e=>setSigma(Number(e.target.value))}/></label>
      <label className="lab-slider">极点虚部 ±ω₀ = ±{omega0.toFixed(2)}<input aria-label="极点虚部 ω0" type="range" min={.5} max={4} step={.1} value={omega0} onChange={e=>setOmega0(Number(e.target.value))}/></label>
      <svg viewBox="0 0 600 245" role="img" aria-label={`幅频响应，当前图中峰值 ${peak.toFixed(3)}`}><path d="M45 25V205H560" stroke="#9aa9bb" fill="none"/><path d={path} stroke="#2b527f" strokeWidth="3" fill="none"/><text x="45" y="230">0</text><text x="520" y="230">ω = 8</text><text x="50" y="20">|H(jω)| · 纵轴随峰值缩放</text></svg>
      <p className="lab-result">极点：−{sigma.toFixed(2)} ± j{omega0.toFixed(2)}。图中采样峰值约 <b>{peak.toFixed(3)}</b>；纵轴上限随参数变化，请同时比较数值。</p>
      <p className="small muted">本示例 σ 始终大于零，因果 ROC 含虚轴，系统稳定。峰频率一般不等于极点虚部；强阻尼时最大幅值可出现在直流。</p>
    </>}
    {tab==='sampling'&&<>
      <Md>{String.raw`原谱是 $|f|<1\,\mathrm{Hz}$ 上的单位矩形。理想脉冲抽样后，副本每隔 $f_s$ 平移，幅度乘 $1/T=f_s$。图中展示中心及左右两个相邻副本。`}</Md>
      <label className="lab-slider">抽样频率 fs = {sampling.toFixed(1)} Hz<input aria-label="抽样频率 fs" type="range" min={1} max={4} step={.1} value={sampling} onChange={e=>setSampling(Number(e.target.value))}/></label>
      <svg viewBox="0 0 600 230" role="img" aria-label={hasAliasing(1,sampling)?'谱副本重叠，发生混叠':'谱副本内部不重叠'}>
        <path d="M20 185H580" stroke="#9aa9bb"/>{[-1,0,1].map((k,i)=><path key={k} d={`M${300+(k*sampling-1)*55} 185V${185-sampling*30}H${300+(k*sampling+1)*55}V185`} stroke={['#d38936','#2b527f','#409b92'][i]} fill={['#d3893622','#2b527f22','#409b9222'][i]} strokeWidth="3"/>)}
        <text x="295" y="210">0</text><text x="570" y="210">f</text><text x="35" y="28">副本高度 = fs = {sampling.toFixed(1)}</text>
      </svg>
      <p className="lab-result">{hasAliasing(1,sampling)?'fs < 2fm，副本内部重叠，发生混叠。':sampling===2?'fs = 2fm，边缘恰好相接。临界恢复还需核对边缘谱线和采样相位。':'fs > 2fm，谱副本之间留有间隔。'}</p>
    </>}
  </div>;
}

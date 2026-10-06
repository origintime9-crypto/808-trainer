import type { Problem } from '../../types';
import { problem as make } from './helper';
import { tkExam06 } from './tk-exam-06';
import { tkExam07 } from './tk-exam-07';
import { tkExam08 } from './tk-exam-08';
import { tkExam10 } from './tk-exam-10';
import { tkExam11 } from './tk-exam-11';
import { hw5 } from './hw5';
const paper = 'tk-exam-12';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make(paper, ...args);
const r = String.raw;
const score = (no: string, value: number): Partial<Problem> => ({ sources: [{ paper, no, score: value }] });
const fill = (no: string): Partial<Problem> => ({ ...score(no, 3), type: '填空' });
const calcSplit = '原卷本计算题共10分，未给各拆问的分值，不擅自平分。';
const joint = '原卷本综合题共10分，未给各小问分值，作答单元不虚分。';
const triangle = r`连续信号$x(t)=1-|t|$（−1≤t≤1），其他t为0。按给定间隔均匀采样，确定离散序列x[k]=x(kTₛ)，明确零下标与端点。`;
const templates = [...tkExam06, ...tkExam07, ...tkExam08, ...tkExam10, ...tkExam11, ...hw5];
function same(no: string, id: string, note: string, extra: Partial<Problem> = {}): Problem {
  const old = templates.find(item => item.id === id);
  if (!old?.pattern) throw new Error('同题模板不存在：' + id);
  return p(no, [...old.kps], old.pattern, old.stem, old.answer, old.solution, {
    type: old.type, verified: old.verified, figures: old.figures, note, ...extra,
  });
}

export const tkExam12: Problem[] = [
  p('一(1)', ['1.2'], 'period', r`求$f(t)=3\cos(4t+\pi/3)$的基波周期。`, r`$T_0=\pi/2$ s。`, r`非零振幅余弦的角频率是4 rad/s，最小正周期满足4T₀=2π，所以T₀=π/2。幅度3和初相π/3均不改变周期。`, fill('一(1)')),
  p('一(2)', ['1.4', '1.5'], 'delta-sift', r`按分布意义化简$\sin t\,\delta'(t)$。`, r`$-\delta(t)$。`, r`一般公式$g(t)\delta'(t)=g(0)\delta'(t)-g'(0)\delta(t)$。这里sin0=0、cos0=1，只留下负冲激。对任意光滑试验函数φ，左式作用为−(sin t·φ)′在0的值=−φ(0)，与右式一致；不能只把sin0代入便写0。`, fill('一(2)')),
  same('一(3)', 'tk-exam-07-1-3', '第56–57页的h第一项与f第二项均有原点箭头，序列与第7套一3完全同题，合并原编号；本课程只列题面，没有附参考解。', fill('一(3)')),
  same('一(4)', 'tk-exam-07-1-4', '第57页T₀=2π及五个指数系数与第7套一4完全同题，合并来源。', fill('一(4)')),
  p('一(5)', ['2.4', '1.5'], 'conv-integral', r`已知$y(t)=f(t)*h(t)$，填出$y(2t)$与f(2t)、h(2t)卷积的关系；各积分按存在条件解释。`, r`$y(2t)=2[f(2t)*h(2t)]$。`, r`定义积分$y(2t)=\int f(\tau)h(2t-\tau)d\tau$，令τ=2v，则dτ=2dv，得到$2\int f(2v)h[2(t-v)]dv$。时域两个信号一起压缩，其卷积需要乘2，不能与单个FT尺度中的1/2混淆。`, fill('一(5)')),
  same('一(6)', 'tk-exam-11-1-10', '第57页仍明确给g=e⁻ᵗu(t)+u(−1−t)，及输入u(t−1)−u(t−2)，与课程11一10完全同题。合并来源并保留通常卷积实现的远端基线矛盾；原式不改成右向阶跃。', fill('一(6)')),
  p('一(7)', ['1.8', '2.2'], 'full-response-decomp', r`题设LTI系统，t>0。令$a(t)=e^{-t}u(t)$、$b(t)=e^{-2t}u(t)$，三次输入a+2b、2a+b、a+b，对应输出a+5b、5a+b、a+b。求输入a−b的响应，原题未说明这些响应是否为零状态或是否使用相同初态。`, r`若三次是同一初态的完全响应，结果为$a(t)-7b(t)$。若声称三次全为零状态响应，已给数据互相矛盾，无法作出一致的LTI解。`, r`输入满足f₁+f₂=3f₃，但输出y₁+y₂=6(a+b)，而3y₃=3(a+b)，不满足零状态叠加。若每次有同一零输入部分z，写yᵢ=L[fᵢ]+z，前述组合得到−z=3(a+b)，所以z=−3(a+b)。由三组数据得L[a]=4a、L[b]=4b，目标完全响应为4(a−b)+z=a−7b。也可取f₄=−2f₁+3f₃，组合系数和1保持公共初态，得到y₄=−2y₁+3y₃。只用f₂−f₁时系数和0，会消掉初态，得到的是4(a−b)的零状态部分。`, { ...fill('一(7)'), verified: 'uncertain', note: '第57页三组数据均照原文保留，题干只说LTI与t>0，未给初态及零状态限定。同初态的完全响应解释可由D=4、B=0、A=diag(−1,−2)、C=(1,1)、x(0)=(−3,−3)的实际LTI实现满足；若初态每次不同，目标响应还不唯一。条件解不能包装成无条件叠加答案。' }),
  same('一(8)', 'tk-exam-08-1-8', '第57页因果H(s)全部实际极点在左半平面，求h的远时限，和课程08一8完全同题；按有限阶有理系统的普通正时间部分讨论，合并旧编号。', fill('一(8)')),
  same('一(9)', 'hw5-5-2-2', '第57页要求Sa²(100t)不混叠的最小抽样角频率，与hw5及课程08一9为同一输入、同一抽样要求，合并来源；本题角频率应写400 rad/s，不能写400 Hz。', fill('一(9)')),
  same('一(10)', 'tk-exam-08-1-10', '第57页分段积分从2到t，t<2时为0，与课程08一10完全同题，合并原编号；本课程未附参考解，延时因子继续取正e⁻²ˢ。', fill('一(10)')),
  p('二(1)', ['1.6'], 'concept', '证明：两个奇信号或两个偶信号的乘积为偶信号；一个奇信号和一个偶信号的乘积为奇信号。', '奇×奇为偶，偶×偶为偶，奇×偶为奇。', r`令p(t)=f(t)g(t)。奇信号满足f(−t)=−f(t)，偶信号满足f(−t)=f(t)。两个奇信号给p(−t)=[−f(t)][−g(t)]=p(t)；两个偶信号给p(−t)=f(t)g(t)=p(t)；奇与偶相乘给p(−t)=−p(t)。零信号可同时具有奇偶性，不与结论冲突。`, score('二(1)', 10)),
  p('二(2)', ['3.2'], 'ft-basic', r`求$x(t)=\cos(2t+\pi/4)$的指数傅里叶级数。`, r`$T_0=\pi$、$\omega_0=2$；$C_1=\tfrac12e^{j\pi/4}$、$C_{-1}=\tfrac12e^{-j\pi/4}$，其他Cₙ=0。

$x(t)=\tfrac12e^{j\pi/4}e^{j2t}+\tfrac12e^{-j\pi/4}e^{-j2t}$。`, r`欧拉公式把余弦分成正、负基波指数。也可按$C_n=T_0^{-1}\int_0^{T_0}x(t)e^{-jn\omega_0t}dt$核对。这里求级数系数，不能额外乘入FT冲激强度的2π；实信号两系数互为共轭。`, score('二(2)', 10)),
  p('二3(a)', ['5.1', '6.1'], 'waveform', triangle+'取Tₛ=0.25 s。', r`$x[k]=1-|k|/4$（|k|≤4），带外0。x[−4..4]={0,1/4,1/2,3/4,1,3/4,1/2,1/4,0}，中间1对应k=0。

![四分之一秒采样，下标明确](figures/tk-exam-12/a2-3a.svg)`, '将t=k/4代入连续三角信号。k=±4正好落在连续端点，幅值0；不能把列出的第一项当作k=0，也不把采样后的序列再画成连续三角。', { type: '画图', note: calcSplit }),
  p('二3(b)', ['5.1', '6.1'], 'waveform', triangle+'取Tₛ=0.5 s。', r`$x[k]=1-|k|/2$（|k|≤2），带外0。x[−2..2]={0,1/2,1,1/2,0}，中间1对应k=0。

![半秒采样，下标明确](figures/tk-exam-12/a2-3b.svg)`, '将t=k/2代入。只有k=−1、0、1有非零值；k=±2位于幅值0的端点，下标仍可保留以显示支撑边界。', { type: '画图', note: calcSplit }),
  p('二3(c)', ['5.1', '6.1'], 'waveform', triangle+'取Tₛ=1.0 s。', r`$x[k]=\delta[k]$，即x[0]=1，其他整数k的样值全为0。

![一秒采样仅原点非零](figures/tk-exam-12/a2-3c.svg)`, '原点采到峰值1，k=±1采到两个0端点，更远点在支撑外也为0。这里δ[k]是离散单位样值，不能写成连续时间冲激δ(t)。', { type: '画图', note: calcSplit }),
  same('二4(1)', 'tk-exam-06-22-1', '第57页y′+2y=f和完全响应(2e⁻ᵗ+3e⁻²ᵗ)u，与课程06二2同题，本题求零输入部分。原题同样没有初态/原点冲激条件，保留一般左初态a及无原点冲激时a=5的条件说明。'+calcSplit),
  same('二4(2)', 'tk-exam-06-22-2', '第57页同一完全响应，零状态部分合并课程06二2第二问；一般左初态a与输入(5−a)δ的关系不能省去。'+calcSplit),
  same('二(5)', 'tk-exam-06-2-4', '第57页H=(s²+1)/(s³+2s²+3s+1)与课程06二4同题，合并状态/输出方程来源；本卷没有参考框图，旧来源的反馈勘误仍仅指第25页。', score('二(5)', 10)),
  same('三1(1a)', 'tk-exam-06-31-1a', '第57页差分方程6y−5y[-1]+y[-2]=u，左初态−2、3，与课程06三1完全同题，合并零输入问。'+joint),
  same('三1(1b)', 'tk-exam-06-31-1b', '第57页同方程、同阶跃输入，合并课程06三1零状态问。'+joint),
  same('三1(1c)', 'tk-exam-06-31-1c', '第57页同方程、同输入与初态，合并课程06三1完全响应问。'+joint),
  same('三1(2)', 'tk-exam-06-31-2', '第57页求H与单位样值响应，原方程和因果条件同课程06三1第二问，合并来源。'+joint),
  same('三1(3)', 'tk-exam-06-31-3', '第58页把输入改2u[k−1]，原初态不变并重求原组，与课程06三1第三问完全同题；整体保留原问分组。'+joint),
  same('三2(1)', 'tk-exam-10-32-1', '第58页原图A-1为输入矩形高1、带宽ω₁与H₁三角高1、带宽2ω₁，和课程10三2同题，合并Y₁问。'+joint),
  same('三2(2)', 'tk-exam-10-32-2', '第58页原谱/滤波/冲激串同课程10三2，合并复制谱及T范围问；临界普通密度和边缘谱线仍分别说明。'+joint),
  same('三2(3)', 'tk-exam-10-32-3', '第58页恢复原f的补偿滤波与截止范围，和课程10三2同题。H₂带内为T/H₁，输入带边缘2T与任意截止ωc不能混写；本卷未附参考图，原参考解勘误仍仅指第54页。'+joint),
];

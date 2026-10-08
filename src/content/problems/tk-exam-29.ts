import type { Problem } from '../../types';
import { problem as make } from './helper';
import { tkExam01 } from './tk-exam-01';
import { tkExam06 } from './tk-exam-06';
import { tkExam11 } from './tk-exam-11';
import { tkExam28 } from './tk-exam-28';
const paper='tk-exam-29';
const p=(...args: Parameters<typeof make> extends [string,...infer R]? R:never)=>make(paper,...args);
const r=String.raw;
const score=(no:string,value:number):Partial<Problem>=>({sources:[{paper,no,score:value}]});
const fill=(no:string):Partial<Problem>=>({...score(no,3),type:'填空'});
const split='原卷本计算题共10分，未给拆问分值，各单元不虚分。本卷未附参考解。';
const joint='原卷本综合题共10分，未给小问分值，不擅自平分。本卷未附参考解。';
const oldProblems=[...tkExam01,...tkExam06,...tkExam11,...tkExam28];
function same(no:string,id:string,note:string,extra:Partial<Problem>={}):Problem {
 const old=oldProblems.find(item=>item.id===id);
 if(!old?.pattern)throw new Error('同题模板不存在：'+id);
 return p(no,[...old.kps],old.pattern,old.stem,old.answer,old.solution,{
  type:old.type,figures:old.figures,verified:old.verified,...extra,note,
 });
}
const lowpass=r`理想低通频响H(jω)=1（|ω|<ωc）、带外0，输入$x(t)=\sin(at)/(\pi t)$，在原点取连续极限。a、ωc按正截止角频率理解。`;
const harmonic=r`周期信号
$$
f(t)=1+4\cos(\omega_0t+\pi/6)+2\sin(2\omega_0t+\pi/3)+\cos(3\omega_0t+\pi/6),\quad \omega_0>0.
$$
求双边频谱，按$f(t)=\sum C_ne^{jn\omega_0t}$的复级数系数口径；原问f_T指上述周期信号，没有另外给抽样操作。`;
const kernels=r`三个因果LTI系统的核分别为$h_1(t)=u(t)$、$h_2(t)=-2\delta(t)+5e^{-2t}u(t)$、$h_3(t)=2te^{-t}u(t)$。输入$x(t)=\cos t$定义于−∞<t<∞，没有u(t)开通门。`;
const delayed=r`因果连续系统满足$y'(t)+2y(t)=x(t-1)$，初态$y(0^-)=1$，输入$x(t)=\sin(2t)u(t)$。求t≥0的响应，记θ=t−1；乘u(t)只表示正时间部分，不覆盖原左初态。`;

export const tkExam29:Problem[]=[
 same('一(1)','tk-exam-11-1-1','第91页t₀<0的时移方向与课程11一1同题，节点向左移动，合并原编号。',fill('一(1)')),
 same('一(2)','tk-exam-11-1-2','第91页四组频谱特征连问与课程11一2同题，保持完整四空及通常/广义谱的适用条件。',fill('一(2)')),
 same('一(3)','tk-exam-11-1-3','第91页0..∞积分4t²δ(t+1)与课程11一3同题，原冲激在区间外。',fill('一(3)')),
 same('一(4)','tk-exam-11-1-4','第91页单位阶跃广义FT与课程11一4同题，主值项和直流δ均保留。',fill('一(4)')),
 same('一(5)','tk-exam-11-1-5','第91页从n−1到n+5的七样本求和与课程11一5同题，非因果但稳定。',fill('一(5)')),
 same('一(6)','tk-exam-06-1-6','第91页一般离散LTI的BIBO稳定充要条件与课程06一6同题，绝对可和判据不能无条件换成所有极点在单位圆内。',fill('一(6)')),
 same('一(7)','tk-exam-06-1-7','第91页f最高频率f₀ Hz、对f(t/2)抽样与课程06一7同题，最大间隔按临界口径为1/f₀。',fill('一(7)')),
 same('一(8)','tk-exam-01-1-1','第91页(t²+4)u(t)的二阶分布导数与课程01一1同题，保留4δ′，不能只对正时间多项式求导。',fill('一(8)')),
 same('一(9)','tk-exam-06-1-9','第91页f(t/4)f(t/2)的最高角频率上界与课程06一9同题，分清rad/s和Hz。',fill('一(9)')),
 same('一(10)','tk-exam-06-1-10','第92页F=1/[(z+1/2)(z+2)]的因果ROC与课程06一10同题，外侧为|z|>2，合并旧编号。',fill('一(10)')),

 same('二(1)','tk-exam-28-2-5','第92页稳定系统有限长指数核的频响与课程28二5完全同题，问阶跃s(t)，t≥1为1−e⁻¹。',score('二(1)',10)),
 p('二2(1)',['3.3','3.9'],'filter-output',lowpass+'当a<ωc时，求输出。',
  r`$y(t)=\sin(at)/(\pi t)=x(t)$，y(0)=a/π。`,
  r`输入X(jω)=1（|ω|<a）、带外0，来自单位矩形谱的逆变换。输入全部非零频谱位于通带，Y=HX=X，因此原样通过。这里a表示半带宽，不能再额外把正负两侧宽度2a当作最高角频率。`,
  {note:split}),
 p('二2(2)',['3.3','3.9'],'filter-output',lowpass+'当a>ωc时，求输出。',
  r`$y(t)=\sin(\omega_ct)/(\pi t)$，y(0)=ωc/π。`,
  r`Y在|ω|<ωc为1，在其他频率为0。按定义逆变换(1/2π)∫₋ωc^ωc eʲωᵗdω，得到所示输出，原点取可去极限。低通保留的是较小的半带宽ωc，不能以ωc/a整体缩放原波形来代替删频。`,
  {note:split}),
 p('二2(3)',['3.8','3.9'],'filter-output',lowpass+'比较上面两种情况，哪一种存在失真？',
  'a<ωc时无失真；a>ωc时存在频谱截断失真。',
  r`第一种满足y=x，即K=1、延时0。第二种在原输入非零频带上有一段H=0，另一段H=1，无法用统一非零常数增益与线性相位因子表示；不是仅改变整条波形的幅度或时移。截止边缘单点对普通矩形谱密度的逆变换没有影响，不能将这点与抽样中的边缘冲激谱线问题混淆。`,
  {type:'分析',note:split}),
 p('二3(1)',['3.2','3.5'],'fourier-series',harmonic+'求Cₙ并画双边幅度谱。',
  r`$C_0=1$，$C_{\pm1}=2e^{\pm j\pi/6}$，$C_2=e^{-j\pi/6}$、$C_{-2}=e^{j\pi/6}$，$C_{\pm3}=\frac12e^{\pm j\pi/6}$，其余0。

![三谐波复级数系数的双边幅度](figures/tk-exam-29/a2-3a.svg)`,
  r`余弦的每个正负频率系数为原幅度的一半并带共轭相位。第二谐波是2sin(2ω₀t+π/3)=2cos(2ω₀t−π/6)，所以正频率系数相位为−π/6，不能把正弦相位π/3直接当成C₂的相位。图画|Cₙ|，不是三角幅度；若画广义FT冲激强度，须将每个Cₙ乘2π。`,
  {figures:['figures/tk-exam-29/q2-3.png'],type:'画图',note:split}),
 p('二3(2)',['3.2','3.5'],'fourier-series',harmonic+'画双边相位谱，说明零系数处的相位。',
  r`n=−3..3的相位依次为$-\pi/6,\ \pi/6,\ -\pi/6,\ 0,\ \pi/6,\ -\pi/6,\ \pi/6$。其他Cₙ=0，相位未定义。

![实信号共轭相位及第二谐波的正弦换算](figures/tk-exam-29/a2-3b.svg)`,
  r`实信号C₋ₙ=Cₙ*，正负谐波相位互为相反数，直流C₀=1的相位为0。幅度为0的频点没有可确定的相角，不能在整条频轴上补成相位0。第二谐波正频率的相位为π/3−π/2=−π/6，负频率相反；其他余弦按原π/6取相位。`,
  {figures:['figures/tk-exam-29/q2-3.png'],type:'画图',note:split}),
 p('二4(1a)',['2.4','3.7','4.4'],'sine-steady',kernels+'求h₁系统的零状态响应，核对普通全时域卷积的存在性。',
  r`普通卷积$\int_0^\infty\cos(t-\tau)d\tau$没有收敛极限，不能直接给出普通卷积意义的唯一输出。

若**明确采用Abel正则化或广义频域口径**，则条件结果为$y_1(t)=\sin t$。从t=0开通的另一输入cos t·u(t)也得到sin t·u(t)，但那不是原题给定的全时域输入。`,
  r`截止到L的卷积为sin t−sin(t−L)，随L振荡。取t=0、L=π/2+2mπ时为1、L=3π/2+2mπ时为−1，故没有极限。若额外在核中乘e⁻ετ、ε>0，再让ε→0⁺，积分为(εcos t+sin t)/(ε²+1)，趋向sin t。广义频响在ω=±1处对应1/(jω)，但普通h₁的FT与普通绝对收敛卷积不因此自动存在。`,
  {figures:['figures/tk-exam-29/q2-4.png'],verified:'uncertain',note:'第92页明确写−∞<t<∞的cos t，h₁=u(t)。原未声明正则化/广义卷积或有限起始时刻，普通积分不收敛；原题保留并给有条件结论，排除808能力和自动组卷。'+split}),
 p('二4(1b)',['2.4','3.7'],'sine-steady',kernels+'求h₂系统对原输入的零状态响应。',
  r`$y_2(t)=\sin t$。`,
  r`稳定因果核包含直接通路−2δ与可积尾5e⁻²ᵗu。直接卷积为−2cos t+5∫₀∞e⁻²τcos(t−τ)dτ；该积分为(2cos t+sin t)/5，两项相加得到sin t。独立频域核对H₂(j)=−2+5/(2+j)=−j，输出相对cos t延后π/2。`,
  {figures:['figures/tk-exam-29/q2-4.png'],note:split}),
 p('二4(1c)',['2.4','3.7'],'sine-steady',kernels+'求h₃系统对原输入的零状态响应并比较。',
  r`$y_3(t)=\sin t$，与h₂在这一输入下相同。`,
  r`核2te⁻ᵗu绝对可积。按全时域卷积积分∫₀∞2τe⁻τcos(t−τ)dτ，结果为sin t；频域H₃(j)=2/(1+j)²=−j也核对。h₂、h₃在ω=1具有同一频率增益，不能因此认为它们对所有频率或任意输入都相同；h₁仅在前一问明示的附加口径下有相同条件结果。`,
  {figures:['figures/tk-exam-29/q2-4.png'],note:split}),
 p('二4(2)',['3.7','4.6'],'sine-steady',kernels+'按“cost输入映为sin t”的特性，给另一个系统的h(t)，说明所需条件。',
  r`可取稳定因果核$h_4(t)=(4e^{-t}-5e^{-2t})u(t)$。其$H_4(s)=4/(s+1)-5/(s+2)$，$H_4(j)=-j$，对原cost输入得到sin t。`,
  r`令h₄=ae⁻ᵗu+be⁻²ᵗu，要求a/(1+j)+b/(2+j)=−j，实虚部分给a/2+2b/5=0、a/2+b/5=1，解出a=4、b=−5。核是可积指数之和，原全时域卷积有定义。这里相同的是指定ω=1输入的响应；其H₄不是H₂或H₃的同一函数，不声称系统全带等价。`,
  {note:'原“相同特性”按本题所测试的全时域cost→sin t解释，另给可普通卷积求解的稳定实现。'+split}),
 same('二(5)','tk-exam-28-2-1','第92页y′+2y=x、矩形u(t)−u(t−2)及强制时域解法与课程28二1同题，输入输出波形沿用旧图和进度。',score('二(5)',10)),

 p('三1(1)',['2.1','2.2','4.5'],'full-response-decomp',delayed+'求完全响应。',
  r`$$
y(t)=e^{-2t}u(t)+\frac14[\sin(2\theta)-\cos(2\theta)+e^{-2\theta}]u(\theta),\quad \theta=t-1.
$$
0≤t<1时仅为e⁻²ᵗ；t≥1后再叠加延迟零状态响应。y(0⁺)=1，y在t=1连续。

![初态先衰减，t=1之后再产生零状态振荡](figures/tk-exam-29/a3-1.svg)`,
  r`单边变换给(s+2)Y−1=e⁻ˢ·2/(s²+4)，故Y=1/(s+2)+e⁻ˢ·2/[(s+2)(s²+4)]。未延迟的逆变换为[sin2t−cos2t+e⁻²ᵗ]/4，整体延迟1秒后加初态解。也可用从τ=1起的因果时域积分。输入在原点及延迟开通处都没有冲激，不能把原左初态1改成零初态或让完全响应直到1秒才开始。`,
  {figures:['figures/tk-exam-29/q3-1.png'],note:joint}),
 p('三1(2a)',['2.2','2.4'],'ode-s-solve',delayed+'求零状态响应。',
  r`$$
y_{zs}(t)=\frac14[\sin(2\theta)-\cos(2\theta)+e^{-2\theta}]u(\theta),\quad \theta=t-1.
$$
`,
  r`零状态时取初态0，系统h=e⁻²ᵗu的整体输入延迟1秒；响应从t=1起。直接积分∫₁ᵗe⁻²⁽ᵗ⁻τ⁾sin[2(τ−1)]dτ得到公式。括号在θ=0的值为0，故开通不跳变。延迟项既影响正弦初相，也必须影响门的支撑。`,
  {note:joint}),
 p('三1(2b)',['2.2','2.1'],'ode-s-solve',delayed+'求零输入响应。',
  r`$y_{zi}(t)=e^{-2t}u(t)$，表示t≥0部分。`,
  r`置输入为0，齐次方程y′+2y=0与给定初态1得到e⁻²ᵗ。延迟发生在输入支路，不会把初态响应推迟到t=1。没有另给原点冲激，y(0⁺)=y(0⁻)=1；这里乘u只表示求出的正时间部分，不把过去原状态改成0。`,
  {note:joint}),
 p('三1(3a)',['2.1','2.2'],'full-response-decomp',delayed+'求暂态响应，并说明延迟开通前后。',
  r`可将正时间分量写为
$$
y_{tr}(t)=e^{-2t}u(t)+\frac14e^{-2(t-1)}u(t-1).
$$
因此0≤t<1为e⁻²ᵗ；t≥1为$(1+e^2/4)e^{-2t}$，随时间衰减至0。`,
  r`完全响应的两个指数项属于暂态，不等于只有零输入项。延迟零状态响应中的e⁻²⁽ᵗ⁻¹⁾/4也属于暂态。若把两个分量各自按u(t−1)开通，暂态在1时增加1/4，稳态在1时减少1/4，跳变互相抵消；实际完全响应保持连续。`,
  {note:joint}),
 p('三1(3b)',['2.1','3.7'],'full-response-decomp',delayed+'求稳态响应，注明有效时段与相位。',
  r`按实际开通截取的分量为
$$
y_{ss}(t)=\frac14[\sin(2(t-1))-\cos(2(t-1))]u(t-1).
$$
t≥1时也可写$(\sqrt2/4)\sin(2t-2-\pi/4)$。充分长时间后完全响应逼近这一正弦。`,
  r`H(j2)=e⁻ʲ²/(2+j2)，模为1/(2√2)=√2/4，相位−2−π/4，和时域式一致。稳态正弦不含任何指数衰减项；延迟1秒在角频率2 rad/s下带来相位−2弧度，不能误写成−1弧度或−2°。上述门只说明实际分段的分量分解，单独分量在1时的跳变不是完全响应的跳变。`,
  {note:joint}),

 same('三2(1)','tk-exam-01-32-1','第92页y+3y[-1]+2y[-2]=f、y[−1]=−2/y[−2]=3及阶跃输入与课程01三2同题，保持三个响应同一作答单元，不拆改旧编号。'+joint),
 same('三2(2)','tk-exam-01-32-2','第92页H和单位样值响应与课程01三2同题，保留因果ROC|z|>2及−1/−2极点，不把单位圆极点说成圆外。'+joint),
 same('三2(3)','tk-exam-01-32-3','第93页最上方的第三问改输入为u(k)−u(k−5)，与课程01三2第三问同条件；延迟阶跃门和旧分组保持，不漏这一续页问。'+joint),
];

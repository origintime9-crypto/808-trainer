import type { Problem } from '../../types';
import { problem as make } from './helper';
import { zt2023 } from './zt2023';
const paper = 'tk-exam-13';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make(paper, ...args);
const r = String.raw;
const score = (no: string, value: number): Partial<Problem> => ({ sources: [{ paper, no, score: value }] });
const fill = (no: string): Partial<Problem> => ({ ...score(no, 3), type: '填空' });
const pic = (no: string) => ({ figures: ['figures/tk-exam-13/q'+no+'.png'] });
const calcSplit = '原卷本计算题共10分，未给拆问分值，不擅自平分。';
const joint = '原卷本综合题共10分，未给小问分值，作答单元不虚分。';
const single = r`求单边正弦/余弦的广义FT。已知sinω₀t、cosω₀t及u(t)的广义FT，ω₀>0；单边指乘u(t)。`;
const hd = r`给定离散系统函数$H(z)=z/(z-1/2)$，原题没有给因果性或ROC。`;
const ode = r`$y''+3y'+2y=f'+2f$。按因果零状态系统解释求单位冲激响应及输入$f(t)=e^{-3t}u(t)$的响应。`;
const discrete = r`图A-3的因果离散系统，两个加法器均相加：q[k]=x[k]+(p/3)q[k−1]，y[k]=q[k]+(p/4)q[k−1]，p为固定实参数。`;
const zp = r`图A-4的因果连续LTI系统，零点+3、极点−2±j，H(0)=−1.2。`;
function sameFill(no: string, id: string, note: string): Problem {
  const old = zt2023.find(item => item.id === id);
  if (!old?.pattern) throw new Error('同题模板不存在：'+id);
  return p(no, [...old.kps], old.pattern, old.stem, old.answer, old.solution, { ...fill(no), verified: old.verified, note });
}

export const tkExam13: Problem[] = [
  p('一(1)', ['3.3', '3.4'], 'ft-basic', r`原印式是$e^{-(2+j5)}u(t)$，指数内没有t，求其FT；同时说明若原题漏印t的解释。`, r`按字面是常数c=e⁻²⁻ʲ⁵乘阶跃，广义FT为$c[\pi\delta(\omega)+\operatorname{PV}1/(j\omega)]$。若另假定漏印t，改为$e^{-(2+j5)t}u(t)$，普通FT为$1/[2+j(\omega+5)]$。`, r`先辨清常数指数与衰减信号：印式只有u(t)随时间变化，所以使用阶跃的广义变换。补t版本的定义积分为$\int_0^\infty e^{-[2+j(5+\omega)]t}dt$，实部2>0，才得到第二个普通FT；两题不是同一个信号。`, { ...fill('一(1)'), verified: 'uncertain', note: '第58页放大后确认指数在右括号后直接接u(t)，没有t。保留原印式，不用常见题型推测替换题面；补t仅作为漏印的条件版本。' }),
  p('一(2)', ['4.1', '4.3', '2.4'], 'laplace-calc', r`$f(t)=\int_0^t\lambda h(t-\lambda)d\lambda$。按单边拉氏变换，或h因果且f作零延拓，求F(s)，H(s)为相应h的变换。`, r`$F(s)=H(s)/s^2$，在相应积分共同收敛的域内。`, r`λ不是无关的常系数，λu(λ)是斜坡。正时间卷积f=(tu)*h，斜坡变换1/s²，与H相乘。若改按任意非因果全时域双边解释，原0到t积分不能无条件换成整轴卷积；这里明确使用单边或因果约定。`, { ...fill('一(2)'), note: '第58页积分下限确实是0，上限t；单边变换口径已写明，没有偷改为从−∞积分。' }),
  p('一(3)', ['1.5', '3.4'], 'ft-property', r`图A-1：f₁在0<t<t₀/2为2、t₀/2<t<t₀为1；f₂两段幅度顺序为1、2，带外均0，t₀>0。已知f₁的FT为F₁(jω)，求f₂的FT。`, r`$F_2(j\omega)=e^{-j\omega t_0}F_1(-j\omega)$。也可写成$3t_0\operatorname{Sa}(\omega t_0/2)e^{-j\omega t_0/2}-F_1(j\omega)$。`, r`原两脉冲满足f₂(t)=f₁(t₀−t)，先反转再右移t₀，得到相位因子。另一关系f₁+f₂=3[u(t)−u(t−t₀)]给互补式；ω=0时两脉冲面积均为3t₀/2，回查符号。`, { ...fill('一(3)'), ...pic('1-3') }),
  p('一(4)', ['7.1', '7.2'], 'z-calc', r`双边序列x[k]=2ᵏ（k≥0）、3ᵏ（k<0）。求双边Z变换及ROC；原印式分段条件用n，统一表示同一时间下标k。`, r`$X(z)=z/(z-2)-z/(z-3)=-z/[(z-2)(z-3)]$，ROC为2<|z|<3。`, r`右边指数求和得1/(1−2/z)，需|z|>2。左边令k=−m、m≥1，求和Σ(z/3)ᵐ=z/(3−z)，需|z|<3。两项相加并取收敛域交集，不能选成|z|>3。`, fill('一(4)')),
  p('一(5)', ['6.1', '1.2'], 'period', r`求x[k]=cos(kπ/2)的基波周期。`, 'N₀=4。', r`需(π/2)N=2πm，所以最小正整数N=4。序列1、0、−1、0循环；1、2、3拍都不能使首项恢复。`, fill('一(5)')),
  p('一(6)', ['1.4'], 'delta-sift', r`计算$\int_{-\infty}^{\infty}\delta(1-t)(t^2+4)dt$。`, '5。', r`δ(1−t)=δ(t−1)，尺度模为1，没有负号。冲激位置t=1在积分域内，筛选得到1²+4=5。`, fill('一(6)')),
  p('一(7)', ['2.2'], 'full-response-decomp', r`系统y′+2y=2f，y(0⁻)=4/3、f=u(t)，完全响应y(t)=1+(1/3)e⁻²ᵗ（t≥0）。其中(1/3)e⁻²ᵗ属于哪类响应？区分零输入与自由、暂态部分。`, '属于自由响应，也属于暂态响应；它不是整个零输入响应。', r`零输入为(4/3)e⁻²ᵗ，零状态为1−e⁻²ᵗ。两部分中的同根指数相加才得到(1/3)e⁻²ᵗ，它的形式由系统特征根−2决定且随时间衰减，所以是自由/暂态部分。剩下常数1是强迫/稳态部分。`, fill('一(7)')),
  p('一(8)', ['3.3'], 'ft-basic', r`已知F(jω)=u(ω+ω₀)−u(ω−ω₀)，ω₀>0，求f(t)；边缘单点不影响普通频谱反演。`, r`$f(t)=\sin(\omega_0t)/(\pi t)$，t=0取ω₀/π。`, r`原谱在−ω₀..ω₀为1。逆变换$\frac1{2\pi}\int_{-\omega_0}^{\omega_0}e^{j\omega t}d\omega$给所示Sa形式；不能漏掉1/π，也不将频域阶跃误当成时域阶跃。`, fill('一(8)')),
  sameFill('一(9)', 'zt2023-1-6', '第59页e⁻²ᵗu(t)的拉氏变换和ROC，与2023一6完全同题，合并旧编号，并保留本卷3分来源。'),
  p('一(10)', ['4.6', '4.5'], 'concept', '给定有理系统函数H(s)，哪些因素决定单位冲激响应h(t)的函数形式？说明极点与ROC的分工。', '实际极点的位置和重数决定指数、振荡及多项式因子的形式；双边反变换还需ROC决定左边/右边。零点等影响各项系数。', r`极点p及重数m给tᵐ⁻¹eᵖᵗ等基本项，共轭对合成正弦/余弦。以实际约消后的极点为准；同一1/(s−p)在右边ROC为eᵖᵗu(t)，在左边ROC为−eᵖᵗu(−t)。若H有多项式直接项，还可能包含原点δ及其导数。不能仅凭无ROC的有理式认定唯一h。`, fill('一(10)')),
  p('二(1)', ['3.4'], 'ft-property', r`f(t)的FT为F(jω)，求tf(2t)的FT。假定缩放、频域求导运算存在。`, r`$\mathcal F\{tf(2t)\}=\frac j4 F'(\omega/2)$，这里F′表示F关于其实频率自变量的导数。`, r`先压缩得f(2t)↔F(jω/2)/2，再用乘t对应j·d/dω。链式法则另产生1/2，所以总系数j/4；不能只保留一个1/2。`, score('二(1)', 10)),
  p('二2(1)', ['3.3', '3.4'], 'ft-property', single+'求sin(ω₀t)u(t)的FT。', r`令$Q(\nu)=\pi\delta(\nu)+\operatorname{PV}1/(j\nu)$，则$F=[Q(\omega-\omega_0)-Q(\omega+\omega_0)]/(2j)$。`, r`把单边正弦写成(eʲω₀ᵗu−e⁻ʲω₀ᵗu)/(2j)，对每一项作频移。谱中同时有PV项及±ω₀的冲激，不能只写ω₀/(ω₀²−ω²)。以e⁻ᵃᵗ正则化时，普通FT为ω₀/[(a+jω)²+ω₀²]；a→0⁺得到所示分布。`, { note: calcSplit }),
  p('二2(2)', ['3.3', '3.4'], 'ft-property', single+'求cos(ω₀t)u(t)的FT。', r`令$Q(\nu)=\pi\delta(\nu)+\operatorname{PV}1/(j\nu)$，则$F=[Q(\omega-\omega_0)+Q(\omega+\omega_0)]/2$。`, r`正负两个调制项相加，两个冲激各为π/2。以e⁻ᵃᵗ正则化，普通FT为(a+jω)/[(a+jω)²+ω₀²]；a→0⁺时仍须保留两个冲激及PV项。ω₀=0的退化版本回到u(t)的广义FT。`, { note: calcSplit }),
  p('二(3)', ['1.5', '1.4'], 'waveform', r`图A-2给g(t)=f(−2t+1)：左斜边在−1/2..0由0降到未单独标高的负峰，右斜边在0..1/2由1降到0；t=1另有强度2的冲激。负峰模记A>0，画f(t)，并说明按原图等高读A=1的版本。`, r`冲激项为$4\delta(t+1)$，普通部分为
$$
f_{reg}(t)=\begin{cases}t&0<t<1\\ A(t-2)&1<t<2\\0&\text{其他}.\end{cases}
$$

![负峰取A等于1的条件示意](figures/tk-exam-13/a2-3.svg)`, r`反解f(t)=g[(1−t)/2]，原节点−1/2、0、1/2反向映到2、1、0。右正斜边先成为0..1的上升t，左负斜边成为1..2的A(t−2)。冲激从g的t=1移到f的t=−1，且$2\delta[(1-t)/2-1]=4\delta(t+1)$，不能把原强度2当作普通峰高，也不能遗漏反尺度的2。`, { ...score('二(3)', 10), ...pic('2-3'), type: '画图', verified: 'uncertain', note: '第59页负斜边未独立标幅度数值；按与正峰1等高的线性刻度可读A=1，答案图明确采用此条件。参数化式保留缺标幅值的解释，跳点单值按原图约定不另编造。' }),
  p('二4(1)', ['7.7', '7.8'], 'discrete-diagram', hd+'画零极点图。', r`有限零点z=0，极点z=1/2。

![零点0极点二分之一](figures/tk-exam-13/a2-4-1.svg)`, r`不可约分子z给一个原点零点，分母给一个正实极点1/2。右边ROC |z|>1/2与左边ROC |z|<1/2都可对应同一有理式，ROC不能由点图单独决定。`, { type: '画图', note: calcSplit }),
  p('二4(2)', ['7.5', '7.7'], 'discrete-diagram', hd+'大致画幅度频率响应，并判断低通、高通还是全通；说明所取条件。', r`在右边ROC、因果稳定实现或普通DTFT存在的条件下，$|H(e^{j\Omega})|=1/\sqrt{5/4-\cos\Omega}$，为低通。DC增益2，±π增益2/3。

![注明ROC条件的低通幅度](figures/tk-exam-13/a2-4-2.svg)`, r`单位圆形式代入给H=1/(1−e⁻ʲΩ/2)，实际右边ROC包含单位圆，才有普通DTFT。幅度为偶函数且2π周期，在0..π单调下降，不是全通。另一左边ROC |z|<1/2不含单位圆，左边核不趋0，普通DTFT不存在，不能无条件把该代数图当作它的频响。`, { type: '画图', verified: 'uncertain', note: '第59页仅给有理H(z)，没有因果性或ROC；此处图示采用普通频响存在的唯一可行ROC，另外的存在性区别已写明。'+calcSplit }),
  p('二5(1)', ['2.3', '4.6'], 'ode-s-solve', ode+'求h(t)。', r`零状态$H(s)=(s+2)/[(s+1)(s+2)]=1/(s+1)$，因果ROC为Re s>−1，$h(t)=e^{-t}u(t)$。`, r`输入导数带来分子s+2，和分母的一项约消。单位冲激响应按零初态解释，只含剩下的传输极点−1；但原二阶方程的任意非零初态还可能有−2自由模，不能用零状态约消抹掉初态。`, { note: calcSplit }),
  p('二5(2)', ['2.4', '2.2'], 'conv-integral', ode+'用时域卷积求y_zs(t)。', r`$y_{zs}(t)=\tfrac12(e^{-t}-e^{-3t})u(t)$。`, r`取$\int_0^t e^{-\tau}e^{-3(t-\tau)}d\tau$，积分后得到两指数差除2。y_zs(0⁺)=0、y_zs′(0⁺)=1，输入f′含原点冲激，这一右导数不能设成0。正时间代原二阶方程得到−e⁻³ᵗ，与f′+2f一致。`, { note: calcSplit }),
  p('三1(1)', ['7.7'], 'discrete-diagram', discrete+'求H(z)。', r`$H(z)=(1+pz^{-1}/4)/(1-pz^{-1}/3)=(z+p/4)/(z-p/3)$。p=0时约消为1。`, r`前一加法器得到Q=X+(p/3)z⁻¹Q，后一得到Y=(1+pz⁻¹/4)Q。两项增益都接相加入口，不把反馈误改为负号。`, { ...pic('3-1'), note: joint }),
  p('三1(2)', ['7.8', '7.7'], 'discrete-diagram', discrete+'画零极点图，说明参数0。', r`p≠0时，零点−p/4、极点p/3，均在实轴；p=0时相消，实际H=1，无有限传输零极点。

![参数为正时零极点的相对位置](figures/tk-exam-13/a3-1-2.svg)`, r`不可约分子分母给出两个位置，p<0时相对原点换向。不能在p=0时仍画一个“实际极点0”并据此判断系统阶数。图仅示意p>0的方向，具体距离由p决定。`, { ...pic('3-1'), type: '画图', note: joint }),
  p('三1(3)', ['7.7', '7.8'], 'discrete-diagram', discrete+'求BIBO稳定的p范围。', r`$-3<p<3$，包括p=0。`, r`$h[k]=\delta[k]+(7p/12)(p/3)^{k-1}u[k-1]$。p≠0的几何尾部绝对可和当且仅当|p/3|<1；p=±3尾项不趋0。p=0时h=δ，稳定，不因零极点相消而漏掉这一值。`, { ...pic('3-1'), note: joint }),
  p('三1(4)', ['7.6', '6.4'], 'diff-eq-solve', discrete+'p=1、x[k]=(2/3)ᵏu[k]，求零状态响应。', r`$y[k]=[(11/4)(2/3)^k-(7/4)(1/3)^k]u[k]$，首样本1。`, r`$Y=(1+q/4)/[(1-q/3)(1-2q/3)]$，其中q=z⁻¹。部分分式系数11/4、−7/4，逐点满足y[k]−y[k−1]/3=x[k]+x[k−1]/4。`, { ...pic('3-1'), note: joint }),
  p('三2(1)', ['4.6', '2.3'], 'zp-h0', zp+'求H(s)与h(t)。', r`$H(s)=2(s-3)/(s^2+4s+5)$，因果ROC为Re s>−2。
$h(t)=e^{-2t}(2\cos t-10\sin t)u(t)$。`, r`先写K(s−3)/[(s+2)²+1]，代s=0得−3K/5=−1.2，所以K=2。把s−3写成(s+2)−5，用衰减余弦和正弦对得到h；h(0⁺)=2可回查，负DC不表示K必须为负。`, { ...pic('3-2'), note: joint }),
  p('三2(2)', ['4.6', '2.1'], 'ode-s-solve', zp+'写关联输入输出的微分方程。', r`$y''+4y'+5y=2f'-6f$。`, r`由(s²+4s+5)Y=(2s−6)F反映到时域，必须保留输入导数项2f′与常数系数−6。该式先按系统零状态关系求得，若求某次完全响应还需初态。`, { ...pic('3-2'), note: joint }),
  p('三2(3)', ['4.4', '3.7'], 'sine-steady', zp+'已知系统稳定，求H(jω)及激励cos(3t)u(t)的正弦稳态响应。', r`$H(j\omega)=2(j\omega-3)/(5-\omega^2+4j\omega)$；$H(j3)=3/5+3j/10$。
$y_{ss}(t)=(3/5)\cos3t-(3/10)\sin3t$，也可写成$\frac{3\sqrt5}{10}\cos[3t+\arctan(1/2)]$。`, r`因果极点−2±j在左半平面，ROC包含虚轴，暂态衰减。频率3代入后实部3/5、虚部3/10，取Re[H(j3)eʲ³ᵗ]时正的虚部给负正弦项。这里是t→∞的稳态表达式，不是含接通暂态的整个零状态响应。`, { ...pic('3-2'), note: joint }),
];

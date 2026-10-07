import type { Problem } from '../../types';
import { problem as make } from './helper';
import { tkExam01 } from './tk-exam-01';
import { tkExam06 } from './tk-exam-06';
import { tkExam14 } from './tk-exam-14';
import { tkExam15 } from './tk-exam-15';
import { tkExam17 } from './tk-exam-17';
import { tkExam20 } from './tk-exam-20';
const paper = 'tk-exam-21';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make(paper, ...args);
const r = String.raw;
const score = (no: string, value: number): Partial<Problem> => ({ sources: [{ paper, no, score: value }] });
const fill = (no: string): Partial<Problem> => ({ ...score(no, 3), type: '填空' });
const pic = (no: string) => ({ figures: ['figures/tk-exam-21/q'+no+'.png'] });
const calcSplit = '原卷本计算题共10分，未给拆问分值，不擅自平分。本卷未附参考解。';
const joint = '原卷本综合题共10分，未给小问分值，各作答单元不虚分。本卷未附参考解。';
const original = [...tkExam01, ...tkExam06, ...tkExam14, ...tkExam15, ...tkExam17, ...tkExam20];
function same(no: string, id: string, note: string, extra: Partial<Problem> = {}): Problem {
  const old = original.find(item => item.id === id);
  if (!old?.pattern) throw new Error('同题模板不存在：'+id);
  return p(no, [...old.kps], old.pattern, old.stem, old.answer, old.solution, {
    type: old.type, figures: old.figures, ...extra, verified: old.verified, note,
  });
}
const ode = r`因果连续LTI系统满足$y''+7y'+10y=2f''+f$，输入$f(t)=e^{-t}u(t)$，左初态$y(0^-)=4,y'(0^-)=-3$。在s域求解，所写u只表示t≥0的响应部分。`;
const composite = r`图A-1：先经$h_1(t)=\frac{d}{dt}[\sin(2t)/(2\pi t)]$，其输出分为正旁路和负的H₂支路，在加法器相减，再依次经h₃、h₄。$H_2(j\omega)=e^{-j\pi\omega}$、$h_3(t)=u(t)$、$h_4(t)=\sin(6t)/(\pi t)$。按图中的负号及全时间零状态卷积。`;

export const tkExam21: Problem[] = [
  same('一(1)', 'tk-exam-15-1-2', '第75页阶跃响应(1−e⁻²ᵗ)u(t)求h，与课程15一2同题，独立核对起点δ抵消并合并来源；本卷无附解。', fill('一(1)')),
  same('一(2)', 'tk-exam-15-1-4', '第75页3t[u(t)−u(t−1)]求F(0)，与课程15一4同题；有限窗面积3/2，保留本卷3分来源。', fill('一(2)')),
  same('一(3)', 'tk-exam-17-1-10', '第75页周期信号的DC、三谐波及45°/60°/75°相位均与课程17一10完全相同，合并旧编号并复用双口径幅度图。由本卷原信号定义积分独立核对C₀=1、C₁=e⁻ʲπ/4、C₃=eʲπ/3/4、C₅=e⁻ʲ⁵π/12/8；FT冲激权值另乘2π。', fill('一(3)')),
  same('一(4)', 'tk-exam-15-1-7', '第75页是Sa(100t)，没有平方，与课程15一7同题；角抽样率200 rad/s、Hz抽样率100/π、间隔π/100 s。', fill('一(4)')),
  same('一(5)', 'tk-exam-14-1-3', '第75页任意序列的单位样值展开与课程14一3同题，逐点筛选复核，合并旧编号。', fill('一(5)')),
  same('一(6)', 'tk-exam-14-1-4', '第75页X(s)的延时分子、s(s²+4)分母及初终值要求与课程14一4同题；持续振荡无终值，复用已核对波形。本卷没有参考解。', fill('一(6)')),
  same('一(7)', 'tk-exam-14-1-5', '第75页y[k]=x[k]+2x[k−1]求逆系统，与课程14一5同题；因果逆不稳定，稳定逆为反因果，合并来源。', fill('一(7)')),
  same('一(8)', 'tk-exam-14-1-8', '第75页三项稀疏延时的系数与下标均和课程14一8相同，按定义Z变换复算并合并旧编号。', fill('一(8)')),
  same('一(9)', 'tk-exam-14-1-9', '第75页离散系统模拟的三类部件与课程14一9同题，合并来源，不换成连续积分器。', fill('一(9)')),
  same('一(10)', 'tk-exam-06-1-6', '第75页要求一般离散LTI稳定的充要条件，与课程06一6同题。结论是核绝对可和；旧参考解的因果条件勘误仍仅指课程06，本卷未附解。', fill('一(10)')),

  p('二1(1)', ['2.3', '1.5'], 'conv-integral', r`连续LTI系统的阶跃响应$g(t)=u(t)-u(t-2)$，求冲激响应h(t)。`, r`$h(t)=\delta(t)-\delta(t-2)$。`, r`阶跃响应分布求导，每个跳点产生对应权值的冲激。t=0为+1，t=2为−1；不是把两个阶跃之间的普通值1当作冲激响应。积分h从负无穷至t还原原g。`, { note: calcSplit }),
  p('二1(2)', ['2.4', '1.4', '1.7'], 'conv-integral', r`连续LTI系统$g(t)=u(t)-u(t-2)$，输入$f(t)=\int_{t-5}^{t-1}\delta(\tau)d\tau$。求零状态响应并画波形，保留原积分的移动上下限。`, r`$f(t)=u(t-1)-u(t-5)$。
$$y_{zs}(t)=u(t-1)-u(t-3)-u(t-5)+u(t-7).$$
1<t<3为+1，5<t<7为−1，其他非端点时刻为0。

![正负两个分离的矩形平台](figures/tk-exam-21/a2-1.svg)`, r`积分区间包含τ=0的条件是t−5<0<t−1，即1<t<5。h=δ(t)−δ(t−2)，所以y=f(t)−f(t−2)。先得到原输入宽4的窗，再延时相减，重合的3<t<5区间抵消。t=1、3、5、7处按所用u(0)约定取值，图用开圈标明不强设端点；原图的t−5下限不能换成常数−5。`, { ...pic('2-1'), note: calcSplit }),
  p('二2(1)', ['3.3', '3.4'], 'ft-property', r`求$x(t)=4t/(t^2+1)^2$的傅里叶变换，约定$X(j\omega)=\int_{-\infty}^{\infty}x(t)e^{-j\omega t}dt$。`, r`$X(j\omega)=-j2\pi\omega e^{-|\omega|}$。`, r`基本对为1/(1+t²)↔πe⁻|ω|。原x=−2d[1/(1+t²)]/dt，微分对应jω，因此X=−j2πωe⁻|ω|。x为实奇函数，谱纯虚且奇；∫|x|dt=4，所以普通FT确实存在。再分别对正负频率积分反演，独立还原4t/(1+t²)²，检查负号与2π常数。`, { note: calcSplit }),
  p('二2(2)', ['3.3', '3.4', '1.5'], 'ft-basic', r`求$x(t)=|t|$的傅里叶变换，区分普通积分和广义分布，使用核e⁻ʲωᵗ。`, r`普通FT积分不收敛。按Abel极限的温和分布变换：
$$X=-2\operatorname{Fp}\frac1{\omega^2}=\lim_{a\downarrow0}\frac{2(a^2-\omega^2)}{(a^2+\omega^2)^2}.$$
Fp表示下述固定有限部；在ω≠0处可写−2/ω²，不能将它当作包含原点的普通函数。`, r`先给|t|乘e⁻ᵃ|t|（a>0），从定义积分得到Xₐ=2(a²−ω²)/(a²+ω²)²，再取分布极限。固定约定为
$$\left\langle\operatorname{Fp}\frac1{\omega^2},\varphi\right\rangle=\lim_{\epsilon\downarrow0}\left[\int_{|\omega|>\epsilon}\frac{\varphi(\omega)}{\omega^2}d\omega-\frac{2\varphi(0)}\epsilon\right].$$
D²|t|=2δ给−ω²X=2；该方程单独并不能排除原点δ、δ′项，本题用Abel约定固定答案。以φ=e⁻ᶜω²检查，Fp的作用是−2√(πc)，负2倍为4√(πc)，与阻尼谱极限一致。直接写普通−2/ω²会丢掉原点处的分布含义。`, { note: calcSplit }),
  p('二(3)', ['6.2', '6.3', '7.3'], 'conv-sum', r`某离散因果LTI系统的单位阶跃响应为s[k]。输入x[k]产生$y[k]=\sum_{i=0}^ks[i]$（k≥0），求x[k]；说明题面是否足以确定唯一输入。`, r`一个适用的因果零状态输入是$x[k]=(k+1)u[k]$。

若系统非零且输入限定因果，该输入唯一；原题没有明确输入限制，不能无条件断言一般双边输入也唯一。`, r`s=h*u，累计s又卷积一个u，因此y=s*u=h*(u*u)，而(u*u)[k]=Σ₀ᵏ1=k+1，得到所列斜坡。累计的是阶跃响应，并非冲激响应，填u[k]会少累计一层：h=δ时s=u，y=k+1立刻反证。非零因果h在其首个非零下标起可逐点解出因果输入。若允许双边输入，取因果差分器h=δ[k]−δ[k−1]，斜坡与斜坡加任意全时间常数给同一y；若系统为零，任何输入也都可行。`, { ...score('二(3)', 10), verified: 'uncertain', note: '第75页只说系统因果，未说明输入因果或系统非零。斜坡是可核对的构造解；唯一性须另加条件。本卷无参考解，保留缺少条件的提示并从自动组卷排除。' }),
  same('二4(a)', 'tk-exam-20-31-a', '第75–76页阶跃条件与全时间cosπk零输出、确定a的要求和课程20三1(a)同题；本卷作为计算四，共10分，无拆问分值。', { note: calcSplit }),
  same('二4(b)', 'tk-exam-20-31-b', '第76页求H(z)、零极点和ROC，与课程20三1(b)同题，复用已核对图；本卷计算四的小问无单独分值。', { note: calcSplit }),
  same('二4(c)', 'tk-exam-20-31-c', '第76页同一阶跃条件求差分式，与课程20三1(c)同题；课程21没有框图或双边输入的(d)/(e)问，不扩充来源。', { note: calcSplit }),
  p('二5(1)', ['4.6', '4.3', '1.5'], 'laplace-calc', ode+'求系统函数及单位冲激响应。', r`$H(s)=(2s^2+1)/[(s+2)(s+5)]$，因果ROC Re s>−2。
$$h(t)=2\delta(t)+(3e^{-2t}-17e^{-5t})u(t).$$`, r`零状态输入输出比由原方程给出，注意输入是二阶导数2f″。先长除得到H=2+3/(s+2)−17/(s+5)，常数2必须变成2δ直通。两个实际极点−2、−5，均不约消；核普通部分绝对可积，有限冲激权值也允许BIBO稳定。不能套课程01中2f′+3f的旧函数。`, { note: calcSplit }),
  p('二5(2zi)', ['4.5', '2.1', '2.2'], 'ode-s-solve', ode+'求零输入响应。', r`$y_{zi}(t)=[(17/3)e^{-2t}-(5/3)e^{-5t}]u(t)$，表示t≥0部分。`, r`输入设零，单边变换的初态项为(s+7)·4−3=4s+25，所以Y_zi=(4s+25)/[(s+2)(s+5)]。拆分成(17/3)/(s+2)−(5/3)/(s+5)。右值4、普通右导数−3，齐次微分方程残差为0；记录时乘u不意味着本题原左初态消失。`, { note: calcSplit }),
  p('二5(2zs)', ['4.5', '2.2', '1.5'], 'ode-s-solve', ode+'求零状态响应，检查输入在原点的奇异项。', r`$y_{zs}(t)=[(3/4)e^{-t}-3e^{-2t}+(17/4)e^{-5t}]u(t)$。

普通右值2、右导数−16；因此全响应右值6、右导数−19。`, r`F=1/(s+1)，Y_zs=HF，部分分式系数3/4、−3、17/4。独立按h*f卷积，包含直接项2e⁻ᵗu，得到同式。f″=e⁻ᵗu−δ+δ′，原右端有2δ′−2δ；匹配输出分布给Δy=2、Δy′+7Δy=−2，即Δy′=−16。左初态4、−3加这两个跳变才是完全响应的右初值，不能把零状态右值强设为0。`, { note: calcSplit }),

  p('三1(1)', ['3.9', '3.3', '3.4', '2.4'], 'filter-output', composite+'求复合系统H(jω)和h(t)。', r`$$H(j\omega)=\begin{cases}(1-e^{-j\pi\omega})/2&|\omega|<2\\0&|\omega|\ge2.\end{cases}$$
$$h(t)=\frac{\sin2t}{2\pi t}-\frac{\sin2(t-\pi)}{2\pi(t-\pi)}.$$
可去点h(0)=1/π、h(π)=−1/π。

![复合频响的幅度与相位，零幅度处相位不定义](figures/tk-exam-21/a3-1.svg)`, r`令g=sin2t/(2πt)，其FT为半增益矩形G。h₁=g′；原图相减贡献1−e⁻ʲπω，h₃积分消去微分，h₄通带±6覆盖前级±2，故H=G(1−e⁻ʲπω)。先在时域对[g′(t)−g′(t−π)]从负无穷积分，g在负无穷趋0，得到g(t)−g(t−π)，免去把积分器在ω=0硬除零的错误；整体DC为0且无附加δ谱线。h还可写−sin2t/[2t(t−π)]，尾部O(1/t²)、两奇点可去，核绝对可积，整体普通频响存在。通带幅度|sin(πω/2)|，正半带相位π/2−πω/2，负半带−π/2−πω/2；ω=0及±2幅度0，相位不定义。`, { ...pic('3-1'), note: joint }),
  p('三1(2)', ['3.9', '3.8'], 'filter-output', composite+r` 输入$f(t)=\sin4t+\cos t$，求零状态输出。`, r`$y_{zs}(t)=\cos t$。`, r`ω=±4位于复合通带之外，sin4t被滤除。ω=±1的H均为(1−e⁻ʲπ)/2=1，cos t保持幅度和相位。原输入是全时间周期信号，没有乘u(t)，不额外加入开通暂态；这里的零状态为原题全时间卷积输出。`, { ...pic('3-1'), note: joint }),
  p('三1(3)', ['1.2', '3.2'], 'concept', composite+r` 输入$f(t)=\sin4t+\cos t$，求零状态输出的平均功率。`, r`$P_y=1/2$。`, r`已由复合频响得到y=cos t。在共同周期2π上积分P=(1/2π)∫₀²πcos²t dt=1/2。不能直接用输入的两频率功率相加，因为sin4t已在系统输出中消失。`, { ...pic('3-1'), note: joint }),
  same('三2(1)', 'tk-exam-01-32-1', '第76页三2的差分系数、左初态和阶跃输入，以及ZI/ZS/完全响应的联合要求，均与课程01三2(1)同题。本卷未附参考解，旧系数勘误只指课程01；原综合题共10分，无小问分值。'),
  same('三2(2)', 'tk-exam-01-32-2', '第76页同一差分系统求H(z)、h[k]与课程01三2(2)同题；因果ROC |z|>2，核增长，合并旧编号，无拆问分值。'),
  same('三2(3)', 'tk-exam-01-32-3', '第76页改用u[k]−u[k−5]重求前两问，与课程01三2(3)同题；不增加ZI/ZS等额外来源。旧附解勘误仅指课程01，本卷未附解。'),
];

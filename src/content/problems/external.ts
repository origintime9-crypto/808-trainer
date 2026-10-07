import type { Problem, ProblemType } from '../../types';

const NOTE = '题面来自用户提供的第三方真题整理卷，年份和科目代码依文件封面登记；所选题未标分值。参考解答独立求解，模拟卷分值另按中北模板设置。';
function q(paper: string, id: string, no: string, type: ProblemType, kps: string[], pattern: string, minutes: number, stem: string, answer: string, solution: string, figures?: string[]): Problem {
  return { id: `${paper}-${id}`, sources: [{ paper, no }], type, kps, pattern, minutes, stem, answer, solution, verified: 'checked', note: NOTE, ...(figures ? { figures } : {}) };
}
const X = 'ext-xaut2024', S = 'ext-sau2024', V = 'ext-sxu2024';

export const xaut2024: Problem[] = [
  q(X, '1-1', '一1', '计算', ['1.4'], 'delta-sift', 6,
    String.raw`计算 $\displaystyle\int_{-\infty}^{t}(1-x)\delta'(x)\,dx$。`,
    String.raw`分布意义下为 $u(t)+\delta(t)$；离开原点，$t<0$ 时为 $0$，$t>0$ 时为 $1$。`,
    String.raw`利用 $x\delta'(x)=-\delta(x)$，有 $(1-x)\delta'(x)=\delta'(x)+\delta(x)$。从 $-\infty$ 积分到 $t$ 后得到 $\delta(t)+u(t)$。

$t=0$ 处不能把冲激当作普通函数取值。`),
  q(X, '1-2', '一2', '分析', ['1.2'], 'period', 3,
    String.raw`判断 $f(t)=\cos(\pi t)u(t)$ 是否为周期信号。`,
    String.raw`非周期。`,
    String.raw`虽然 $\cos(\pi t)$ 的周期为 $2$，乘 $u(t)$ 后负半轴恒为零。任取候选周期 $T>0$，令 $m$ 足够大使 $-mT<0$，周期性应推出 $f(0^+)=f(-mT)=0$，与 $f(0^+)=1$ 矛盾。也可比较门控边界附近的波形。`),
  q(X, '1-3', '一3', '计算', ['2.4', '1.4'], 'conv-integral', 8,
    String.raw`已知 $f_1(t)=tu(t)$、$f_2(t)=u(t)-u(t-2)$，求 $y(t)=f_1(t)*f_2(t)*\delta'(t-2)$。`,
    String.raw`$y(t)=(t-2)u(t-2)-(t-4)u(t-4)$。`,
    String.raw`令 $R(t)=tu(t)$。先求 $f_1*f_2=\frac12t^2u(t)-\frac12(t-2)^2u(t-2)$。与 $\delta'(t-2)$ 卷积等于先微分再延时 $2$，故得到 $R(t-2)-R(t-4)$：$t<2$ 为零，$2\le t<4$ 为 $t-2$，$t\ge4$ 为 $2$。没有额外冲激，因为原函数在两处边界连续。`),
  q(X, '1-4', '一4', '计算', ['6.2'], 'conv-sum', 5,
    String.raw`已知 $f(k)=u(k)$、$h(k)=u(k)-u(k-5)$，求零状态响应 $y_{zs}(k)$。`,
    String.raw`$(k+1)u(k)-(k-4)u(k-5)$。`,
    String.raw`$h(k)$ 在 $k=0,1,2,3,4$ 各为 $1$。于是 $y_{zs}(k)=\sum_{m=0}^4u(k-m)$，在 $k=0,1,2,3$ 依次为 $1,2,3,4$，$k\ge4$ 为 $5$，负下标为零。计数时包含 $k=0$ 项。`),
  q(X, '1-5', '一5', '计算', ['3.3', '3.9'], 'ft-basic', 5,
    String.raw`求 $f(t)=\dfrac{\sin(2\pi t)}{\pi t}$ 的傅里叶变换 $F(j\omega)$。`,
    String.raw`$F(j\omega)=1$（$|\omega|<2\pi$），$|\omega|>2\pi$ 时为零。`,
    String.raw`用逆变换检验：$\frac1{2\pi}\int_{-2\pi}^{2\pi}e^{j\omega t}d\omega=\frac{\sin(2\pi t)}{\pi t}$。这是单位增益、截止角频率 $2\pi$ 的矩形谱；跳变点通常按两侧平均取 $1/2$，不影响普通积分。$f(0)=2$。`),
  q(X, '1-7', '一7', '计算', ['4.1', '4.2'], 'laplace-calc', 6,
    String.raw`求 $f(t)=\cos(3t-2)u(3t-2)$ 的单边拉普拉斯变换。`,
    String.raw`$F(s)=e^{-2s/3}\dfrac{s}{s^2+9}$，$\operatorname{Re}s>0$。`,
    String.raw`写成 $\cos[3(t-2/3)]u(t-2/3)$。$\cos(3t)u(t)\leftrightarrow s/(s^2+9)$，再整体延时 $2/3$。不能把角频率 $3$ 漏掉，也不能将延时写成 $2$。`),
  q(X, '1-9', '一9', '计算', ['7.1', '7.2'], 'z-calc', 4,
    String.raw`已知 $F(z)=2z+1-z^{-2}$，求对应序列 $f(k)$。`,
    String.raw`$2\delta(k+1)+\delta(k)-\delta(k-2)$。`,
    String.raw`双边定义 $F(z)=\sum_kf(k)z^{-k}$，正幂 $z$ 对应 $k=-1$，$z^{-2}$ 对应 $k=2$。这是有限双边序列，ROC 为 $0<|z|<\infty$，两个端点都被排除。`),
  q(X, '1-10', '一10', '分析', ['1.8'], 'sys-prop', 5,
    String.raw`判断系统 $y(t)=\displaystyle\int_{t-1}^{t+2}f(\tau-1)e^{2(\tau-2)}d\tau$ 是否因果。`,
    String.raw`非因果。`,
    String.raw`令 $v=\tau-1$，则积分区间变成 $[t-2,t+1]$，权函数为 $e^{2(v-1)}$。输出会使用 $(t,t+1]$ 的未来输入，且权重非零。取两输入在 $v\le t$ 相同、在 $(t,t+1]$ 不同，输出即不同。`),
  q(X, '2-1', '二1', '画图', ['1.5'], 'waveform', 6,
    String.raw`原波形如图：$f(t)=2$（$-2\le t<0$），$f(t)=t+2$（$0\le t<2$），其余为零。画出 $f(2-t)$。`,
    String.raw`$f(2-t)=\begin{cases}4-t,&0<t\le2\\2,&2<t\le4\\0,&\text{其他}\end{cases}$。`,
    String.raw`原自变量 $v=2-t$。$0\le v<2$ 对应 $0<t\le2$，得到下降线段 $4-t$；$-2\le v<0$ 对应 $2<t\le4$，得到高度 $2$ 的平台。画出 $(0,4)$ 到 $(2,2)$ 的下降线，接到 $(4,2)$ 后归零。

![变换后的波形](figures/external/xaut-wave-answer.svg)`, ['figures/external/xaut-wave.png']),
  q(X, '3-2', '三2', '计算', ['2.3', '4.6'], 'ode-s-solve', 8,
    String.raw`已知因果 LTI 系统的微分方程 $y'(t)+2y(t)=f'(t)-f(t)$，求冲激响应 $h(t)$ 和阶跃响应 $g(t)$。`,
    String.raw`$h(t)=\delta(t)-3e^{-2t}u(t)$；$g(t)=\left(-\frac12+\frac32e^{-2t}\right)u(t)$。`,
    String.raw`零状态系统函数 $H(s)=(s-1)/(s+2)=1-3/(s+2)$。反变换得到 $h(t)$，其中常数 $1$ 对应 $\delta(t)$。

$G(s)=H(s)/s=-1/(2s)+3/[2(s+2)]$，故得到 $g(t)$。在分布意义下 $g'=h$，因为 $g(0^+)=1$，阶跃的跳变产生单位冲激。`),
  q(X, '3-4', '三4', '计算', ['3.6', '3.9'], 'filter-output', 8,
    String.raw`信号 $f(t)=8\cos(100t)\cos(500t)$ 与 $s(t)=\cos(500t)$ 相乘后，通过 $H(j\omega)=u(\omega+120)-u(\omega-120)$，求输出 $y(t)$。`,
    String.raw`$y(t)=4\cos(100t)$。`,
    String.raw`乘法器输出 $8\cos(100t)\cos^2(500t)=4\cos(100t)+2\cos(1100t)+2\cos(900t)$。理想低通只保留 $|\omega|<120$，故只通过 $100$ 的分量。两次相乘的幅度因子都要保留。`),
  q(X, '3-5', '三5', '分析', ['4.6'], 'block-to-Hs', 14,
    String.raw`零状态系统框图如图，三个积分器依次串联。第一个和第二个积分器输出分别以系数 $-3,-2$ 反馈到输入加法器；第一个和第三个积分器输出分别以系数 $1,4$ 加到输出。求 $H(s)$ 及 $h(t)$。`,
    String.raw`$H(s)=\dfrac{s^2+4}{s(s+1)(s+2)}$；$h(t)=\left(2-5e^{-t}+4e^{-2t}\right)u(t)$。`,
    String.raw`令输入加法器输出为 $Q$，三个积分器输出为 $Q/s,Q/s^2,Q/s^3$。反馈给出 $Q=F-3Q/s-2Q/s^2$，输出 $Y=Q/s+4Q/s^3$，所以 $H=(s^2+4)/[s(s^2+3s+2)]$。

部分分式 $H=2/s-5/(s+1)+4/(s+2)$。原点极点没有被约掉，因果系统不稳定。$h(0^+)=1$ 可由高频极限检验。`, ['figures/external/xaut-block.png']),
  q(X, '3-6', '三6', '分析', ['7.7', '7.6'], 'diff-eq-solve', 10,
    String.raw`已知输入 $f(k)=(1/2)^ku(k)$，零状态响应 $y_{zs}(k)=[2(1/2)^k+2(1/3)^k]u(k)$。求 $H(z)$，写出系统的差分方程。`,
    String.raw`$H(z)=\dfrac{4z-5/3}{z-1/3}$；$y(k)-\frac13y(k-1)=4f(k)-\frac53f(k-1)$。`,
    String.raw`$F=z/(z-1/2)$，$Y=2z/(z-1/2)+2z/(z-1/3)$。相除得 $H=2+2(z-1/2)/(z-1/3)=(4z-5/3)/(z-1/3)$。

整理为 $(1-z^{-1}/3)Y=(4-5z^{-1}/3)F$。按因果实现，ROC 为 $|z|>1/3$；$h(k)=4\delta(k)-\frac13(1/3)^{k-1}u(k-1)$。原整理卷末句写“微分方程”，这里对离散系统给出差分方程。`),
];

export const sau2024: Problem[] = [
  q(S, '1-1', '一1', '画图', ['1.8', '2.3'], 'full-response-decomp', 8,
    String.raw`输入 $x(t)=u(t)$ 时，输出为图示三角波 $g(t)$：$-2\le t<0$ 时为 $t+2$，$0\le t<2$ 时为 $2-t$，其余为零。求输入 $x_1(t)=u(t+1)-u(t-1)$ 时的输出并画图。`,
    String.raw`按 LTI 零状态系统解释，$y_1(t)=g(t+1)-g(t-1)$。`,
    String.raw`利用线性与时不变性，两个阶跃分别产生 $g(t+1)$ 和 $g(t-1)$。结果依次经过 $(-3,0),(-1,2),(1,-2),(3,0)$，区间外为零；三段斜率分别为 $1,-2,1$。

![输出波形](figures/external/sau-step-answer.svg)

题面未明确写出 LTI 和零状态，只有在此解释下才能从一个输入输出对推出结果；若为任意系统，信息不足。`, ['figures/external/sau-step.png']),
  q(S, '1-2', '一2', '画图', ['1.5', '1.4'], 'waveform', 10,
    String.raw`波形如图，在 $t=-1$ 处含强度为 $4$ 的冲激，普通部分在 $[-1,0)$ 为 $t+1$，$[0,2)$ 为 $1$，其余为零。画出 $f(2t-2)$，并求 $df(t)/dt$。`,
    String.raw`变换后冲激为 $2\delta(t-1/2)$，普通部分在 $[1/2,1)$ 为 $2t-1$，$[1,2)$ 为 $1$。

$f'(t)=4\delta'(t+1)+u(t+1)-u(t)-\delta(t-2)$。`,
    String.raw`冲激变换 $4\delta(2t-1)=2\delta(t-1/2)$，注意尺度因子 $1/2$。普通部分边界由 $2t-2=-1,0,2$ 得到 $1/2,1,2$。

原波形普通部分在 $t=-1,0$ 连续，在 $t=2$ 下降 $1$，故其导数为 $u(t+1)-u(t)-\delta(t-2)$，再加冲激偶 $4\delta'(t+1)$。

![变换波形](figures/external/sau-wave-answer.svg)`, ['figures/external/sau-wave.png']),
  q(S, '1-3', '一3', '计算', ['1.4', '1.5'], 'delta-sift', 6,
    String.raw`已知 $f(4-2t)=\delta(t)+e^{2t-4}$，求 $\displaystyle\int_0^{+\infty}f(t)dt$。`,
    String.raw`$3$。`,
    String.raw`令 $v=4-2t$，则 $t=(4-v)/2$，有 $f(v)=\delta((4-v)/2)+e^{-v}=2\delta(v-4)+e^{-v}$。

冲激位于积分区间内部、面积为 $2$，指数积分为 $1$，合计 $3$。原右侧指数未乘阶跃，不能擅自补 $u(t)$。`),
  q(S, '1-4', '一4', '计算', ['3.4', '3.3'], 'ft-property', 8,
    String.raw`已知 $F(j\omega)=\dfrac{\delta(2\omega)+e^{-2j\omega}}{1+j\omega}$，求 $f(t)$。`,
    String.raw`$f(t)=\dfrac1{4\pi}+e^{-(t-2)}u(t-2)$。`,
    String.raw`$\delta(2\omega)=\delta(\omega)/2$，而 $(1+j\omega)^{-1}\delta(\omega)=\delta(\omega)$，故第一项为 $\delta(\omega)/2$，逆变换为常数 $1/(4\pi)$。

第二项由 $e^{-t}u(t)\leftrightarrow1/(1+j\omega)$ 整体延时 $2$ 得到。`),
  q(S, '1-5', '一5', '计算', ['6.2', '7.7'], 'conv-sum', 10,
    String.raw`如图，输入先经过 $h_1(n)=u(n)-u(n-3)$，其输出分别经过 $h_2(n)=\delta(n)-\delta(n-1)$、直通支路和另一个 $h_1(n)$，三路以 $+,-,+$ 相加。求系统冲激响应。`,
    String.raw`$h(n)=\delta(n)+\delta(n-1)+2\delta(n-2)+\delta(n-3)+\delta(n-4)$。`,
    String.raw`总响应 $h=h_1*h_2-h_1+h_1*h_1$。其中 $h_1*h_2=\delta(n)-\delta(n-3)$，$h_1*h_1$ 在 $n=0,1,2,3,4$ 为 $1,2,3,2,1$。逐项相加得到 $1,1,2,1,1$。总和为 $6$，也等于 $H(1)=3\times(0-1+3)$。`, ['figures/external/sau-discrete-block.png']),
  q(S, '1-6', '一6', '计算', ['5.2', '3.4'], 'nyquist', 6,
    String.raw`已知 $f(t)=\operatorname{Sa}(100\pi t)[1+\operatorname{Sa}(100\pi t)]$，进行理想抽样，求抽样频率 $f_s$ 的要求。`,
    String.raw`奈奎斯特频率为 $200\,\mathrm{Hz}$；实际无混叠取 $f_s>200\,\mathrm{Hz}$。`,
    String.raw`$\operatorname{Sa}(100\pi t)$ 的谱支撑为 $|\omega|\le100\pi$。平方项在频域卷积，支撑扩展为 $|\omega|\le200\pi$，所以 $f_{\max}=100\,\mathrm{Hz}$，$f_N=2f_{\max}=200\,\mathrm{Hz}$。不能只看一次项的带宽。临界值的端点重合需按频谱边界处理，工程选择留出余量。`),
  q(S, '1-8', '一8', '计算', ['6.2', '2.3', '7.7'], 'conv-sum', 10,
    String.raw`输入 $x(n)=u(n)$ 时，输出 $y(n)=2[1-(1/2)^n]u(n)$。求输入 $x_1(n)=(1/2)^nu(n)$ 时的输出。`,
    String.raw`按 LTI 零状态系统解释，$y_1(n)=n(1/2)^{n-1}u(n-1)$。`,
    String.raw`由阶跃响应作一阶差分，$h(n)=y(n)-y(n-1)=(1/2)^{n-1}u(n-1)$，特别是 $h(0)=0$。

$y_1(n)=\sum_{m=1}^{n}(1/2)^{m-1}(1/2)^{n-m}=n(1/2)^{n-1}$（$n\ge1$），负下标和零下标为零。输出初值为 $0$，不能误写成 $2(n+1)(1/2)^n$。`),
  q(S, '2-2', '二2', '分析', ['4.6', '4.7', '3.7'], 'block-to-Hs', 18,
    String.raw`图示电路输入电压 $e(t)$，输出为右支路向下的电流 $i(t)$。电容为 $1\,\mathrm F$，对地电阻为 $1\,\Omega$，右支路电阻和电感分别为 $1/2\,\Omega$、$1/2\,\mathrm H$。画复频域模型，求 $H(s)=I(s)/E(s)$、零极点、稳定性及 $H(j\omega)$。`,
    String.raw`$H(s)=\dfrac{2s}{s^2+2s+3}$；零点 $0$，极点 $-1\pm j\sqrt2$，因果系统稳定；$H(j\omega)=\dfrac{2j\omega}{3-\omega^2+2j\omega}$。`,
    String.raw`按零状态求系统函数：电容阻抗 $1/s$，右支路阻抗 $(s+1)/2$，两者所用的 $s$ 域元件模型没有初始状态源。对地并联等效阻抗为 $(s+1)/(s+3)$，中间节点电压

$$V=\frac{s(s+1)}{s^2+2s+3}E.$$

右支路电流 $I=2V/(s+1)$，得到 $H$。分母等于 $(s+1)^2+2$，零极点无相消；因果 ROC 为 $\operatorname{Re}s>-1$，包含虚轴，可代入 $s=j\omega$。

![零状态复频域电路模型](figures/external/sau-circuit-s-model.svg)

![电路系统的零极点图](figures/external/sau-circuit-poles.svg)`, ['figures/external/sau-circuit.png']),
  q(S, '2-3-a', '二3(1、2)', '画图', ['4.6', '1.7'], 'ode-to-diagram', 8,
    String.raw`系统函数 $H(s)=\dfrac{s+4}{s^2+3s+2}$，写出系统微分方程并画模拟框图。`,
    String.raw`$y''+3y'+2y=x'+4x$。两积分器实现：$q''=x-3q'-2q$，$y=q'+4q$。`,
    String.raw`交叉相乘直接得到微分方程。选 $Q=X/(s^2+3s+2)$，串联两个积分器得到 $q',q$；将它们以系数 $-3,-2$ 反馈到输入加法器，输出以系数 $1,4$ 相加。

![两积分器框图](figures/external/sau-ode-diagram.svg)`),
  q(S, '2-3-b', '二3(3)', '计算', ['3.7', '4.6'], 'sine-steady', 8,
    String.raw`已知稳定因果系统 $H(s)=\dfrac{s+4}{s^2+3s+2}$，输入 $x(t)=1+2\cos(t+60^\circ)$，求稳态响应。`,
    String.raw`$y_s(t)=2+\dfrac{\sqrt{170}}5\cos\left(t+\frac\pi3-\arctan\frac{11}7\right)$。`,
    String.raw`直流增益 $H(0)=2$。$H(j)=(4+j)/(1+3j)=(7-11j)/10$，模为 $\sqrt{170}/10$，相位为 $-\arctan(11/7)$。正弦分量的输出幅度为输入幅度 $2$ 乘频响模，相位相加。不要为全时正弦输入添加开机暂态。`),
  q(S, '2-3-c', '二3(4)', '分析', ['2.1', '2.2', '4.5'], 'ode-s-solve', 18,
    String.raw`系统函数 $H(s)=\dfrac{s+4}{s^2+3s+2}$，输入 $x(t)=u(t)$，初值 $y(0^-)=y'(0^-)=2$，求 $y_{zi}(t),y_{zs}(t),y(t)$。`,
    String.raw`$y_{zi}=(6e^{-t}-4e^{-2t})u(t)$；$y_{zs}=(2-3e^{-t}+e^{-2t})u(t)$；$y=(2+3e^{-t}-3e^{-2t})u(t)$。`,
    String.raw`微分方程 $y''+3y'+2y=x'+4x$。零输入部分由 $y(0^-)=2,y'(0^-)=2$ 得到 $6e^{-t}-4e^{-2t}$。

零状态部分 $Y_{zs}=(s+4)/[s(s+1)(s+2)]$，部分分式为 $2/s-3/(s+1)+1/(s+2)$。叠加即全响应。

**初值核对**：输入阶跃令右端出现单位冲激，$y$ 连续而 $y'(0^+)-y'(0^-)=1$。所以全响应 $y(0^+)=2,y'(0^+)=3$，不能强行令导数仍等于 $2$。`),
  q(S, '2-4-a', '二4(1、2)', '分析', ['7.7', '6.3'], 'hz-roc-all', 10,
    String.raw`离散系统差分方程 $y(n)+3y(n-1)+2y(n-2)=2x(n)+x(n-1)$。求 $H(z)$、零极点，判断因果性和稳定性。`,
    String.raw`$H(z)=\dfrac{z(2z+1)}{(z+1)(z+2)}$；零点 $0,-1/2$，极点 $-1,-2$。按因果递推实现时 ROC 为 $|z|>2$，系统不稳定。`,
    String.raw`零状态 z 变换得 $H=(2+z^{-1})/(1+3z^{-1}+2z^{-2})$。只从有理式本身不能唯一决定因果性；按该卷后续给定过去初值的递推解释，取因果实现。

其冲激响应 $h(n)=[-(-1)^n+3(-2)^n]u(n)$ 不绝对可和。事实上其他 ROC 也都无法包含极点 $z=-1$ 所在的单位圆，因此没有 BIBO 稳定的实现。

![离散系统零极点图](figures/external/sau-discrete-poles.svg)`),
];
for (const id of ['ext-sau2024-1-1','ext-sau2024-1-8']) {
  const p=sau2024.find(p=>p.id===id)!;
  p.verified = 'uncertain';
  p.note += ' 原题未声明 LTI 与零状态；解答仅在该条件下成立，默认不进入自动模拟卷。';
}

export const sxu2024: Problem[] = [
  q(V, '1', '1', '计算', ['2.4'], 'conv-integral', 10,
    String.raw`计算卷积 $f(t)=2e^{-2t}u(t-1)*3e^{-t}u(t-2)$。`,
    String.raw`$f(t)=6[e^{-(t+1)}-e^{2-2t}]u(t-3)$。`,
    String.raw`非零区间要求积分变量 $\tau\ge1$ 且 $t-\tau\ge2$，故仅 $t\ge3$ 时可积：

$$f(t)=6e^{-t}\int_1^{t-2}e^{-\tau}d\tau=6(e^{-t-1}-e^{2-2t}).$$

原题指数是 $e^{-2t},e^{-t}$，不是延时后的指数 $e^{-2(t-1)},e^{-(t-2)}$。在 $t=3$ 两项恰好抵消。`),
  q(V, '2', '2', '计算', ['4.3', '1.4'], 'laplace-calc', 10,
    String.raw`求 $F(s)=\dfrac{s^3+5s^2+9s+7}{(s+1)(s+2)}$ 的单边拉普拉斯逆变换。`,
    String.raw`$f(t)=\delta'(t)+2\delta(t)+(2e^{-t}-e^{-2t})u(t)$。`,
    String.raw`先作多项式除法：$F=s+2+(s+3)/[(s+1)(s+2)]$。余项为 $2/(s+1)-1/(s+2)$，而 $s$ 和常数分别对应 $\delta'$、$\delta$。单边采用从 $0^-$ 开始的工程约定，以完整计入原点冲激。`),
  q(V, '3', '3', '计算', ['7.2', '7.1'], 'z-calc', 8,
    String.raw`已知 $F(z)=\dfrac{z-1}{z^2(z-2)}$，$|z|>2$，求逆 z 变换 $f(n)$。`,
    String.raw`$f(n)=\delta(n-2)+2^{n-3}u(n-3)$。`,
    String.raw`写成 $F=z^{-2}[1+1/(z-2)]$。因 ROC 为 $|z|>2$，$1/(z-2)\leftrightarrow2^{n-1}u(n-1)$。整体延时 $2$，得到所示结果。等价形式为 $\frac12\delta(n-2)+2^{n-3}u(n-2)$，在 $n=2$ 总值都是 $1$。`),
  q(V, '4', '4', '分析', ['2.1', '2.2'], 'ode-s-solve', 18,
    String.raw`已知 LTI 系统 $y''(t)+6y'(t)+9y(t)=t^2+t$，初值 $y(0^-)=y'(0^-)=1$。用时域法求 $t\ge0$ 的零输入、零状态与全响应。`,
    String.raw`$y_{zi}=(1+4t)e^{-3t}$；$y_{zs}=\dfrac{t^2}9-\dfrac{t}{27}+(\dfrac{t}{27})e^{-3t}$；$y=y_{zi}+y_{zs}$。`,
    String.raw`齐次解为 $(A+Bt)e^{-3t}$，零输入初值得 $A=1,B=4$。对多项式激励设特解 $at^2+bt+c$，代入得 $a=1/9,b=-1/27,c=0$。

零状态初值为 $0,0$，补齐次项 $te^{-3t}/27$，即得 $y_{zs}$。激励在原点没有冲激，故 $0^+$ 和 $0^-$ 的两项初值相同。解答给出从 $0$ 开始激励的响应分解；不能对已存在于整个负半轴的激励凭这些初值假定零状态。`),
  q(V, '6', '6', '分析', ['4.5', '2.1', '2.2'], 'ode-s-solve', 18,
    String.raw`已知 $H(j\omega)=-\dfrac{j\omega}{\omega^2-j5\omega-6}$，输入 $f(t)=e^{-t}u(t)$，且 $y(0^+)=2,y'(0^+)=1$，求 $t\ge0$ 的全响应。`,
    String.raw`$y(t)=8e^{-2t}-\dfrac{11}2e^{-3t}-\dfrac12e^{-t}$（$t\ge0$）。`,
    String.raw`把频响写成 $H(s)=s/[(s+2)(s+3)]$，对 $t>0$ 得到 $y''+5y'+6y=-e^{-t}$。特解为 $-e^{-t}/2$，设全响应 $Ae^{-2t}+Be^{-3t}-e^{-t}/2$，用题中明确给出的 $0^+$ 初值得 $A+B=5/2,-2A-3B=1/2$，所以 $A=8,B=-11/2$。

若需用单边变换分解，激励的导数还含原点冲激，不能再把给定的 $0^+$ 当成 $0^-$ 重复计入该冲激。`),
  q(V, '7-a', '7(1)', '画图', ['3.7'], 'sine-steady', 6,
    String.raw`连续微分器满足 $y(t)=dx(t)/dt$，求频率响应，画幅频和相频特性。`,
    String.raw`$H(j\omega)=j\omega$，幅频为 $|\omega|$；正频率相位 $\pi/2$，负频率相位 $-\pi/2$。`,
    String.raw`由时域微分性质 $Y=j\omega X$ 得频响。幅频是一条以原点为最低点的 V 形折线；原点增益为零，相位没有定义。正频率取 $+\pi/2$，负频率取 $-\pi/2$。理想微分器高频增益无界，普通有界输入不保证有界输出。

![微分器幅相频图](figures/external/sxu-differentiator.svg)`),
  q(V, '7-b', '7(2)', '画图', ['7.5', '7.7'], 'filter-output', 10,
    String.raw`离散微分器满足 $y(kT_s)=[x(kT_s)-x((k-1)T_s)]/T_s$，求频率响应并画幅频和相频特性。`,
    String.raw`$H(e^{j\Omega})=(1-e^{-j\Omega})/T_s$；$|H|=2|\sin(\Omega/2)|/T_s$。

在 $-\pi<\Omega<\pi$，$\varphi(\Omega)=\operatorname{sgn}(\Omega)\pi/2-\Omega/2$，原点相位未定义。`,
    String.raw`数字角频率 $\Omega=\omega T_s$。分解 $1-e^{-j\Omega}=2je^{-j\Omega/2}\sin(\Omega/2)$，由此得到幅相。幅频、整个复频响均以 $2\pi$ 为周期；主值相位按上述分段绘制。

若横轴使用物理角频率 $\omega$，只需把 $\Omega$ 换成 $\omega T_s$，周期为 $2\pi/T_s$。低频极限近似 $H\simeq j\omega$。

![离散微分器幅相频图](figures/external/sxu-discrete-differentiator.svg)`),
  q(V, '8', '8', '计算', ['5.2', '3.4'], 'nyquist', 10,
    String.raw`已知频谱 $F(j\omega)$ 的支撑为 $[-\omega_m,\omega_m]$，如图。求 $f(2t),f(t/2)$ 的带宽、奈奎斯特频率与周期；再用 $\delta_T(t)=\sum_n\delta(t-nT_0)$ 抽样 $f(t)$，写出抽样后频谱。`,
    String.raw`$f(2t)$：最高角频率 $2\omega_m$，$f_N=2\omega_m/\pi$，$T_N=\pi/(2\omega_m)$。

$f(t/2)$：最高角频率 $\omega_m/2$，$f_N=\omega_m/(2\pi)$，$T_N=2\pi/\omega_m$。

$F_s(j\omega)=\dfrac1{T_0}\sum_{n=-\infty}^{\infty}F(j(\omega-n\omega_s))$，$\omega_s=2\pi/T_0$。`,
    String.raw`采用“单边最高角频率”作为这里的带宽口径；若用双边总谱宽，两项分别为 $4\omega_m,\omega_m$。时域压缩 $2$ 倍使频域展宽 $2$ 倍，伸展 $2$ 倍则带宽减半。

抽样在时域相乘，频域以 $\omega_s$ 为间隔复制原谱，每份幅度乘 $1/T_0$。避免混叠要求 $\omega_s>2\omega_m$（临界对应 $T_0=\pi/\omega_m$）。题中没有给 $T_0$ 的数值，不能画成某一个固定重叠程度的谱图。

![无混叠条件下的复制频谱示意图](figures/external/sxu-sampling-spectrum.svg)`, ['figures/external/sxu-spectrum.png']),
];

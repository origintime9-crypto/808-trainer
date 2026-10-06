import type { Problem } from '../../types';
import { problem as make } from './helper';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make('zt2024', ...args);
const r = String.raw;
const shared = (no: string) => ['zt2024', 'zt2025'].map(paper => ({ paper, no }));
export const choicesShared: Problem[] = [
  p('二(1)', ['3.3'], 'concept', '信号的频域带宽与时域时宽通常呈何种关系？', 'B：反比。', '在同一波形的尺度变换下，时域压缩会导致频谱展宽，时域展宽则导致频谱压缩。这里是教材中的尺度关系，并非所有不同波形具有同一个时宽带宽乘积。', { type: '选择', sources: shared('二(1)'), options: ['正比', '反比', '相等', '无关系'], answerKey: 1 }),
  p('二(2)', ['6.1', '1.2'], 'period', r`序列 $x(n)=2\cos(3\pi n/5+\pi/5)+\sin(3\pi n/7+\phi)$，求基本周期。`, '$N=70$，选 C。', r`第一项要求 $(3\pi/5)N_1=2\pi k$，最小 $N_1=10$；第二项最小 $N_2=14$。两个不同谐波分量同时重复的最小周期为 $\mathrm{lcm}(10,14)=70$，初相不影响此条件。`, { type: '选择', sources: shared('二(2)'), options: ['$10$', '$14$', '$70$', '$60$'], answerKey: 2, note: '回忆版第二项初相未清楚写出，采用任意常量 φ 表示，不影响周期计算。' }),
  p('二(3)', ['4.6', '3.7'], 'ode-to-diagram', r`$H(j\omega)=(j\omega+2)/(-\omega^2+3j\omega+2)$，写输入输出微分方程。`, r`$y''+3y'+2y=x'+2x$。`, r`写为 $H(s)=(s+2)/(s^2+3s+2)$。交叉相乘 $(s^2+3s+2)Y=(s+2)X$，再由零状态微分性质得到方程。`, { type: '填空', sources: shared('二(3)') }),
  p('二(4)', ['3.7', '3.9'], 'filter-output', r`$H(j\omega)=1/(j\omega+2)$ 的滤波类型是什么？`, 'B：低通。', r`模为 $1/\sqrt{\omega^2+4}$，在直流取最大值 $1/2$，随频率增大单调下降，高频趋零。`, { type: '选择', sources: shared('二(4)'), options: ['高通', '低通', '带通', '带阻'], answerKey: 1 }),
  p('二(5)', ['7.5'], 'concept', '离散时间非周期信号的频谱特征是什么？', 'A：周期、连续谱。', r`DTFT 中 $e^{-j(\omega+2\pi)n}=e^{-j\omega n}$，因此谱以 $2\pi$ 为周期。非周期时域信号通常对应连续频率变量，区别于离散谱线。`, { type: '选择', sources: shared('二(5)'), options: ['周期、连续谱', '非周期、连续谱', '周期、离散谱', '非周期、离散谱'], answerKey: 0 }),
  p('二(6)', ['2.4'], 'conv-integral', r`判断哪些等式一般不成立（回忆题原写单选）：

A. $\frac d{dt}(x_1*x_2)=x_1'*x_2'$

B. $x*\delta'=x'$

C. $x_1(t-t_0)*x_2(t-t_0)=x_1(t)*x_2(t)$`, 'A、C 均不成立；B 成立。', r`正确导数性质为 $(x_1*x_2)'=x_1'*x_2=x_1*x_2'$。两边同时求导的卷积相当于结果的二阶导数。两输入各延时 $t_0$，卷积结果延时 $2t_0$，所以 C 也缺少时移。`, { type: '分析', sources: shared('二(6)'), verified: 'uncertain', note: '2024、2025 两份回忆题的 C 都写成未时移的原卷积；按此字面存在两个错误选项。改为分析题，不武断设唯一 answerKey。' }),
  p('二(7)', ['3.3'], 'ft-basic', r`$x(t)=u(t+2)-u(t-2)$，傅里叶变换是什么？`, r`C：$4\mathrm{Sa}(2\omega)$。`, r`脉冲宽度为 4，高度为 1。$\int_{-2}^2e^{-j\omega t}dt=2\sin(2\omega)/\omega=4\mathrm{Sa}(2\omega)$。`, { type: '选择', sources: shared('二(7)'), options: [r`$2\mathrm{Sa}(\omega)$`, r`$2\mathrm{Sa}(2\omega)$`, r`$4\mathrm{Sa}(2\omega)$`, r`$4\mathrm{Sa}(\omega)$`], answerKey: 2 }),
];
export const zt2024: Problem[] = [
  p('一(1)', ['1.8'], 'sys-prop', r`判断 $y(t)=\int_{-\infty}^{3t}x(\tau)d\tau$ 的线性、时不变性和因果性。`, '线性；时变；在实数全时域定义时非因果。', r`积分满足叠加。延时输入得到 $\int_{-\infty}^{3t-t_0}x(\lambda)d\lambda$，而延时输出上限为 $3t-3t_0$，一般不同。在 $t>0$ 时上限 $3t>t$，依赖未来输入，非因果。`, { type: '分析', verified: 'uncertain', note: '原上限字迹按 3t 读取，系数需对印刷原卷再确认。若上限为 t/2，仍线性、时变，并在 t<0 非因果；不能只考虑 t≥0 就断言全时域因果。' }),
  p('一(2)', ['1.4'], 'delta-sift', r`计算 $\int_{-\infty}^{\infty}e^{j\omega_0t}[\delta(t)-\delta(t-t_0)]dt$。`, r`$1-e^{j\omega_0t_0}$。`, r`分别在 0 和 $t_0$ 筛选指数，两项做减法。这里积分核是正指数，不能套用负指数 FT 时移符号。`),
  p('一(3)', ['5.2', '3.4'], 'nyquist', '两个低通信号带宽分别为 20 Hz、30 Hz，对其和采样，奈奎斯特频率是多少？', '$60$ Hz。', '相加的最高频率取较大者 30 Hz，采样频率取两倍。若存在特定的频谱抵消，实际带宽可能更低；题目按通常无抵消情况。'),
  p('一(4)', ['2.4'], 'conv-integral', r`求 $\delta(t+1)*\cos\omega t$。`, r`$\cos[\omega(t+1)]$。`, r`与 $\delta(t-t_0)$ 卷积使信号移位 $t_0$，此处 $t_0=-1$，因此提前 1。2025 年同型题写的是 δ(t−1)，两题的移位方向不同。`, { verified: 'corrected', note: '原题放大后确认是 δ(t+1)，资料答案写成 cos[ω(t−1)]，移位符号相反。' }),
  p('一(5)', ['4.1', '4.2'], 'laplace-calc', r`求 $e^{-t}[u(t)-u(t-2)]$ 的拉氏变换。`, r`$X(s)=(1-e^{-2(s+1)})/(s+1)$，ROC 为所有有限 $s$。`, r`直接在 $[0,2]$ 积分 $e^{-(s+1)t}$。$s=-1$ 是可去奇点，极限为 2，不是真极点。不能只给右边序列的 ROC。`, { verified: 'corrected', note: '资料答案的分子写成 1−e^{-2s}，漏掉截断尾部的幅度 e^{-2}。直接积分确认指数应为 −2(s+1)。' }),
  p('一(6)', ['3.3', '3.7'], 'ft-basic', r`$h(t)=(e^{-3t}-e^{-2t})u(t)$，求频率响应。`, r`$H(j\omega)=\dfrac1{3+j\omega}-\dfrac1{2+j\omega}=-\dfrac1{(3+j\omega)(2+j\omega)}$。`, r`分别应用因果衰减指数变换对，保持原式的相减顺序；公共分子为 $(2+j\omega)-(3+j\omega)=-1$。`),
  p('一(7)', ['6.3'], 'sys-prop', '离散因果 LTI 系统的单位样值响应须满足什么条件？', r`$h(n)=0$，$n<0$。`, r`因果系统不能在输入单位样值到来之前有输出；卷积 $y(n)=\sum h(k)x(n-k)$ 只允许 $k\ge0$。`, { type: '填空', verified: 'corrected', note: '资料答案给的是绝对可和的稳定性条件；原题问因果性，两者不能混同。' }),
  p('一(8)', ['6.4', '7.7', '7.2'], 'diff-eq-solve', r`零状态因果系统 $y(n)+ay(n-1)+by(n-2)=x(n)$，求 $h(n)$。`, r`设 $\lambda_{1,2}$ 为 $\lambda^2+a\lambda+b=0$ 的根。异根时 $h(n)=\dfrac{\lambda_1^{n+1}-\lambda_2^{n+1}}{\lambda_1-\lambda_2}u(n)$；重根时 $h(n)=(n+1)\lambda^nu(n)$。`, r`$H(z)=1/(1+az^{-1}+bz^{-2})=z^2/[(z-\lambda_1)(z-\lambda_2)]$。按因果 ROC 展开为两个几何序列；重根结果是异根公式的极限。初值 $h(0)=1$、$h(1)=-a$ 校验。`, { note: '回忆卷仅给字母系数 a、b，没有提供数值。' }),
  p('一(9)', ['7.1', '7.7'], 'hz-roc-all', r`$X(z)=1/[(z+1)(z+3)]$，序列因果时的 ROC 是什么？`, r`$|z|>3$。`, '因果右边序列取最外极点圆外，两个极点模为 1 和 3，最大值为 3。', { type: '填空' }),
  p('三(1)', ['2.4'], 'conv-integral', r`$x_1=x_2=u(t)-u(t-2)$，图解求 $y=x_1*x_2$。`, r`$y(t)=\begin{cases}t&0\le t<2\\4-t&2\le t<4\\0&\text{其他}\end{cases}$。`, r`卷积值等于区间 $[0,2]$ 与 $[t-2,t]$ 的重叠长度。重叠从 0 线性增加到 2，再降为零；峰值在 $t=2$，积分面积为 $2\times2=4$。`),
  p('三(2)-1', ['3.3', '3.4'], 'ft-property', r`求 $\sin[2\pi(t-2)]/[\pi(t-2)]$ 的 FT。`, r`$X(j\omega)=e^{-j2\omega}$（$|\omega|<2\pi$），其余为 0。`, r`标准低通信号对应高度 1、截止 $2\pi$ 的矩形谱；时移 2 后乘 $e^{-j2\omega}$。`, { sources: [{ paper: 'zt2024', no: '三(2)-1' }] }),
  p('三(2)-2', ['3.3'], 'ft-basic', r`求 $e^{-2t}[u(t+2)-u(t-3)]$ 的傅里叶变换。`, r`$X(j\omega)=\dfrac{e^{2(2+j\omega)}-e^{-3(2+j\omega)}}{2+j\omega}$。`, r`门限把信号限制在 $[-2,3]$。积分 $\int_{-2}^{3}e^{-(2+j\omega)t}dt$，上下限代入即得；指数因子不应只按门函数时移处理。`),
];

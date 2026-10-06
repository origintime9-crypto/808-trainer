import type { Problem } from '../../types';
import { problem as make } from './helper';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make('zt2023', ...args);
const r = String.raw;
const zpStem = r`因果系统零点为 $s=0$，极点为 $s=-1\pm j\sqrt3/2$，已知 $h(0^+)=2$。`;
const sources = (no: string) => ['zt2023', 'zt2024', 'zt2025'].map(paper => ({ paper, no }));
export const zpShared: Problem[] = [
  p('四(1)', ['4.6', '4.2'], 'zp-h0', zpStem + '求系统函数。', r`$H(s)=\dfrac{2s}{s^2+2s+7/4}$。`, r`由零极点得 $H(s)=Ks/[(s+1)^2+3/4]$。初值定理 $h(0^+)=\lim sH(s)=K=2$，代回即得。`, { sources: sources('四(1)') }),
  p('四(2)', ['4.6', '3.7'], 'zp-h0', zpStem + '求频率响应。', r`$H(j\omega)=\dfrac{2j\omega}{7/4-\omega^2+2j\omega}$。`, r`因果 ROC 为 $\mathrm{Re}\,s>-1$，包含虚轴。将 $s=j\omega$ 代入系统函数，并用 $(j\omega)^2=-\omega^2$ 化简。`, { sources: sources('四(2)') }),
  p('四(3)', ['4.6', '4.3'], 'zp-h0', zpStem + '求冲激响应。', r`$h(t)=e^{-t}\left[2\cos\frac{\sqrt3t}{2}-\frac{4\sqrt3}{3}\sin\frac{\sqrt3t}{2}\right]u(t)$。`, r`把分子写成 $2(s+1)-2$。令 $b=\sqrt3/2$，则 $H=2(s+1)/[(s+1)^2+b^2]-(2/b)b/[(s+1)^2+b^2]$。逆变换得到所示结果；$h(0^+)=2$ 可检查正弦、余弦是否颠倒。`, { sources: sources('四(3)'), verified: 'corrected', note: '2025 手写参考答案和《学习指导及习题全解》第 116 页均把正弦、余弦项写反。独立逆变换及初值检查均支持此处结果。' }),
  p('四(4)', ['3.7', '4.6'], 'zp-h0', zpStem + r`输入 $x(t)=\sin(\sqrt3t/2)u(t)$，求正弦稳态响应。`, r`$y_s(t)=\dfrac{\sqrt3}{2}\sin\left(\dfrac{\sqrt3t}{2}+\dfrac\pi6\right)$。`, r`在 $\omega_0=\sqrt3/2$，$H(j\omega_0)=j\sqrt3/(1+j\sqrt3)$，其模为 $\sqrt3/2$，相位为 $\pi/6$。稳态响应幅度乘该模，初相加该相位。阶跃仅引入最终衰减的暂态。`, { sources: sources('四(4)'), verified: 'corrected', note: '《学习指导及习题全解》第 116 页把相位写成 π/2，漏减分母相位 π/3。复频响与符号检查给出 π/6。' }),
];
export const zt2023: Problem[] = [
  p('一(1)', ['1.4'], 'delta-sift', r`计算 $\int_{-\infty}^t4\sin\tau\,\delta(\tau-\pi/6)d\tau$。`, r`$2u(t-\pi/6)$。`, r`冲激权重 $4\sin(\pi/6)=2$。积分上限未到冲激位置时为零，超过后为 2；分界点的单点约定不影响信号分析。`),
  p('一(2)', ['1.4', '2.4'], 'conv-integral', r`计算 $\int_{-\infty}^t[\delta(\tau+\tau_0)*f'(\tau)]d\tau$。假设 $f(-\infty)=0$。`, r`$f(t+\tau_0)$。`, r`冲激卷积得 $f'(\tau+\tau_0)$，积分为 $f(t+\tau_0)-f(-\infty)$。`, { verified: 'uncertain', note: '回忆卷写作 δ(t+τ)，未定义第二个 τ；按常量时移 τ₀ 转录，并显式补充 f(-∞)=0。未补此条件时需保留积分常数。' }),
  p('一(3)', ['2.3'], 'concept', r`初始状态为零，输入 $u(t)$ 时响应为 $e^{-3t}u(t)$。输入 $\delta(t)$ 时响应为多少？`, r`$\delta(t)-3e^{-3t}u(t)$。`, r`LTI 冲激响应为阶跃响应的导数。$g'(t)=(-3e^{-3t})u(t)+e^{-3\cdot0}\delta(t)$。别漏掉 $t=0$ 的跳变冲激。`),
  p('一(4)', ['3.2'], 'concept', '周期信号傅里叶级数的三种频谱特点是什么？', '离散性、谐波性、收敛性。', '谱线位于基频的整数倍处，形成离散谐波；对常见满足狄利克雷条件的信号，系数随阶数增高趋于零。', { type: '填空' }),
  p('一(5)', ['1.2', '6.1'], 'period', r`连续信号 $x(t)=\sin t$ 的周期是多少？以 $f_s=1$ Hz 采样后，求 $x(n)$ 并判断周期性。`, r`$T_0=2\pi$；$x(n)=\sin n$，非周期序列。`, r`$T_s=1$ 秒，代入 $t=n$。离散周期需 $N=2\pi k$ 为正整数，但 $\pi$ 为无理数，不存在这样的 $N$。`),
  p('一(6)', ['4.1'], 'laplace-calc', r`求 $e^{-2t}u(t)$ 的拉氏变换及 ROC。`, r`$X(s)=1/(s+2)$，$\mathrm{Re}\,s>-2$。`, r`定义积分 $\int_0^\infty e^{-(s+2)t}dt$ 在实部为正时收敛，积分即 $1/(s+2)$。`),
  p('一(7)', ['3.8'], 'filter-output', '无失真传输的时域条件是什么？', r`$y(t)=Kx(t-t_0)$。`, r`输出只允许固定比例缩放和整体时移。相应 $h(t)=K\delta(t-t_0)$，$H(j\omega)=Ke^{-j\omega t_0}$。`, { type: '填空' }),
  p('一(8)', ['3.5'], 'ft-basic', r`求 $\cos\omega_0t$ 的傅里叶变换。`, r`$\pi[\delta(\omega-\omega_0)+\delta(\omega+\omega_0)]$。`, r`拆为 $(e^{j\omega_0t}+e^{-j\omega_0t})/2$，各复指数对应 $2\pi\delta$ 谱线，相加后各权重为 $\pi$。`),
  p('二(1)', ['1.5'], 'waveform', r`$f(5-2t)$ 可由 $f(-2t)$ 怎样平移得到？`, 'C：右移 5/2。', r`$5-2t=-2(t-5/2)$。必须在因子 $-2$ 提取以后读时移量，不能直接按常数 5 平移。`, { type: '选择', options: ['右移 5', '左移 5', '右移 5/2', '左移 5/2'], answerKey: 2 }),
  p('二(2)', ['3.7', '3.3'], 'ft-property', r`稳定 LTI 系统 $H(j\omega)=1/(j\omega+2)$，输出 $Y(j\omega)=1/[(j\omega+2)(j\omega+3)]$，求输入。`, r`$x(t)=e^{-3t}u(t)$。`, r`由 $Y=HX$ 得 $X=Y/H=1/(j\omega+3)$，由指数信号变换对得到输入。`, { verified: 'uncertain', note: '原题为选择题，回忆版 A、B 两个选项看起来重复且不能唯一自动判分；改为独立计算，保留原方程。' }),
  p('二(3)', ['1.7', '3.7'], 'sys-prop', '两个输入通过同一 LTI 系统后得到相同输出，这两个输入一定相同吗？', 'D：可以不同。', r`若系统有频率零点或不具可逆性，其零空间中的输入分量不能由输出辨别。极端反例：$H=0$ 时任何输入输出都是零。`, { type: '选择', options: ['一定相同', '一定不同', '仅可能有一种关系', '可以不同'], answerKey: 3 }),
  p('二(4)', ['5.2', '3.4'], 'nyquist', r`$x(t)=\mathrm{Sa}(100t)+\mathrm{Sa}^2(60t)$，奈奎斯特采样频率 $f_s$ 为多少？`, r`B：$120/\pi$ Hz。`, r`两项最高角频率分别为 100 和 120 rad/s，总带宽取 120。$f_s=2\omega_m/(2\pi)=120/\pi$。`, { type: '选择', options: [r`$50/\pi$`, r`$120/\pi$`, r`$100/\pi$`, r`$60/\pi$`], answerKey: 1 }),
  p('二(5)', ['5.2', '3.4'], 'nyquist', r`$f_1,f_2$ 的最高角频率为 $\omega_1,\omega_2$，$\omega_2>\omega_1$。对 $f_1*f_2$ 采样，其奈奎斯特角频率为多少？`, r`A：$2\omega_1$；若以 Hz 表示则 $f_s=\omega_1/\pi$。`, r`时域卷积对应频域相乘，非零频谱支撑取交集，最高角频率不超过较小者。按题目的标准带宽假设取 $\omega_1$，采样角频率为其两倍。`, { type: '选择', options: [r`$2\omega_1$`, r`$\omega_1+\omega_2$`, r`$2(\omega_1+\omega_2)$`, r`$(\omega_1+\omega_2)/2$`], answerKey: 0, verified: 'uncertain', note: '原卷把 f_s 与角频率 ω 混写。选项按角频率解释；一般卷积的实际频谱支撑也可能更小，此处沿用题设的常规带宽口径。' }),
  p('二(6)', ['4.7'], 'sys-prop', '连续、因果、稳定的有理 LTI 系统，系统函数极点应位于哪里？', 'B：左半平面。', '因果 ROC 在最右极点右侧；稳定要求包含虚轴，所以全部极点实部必须严格为负。单位圆对应离散系统。', { type: '选择', options: ['单位圆内', '左半平面', '至少一个极点在虚轴上', '右半平面'], answerKey: 1 }),
  p('二(7)', ['4.1', '4.2'], 'laplace-calc', r`求 $u(t)-u(t-1)$ 的拉氏变换。`, r`A：$(1-e^{-s})/s$。`, r`积分 $\int_0^1e^{-st}dt=(1-e^{-s})/s$。$s=0$ 是可去奇点，连续取值 1；有限支撑信号 ROC 为整个有限 $s$ 平面。`, { type: '选择', options: [r`$(1-e^{-s})/s$`, r`$(1-e^s)/s$`, r`$s(1-e^{-s})$`, r`$s(1-e^s)$`], answerKey: 0 }),
  p('三(1)', ['1.5'], 'waveform', r`$f(t)=t+1$（$-1\le t<0$），$f(t)=1$（$0\le t<1$），其余为零。画 $f(2-t)$。`, r`$f(2-t)=1$（$1<t\le2$），$f(2-t)=3-t$（$2<t\le3$），其余为零。`, r`令原自变量为 $q=2-t$。$0\le q<1$ 对应 $1<t\le2$；$-1\le q<0$ 对应 $2<t\le3$，代入 $q+1=3-t$。边界单点按原函数约定；图形从水平段接一条下降斜线。`, { type: '画图' }),
  p('三(2)', ['2.4'], 'conv-integral', r`$x_1=u(t)-u(t-1)$，$x_2=e^{-t}u(t)$。求卷积并画波形。`, r`$y(t)=\begin{cases}0&t<0\\1-e^{-t}&0\le t<1\\(e-1)e^{-t}&t\ge1\end{cases}$。`, r`$y=\int_0^{\min(t,1)}e^{-(t-\tau)}d\tau$，仅在 $t\ge0$ 有重叠。$0\le t<1$ 积分到 $t$ 得 $1-e^{-t}$；$t\ge1$ 积分到 1 得 $(e-1)e^{-t}$。两段在 $t=1$ 连续。`),
  p('三(3)', ['3.3', '3.4'], 'ft-property', r`求 $x(t)=\sin[2\pi(t-2)]/[\pi(t-2)]$ 的傅里叶变换。`, r`$X(j\omega)=e^{-j2\omega}$（$|\omega|<2\pi$），外部为 0。`, r`$\sin(\omega_ct)/(\pi t)$ 对应截止 $\omega_c$、高度 1 的矩形谱。这里 $\omega_c=2\pi$，再按时移 2 乘 $e^{-j2\omega}$；频谱端点可取半值。`),
];

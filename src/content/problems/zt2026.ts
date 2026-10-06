import type { Problem } from '../../types';

const P = 'zt2026';
const NOTE = '本卷未提供官方答案，参考解答已经独立求解与符号复核。';

export const zt2026: Problem[] = [
  {
    id: 'zt2026-1-1',
    sources: [{ paper: P, no: '一(1)', score: 5 }],
    type: '计算',
    kps: ['1.4'],
    pattern: 'delta-sift',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`计算 $\displaystyle\int_0^{\pi}(t+\sin t)\,\delta\!\left(t-\frac{\pi}{3}\right)dt$。`,
    answer: String.raw`$\dfrac{\pi}{3}+\dfrac{\sqrt3}{2}$`,
    solution: String.raw`冲激位于 $t=\frac{\pi}{3}$，在积分区间 $[0,\pi]$ 内，由筛选性质：

$$\int_0^{\pi}(t+\sin t)\,\delta\!\left(t-\tfrac{\pi}{3}\right)dt=\left(t+\sin t\right)\Big|_{t=\pi/3}=\frac{\pi}{3}+\frac{\sqrt3}{2}$$

**易错点**：冲激位置若不在积分区间内（例如积分限为 $0\sim\frac{\pi}{4}$），结果为 $0$。`,
  },
  {
    id: 'zt2026-1-2',
    sources: [{ paper: P, no: '一(2)', score: 5 }],
    type: '计算',
    kps: ['1.4', '1.3'],
    pattern: 'delta-sift',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`计算 $\displaystyle\int_{-\infty}^{+\infty}\frac{\sin 2t}{t}\,\delta(t)\,dt$。`,
    answer: String.raw`$2$`,
    solution: String.raw`$\frac{\sin 2t}{t}=2\,\mathrm{Sa}(2t)$ 在 $t=0$ 处连续，取极限值：

$$\lim_{t\to0}\frac{\sin 2t}{t}=2$$

所以 $\displaystyle\int_{-\infty}^{+\infty}\frac{\sin 2t}{t}\delta(t)dt=2$。

**易错点**：不能直接代入 $t=0$ 得到 $\frac00$，要按极限（即 $\mathrm{Sa}(0)=1$）处理。`,
  },
  {
    id: 'zt2026-2-1',
    sources: [{ paper: P, no: '二(1)', score: 10 }],
    type: '分析',
    kps: ['1.8'],
    pattern: 'sys-prop',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`判断系统 $y(t)=\sin[x(t)]\,u(t)$ 是否具有线性、时不变性。`,
    answer: String.raw`非线性；时变。`,
    solution: String.raw`**线性**：设 $x_1\to y_1=\sin[x_1(t)]u(t)$，$x_2\to y_2=\sin[x_2(t)]u(t)$，则

$$T[ax_1+bx_2]=\sin[ax_1(t)+bx_2(t)]\,u(t)\neq a\sin[x_1(t)]u(t)+b\sin[x_2(t)]u(t)$$

反例：$x(t)=\frac{\pi}{2}$ 时 $y=u(t)$；输入加倍为 $\pi$ 时 $y=0\neq2u(t)$。故系统**非线性**。

**时不变性**：输入延时 $t_0$，输出为

$$y_1(t)=T[x(t-t_0)]=\sin[x(t-t_0)]\,u(t)$$

而原输出延时 $t_0$ 为 $y(t-t_0)=\sin[x(t-t_0)]\,u(t-t_0)$。两者不相等（$u(t)$ 没有跟着平移），故系统**时变**。`,
  },
  {
    id: 'zt2026-2-2',
    sources: [{ paper: P, no: '二(2)', score: 10 }],
    type: '分析',
    kps: ['1.8', '2.3'],
    pattern: 'sys-prop',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`判断冲激响应为 $h(t)=u(t-3)$ 的系统是否具有因果性、稳定性。`,
    answer: String.raw`因果；不稳定。`,
    solution: String.raw`**因果性**：LTI 系统因果的充要条件是 $h(t)=0,\ t<0$。$u(t-3)$ 在 $t<3$ 时为 $0$，当然满足 $t<0$ 时为 $0$，故系统**因果**。

**稳定性**：LTI 系统稳定的充要条件是 $\int_{-\infty}^{\infty}|h(t)|dt<\infty$。

$$\int_{-\infty}^{\infty}|u(t-3)|dt=\int_3^{\infty}1\,dt=\infty$$

故系统**不稳定**（相当于延时 3 的积分器，阶跃输入时输出无界）。`,
  },
  {
    id: 'zt2026-3-1',
    sources: [{ paper: P, no: '三(1)', score: 5 }],
    type: '画图',
    kps: ['1.5', '1.4'],
    pattern: 'waveform',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`画出 $x(t)=t\,[u(t-1)-u(t-2)]$ 的波形。`,
    answer: String.raw`$x(t)=\begin{cases}t,&1\le t<2\\0,&\text{其他}\end{cases}$：一段从 $(1,1)$ 到 $(2,2)$ 的斜线段，其余为 $0$。`,
    solution: String.raw`$u(t-1)-u(t-2)$ 是 $[1,2)$ 上高度为 $1$ 的门，乘以 $t$ 后只保留这一段：

$$x(t)=\begin{cases}t,&1\le t<2\\0,&\text{其他}\end{cases}$$

**作图要点**：

- $t<1$：$x(t)=0$；
- $t=1$ 处由 $0$ 跳变到 $1$；
- $1\le t<2$：斜率为 $1$ 的直线，从 $(1,1)$ 升到 $(2,2)$；
- $t=2$ 处由 $2$ 跳回 $0$，之后为 $0$。

坐标轴上要标出 $1$、$2$ 两个时刻和纵坐标 $1$、$2$。`,
  },
  {
    id: 'zt2026-3-2',
    sources: [{ paper: P, no: '三(2)', score: 5 }],
    type: '画图',
    kps: ['1.7', '4.6'],
    pattern: 'ode-to-diagram',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`已知线性时不变系统的输入输出微分方程为

$$\frac{d^2y(t)}{dt^2}+\frac14\frac{dy(t)}{dt}+\frac34y(t)=\frac{dx(t)}{dt}+x(t)$$

试画出该系统的框图。`,
    answer: String.raw`$H(s)=\dfrac{s+1}{s^2+\frac14s+\frac34}$，直接型框图：两个积分器串联，反馈系数 $-\frac14$、$-\frac34$，前馈系数 $1$、$1$。`,
    solution: String.raw`**系统函数**：

$$H(s)=\frac{s+1}{s^2+\frac14s+\frac34}=\frac{s^{-1}+s^{-2}}{1+\frac14s^{-1}+\frac34s^{-2}}$$

**引入中间变量** $q(t)$（输入加法器的输出为 $q''$）：

$$q''(t)=x(t)-\tfrac14q'(t)-\tfrac34q(t),\qquad y(t)=q'(t)+q(t)$$

**框图结构**：

- 输入加法器：输入 $x(t)$，输出 $q''(t)$；
- 两个积分器串联：$q''\xrightarrow{\int}q'\xrightarrow{\int}q$；
- 反馈支路：$q'$ 乘 $-\frac14$、$q$ 乘 $-\frac34$，送回输入加法器；
- 前馈支路：$q'$ 乘 $1$、$q$ 乘 $1$，送入输出加法器，得到 $y(t)$。

**校验**：由框图写回 $H(s)$，分母应为 $s^2+\frac14s+\frac34$，分子为 $s+1$。`,
  },
  {
    id: 'zt2026-3-3',
    sources: [{ paper: P, no: '三(3)', score: 5 }],
    type: '画图',
    kps: ['6.2', '6.1'],
    pattern: 'conv-sum',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`已知序列

$$f(n)=\begin{cases}3,&n=-1\\2,&n=0\\1,&n=1\\0,&\text{else}\end{cases}\qquad g(n)=\begin{cases}1,&n=0\\2,&n=1\\1,&n=2\\0,&\text{else}\end{cases}$$

求序列 $y(n)=f(n)*g(n)$，并画出其时域波形。`,
    answer: String.raw`$y(n)=\{3,\ \underset{\uparrow}{8},\ 8,\ 4,\ 1\}$，即 $n=-1,0,1,2,3$ 时分别为 $3,8,8,4,1$，其余为 $0$。`,
    solution: String.raw`用不进位乘法：

| | | | | | |
|---|---|---|---|---|---|
| $f$ | | | 3 | 2 | 1 |
| $g$ | | | 1 | 2 | 1 |
| | | | 3 | 2 | 1 |
| | | 6 | 4 | 2 | |
| | 3 | 2 | 1 | | |
| $y$ | 3 | 8 | 8 | 4 | 1 |

起点 $=-1+0=-1$，长度 $=3+3-1=5$：

$$y(n)=3\delta(n+1)+8\delta(n)+8\delta(n-1)+4\delta(n-2)+\delta(n-3)$$

**校验**：$\sum f=6$，$\sum g=4$，$\sum y=24=6\times4$。

**作图**：在 $n=-1,0,1,2,3$ 处画高度为 $3,8,8,4,1$ 的竖线（顶端画圆点），其余点为 $0$。`,
  },
  {
    id: 'zt2026-4-1',
    sources: [{ paper: P, no: '四(1)', score: 5 }],
    type: '计算',
    kps: ['3.3'],
    pattern: 'ft-basic',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`求 $e^{-3t}u(t)$ 的傅里叶变换。`,
    answer: String.raw`$\dfrac{1}{3+j\omega}$`,
    solution: String.raw`$$F(j\omega)=\int_0^{\infty}e^{-3t}e^{-j\omega t}dt=\frac{1}{3+j\omega}$$

即常用对 $e^{-at}u(t)\leftrightarrow\frac{1}{a+j\omega}\ (a>0)$。`,
  },
  {
    id: 'zt2026-4-2',
    sources: [{ paper: P, no: '四(2)', score: 5 }],
    type: '计算',
    kps: ['3.5', '3.3'],
    pattern: 'ft-basic',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`求 $\cos(2\pi t)$ 的傅里叶变换。`,
    answer: String.raw`$\pi[\delta(\omega+2\pi)+\delta(\omega-2\pi)]$`,
    solution: String.raw`$\cos(2\pi t)=\frac12\left(e^{j2\pi t}+e^{-j2\pi t}\right)$，由 $1\leftrightarrow2\pi\delta(\omega)$ 和频移性质：

$$e^{\pm j2\pi t}\leftrightarrow2\pi\delta(\omega\mp2\pi)$$

$$\cos(2\pi t)\leftrightarrow\pi[\delta(\omega+2\pi)+\delta(\omega-2\pi)]$$`,
  },
  {
    id: 'zt2026-4-3',
    sources: [{ paper: P, no: '四(3)', score: 5 }],
    type: '计算',
    kps: ['3.3'],
    pattern: 'ft-basic',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`求 $u(t+1)-u(t-1)$ 的傅里叶变换。`,
    answer: String.raw`$2\,\mathrm{Sa}(\omega)=\dfrac{2\sin\omega}{\omega}$`,
    solution: String.raw`$u(t+1)-u(t-1)$ 是以原点为中心、宽度 $\tau=2$、高度 $1$ 的门函数 $G_2(t)$。由 $G_\tau(t)\leftrightarrow\tau\,\mathrm{Sa}\!\left(\frac{\omega\tau}{2}\right)$：

$$u(t+1)-u(t-1)\leftrightarrow2\,\mathrm{Sa}(\omega)=\frac{2\sin\omega}{\omega}$$

也可直接积分：$\int_{-1}^{1}e^{-j\omega t}dt=\frac{e^{j\omega}-e^{-j\omega}}{j\omega}=\frac{2\sin\omega}{\omega}$。`,
  },
  {
    id: 'zt2026-5-1',
    sources: [{ paper: P, no: '五(1)', score: 5 }],
    type: '计算',
    kps: ['3.4'],
    pattern: 'ft-property',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`已知 $x(t)$ 的傅里叶变换为 $X(j\omega)$，试求 $x(2t)$ 的傅里叶变换。`,
    answer: String.raw`$\dfrac12X\!\left(j\dfrac{\omega}{2}\right)$`,
    solution: String.raw`尺度变换性质：$x(at)\leftrightarrow\frac{1}{|a|}X\!\left(j\frac{\omega}{a}\right)$。取 $a=2$：

$$x(2t)\leftrightarrow\frac12X\!\left(j\frac{\omega}{2}\right)$$

（时域压缩 2 倍，频谱展宽 2 倍、幅度减半。）`,
  },
  {
    id: 'zt2026-5-2',
    sources: [{ paper: P, no: '五(2)', score: 5 }],
    type: '计算',
    kps: ['7.3'],
    pattern: 'z-calc',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`因果序列的 $z$ 变换（题中称"系统函数"）为 $H(z)=\dfrac{1}{1-\frac14z^{-1}-\frac34z^{-2}}$，求初值和终值。`,
    answer: String.raw`初值 $h(0)=1$；终值 $h(\infty)=\dfrac47$。`,
    solution: String.raw`$$H(z)=\frac{z^2}{z^2-\frac14z-\frac34}=\frac{z^2}{(z-1)(z+\frac34)}$$

**初值**（因果序列）：

$$h(0)=\lim_{z\to\infty}H(z)=1$$

**终值**：先检查条件。极点为 $z=1$（一阶）和 $z=-\frac34$（在单位圆内），满足终值定理条件：

$$h(\infty)=\lim_{z\to1}(z-1)H(z)=\lim_{z\to1}\frac{z^2}{z+\frac34}=\frac{1}{\frac74}=\frac47$$

**验证**：部分分式得 $h(n)=\left[\frac47+\frac37\left(-\frac34\right)^n\right]u(n)$，$h(0)=1$，$h(\infty)=\frac47$。

**易错点**：用终值定理前必须写明极点条件；若有单位圆外的极点或 $z=1$ 处的二阶极点，终值不存在。`,
  },
  {
    id: 'zt2026-6',
    sources: [{ paper: P, no: '六', score: 15 }],
    type: '分析',
    kps: ['2.2', '1.8'],
    pattern: 'full-response-decomp',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`在初始状态不变的情况下，已知当输入为 $x(t)$ 时，全响应为 $y(t)=[e^{-t}-\cos2t]u(t)$；当输入变成原来的 2 倍时，全响应为 $y(t)=[2e^{-t}-5\cos2t]u(t)$。求：

(1) 当输入为 $x(t-3)$ 时的全响应；

(2) 当初始状态变为原来的 2 倍、激励变为原来的一半时的全响应。`,
    answer: String.raw`$y_{zi}=3\cos2t\,u(t)$，$y_{zs}=(e^{-t}-4\cos2t)u(t)$。

(1) $y(t)=3\cos2t\,u(t)+\left[e^{-(t-3)}-4\cos2(t-3)\right]u(t-3)$

(2) $y(t)=\left(\frac12e^{-t}+4\cos2t\right)u(t)$`,
    solution: String.raw`设零输入响应为 $y_{zi}$，输入 $x(t)$ 时零状态响应为 $y_{zs}$。由线性：

$$\begin{cases}y_{zi}+y_{zs}=(e^{-t}-\cos2t)u(t)\\y_{zi}+2y_{zs}=(2e^{-t}-5\cos2t)u(t)\end{cases}$$

两式相减：$y_{zs}=(e^{-t}-4\cos2t)u(t)$；代回得 $y_{zi}=3\cos2t\,u(t)$。

**(1)** 初始状态不变，$y_{zi}$ 不变；由时不变性，输入 $x(t-3)$ 时零状态响应为 $y_{zs}(t-3)$：

$$y(t)=3\cos2t\,u(t)+\left[e^{-(t-3)}-4\cos2(t-3)\right]u(t-3)$$

**(2)** 零输入响应与初始状态成线性，零状态响应与激励成线性：

$$y(t)=2y_{zi}+\frac12y_{zs}=\left(6\cos2t+\frac12e^{-t}-2\cos2t\right)u(t)=\left(\frac12e^{-t}+4\cos2t\right)u(t)$$

**易错点**：延时后的零状态响应要把 $u(t)$ 一起换成 $u(t-3)$。`,
  },
  {
    id: 'zt2026-7',
    sources: [{ paper: P, no: '七', score: 15 }],
    type: '分析',
    kps: ['4.4', '4.7'],
    pattern: 'ft-exist-from-Hs',
    verified: 'checked',
    note: NOTE + ' 题目未写明因果，按惯例默认因果系统作答。',
    stem: String.raw`下列系统的傅里叶变换是否存在？若存在，请写出傅里叶变换；若不存在，请写出原因。

(1) $H(s)=\dfrac{2s}{s^2+4s+3}$　(2) $H(s)=\dfrac{s}{s-1}$　(3) $H(s)=\dfrac{s^2+5}{s^2+3s+2}$`,
    answer: String.raw`(1) 存在，$H(j\omega)=\dfrac{2j\omega}{3-\omega^2+j4\omega}$

(2) 不存在：极点 $s=1$ 在右半平面，因果系统的 ROC 为 $\mathrm{Re}\{s\}>1$，不含 $j\omega$ 轴

(3) 存在，$H(j\omega)=\dfrac{5-\omega^2}{2-\omega^2+j3\omega}$`,
    solution: String.raw`判据：因果系统的 ROC 为最右侧极点的右边；ROC 包含 $j\omega$ 轴（极点全在左半平面）时，$H(j\omega)=H(s)|_{s=j\omega}$。

**(1)** $s^2+4s+3=(s+1)(s+3)$，极点 $-1,-3$ 都在左半平面，ROC $\mathrm{Re}\{s\}>-1$ 含 $j\omega$ 轴，存在：

$$H(j\omega)=\frac{2j\omega}{(j\omega)^2+4j\omega+3}=\frac{2j\omega}{3-\omega^2+j4\omega}$$

**(2)** 极点 $s=1$ 在右半平面，ROC $\mathrm{Re}\{s\}>1$ 不含 $j\omega$ 轴；对应 $h(t)=\delta(t)+e^{t}u(t)$ 随时间增长，不绝对可积，傅里叶变换**不存在**。

**(3)** $s^2+3s+2=(s+1)(s+2)$，极点 $-1,-2$ 在左半平面，存在：

$$H(j\omega)=\frac{5-\omega^2}{2-\omega^2+j3\omega}$$`,
  },
  {
    id: 'zt2026-8',
    sources: [{ paper: P, no: '八', score: 15 }],
    type: '计算',
    kps: ['5.2', '3.4', '3.3'],
    pattern: 'nyquist',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`已知 $y_1(t)=\mathrm{Sa}(100\pi t)$，$y_2(t)=\mathrm{Sa}(200\pi t)$，求：

(1) $y_1(t)$ 的奈奎斯特抽样频率；

(2) $y_1(t)+y_2(t)$ 的奈奎斯特抽样频率。`,
    answer: String.raw`(1) $f_s=100\ \text{Hz}$（$\omega_s=200\pi\ \text{rad/s}$）

(2) $f_s=200\ \text{Hz}$（$\omega_s=400\pi\ \text{rad/s}$）`,
    solution: String.raw`由门函数变换 $G_\tau(t)\leftrightarrow\tau\,\mathrm{Sa}(\frac{\omega\tau}{2})$ 和对偶性：

$$\mathrm{Sa}(\omega_ct)\leftrightarrow\frac{\pi}{\omega_c}G_{2\omega_c}(\omega)$$

即 $\mathrm{Sa}(\omega_ct)$ 的频谱是 $|\omega|<\omega_c$ 的门，最高角频率为 $\omega_c$。

**(1)** $y_1$：$\omega_m=100\pi$，$f_m=\frac{\omega_m}{2\pi}=50$ Hz，奈奎斯特抽样频率

$$f_s=2f_m=100\ \text{Hz}\quad(\omega_s=200\pi\ \text{rad/s})$$

**(2)** 相加后的最高频率取两者中较大者：$\omega_m=200\pi$，$f_m=100$ Hz，

$$f_s=2f_m=200\ \text{Hz}\quad(\omega_s=400\pi\ \text{rad/s})$$

**对比**：若是相乘 $y_1y_2$，最高角频率为 $100\pi+200\pi=300\pi$，$f_s=300$ Hz；若是 $\mathrm{Sa}^2(100\pi t)$，最高角频率为 $200\pi$。`,
  },
  {
    id: 'zt2026-9',
    sources: [{ paper: P, no: '九', score: 15 }],
    type: '分析',
    kps: ['7.7', '7.2', '7.1', '6.4'],
    pattern: 'hz-roc-all',
    verified: 'checked',
    note: NOTE,
    stem: String.raw`已知线性系统的系统函数 $H(z)=\dfrac{z}{z^2-\frac52z+1}$，试求：

(1) 该系统的输入输出差分方程；

(2) 所有可能的收敛域以及对应的单位样值响应 $h(n)$。`,
    answer: String.raw`(1) $y(n)-\frac52y(n-1)+y(n-2)=x(n-1)$

(2) $H(z)=\frac23\left[\dfrac{z}{z-2}-\dfrac{z}{z-\frac12}\right]$：

- $|z|>2$：$h(n)=\frac23\left(2^n-2^{-n}\right)u(n)$（因果，不稳定）
- $\frac12<|z|<2$：$h(n)=-\frac23\,2^nu(-n-1)-\frac23\left(\frac12\right)^nu(n)$（双边，稳定）
- $|z|<\frac12$：$h(n)=\frac23\left(2^{-n}-2^n\right)u(-n-1)$（反因果，不稳定）`,
    solution: String.raw`**(1)** 分子分母同除以 $z^2$：

$$H(z)=\frac{z^{-1}}{1-\frac52z^{-1}+z^{-2}}=\frac{Y(z)}{X(z)}$$

交叉相乘并取逆变换：

$$y(n)-\frac52y(n-1)+y(n-2)=x(n-1)$$

**(2)** $z^2-\frac52z+1=(z-2)(z-\frac12)$，极点 $2$ 和 $\frac12$。

$$\frac{H(z)}{z}=\frac{1}{(z-2)(z-\frac12)}=\frac{\frac23}{z-2}-\frac{\frac23}{z-\frac12}\ \Rightarrow\ H(z)=\frac23\left[\frac{z}{z-2}-\frac{z}{z-\frac12}\right]$$

两个极点把 $z$ 平面分成三个区域。极点在 ROC 内侧对应右边序列 $p^nu(n)$，在外侧对应左边序列 $-p^nu(-n-1)$：

- **$|z|>2$**（因果）：$h(n)=\frac23\left[2^n-\left(\frac12\right)^n\right]u(n)$。ROC 不含单位圆，不稳定。
- **$\frac12<|z|<2$**（双边）：$z=\frac12$ 在内侧，$z=2$ 在外侧，
$$h(n)=-\frac23\,2^nu(-n-1)-\frac23\left(\frac12\right)^nu(n)$$
ROC 含单位圆，稳定。
- **$|z|<\frac12$**（反因果）：$h(n)=\frac23\left[-2^n+\left(\frac12\right)^n\right]u(-n-1)$。不稳定。

**校验**：三个 $h(n)$ 代入差分方程（$x=\delta$）均成立。`,
  },
  {
    id: 'zt2026-10',
    sources: [{ paper: P, no: '十', score: 20 }],
    type: '分析',
    kps: ['4.6', '4.2', '4.7', '3.7'],
    pattern: 'zp-h0',
    verified: 'checked',
    note: NOTE + ' 同型题：2023/2024/2025 综合题（h(0+)=2）。',
    figures: ['figures/zt2026/q10-zp.png'],
    stem: String.raw`已知线性时不变系统的零极点分布图如图所示（零点 $s=0$，极点 $s=-1\pm j\frac{\sqrt3}{2}$），且 $h(0^+)=1$。

(1) 求该系统的系统函数 $H(s)$；

(2) 判断系统是否稳定；

(3) 当输入为 $x(t)=\sin\!\left(\frac{\sqrt3}{2}t+\frac{\pi}{4}\right)u(t)$ 时，求系统输出的稳态响应 $y_s(t)$。`,
    answer: String.raw`(1) $H(s)=\dfrac{s}{s^2+2s+\frac74}$

(2) 极点 $-1\pm j\frac{\sqrt3}{2}$ 都在左半平面，（因果）系统稳定

(3) $y_s(t)=\dfrac{\sqrt3}{4}\sin\!\left(\dfrac{\sqrt3}{2}t+\dfrac{5\pi}{12}\right)$`,
    solution: String.raw`**(1)** 由零极点图：

$$H(s)=\frac{Ks}{\left(s+1-j\frac{\sqrt3}{2}\right)\left(s+1+j\frac{\sqrt3}{2}\right)}=\frac{Ks}{(s+1)^2+\frac34}=\frac{Ks}{s^2+2s+\frac74}$$

由初值定理：

$$h(0^+)=\lim_{s\to\infty}sH(s)=\lim_{s\to\infty}\frac{Ks^2}{s^2+2s+\frac74}=K=1$$

所以 $H(s)=\dfrac{s}{s^2+2s+\frac74}$。

**(2)** 极点实部为 $-1<0$，全部位于 $s$ 左半平面，因果系统**稳定**。

**(3)** 输入角频率 $\omega_0=\frac{\sqrt3}{2}$：

$$H(j\omega_0)=\frac{j\frac{\sqrt3}{2}}{\frac74-\frac34+j\sqrt3}=\frac{j\frac{\sqrt3}{2}}{1+j\sqrt3}$$

$|1+j\sqrt3|=2$，相角 $\frac{\pi}{3}$；分子模 $\frac{\sqrt3}{2}$，相角 $\frac{\pi}{2}$，所以

$$|H(j\omega_0)|=\frac{\sqrt3}{4},\qquad\varphi(\omega_0)=\frac{\pi}{2}-\frac{\pi}{3}=\frac{\pi}{6}$$

$$y_s(t)=\frac{\sqrt3}{4}\sin\!\left(\frac{\sqrt3}{2}t+\frac{\pi}{4}+\frac{\pi}{6}\right)=\frac{\sqrt3}{4}\sin\!\left(\frac{\sqrt3}{2}t+\frac{5\pi}{12}\right)$$

**补充**（同型题常考 $h(t)$）：$H(s)=\frac{(s+1)-1}{(s+1)^2+\frac34}$，

$$h(t)=e^{-t}\left[\cos\frac{\sqrt3}{2}t-\frac{2}{\sqrt3}\sin\frac{\sqrt3}{2}t\right]u(t)$$

可用 $h(0^+)=1$ 校验。`,
  },
];

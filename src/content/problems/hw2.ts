import type { Problem } from '../../types';
import { problem as make } from './helper';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make('hw2', ...args);
const r = String.raw;

export const hw2: Problem[] = [
  p('2.12(1)', ['2.4', '3.7'], 'conv-integral', r`求 $Ae^{-at}u(t)*C\sin(\omega_0t)$，$a>0$，正弦为全时域信号。`, r`$\frac{AC}{a^2+\omega_0^2}[a\sin(\omega_0t)-\omega_0\cos(\omega_0t)]$（全时域）。`, r`将指数信号作积分变量：$AC\int_0^\infty e^{-a\tau}\sin[\omega_0(t-\tau)]d\tau$。展开差角，再用 $\int_0^\infty e^{-a\tau}\cos\omega_0\tau d\tau=a/(a^2+\omega_0^2)$ 与正弦积分 $\omega_0/(a^2+\omega_0^2)$。不额外乘阶跃。`),
  p('2.12(2)', ['2.4'], 'conv-integral', r`求 $u(t)*e^{-at}u(t)$，$a>0$。`, r`$\frac{1-e^{-at}}{a}u(t)$。`, r`两个因果信号在 $t\ge0$ 的重叠积分为 $\int_0^t e^{-a\tau}d\tau$；$t<0$ 无重叠。`),
  p('2.12(3)', ['2.4', '1.4'], 'conv-integral', r`求 $\delta(t)*\cos(\omega_0t+45^\circ)$。`, r`$\cos(\omega_0t+\pi/4)$。`, '零时刻单位冲激是卷积的单位元，保留全时域余弦及其初相。'),
  p('2.12(4)', ['2.4'], 'conv-integral', r`求 $(1+t)[u(t)-u(t-1)]*[u(t-1)-u(t-2)]$。`, r`$y(t)=\begin{cases}(t^2-1)/2&1\le t<2\\-t^2/2+t+3/2&2\le t<3\\0&\text{其他}\end{cases}$。`, r`第一个支撑区间为 $[0,1]$，第二个为 $[1,2]$。卷积积分区间为 $[0,1]\cap[t-2,t-1]$。$1\le t<2$ 积分 $\int_0^{t-1}(1+\tau)d\tau$；$2\le t<3$ 积分 $\int_{t-2}^1(1+\tau)d\tau$。在 $t=2$ 两段均为 $3/2$，结果面积为 $3/2$。`),
  p('2.12(5)', ['2.4', '1.4'], 'conv-integral', r`求 $\cos(\omega_0t)*[\delta(t+1)-\delta(t-1)]$。`, r`$\cos[\omega_0(t+1)]-\cos[\omega_0(t-1)]=-2\sin(\omega_0t)\sin\omega_0$。`, r`正冲激提前 1，负冲激延时 1 后相减；用 $\cos(A+B)-\cos(A-B)=-2\sin A\sin B$ 化简。`),
  p('2.12(6)', ['2.4'], 'conv-integral', r`求 $u(t-2)*e^tu(-t-1)$。`, r`$y(t)=\begin{cases}e^{t-2}&t<1\\e^{-1}&t\ge1\end{cases}$。`, r`选 $u(\tau-2)$ 与 $e^{t-\tau}u[-(t-\tau)-1]$ 相乘，要求 $\tau\ge2$ 且 $\tau\ge t+1$。因此 $y=\int_{\max(2,t+1)}^\infty e^{t-\tau}d\tau=e^{t-\max(2,t+1)}$。结果在 $t=1$ 连续，并非因果。`),
];

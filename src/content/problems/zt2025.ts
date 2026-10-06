import type { Problem } from '../../types';
import { problem as make } from './helper';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make('zt2025', ...args);
const r = String.raw;
export const zt2025: Problem[] = [
  p('一(1)', ['1.8'], 'sys-prop', r`判断系统 $y(t)=|x(t)|$ 的线性、时不变性及因果性。`, '非线性、时不变、因果。', r`输入乘负数不满足齐次性，例如 $|-x|=|x|\ne-|x|$。输入移位与输出移位均得到 $|x(t-t_0)|$。只依赖当前输入，故因果。`, { type: '分析' }),
  p('一(2)', ['1.4'], 'delta-sift', r`计算 $\int_{-\infty}^{\infty}(t-\sin t)\delta(t-\pi/3)dt$。`, r`$\pi/3-\sqrt3/2$。`, r`筛选点为 $\pi/3$，代入 $t-\sin t$。与 2026 的加号变式区别在第二项的符号。`),
  p('一(3)', ['1.2'], 'period', r`按回忆卷补全为 $x(t)=\sin(5\pi t/6)$，求基本周期。`, r`$T_0=12/5$ 秒。`, r`角频率为 $5\pi/6$，周期 $2\pi/(5\pi/6)=12/5$。`, { verified: 'uncertain', note: '回忆题面只写 5πt/6 而询问周期，疑漏写 sin。此处按正弦信号补全；若按字面线性斜坡理解，则不是周期信号。' }),
  p('一(4)', ['2.4'], 'conv-integral', r`求 $u(t)*[e^{-2t}u(t)]$。`, r`$\tfrac12(1-e^{-2t})u(t)$。`, r`两者都因果，$t\ge0$ 时积分 $\int_0^te^{-2\tau}d\tau=(1-e^{-2t})/2$。`),
  p('一(5)', ['6.3', '7.7'], 'sys-prop', r`因果 LTI 系统 $h(n)=a^nu(n)$，稳定时 $a$ 满足什么？`, r`$|a|<1$。`, r`稳定要求 $\sum_{n=0}^\infty|a|^n$ 收敛；几何级数收敛的充要条件为公比绝对值小于 1。`, { type: '填空' }),
  p('一(6)', ['7.1', '7.2'], 'hz-roc-all', r`$X(z)=\dfrac{z^{-1}}{1-(10/3)z^{-1}+z^{-2}}$ 对应双边序列，求 ROC 和 $x(n)$。`, r`$1/3<|z|<3$；$x(n)=-\tfrac38\,3^nu(-n-1)-\tfrac38(1/3)^nu(n)$。`, r`$X=z/[(z-3)(z-1/3)]=\tfrac38[z/(z-3)-z/(z-1/3)]$。双边选择两极点间圆环；大极点取左边，系数负号，小极点取右边。该序列两侧均非零，不能限制为单边的 n 范围。`, { verified: 'uncertain', note: '原填空写“若是双边序列，则 n 满足”，疑把收敛域变量 z 写成 n；按 ROC 与双边逆变换共同作答。' }),
  p('一(7)', ['2.4'], 'conv-integral', r`求 $\delta(t-1)*\cos\omega t$。`, r`$\cos[\omega(t-1)]$。`, r`冲激在 t=1，卷积使余弦延时 1。注意与 2024 年 δ(t+1) 的提前变式区分。`),
  p('一(8)', ['6.1', '1.2', '5.2'], 'period', r`取 $x(t)=\sin(5\pi t/6)$，以 $f_s=5$ Hz 采样，求序列并判断周期性。`, r`$x(n)=\sin(\pi n/6)$，为基本周期 12 的序列。`, r`$t=n/5$，离散角频率为 $\pi/6$。$N\pi/6=2\pi k$，最小正整数为 $N=12$。`, { verified: 'uncertain', note: '本小题没有给出被采样信号，按同页第 3 小题补全的正弦信号理解。更换原信号后结论须重新计算。' }),
  p('三(1)', ['2.4'], 'conv-integral', r`$x_1=u(t)-u(t-1)$，$x_2=u(t-2)-u(t-3)$，图解计算卷积。`, r`$y(t)=\begin{cases}t-2&2\le t<3\\4-t&3\le t<4\\0&\text{其他}\end{cases}$。`, r`两矩形宽均为 1，起点相加为 2。重叠长度先从 0 增至 1（峰值 t=3），再降至 0（t=4）；面积等于两矩形面积之积 1。`),
  p('三(2)-1', ['3.3'], 'ft-basic', r`求 $x_1(t)=\delta(t)-e^{-2t}u(t)$ 的 FT。`, r`$X_1(j\omega)=1-1/(2+j\omega)$。`, r`冲激变换为 1，衰减指数变换为 $1/(2+j\omega)$，应用线性叠加。`),
  p('三(2)-2', ['3.4'], 'ft-property', r`$a>0$，求 $x_2(t)=1/(a+jt)$ 的 FT。`, r`$X_2(j\omega)=2\pi e^{a\omega}u(-\omega)$。`, r`已知 $e^{-at}u(t)\leftrightarrow1/(a+j\omega)$。由对偶性质 $F(jt)\leftrightarrow2\pi f(-\omega)$，直接得所示单边负频率谱。`, { verified: 'corrected', note: '手写参考答案给出 πe^{-a|ω|}sgn(ω)，不满足对偶变换。独立用对偶与逆变换积分复核得到此处答案。' }),
  p('三(3)', ['4.1', '4.2'], 'laplace-calc', r`$x(t)=e^{-2t}\cos(\pi t)$（$0\le t\le2$），其余为 0。求 LT（双边）。`, r`$X(s)=\dfrac{(s+2)[1-e^{-2(s+2)}]}{(s+2)^2+\pi^2}$，所有有限 $s$ 收敛。`, r`把余弦拆为两个复指数，得到 $\frac12[\frac{1-e^{-2(s+2-j\pi)}}{s+2-j\pi}+\frac{1-e^{-2(s+2+j\pi)}}{s+2+j\pi}]$。利用 $e^{\pm j2\pi}=1$ 合并。表观分母零点均可去，有限时间支撑无真极点。`),
  p('三(4)-1', ['7.1'], 'z-calc', r`求 $x_1(n)=(1/4)^nu(n)$ 的 ZT 与 ROC。`, r`$X_1(z)=z/(z-1/4)$，$|z|>1/4$。`, r`几何级数 $\sum_{n=0}^\infty(1/(4z))^n$ 求和，收敛需 $|1/(4z)|<1$。`),
  p('三(4)-2', ['7.1', '6.1'], 'z-calc', r`有限序列 $x_2(n)=\{1,2,3,2\}$，首项对应 $n=0$。求 ZT 与 ROC。`, r`$X_2(z)=1+2z^{-1}+3z^{-2}+2z^{-3}$，$z\ne0$（含无穷点）。`, r`按定义逐项乘 $z^{-n}$ 求和。有限非负时刻序列仅可能在零点不收敛，最大正幂是零次，所以包含无穷点。`),
];

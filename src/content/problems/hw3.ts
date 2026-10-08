import type { Problem } from '../../types';
import { problem as make } from './helper';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make('hw3', ...args);
const r = String.raw;
const base = r`基准信号 $x(t)=t$（$0<t<1$），其余为零。记其频谱为 $Q(\omega)=X(j\omega)$。`;
const q = r`$Q(\omega)=[(1+j\omega)e^{-j\omega}-1]/\omega^2$，$Q(0)=1/2$。`;
const prop = r`已知 $x_1(t)\leftrightarrow X_1(j\omega)$，记 $G(\omega)=X_1(j\omega)$，$G'$ 表示对实变量 $\omega$ 的导数。`;
const wave20 = r`实信号 $x(t)$ 在 $[-1,0]$ 为 2，$[0,1]$ 为 $2-t$，$[1,2]$ 为 $t$，$[2,3]$ 为 2，区间外为零（图 3.20）。记 $X(j\omega)$ 为其 FT。`;
const fig11 = { figures: ['figures/hw3/q11.png'] };
const fig20 = { figures: ['figures/hw3/q20.png'] };

export const hw3: Problem[] = [
  p('3.11(x)', ['3.3', '3.4'], 'ft-property', base + '按定义求基准信号的 FT。', q, r`积分 $Q=\int_0^1te^{-j\omega t}dt$，分部积分得到所列结果。$\omega=0$ 是可去奇点，值为面积 $\int_0^1t\,dt=1/2$。`, fig11),
  p('3.11(1)', ['3.4'], 'ft-property', base + r`求图中的 $x_1(t)=t+1$（$-1<t<0$，其余为零）的频谱具体形式。`, r`$X_1(j\omega)=[1+j\omega-e^{j\omega}]/\omega^2$，$X_1(0)=1/2$。`, q + r`因 $x_1(t)=x(t+1)$，提前 1 对应乘 $e^{j\omega}$。`, fig11),
  p('3.11(2)', ['3.4'], 'ft-property', base + r`求图中的 $x_2(t)=-t$（$-1<t<0$，其余为零）的频谱具体形式。`, r`$X_2(j\omega)=[(1-j\omega)e^{j\omega}-1]/\omega^2$，$X_2(0)=1/2$。`, q + r`因 $x_2=x(-t)$，频谱为 $Q(-\omega)$。`, fig11),
  p('3.11(3)', ['3.4'], 'ft-property', base + r`求图中的 $x_3(t)=t$（$0<t<2$，其余为零）的频谱具体形式。`, r`$X_3(j\omega)=[(1+2j\omega)e^{-2j\omega}-1]/\omega^2$，$X_3(0)=2$。`, q + r`$x_3=2x(t/2)$，幅度乘 2、时域展宽 2，故 $X_3=4Q(2\omega)$。用原图三角面积 2 检查直流值。`, { ...fig11, verified: 'corrected', note: '纸书第 70 页把 2x(t/2) 的变换写成 2X(jω/2)，尺度方向和系数都不对。应为 4X(j2ω)，并用积分复核。' }),
  p('3.11(4)', ['3.4'], 'ft-property', base + r`求图中的 $x_4(t)=-t-1$（$-2<t<-1$，其余为零）的频谱具体形式。`, r`$X_4(j\omega)=e^{j\omega}[(1-j\omega)e^{j\omega}-1]/\omega^2$，$X_4(0)=1/2$。`, q + r`$x_4=x(-t-1)=x[-(t+1)]$，先反褶再提前 1，故为 $e^{j\omega}Q(-\omega)$。`, fig11),
  p('3.11(5)', ['3.4'], 'ft-property', base + r`求图中的 $x_5(t)=t-1$（$1<t<2$，其余为零）的频谱具体形式。`, r`$X_5(j\omega)=e^{-j\omega}[(1+j\omega)e^{-j\omega}-1]/\omega^2$，$X_5(0)=1/2$。`, q + r`$x_5=x(t-1)$，延时 1 对应乘 $e^{-j\omega}$。`, fig11),
  p('3.11(6)', ['3.4'], 'ft-property', base + r`求图中的 $x_6(t)=2(t-1)$（$1<t<2$，其余为零）的频谱具体形式。`, r`$X_6(j\omega)=2e^{-j\omega}[(1+j\omega)e^{-j\omega}-1]/\omega^2$，$X_6(0)=1$。`, q + r`$x_6=2x(t-1)$，在上一变式的频谱上再乘 2。`, fig11),
  p('3.13(1)', ['3.3', '3.4'], 'ft-property', r`用对偶和时移性质求 $x(t)=\sin[2\pi(t-2)]/[\pi(t-2)]$ 的 FT。`, r`$X(j\omega)=e^{-2j\omega}$（$|\omega|<2\pi$），带外为零。边缘可按对称极限取半值。`, r`$\sin(\omega_ct)/(\pi t)$ 对应高度 1、截止角频率 $\omega_c$ 的矩形频谱。此处 $\omega_c=2\pi$，延时 2 再乘 $e^{-2j\omega}$。`),
  p('3.13(2)', ['3.3', '3.4'], 'ft-property', r`$a>0$，用对偶性质求 $2a/(a^2+t^2)$ 的 FT。`, r`$2\pi e^{-a|\omega|}$。`, r`先由左右指数积分得 $e^{-a|t|}\leftrightarrow2a/(a^2+\omega^2)$。再用对偶性 $F(jt)\leftrightarrow2\pi f(-\omega)$，指数为偶函数。`),
  p('3.14(1)', ['3.4'], 'ft-property', prop + r`求 $tx_1(5t)$ 的频谱。`, r`$\frac{j}{25}G'(\omega/5)$。`, r`先尺度变换得 $G(\omega/5)/5$，再对整个表达式求 $\omega$ 导数并乘 $j$。链式求导再给一个 $1/5$。`),
  p('3.14(2)', ['3.4'], 'ft-property', prop + r`求 $(t-3)x_1(t-3)$ 的频谱。`, r`$je^{-3j\omega}G'(\omega)$。`, r`整体看成 $tx_1(t)$ 延时 3；先频域微分，再乘延时相位，不能把延时相位也误放入微分。`),
  p('3.14(3)', ['3.4'], 'ft-property', prop + r`求 $(t-3)x_1(-3t)$ 的频谱。`, r`$-\frac{j}{9}G'(-\omega/3)-G(-\omega/3)$。`, r`尺度变换得 $G(-\omega/3)/3$。乘 $t$ 时对 $\omega$ 求导得到 $-jG'(-\omega/3)/9$；再减去三倍原尺度变换，得第二项。`),
  p('3.14(4)', ['3.4'], 'ft-property', prop + r`求 $t\,dx_1(t)/dt$ 的频谱。`, r`$-G(\omega)-\omega G'(\omega)$。`, r`先对时域求导得到 $j\omega G$，再乘 $t$ 得 $j(d/d\omega)[j\omega G]$，使用乘积法则。`),
  p('3.14(5)', ['3.4'], 'ft-property', prop + r`求 $x_1(4-t)$ 的频谱。`, r`$e^{-4j\omega}G(-\omega)$。`, r`先反褶为 $x_1(-t)$，再延时 4。`),
  p('3.14(6)', ['3.4'], 'ft-property', prop + r`求 $(4-t)x_1(4-t)$ 的频谱。`, r`$je^{-4j\omega}G'(-\omega)$。`, r`令 $v(t)=tx_1(t)$，则题中信号为 $v(4-t)$。$V(\omega)=jG'(\omega)$，反褶延时后为 $e^{-4j\omega}V(-\omega)$。若写成 $-je^{-4j\omega}(d/d\omega)G(-\omega)$，须再用链式求导，两种写法相同。`),
  p('3.14(7)', ['3.4'], 'ft-property', prop + r`求 $x_1(4t-7)$ 的频谱。`, r`$\frac14 e^{-7j\omega/4}G(\omega/4)$。`, r`把信号写成 $x_1[4(t-7/4)]$，先压缩 4，再将所得信号延时 $7/4$。`),
  p('3.14(8)', ['3.4'], 'ft-property', prop + r`求 $e^{j3t}x_1(t)$ 的频谱。`, r`$G(\omega-3)$。`, '乘正指数使频谱向正角频率平移 3。'),
  p('3.20(1)', ['3.4', '1.6'], 'ft-property', wave20 + '求相频特性。', r`记 $R(\omega)=4\sin(2\omega)/\omega-2(1-\cos\omega)/\omega^2$。相位为 $-\omega$（$R>0$），$\pi-\omega$（$R<0$），均模 $2\pi$；$R=0$ 处相位未定义。`, r`将原信号提前 1 得实偶函数：高度 2、宽 4 的矩形减去底宽 2、高 1 的中心三角形。其实频谱为 $R$，$X=e^{-j\omega}R$。实数为正时相角 0，为负时相角 $\pi$。`, { ...fig20, verified: 'corrected', note: '纸书第 76 页把实频谱为正、为负时的相位分支条件写反。这里按正实数相位 0、负实数相位 π 更正。' }),
  p('3.20(2)', ['3.4'], 'ft-property', wave20 + '求 X(0)。', '$7$。', r`$X(0)=\int xdt=2+3/2+3/2+2=7$，也等于宽 4、高 2 的矩形面积 8 减去三角面积 1。`, fig20),
  p('3.20(3)', ['3.4'], 'ft-property', wave20 + r`求 $\int_{-\infty}^{\infty}X(j\omega)d\omega$。`, '$4\\pi$。', r`在 $t=0$ 信号连续且值为 2，由逆变换 $x(0)=(1/2\pi)\int Xd\omega$，结果为 $4\pi$。频谱积分按傅里叶反演的极限理解。`, fig20),
  p('3.20(4)', ['3.4', '2.4'], 'ft-property', wave20 + r`求 $\int_{-\infty}^{\infty}X(j\omega)\frac{2\sin\omega}{\omega}e^{2j\omega}d\omega$。`, '$7\\pi$。', r`第二因子是矩形 $v(t)=u(t+3)-u(t+1)$ 的 FT。频域乘积的积分等于 $2\pi(x*v)(0)=2\pi\int_1^3x(\tau)d\tau=2\pi(3/2+2)=7\pi$。`, fig20),
  p('3.20(5)', ['3.4', '1.6'], 'ft-property', wave20 + r`画 $\operatorname{Re}X(j\omega)$ 的逆 FT。`, r`结果为偶分量 $[x(t)+x(-t)]/2$：$|t|<1$ 为 $2-|t|/2$，$1<|t|<2$ 为 $|t|/2$，$2<|t|<3$ 为 1，带外为零。

![信号的偶分量](figures/hw3/a20-5.svg)`, r`实信号的 FT 满足 $X^*(j\omega)=X(-j\omega)$，实部对应时域偶分量。逐段将原图与反褶图相加后除以 2；$|t|=1,3$ 处有跳变。`, { ...fig20, type: '画图' }),
  p('3.21', ['3.2', '3.4'], 'fourier-series', r`周期信号图 3.21：周期 $T>0$，一周期 $0<t<T/2$ 内为 $2t/T$，$T/2<t<T$ 内为零。用 FT 法求复指数傅里叶级数系数。`, r`$\omega_0=2\pi/T$，$C_0=1/4$；$n\ne0$ 时 $C_n=\frac{j(-1)^n}{2\pi n}+\frac{(-1)^n-1}{2\pi^2n^2}$。`, r`截取一周期的频谱 $X_0(\omega)=\int_0^{T/2}(2t/T)e^{-j\omega t}dt$。取 $C_n=X_0(n\omega_0)/T$；直流项用三角面积 $T/4$ 除以周期 $T$。用 $e^{-jn\pi}=(-1)^n$ 化简非零项，且 $C_{-n}=C_n^*$。`, { figures: ['figures/hw3/q21.png'], verified: 'corrected', note: '纸书第 77 页直流系数写为 1/T，非零项的实部符号也有误。独立积分得到 C0=1/4，并用共轭对称及具体谐波复核。' }),
  p('3.26', ['3.6', '3.9'], 'filter-output', r`$x(t)=\sin200\pi t+2\sin400\pi t$，$g(t)=x(t)\sin400\pi t$。将 $g(t)\sin400\pi t$ 送入截止角频率 $400\pi$、通带增益 2 的理想低通，求输出。`, r`若截止边缘 $|\omega|=400\pi$ 也取增益 2，$y=\sin200\pi t+3\sin400\pi t$。若边缘取半增益 1，第二项变成 $3\sin400\pi t/2$。`, r`两次相乘后 $x\sin^2(400\pi t)=\frac12\sin200\pi t+\frac14\sin600\pi t-\frac14\sin1000\pi t+\frac32\sin400\pi t-\frac12\sin1200\pi t$。滤去 $600\pi,1000\pi,1200\pi$，对剩余分量乘对应增益。截止边缘恰有离散谱线，边缘定义会影响结果。`, { verified: 'uncertain', note: '原题没有定义截止点增益。教材采用截止点包含在通带内的约定，得到 sin200πt+3sin400πt；其他边缘约定须另算，不能把单点差异当作无影响。' }),
];

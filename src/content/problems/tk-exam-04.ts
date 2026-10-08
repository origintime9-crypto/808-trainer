import type { Problem } from '../../types';
import { problem as make } from './helper';
const paper = 'tk-exam-04';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make(paper, ...args);
const r = String.raw;
const score = (no: string, value: number): Partial<Problem> => ({ sources: [{ paper, no, score: value }] });
const fill = (no: string): Partial<Problem> => ({ ...score(no, 3), type: '填空' });
const pic = (no: string) => ({ figures: ['figures/tk-exam-04/q' + no + '.png'] });
const calcSplit = '原卷二(1)整题共 10 分，未给两个小问分值；分开练习，不擅自平分。';
const joint = '原卷每道综合题共 10 分，未给小问分值；各作答单元不虚分分数。';
const ode = r`因果 LTI 系统满足 $y''+5y'+6y=2f'+f$，$f(t)=e^{-t}u(t)$，初态 $y(0^-)=1,y'(0^-)=1$。`;
const badOde = '第 17–18 页此题参考解误接了另一道带通频谱题，所列 H′(jω)、Sa 和余弦输出不属于本微分方程；这里由原题独立求解。' + joint;
const pulses = r`图中 p(t) 是周期 T、幅度 A、单脉冲宽度 $0<\tau<T$ 的矩形脉冲串，中心位于 nT，$A>0$。输入 f(t) 与 p(t) 相乘得到 $f_p(t)$，令 $\omega_0=2\pi/T$。`;
const sampling = { ...pic('3-2'), note: joint };

export const tkExam04: Problem[] = [
  p('一(1)', ['1.4'], 'delta-sift', r`计算 $\int_3^1 e^{-2t}\delta(t-2)\,dt$。`, r`$-e^{-4}$。`, r`先交换积分限：$\int_3^1=-\int_1^3$。冲激位于区间内部 t=2，筛选出 $e^{-4}$，再加反向积分的负号。`, fill('一(1)')),
  p('一(2)', ['6.1', '6.2'], 'conv-sum', r`$h(k)=u(k)-u(k-4)$，输入序列的非零样本为 $f(1)=1,f(2)=2,f(3)=3$。求零状态响应及下标。`, r`$y(1),\ldots,y(6)=\{1,3,6,6,5,3\}$，其余为 0。`, r`h 在 k=0..3 上均为 1，把 [1,2,3] 与 [1,1,1,1] 做卷积。非零起点为 1+0=1，长度为 3+4−1=6。原图首项标的是 k=1，不能把第一项移到 k=0。`, fill('一(2)')),
  p('一(3)', ['1.8'], 'sys-prop', r`抽取器 $y(k)=f(2k)$，判断线性与时不变性。`, '线性、时变。', r`$T[af_1+bf_2](k)=af_1(2k)+bf_2(2k)$，满足叠加。取输入 $\delta(k)$，原输出为 $\delta(k)$；输入延时 1 后输出 $\delta(2k-1)$ 在所有整数 k 上为零，却不同于原输出延时后的 $\delta(k-1)$，所以时变。`, fill('一(3)')),
  p('一(4)', ['1.4', '1.5'], 'delta-sift', r`$f(t)=\cos t\,[u(t+\pi)-u(t-\pi)]$，求分布导数。`, r`$f'(t)=-\sin t\,[u(t+\pi)-u(t-\pi)]-\delta(t+\pi)+\delta(t-\pi)$。`, r`用乘积法则，阶跃导数给 $\cos t[\delta(t+\pi)-\delta(t-\pi)]$。在两冲激位置都有 $\cos(\pm\pi)=-1$，故左端为负冲激、右端为正冲激；不能只微分区间内的余弦。`, fill('一(4)')),
  p('一(5)', ['3.3'], 'ft-basic', r`$f(t)=\sin(4t)/t$，求 $F(j\omega)$。在 t=0 用连续极限定义。`, r`$F(j\omega)=\pi$（$|\omega|<4$），带外为 0；按对称约定，$|\omega|=4$ 处取 $\pi/2$。`, r`由逆变换 $\frac1{2\pi}\int_{-4}^4\pi e^{j\omega t}d\omega=\sin(4t)/t$ 回查。t=0 的极限为 4，频谱边界单点值不影响逆变换。`, fill('一(5)')),
  p('一(6)', ['3.3', '3.4'], 'ft-property', r`求 $f(t)=[u(t+1)-u(t-1)]\cos(100t)$ 的频谱。`, r`$F(j\omega)=\operatorname{Sa}(\omega-100)+\operatorname{Sa}(\omega+100)$。`, r`单位矩形的变换为 $2\operatorname{Sa}(\omega)$；乘余弦产生两个移位副本并各乘 1/2，两因子相消。Sa(x)=sin(x)/x，在 x=0 取 1。`, fill('一(6)')),
  p('一(7)', ['6.3', '7.2'], 'z-calc', r`离散 LTI 系统的单位阶跃响应 $g(k)=(1/2)^ku(k)$，求单位脉冲响应 h(k)。`, r`$h(k)=(1/2)^ku(k)-(1/2)^{k-1}u(k-1)$，也可写为 $\delta(k)-(1/2)^ku(k-1)$。`, r`$\delta(k)=u(k)-u(k-1)$，所以 $h(k)=g(k)-g(k-1)$。h(0)=1，k≥1 时为 $-(1/2)^k$。系统函数为 $(1-z^{-1})/(1-z^{-1}/2)$，累加 h 可还原 g。`, fill('一(7)')),
  p('一(8)', ['1.2', '3.2'], 'concept', r`$f(t)=2+4\cos(10t)+3\cos(20t)$ 在全时域存在，以 10 rad/s 为基频，求平均功率。`, r`$P=2^2+4^2/2+3^2/2=33/2=16.5$。`, r`共同周期 $T_0=\pi/5$。一个周期内不同谐波的交叉项均为零；直流项贡献 4，两个余弦分别贡献 8、9/2。也可由指数级数系数 $C_0=2,C_{\pm1}=2,C_{\pm2}=3/2$ 用 Parseval 核对。`, fill('一(8)')),
  p('一(9)', ['3.4', '5.2'], 'nyquist', r`f(t) 的最高角频率为 $\omega_m>0$，对 $y(t)=f(t/4)f(t/2)$ 抽样，按合成带宽上界求频谱不混叠的间隔。`, r`常规奈奎斯特间隔上界 $T_N=4\pi/(3\omega_m)$。`, r`两个因子的最高角频率上界为 $\omega_m/4$、$\omega_m/2$。相乘对应频域卷积，总上界 $3\omega_m/4$，故 $T_N=\pi/(3\omega_m/4)$。特定频谱抵消时实际带宽可更小；临界等号需检查边缘谱线，严格无接触时取 $T<T_N$。`, fill('一(9)')),
  p('一(10)', ['6.4', '7.2'], 'diff-eq-solve', r`$h(k)=[(-1)^{k-1}+(-1/2)^{k-1}]u(k)$，求输入 f 与输出 y 的差分方程。`, r`$y(k)+\frac32y(k-1)+\frac12y(k-2)=-3f(k)-\frac52f(k-1)$。`, r`两项变换为 $-1/(1+z^{-1})$、$-2/(1+z^{-1}/2)$。通分后分子 $-3-\frac52z^{-1}$、分母 $1+\frac32z^{-1}+\frac12z^{-2}$；交叉相乘即得。注意 h(0)=−3，不能丢掉 k=0 的指数负幂。`, fill('一(10)')),
  p('二1(1)', ['1.4', '1.5'], 'waveform', r`图 A-1 中 f(t) 在 0..1 为 t，1..2 为 1，2..3 为 −1，3..4 为 t−4，区间外为 0。令 $r(t)=tu(t)$，用阶跃和斜坡表示 f(t)。`, r`$f(t)=r(t)-r(t-1)-2u(t-2)+r(t-3)-r(t-4)$。`, r`t=0 的斜率增加 1，t=1 减少 1；t=2 幅度下降 2；t=3 斜率增加 1，t=4 减少 1。逐个加入斜坡与阶跃，再逐区间回查。资料用反向斜坡写出的表达式与此等价。`, { ...pic('2-1'), note: calcSplit }),
  p('二1(2)', ['1.5'], 'waveform', r`同图 A-1 的 f(t)：0..1 为 t，1..2 为 1，2..3 为 −1，3..4 为 t−4，区间外为 0。画 $f(-2t-4)$。`, r`$$f(-2t-4)=\begin{cases}-2t-8&-4<t<-7/2\\-1&-7/2<t<-3\\1&-3<t<-5/2\\-2t-4&-5/2<t<-2\\0&\text{其他}\end{cases}.$$

![反向压缩并左移后的波形](figures/tk-exam-04/a2-1.svg)`, r`原断点 a 映到 $t=-(a+4)/2$：0、1、2、3、4 分别成为 −2、−5/2、−3、−7/2、−4，顺序翻转。支撑为 −4..−2，t=−3 从 −1 跳到 +1；普通跳点的单点取值不影响作图及积分。`, { ...pic('2-1'), type: '画图', note: calcSplit }),
  p('二(2)', ['6.2', '7.2'], 'conv-sum', r`离散 LTI 系统在输入 $\delta(k-1)$ 时，零状态输出为 $(1/2)^ku(k-1)$。求输入 $f(k)=2\delta(k)+u(k)$ 时的零状态响应。`, r`$y_f(k)=[1+(1/2)^{k+1}]u(k)$。`, r`已知输出是 $h(k-1)$，先提前 1 得 $h(k)=(1/2)^{k+1}u(k)$。新输入给 $2h(k)+\sum_{m=0}^kh(m)$；有限几何和为 $1-(1/2)^{k+1}$，相加得所示结果。首项 y(0)=3/2，稳态为 1。`, score('二(2)', 10)),
  p('二(3)', ['3.3', '3.4'], 'ft-property', r`图 A-2 给出信号的幅度谱：在 $4<|\omega|<6$ 为 1，其余为 0；通带相位为 $-2\omega$。求 f(t)。频率单位 rad/s。`, r`$f(t)=\frac2\pi\operatorname{Sa}(t-2)\cos[5(t-2)]$，在 t=2 取 $2/\pi$。`, r`不含相位的两个矩形谱中心为 ±5、每个宽 2，逆变换为 $\frac2\pi\operatorname{Sa}(t)\cos5t$。乘 $e^{-j2\omega}$ 将整个信号延时 2，Sa 和余弦的自变量都须变为 t−2，不能只移动包络。`, { ...score('二(3)', 10), ...pic('2-3'), note: '题干要求信号 f，但原图标了 |H|，参考解写 h。这里依题干把该幅相谱当作 F；两带总宽度为 4，逆变换中心值 2/π 可独立检查。' }),
  p('二(4)', ['3.7', '3.9'], 'sine-steady', r`图 A-3 的频率响应为实三角谱 $H(j\omega)=1-|\omega|/3$（$|\omega|<3$），带外为 0。输入 $f(t)=5+3\cos2t+\cos4t$（全时域），求稳态输出。`, r`$y(t)=5+\cos2t$。`, r`分别取 $H(0)=1,H(j2)=1/3,H(j4)=0$，相位为零。直流分量保留，cos2t 的输入幅度 3 被乘以 1/3，cos4t 被滤掉。因此第二项的幅度为 1。`, { ...score('二(4)', 10), ...pic('2-4'), verified: 'corrected', note: '第 16 页参考解写 5+2cos2t，但题图的三角带宽为 3、峰高为 1，H(j2)=1/3；正确输出是 5+cos2t。' }),
  p('二(5)', ['2.3', '2.4', '1.4'], 'conv-integral', r`已知 $f(t)=u(t)-u(t-1)$ 通过某 LTI 系统的零状态响应为 $y(t)=\delta(t+1)-\delta(t-1)$。图 A-4 的 g(t) 在 0..1 为 t，t>1 为 1，t<0 为 0。求 g 通过同一系统的零状态响应并画图。`, r`$y_g(t)=u(t+1)-u(t-1)$，即 −1<t<1 上高度 1 的矩形，区间外为零。

![积分性质得到的输出矩形](figures/tk-exam-04/a2-5.svg)`, r`$g(t)=r(t)-r(t-1)=\int_{-\infty}^tf(\tau)d\tau$。LTI 的积分性质给 $y_g(t)=\int_{-\infty}^ty(\tau)d\tau$。两个冲激原本一正一负，所以积分后仍一加一减；t>1 时输出回到 0，不能把减号换成加号。`, { ...score('二(5)', 10), ...pic('2-5'), type: '画图', verified: 'corrected', note: '第 17 页参考解将题给的 −δ(t−1) 改成 +δ(t−1)，错误画出尾部高度 2 的阶梯。原题对应高度 1、宽度 2 的矩形。' }),
  p('三1(1a)', ['2.2', '4.5'], 'ode-s-solve', ode + '求零输入响应。', r`$y_{zi}(t)=[4e^{-2t}-3e^{-3t}]u(t)$。`, r`单边变换初态项为 $sy(0^-)+y'(0^-)+5y(0^-)=s+6$，故 $Y_{zi}=(s+6)/[(s+2)(s+3)]=4/(s+2)-3/(s+3)$。回查右初值 1、右导数 1，且满足齐次方程。`, { verified: 'corrected', note: badOde }),
  p('三1(1b)', ['2.2', '4.5'], 'ode-s-solve', ode + '求零状态响应。', r`$y_{zs}(t)=[-\frac12e^{-t}+3e^{-2t}-\frac52e^{-3t}]u(t)$。`, r`$H=(2s+1)/[(s+2)(s+3)]$，$F=1/(s+1)$。$Y_{zs}=HF=-1/[2(s+1)]+3/(s+2)-5/[2(s+3)]$。y_zs(0+)=0，右导数为 2；输入导数含冲激，不能把右侧导数强设为零。`, { verified: 'corrected', note: badOde }),
  p('三1(1c)', ['2.2', '4.5'], 'full-response-decomp', ode + '求完全响应。', r`$y(t)=[-\frac12e^{-t}+7e^{-2t}-\frac{11}2e^{-3t}]u(t)$。`, r`分别求得 $y_{zi}=4e^{-2t}-3e^{-3t}$、$y_{zs}=-e^{-t}/2+3e^{-2t}-5e^{-3t}/2$（均乘 u），相加即得。检查 $y(0^+)=1$、$y'(0^+)=3$；输入在零点的跳变使导数由初态 1 增加到 3。`, { verified: 'corrected', note: badOde }),
  p('三1(2)', ['4.5', '4.6'], 'ode-s-solve', ode + '求 H(s)、h(t)，判断稳定性。', r`$H(s)=\frac{2s+1}{(s+2)(s+3)}$，$h(t)=(-3e^{-2t}+5e^{-3t})u(t)$；因果系统稳定，ROC 为 $\operatorname{Re}s>-2$。`, r`令初态为零后取 Y/F。部分分式 $H=-3/(s+2)+5/(s+3)$。两个极点 −2、−3 都在左半平面，因果 h 绝对可积；初值 $h(0^+)=2$ 也与 $\lim_{s\to\infty}sH(s)=2$ 一致。`, { verified: 'corrected', note: badOde }),
  p('三1(3)', ['4.6'], 'ode-to-diagram', ode + '画系统的直接型模拟框图。', r`取 $x_1=w,x_2=w'$，则 $x_1'=x_2$、$x_2'=f-5x_2-6x_1$，输出 $y=x_1+2x_2$。

![两个积分器的直接型框图](figures/tk-exam-04/a31-3.svg)`, r`把辅助方程写为 $w''+5w'+6w=f$。两个串联积分器产生 x₂、x₁，求和点以 −5x₂、−6x₁ 反馈；输出端以增益 2、1 相加。由 $W=F/(s^2+5s+6)$、$Y=(2s+1)W$ 回算原 H。框图不用对输入 f 求导。`, { type: '画图', verified: 'corrected', note: badOde }),
  p('三2(1)', ['3.2'], 'fourier-series', pulses + '求指数傅里叶级数系数 Cₙ。', r`$C_n=\frac{A\tau}{T}\operatorname{Sa}(n\omega_0\tau/2)$，含 n=0 的 $C_0=A\tau/T$。`, r`在一个周期中只有 −τ/2..τ/2 非零，按定义 $C_n=\frac1T\int_{-\tau/2}^{\tau/2}Ae^{-jn\omega_0t}dt$。n≠0 时积分给 sin 之比，n=0 时取连续极限，等于单周期面积除以 T。`, sampling),
  p('三2(2)', ['3.2', '3.3'], 'ft-property', pulses + '求 p(t) 的频谱密度 P(jω)。', r`$P(j\omega)=2\pi\sum_{n=-\infty}^{\infty}\frac{A\tau}{T}\operatorname{Sa}(n\omega_0\tau/2)\delta(\omega-n\omega_0)$。`, r`把 $p(t)=\sum_n C_ne^{jn\omega_0t}$ 逐项变换，每个指数给 $2\pi\delta(\omega-n\omega_0)$。这里是广义函数的线谱，不能把 Cₙ 本身当成频谱冲激强度而漏掉 2π。`, sampling),
  p('三2(3)', ['3.4', '5.2'], 'ft-property', pulses + '已知 f 的频谱为 F(jω)，求抽样后 Fₚ(jω)。', r`$F_p(j\omega)=\sum_{n=-\infty}^{\infty}\frac{A\tau}{T}\operatorname{Sa}(n\omega_0\tau/2)F(j(\omega-n\omega_0))$。`, r`时域相乘对应 $\frac1{2\pi}F*P$。P 中每条冲激的 2π 恰被相乘定理的 1/(2π) 抵消，故各移位副本的权重是 Cₙ。矩形脉冲有有限宽度，副本权重一般不全相同。`, sampling),
  p('三2(4)', ['5.2'], 'nyquist', pulses + r`若 F 的支撑限于 $|\omega|\le\omega_m$，为使抽样后的频谱副本不混叠，求 T 的常规最大间隔。`, r`普通频谱无边缘冲激线时，常规界限 $T_{\max}=\pi/\omega_m$。要求包括边缘冲激线在内完全不接触时，应取 $T<\pi/\omega_m$，此时该数是上确界。`, r`相邻副本间距 $\omega_0=2\pi/T$，原基带宽度为 2ωₘ。$\omega_0\ge2\omega_m$ 给常规界限；严格不等号时各副本之间有空隙。临界等号对普通频谱仅边界接触，不影响逆变换，但两端含冲激线时会在同一频率相加，须另外处理，不能一概称完全无混叠。`, sampling),
];

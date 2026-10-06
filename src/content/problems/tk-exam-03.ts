import type { Problem } from '../../types';
import { problem as make } from './helper';
const paper = 'tk-exam-03';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make(paper, ...args);
const r = String.raw;
const score = (no: string, value: number): Partial<Problem> => ({ sources: [{ paper, no, score: value }] });
const fill = (no: string): Partial<Problem> => ({ ...score(no, 3), type: '填空' });
const pic = (no: string) => ({ figures: ['figures/tk-exam-03/q' + no + '.png'] });
const sharedScore = '原卷每道综合题共 10 分，未给小问或节点分值；保留各作答单元，不擅自拆分分数。';
const ode = r`因果 LTI 系统满足 $y''+7y'+10y=2f'+f$，初态为 $y(0^-)=4,y'(0^-)=-3$，输入 $f(t)=e^{-t}u(t)$。`;
const modulator = r`图中输入谱 $F(j\omega)=2(1-|\omega|/10)$（$|\omega|<10$），带外为 0，频率单位为 rad/s。A 为 $\cos100t$ 的输入端，f 与 A 相乘得 B，经 $H_1$ 得 C，再乘 $\cos100t$ 得 D，经 $H_2$ 得 E，即 y。$H_1=1$ 仅在 $80<|\omega|<100$，$H_2=1$ 仅在 $|\omega|<15$，带外均为 0。边界单点不影响逆变换。`;
const spectral = { ...pic('3-2'), type: '画图' as const, note: sharedScore + '资料提到的答案图 A-12 未出现在本题解处，所附各节点图由独立频谱运算重绘。' };

export const tkExam03: Problem[] = [
  p('一(1)', ['3.8'], 'filter-output', r`LTI 系统的零状态响应为 $y_{zs}(t)=Kf(t-t_0)$，求 $H(j\omega)$ 和 h(t)。`, r`$H(j\omega)=Ke^{-j\omega t_0}$，$h(t)=K\delta(t-t_0)$。`, r`频域的延时因子对应时域移位冲激；直接卷积得到 $f*K\delta(t-t_0)=Kf(t-t_0)$。`, fill('一(1)')),
  p('一(2)', ['5.2', '3.4'], 'nyquist', r`低通信号 f(t) 的最高频率为 $f_m$ Hz，按 $y(t)=f(t)f(2t)$ 的合成带宽上界求奈奎斯特间隔。`, r`$T_N=1/(6f_m)$ s。`, r`两因子的带宽上界分别为 $f_m$、$2f_m$，时域相乘后上界为 $3f_m$，抽样频率至少取 $6f_m$。临界等号需检查频带端点；特定频谱边缘抵消时实际带宽可能更小。`, { ...fill('一(2)'), note: '课程题库 03 第 10 页同时写“最高角频”和 Hz，单位相互矛盾。按原题明确的 Hz 给出 1/(6fₘ)；若给定量实际是角频率 ωₘ，则应写 π/(3ωₘ)。' }),
  p('一(3)', ['1.4', '1.5'], 'waveform', r`计算 $\int_{-\infty}^{\infty}u(2t-2)u(4-2t)\,dt$。`, '1。', r`阶跃交集为 $1<t<2$，单位矩形面积为 1。`, fill('一(3)')),
  p('一(4)', ['6.1', '6.2'], 'conv-sum', r`$f_1(k)=2^k[u(k)-u(k-3)]$，$f_2(k)=\{2,5,3\}$，箭头在 5，即 $f_2(0)=5$。求卷积和及下标。`, r`$\{2,9,21,26,12\}$，对应 $k=-1,0,1,2,3$，零下标项为 9。`, r`将 $[1,2,4]$ 与 $[2,5,3]$ 逐项卷积；起点是 $0+(-1)=-1$，长度为 $3+3-1=5$。`, fill('一(4)')),
  p('一(5)', ['1.8'], 'sys-prop', r`系统关系 $y(t)=t^2f(t)f'(t)+2X(0)$，其中 $X(0)$ 为固定初态。判断线性与时不变性。`, '非线性、时变。', r`输入倍乘 a 时乘积项变成 $a^2t^2ff'$，不满足线性。取 $f=t$，对延时 1 的输入所得 $t^2(t-1)$ 与原输出延时后的 $(t-1)^3$ 不同，故时变。`, { ...fill('一(5)'), verified: 'corrected', note: '课程题库 03 第 10 页同样误标为“线性时变”。f 与 f′ 相乘是非线性项；即使令初态为零也不满足线性。' }),
  p('一(6)', ['1.4'], 'delta-sift', r`计算 $\int_{-\infty}^{3}(2t^2+3t)\delta(t/2-2)\,dt$。`, '0。', r`$\delta(t/2-2)=2\delta(t-4)$，冲激位置 4 不在积分区间内。`, fill('一(6)')),
  p('一(7)', ['4.2', '4.3'], 'laplace-calc', r`已知单边拉氏变换 $F(s)=(2s^2+3s e^{-2})/[s(s^2+9)]$，$\operatorname{Re}s>0$。求 f(t)。注意题中的指数是常数 $e^{-2}$。`, r`$f(t)=[2\cos3t+e^{-2}\sin3t]u(t)$。`, r`先约去 s，得到 $2s/(s^2+9)+e^{-2}\,3/(s^2+9)$，分别对应余弦和正弦。$e^{-2}$ 不含 s，不能当作 $e^{-2s}$ 来延时；初值 $f(0^+)=2$。`, fill('一(7)')),
  p('一(8)', ['2.4', '3.4'], 'ft-property', r`已知 $y(t)=\int_{-2}^{t}e^{-2\tau}e^{-5(t-\tau)}\,d\tau$，题干只说明 $t>-2$。求傅里叶变换；须明确未给时段的延拓。`, r`若补充 $y(t)=0$（$t\le-2$），则

$$y(t)=\frac13(e^{-2t}-e^{-5t-6})u(t+2),\qquad Y(j\omega)=\frac{e^{4+j2\omega}}{(j\omega+2)(j\omega+5)}.$$

若不指定 $t\le-2$ 的信号，傅里叶变换不能唯一确定。`, r`在所示零延拓下，$y=[e^{-2t}u(t+2)]*[e^{-5t}u(t)]$。前者的变换从 −2 起积分，得 $e^{4+j2\omega}/(j\omega+2)$，后者为 $1/(j\omega+5)$，相乘即得。不能把前者错当成从 0 开始的因果指数。`, { ...fill('一(8)'), verified: 'uncertain', note: '第 10 页只给 t>−2 的公式，没有写出其余时间的定义。参考结果隐含零延拓；答案把这个必要假设明确列出。' }),
  p('一(9)', ['7.1', '7.2'], 'z-calc', r`单边 z 变换 $F(z)=(2z^2+z)/[(z-2)(z+3)]$，$|z|>3$。求 f(k)。`, r`$f(k)=[2^k+(-3)^k]u(k)$。`, r`将 F 分为 $z/(z-2)+z/(z+3)$，两个极点均取右边序列，ROC 为 $|z|>3$。检查 $f(0)=\lim_{z\to\infty}F(z)=2$。`, fill('一(9)')),
  p('一(10)', ['3.3', '3.8', '3.9'], 'filter-output', r`理想低通 $H(j\omega)=e^{-j\omega t_0}$（$|\omega|\le\omega_m$），带外为 0。求 h(t)。`, r`$h(t)=\frac{\omega_m}{\pi}\operatorname{Sa}[\omega_m(t-t_0)]$，在 $t=t_0$ 取极限 $\omega_m/\pi$。`, r`定义逆变换为 $\frac1{2\pi}\int_{-\omega_m}^{\omega_m}e^{j\omega(t-t_0)}d\omega$，得到 $\sin[\omega_m(t-t_0)]/[\pi(t-t_0)]$，再写为 Sa 形式。`, fill('一(10)')),
  p('二(1)', ['3.3'], 'ft-basic', r`$F(j\omega)=\operatorname{sgn}(\omega+1)-\operatorname{sgn}(\omega-1)$，求 f(t)。`, r`$f(t)=\frac2\pi\operatorname{Sa}(t)$，$f(0)=2/\pi$。`, r`频谱为 $-1<\omega<1$ 上的高度 2 矩形，直接按逆变换积分得到 $2\sin t/(\pi t)$。`, score('二(1)', 10)),
  p('二(2)', ['1.7', '2.4', '4.6'], 'block-to-Hs', r`图 A-1 是两段串联系统：第一段将 $h_1(t)=u(t-1)$ 与直接通路并联，第二段将 $h_2(t)=e^{-3t}u(t-2)$、$h_3(t)=e^{-2t}u(t)$ 并联。求总冲激响应。`, r`$
\begin{aligned}
h(t)={}&\frac{e^{-6}}3[1-e^{-3(t-3)}]u(t-3)\\
&+\frac12[1-e^{-2(t-1)}]u(t-1)\\
&+e^{-3t}u(t-2)+e^{-2t}u(t).
\end{aligned}
$`, r`$h=(h_1+\delta)*(h_2+h_3)$。第一卷积从 $\tau=1$ 积到 $t-2$，仅在 $t\ge3$ 非零；第二卷积从 1 到 t，仅在 $t\ge1$ 非零。直接通路再补上 $h_2+h_3$。频域复核为 $H(s)=(1+e^{-s}/s)[e^{-6-2s}/(s+3)+1/(s+2)]$，其中 $e^{-6}$ 来自未以 t−2 为自变量的指数。`, { ...score('二(2)', 10), ...pic('2-2'), note: '图中方框沿用 hᵢ[k] 的离散标签，但题干明确给 hᵢ(t) 和连续时间函数；本题依题干使用连续卷积。' }),
  p('二(3)', ['2.4'], 'conv-integral', r`图 A-2 中 f(t) 为 $-1<t<1$ 上的单位矩形。g(t) 从 t=0 起先为 2，随后为 1，再降为 0，但两个转折时刻没有标数值。记它们为 $0<a<b$，即 $g(t)=2u(t)-u(t-a)-u(t-b)$，求并画卷积。`, r`令 $R(t)=tu(t)$，参数解为

$
\begin{aligned}
y(t)={}&2[R(t+1)-R(t-1)]\\
&-[R(t+1-a)-R(t-1-a)]\\
&-[R(t+1-b)-R(t-1-b)].
\end{aligned}
$

仅当另确认 $a=1,b=2$ 时，

$$y(t)=\begin{cases}2(t+1)&-1<t<0\\t+2&0<t<1\\5-2t&1<t<2\\3-t&2<t<3\\0&\text{其他}\end{cases}.$$

![另取 a=1、b=2 时的条件卷积图](figures/tk-exam-03/a2-3.svg)`, r`矩形写成 $u(t+1)-u(t-1)$，分别与 g 的三个阶跃卷积，利用 $u*u=R$ 即得。支撑起点 −1、终点 b+1，面积为 $2(a+b)$。图示条件解的折点为 $(-1,0),(0,2),(1,3),(2,1),(3,0)$，面积 6；参考解的波形不能替题干补出缺失时刻。`, { ...score('二(3)', 10), ...pic('2-3'), type: '画图', verified: 'uncertain', note: '第 11 页原图没有给 g(t) 的两个转折时间。参考图 A-9 暗取 1 和 2，但题面无法确认，所以主答案保留 a、b；附图明确标为 a=1、b=2 的条件例子。' }),
  p('二(4)', ['8.1', '8.2', '4.6'], 'state-space', r`$H(s)=(2s+7)/(s^2+5s+3)$，画直接型模拟框图并列状态方程。取第二个积分器输出为 $x_1$，第一个积分器输出为 $x_2$。`, r`$$\dot x_1=x_2,\qquad\dot x_2=-3x_1-5x_2+f,\qquad y=7x_1+2x_2.$$

$$A=\begin{bmatrix}0&1\\-3&-5\end{bmatrix},\quad B=\begin{bmatrix}0\\1\end{bmatrix},\quad C=\begin{bmatrix}7&2\end{bmatrix},\quad D=0.$$

![直接型双积分器框图](figures/tk-exam-03/a2-4.svg)`, r`令 $x_1=w,x_2=\dot w$，辅助方程为 $w''+5w'+3w=f$，输出为 $y=7w+2w'$。两积分器前的求和点反馈 −5x₂、−3x₁。代入 $C(sI-A)^{-1}B$ 可回算原系统函数。这是第八章低优先级扩展题。`, { ...score('二(4)', 10), type: '画图', verified: 'corrected', note: '第 12 页框图标反馈系数 3，但后面的状态式漏写 3，误成 ẋ₂=−x₁−5x₂+f。本答案与分母常数 3 一致。' }),
  p('二(5)', ['3.2', '3.4', '5.2'], 'nyquist', r`f(t) 的频谱限于 $|\omega|\le\omega_m$。图 A-3 的 $f_T(t)$ 是周期 T、峰值 1、每个三角脉冲底宽 $\tau$ 的周期信号，$0<\tau\le T$。以 $f_s(t)=f(t)f_T(t)$ 抽样，论证 $T\le\pi/\omega_m$ 时可以恢复 f(t)。`, r`令 $\omega_0=2\pi/T$，

$$C_n=\frac{\tau}{2T}\operatorname{Sa}^2\!\left(\frac{n\omega_0\tau}{4}\right),\qquad F_s(j\omega)=\sum_n C_nF(j(\omega-n\omega_0)).$$

在严格无重叠的 $T<\pi/\omega_m$ 情形，基带为 $C_0F$，用通带增益 $1/C_0=2T/\tau$ 的低通恢复。

临界等号下，普通连续频谱仅在边界接触。若边界另含冲激谱线，应对两条边缘谱线作下述联立恢复，不能略去边界条件。`, r`一个三角脉冲的面积为 τ/2，先按定义积分得傅里叶级数系数 Cₙ；时域相乘给加权频谱副本。$T\le\pi/\omega_m$ 等价于 $\omega_0\ge2\omega_m$。严格不等号时选低通截止频率在 $\omega_m$ 与 $\omega_0-\omega_m$ 之间，且须补偿 C₀。

若临界频率 $\omega_0=2\omega_m$，原边缘冲激权重为 $a_+,a_-$，抽样后为 $b_+=C_0a_++C_1a_-$、$b_-=C_1a_++C_0a_-$。因 $0<\tau\le T$，$C_1/C_0=\operatorname{Sa}^2(\pi\tau/(2T))<1$，行列式 $C_0^2-C_1^2>0$，所以 $a_\pm=(C_0b_\pm-C_1b_\mp)/(C_0^2-C_1^2)$，仍可恢复。这里抽样脉冲具有有限宽度，不能直接换成冲激列。`, { ...score('二(5)', 10), ...pic('2-5'), type: '简答', note: '参考解给出三角脉冲系数与频谱副本，但未写恢复滤波器增益及临界边缘谱线条件。这里补足这两项；不把题图的有限宽三角脉冲改成理想冲激抽样。' }),
  p('三1(1)', ['4.5', '4.6'], 'ode-s-solve', ode + '求 H(s) 与 h(t)。', r`$H(s)=\frac{2s+1}{(s+2)(s+5)}$，$h(t)=(-e^{-2t}+3e^{-5t})u(t)$。`, r`系统函数使用零初始状态，$H=-1/(s+2)+3/(s+5)$。两实际极点均在左半平面，因果系统 ROC 为 $\operatorname{Re}s>-2$。`, { note: sharedScore }),
  p('三1(2)', ['2.2', '4.5'], 'ode-s-solve', ode + '求零输入响应。', r`$y_{zi}(t)=[\frac{17}3e^{-2t}-\frac53e^{-5t}]u(t)$。`, r`单边变换的初态项为 $sy(0^-)+y'(0^-)+7y(0^-)=4s+25$，所以 $Y_{zi}=(4s+25)/[(s+2)(s+5)]$。分式系数是 17/3、−5/3；直接检查 $y_{zi}(0^+)=4,y'_{zi}(0^+)=-3$。`, { verified: 'corrected', note: '第 13 页将零输入分式的两个系数交换，并在时域式中出现 e⁺⁵ᵗ；均不满足初态。单边变换中 y′(0⁻) 的移项符号也误写，正确分子为 4s+25。' + sharedScore }),
  p('三1(3)', ['2.2', '4.5'], 'ode-s-solve', ode + '求零状态响应。', r`$y_{zs}(t)=[-\frac14e^{-t}+e^{-2t}-\frac34e^{-5t}]u(t)$。`, r`$Y_{zs}=H/(s+1)=-1/[4(s+1)]+1/(s+2)-3/[4(s+5)]$。右极限 $y_{zs}(0^+)=0$、$y'_{zs}(0^+)=2$；输入导数包含 δ(t)，因此不能强令右侧导数也为零。与零输入相加得全响应 $[-\frac14e^{-t}+\frac{20}3e^{-2t}-\frac{29}{12}e^{-5t}]u(t)$。`, { note: sharedScore }),
  p('三1(4)', ['2.2', '4.5', '1.8'], 'full-response-decomp', ode + r`改为 $f(t)=e^{-(t-1)}u(t-1)$，初态保持原值，求 H(s)、h(t)、零输入及零状态响应。`, r`H(s)、h(t) 与零输入响应均保持不变；零状态响应变为

$$y_{zs,\mathrm{new}}(t)=[-\tfrac14e^{-(t-1)}+e^{-2(t-1)}-\tfrac34e^{-5(t-1)}]u(t-1).$$`, r`系统函数与冲激响应只由系统算子决定。初态未改变，所以零输入响应仍为 $[\frac{17}3e^{-2t}-\frac53e^{-5t}]u(t)$。LTI 的时移性质只延时因输入而产生的零状态部分；不能把全部响应一起延时。`, { note: sharedScore }),
  p('三2(A)', ['3.3', '3.6'], 'ft-property', modulator + '求 A 点频谱并画图。', r`$F_A(j\omega)=\pi[\delta(\omega-100)+\delta(\omega+100)]$。

![A 点余弦冲激谱](figures/tk-exam-03/a3-2-a.svg)`, r`A 是第一个乘法器的余弦输入，谱线位于 ±100 rad/s，每根冲激强度为 π。不要将本题 100 误换成上一套题的 100π。`, spectral),
  p('三2(B)', ['3.4', '3.6'], 'ft-property', modulator + '求 B 点频谱并画图。', r`$F_B(j\omega)=\frac12[F(j(\omega-100))+F(j(\omega+100))]$。两三角谱中心为 ±100，半宽 10，峰高 1。

![B 点两个完整三角副本](figures/tk-exam-03/a3-2-b.svg)`, r`乘以余弦使原谱向两侧各移 100，并各乘 1/2。正副本支撑 90..110，负副本支撑 −110..−90。`, spectral),
  p('三2(C)', ['3.9', '3.4'], 'filter-output', modulator + '求 C 点频谱并画图。', r`$$F_C(j\omega)=\begin{cases}\frac12F(j(\omega+100))&-100<\omega<-90\\\frac12F(j(\omega-100))&90<\omega<100\\0&\text{其他}\end{cases}.$$

![C 点保留朝原点的半谱](figures/tk-exam-03/a3-2-c.svg)`, r`H₁ 的通带位于 80..100 与 −100..−80。与 B 的有效谱相交后，仅留下 90..100 上由 0 升至 1 的左半边，以及 −100..−90 上由 1 降至 0 的右半边；都是朝原点的半谱。`, spectral),
  p('三2(D)', ['3.4', '3.6'], 'filter-output', modulator + '求 D 点频谱并画图。', r`$F_D(j\omega)=\frac12[F_C(j(\omega-100))+F_C(j(\omega+100))]$。

基带 $|\omega|<10$ 为 $\frac14F(j\omega)$，峰高 1/2；另有 −200..−190 与 190..200 的两个半三角谱，峰高也为 1/2。

![D 点基带和两侧高频半谱](figures/tk-exam-03/a3-2-d.svg)`, r`把 C 两半谱各向左右平移 100 并各乘 1/2。朝原点的两份在基带拼成三角形；向外的两份出现在 ±200 附近。每个非零基带频率只来自一个半谱，不能再把幅度翻倍。`, spectral),
  p('三2(E)', ['3.9', '3.6'], 'filter-output', modulator + '求 E 点频谱并画图，给出 y(t) 与 f(t) 的关系。', r`$Y(j\omega)=F_E(j\omega)=\frac14F(j\omega)$，故 $y(t)=\frac14f(t)$。

本题三角输入谱对应 $f(t)=\frac{10}\pi\operatorname{Sa}^2(5t)$，所以 $y(t)=\frac5{2\pi}\operatorname{Sa}^2(5t)$。

![E 点恢复的基带三角谱](figures/tk-exam-03/a3-2-e.svg)`, r`H₂ 的截止频率 15 包含全部基带 −10..10，并滤掉 ±200 附近的高频半谱。整个有效频谱缩放 1/4，时域也同样缩放；逆变换的面积检查为 $f(0)=10/\pi$。`, spectral),
];

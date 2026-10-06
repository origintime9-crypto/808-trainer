import type { Problem } from '../../types';
import { problem as make } from './helper';
const r = String.raw;
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make('zt2017', ...args);
const score = (no: string, n: number) => ({ sources: [{ paper: 'zt2017', no, score: n }] });
const parallel = r`上支路串联 $H_1=1/(s+1)$、$H_2=1/(s+2)$，与下支路 $h_3(t)=\delta(t)$ 相加。`;
const discrete = r`图中两个延时器串联，中间信号 $w(n)=x(n)-4w(n-1)-6w(n-2)$，输出 $y(n)=w(n)+7w(n-1)$。`;
const fig = { figures: ['figures/zt2017/q3.png'] };
const dfig = { figures: ['figures/zt2017/q5.png'] };
export const zt2017: Problem[] = [
  p('一(1)', ['3.7'], 'sine-steady', r`$H(s)=1/(s+4)$，写频率响应，并求输入 $5\sin(2t-6)$ 的正弦稳态输出。`, r`$H(j\omega)=1/(j\omega+4)$；$y_s=(\sqrt5/2)\sin(2t-6-\arctan(1/2))$。`, r`在 ω=2，模为 $1/\sqrt{20}$，相角为 $-\arctan(2/4)$。输入幅度为 5，输出幅度 $5/\sqrt{20}=\sqrt5/2$。`, { ...score('一(1)', 5), verified: 'corrected', note: '曙光答案漏乘输入幅度 5，写成 √5/10，并漏给频率响应。' }),
  p('一(2)', ['3.4'], 'ft-property', r`$f(t)\leftrightarrow F(j\omega)$，求 $f(2t-9)$ 的 FT。`, r`$\tfrac12F(j\omega/2)e^{-j9\omega/2}$。`, r`先写成 $f(2(t-9/2))$。尺度 2 使幅度减半、频率自变量除 2；时移 9/2 再乘相位因子。`, score('一(2)', 5)),
  p('一(3)', ['3.5', '3.4'], 'ft-basic', r`求广义积分 $\int_{-\infty}^{\infty}4\cos\omega t\,dt$ 与 $\int_{-\infty}^{\infty}5e^{j\omega t}d\omega$。`, r`$8\pi\delta(\omega)$；$10\pi\delta(t)$。`, r`使用分布恒等式 $\int e^{j\omega t}dt=2\pi\delta(\omega)$。余弦拆为正负指数，二者对应相同的原点冲激；另一积分对 ω 求，得到关于 t 的冲激。`, score('一(3)', 5)),
  p('一(4)', ['1.4'], 'delta-sift', r`计算 $\int_{-\infty}^{\infty}e^{-t}\delta(t+3)dt$ 与 $\int_{-\infty}^{\infty}\delta(t-1)[t+e^{-t}\sin(\pi t)/(t-1)]dt$。`, r`$e^3$；$1-\pi/e$。`, r`第一项在 t=−3 筛选。第二项先取连续延拓值，$\lim_{t\to1}\sin(\pi t)/(t-1)=\pi\cos\pi=-\pi$，再乘 $e^{-1}$ 并加 1。`, score('一(4)', 5)),
  p('一(5)', ['3.2'], 'concept', '信号频谱的两个部分是什么？', '幅度谱和相位谱。', '复频谱以模和相角描述，各频率分量的强弱由幅度谱给出，相对时间关系由相位谱给出。', { type: '填空', ...score('一(5)', 5) }),
  p('一(6)', ['3.3'], 'ft-basic', r`$F(j\omega)=u(\omega+2\omega_0)-u(\omega-2\omega_0)$，$\omega_0>0$，求 $f(t)$。`, r`$f(t)=\sin(2\omega_0t)/(\pi t)$。`, r`逆变换 $f=\frac1{2\pi}\int_{-2\omega_0}^{2\omega_0}e^{j\omega t}d\omega$，积分得所示结果，t=0 连续取值 $2\omega_0/\pi$。`, score('一(6)', 5)),
  p('一(7)', ['3.2'], 'concept', '国内市电基波频率与 200 Hz 周期三角波的基波频率分别是多少？', '50 Hz；200 Hz。', '周期波形的基波频率就是其重复频率，不能因三角波含更高谐波而改变基频。', { type: '填空', ...score('一(7)', 5) }),
  p('一(8)', ['3.4', '3.6'], 'ft-property', r`$f(t)\leftrightarrow F(j\omega)$，求 $f(t)\cos\omega_0t$ 的 FT。`, r`$\tfrac12[F(j(\omega-\omega_0))+F(j(\omega+\omega_0))]$。`, r`余弦拆为两个复指数，各自使频谱平移 $\pm\omega_0$，权重均为 1/2。`, score('一(8)', 5)),
  p('一(9)', ['5.2'], 'nyquist', '频谱在 5–10 kHz 的连续带通信号，均匀采样后无失真恢复，按低通抽样定理求最大采样周期。', r`$T_s\le50\,\mu\mathrm{s}$（低通定理口径）。`, r`取最高频率 10 kHz，$f_s\ge20$ kHz，所以 $T_s\le1/20000$ 秒。若另行使用带通采样并对谱带和重建滤波器作约束，此谱带可按 10 kHz 采样，周期可为 $100\,\mu\mathrm{s}$；这不是同一低通规则。`, { ...score('一(9)', 5), verified: 'uncertain', note: '原题未明确低通或带通抽样规则。按计划及课程常用低通口径填 50 μs，同时保留带通条件下的另一解读。' }),
  p('一(10)', ['4.3'], 'laplace-calc', r`因果 $X(s)=(s+5)/[(s+1)(s+2)]$，求逆变换。`, r`$x(t)=(4e^{-t}-3e^{-2t})u(t)$。`, r`部分分式为 $4/(s+1)-3/(s+2)$；因果 ROC 在最右极点右侧，两项均取右边序列。`, score('一(10)', 5)),
  p('二(1)', ['2.2'], 'full-response-decomp', r`相同初态下，激励 f 时全响应 $(2e^{-2t}+\sin2t)u(t)$，激励 2f 时为 $(2e^{-2t}+2\sin2t)u(t)$。激励改成 $f(t-t_0)$，初态不变，求全响应（$t_0\ge0$）。`, r`$2e^{-2t}u(t)+\sin[2(t-t_0)]u(t-t_0)$。`, r`两次响应相减得 $y_{zs}=\sin2t\,u(t)$，代回得 $y_{zi}=2e^{-2t}u(t)$。激励延时只使零状态部分延时，零输入响应不变。`, score('二(1)', 10)),
  p('二(2)', ['4.6', '4.7'], 'routh', r`负反馈，前向 $G=1/[(s+2)(s+4)]$，反馈 $K/s$。求闭环 H(s) 和特征根严格在左半平面的 K 范围。`, r`$H(s)=s/(s^3+6s^2+8s+K)$；$0<K<48$。`, r`$H=G/(1+GK/s)$。三阶劳斯第一列为 $1,6,(48-K)/6,K$，全正要求 $0<K<48$。边界 K=0 时约分后的输入输出函数为 $1/[(s+2)(s+4)]$，BIBO 仍稳定；若要求未约分状态的渐近稳定则排除 K=0。`, { ...score('二(2)', 10), figures: ['figures/zt2017/q2-2.png'], note: '区分特征根严格稳定和约分后传递函数的外部 BIBO 稳定，防止忽略 K=0 的零极点消去。' }),
  p('二(3)', ['6.4'], 'diff-eq-solve', r`$y(n)-\tfrac13y(n-1)=x(n)$，零状态输出 $y(n)=3[(1/2)^n-(1/3)^n]u(n)$，求输入。`, r`$x(n)=(1/2)^nu(n-1)$。`, r`n=0 时 y(0)=0、y(−1)=0，所以 x(0)=0。n≥1 代入差分方程，第二个指数项消去，得到 $(1/2)^n$；n<0 均为零。`, { ...score('二(3)', 10), verified: 'corrected', note: '曙光答案写成 u(n)，使 x(0)=1，与零状态输出 y(0)=0 矛盾；起点应为 n=1。' }),
  p('三(1)', ['4.6', '4.3'], 'block-to-Hs', parallel + '求 H(s) 和 h(t)。', r`$H=1+1/[(s+1)(s+2)]$；$h=\delta(t)+(e^{-t}-e^{-2t})u(t)$。`, r`上支路串联相乘，下支路冲激对应直接通路 1；部分分式 $1/[(s+1)(s+2)]=1/(s+1)-1/(s+2)$。`, { ...score('三(1)', 4), ...fig, verified: 'corrected', note: '曙光答案把两个指数写成相加，正确部分分式应相减。' }),
  p('三(2)', ['2.3', '4.6'], 'block-to-Hs', parallel + '输入 u(t)，求零状态响应。', r`$y_{zs}=[3/2-e^{-t}+(1/2)e^{-2t}]u(t)$。`, r`积分 h 得阶跃响应：直接冲激产生 u，两个指数积分为 $(1-e^{-t})-\tfrac12(1-e^{-2t})$。初值 1，终值 3/2。`, { ...score('三(2)', 4), ...fig }),
  p('三(3)', ['4.6'], 'block-to-Hs', parallel + '求零极点并说明作图。', r`极点 −1、−2；零点 $(-3\pm j\sqrt3)/2$。`, r`$H=(s^2+3s+3)/(s^2+3s+2)$。分母为 $(s+1)(s+2)$，分子二次求根。在实轴 −1、−2 画 ×，在零点共轭位置画 ○。`, { ...score('三(3)', 4), ...fig }),
  p('三(4)', ['4.6'], 'ode-to-diagram', parallel + '写输入输出微分方程。', r`$y''+3y'+2y=x''+3x'+3x$。`, r`由 $H=(s^2+3s+3)/(s^2+3s+2)$ 交叉相乘并取零状态逆变换。分子与分母同阶，右端包含 x''。`, { ...score('三(4)', 4), ...fig }),
  p('三(5)', ['3.7'], 'block-to-Hs', parallel + '求频率响应。', r`$H(j\omega)=(3-\omega^2+3j\omega)/(2-\omega^2+3j\omega)$。`, r`因果极点为 −1、−2，ROC 包含虚轴。代 s=jω，直通分量 1 仍保留。`, { ...score('三(5)', 4), ...fig }),
  p('四(1)', ['3.3'], 'ft-basic', r`$f(t)=\sin t/t$，求 FT 并画频谱。`, r`$F(j\omega)=\pi$（$|\omega|<1$），外部为零，端点取半值。`, r`由 $\sin\omega_ct/(\pi t)$ 的标准矩形谱，取 ωc=1 并乘 π。图上标出横轴 −1、1，高度 π，相位在通带为零。`, score('四(1)', 10)),
  p('四(2)', ['3.4'], 'ft-property', r`用 FT 证明 $\int_{-\infty}^{\infty}\sin t/t\,dt=\pi$。`, r`该积分等于 $F(0)=\pi$。`, r`根据定义 $F(0)=\int f(t)dt$，而 $f(t)=\sin t/t$ 的矩形频谱在 ω=0 取 π。积分按对称广义积分或通常的狄利克雷积分理解，不是绝对收敛积分。`, score('四(2)', 5)),
  p('五(1)', ['6.4', '7.2'], 'discrete-diagram', discrete + '求因果 h(n)。', r`$h(n)=(\sqrt6)^n[\cos(n\theta)+(5/\sqrt2)\sin(n\theta)]u(n)$，$\cos\theta=-2/\sqrt6$、$\sin\theta=1/\sqrt3$。`, r`H 的极点为 $-2\pm j\sqrt2=\sqrt6e^{\pm j\theta}$。递推给 h(0)=1、h(1)=3，所以余弦系数为 1，正弦系数由 $-2+B\sqrt2=3$ 得 $B=5/\sqrt2$。`, { ...score('五(1)', 3), ...dfig }),
  p('五(2)', ['6.4'], 'discrete-diagram', discrete + '求输入输出差分方程。', r`$y(n)+4y(n-1)+6y(n-2)=x(n)+7x(n-1)$。`, r`$W/X=1/(1+4z^{-1}+6z^{-2})$，$Y/W=1+7z^{-1}$。消去 W，交叉相乘。注意第二个延时节点只接反馈，未接输出加法器。`, { ...score('五(2)', 3), ...dfig }),
  p('五(3)', ['7.7'], 'discrete-diagram', discrete + '求 H(z)。', r`$H(z)=\dfrac{z(z+7)}{z^2+4z+6}$，因果 ROC 为 $|z|>\sqrt6$。`, r`由节点方程得 $(1+7z^{-1})/(1+4z^{-1}+6z^{-2})$，同乘 z²。两个极点模均为 √6。`, { ...score('五(3)', 3), ...dfig }),
  p('五(4)', ['7.5', '7.7'], 'discrete-diagram', discrete + '求频率响应，说明存在性。', r`代数形式为 $(1+7e^{-j\omega})/(1+4e^{-j\omega}+6e^{-2j\omega})$；因果 h 的普通 DTFT 不存在。`, r`因果 ROC 在 √6 圆外，不包含单位圆。虽可将有理式形式代入 z=e^{jω}，这不是收敛的冲激响应 DTFT；不能据此说系统稳定。`, { ...score('五(4)', 4), ...dfig, note: '原卷直接要求 H(e^{jω})，须同时指出此不稳定因果系统的频率响应存在性条件。' }),
  p('五(5)', ['7.7'], 'discrete-diagram', discrete + '求零极点并画分布图。', r`零点 0、−7；极点 $-2\pm j\sqrt2$。`, r`分子 z(z+7)，分母 z²+4z+6。实轴零点画 ○，共轭极点画 ×；极点模 √6>1。`, { ...score('五(5)', 4), ...dfig }),
  p('五(6)', ['7.7', '6.3'], 'discrete-diagram', discrete + '判断稳定性。', '因果系统不稳定。', r`极点模 √6>1，因果 ROC 不含单位圆；h(n) 指数增长，不满足绝对可和。`, { ...score('五(6)', 3), ...dfig }),
  p('六(1)', ['4.6'], 'zp-h0', r`$H(s)=(s+5)/(s^2+5s+6)$，求零极点并画图。`, '零点 −5，极点 −2、−3。', r`分母 $(s+2)(s+3)$。均在实轴，零点标 ○，极点标 ×。`, score('六(1)', 4)),
  p('六(2)', ['4.6'], 'ode-to-diagram', r`$H(s)=(s+5)/(s^2+5s+6)$，写微分方程。`, r`$y''+5y'+6y=x'+5x$。`, r`交叉相乘 $(s^2+5s+6)Y=(s+5)X$，用零状态微分性质。`, score('六(2)', 3)),
  p('六(3)', ['4.3'], 'laplace-calc', r`因果 $H(s)=(s+5)/(s^2+5s+6)$，求 h(t)。`, r`$h(t)=(3e^{-2t}-2e^{-3t})u(t)$。`, r`部分分式系数：在 s=−2 得 3，在 s=−3 得 −2。初值为 3−2=1，与 lim sH 一致。`, score('六(3)', 4)),
  p('六(4)', ['3.7'], 'sine-steady', r`因果 $H(s)=(s+5)/(s^2+5s+6)$，求 H(jω)。`, r`$H(j\omega)=(5+j\omega)/(6-\omega^2+5j\omega)$。`, r`ROC 包含虚轴，代入 s=jω。ω=0 时值为 5/6，可作直流校验。`, score('六(4)', 4)),
];

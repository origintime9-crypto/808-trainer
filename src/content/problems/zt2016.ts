import type { Problem } from '../../types';
import { problem as make } from './helper';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make('zt2016', ...args);
const r = String.raw;
const score = (no: string, n: number) => ({ sources: [{ paper: 'zt2016', no, score: n }] });
const parallel = r`图中上支路串联 $H_1=1/(s+2)$、$H_2=2/(s+3)$，与 $h_3(t)=\delta(t)$ 的直接支路相加。`;
const moving = r`系统先计算 $f(t)-f(t-T)$，再从 $-\infty$ 积分到 t，$T>0$。`;
const discrete = r`图中 $w(n)=x(n)-2w(n-1)-w(n-2)$，$y(n)=w(n)+2w(n-1)$；系统因果。`;
const fig = { figures: ['figures/zt2016/q3.png'] }, mfig = { figures: ['figures/zt2016/q4.png'] }, dfig = { figures: ['figures/zt2016/q5.png'] };
export const zt2016: Problem[] = [
  p('一(1)', ['6.4', '7.7'], 'diff-eq-solve', r`题面写“单位阶跃响应” $h[n]=(-1/4)^nu[n]$。写系统差分方程，并区分题面与 h 符号两种解释。`, r`按阶跃响应：$y(n)+\tfrac14y(n-1)=x(n)-x(n-1)$。若实际指冲激响应：右端改为 $x(n)$。`, r`按字面阶跃响应 $G(z)=1/(1+z^{-1}/4)$。由于 $U(z)=1/(1-z^{-1})$，系统函数 $H=G/U=(1-z^{-1})/(1+z^{-1}/4)$。若题中 h 本指单位样值响应，则 H=G。`, { ...score('一(1)', 5), verified: 'uncertain', note: '题面“阶跃响应”与 h 命名及资料答案矛盾，保留两种解释，不以资料答案覆盖原题。' }),
  p('一(2)', ['5.2', '3.4'], 'nyquist', r`低通信号 f 的带宽为 2 kHz。求奈奎斯特间隔，以及 f(3t) 的带宽、奈奎斯特频率。`, r`$250\,\mu\mathrm{s}$；6 kHz；12 kHz。`, r`原信号采样率 4 kHz，间隔为 1/4000 秒。时域压缩 3 倍，频谱展宽 3 倍，再取两倍带宽作为采样频率。`, score('一(2)', 5)),
  p('一(3)', ['1.4'], 'delta-sift', r`$a\ne0$，计算 $\int_{-\infty}^{\infty}2\delta(at)\sin[\omega(t-\tau)]/(t-\tau)dt$。`, r`$\dfrac2{|a|}\dfrac{\sin\omega\tau}{\tau}$；$\tau=0$ 时取 $2\omega/|a|$。`, r`$\delta(at)=\delta(t)/|a|$，筛选 t=0。分子与分母同时变号，商为 sin(ωτ)/τ，τ=0 按极限取 ω。`, score('一(3)', 5)),
  p('一(4)', ['3.3'], 'ft-basic', r`$F(j\omega)=u(\omega+\omega_0)-u(\omega-\omega_0)$，$\omega_0>0$，求 f(t)。`, r`$f(t)=\sin\omega_0t/(\pi t)$。`, r`逆变换 $\frac1{2\pi}\int_{-\omega_0}^{\omega_0}e^{j\omega t}d\omega$。t=0 取 ω0/π。`, score('一(4)', 5)),
  p('一(5)', ['3.2'], 'concept', '周期信号频谱的三个基本特点是什么？', '离散性、谐波性、收敛性。', '谱线在基频整数倍处离散分布；对于常见可积周期信号，高次傅里叶系数趋于零。', { type: '填空', ...score('一(5)', 5) }),
  p('一(6)', ['3.2'], 'concept', '信号的频谱由哪两个部分组成？', '幅度谱、相位谱。', '分别给出各频率分量的模与相角。', { type: '填空', ...score('一(6)', 5) }),
  p('一(7)', ['4.7'], 'sys-prop', r`按因果系统理解，$H(s)=1/(s+3k+9)+1/(s-k)$，求稳定 k 范围。`, r`$-3<k<0$。`, r`两个极点为 $-3k-9$ 和 k，要求均严格小于零。第一条件得 k>−3，第二得 k<0，取交集。`, { ...score('一(7)', 5), verified: 'corrected', note: '曙光答案写 K>0 或 K<−3，恰好导致右半平面极点。若不提供因果性或 ROC，仅有理式本身不足以判定稳定，本题沿用课程因果约定。' }),
  p('一(8)', ['3.4'], 'ft-property', r`$f(t)\leftrightarrow F(j\omega)$，求 $f(t)\cos3\omega_0t$ 的 FT。`, r`$\tfrac12[F(j(\omega-3\omega_0))+F(j(\omega+3\omega_0))]$。`, r`调制把频谱复制到 ±3ω0，各乘 1/2。`, score('一(8)', 5)),
  p('一(9)', ['3.7'], 'sine-steady', r`$H(s)=1/(s+3)$，写 H(jω)，并求输入 $4\sin(3t-5)$ 的正弦稳态输出。`, r`$H(j\omega)=1/(j\omega+3)$；$y_s=(2\sqrt2/3)\sin(3t-5-\pi/4)$。`, r`ω=3 时模为 $1/(3\sqrt2)$、相位 −π/4。输出幅度 $4/(3\sqrt2)=2\sqrt2/3$。`, { ...score('一(9)', 5), verified: 'corrected', note: '曙光答案写 √2/6，漏乘输入幅度 4。' }),
  p('一(10)', ['4.2'], 'laplace-calc', r`因果 $X(s)=[1-e^{-(s+a)T}]/(s+a)$，$T>0$，求逆变换。`, r`$x(t)=e^{-at}[u(t)-u(t-T)]$。`, r`第二项为 $e^{-aT}e^{-sT}/(s+a)$，逆变换 $e^{-aT}e^{-a(t-T)}u(t-T)=e^{-at}u(t-T)$。与第一项相减。`, { ...score('一(10)', 5), verified: 'corrected', note: '曙光答案把时移写成 t+T，且丢失有限时宽截断。' }),
  p('二(1)', ['4.6'], 'zp-h0', r`题面称“左半平面有单极点 a（a>0），无零点”。写 H(s)、因果 h(t)，并说明零极点图。`, r`按左半平面极点为 −a：$H(s)=K/(s+a)$，$h(t)=Ke^{-at}u(t)$。`, r`左半平面极点的实部须负，所以将题面的正数 a 理解为极点到原点的距离。在实轴 −a 画 ×，无有限零点。增益 K 未给定，不能设为特定数值。`, { ...score('二(1)', 10), verified: 'uncertain', note: '原题极点符号与 a>0 矛盾；资料写 K/(s−a) 又违背左半平面条件。以 −a 作明确补全。' }),
  p('二(2)', ['2.4', '4.6'], 'conv-integral', r`三条并联支路分别为 $\delta(t)$、$h_1=\delta(t-1)$、$h_1*h_1$，相加后串联 $h_2=u(t)-u(t-1)$。输入 $f=u(t)-u(t-1)$，求输出并画图。`, r`$y(t)=\begin{cases}t&0\le t<1\\1&1\le t<3\\4-t&3\le t<4\\0&\text{其他}\end{cases}$。`, r`$f*h_2$ 是 [0,2] 上峰值 1 的三角形 v(t)。三条支路合成输出 $v(t)+v(t-1)+v(t-2)$。相邻三角形在 [1,3] 的上升、下降段相加恒为 1，得到梯形。`, { ...score('二(2)', 10), figures: ['figures/zt2016/q2-2.png'] }),
  p('二(3)', ['6.4', '7.2'], 'discrete-diagram', r`加法器输出为 y，两个单位延时输出分别以增益 1、6 正反馈。写差分方程，求单位样值响应；若“单位序列”指单位阶跃，也给出相应响应。`, r`$y(n)-y(n-1)-6y(n-2)=x(n)$；$h(n)=[(3/5)3^n+(2/5)(-2)^n]u(n)$。阶跃响应 $g(n)=[(9/10)3^n+(4/15)(-2)^n-1/6]u(n)$。`, r`$H=1/(1-z^{-1}-6z^{-2})=z^2/[(z-3)(z+2)]$。h(0)=1、h(1)=1 给两指数系数 3/5、2/5。阶跃响应是 h 的累加，分别求几何级数得到 g。`, { ...score('二(3)', 10), figures: ['figures/zt2016/q2-3.png'], note: '原卷写“单位序列响应”，此处同时列出单位样值与单位阶跃响应，避免术语歧义。' }),
  p('三(1)', ['4.6', '4.3'], 'block-to-Hs', parallel + '求 H(s) 与 h(t)。', r`$H=1+2/[(s+2)(s+3)]$；$h=\delta(t)+2(e^{-2t}-e^{-3t})u(t)$。`, r`串联相乘、并联相加，2/[(s+2)(s+3)] 部分分式为 2/(s+2)−2/(s+3)。直接支路须保留冲激。`, { ...score('三(1)', 4), ...fig }),
  p('三(2)', ['2.3', '4.6'], 'block-to-Hs', parallel + '输入 u(t)，求零状态响应。', r`$y_{zs}=[4/3-e^{-2t}+(2/3)e^{-3t}]u(t)$。`, r`积分冲激响应：$u(t)+[1-e^{-2t}-(2/3)(1-e^{-3t})]u(t)$，合并。初值为 1，终值 4/3。`, { ...score('三(2)', 4), ...fig }),
  p('三(3)', ['4.6'], 'block-to-Hs', parallel + '求零极点并画图。', r`极点 −2、−3，零点 $(-5\pm j\sqrt7)/2$。`, r`分子 $s^2+5s+8$，分母 $s^2+5s+6$，各求根。在 s 平面用 ×、○ 标示。`, { ...score('三(3)', 4), ...fig }),
  p('三(4)', ['4.6'], 'ode-to-diagram', parallel + '写输入输出微分方程。', r`$y''+5y'+6y=x''+5x'+8x$。`, r`H=(s²+5s+8)/(s²+5s+6)，交叉相乘得到。`, { ...score('三(4)', 4), ...fig }),
  p('三(5)', ['3.7'], 'block-to-Hs', parallel + '求频率响应。', r`$H(j\omega)=(8-\omega^2+5j\omega)/(6-\omega^2+5j\omega)$。`, r`因果 ROC 在 −2 右侧，含虚轴，将 s 换成 jω。高频极限为 1，与直接支路吻合。`, { ...score('三(5)', 4), ...fig }),
  p('四(1)', ['2.3', '4.2'], 'filter-output', moving + '求 h(t) 和 H(s)。', r`$h=u(t)-u(t-T)$；$H(s)=(1-e^{-sT})/s$。`, r`对 δ 输入，先得 δ(t)−δ(t−T)，积分为有限门。其拉氏变换是在 [0,T] 上积分，s=0 可去，取值 T。`, { ...score('四(1)', 9), ...mfig }),
  p('四(2)', ['3.7', '3.9'], 'filter-output', moving + '求 H(jω)、幅相特性，并说明作图。', r`$H(j\omega)=T\mathrm{Sa}(\omega T/2)e^{-j\omega T/2}$；$|H|=T|\mathrm{Sa}(\omega T/2)|$。相位为 $-\omega T/2$，当 Sa 为负时另加 π（模 2π）。`, r`$1-e^{-j\omega T}=e^{-j\omega T/2}2j\sin(\omega T/2)$。幅频在 ω=0 为 T、在 $2k\pi/T$（k≠0）有零点，旁瓣衰减；相位在零点处无定义，不能把带符号 Sa 当成幅度。`, { ...score('四(2)', 11), ...mfig }),
  p('四(3)', ['2.4'], 'conv-integral', moving + r`输入 $f=u(t)-u(t-T)$，求零状态响应并画波形。`, r`$y(t)=\begin{cases}t&0\le t<T\\2T-t&T\le t<2T\\0&\text{其他}\end{cases}$。`, r`输入和 h 都是宽 T、高 1 的矩形，卷积值是重叠长度。顶点在 (T,T)，支撑 [0,2T]。`, { ...score('四(3)', 4), ...mfig }),
  p('四(4)', ['5.2', '2.4'], 'filter-output', moving + r`输入 $f_s(t)=\sum_{n=0}^{\infty}f(nT)\delta(t-nT)$，求响应。`, r`$y(t)=\sum_{n=0}^{\infty}f(nT)[u(t-nT)-u(t-(n+1)T)]$。`, r`逐个冲激通过宽 T 的门响应，权重就是采样值，按线性相加。每个区间 [nT,(n+1)T) 内维持 f(nT)，所以这是零阶保持输出，不能误写成 sinc 理想内插。`, { ...score('四(4)', 5), ...mfig }),
  p('五(1)', ['7.2', '6.4'], 'discrete-diagram', discrete + '求单位样值响应。', r`$h(n)=(1-n)(-1)^nu(n)$。`, r`$H=(1+2z^{-1})/(1+z^{-1})^2$。$(1+q)^{-2}=\sum(n+1)(-1)^nq^n$，乘 1+2q 后系数为 $(n+1)(-1)^n+2n(-1)^{n-1}=(1-n)(-1)^n$。h(1)=0 可检查符号。`, { ...score('五(1)', 3), ...dfig, verified: 'corrected', note: '曙光答案给 (1+n)(−1)^n，未计入输出前馈的 2z⁻¹，n=1 校验失败。' }),
  p('五(2)', ['6.4'], 'discrete-diagram', discrete + '写差分方程。', r`$y(n)+2y(n-1)+y(n-2)=x(n)+2x(n-1)$。`, r`将 W/X 与 Y/W 相乘后交叉相乘。反馈系数取到等号左侧时改为正号。`, { ...score('五(2)', 3), ...dfig }),
  p('五(3)', ['7.7'], 'discrete-diagram', discrete + '求 H(z)。', r`$H(z)=z(z+2)/(z+1)^2$，ROC 为 $|z|>1$。`, r`节点方程得 (1+2z⁻¹)/(1+2z⁻¹+z⁻²)，分母为 (1+z⁻¹)²。第二延时输出只反馈，不连接输出加法器。`, { ...score('五(3)', 3), ...dfig }),
  p('五(4)', ['7.5', '7.7'], 'discrete-diagram', discrete + '求 H(e^{jω})，说明存在性。', r`形式代入得 $(1+2e^{-j\omega})/(1+2e^{-j\omega}+e^{-2j\omega})$；普通 DTFT 不存在，ω=π 处形式式亦有极点。`, r`因果 ROC 为 |z|>1，不包含单位圆，h 不绝对可和且随 n 增长。单位圆上的重极点不能视为 BIBO 稳定。`, { ...score('五(4)', 4), ...dfig }),
  p('五(5)', ['7.7'], 'discrete-diagram', discrete + '求零极点并画分布图。', '零点 0、−2；极点 −1，二重。', '分子 z(z+2)、分母 (z+1)²。在实轴零点画 ○，−1 处画 × 并标重数 2。', { ...score('五(5)', 4), ...dfig }),
  p('五(6)', ['7.7', '6.3'], 'discrete-diagram', discrete + '判断稳定性。', '不稳定。', r`单位圆上有二阶极点，因果 ROC 不含单位圆；$\sum|(1-n)(-1)^n|$ 发散。`, { ...score('五(6)', 3), ...dfig }),
];

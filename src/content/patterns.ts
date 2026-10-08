import type { Pattern } from '../types';

export const patterns: Pattern[] = [
  {
    id: 'inverse-system',
    name: '系统可逆性与逆系统',
    kps: ['1.7'],
    method: String.raw`判断不同输入能否产生相同输出。若能，给一组反例；若不能，写出恢复输入的操作。时移和非零连续尺度可逆；微分在未指定积分常数时不可逆。积分和逆操作须说明输入范围及边界条件；可逆不代表逆系统因果或稳定。`,
  },
  {
    id: 'state-space',
    name: '状态方程建立（扩展题）',
    kps: ['8.1', '8.2'],
    method: String.raw`1. 二阶输出方程可取 $q_1=y,q_2=y'$；更高阶依次取各阶导数。
2. 从最高阶导数方程读出矩阵 $A,B$，从输出关系读出 $C,D$。
3. 直接型令辅助信号满足分母多项式方程；输出由分子系数形成。
4. 用 $C(sI-A)^{-1}B+D$ 回算系统函数。
5. 离散框图可选延时器输出为状态，列 $q(k+1)=Aq(k)+Bx(k)$、$y(k)=Cq(k)+Dx(k)$，用 $C(zI-A)^{-1}B+D$ 回算。按院校重点表，此题型仅作扩展。`,
  },
  {
    id: 'delta-sift',
    name: '冲激函数积分（筛选性质）',
    kps: ['1.4'],
    method: String.raw`1. 找冲激所在位置 $t_0$（$\delta(at-b)$ 先化成 $\frac{1}{|a|}\delta(t-\frac ba)$）。
2. $t_0$ 在积分区间内：结果为被积函数在 $t_0$ 处的值；不在区间内：结果为 $0$。
3. 被积函数在 $t_0$ 处无定义（如 $\frac{\sin 2t}{t}$）时取极限值。
4. 冲激偶：$\int f(t)\delta'(t-t_0)dt=-f'(t_0)$。`,
  },
  {
    id: 'sys-prop',
    name: '系统性质判断（线性/时不变/因果/稳定）',
    kps: ['1.8', '6.3'],
    method: String.raw`- **线性**：验证 $T[ax_1+bx_2]=ay_1+by_2$；出现 $x^2$、$|x|$、$\sin x$、常数项都非线性。
- **时不变**：比较 $T[x(t-t_0)]$ 与 $y(t-t_0)$；系数含 $t$（如 $t\,x(t)$、$x(t)u(t)$）、尺度 $x(2t)$、反褶 $x(-t)$、积分上限含 $t$ 的倍数一般时变。
- **因果**：输出是否用到未来时刻的输入；LTI 系统看 $h(t)=0,\ t<0$。
- **稳定**：有界输入是否得到有界输出。连续 LTI 的普通函数核看 $\int|h(t)|dt<\infty$，离散核看 $\sum|h(n)|<\infty$；有限冲激直通把强度绝对值计入总变差。
- 答题必须写出判断依据或反例，只写结论不得分。`,
  },
  {
    id: 'waveform',
    name: '信号波形变换与作图',
    kps: ['1.5', '1.4', '6.1'],
    method: String.raw`1. 先把信号写成分段表达式，标出关键点坐标、跳变点和冲激强度。
2. $f(at+b)$：先平移得 $f(t+b)$，再压缩/扩展 $|a|$ 倍，$a<0$ 时再反褶；每一步都只对 $t$ 本身操作。
3. 离散序列 $x[an+b]$ 会丢点（抽取），不能像连续信号那样随意先尺度后平移。`,
  },
  {
    id: 'period',
    name: '周期判断与周期计算',
    kps: ['1.2'],
    method: String.raw`- 连续：$T_1/T_2$ 为有理数时和信号周期，周期为最小公倍数；无理数则非周期。
- 离散 $\cos(\Omega_0 n)$：$2\pi/\Omega_0=N/m$（既约分数）时周期为 $N$；$2\pi/\Omega_0$ 为无理数时非周期。
- 多个序列相加：各自周期的最小公倍数。`,
  },
  {
    id: 'conv-integral',
    name: '卷积积分（图解法/性质法）',
    kps: ['2.4'],
    method: String.raw`1. 图解：反褶 $f_2(\tau)\to f_2(t-\tau)$，按 $t$ 分段讨论重叠区间，确定积分上下限。
2. 性质：用 $u(t)$ 展开，配合 $f*\delta(t-t_0)=f(t-t_0)$、$u*u=tu(t)$、时移性质。
3. 校验：起点 = 两起点之和，终点 = 两终点之和；$\int y\,dt=\int f_1dt\cdot\int f_2dt$。`,
  },
  {
    id: 'conv-sum',
    name: '卷积和（不进位乘法）',
    kps: ['6.2'],
    method: String.raw`1. 两个有限长序列按竖式"不进位乘法"对位相乘再相加。
2. 结果起点 = 两序列起点之和，长度 = $N_1+N_2-1$，标出 $n=0$ 的位置。
3. 校验：$\sum y(n)=\sum x(n)\cdot\sum h(n)$。`,
  },
  {
    id: 'full-response-decomp',
    name: '全响应分解（激励倍乘/延时、初始状态倍乘）',
    kps: ['2.2', '1.8'],
    method: String.raw`1. 设 $y=y_{zi}+y_{zs}$，激励变为 $k$ 倍时 $y'=y_{zi}+k\,y_{zs}$，联立解出 $y_{zi}$、$y_{zs}$。
2. 激励延时 $t_0$：$y=y_{zi}(t)+y_{zs}(t-t_0)$，注意 $u(t)$ 也要换成 $u(t-t_0)$。
3. 初始状态 $\times a$、激励 $\times b$：$y=a\,y_{zi}+b\,y_{zs}$。`,
  },
  {
    id: 'ft-basic',
    name: '常见信号的傅里叶变换',
    kps: ['3.3', '3.5'],
    method: String.raw`熟记：$e^{-at}u(t)\leftrightarrow\frac{1}{a+j\omega}$（$a>0$），单位矩形 $G_\tau(t)\leftrightarrow\tau\,\mathrm{Sa}(\frac{\omega\tau}{2})$，$\delta(t)\leftrightarrow1$，$1\leftrightarrow2\pi\delta(\omega)$，$\cos\omega_0t\leftrightarrow\pi[\delta(\omega+\omega_0)+\delta(\omega-\omega_0)]$，$u(t)\leftrightarrow\pi\delta(\omega)+\operatorname{PV}\frac{1}{j\omega}$。阶跃、常数和永久正弦使用广义变换，PV 表示柯西主值。先拆成基本信号，再用性质组合。`,
  },
  {
    id: 'ft-property',
    name: '傅里叶变换性质运用（尺度/时移/对偶/微分/调制）',
    kps: ['3.4'],
    method: String.raw`- 尺度+时移：$f(at-b)\leftrightarrow\frac{1}{|a|}F(j\frac{\omega}{a})e^{-j\omega b/a}$。
- 对偶：$F(jt)\leftrightarrow2\pi f(-\omega)$，处理 $\mathrm{Sa}$、$\frac{1}{a+jt}$ 类信号。
- 频域微分：$t\,f(t)\leftrightarrow j\frac{dF(j\omega)}{d\omega}$。
- 调制：$f(t)\cos\omega_0t\leftrightarrow\frac12[F(j(\omega+\omega_0))+F(j(\omega-\omega_0))]$。`,
  },
  {
    id: 'nyquist',
    name: '奈奎斯特抽样频率/间隔',
    kps: ['5.2', '3.4'],
    method: String.raw`1. 求每个信号的最高角频率：$\mathrm{Sa}(\omega_ct)$ 为 $\omega_c$，$\mathrm{Sa}^2(\omega_ct)$ 为 $2\omega_c$，$\cos\omega_0t$ 为 $\omega_0$。
2. 合成带宽上界：相加取大，相乘相加，卷积取小；$f(at)$ 的带宽乘 $|a|$，时移不改变带宽。边缘抵消或微分消去分量时实际带宽可能更小。
3. $f_N=2f_m=\omega_m/\pi$，奈奎斯特间隔 $T_N=1/f_N$。注意 Hz 与 rad/s 的换算；临界等号需检查边缘冲激等条件，严格高于奈奎斯特频率时才保证频谱副本分离。`,
  },
  {
    id: 'sine-steady',
    name: '正弦稳态响应',
    kps: ['3.7', '4.6'],
    method: String.raw`稳定系统：$A\sin(\omega_0t+\theta)\to A|H(j\omega_0)|\sin(\omega_0t+\theta+\varphi(\omega_0))$。分子分母分别求模和相角再相除、相减；多个频率分量分别计算再叠加；直流分量用 $H(0)$。`,
  },
  {
    id: 'ft-exist-from-Hs',
    name: '由 H(s) 判断频率响应（傅里叶变换）是否存在',
    kps: ['4.4', '4.7'],
    method: String.raw`先约去相消因子，判断实际极点及 ROC。普通收敛的傅里叶变换要求 ROC 包含整条 $j\omega$ 轴；默认因果时，极点全在左半平面满足条件，可令 $s=j\omega$，有右半平面或虚轴实际极点则不满足。非因果系统必须使用题目给定的 ROC。虚轴极点在适当条件下可定义广义变换，含柯西主值或冲激项，不能据此声称普通变换存在，也不能直接代入极点。`,
  },
  {
    id: 'block-to-Hs',
    name: '框图（串/并/反馈）求 H(s)、h(t)、零极点、微分方程、H(jω)',
    kps: ['4.6', '4.5', '1.7'],
    method: String.raw`1. 串联相乘、并联相加、负反馈 $\frac{G}{1+GH}$；复杂框图设中间变量列方程。
2. 部分分式求 $h(t)$；分子分母多项式的根为零、极点。
3. $H(s)=\frac{B(s)}{A(s)}$ 交叉相乘得微分方程；稳定时 $H(j\omega)=H(s)|_{s=j\omega}$。`,
  },
  {
    id: 'zp-h0',
    name: '零极点图 + 附加条件求 H(s)（含稳定性、h(t)、正弦稳态）',
    kps: ['4.6', '4.2', '4.7', '3.7'],
    method: String.raw`1. 由图写 $H(s)=K\frac{\prod(s-z_i)}{\prod(s-p_j)}$，共轭极点配成 $(s+\alpha)^2+\beta^2$。
2. 定 K：因果 h 为普通函数时用 $h(0^+)=\lim_{s\to\infty}sH(s)$；若给 $H(\infty)=D$，D 是冲激直通增益，先除去此常数再求普通部分。用阶跃终值定 $H(0)$ 还须满足终值定理。
3. 先确定因果性或 ROC；仅给零极点与增益，h 一般不唯一。分子次数不大于分母次数时，因果有理系统的实际极点全在左半平面才 BIBO 稳定；一般情形检查 ROC 是否包含虚轴，并排除冲激导数等不稳定多项式项。部分分式求 h，正弦响应使用存在的 $H(j\omega_0)$。`,
  },
  {
    id: 'laplace-calc',
    name: '拉氏正/逆变换（时移、截断信号、部分分式、ROC）',
    kps: ['4.1', '4.2', '4.3'],
    method: String.raw`- 截断信号 $f(t)[u(t)-u(t-T)]$：把第二项改写成 $g(t-T)u(t-T)$ 再用时移性质，或直接积分 $\int_0^T f(t)e^{-st}dt$。
- 含 $e^{-st_0}$ 的象函数：先对不含指数的部分求逆变换，再整体延时 $t_0$。
- 假分式先长除；按 ROC 判断每个极点对应右边还是左边信号。`,
  },
  {
    id: 'routh',
    name: '劳斯判据 / 反馈系统稳定时 K 的范围',
    kps: ['4.7'],
    method: String.raw`1. 先求闭环 $H(s)$，取分母多项式。
2. 列劳斯表，第一列全为正 ⟺ 稳定，由此解出 $K$ 的范围。
3. 三阶 $s^3+a_2s^2+a_1s+a_0$：稳定 ⟺ $a_2,a_1,a_0>0$ 且 $a_2a_1>a_0$。`,
  },
  {
    id: 'discrete-diagram',
    name: '离散框图求 h(n)、差分方程、H(z)、H(e^jω)、稳定性',
    kps: ['7.7', '6.4', '7.6'],
    method: String.raw`1. 设第一个加法器输出为 $w(n)$，列 $w(n)=x(n)+\sum a_kw(n-k)$，$y(n)=\sum b_kw(n-k)$。
2. $z$ 域消去 $W(z)$ 得 $H(z)$，交叉相乘得差分方程。
3. $\frac{H(z)}{z}$ 部分分式并按 ROC 求 $h(n)$。因果有理系统的实际极点全在单位圆内才稳定；一般情形须 ROC 包含单位圆。只有单位圆属于 ROC 时，代 $z=e^{j\omega}$ 才得到收敛的普通频率响应。`,
  },
  {
    id: 'hz-roc-all',
    name: 'H(z) 的所有可能收敛域及对应 h(n)',
    kps: ['7.1', '7.2', '7.7'],
    method: String.raw`1. $\frac{H(z)}{z}$ 部分分式，得到 $\sum K_i\frac{z}{z-p_i}$。
2. $N$ 个不同模值的极点把 $z$ 平面分成 $N+1$ 个区域，各对应一个 $h(n)$。
3. 极点在 ROC 内侧 → 右边序列 $p^nu(n)$；在外侧 → 左边序列 $-p^nu(-n-1)$。包含单位圆的那个 ROC 是稳定的。`,
  },
  {
    id: 'z-calc',
    name: 'z 变换/反变换与性质（含初值、终值）',
    kps: ['7.1', '7.2', '7.3'],
    method: String.raw`- 常用对：$a^nu(n)\leftrightarrow\frac{z}{z-a}$（$|z|>|a|$），有限长序列直接写成 $z^{-1}$ 的多项式。
- 初值 $x(0)=\lim_{z\to\infty}X(z)$；终值 $x(\infty)=\lim_{z\to1}(z-1)X(z)$，前提是极点都在单位圆内（$z=1$ 处最多一阶）。必须先检查条件。`,
  },
  {
    id: 'ode-to-diagram',
    name: '微分方程 / H(s) 画直接型框图',
    kps: ['4.6', '1.7'],
    method: String.raw`1. 写出 $H(s)$，分子分母同除以 $s^n$ 化成 $s^{-1}$ 的多项式。
2. 引入中间变量 $q(t)$：$q^{(n)}=x-\sum a_kq^{(n-k)}$，$y=\sum b_kq^{(n-k)}$。
3. 画 $n$ 个积分器串联，分母系数取负作反馈，分子系数作前馈，标清系数与信号名。`,
  },
  {
    id: 'diff-eq-solve',
    name: '差分方程求零输入/零状态/全响应',
    kps: ['6.4', '7.6'],
    method: String.raw`- 时域：特征根得齐次解，按激励形式设特解；$y_{zi}$ 用 $y(-1),y(-2)$ 定系数，$y_{zs}$ 先由零初始状态递推出 $y(0),y(1)$ 再定系数。
- $z$ 域：单边 $z$ 变换，$x(n-1)u(n)\leftrightarrow z^{-1}X(z)+x(-1)$，代入初始条件后分别得 $Y_{zi}$、$Y_{zs}$。`,
  },
  {
    id: 'ode-s-solve',
    name: '微分方程 s 域求零输入/零状态/全响应',
    kps: ['4.5', '2.1', '2.2'],
    method: String.raw`两边单边拉氏变换，$y'\leftrightarrow sY-y(0^-)$，$y''\leftrightarrow s^2Y-sy(0^-)-y'(0^-)$；整理成 $Y=Y_{zi}+Y_{zs}$，$Y_{zs}=H(s)X(s)$，分别部分分式求逆变换。再按特征根/激励极点区分自由响应与强迫响应。`,
  },
  {
    id: 'filter-output',
    name: '理想滤波器 / 调制系统 / 无失真传输的输出',
    kps: ['3.6', '3.8', '3.9'],
    method: String.raw`1. 把输入（或调制后的信号）展开成各频率分量，或画出频谱。
2. 逐个分量看是否落在通带内，通带内的分量乘以 $|H|$ 并加相移 $\varphi(\omega)$。
3. 无失真：$|H|$ 为常数且 $\varphi(\omega)=-\omega t_0$。`,
  },
  {
    id: 'concept',
    name: '概念与结论填空',
    kps: ['3.2', '2.2', '1.2'],
    method: String.raw`周期信号频谱：离散性、谐波性、收敛性；频谱包括幅度谱和相位谱；全响应 = 零输入 + 零状态 = 自由 + 强迫 = 暂态 + 稳态；时宽与带宽成反比。`,
  },
  {
    id: 'correlation',
    name: '相关函数、信号类别与长时间平均（了解项）',
    kps: ['2.5', '6.5'],
    method: String.raw`1. 先判信号是否为有限能量或有限平均功率；发散的积分或平均值不能当成相关函数。
2. 能量相关用 $R_{ij}(\tau)=\int_{-\infty}^{\infty}f_i(t)f_j^*(t-\tau)dt$；离散信号把积分换为全整数求和。它与反褶共轭后的卷积有关，但单独统计相关题型。
3. 功率相关要按题定的归一化求长时间平均；乘 $u(t)$ 的正弦只占双边观察窗的一半，不能照搬全时间周期信号的系数。
4. 积分或平均极限存在、边界项满足条件时再用换向共轭关系；自相关的模不超过零延时值，实自相关为偶函数。
5. 按中北808圈画表，连续和离散相关均为一星了解项，优先级低于卷积与系统响应。`,
  },
];

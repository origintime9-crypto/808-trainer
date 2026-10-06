import type { Problem } from '../../types';
import { problem as make } from './helper';
const paper = 'tk-exam-02';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make(paper, ...args);
const r = String.raw;
const score = (no: string, value: number): Partial<Problem> => ({ sources: [{ paper, no, score: value }] });
const fill = (no: string): Partial<Problem> => ({ ...score(no, 3), type: '填空' });
const pic = (no: string) => ({ figures: ['figures/tk-exam-02/q' + no + '.png'] });
const sharedScore = '原卷每道综合题共 10 分，未给各小问或各节点的分值；拆成五个作答单元，但不擅自拆分分数。';
const difference = r`因果 LTI 系统 $y(k)-\frac34y(k-1)+\frac18y(k-2)=2f(k)+3f(k-1)$，$k\ge0$，输入 $f(k)=u(k)$，初态 $y(-1)=2,y(-2)=-1$。`;
const sampler = r`图示系统中，输入谱 $F_A(j\omega)=\frac1{10}(1-\frac{|\omega|}{20\pi})$（$|\omega|<20\pi$），带外为 0。B 为 $\delta_T(t)=\sum_n\delta(t-nT)$，$T=0.02$ s。A 与 B 相乘得 C，再经 $H_1$ 得 D；D 乘 $\cos100\pi t$ 得 E，再经 $H_2$ 得 F。$H_1=1$ 仅在 $100\pi<|\omega|<120\pi$，$H_2=1$ 仅在 $|\omega|<20\pi$，带外均为 0。谱的边界单点取值不影响逆变换。`;
const spectral = { ...pic('3-2'), type: '画图' as const, note: sharedScore };

export const tkExam02: Problem[] = [
  p('一(1)', ['1.8'], 'sys-prop', r`系统关系 $y(t)=t^2f(t)f'(t)+2X(0)$，其中 $X(0)$ 是固定的初始状态。判断线性与时不变性。`, '非线性、时变。', r`即使取 $X(0)=0$，也有 $T[af]=a^2t^2ff'$，通常不等于 $aT[f]$。以 $f=t$、延时 1 为例：延时输入的输出为 $t^2(t-1)+2X(0)$，原输出延时为 $(t-1)^3+2X(0)$，差为 $2t^2-3t+1$，故时变。`, { ...fill('一(1)'), verified: 'corrected', note: '资料第 5 页把系统写成“线性时变”。输入 f 与 f′ 相乘是二次项，初始状态解释不能使这个算子变成线性。' }),
  p('一(2)', ['1.4'], 'delta-sift', r`计算 $\int_{-\infty}^{3}(2t^2+3t)\delta(t/2-2)\,dt$。`, '0。', r`$\delta(t/2-2)=2\delta(t-4)$，但冲激位置 4 在积分上限 3 之外，因此为 0；不要筛选后忘记检查区间。`, fill('一(2)')),
  p('一(3)', ['1.4', '1.5'], 'waveform', r`计算 $\int_{-\infty}^{\infty}u(2t-2)u(4-2t)\,dt$。`, '1。', r`两阶跃分别要求 $t>1$、$t<2$，乘积为宽度 1 的单位矩形。积分为 $\int_1^2dt=1$，端点单点取值无影响。`, fill('一(3)')),
  p('一(4)', ['6.2', '6.1'], 'conv-sum', r`$f_1(k)=2^k[u(k)-u(k-3)]$；$f_2(k)=\{2,5,3\}$，原图箭头标在 5，即 $f_2(0)=5$。求卷积和并标明下标。`, r`$\{2,9,21,26,12\}$，对应 $k=-1,0,1,2,3$，其中零下标项为 9。`, r`$f_1(0),f_1(1),f_1(2)=1,2,4$，而 $f_2$ 支撑为 −1 至 1。按有限序列卷积得五个幅度；结果起点 $0+(-1)=-1$、终点 $2+1=3$，不能把所列第一项自动当作 $k=0$。`, fill('一(4)')),
  p('一(5)', ['3.8'], 'filter-output', r`LTI 系统的零状态响应为 $y_{zs}(t)=Kf(t-t_0)$，其中 $K,t_0$ 为常数。求频率响应 H(jω) 和冲激响应 h(t)。`, r`$H(j\omega)=Ke^{-j\omega t_0}$，$h(t)=K\delta(t-t_0)$。`, r`延时与常数倍在频域给所示 H；由冲激卷积移位性质，$f*K\delta(t-t_0)=Kf(t-t_0)$。无失真条件只需在信号占用的频带内满足。`, fill('一(5)')),
  p('一(6)', ['5.2', '3.4'], 'nyquist', r`低通信号 f(t) 的最高频率为 $f_m$ Hz，对 $y(t)=f(t)f(2t)$ 抽样，按合成带宽上界求奈奎斯特间隔。`, r`$T_N=1/(6f_m)$ s。`, r`$f(2t)$ 带宽展宽至 $2f_m$；时域相乘对应频谱卷积，合成带宽上界为 $3f_m$，抽样频率上界规则给 $f_N=6f_m$。若特定频谱边缘抵消，实际带宽可低于此上界；临界等号还需边缘条件。`, fill('一(6)')),
  p('一(7)', ['4.4', '4.1'], 'ft-exist-from-Hs', r`$F(s)=1/[(s^2+1)(s-1)]$，普通傅里叶变换是否存在？`, '不存在。', r`实际极点为 $1,\pm j$；虚轴有实际极点，任何 ROC 都不能包含整条虚轴，不能直接以 s=jω 得到普通收敛的傅里叶变换。`, fill('一(7)')),
  p('一(8)', ['7.7', '7.1'], 'hz-roc-all', r`离散 LTI 系统 $H(z)=1/(2+z^{-1}-z^{-2})$ 是否 BIBO 稳定？`, '不稳定。', r`实际极点为 $1/2,-1$；单位圆上存在极点 −1，无任何 ROC 能包含整个单位圆。`, fill('一(8)')),
  p('一(9)', ['1.4'], 'delta-sift', r`计算 $\int_{-\infty}^{\infty}(t^2+2t)\delta(-t+1)\,dt$。`, '3。', r`冲激强度因子为 1，筛选位置为 t=1，故结果为 $1+2=3$。`, fill('一(9)')),
  p('一(10)', ['1.6', '3.4'], 'ft-property', r`$F(j\omega)=A(\omega)e^{-j3\omega}$，A 为实偶函数。f(t) 有什么实虚性和对称性？`, '实信号，关于 t=3 偶对称。', r`A 的反变换为实偶函数 a，频域相位因子使 $f(t)=a(t-3)$，于是 $f(3+\tau)=f(3-\tau)$。`, fill('一(10)')),
  p('二(1)', ['3.7', '3.9'], 'filter-output', r`$h(t)=\mathrm{Sa}(3t)/\pi$，输入 $f(t)=3+\cos2t$（全时域），求稳态输出。`, r`$y(t)=1+\frac13\cos2t$。`, r`$\mathrm{Sa}(3t)/\pi=\sin3t/(3\pi t)$，频响在 $|\omega|<3$ 内为 1/3。直流和角频率 2 都在通带内，各乘 1/3。`, score('二(1)', 10)),
  p('二(2)', ['1.5'], 'waveform', r`已知 $g(t)=f(2t+2)$ 如图：$-2<t<0$ 为 $t+1$，$0<t<1$ 为 1，$1<t<2$ 为 −1，其余为 0。画 $f(4-2t)$。`, r`$f(4-2t)=g(1-t)=\begin{cases}-1&-1<t<0\\1&0<t<1\\2-t&1<t<3\\0&\text{其他}\end{cases}$。

![复合自变量变换后的波形](figures/tk-exam-02/a2-2.svg)`, r`令 $2\xi+2=4-2t$，得到 $\xi=1-t$。已知波形的分界点 $-2,0,1,2$ 依次映射为 $3,1,0,-1$；幅度保持不变，顺序反转。直接对 g 进行反褶和平移，比先恢复整个 f 更简洁。`, { ...score('二(2)', 10), ...pic('2-2'), type: '画图', verified: 'corrected', note: '资料第 6 页推导首行把已知的 f(2t+2) 误写成 f(2t−2)。依据题干与图 A-1 取 +2，独立坐标映射与其最后波形一致；跳变端点可按 u(0) 约定。' }),
  p('二(3)', ['3.3', '3.4'], 'ft-property', r`求图示信号的傅里叶变换。图中 $t<2$ 的基线为 2，另在 $-2<t<2$ 叠加一个中心在 0 的三角脉冲，但顶峰未标幅值。将超出基线的三角高度记为 $A$，按 $f(t)=2u(2-t)+A(1-|t|/2)$（三角项仅在 $|t|<2$ 内）给参数化解。`, r`广义傅里叶变换为

$$F(j\omega)=2\pi\delta(\omega)-2e^{-j2\omega}\operatorname{PV}\frac1{j\omega}+2A\,\mathrm{Sa}^2(\omega).$$

这里 PV 表示柯西主值。普通收敛的傅里叶积分不存在。若另确认三角高度为 3，末项才可写成 $6\mathrm{Sa}^2(\omega)$。`, r`左边阶跃 $2u(-t)$ 的广义变换为 $2\pi\delta-2\operatorname{PV}(1/j\omega)$。延时 2 对整项乘 $e^{-j2\omega}$，其中冲激项不变。高度 A、半宽 2 的三角形面积为 2A，变换为 $2A\mathrm{Sa}^2(\omega)$，两部分相加即可。`, { ...score('二(3)', 10), ...pic('2-3'), verified: 'uncertain', note: '原题图 A-2 只标基线高度 2，未标顶峰；参考解把附加三角高度取为 3，这个数值无法由题图核实，故保留 A 而不编造题面。参考解的时移相位还写成 e⁺ʲ²ω，正确方向应为 e⁻ʲ²ω。' }),
  p('二(4)', ['7.7', '6.4'], 'discrete-diagram', r`系统单位样值响应为 $h(k)=[(-1)^{k-1}+(-1/2)^{k-1}]u(k)$，写差分方程。`, r`$y(k)+\frac32y(k-1)+\frac12y(k-2)=-3f(k)-\frac52f(k-1)$。`, r`两项因果指数的变换分别为 $-1/(1+z^{-1})$、$-2/(1+z^{-1}/2)$，合并得 $H=(-3-\frac52z^{-1})/(1+\frac32z^{-1}+\frac12z^{-2})$。交叉相乘再取逆变换。可检查 $h(0)=-3$、$h(1)=2$。`, score('二(4)', 10)),
  p('二(5)', ['8.1', '8.2', '7.8'], 'state-space', '系统如图，状态变量 x₁(k)、x₂(k) 分别取两个延时器的输出；两反馈为负反馈，输出端的两加法器均将 x₁、x₂ 相加。写状态和输出方程。', r`$$\begin{bmatrix}x_1(k+1)\\x_2(k+1)\end{bmatrix}=\begin{bmatrix}-a&0\\0&-b\end{bmatrix}\begin{bmatrix}x_1(k)\\x_2(k)\end{bmatrix}+\begin{bmatrix}1\\1\end{bmatrix}f(k),$$

$$\begin{bmatrix}y_1(k)\\y_2(k)\end{bmatrix}=\begin{bmatrix}1&1\\1&1\end{bmatrix}\begin{bmatrix}x_1(k)\\x_2(k)\end{bmatrix}.$$ `, r`延时器的下一拍输出等于本拍输入，所以 $x_1(k+1)=f(k)-ax_1(k)$，$x_2(k+1)=f(k)-bx_2(k)$。两输出均为 $x_1+x_2$；框图交叉线没有连接点，不引入额外状态耦合。这是第八章的低优先级扩展题。`, { ...score('二(5)', 10), ...pic('2-5'), verified: 'corrected', note: '资料第 8 页把输出矩阵式误排成两次等号，应为输出矩阵乘状态向量。按框图列式，状态矩阵对角，两输出相同。' }),
  p('三1(1)', ['7.7', '7.2'], 'discrete-diagram', difference + '求单位样值响应及 H(z)。', r`$H(z)=(2+3z^{-1})/[(1-z^{-1}/2)(1-z^{-1}/4)]$，ROC 为 $|z|>1/2$；

$h(k)=[16(1/2)^k-14(1/4)^k]u(k)$。`, r`系统函数由零状态方程得到。分母因式分解后，部分分式系数为 16、−14；因果 ROC 取最外侧。检查 $h(0)=2,h(1)=9/2$，分别满足 k=0、1 的冲激输入方程。`, { note: sharedScore }),
  p('三1(2)', ['6.4', '7.6'], 'diff-eq-solve', difference + '求零输入响应。', r`$y_{zi}(k)=[\frac94(1/2)^k-\frac58(1/4)^k]u(k)$。`, r`单边 z 变换的初态项分子为 $\frac34y(-1)-\frac18[z^{-1}y(-1)+y(-2)]=13/8-z^{-1}/4$。除以系统分母，再分成系数 $9/4,-5/8$ 的两个右边指数。它在 k=0 为 13/8，与无输入递推一致。`, { note: sharedScore }),
  p('三1(3)', ['6.4', '7.6'], 'diff-eq-solve', difference + '求零状态响应。', r`$y_{zs}(k)=[-16(1/2)^k+\frac{14}3(1/4)^k+\frac{40}3]u(k)$。`, r`输入变换为 $1/(1-z^{-1})$。$Y_{zs}=H/(1-z^{-1})$，按极点 $1/2,1/4,1$ 展开，系数分别为 $-16,14/3,40/3$。零状态初项为 2，不能带入非零初态求这部分响应。`, { note: sharedScore }),
  p('三1(4)', ['6.4', '7.6'], 'diff-eq-solve', difference + '求完全响应，并分出暂态与稳态响应。', r`$$y(k)=[-\frac{55}4(1/2)^k+\frac{97}{24}(1/4)^k+\frac{40}3]u(k).$$

暂态为两个指数项；稳态为 $\frac{40}3u(k)$。所示式子只表示 $k\ge0$ 的响应。`, r`零输入与零状态对应项相加：$9/4-16=-55/4$，$-5/8+14/3=97/24$。两指数趋于零，常数为稳态。也可把稳态常数 c 代回方程：$(1-3/4+1/8)c=2+3$，得 $c=40/3$。全响应初项为 $y(0)=29/8$。`, { verified: 'corrected', note: '资料第 9 页全响应式的常数 40/3 是正确的，但后面的稳态文字误写为 40u(k)，漏了除以 3。' + sharedScore }),
  p('三1(5)', ['7.7'], 'discrete-diagram', difference + '判断系统是否 BIBO 稳定。', '稳定。', r`因果极点为 $1/2,1/4$，都严格位于单位圆内；ROC 为 $|z|>1/2$，包含整个单位圆。冲激响应是两个绝对可和的衰减指数，非零初态不改变系统函数的 BIBO 稳定性。`, { note: sharedScore }),
  p('三2(B)', ['5.2', '3.5'], 'nyquist', sampler + '求 B 点的频谱并画图。', r`$F_B(j\omega)=100\pi\sum_{n=-\infty}^{\infty}\delta(\omega-100\pi n)$。

![B 点冲激频谱](figures/tk-exam-02/a3-2-b.svg)`, r`周期冲激列的傅里叶变换仍为冲激列，谱线间隔为 $\omega_s=2\pi/T=100\pi$，每根谱线的强度也是 $2\pi/T$。这里标的是冲激强度，并非普通函数的有限高度。`, spectral),
  p('三2(C)', ['5.2', '3.4'], 'nyquist', sampler + '求 C 点的频谱并画图。', r`$F_C(j\omega)=50\sum_{n=-\infty}^{\infty}F_A(j(\omega-100\pi n))$。各副本中心为 $100\pi n$，半宽 $20\pi$，峰高 5。

![C 点抽样复制频谱](figures/tk-exam-02/a3-2-c.svg)`, r`时域相乘对应频域卷积并乘 $1/(2\pi)$，因此 $F_C=F_A*F_B/(2\pi)$。代入 B 的冲激强度 $100\pi$ 得比例 50；不能把时域抽样频率 50 Hz 与角频谱间隔 $100\pi$ 混用。`, spectral),
  p('三2(D)', ['3.7', '3.9', '5.2'], 'filter-output', sampler + '求 D 点的频谱并画图。', r`$F_D=F_CH_1$；仅保留 $100\pi<\omega<120\pi$ 的 $50F_A(j(\omega-100\pi))$ 和 $-120\pi<\omega<-100\pi$ 的 $50F_A(j(\omega+100\pi))$。

![D 点只保留两侧半谱](figures/tk-exam-02/a3-2-d.svg)`, r`正频带恰好截取中心在 $100\pi$ 的三角副本右半边，由峰 5 降到 0；负频带截取中心在 $-100\pi$ 的副本左半边，由 0 升到 5。基带及每个副本朝原点的半边都被滤除。`, spectral),
  p('三2(E)', ['3.6', '3.4'], 'filter-output', sampler + '求 E 点的频谱并画图。', r`$F_E(j\omega)=\frac12[F_D(j(\omega+100\pi))+F_D(j(\omega-100\pi))]$。

基带 $|\omega|<20\pi$ 为 $25F_A$；另保留 $-220\pi<\omega<-200\pi$ 和 $200\pi<\omega<220\pi$ 的两个半三角谱。各峰高均为 $5/2$。

![E 点移频后的基带和高频半谱](figures/tk-exam-02/a3-2-e.svg)`, r`余弦调制把 D 向两侧各移 $100\pi$，并各乘 1/2。原正半谱下移到正基带，原负半谱上移到负基带，拼成完整基带三角；另两份移到 $\pm200\pi$ 外侧。基带不能再多乘 2，因为每个非零基带频率只来自一个半谱。`, spectral),
  p('三2(F)', ['3.9', '3.6', '5.2'], 'filter-output', sampler + '求 F 点输出频谱并画图；给出 y(t)。', r`$F_F(j\omega)=Y(j\omega)=25F_A(j\omega)$。峰高为 $5/2$，支撑为 $|\omega|<20\pi$。

$f(t)=\mathrm{Sa}^2(10\pi t)$，故 $y(t)=25\mathrm{Sa}^2(10\pi t)$。

![F 点恢复的基带频谱](figures/tk-exam-02/a3-2-f.svg)`, r`H₂ 只保留 E 的完整基带三角，滤掉 $\pm200\pi$ 附近的两侧半谱。由三角谱逆变换，峰高 1/10、半宽 $20\pi$ 对应 $\mathrm{Sa}^2(10\pi t)$；输出频谱在全部有效频率上是输入的 25 倍，时域也按同一比例缩放。`, spectral),
];

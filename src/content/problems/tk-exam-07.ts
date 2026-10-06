import type { Problem } from '../../types';
import { problem as make } from './helper';
const paper = 'tk-exam-07'; // 顺序第七套，原文件没有印课程编号。
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make(paper, ...args);
const r = String.raw;
const score = (no: string, value: number): Partial<Problem> => ({ sources: [{ paper, no, score: value }] });
const fill = (no: string): Partial<Problem> => ({ ...score(no, 3), type: '填空' });
const pic = (no: string) => ({ figures: ['figures/tk-exam-07/q' + no + '.png'] });
const calcSplit = '原卷本计算题共 10 分，没有小问分值；拆问不擅自平分。';
const joint = '原卷本综合题共 10 分，没有小问分值；各作答单元不虚分分数。';
const wave = r`图 A-3 的 x(t) 在 −1<t<1 为 $1+|t|$，其余为 0；令 $f(t)=x(1-2t)$，FT 为 F(jω)。端点单点值不改变积分。 `;
const lpf = r`图 A-4：输入 f(t) 与延时 T 秒的支路相加，再通过 $H_1(j\omega)=G_{2\omega_c}(\omega)e^{-j\omega t_0}$ 的理想低通，$T>0,\omega_c>0$，门频谱在 $|\omega|<\omega_c$ 为 1；输入 $f(t)=\operatorname{Sa}(t)=\sin t/t$。`;
const train = r`LTI 系统 $H(j\omega)=e^{-j(3/2)\omega}$（$|\omega|<2\pi$），带外为 0。输入周期 $T_0=4/3$ 的单位冲激串 $f(t)=\sum_n\delta(t-nT_0)$。`;
const diagram = r`图 A-5 的因果离散 LTI 系统：加法器输出 w(k)，两延时器依次输出 $x_2(k)=w(k-1)$、$x_1(k)=w(k-2)$。反馈为 +3x₂、−2x₁，输出为 w+4x₂。输入 $f(k)=4^ku(k)$，$y(-1)=-1,y(-2)=2$。`;
const zsNote = '第 35 页零状态部分分式和最终式错误：原解首样本为 −7，零初态下原方程要求 y_zs(0)=1。按原图输入支路与极点独立展开得到这里的 5/3、−6、16/3。' + joint;

export const tkExam07: Problem[] = [
  p('一(1)', ['1.8'], 'sys-prop', r`零状态输入输出关系 $y(t)=2f(t)-1$，判断线性、时不变性与 BIBO 稳定性。`, '非线性、时不变、稳定。', r`零输入仍输出 −1，违反线性；常数偏置与输入一起延时后关系不变，所以时不变。若 |f|≤M，则 |y|≤2M+1，有界输入保持有界。`, fill('一(1)')),
  p('一(2)', ['1.4'], 'delta-sift', r`化简 $\delta(t)\cos(2t)$。`, r`$\delta(t)$。`, r`用分布筛选性质 $g(t)\delta(t)=g(0)\delta(t)$；cos0=1，不把冲激误作普通函数逐点相乘。`, fill('一(2)')),
  p('一(3)', ['6.1', '6.2'], 'conv-sum', r`h(0..2)={1,−1,2}，f(−1..2)={1,2,−2,1}，其他下标为 0。求零状态输出 y=f*h。原题箭头分别在 h 的第一项和 f 的第二项。`, r`y(−1..4)={1,1,−2,7,−5,2}，零下标在第二项，其余为 0。`, r`逐项计算 y(k)=f(k)−f(k−1)+2f(k−2)。例如 y(1)=−2−2+2=−2；起点为 −1，长度 4+3−1=6。总和为 4，与两序列总和 2×2 相等。`, { ...fill('一(3)'), verified: 'corrected', note: '第 28 页参考解把第三项写成 +2，漏负号。原题 f 的第三项确为 −2，独立卷积和 z 多项式相乘都得到 −2；零下标箭头保留在第二项。' }),
  p('一(4)', ['3.2'], 'ft-basic', r`周期 $T_0=2\pi$，所列指数傅里叶级数系数为 $F_0=1,F_1=0.5e^{j\pi},F_{-1}=0.5e^{-j\pi},F_3=-0.2j,F_{-3}=0.2j$。按这些谐波写出 f(t)。`, r`$f(t)=1-\cos t+0.4\sin3t$。`, r`基频为 1 rad/s。±1 两项合成 cos(t+π)=−cos t；±3 的虚系数成对合成 0.4sin3t，直流为 1。`, fill('一(4)')),
  p('一(5)', ['3.3', '3.4'], 'ft-basic', r`求 $f(t)=e^{-2t}\cos(100t)u(t)$ 的 F(jω)。`, r`$F(j\omega)=\frac{2+j\omega}{10004-\omega^2+4j\omega}$。`, r`把余弦分成两指数并作衰减积分，得 $\frac12[1/(2+j(\omega-100))+1/(2+j(\omega+100))]$；合并分母 $(2+j\omega)^2+10000$ 得结果。`, fill('一(5)')),
  p('一(6)', ['3.3', '7.5'], 'concept', '从频谱性质说明连续时间与离散时间信号的一个重要区别。', '离散序列的 DTFT 关于数字角频率 Ω 具有 2π 周期性；连续信号的 FT 一般没有此周期性。', r`离散求和的每一项含 $e^{-j\Omega k}$，Ω 增加 2π 时因整数 k 有 $e^{-j2\pi k}=1$。连续变换对实数 t 积分，不具这个恒等关系。这里说的是频率轴上的周期性，不把它与时域是否周期混淆。`, fill('一(6)')),
  p('一(7)', ['3.4'], 'ft-property', r`若 $f(t)\leftrightarrow F(j\omega)$，把频谱表达式中的 ω 换成 t，求 F(jt) 的傅里叶变换。`, r`$F(jt)\leftrightarrow2\pi f(-\omega)$。`, r`由反演式交换时间与频率角色，对偶引入 2π 与反号。例：$e^{-|t|}\leftrightarrow2/(1+\omega^2)$，故 $2/(1+t^2)\leftrightarrow2\pi e^{-|\omega|}$。`, fill('一(7)')),
  p('一(8)', ['3.3', '3.4'], 'ft-property', r`单位门信号 Gτ(t) 的宽度 τ 增大时，其频谱宽度如何变化？按主瓣零点间宽度回答。`, '主瓣变窄，零点间宽度为 4π/τ。', r`门函数 FT 为 $\tau\operatorname{Sa}(\omega\tau/2)$，第一零点 ±2π/τ。矩形时域信号并非严格带限，“频谱宽度”在此采用课程通常的主瓣口径。`, fill('一(8)')),
  p('一(9)', ['4.1', '4.4', '3.3'], 'ft-exist-from-Hs', '说明拉普拉斯变换与傅里叶变换的联系，并评价“只有绝对可积信号才存在傅里叶变换”的说法。', r`双边 LT 是 $f(t)e^{-\sigma t}$ 的 FT（s=σ+jω）。虚轴位于 LT 的实际 ROC 内时，$F(j\omega)=F(s)|_{s=j\omega}$。绝对可积是普通 FT 收敛的充分条件，不能说成必要条件。`, r`增长信号 $e^tu(t)$ 在 Re s>1 有 LT，普通 FT 不收敛。反例 Sa(t) 不绝对可积，却在 |ω|≠1 具有通常的条件收敛矩形谱，边缘按对称极限；周期信号还可另用广义 FT。普通、绝对收敛与广义变换须区分。`, { ...fill('一(9)'), verified: 'corrected', note: '第 29 页参考解称“满足绝对可积条件时才存在傅里叶变换”，把充分条件当成必要条件。给出 Sa 的条件收敛反例，并保留指数加权和实际 ROC 的正确联系。' }),
  p('一(10)', ['3.3', '3.4'], 'ft-property', r`计算通常的反常积分 $\int_{-\infty}^{\infty}\frac{\sin\omega}{\omega}d\omega$，原点取连续极限。`, r`$\pi$。`, r`被积函数为偶函数，两半轴的 Dirichlet 积分各为 π/2。可先加指数衰减，再令衰减趋零；此例两侧分别条件收敛，与后面跳变波形的频谱积分不同。`, fill('一(10)')),
  p('二(1)', ['4.3', '4.2'], 'laplace-calc', r`$F(s)=1/[s(1-e^{-2s})]$，ROC 为 Re s>0。求拉氏逆变换并画波形。`, r`$f(t)=\sum_{n=0}^{\infty}u(t-2n)$。负时间为 0；0<t<2 为1，2<t<4 为2，依此递增。

![每两秒增加一级的阶梯](figures/tk-exam-07/a2-1.svg)`, r`在给定 ROC 内可展开 $1/(1-e^{-2s})=\sum_{n\ge0}e^{-2ns}$，各项除 s 对应延时阶跃。也可按每段台阶作 LT 积分回算。跳点按右连续画图，具体单点取值不影响 LT，反演的对称值取左右平均。`, { ...score('二(1)', 10), type: '画图' }),
  p('二2(1)', ['3.3', '3.7'], 'filter-output', r`图 A-1 的实偶频率响应在 2<|ω|<4 为 $(4-|\omega|)/2$，其余为 0。求 h(t)。`, r`$h(t)=\frac{\cos2t-\cos4t}{2\pi t^2}-\frac{\sin2t}{\pi t}$，原点延拓 $h(0)=1/\pi$。`, r`由偶谱 $h=(1/\pi)\int_2^4(4-\omega)\cos\omega t/2\,d\omega$ 直接积分。等价写法为 $[\operatorname{Sa}(t)\sin3t-\sin2t]/(\pi t)$。不能把两个斜边补成完整三角带通谱。`, { ...pic('2-2'), note: calcSplit }),
  p('二2(2)', ['3.7', '3.9'], 'sine-steady', r`图 A-1：H 在 2<|ω|<4 为 $(4-|\omega|)/2$，其余为 0。输入 $f(t)=1+0.6\cos t+0.4\cos3t+0.2\cos5t$（全时域），求输出。`, r`$y(t)=0.2\cos3t$。`, r`H(0)=H(1)=H(5)=0，只有角频率 3 位于通带；H(3)=1/2、相位0，故幅度0.4减半。没有输入频率落在谱跳点2或4，边缘单点约定不影响本题。`, { ...pic('2-2'), note: calcSplit }),
  p('二(3)', ['6.2', '7.7'], 'discrete-diagram', r`图 A-2 中 $h_1(k)=u(k-1)$ 与直通支路并联，再串联 $h_2(k)=(1/2)^ku(k)$。求系统单位样值响应 h(k)。`, r`$h(k)=[2-(1/2)^k]u(k)$。`, r`总核 $(h_1+\delta)*h_2$。k≥1 时卷积和为 $\sum_{n=0}^{k-1}(1/2)^n=2-2(1/2)^k$，再加 h₂；k=0 仅直通串联项为1，统一成所示结果。尾部趋2，此系统不稳定。`, { ...score('二(3)', 10), ...pic('2-3') }),
  p('二4(1)', ['1.5', '3.4'], 'waveform', wave + '画出 f(t)。', r`$f(t)=2-2t$（0<t<1/2），$f(t)=2t$（1/2<t<1），其余为0。两端内侧高2，谷底在 t=1/2、高1。

![反转压缩后的波形](figures/tk-exam-07/a2-4.svg)`, r`由 −1<1−2t<1 得支撑0..1；原节点 τ=1、0、−1 分别映到 t=0、1/2、1。谱可写为 $[2\operatorname{Sa}(\omega/2)-\frac12\operatorname{Sa}^2(\omega/4)]e^{-j\omega/2}$，供其他积分回查。`, { ...pic('2-4'), type: '画图', note: calcSplit }),
  p('二4(2)', ['3.4'], 'ft-property', wave + '计算 F(j0)。', r`$F(j0)=3/2$。`, r`零频谱为时域面积。$\int_0^{1/2}(2-2t)dt+\int_{1/2}^12t\,dt=3/2$；与变换表达式在ω=0的可去极限一致。`, { ...pic('2-4'), note: calcSplit }),
  p('二4(3)', ['3.4'], 'ft-property', wave + r`计算 $\int_{-\infty}^{\infty}F(j\omega)d\omega$，说明收敛口径。`, r`按对称截断的 Cauchy 主值为 $2\pi$。如果两端分别取普通反常积分，则不收敛。`, r`f在原点跳变，左极限0、右极限2。傅里叶反演的对称值为 $(0+2)/2=1$，所以主值是2π。谱尾部虚部含 $-2(1-\cos\omega)/\omega$，正半轴积分出现 −2lnR 的发散项，不能略去“对称截断”条件。`, { ...pic('2-4'), verified: 'corrected', note: '第 32 页参考解直接取 f(0)=2 得4π，忽略原点跳变。单点赋值不改变F；对称频域积分应使用左右平均得到2π，而且两侧分别积分不收敛。' + calcSplit }),
  p('二4(4)', ['3.4'], 'ft-property', wave + r`计算 $\int_{-\infty}^{\infty}|F(j\omega)|^2d\omega$。`, r`$14\pi/3$。`, r`Parseval给频域能量为时域能量的2π倍。两半波形对称，$\int|f|^2=2\int_0^{1/2}4(1-t)^2dt=7/3$，所以结果14π/3。这里频谱平方绝对可积，不需要主值。`, { ...pic('2-4'), note: calcSplit }),
  p('二4(5)', ['3.4', '2.4'], 'ft-property', wave + r`计算 $\int_{-\infty}^{\infty}F(j\omega)\frac{2\sin\omega}{\omega}e^{j\omega/2}d\omega$。`, r`$3\pi$。`, r`第二因子是 g(t)=G₂(t+1/2) 的 FT。乘谱积分为 $2\pi(f*g)(0)=2\pi\int_{-1/2}^{3/2}f(\tau)d\tau$；窗口包含f的全部支撑，面积3/2，得3π。两因子使尾部为O(1/ω²)，此积分收敛。`, { ...pic('2-4'), note: calcSplit }),
  p('二5(1)', ['3.7', '3.9', '2.4'], 'filter-output', lpf + '求系统 h(t)。', r`$h(t)=\frac{\omega_c}{\pi}\{\operatorname{Sa}[\omega_c(t-t_0)]+\operatorname{Sa}[\omega_c(t-t_0-T)]\}$。`, r`并联核为δ(t)+δ(t−T)，再与理想低通核卷积，所以得到两份延时核之和。T是附加延时，t₀是滤波器相位延时，不能混为同一参数。`, { ...pic('2-5'), note: calcSplit }),
  p('二5(2)', ['3.7', '3.9'], 'filter-output', lpf + '在 ωc≥1 时求零状态输出。', r`$y(t)=\operatorname{Sa}(t-t_0)+\operatorname{Sa}(t-t_0-T)$。`, r`Sa输入的谱为πG₂(ω)，支撑在|ω|≤1；低通未截去普通频谱，因此只保留并联形成的两份延时。ωc=1的端点单点值不影响本题普通连续频谱的逆变换。`, { ...pic('2-5'), note: calcSplit }),
  p('二5(3)', ['3.7', '3.9'], 'filter-output', lpf + '在 0<ωc≤1 时求零状态输出。', r`$y(t)=\omega_c\{\operatorname{Sa}[\omega_c(t-t_0)]+\operatorname{Sa}[\omega_c(t-t_0-T)]\}$。`, r`πG₂与G₂ωc相乘后变成πG₂ωc，其逆变换为ωcSa(ωct)，再应用两支路的延时。注意系数为ωc，不能漏掉频宽缩小时的幅度变化；ωc=1与上一问相同。`, { ...pic('2-5'), note: calcSplit }),
  p('三1(1)', ['3.2', '3.5'], 'ft-basic', train + '求指数傅里叶级数系数 Fₙ。', r`$F_n=3/4$（所有整数n），$\omega_0=3\pi/2$。`, r`一个周期内只有t=0的单位冲激，系数积分为1/T₀=3/4，冲激点的指数值为1。这是分布意义的周期级数，不能把无限谐波忽略。`, { note: joint }),
  p('三1(2)', ['3.5'], 'ft-property', train + '求输入频谱 F(jω)。', r`$F(j\omega)=\frac{3\pi}{2}\sum_n\delta(\omega-\frac{3\pi n}{2})$。`, r`各级数系数乘2π作为冲激线强度，线间隔为ω₀=3π/2。强度和位置虽都有3π/2，含义不同。`, { note: joint }),
  p('三1(3)', ['3.5', '3.7'], 'filter-output', train + '求输出 y(t)。', r`$y(t)=\frac34+\frac32\cos[\frac{3\pi}{2}(t-\frac32)]$，等价于 $\frac34+\frac{3\sqrt2}{4}[\cos(\frac{3\pi t}{2})+\sin(\frac{3\pi t}{2})]$。`, r`|nω₀|<2π仅保留n=−1,0,1。两条非零谐波受延时3/2产生相位∓9π/4，模2π为∓π/4；每条系数3/4，成对合成的幅度3/2。没有谱线落在截止端点。`, { verified: 'corrected', note: '第 34 页中间频谱一行误把 ±3π/2 写成 ±π/2，后面的最终时域答案恢复正确。这里从T₀逐条确定谱线，保留正确的频率与延时相位。' + joint }),
  p('三2(1)', ['6.4', '7.7'], 'discrete-diagram', diagram + '写出输入输出差分方程。', r`$y(k)-3y(k-1)+2y(k-2)=f(k)+4f(k-1)$。`, r`内部递推w−3w[-1]+2w[-2]=f，输出y=w+4w[-1]，消去w。零状态H=(1+4z⁻¹)/(1−3z⁻¹+2z⁻²)，交叉相乘即得原方程。`, { ...pic('3-2'), note: joint }),
  p('三2(2a)', ['6.4', '7.6'], 'diff-eq-solve', diagram + '求零输入响应。', r`$y_{zi}(k)=(5-12\cdot2^k)u(k)$（表示k≥0部分）。`, r`单边变换的初态分子为3y(−1)−2y(−2)−2z⁻¹y(−1)=−7+2z⁻¹。分成5/(1−z⁻¹)−12/(1−2z⁻¹)。其首项−7满足原初态的齐次递推。`, { ...pic('3-2'), note: joint }),
  p('三2(2b)', ['6.4', '7.6'], 'diff-eq-solve', diagram + '求零状态响应。', r`$y_{zs}(k)=[\frac53-6\cdot2^k+\frac{16}{3}4^k]u(k)$。`, r`$Y_{zs}=(1+4q)/[(1-q)(1-2q)(1-4q)]$，q=z⁻¹。按三个极点展开的系数为5/3、−6、16/3。首项1；次项11，满足 y_zs(1)−3y_zs(0)=4+4=8，逐样本代原输入与延时支路均相符。`, { ...pic('3-2'), verified: 'corrected', note: zsNote }),
  p('三2(2c)', ['6.4', '7.6'], 'diff-eq-solve', diagram + '求完全响应。', r`$y(k)=[\frac{20}{3}-18\cdot2^k+\frac{16}{3}4^k]u(k)$（表示k≥0部分）。`, r`零输入和零状态对应系数相加。首项−6，与原方程y(0)−3×(−1)+2×2=1吻合；不能把±2ᵏ项错误抵消。`, { ...pic('3-2'), verified: 'corrected', note: '第 35 页完全响应沿用了错误零状态，误抵消2ᵏ并得到10/3−(52/3)4ᵏ，首项−14不满足题设。正确相加得到这里的三项。' + joint }),
  p('三2(3)', ['7.7', '7.2'], 'discrete-diagram', diagram + '求 H(z)、h(k)。', r`$H(z)=(1+4z^{-1})/(1-3z^{-1}+2z^{-2})$，因果ROC为|z|>2；$h(k)=(-5+6\cdot2^k)u(k)$。`, r`H=−5/(1−z⁻¹)+6/(1−2z⁻¹)。原点h(0)=1来自直通；实际极点1、2且没有抵消，因果ROC不包含单位圆，核也不绝对可和。H不含初态；与已有复习题23(2)完全相同，沿用旧题目编号。`, { ...pic('3-2'), note: joint }),
  p('三2(4)', ['8.1', '8.2', '7.7'], 'state-space', diagram + '写状态方程和输出方程。', r`$$
\begin{aligned}
x_1(k+1)&=x_2(k),\\
x_2(k+1)&=-2x_1(k)+3x_2(k)+f(k),\\
y(k)&=-2x_1(k)+7x_2(k)+f(k).
\end{aligned}
$$`, r`A=[[0,1],[−2,3]]，B=[0,1]ᵀ，C=[−2,7]，D=1。输出原为w+4x₂，代入w=x₂(k+1)=−2x₁+3x₂+f，得到所示C、D。回算C(zI−A)⁻¹B+D与H一致。`, { ...pic('3-2'), note: joint }),
];

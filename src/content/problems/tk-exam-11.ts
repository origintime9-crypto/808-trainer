import type { Problem } from '../../types';
import { problem as make } from './helper';
import { tkExam03 } from './tk-exam-03';
import { tkExam05 } from './tk-exam-05';
const paper = 'tk-exam-11';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make(paper, ...args);
const r = String.raw;
const score = (no: string, value: number): Partial<Problem> => ({ sources: [{ paper, no, score: value }] });
const fill = (no: string): Partial<Problem> => ({ ...score(no, 3), type: '填空' });
const calcSplit = '原卷本计算题共10分，未给各小问分值，拆问不擅自平分。';
const joint = '原卷本综合题共10分，未给各节点或各小问分值，作答单元不虚分。';
const ode = r`系统满足 $y''+2y'+y=f'$，$y(0^-)=1$、$y'(0^-)=2$，输入$f(t)=e^{-t}u(t)$。求t≥0的响应；乘u(t)仅表示正时间部分，不替代所给左初态。`;
const discrete = r`$y[k]-5y[k-1]+6y[k-2]=f[k-1]$，k≥0；$f[k]=2^ku[k]$，y[−1]=y[−2]=1。`;
const zp = r`图A-1的连续LTI系统因果、稳定，零点+2，极点−4、−1±2j。输入x(t)=|cos t|时，输出直流分量为5/π。`;
const templates = [...tkExam03, ...tkExam05];
function same(no: string, id: string, note: string): Problem {
  const old = templates.find(item => item.id === id);
  if (!old || !old.pattern) throw new Error('同题模板不存在：' + id);
  return p(no, [...old.kps], old.pattern, old.stem, old.answer, old.solution, {
    type: old.type, verified: old.verified, figures: old.figures, note: note+joint,
  });
}

export const tkExam11: Problem[] = [
  p('一(1)', ['1.5'], 'waveform', r`f(t)时移后变为f(t−t₀)。当t₀<0时，相对原信号向哪边移动？`, '左移，移动量|t₀|。', '原节点t=a在新图中满足t−t₀=a，即新位置a+t₀。t₀<0使每个节点的位置减小。', fill('一(1)')),
  p('一(2)', ['3.5', '3.3', '7.5'], 'concept', '分别填出周期/非周期信号的通常频谱特点，以及离散/连续时间信号频谱的周期性；说明适用条件。', '周期信号通常为谐波线谱；可积非周期信号的普通FT为连续频谱。离散DTFT有2π周期，连续FT一般无这一固定周期。', r`周期性给nω₀处的离散谱线，普通可积非周期信号的FT连续；但非周期的cos t+cos(√2t)仍有广义线谱，不能把所有非周期信号都当作连续谱。离散求和核 $e^{-j\Omega k}$ 对Ω增加2π不变，连续积分核一般没有此性质。`, { ...fill('一(2)'), note: '第54页四空连问，保持为一个来源单元；与只问其中一组的已发布题范围不同，不删掉其他两个空。' }),
  p('一(3)', ['1.4'], 'delta-sift', r`计算 $\int_0^\infty4t^2\delta(t+1)dt$。`, '0。', '冲激位于t=−1，在积分域0..∞之外，因此没有贡献。不能先把t=−1代入4t²而忘记区间。', fill('一(3)')),
  p('一(4)', ['3.3', '1.4'], 'ft-basic', '求u(t)的傅里叶变换，说明变换的口径。', r`$U(j\omega)=\pi\delta(\omega)+\operatorname{PV}\frac1{j\omega}$，按广义FT。`, r`以e⁻ᵃᵗu(t)、a>0正则化，FT为1/(a+jω)。a→0⁺时实部a/(a²+ω²)形成面积π的δ，虚部趋于−PV(1/ω)。普通绝对收敛的积分不存在，不能漏直流冲激项。`, fill('一(4)')),
  p('一(5)', ['6.3', '1.8'], 'sys-prop', r`离散系统 $y[n]=\sum_{k=n-1}^{n+5}f[k]$。判断线性、时不变性、因果性、BIBO稳定性和记忆性。`, '线性、时不变、非因果、稳定、有记忆。', '写成y[n]=Σ(r=−1..5)f[n+r]，固定七项的和满足叠加和移位。含未来样本f[n+5]，所以非因果；访问当前以外的样本，有记忆。有界|f|≤M时|y|≤7M，所以BIBO稳定。', fill('一(5)')),
  p('一(6)', ['1.4', '1.5'], 'delta-sift', r`x在原点有明确连续值，填空 $\delta(t)x(2t)=\underline{\phantom{xxx}}\,\delta(t)$。`, r`$x(0)\delta(t)$。`, 'δ仍然是δ(t)，筛选的t=0使x(2t)=x(0)。尺度在被取样的x内，不在δ的自变量内，不能额外乘1/2。', { ...fill('一(6)'), note: '筛选按x在原点连续且乘积有定义解释；没有把原题δ(t)改成δ(2t)。' }),
  p('一(7)', ['3.4', '3.6'], 'ft-property', r`$f(t)\leftrightarrow F(j\omega)$。写出 $f^2(t)\sin(\omega_0t)$ 的FT表达式，采用各运算存在的条件。`, r`令 $Q(\omega)=(F*F)(\omega)$，则结果为 $[Q(\omega-\omega_0)-Q(\omega+\omega_0)]/(4\pi j)$。`, r`先用时域平方对应 $F*F/(2\pi)$；再将sinω₀t写成两个复指数之差除2j，分别平移到±ω₀，得到总系数1/(4πj)。不是频域逐点平方F²。`, fill('一(7)')),
  p('一(8)', ['5.2'], 'nyquist', '带限信号的最高频率为100 kHz，按低通抽样定理求临界抽样率，并说明可靠恢复的边缘条件。', '临界抽样率200 kHz，临界间隔5 μs；可靠无混叠通常取严格大于200 kHz。', r`频谱复制间隔至少为原频带宽度的两倍。若在100 kHz边缘有冲激谱线，临界抽样可丢失信息，例如该频率正弦在5 μs间隔的采样点全为0；普通连续密度只接触边界时可忽略单点。这里100 kHz是Hz，不是rad/s。`, fill('一(8)')),
  p('一(9)', ['2.4', '1.4'], 'conv-integral', r`对使积分有定义的f，填空 $\int_{-\infty}^t f(\tau)d\tau=f(t)*\underline{\phantom{xxx}}$。`, 'u(t)。', r`卷积 $\int_{-\infty}^{\infty}f(\tau)u(t-\tau)d\tau$ 只保留τ<t，等于累计积分；具体端点单点值不影响普通积分。`, fill('一(9)')),
  p('一(10)', ['2.3', '2.4'], 'conv-integral', r`题设LTI系统对u(t)的响应为 $g(t)=e^{-t}u(t)+u(-1-t)$。求输入u(t−1)−u(t−2)的响应；保留原给定g的解释与边界问题。`, r`按题设的移位叠加，$y(t)=e^{-(t-1)}u(t-1)-e^{-(t-2)}u(t-2)+u(-t)-u(1-t)$。

![矩形输入的移位叠加结果](figures/tk-exam-11/a1-10.svg)`, r`线性和时不变性给y=g(t−1)−g(t−2)。左向阶跃项在0<t<1为−1，不能遗漏；两段指数从1、2分别开始。原给定g的远负时间值为1，而通常卷积型阶跃响应应趋0；g的常数基线在这次两移位相减中抵消，保留形式叠加结果，不把g直接改成另一条曲线。`, { ...fill('一(10)'), verified: 'uncertain', note: '第55页确实写u(−1−t)。对g求导后所得δ(t)−e⁻ᵗu(t)−δ(t+1)，按通常卷积积分回阶跃得到g−1，无法直接还原原g。因此原式存在通常卷积实现的远端条件矛盾；本题所问的矩形输出仍由给定LTI叠加唯一得到。' }),
  p('二1(1a)', ['2.2', '4.5'], 'ode-s-solve', ode+'求零输入响应。', r`$y_{zi}(t)=(1+3t)e^{-t}u(t)$（正时间部分）。`, r`单边变换的初态项为 $(s+2)y(0^-)+y'(0^-)=s+4$，除以(s+1)²得到1/(s+1)+3/(s+1)²。右初值1、右导数2，不含输入所致跳变。`, { note: calcSplit }),
  p('二1(1b)', ['2.2', '4.5'], 'ode-s-solve', ode+'求零状态响应。', r`$y_{zs}(t)=(t-t^2/2)e^{-t}u(t)$。`, r`$H=s/(s+1)^2$、$F=1/(s+1)$，因此Ys=s/(s+1)³=1/(s+1)²−1/(s+1)³。右初值0、右导数1；f′含原点δ，不能把零状态右导数强设为0。`, { note: calcSplit }),
  p('二1(1c)', ['2.2', '4.5'], 'full-response-decomp', ode+'求完全响应，核对右初态。', r`$y(t)=(1+4t-t^2/2)e^{-t}u(t)$（正时间部分），y(0⁺)=1、y′(0⁺)=3。`, r`零输入与零状态相加。y在原点连续，f′中的δ使y′从给定左值2增加1到右值3。正时间代回y″+2y′+y=−e⁻ᵗ，原点导数跳变又匹配输入冲激。`, { note: calcSplit }),
  p('二1(2)', ['4.6', '2.3'], 'ode-s-solve', ode+'求H(s)及单位冲激响应h(t)。', r`$H(s)=s/(s+1)^2$，因果ROC为Re s>−1；$h(t)=(1-t)e^{-t}u(t)$。`, '零状态时把微分方程两边变换，Y/F=s/(s²+2s+1)。分解1/(s+1)−1/(s+1)²，反变换得到h；非零初态不进入系统函数。', { note: calcSplit }),
  p('二1(3)', ['4.4', '4.7'], 'ft-exist-from-Hs', ode+'求频率响应，判断BIBO稳定性。', r`$H(j\omega)=j\omega/(1+j\omega)^2$，稳定。`, r`因果实际极点−1（二重），ROC包含虚轴。h=(1−t)e⁻ᵗu，绝对积分按t=1两段计算为2/e<∞，可以给普通频率响应。重复极点在左半平面仍稳定。`, { note: calcSplit }),
  p('二2(1)', ['4.6', '3.2'], 'zp-h0', zp+'求H(s)，说明定标过程。', r`$H(s)=-25(s-2)/[(s+4)(s^2+2s+5)]$，因果ROC为Re s>−1。`, r`|cos t|的平均值为2/π，故H(0)=(5/π)/(2/π)=5/2。由原零极点图先写K(s−2)/[(s+4)(s²+2s+5)]，其DC为−K/10，得到K=−25；不能把正零点+2改成−2。`, { figures: ['figures/tk-exam-11/q2-2.png'], note: calcSplit }),
  p('二2(2)', ['3.7', '4.6'], 'sine-steady', zp+'输入为全时域x(t)=1，求零状态输出y(t)。', 'y(t)=5/2。', r`全时域常量只有DC，其零状态输出等于H(0)乘1。此输入没有u(t)，不能改成从t=0接通的阶跃；后者具有过渡过程。若另指定非零初态，应再加相应零输入部分，原题没有给出这类条件。`, { figures: ['figures/tk-exam-11/q2-2.png'], note: calcSplit }),
  p('二3(1a)', ['6.4', '7.6'], 'diff-eq-solve', discrete+'求零输入响应。', r`$y_{zi}[k]=(8\cdot2^k-9\cdot3^k)u[k]$（k≥0部分）。`, r`齐次根2、3。原初态递推得到zi[0]=−1、zi[1]=−11，求得系数8、−9；单边初态分子为−1−6z⁻¹，部分分式同样给8/(1−2z⁻¹)−9/(1−3z⁻¹)。`, { note: calcSplit }),
  p('二3(1b)', ['6.4', '7.6'], 'diff-eq-solve', discrete+'求零状态响应。', r`$y_{zs}[k]=[3\cdot3^k-(k+3)2^k]u[k]$。`, r`$H=z^{-1}/[(1-2z^{-1})(1-3z^{-1})]$，输入变换1/(1−2z⁻¹)再次引入极点2。部分分式3/(1−3q)−3/(1−2q)−2q/(1−2q)²，末项给−k2ᵏ。首样本0，次样本1；输入延时一拍不能忽略。`, { note: calcSplit }),
  p('二3(1c)', ['6.4', '7.6'], 'full-response-decomp', discrete+'求完全响应，核对首样本。', r`$y[k]=[(5-k)2^k-6\cdot3^k]u[k]$（k≥0部分），首三个样本为−1、−10、−42。`, '原初态只进入零输入部分，相加8·2ᵏ−9·3ᵏ与3·3ᵏ−(k+3)2ᵏ即可。k=0的右端f[−1]=0，y[0]=5·1−6·1=−1；继续递推与公式相符。', { note: calcSplit }),
  p('二3(2)', ['7.7', '7.2'], 'discrete-diagram', discrete+'求H(z)和单位样值响应，说明因果ROC与稳定性。', r`$H(z)=z/[(z-2)(z-3)]$，ROC为|z|>3；$h[k]=(3^k-2^k)u[k]$，不稳定。`, r`零状态差分式给(1−5q+6q²)Y=qF。H=z/(z−3)−z/(z−2)，h[0]=0、h[1]=1、h[2]=5，符合输入延时一拍。因果极点2、3在单位圆外，核增长且ROC不包含单位圆。`, { note: calcSplit }),
  p('二(4)', ['3.3', '4.4'], 'ft-basic', r`$f(t)=e^{-at}\sin(\omega_0t)u(t)$，a>0，求FT。`, r`$F(j\omega)=\omega_0/[(a+j\omega)^2+\omega_0^2]$。`, r`正时间指数衰减保证普通积分收敛。把正弦分成两指数，得到 $\frac1{2j}[1/(a+j(\omega-\omega_0))-1/(a+j(\omega+\omega_0))]$。ω₀=0时原信号为零，结果也为零。`, score('二(4)', 10)),
  p('二(5)', ['6.3', '7.7'], 'sys-prop', r`离散LTI系统 $h[k]=a^ku[k]$。判断因果性与BIBO稳定性，含a=0的情形。`, r`因果；BIBO稳定当且仅当|a|<1。a=0时h=δ[k]，也稳定。`, '负时刻h为0，所以因果。稳定要求Σ|h[k]|=Σ|a|ᵏ收敛，等价于公比模小于1；|a|=1的尾部不衰减。a=0时首样本为1而其余为0，不把0⁰写成0。', score('二(5)', 10)),
  same('三1(1)', 'tk-exam-05-32-1', '第55–56页高通A-2与课程05三2同条件，截止80π、原图相位−2ω，仍取延时2；单位冲激响应合并旧编号。'),
  same('三1(2)', 'tk-exam-05-32-2', '第56页高通及输入1+0.5cos60πt+0.2cos120πt与课程05三2完全同题，输出0.2cos120πt；这里不加入原题未写的u(t)。'),
  same('三2(A)', 'tk-exam-03-32-A', '第56页图A-3与课程03三2同题：F峰高2、支撑±10，A为cos100t，使用rad/s；合并A点来源。'),
  same('三2(B)', 'tk-exam-03-32-B', '第56页两次cos100t、80<|ω|<100侧带及低通±15与课程03同条件；B为两侧完整三角副本，峰高1，合并来源。'),
  same('三2(C)', 'tk-exam-03-32-C', '第56页H₁只保留朝原点的半谱，支撑−100..−90及90..100，不能保留完整的±100三角谱；同课程03的C点。'),
  same('三2(D)', 'tk-exam-03-32-D', '第56页第二次调制后基带峰高1/2，另含±200处半谱，各副本再次乘1/2；与课程03的D点同题合并。'),
  same('三2(E)', 'tk-exam-03-32-E', '第56页E点及y与f的关系同课程03：完整基带谱缩为1/4，y=f/4；E点和输出关系在原题同问，保持原作答分组。'),
];

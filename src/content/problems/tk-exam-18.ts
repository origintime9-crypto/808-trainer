import type { Problem } from '../../types';
import { problem as make } from './helper';
import { tkExam05 } from './tk-exam-05';
import { tkExam07 } from './tk-exam-07';
import { tkExam08 } from './tk-exam-08';
import { tkExam11 } from './tk-exam-11';
import { tkExam12 } from './tk-exam-12';
import { tkExam13 } from './tk-exam-13';
const paper = 'tk-exam-18';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make(paper, ...args);
const r = String.raw;
const score = (no: string, value: number): Partial<Problem> => ({ sources: [{ paper, no, score: value }] });
const fill = (no: string): Partial<Problem> => ({ ...score(no, 3), type: '填空' });
const pic = (no: string) => ({ figures: ['figures/tk-exam-18/q'+no+'.png'] });
const calcSplit = '原卷本计算题共10分，未给小问分值，拆问不擅自平分。本卷未附参考解。';
const joint = '原卷本综合题共10分，未给小问分值，各作答单元不虚分。本卷未附参考解。';
const original = [...tkExam05, ...tkExam07, ...tkExam08, ...tkExam11, ...tkExam12, ...tkExam13];
function same(no: string, id: string, note: string, extra: Partial<Problem> = {}): Problem {
  const old = original.find(item => item.id === id);
  if (!old?.pattern) throw new Error('同题模板不存在：'+id);
  return p(no, [...old.kps], old.pattern, old.stem, old.answer, old.solution, {
    type: old.type, figures: old.figures, verified: old.verified, ...extra, note,
  });
}
const squaredSinc = r`连续信号$f(t)=[\sin(t/2)/(\pi t)]^2\cos t$，t=0取连续极限。`;
const modulation = r`实值周期载波$c(t)=\sum_{k=-\infty}^{\infty}a_ke^{jk\omega_0t}$，$a_0=0,a_1\ne0$；$F(\omega)=0$（$|\omega|\ge\omega_0/2$），调制输出$y(t)=f(t)c(t)$。`;
const discrete = '图A-3为因果离散LTI系统；D表示一拍延时。第一延时反馈+1，第二延时反馈−0.24；输出上支路+1、中间0.5支路在加法器处取负、第二延时直接支路+1。';
const stateGraph = '图A-4为离散LTI信号流图，输入f[k]、输出y[k]。三个状态x₁、x₂、x₃取原图三个延时器的输出；上支路输入增益2、反馈+1，下支路输入增益1、反馈+2与−5。';

export const tkExam18: Problem[] = [
  same('一(1)', 'tk-exam-12-1-1', '第69页3cos(4t+π/3)的周期，与课程12一1完全同题，合并旧编号，保留本卷3分。', fill('一(1)')),
  same('一(2)', 'tk-exam-12-1-2', '第69页sin t·δ′(t)，与课程12一2完全同题，合并旧编号，保留本卷3分。', fill('一(2)')),
  same('一(3)', 'tk-exam-12-1-5', '第69页y=f*h求y(2t)，与课程12一5完全同题，保留卷积尺度系数2及本卷3分。', fill('一(3)')),
  same('一(4)', 'tk-exam-11-1-10', '第69页仍写g=e⁻ᵗu(t)+u(−1−t)，输入u(t−1)−u(t−2)，与课程11一10完全同题。保留远负时间基线条件说明，本卷没有参考解；合并旧编号和3分来源。', fill('一(4)')),
  same('一(5)', 'tk-exam-05-1-8', '第69页f²的最高角频率，与课程05一8同题，合并旧编号及3分。仍按频带上界口径说明2ωₛ；旧变量勘误只指第19页参考解，本卷未附解。', fill('一(5)')),
  same('一(6)', 'tk-exam-05-1-9', '第69页(1/4)ᵏu[k]阶跃响应，与课程05一9完全同题，合并旧编号及3分。原文“连续时不变…离散时间系统”混写，按k及阶跃序列解释为离散LTI。', fill('一(6)')),
  same('一(7)', 'tk-exam-05-1-10', '第69页sin t[u(t)+u(t−π/2)]的导数，与课程05一10完全同题，合并旧编号及3分。两阶跃间仍是加号；旧导数勘误仅属于第19页参考解，本卷没有附解。', fill('一(7)')),
  p('一(8)', ['5.2'], 'nyquist', '带限信号f(t)的截止频率为10 kHz，按低通时域抽样定理求至少应有的抽样频率并说明理由。', '奈奎斯特临界抽样率20 kHz，临界间隔50 μs；一般可靠恢复取抽样率严格大于20 kHz。', r`最高频率为B=10 kHz，采样的谱副本间隔fₛ应至少为2B，得到20 kHz。原给定单位是Hz，不能再除2π。若边缘有10 kHz的正弦谱线，恰以20 kHz采样时可能全部采到零；普通谱密度只在端点接触时单点不影响恢复。原题“至少”填写临界值，并注明等号的边缘条件。`, fill('一(8)')),
  p('一(9)', ['4.1', '4.4', '3.3'], 'concept', '说明拉普拉斯变换与傅里叶变换的基本差异及关系，区分单边和双边定义。', r`双边LT沿复频率$s=\sigma+j\omega$积分，FT通常沿虚轴；$\mathcal L_b\{f\}(\sigma+j\omega)=\mathcal F\{e^{-\sigma t}f(t)\}(\omega)$。若ROC包含虚轴，可令σ=0取普通FT。`, r`双边LT以e⁻σᵗ加权后再作FT，因此还有实部σ和ROC；普通FT直接用e⁻ʲωᵗ积分。只有在相应收敛条件下才能直接取s=jω；单边LT只积分t≥0，不能对一般双边信号直接当作完整FT。u(t)等还可以有广义FT，不能把“ROC含虚轴”误说成所有广义FT存在的必要条件。`, fill('一(9)')),
  same('一(10)', 'tk-exam-07-1-10', '第69页未平方的sinω/ω反常积分，与第7套一10完全同题，合并旧编号及3分。不能因为结果同为π就与课程05的平方能量积分合并；本卷没有参考解。', fill('一(10)')),
  p('二(1)', ['3.3', '3.4'], 'ft-property', r`图A-1：F(ω)=1（|ω|<1 rad/s），带外为0。计算$\int_{-\infty}^{\infty}|df(t)/dt|^2dt$。`, r`$1/(3\pi)$。`, r`时域微分对应jωF。Parseval给(1/2π)∫|jωF|²dω=(1/2π)∫₋₁¹ω²dω=1/(3π)。原图谱高为1，不能沿用sin t/t对应的π高矩形；逆FT为sin t/(πt)，在t=0取1/π。频谱端点的单点值不影响能量积分。`, { ...score('二(1)', 10), ...pic('2-1') }),
  same('二(2)', 'tk-exam-08-2-1', '第69页A-2的正负矩形f与左侧高度2矩形h，以及求卷积和画图要求，与课程08二1的A-1完全同题，合并旧编号，沿用原波形与答案图，保留本卷10分来源。', score('二(2)', 10)),
  p('二3(1)', ['3.3', '3.4', '3.6'], 'ft-property', squaredSinc+'求F(ω)并画出频谱。', r`令Λ(v)=max(1−|v|,0)，$F(\omega)=[\Lambda(\omega-1)+\Lambda(\omega+1)]/(4\pi)$。两三角峰在±1，高1/(4π)，支撑−2<ω<2，F(0)=0。

![平方sinc调制后的两个三角频谱](figures/tk-exam-18/a2-3.svg)`, r`sin(t/2)/(πt)对应高1、范围|ω|<1/2的矩形。平方使两矩形在频域卷积再除2π，得到Λ(ω)/(2π)；cos t调制再把它向±1各移一次并各乘1/2，故峰高1/(4π)。先平方后调制，不能把原矩形直接平移，也不能漏掉两次因子。两个三角总面积1/(2π)，等于2πf(0)，而f(0)=1/(4π²)，可回查归一化。`, { type: '画图', note: calcSplit }),
  p('二3(2)', ['5.2', '3.4'], 'nyquist', squaredSinc+r`冲激串抽样$f_p(t)=\sum_nf(nT)\delta(t-nT)$。为能完全恢复f(t)，求最大抽样间隔T。`, r`$T_{\max}=\pi/2$ s，临界角抽样频率4 rad/s（抽样率2/π Hz）。`, r`原谱支撑到|ω|=2，两三角在边缘±2恰为零。低通抽样要求2π/T≥2×2，故T≤π/2。这里只有普通三角密度，临界复制谱在零边界相接可恢复；不能把相邻两个三角峰的距离2误当作两倍最高频率，也不能对rad/s直接套Hz的1/(2B)。恢复滤波器的通带增益应补偿冲激串抽样产生的1/T。`, { note: calcSplit }),
  p('二4(1)', ['3.6', '3.9', '3.4'], 'filter-output', modulation+r`设计理想带通的通带和通带增益，使输出$g(t)=(a_1e^{j\omega_0t}+a_1^*e^{-j\omega_0t})f(t)$。`, r`可取$H(\omega)=1$（$\omega_0/2<|\omega|<3\omega_0/2$），其余0。

![带通保留正负一次谐波边带，通带增益1](figures/tk-exam-18/a2-4.svg)`, r`调制谱是ΣaₖF(ω−kω₀)。每次谐波的边带宽ω₀、中心kω₀；目标要保留k=±1，所以通过(ω₀/2,3ω₀/2)及其负频镜像即可。其他谐波只在边缘相接，而题设F在边缘也为0。目标已经包含a₁、a₁*，通带增益用1；不是恢复基带f，不能再除2|a₁|。端点取零符合题设的零边界。`, { type: '画图', note: calcSplit }),
  p('二4(2)', ['3.2', '3.6'], 'filter-output', modulation+r`若$g(t)=(a_1e^{j\omega_0t}+a_1^*e^{-j\omega_0t})f(t)$，证明$g(t)=Af(t)\cos(\omega_0t+\phi)$，用|a₁|及∠a₁表示A、φ。`, r`$A=2|a_1|$，$\phi=\arg a_1$（模2π）。`, r`实载波给a₋₁=a₁*。令a₁=|a₁|eʲφ，两个共轭指数相加即2|a₁|cos(ω₀t+φ)，再乘f。a₁≠0保证相位有定义；复系数模只有余弦实幅度的一半，不能填A=|a₁|。f自身不必为实，使用实性的是载波系数关系。`, { note: calcSplit }),
  same('二5(1)', 'tk-exam-13-25-1', '第70页y″+3y′+2y=f′+2f及所给输入，与课程13二5完全同题；h问合并旧编号。仍按通常因果零状态解释，原题未单独规定ROC，不宣称无条件唯一核。'+calcSplit),
  same('二5(2)', 'tk-exam-13-25-2', '第70页相同方程和输入e⁻³ᵗu的时域卷积问，与课程13二5完全同题；沿用因果条件与旧编号，不漏输入导数引起的右导数1。'+calcSplit),
  p('三1(1)', ['7.7', '7.8', '6.3'], 'diff-eq-solve', discrete+'求系统函数H(z)。', r`$H(z)=\dfrac{1-0.5z^{-1}+z^{-2}}{1-z^{-1}+0.24z^{-2}}=\dfrac{z^2-0.5z+1}{(z-0.6)(z-0.4)}$，因果ROC |z|>0.6。`, r`令第一延时前的中间信号为w[k]，原图给w=f+w[k−1]−0.24w[k−2]，输出y=w−0.5w[k−1]+w[k−2]。分别变换后相除得到H；0.5圈内只标幅值，输出求和器入口的负号决定分子为−0.5z⁻¹。两个实际极点0.6、0.4都未与分子约消，题设因果，ROC取两极点外侧。不能只看圆圈的0.5便当成正增益。`, { ...pic('3-1'), note: joint }),
  p('三1(2)', ['6.4', '7.6', '7.8'], 'diff-eq-solve', discrete+'列输入输出差分方程。', r`$y[k]-y[k-1]+0.24y[k-2]=f[k]-0.5f[k-1]+f[k-2]$。`, r`交叉相乘H的分子分母，再把z⁻¹、z⁻²换成一拍、两拍移位。左边−1与+0.24来自消去中间信号后的递推系数，右边−0.5和+1来自前馈输出。框图有直接输入输出通路，f[k]系数为1；不是只有延时输入的严格因果系统。`, { ...pic('3-1'), note: joint }),
  p('三1(3)', ['6.2', '7.2', '7.6'], 'diff-eq-solve', discrete+r`输入$f[k]=u[k]-u[k-2]$，求零状态响应。`, r`k<0时y=0；y[0]=1、y[1]=3/2；k≥2时$y[k]=\tfrac{212}{9}(3/5)^k-42(2/5)^k$。`, r`输入只有k=0、1两项1，故y=h[k]+h[k−1]。部分分式给h=(25/6)δ[k]+[(53/6)(3/5)ᵏ−12(2/5)ᵏ]u[k]。原图零状态节点递推可独立检查前四个输出为1、3/2、44/25、12/5；两个起始样值必须单列，不能把k≥2的指数式直接套到0、1。还可检查Σy=2H(1)=25/2。`, { ...pic('3-1'), note: joint }),
  p('三2(1)', ['7.7', '7.8', '1.8'], 'hz-roc-all', stateGraph+'判断系统是否稳定并说明理由。', r`因果实现不稳定。$H(z)=2z/(z-1)+z^2/(z^2-2z+5)$，实际极点1、1±2j，因果ROC |z|>√5，不包含单位圆。`, r`上支路单位正反馈给2/(1−z⁻¹)，下支路反馈+2、−5给1/(1−2z⁻¹+5z⁻²)，并联相加。约分检查三个极点均未消去；共轭对模为√5>1，另有单位圆上的极点1，普通因果核不绝对可和。原图使用向前延时器和零初态递推，按因果实现解释；不是仅看到状态矩阵特征值就忽略可观不可控的隐藏模。`, { ...pic('3-2'), note: joint }),
  p('三2(2)', ['8.1', '8.2', '7.8'], 'state-space', stateGraph+'列状态方程和输出方程。', r`$x_1[k+1]=x_1[k]+2f[k]$；$x_2[k+1]=2x_2[k]-5x_3[k]+f[k]$；$x_3[k+1]=x_2[k]$。

$y[k]=x_1[k]+2x_2[k]-5x_3[k]+3f[k]$。

矩阵式为$x[k+1]=Ax[k]+Bf[k]$、$y[k]=Cx[k]+Df[k]$，其中

$A=\begin{pmatrix}1&0&0\\0&2&-5\\0&1&0\end{pmatrix}$，$B=\begin{pmatrix}2\\1\\0\end{pmatrix}$，$C=(1,2,-5)$，$D=3$。`, r`延时器的输入等于其状态下一拍：上支路输入x₁+2f，下支路首延时输入2x₂−5x₃+f，次延时输入x₂。输出从两个延时前节点相加，所以是(x₁+2f)+(2x₂−5x₃+f)，包含3f直通，不能误写y=x₁+x₂。用C(zI−A)⁻¹B+D回传，恰得到两个原支路H之和；状态矩阵的三个模均可控可观。本题作为第8章拓展练习保留，自动模拟组卷排除状态变量拓展题。`, { ...pic('3-2'), note: joint }),
];

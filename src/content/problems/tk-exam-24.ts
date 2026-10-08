import type { Problem } from '../../types';
import { problem as make } from './helper';
import { tkExam01 } from './tk-exam-01';
import { tkExam02 } from './tk-exam-02';
import { tkExam03 } from './tk-exam-03';
import { tkExam07 } from './tk-exam-07';
import { tkExam13 } from './tk-exam-13';
import { tkExam22 } from './tk-exam-22';
const paper = 'tk-exam-24';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make(paper, ...args);
const r = String.raw;
const score = (no: string, value: number): Partial<Problem> => ({ sources: [{ paper, no, score: value }] });
const fill = (no: string): Partial<Problem> => ({ ...score(no, 3), type: '填空' });
const pic = (no: string) => ({ figures: ['figures/tk-exam-24/q'+no+'.png'] });
const calcSplit = '原卷本计算题共10分，未给拆问分值，各单元不虚分。本卷未附参考解。';
const joint = '原卷本综合题共10分，未给小问分值，各单元不虚分。本卷未附参考解。';
const oldProblems = [...tkExam01, ...tkExam02, ...tkExam03, ...tkExam07, ...tkExam13, ...tkExam22];
function same(no: string, id: string, note: string, extra: Partial<Problem> = {}): Problem {
  const old = oldProblems.find(item => item.id === id);
  if (!old?.pattern) throw new Error('同题模板不存在：'+id);
  return p(no, [...old.kps], old.pattern, old.stem, old.answer, old.solution, {
    type: old.type, figures: old.figures, verified: old.verified, note, ...extra,
  });
}
const inverse = r`两个离散LTI子系统级联，总系统H(z)=1。原给第一个子系统$h_1[k]=(1/2)^ku[k]$，旁注“k=偶数”，没有另列奇数项。以下条件解按通常的偶数样值序列解释：非负偶数k取所给值，其余k取0；若奇数项另有值，结果需重算。`;
const inverseNote = '第82页原公式只写k为偶数，奇数项未给；明确采用奇数项补零的条件解释。本题从自动模拟组卷排除。';

export const tkExam24: Problem[] = [
  same('一(1)', 'tk-exam-07-1-1', '第81页仿射零状态关系2f−1的三种性质与第7套一1同题，保留非线性、时不变、有界性证明。', fill('一(1)')),
  same('一(2)', 'tk-exam-07-1-2', '第81页δ(t)cos(2t)与第7套一2完全同题，保留冲激乘积的筛选解释。', fill('一(2)')),
  same('一(3)', 'tk-exam-07-1-3', '第81页箭头经350dpi核对：h首项为零时刻，f第二项为零时刻；与第7套一3同题，保留已经更正的第三项−2和旧编号。', fill('一(3)')),
  same('一(4)', 'tk-exam-07-1-4', '第81页T₀=2π和五项FS系数与第7套一4完全相同，±3虚系数的符号不变。', fill('一(4)')),
  same('一(5)', 'tk-exam-07-1-5', '第81页e⁻²ᵗcos(100t)u(t)的FT与第7套一5同题，保留弧度频率100和衰减系数2。', fill('一(5)')),
  same('一(6)', 'tk-exam-03-1-7', '第81页原指数在350dpi明确为常数e⁻²、没有s，与课程03一7完全同题；不能补成e⁻²ˢ延时。', fill('一(6)')),
  same('一(7)', 'tk-exam-03-1-8', '第81页原公式只定义t>−2，与课程03一8同题；保留零延拓条件及未给时段无法唯一确定FT的存疑说明。', fill('一(7)')),
  same('一(8)', 'tk-exam-03-1-9', '第81页单边ZT有理式及|z|>3与课程03一9同题，首样值仍为2。', fill('一(8)')),
  same('一(9)', 'tk-exam-03-1-10', '第81页理想低通频响和延时t₀与课程03一10同题，保留t=t₀的可去极限。', fill('一(9)')),
  same('一(10)', 'tk-exam-02-1-6', '第81页与课程02一6/03一2同题：最高频率旁印Hz又称角频率，按明确Hz给1/(6fₘ)；若实际指rad/s，上界为π/(3fₘ)。临界谱线条件仍保留，不把混用单位当作新题。', fill('一(10)')),

  p('二(1)', ['2.4', '1.3', '1.5'], 'conv-integral', r`图A-1：x₁(t)=1（0<t<1），其余0；x₂(t)=1/2（0<t<2）、−1/2（4<t<5），其余0。画卷积y=x₁*x₂的图形。端点单点值不影响卷积。`, r`
$$
y(t)=\begin{cases}
t/2,&0<t<1,\\
1/2,&1\le t\le2,\\
(3-t)/2,&2<t<3,\\
-(t-4)/2,&4<t<5,\\
-(6-t)/2,&5\le t<6,\\
0,&\text{其余}.
\end{cases}
$$
正梯形节点(0,0)、(1,1/2)、(2,1/2)、(3,0)，负三角节点(4,0)、(5,−1/2)、(6,0)。

![保留负脉冲的卷积图](figures/tk-exam-24/a2-1.svg)`, r`x₁的窗口长1；与x₂的正矩形重叠长度先从0增至1，保持1，再减至0，乘其高度1/2。负矩形在4..5，与同长x₁产生4..6的负三角，不能把负半高改为正值。3..4没有重叠，输出为0。定义积分和斜坡展开均给上述分段；总面积为1·(1−1/2)=1/2，正梯形面积1、负三角面积−1/2可独立校验。`, { ...score('二(1)', 10), ...pic('2-1'), type: '画图' }),
  p('二2(1)', ['7.1', '7.2', '6.2', '7.7'], 'discrete-diagram', inverse+'求另一个子系统的H₂(z)和单位样值响应h₂[k]。', r`在所列偶数样值/奇数补零条件下：
$$
H_1(z)=\frac1{1-z^{-2}/4},\quad |z|>1/2;\qquad
H_2(z)=1-\frac14z^{-2},\quad h_2[k]=\delta[k]-\frac14\delta[k-2].
$$
H₂的ROC为|z|>0，包含∞。若奇数项未规定，则不能唯一确定H₁、H₂。`, r`按k=2m取原值(1/2)²ᵐ=(1/4)ᵐ，H₁=Σₘ≥₀(1/4)ᵐz⁻²ᵐ，仅在|z|>1/2收敛。由总H=1取其倒数，反演为两抽头FIR；用定义卷积h₁[k]−h₁[k−2]/4，逐整数得到仅k=0为1，其余0。原偶数限制不可丢成普通一阶指数；H₂不是δ[k]−δ[k−1]/2。乘积先在共同ROC中为1，卷积核δ的实际ROC再扩展到整个z平面。`, { ...pic('2-2'), verified: 'uncertain', note: calcSplit+inverseNote }),
  p('二2(2)', ['7.8', '1.7', '7.7'], 'discrete-diagram', inverse+'原问：“试用最少的延迟器和标量乘法器画出该系统的模拟框图”。分别说明整体与第二子系统的解释。', r`若“该系统”指原总系统H=1，最小实现为输入直接连到输出，0个延迟器、0个非单位增益乘法器。

若指上一问求得的第二子系统H₂，其最小因果FIR实现为主支路直通，加一条经两级z⁻¹和增益−1/4的延时支路：y₂[k]=x₂[k]−x₂[k−2]/4。需要2个单位延迟器、1个非单位增益乘法器。

![区分原整体和第二子系统的实现](figures/tk-exam-24/a2-2.svg)`, r`原题“该系统”没有明确指代，不能把H=1的整体实现误说成必需两级延迟。对第二子系统，非零抽头在0和2，记忆阶数2；两个z⁻¹串联保留二拍输入，唯一非单位系数为−1/4。图上的乘法器不计单位直通；若坚持物理保留原两子系统级联，则须保留H₁的反馈实现，但已不属于整体最少元件。`, { ...pic('2-2'), type: '画图', verified: 'uncertain', note: calcSplit+inverseNote+'“该系统”未指明整体还是H₂，两种实现分开。' }),
  same('二(3)', 'tk-exam-22-2-3', '第82页阶跃响应(1−e⁻ᵗ−te⁻ᵗ)u与目标响应(2−3e⁻ᵗ+e⁻³ᵗ)u和课程22二3同题，独立卷积回查输入后合并旧编号。', score('二(3)', 10)),
  same('二(4)', 'tk-exam-22-2-2', '第82页原∞上限、t−1下限和x(τ−2)与课程22二2同题，保留e⁴e⁻²ᵗu(3−t)的左尾与非因果性说明。', score('二(4)', 10)),
  same('二5(a)', 'tk-exam-13-25-1', '第82页原二阶方程与课程13二5(1)完全同题；保留零状态约消与原非零初态自由模的区别。'+calcSplit),
  same('二5(b)', 'tk-exam-13-25-2', '第82页原输入e⁻³ᵗu及指定时域卷积问法与课程13二5(2)完全同题，保留输入导数冲激和零状态右导数1。'+calcSplit),

  same('三1(B)', 'tk-exam-02-32-B', '第82页与课程02三2(B)采样链路、T=0.02和三角输入谱完全同题，冲激谱线面积100π沿用旧编号。'+joint),
  same('三1(C)', 'tk-exam-02-32-C', '第82页与课程02三2(C)完全同题，复制谱系数50、副本峰高5已独立核验。'+joint),
  same('三1(D)', 'tk-exam-02-32-D', '第82页H₁通带确为100π<|ω|<120π，与课程02三2(D)同题，只保留两个朝外半三角，不补为完整副本。'+joint),
  same('三1(E)', 'tk-exam-02-32-E', '第82页cos(100πt)二次调制及E点问法与课程02三2(E)同题；中央两半不整段重叠，增益25沿用旧解。'+joint),
  same('三1(F)', 'tk-exam-02-32-F', '第82页H₂通带|ω|<20π及F点频谱画图与课程02三2(F)同题，中央峰5/2；两卷原题只要求频谱，时域输出保留为解答中的核验。'+joint),

  same('三2(1)', 'tk-exam-01-31-1', '第82页末和83页顶部ODE、e⁻ᵗu输入及y(0⁻)=y′(0⁻)=1与课程01三1(1)完全同题；保留输入导数冲激使右导数变3的勘误，联合ZI/ZS/全响应问沿用旧粒度。'+joint),
  same('三2(2)', 'tk-exam-01-31-2', '第82/83页求H、h及稳定性与课程01三1(2)同题；两个原因果极点−2/−5和−1/3、7/3核系数已独立回算。'+joint),
  same('三2(3)', 'tk-exam-01-31-3', '第83页直接型框图与课程01三1(3)同题，保留两积分器及−7/−10反馈、2/3前馈和旧答案图。'+joint),
];

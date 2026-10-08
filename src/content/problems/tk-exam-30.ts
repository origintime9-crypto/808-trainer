import type { Problem } from '../../types';
import { problem as make } from './helper';
import { tkExam06 } from './tk-exam-06';
import { tkExam07 } from './tk-exam-07';
import { tkExam08 } from './tk-exam-08';
import { tkExam10 } from './tk-exam-10';
import { tkExam11 } from './tk-exam-11';
import { tkExam12 } from './tk-exam-12';
import { hw5 } from './hw5';
const paper='tk-exam-30';
const p=(...args: Parameters<typeof make> extends [string,...infer R]? R:never)=>make(paper,...args);
const r=String.raw;
const score=(no:string,value:number):Partial<Problem>=>({sources:[{paper,no,score:value}]});
const fill=(no:string):Partial<Problem>=>({...score(no,3),type:'填空'});
const split='原卷本计算题共10分，未给小问分值，不擅自平分。本卷未附参考解。';
const joint='原卷本综合题共10分，未给小问分值，不擅自平分。本卷未附参考解。';
const oldProblems=[...tkExam06,...tkExam07,...tkExam08,...tkExam10,...tkExam11,...tkExam12,...hw5];
function same(no:string,id:string,note:string,extra:Partial<Problem>={}):Problem {
 const old=oldProblems.find(item=>item.id===id);
 if(!old?.pattern)throw new Error('同题模板不存在：'+id);
 return p(no,[...old.kps],old.pattern,old.stem,old.answer,old.solution,{
  type:old.type,figures:old.figures,verified:old.verified,...extra,note,
 });
}

export const tkExam30:Problem[]=[
 same('一(1)','tk-exam-07-1-1','第93页零状态y=2f−1与课程07一1同题，常数偏置导致非线性，合并已有进度。',fill('一(1)')),
 same('一(2)','tk-exam-07-1-2','第93页δ(t)cos(2t)与课程07一2同题，按分布筛选计算。',fill('一(2)')),
 same('一(3)','tk-exam-07-1-3','第93页箭头分别在h第一项及f第二项，与课程07一3同题；独立卷积仍为{1,1,−2,7,−5,2}。本卷无附解，旧勘误只针对第28页。',fill('一(3)')),
 same('一(4)','tk-exam-07-1-4','第93页T₀=2π和F₀/F±1/F±3与课程07一4同条件；指数虚系数合成+0.4sin3t。',fill('一(4)')),
 same('一(5)','tk-exam-07-1-5','第93页e⁻²ᵗcos100t·u(t)与课程07一5同题，保留衰减2及角频率100。',fill('一(5)')),
 same('一(6)','tk-exam-11-1-10','第93页原输出仍为e⁻ᵗu(t)+u(−1−t)，与课程11一10同条件；远端基线矛盾继续标存疑，不能改成右向阶跃。',fill('一(6)')),
 same('一(7)','tk-exam-12-1-7','第93–94页三组指数输入/输出与课程12一7同题，原文没有给同初态或零状态限定。保留a−7b的条件解及存疑说明。',fill('一(7)')),
 same('一(8)','tk-exam-08-1-8','第94页因果H的全部极点在左半平面与课程08一8同题，按有限阶有理系统的普通核讨论长期极限。',fill('一(8)')),
 same('一(9)','hw5-5-2-2','第94页Sa²(100t)不混叠的最小抽样角频率与习题5.2(2)同题，400的单位为rad/s；保留同一编号和进度。',fill('一(9)')),
 same('一(10)','tk-exam-08-1-10','第94页积分下限2、上限t及t<2时0，与课程08一10同题，变换为e⁻²ˢF(s)/s。本卷没有附解，旧勘误仅针对原旧来源。',fill('一(10)')),

 same('二1(1)','tk-exam-07-22-1','第94页图A-1的两段斜边只在2<|ω|<4内非零，与课程07二2同题；独立逆FT和h(0)=1/π核对后合并。'+split),
 same('二1(2)','tk-exam-07-22-2','第94页原输入明确是全时域1+0.6cost+0.4cos3t+0.2cos5t，与课程07二2第二问同题，输出0.2cos3t。'+split),
 p('二(2)',['7.1','7.2'],'hz-roc-all',
  r`图A-2为离散LTI系统H(z)的零极点图：零点±j、极点±1，另给h[0]=1。求单位样值响应h[k]。原题没有指定因果性或收敛域。`,
  r`原条件不能唯一确定h[k]。两个合法候选为：

$$
h_R[k]=(1+(-1)^k)u[k]-\delta[k],\qquad |z|>1;
$$
$$
h_L[k]=(1+(-1)^k)u[-k-1]+\delta[k],\qquad |z|<1.
$$

只有补充因果性，才选第一种。两者均h[0]=1且具有原零极点。`,
  r`先由零极点写H(z)=K(z²+1)/(z²−1)。令q=z⁻¹：

$$
\frac{1+q^2}{1-q^2}=\frac1{1-q}+\frac1{1+q}-1.
$$

外侧ROC时，两项右边序列在k=0各为1，减δ后为1，故K=1。内侧ROC时，两个左边序列在k=0均0，只留下−Kδ，故K=−1。两极点模都为1，没有可选的非空中间环域。h[0]不能同时替代增益和ROC条件，极点在单位圆上，两候选均不满足BIBO稳定。`,
  {...score('二(2)',10),figures:['figures/tk-exam-30/q2-2.png'],verified:'uncertain',note:'第94页只给零极点及h(0)=1，没有因果/ROC限定。正负两个增益与对应ROC都满足原条件，不把默认因果的单一解用于808能力和自动组卷。'}),
 same('二(3)','tk-exam-07-2-1','第94页1/[s(1−e⁻²ˢ)]及Re s>0与课程07二1同题，每两秒增加一级，沿用已核对波形。',score('二(3)',10)),
 p('二(4)',['2.2','7.6','7.2'],'full-response-decomp',
  r`线性时不变离散系统：输入x₁[k]=u[k]、“初始状态”y[−1]=1时，全响应y₁[k]=2（k≥0）；输入x₂[k]=(k/2)u[k]、“初始状态”y[−1]=−1时，全响应y₂[k]=k−1（k≥0）。求输入x₃[k]=(1/2)ᵏu[k]时的零状态响应。原题只给这个输出样值，没有给完整状态实现。`,
  r`若两次给定初态确实代表**完整状态互为相反数**，标准叠加条件解为

$$
y_{zs,3}[k]=(k+1)(1/2)^k u[k].
$$

仅凭一个输出样值y[−1]，一般不能保证完整初态互相抵消；原题条件不足，所示结果不能作为无条件结论。`,
  r`在两次零输入部分能够抵消的条件下，合并输入(1+k/2)u[k]得到零状态(k+1)u[k]。令q=z⁻¹：

$$
X=\frac{1-q/2}{(1-q)^2},\quad
Y=\frac1{(1-q)^2},\quad
H=\frac1{1-q/2}.
$$

再乘X₃=1/(1−q/2)，得到二重极点的逆Z变换(k+1)(1/2)ᵏu[k]；直接卷积也有k+1个相等项。这里不能额外宣称原系统就是唯一一阶递推y[k]−y[k−1]/2=x[k]：那一递推在第一组y[−1]=1时给y[0]=3/2，和原给2不一致。带附加自主状态的非最小LTI实现可以满足原数据，但一个输出样值不能确定其完整状态。保留原数值和条件解，等待完整初态说明。`,
  {...score('二(4)',10),verified:'uncertain',note:'第94页用相反的y[−1]表示初始状态，未给阶次或完整状态。只有确实相反的完整初态才能按原意消去零输入部分；不由单一输出值擅自推定，排除808能力和自动组卷。'}),
 same('二(5)','tk-exam-06-2-4','第94页H=(s²+1)/(s³+2s²+3s+1)与课程06二4同题，状态方程为拓展内容；本卷无参考框图，旧勘误仅指旧来源。',score('二(5)',10)),

 same('三1(1)','tk-exam-10-32-1','第94–95页图A-3的F矩形±ω₁、高1，H₁三角±2ω₁、高1，与课程10三2同题。Y₁到输入带边缘为1/2而非延伸到±2ω₁。'+joint),
 same('三1(2)','tk-exam-10-32-2','第95页冲激串抽样与课程10三2同题，复制谱权重1/T、间隔2π/T；严格无交叠和普通密度的临界边界分开说明。'+joint),
 same('三1(3)','tk-exam-10-32-3','第95页恢复原f而非仅恢复y₁，与课程10三2同题，带内需倒数补偿T/H₁。旧参考图勘误仅指第54页，本卷未附参考解。'+joint),
 same('三2(1)','tk-exam-07-32-1','第95页图A-4反馈+3/−2、输出直通/+4，与课程07及复习23同图；差分方程合并最早编号。'+joint),
 same('三2(2a)','tk-exam-07-32-2a','第95页输入4ᵏu及y[−1]=−1、y[−2]=2，与课程07三2同题，零输入首样本−7。'+joint),
 same('三2(2b)','tk-exam-07-32-2b','第95页同原图、输入及初态，零状态首两样本1、11，与课程07同题；旧解勘误只指第35页。'+joint),
 same('三2(2c)','tk-exam-07-32-2c','第95页完全响应同课程07三2，首两样本−6、−8，不能误抵消2ᵏ项。'+joint),
 same('三2(3)','tk-exam-07-32-3','第95页H与单位样值响应同复习23/课程07，保留因果ROC|z|>2及直接样值。'+joint),
 same('三2(4)','tk-exam-07-32-4','第95页第一延时标x₂、第二延时标x₁，与课程07状态定义同序；输出直通D=1不可遗漏，保持为拓展。'+joint),
];

import type { Problem } from '../types';

export interface SkillTraining {
  id:string;title:string;kps:string[];patterns:string[];
  errors:{id:string;label:string}[];
  checkpoints:{id:string;prompt:string;hint:string}[];
}
export const skillTrainings:SkillTraining[]=[
  {id:'convolution',title:'卷积与波形变换',kps:['2.4','6.2','1.5'],patterns:['conv-integral','conv-sum'],
    errors:[{id:'convolution-support',label:'支撑区间/分段点错误'},{id:'convolution-limits',label:'卷积积分限错误'}],
    checkpoints:[{id:'support',prompt:'两个信号的支撑区间分别是什么？',hint:'先独立找出非零区间。冲激项逐项处理，不能直接当作普通函数积分。'},
      {id:'breaks',prompt:'翻转、平移后在哪些位置开始重叠或改变重叠形式？',hint:'用区间端点的相遇位置确定分段点，再检查是否漏掉无重叠区间。'},
      {id:'limits',prompt:'写出每一段的积分上下限（或求和边界）。',hint:'上下限来自两个支撑区间的交集；结果应在边界连续或按冲激性质说明跳变。'}]},
  {id:'roc',title:'拉氏/Z变换与稳定性',kps:['4.1','4.3','4.4','4.7','7.1','7.2','7.7'],patterns:['laplace-calc','z-calc','hz-roc-all','ft-exist-from-Hs','zp-h0'],
    errors:[{id:'roc-missing',label:'ROC漏写/左右边序列错误'},{id:'roc-stability',label:'因果性或稳定性依据错误'}],
    checkpoints:[{id:'poles',prompt:'极点在哪里？有哪些可能的ROC？',hint:'ROC不能含极点。列出各个连通条带或圆环，同一有理式可对应不同时间方向。'},
      {id:'sides',prompt:'保持同一代数式，改换ROC后，时域表达及因果性怎么变？',hint:'逐个极点核对左右边信号，不要只根据代数式认定因果。'},
      {id:'stability',prompt:'每个ROC是否包含虚轴或单位圆？据此写稳定性依据。',hint:'连续系统检查虚轴，离散系统检查单位圆。频率响应存在性与形式代入要分开。'}]},
  {id:'response',title:'零输入/零状态响应',kps:['2.1','2.2','4.5','6.4'],patterns:['full-response-decomp','ode-s-solve','diff-eq-solve'],
    errors:[{id:'initial-state',label:'初态或零状态假设错误'},{id:'impulse-jump',label:'0−/0+或冲激项错误'}],
    checkpoints:[{id:'initial',prompt:'原题给的是哪个时刻的初态？零状态部分满足哪些初始条件？',hint:'先区分0−、0+和初态是否改变；题目没有给出的初态不能自行置零。'},
      {id:'decompose',prompt:'分别写零输入项和零状态项，再写改变激励/初态的影响。',hint:'只把初态缩放作用于零输入，只把激励缩放或延时作用于零状态；有冲激时单独核对跳变。'},
      {id:'check',prompt:'如何用代回方程、初值和首样本检查？',hint:'先检查起点，再检查完整方程；含阶跃的延时要连同支撑区间一起移动。'}]},
  // 此流程检查时域抽样后的谱副本；频域抽样对应时域延拓，不能套用同一提示。
  {id:'spectrum',title:'频谱与抽样画图',kps:['3.3','3.4','5.2','5.3','5.4'],patterns:['nyquist','sample-hold'],
    errors:[{id:'frequency-units',label:'Hz/rad·s⁻¹或横轴单位错误'},{id:'spectrum-scale',label:'频谱幅度系数错误'},{id:'spectrum-replicas',label:'谱副本位置错误'},{id:'sampling-alias',label:'混叠判断错误'}],
    checkpoints:[{id:'axis',prompt:'横轴用f还是ω？带宽和最高频率分别是多少？',hint:'先写清Hz和rad/s，不能把最高角频率直接当作Hz使用。'},
      {id:'scale',prompt:'原谱与变换后谱的幅度系数如何变化？',hint:'逐项核对尺度、调制和抽样脉冲权重；画图标出高度。'},
      {id:'replicas',prompt:'谱副本位于何处？是否重叠，恢复条件是什么？',hint:'按抽样频率周期平移原谱，逐个比较边缘，再说明滤波或保持环节的影响。'}]},
  {id:'method',title:'隐藏题型选择解法',kps:[],patterns:[],
    errors:[{id:'method-selection',label:'解法选择或适用条件错误'},{id:'transform-algebra',label:'变换/建模关键步骤错误'}],
    checkpoints:[{id:'given',prompt:'题目已知什么、要求什么？',hint:'先识别所给信息是时域、频域、初态还是系统结构，不用看到熟悉符号就套公式。'},
      {id:'method',prompt:'选用哪种方法，理由和适用条件是什么？',hint:'比较卷积、频域法及LT/ZT的条件，涉及初态时检查变换口径。'},
      {id:'verify',prompt:'给出第一步建模式，并选择一种独立检查方法。',hint:'可以用代回、初终值、面积、首样本或量纲检查；适用条件仍须先核对。'}]},
];
export const skillById=new Map(skillTrainings.map(s=>[s.id,s]));
export const skillErrorLabel=(id:string)=>skillTrainings.flatMap(s=>s.errors).find(e=>e.id===id)?.label??id;
export const trainingForProblem=(p:Problem)=>skillTrainings.filter(s=>s.id==='method'||s.patterns.includes(p.pattern??'')||s.kps.some(k=>p.kps.includes(k)));

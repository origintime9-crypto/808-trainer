export interface RubricStep {id:string;label:string;max:number;check:string;skillError?:string}
export interface Rubric {problemId:string;max:number;revision:string;steps:RubricStep[]}
/** 与已复核题解逐项对应；配分由项目拟定，并非学校官方评分细则。 */
export const rubrics:Rubric[]=[
  {problemId:'zt2016-2-2',max:10,revision:'reference-2026-10-28',steps:[
    {id:'model',label:'等效系统与三条支路',max:3,check:'写出直接、延时1与延时2的三条支路，再串联矩形冲激响应。',skillError:'transform-algebra'},
    {id:'support',label:'支撑区间与分段点',max:2,check:'核对总支撑[0,4]以及0、1、3、4的分段。',skillError:'convolution-support'},
    {id:'integrals',label:'卷积计算与叠加',max:3,check:'先求三角脉冲，再叠加三个平移量；中间平顶高度为1。',skillError:'convolution-limits'},
    {id:'plot',label:'完整分段式及波形',max:2,check:'各区间的表达、边界值和横轴标注与梯形一致。',skillError:'convolution-support'}]},
  {problemId:'zt2026-6',max:15,revision:'reference-2026-10-28',steps:[
    {id:'model',label:'建立两次全响应的线性方程',max:3,check:'两次初态相同，零输入项保持不变；激励加倍只加倍零状态项。',skillError:'initial-state'},
    {id:'decompose',label:'解出零输入与零状态响应',max:4,check:'相减求零状态，再代回求零输入；两项和应还原原响应。',skillError:'transform-algebra'},
    {id:'delay',label:'延时激励的响应',max:4,check:'只延时零状态项，连同阶跃一起延时；零输入项不延时。',skillError:'initial-state'},
    {id:'scale',label:'改变初态与激励的组合响应',max:4,check:'分别乘以2和1/2后相加，核对余弦和指数项系数。',skillError:'initial-state'}]},
  {problemId:'zt2026-7',max:15,revision:'reference-2026-10-28',steps:[1,2,3].flatMap(n=>[
    {id:`roc-${n}`,label:`第${n}式：极点、因果假设与ROC`,max:2,check:'说明按因果系统判断，核对ROC是否包含虚轴。',skillError:'roc-stability'},
    {id:`result-${n}`,label:`第${n}式：存在性与变换结果/理由`,max:3,check:n===2?'右半平面极点导致因果ROC不含虚轴，不能只形式代入。':'存在时令s=jω，逐项检查分子分母的符号和系数。',skillError:'transform-algebra'}])},
  {problemId:'zt2026-8',max:15,revision:'reference-2026-10-28',steps:[
    {id:'band',label:'由Sa函数确定频谱范围',max:4,check:'两项最高角频率分别为100π与200π rad/s。',skillError:'spectrum-replicas'},
    {id:'units',label:'角频率与Hz换算',max:3,check:'除以2π，分别得到最高频率50与100 Hz。',skillError:'frequency-units'},
    {id:'first',label:'第一问抽样频率',max:4,check:'使用最高频率的两倍，给出100 Hz或等价角频率。',skillError:'sampling-alias'},
    {id:'sum',label:'叠加信号的最高频率与抽样频率',max:4,check:'叠加的带宽取较大者，给出200 Hz或等价角频率。',skillError:'sampling-alias'}]},
  {problemId:'zt2026-9',max:15,revision:'reference-2026-10-28',steps:[
    {id:'equation',label:'差分方程及输入延时',max:3,check:'分子z⁻¹对应x(n−1)，不能写成x(n)。',skillError:'transform-algebra'},
    {id:'fractions',label:'极点与部分分式系数',max:3,check:'极点2与1/2，H(z)/z的系数为2/3与−2/3。',skillError:'transform-algebra'},
    ...['right','mixed','left'].flatMap((id,n)=>[
      {id:`roc-${id}`,label:`第${n+1}种ROC`,max:1.5,check:['|z|>2','1/2<|z|<2','|z|<1/2'][n],skillError:'roc-missing'},
      {id:`response-${id}`,label:`对应第${n+1}种h(n)`,max:1.5,check:'与该ROC逐项配对左右边序列，检查负号及u(−n−1)的起点。',skillError:'roc-missing'}])]},
  {problemId:'zt2026-10',max:20,revision:'reference-2026-10-28',steps:[
    {id:'model',label:'由零极点建立H(s)',max:4,check:'分子Ks，分母为(s+1)²+3/4。',skillError:'transform-algebra'},
    {id:'gain',label:'利用h(0+)求增益',max:3,check:'说明初值定理适用并由lim sH(s)=1得到K=1。',skillError:'impulse-jump'},
    {id:'stability',label:'稳定性及因果/ROC依据',max:4,check:'按因果系统作答，极点在左半平面且ROC包含虚轴。',skillError:'roc-stability'},
    {id:'frequency',label:'代入激励频率求频率响应',max:4,check:'取ω=√3/2，计算复数H(jω)。',skillError:'transform-algebra'},
    {id:'amplitude',label:'模与相位',max:3,check:'核对模√3/4以及系统相移π/6，注意象限。',skillError:'spectrum-scale'},
    {id:'output',label:'正弦稳态响应与最终相位',max:2,check:'保留激励角频率，合并初相位后为5π/12。',skillError:'frequency-units'}]},
];
export function referenceRubric(problemId:string,max?:number):Rubric|undefined {
  const rubric=rubrics.find(r=>r.problemId===problemId);
  return rubric&&(max===undefined||max===rubric.max)?rubric:undefined;
}

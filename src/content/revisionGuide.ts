/** 资料核对截止日与结论；经验资料不能自动改写目标年份的考试范围。 */
export const guideCheckedAt = '2026-10-28';

export const exam808Schedule = {
  date: '2026-12-20',
  time: '14:00–17:00',
  zone: '北京时间',
  source: 'https://grs.nuc.edu.cn/info/1015/9935.htm',
};

/** 808按业务课（二）的下午场计；显式时区避免换设备后截止时刻漂移。 */
export function examStartTimestamp(date: string): number {
  return new Date(`${date}T14:00:00+08:00`).getTime();
}

export const guideSources = [
  { id: 'brochure', title: '中北大学2027年硕士研究生招生简章', kind: '学校官方', url: exam808Schedule.source,
    finding: '已核对初试日期、下午场时段和业务课满分。专业课按12月20日下午、180分钟安排，最终以准考证为准。',
    limit: '招生简章没有列出信号与系统的逐章考点，不能用它证明章节取舍。' },
  { id: 'catalogue', title: '中北大学2027年硕士研究生招生目录', kind: '学校官方 · 附件待核验', url: 'https://grs.nuc.edu.cn/info/1015/9915.htm',
    finding: '已找到2026年9月24日发布的官方目录页；另有2027自命题科目调整通知。',
    limit: '附件下载出现验证码，本次未读到可核验正文。2027科目、参考书及详细范围仍需结合报考专业核对。' },
  { id: 'adjustment', title: '2027年硕士招生自命题科目调整通知', kind: '学校官方 · 附件待核验', url: 'https://grs.nuc.edu.cn/info/1015/9315.htm',
    finding: '学校提示按更新后的科目及参考书准备。',
    limit: '通知正文不展开808范围，不能据此确认某一章节必考或不考。' },
  { id: 'course', title: '中北大学《信号与系统》课程介绍', kind: '任课教师课程资料', url: 'https://coursehome.zhihuishu.com/courseHome/1000101219',
    finding: '课程团队为郝利华、王明泉等；参考教材为王明泉、郝利华等编著、科学出版社《信号与系统》。课程强调三大变换、频谱和系统函数。',
    limit: '用于核对教材与课程主线，课程范围不能直接替代2027招生考试大纲。' },
  { id: 'paper-review', title: '通信考研小马哥：2026中北808真题解析', kind: '作者经验 · 非官方', url: 'https://www.tongxinkaoyan.com/29926.html',
    finding: '公开列出的主题与现有2026原卷主线相符，并建议整卷独立完成后再看解析。',
    limit: '公开文章部分题号顺序与已核对原卷不同，只交叉核对主题，不覆盖原卷题序、分值或答案。' },
  { id: 'revision-method', title: '通信考研小马哥：基础强化课学习说明', kind: '作者经验 · 非官方', url: 'https://www.tongxinkaoyan.com/openclass/18hclass',
    finding: '建议按目标教材章节学习；作者也明确说明院校重点圈画是个人经验，应结合考纲与真题使用。',
    limit: '本次只读公开说明，没有读取登录后的讲义，也未用课程宣传中的分数承诺校准难度。' },
  { id: 'old-catalogue', title: '中北大学2023年硕士研究生招生目录', kind: '学校官方 · 历史资料', url: 'https://grs.nuc.edu.cn/info/1015/6526.htm',
    finding: '2023目录中808为电子技术，信号与系统为信息与通信工程学院复试科目0501。',
    limit: '历史科目代号会变；旧复试卷可补充训练，不能累计成2027初试多年频次。' },
];

export const guideComparisons = [
  { id: 'core', title: '三大变换与系统分析', status: '主线相符', kps: ['3.3','3.4','4.1','4.2','4.3','7.1','7.2','7.3'],
    evidence: '中北课程强调变换域；2026原卷和作者解析都涉及变换性质、ROC与系统函数。',
    decision: '保留核心权重。把公式记忆与独立选法分开验证，反变换同时写出适用条件和ROC。',
    href: '#/train/method', action: '训练混合选法' },
  { id: 'response', title: '卷积、初态与响应分解', status: '核心保留', kps: ['2.1','2.2','2.4','6.2','6.4'],
    evidence: '两份经验重点表对经典时域解法、卷积的星级不同；现有2026原卷有波形、卷积和响应分解题。',
    decision: '不因另一份表星级较低就删减。先检查初态、支撑区间与积分/求和边界，再核对结果。',
    href: '#/train/convolution', action: '训练卷积边界' },
  { id: 'roc', title: '零极点、ROC、因果与稳定', status: '主线相符', kps: ['4.6','4.7','7.7'],
    evidence: '现有原卷及两份经验重点表均覆盖系统函数与性质判断。',
    decision: '稳定性结论必须带依据；同一代数式不能省略ROC条件。步骤得分与复习评级分开保存。',
    href: '#/train/roc', action: '训练ROC与稳定性' },
  { id: 'sampling', title: '抽样频谱与混叠、重建', status: '补齐关联条件', kps: ['5.2','5.3','5.4'],
    evidence: '现有原卷考查抽样，经验表也列出抽样；原圈画把混叠与重建标为低星。',
    decision: '低星不等于可以跳过抽样的前提。补查横轴单位、副本位置、混叠与重建条件；不据此宣称2027有独立大题。',
    href: '#/train/spectrum', action: '训练频谱与抽样' },
  { id: 'flow', title: '信号流图与框图', status: '重点表有分歧', kps: ['7.8','4.6','7.7'],
    evidence: '原圈画的离散信号流图为2星；另一份无年份重点表把信号流图与梅森公式列为5星。',
    decision: '保留原星级，增加补查入口；先验证框图与系统函数的互相转换。梅森公式是否属于2027要求待官方核验。',
    href: '#/practice?kp=7.8', action: '补查信号流图' },
  { id: 'circuit', title: '电路建模与s域分析', status: '单独范围待核验', kps: ['1.7','4.5','4.6'],
    evidence: '无年份重点表单列电路分析；当前知识分类将模型、系统函数分散归类。',
    decision: '可补查模型与系统函数的联系。这一入口是已有系统模型题，不能当作电路专项已完整覆盖。',
    href: '#/practice?kp=1.7', action: '补查系统模型' },
  { id: 'state', title: '状态变量、可控与可观', status: '考试范围待核验', kps: ['8.1','8.2','8.3','8.4'],
    evidence: '原圈画将状态变量列为扩展；无年份重点表则列为2–3星，且没有可确认的官方年份或署名。',
    decision: '默认按扩展练习，不计入核心水平和模考替换；2027是否要求这一部分待核验，不能将经验圈画当作官方不考依据。',
    href: '#/practice?domain=state', action: '查看扩展题' },
];

export const supplementalKnowledge = new Map([
  ['5.3','抽样关联条件，低星不能替代条件检查'],
  ['5.4','抽样关联条件，建议结合频谱练习'],
  ['7.8','两份重点表评级不同，建议补查'],
  ...['8.1','8.2','8.3','8.4'].map(id=>[id,'默认扩展，2027范围待官方核验']),
].map(([id,label])=>[id,label] as const));

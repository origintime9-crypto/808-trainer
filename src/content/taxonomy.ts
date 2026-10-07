/** 知识点编号沿用既有资料；分类只是导航层，旧卡片与进度不会更换编号。 */
export const domains = [
  { id: 'basics', title: '信号与系统基础', description: '信号、冲激、波形与系统性质' },
  { id: 'time', title: '连续系统 · 时域', description: '微分方程、响应分解与卷积' },
  { id: 'frequency', title: '连续系统 · 频域', description: '傅里叶分析、滤波、调制与抽样' },
  { id: 'laplace', title: '连续系统 · s 域', description: '拉普拉斯、零极点与稳定性' },
  { id: 'discrete', title: '离散系统 · 时域与 z 域', description: '序列、差分方程、DTFT 与系统函数' },
  { id: 'state', title: '状态变量与拓展', description: '保留拓展题，按原重点表标注星级' },
];

export const topics = [
  { id: 'signal', domain: 'basics', title: '信号分类与分解', kps: ['1.1', '1.2', '1.3', '1.6'] },
  { id: 'impulse', domain: 'basics', title: '阶跃、冲激与冲激偶', kps: ['1.4'] },
  { id: 'wave', domain: 'basics', title: '波形变换与运算', kps: ['1.5'] },
  { id: 'system', domain: 'basics', title: '系统模型与性质判定', kps: ['1.7', '1.8', '1.9'] },
  { id: 'response', domain: 'time', title: '微分方程与响应分解', kps: ['2.1', '2.2', '2.3'] },
  { id: 'convolution', domain: 'time', title: '连续卷积与相关', kps: ['2.4', '2.5'] },
  { id: 'series', domain: 'frequency', title: '傅里叶级数与周期频谱', kps: ['3.1', '3.2', '3.5'] },
  { id: 'fourier', domain: 'frequency', title: '傅里叶变换与性质', kps: ['3.3', '3.4'] },
  { id: 'filter', domain: 'frequency', title: '频率响应、无失真与滤波', kps: ['3.7', '3.8', '3.9', '3.10'] },
  { id: 'modulation', domain: 'frequency', title: '调制与解调', kps: ['3.6'] },
  { id: 'sampling', domain: 'frequency', title: '抽样、混叠与重建', kps: ['5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7'] },
  { id: 's-transform', domain: 'laplace', title: '拉普拉斯变换与反变换', kps: ['4.1', '4.2', '4.3', '4.4'] },
  { id: 's-system', domain: 'laplace', title: '系统函数、零极点与稳定性', kps: ['4.5', '4.6', '4.7'] },
  { id: 'sequence', domain: 'discrete', title: '序列与卷积和', kps: ['6.1', '6.2', '6.5'] },
  { id: 'difference', domain: 'discrete', title: '离散系统性质与响应', kps: ['6.3', '6.4'] },
  { id: 'z-transform', domain: 'discrete', title: 'z 变换、ROC 与反变换', kps: ['7.1', '7.2', '7.3', '7.4'] },
  { id: 'z-system', domain: 'discrete', title: 'DTFT、系统函数与框图', kps: ['7.5', '7.6', '7.7', '7.8'] },
  { id: 'state-variable', domain: 'state', title: '状态方程与系统结构', kps: ['8.1', '8.2', '8.3', '8.4'] },
];

export const topicById = new Map(topics.map(t => [t.id, t]));
export const topicByKp = new Map(topics.flatMap(t => t.kps.map(k => [k, t] as const)));
export function matchesCategory(kps: string[], domain = '', topic = ''): boolean {
  return kps.some(k => {
    const t = topicByKp.get(k);
    return !!t && (!domain || t.domain === domain) && (!topic || t.id === topic);
  });
}

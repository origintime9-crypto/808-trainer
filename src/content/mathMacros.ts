/** 全站共用简写；每次渲染传副本，题内的 gdef 不污染其他题或 AI 转写。 */
export const mathMacros: Record<string, string> = {
  '\\FTpair': '\\stackrel{\\mathcal{F}}{\\longleftrightarrow}',
  '\\LTpair': '\\stackrel{\\mathcal{L}}{\\longleftrightarrow}',
  '\\ZTpair': '\\stackrel{\\mathcal{Z}}{\\longleftrightarrow}',
  '\\Laplace': '\\mathcal{L}',
  '\\ZTrans': '\\mathcal{Z}',
  '\\conv': '\\mathbin{*}',
  '\\impulse': '\\delta(#1)',
  '\\step': 'u(#1)',
  '\\Sa': '\\operatorname{Sa}',
};

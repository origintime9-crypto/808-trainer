import type { Problem } from '../types';
import { MISTAKE_TAGS } from '../types';
import { problemScore, sourceLabel } from '../format';

/** 生成可粘贴到 ChatGPT 的批改提示词（配合手写作答照片使用） */
export function buildGradePrompt(p: Problem, scoreOverride?: number): string {
  const score = scoreOverride ?? problemScore(p);
  return [
    '你是中北大学 808 信号与系统的阅卷老师。我会给你一道题的题目、分值、标准答案和参考解答，并附上我手写作答的照片。请按下面的要求批改：',
    '1. 先转写我的关键步骤（公式用 LaTeX；看不清的地方写"[看不清]"，不要臆测）。',
    '2. 逐步判断对错，指出具体错在哪一步、为什么错。所有字段中的公式用 $...$ 或 $$...$$ 包围；没有提供题面分值时，不返回 score 或虚造总分。',
    '3. 给出评分档：0 = 空白或方法错误；1 = 方法对，但关键步骤或结果错；2 = 主要步骤都对，有小错；3 = 全对。方法与参考解答不同但正确的，同样给分。' +
      (score ? `另外按 ${score} 分给出估计得分。` : ''),
    `4. 从这五类错因中选出适用的：${MISTAKE_TAGS.join('、')}。`,
    '5. 给出一两条有针对性的改进建议。',
    '',
    `【题目】${sourceLabel(p)}`,
    ...(scoreOverride ? [`本次模拟卷题位满分 ${scoreOverride} 分（来自中北模板，不是原题分值）。`] : []),
    p.stem,
    ...(p.options ? p.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`) : []),
    '',
    '【标准答案】',
    p.answer,
    '',
    '【参考解答】',
    p.solution,
  ].join('\n');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 退回到 execCommand
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  return ok;
}

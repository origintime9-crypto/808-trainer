import type { AttemptEvent, Problem, ProblemInfo } from '../types';

// 指向既有知识卡片；不新建卡片 id，也不把补课任务伪造为已复习。
const prerequisites: Record<string, string[]> = {
  'delta-sift': ['c1-delta-sift', 'c1-delta-scale'],
  'sys-prop': ['c1-linear', 'c1-ti', 'c1-causal', 'c1-stable'],
  waveform: ['c1-transform-order'], period: ['c1-period-ct', 'c1-period-dt'],
  'conv-integral': ['c2-conv-props', 'c2-rect-conv'], 'conv-sum': ['c6-seq', 'c6-conv-sum'],
  'ft-basic': ['c3-ft-table', 'c3-gate-sa'], 'ft-property': ['c3-scale-shift', 'c3-freq-shift'],
  'fourier-series': ['c3-fs', 'c3-fs-sym'],
  'full-response-decomp': ['c2-decomp', 'c2-0minus'], 'ode-s-solve': ['c4-diff', 'c2-0minus'],
  'diff-eq-solve': ['c6-classical', 'c7-shift'],
  'laplace-calc': ['c4-roc', 'c4-pf'], 'z-calc': ['c7-roc', 'c7-pf'],
  'hz-roc-all': ['c7-roc', 'c7-pf', 'c7-causal-stable'],
  'ft-exist-from-Hs': ['c4-roc', 'c4-ft-exist'], 'zp-h0': ['c4-zp-K', 'c4-stable', 'c3-sine-steady'],
  'block-to-Hs': ['c4-block', 'c4-hs-ode'], 'ode-to-diagram': ['c4-hs-ode', 'c4-direct-form'],
  'discrete-diagram': ['c6-diagram', 'c7-shift'],
  nyquist: ['c5-sampling', 'c5-band-ops'], 'sample-hold': ['c5-sampling', 'c3-conv-thm'],
  'sine-steady': ['c3-sine-steady'], 'filter-output': ['c3-sine-steady', 'c3-distortionless'],
};
export const prerequisiteCards = (p: ProblemInfo | Problem) => 'prerequisites' in p && p.prerequisites?.length
  ? p.prerequisites : prerequisites[p.pattern ?? ''] ?? [];

const pitfalls: Record<string, string[]> = {
  'delta-sift': ['先检查冲激位置和积分区间；冲激恰在边界或乘跳变函数时，须说明约定。', 'δ(at−b) 的尺度系数是 1/|a|，不能漏掉绝对值。'],
  waveform: ['用原关键点 aτ+b=t₀ 反求新位置；每步只替换自变量，避免把平移量重复缩放。'],
  'conv-integral': ['积分限来自支撑区间交集；分段点由端点相遇决定，先写区间再积分。'],
  'conv-sum': ['输出起点是两起点之和；有限序列长度为 L₁+L₂−1，别把第一个样本当成 n=0。'],
  'ft-property': ['尺度变换同时改变频轴和幅度，幅度系数为 1/|a|。'],
  'laplace-calc': ['双边拉氏反变换必须附 ROC；同一代数式可对应不同的左右边信号。'],
  'z-calc': ['先说明双边还是单边 z 变换；初终值定理先核对序列与极点条件。'],
  'hz-roc-all': ['ROC 不含极点；只有 ROC 含整个单位圆时，稳定性与通常意义的频率响应才有依据。'],
  'ft-exist-from-Hs': ['先检查 ROC 是否含虚轴，再代 s=jω；未给因果性时不能仅凭极点正负决定 ROC。'],
  'zp-h0': ['由初值定理定增益前先核对条件；只有明确因果时，才可用“极点全在左半平面”判有理系统稳定。'],
  'full-response-decomp': ['初态变化只缩放零输入项；激励延时只平移零状态项，阶跃支撑必须一起移动。'],
  'ode-s-solve': ['0⁻ 与 0⁺ 不能混用；输入含冲激时先检查初态跳变，单边变换保留初始项。'],
  'diff-eq-solve': ['先用首样本和给定初态验算；全响应不能直接等同于 H(z)X(z) 的反变换。'],
  nyquist: ['先统一 Hz 与 rad/s；两信号相加取谱支撑的并集，相乘要计算谱卷积，不能一律套“带宽翻倍”。'],
  'sample-hold': ['理想脉冲抽样的谱副本间距是 ωs，幅度系数为 1/T；保持器还会改变包络。'],
  'filter-output': ['无失真条件为通带内 H(jω)=K e^(−jωt₀)；实 K 为负时允许 π 相位，不能机械要求相位图过原点。'],
  'sine-steady': ['正弦稳态用输入频率处的幅度和相位；它不包含启动暂态。'],
};

/** 首轮逐题复核的两级提示；其余题使用已有题型检查点，明确标为通用提示。 */
export const reviewedHints: Record<string, [string, string]> = {
  'zt2026-1-1': ['先定位冲激，再核对它是否位于积分区间内部。', String.raw`$t_0=\pi/3\in(0,\pi)$，只需计算 $t_0+\sin t_0$。`],
  'zt2026-1-2': ['先补上冲激所在点的连续极限，再用筛选性质。', String.raw`$\sin 2t/t=2\Sa(2t)$，应取 $t\to0$ 的极限，不能代成 $0/0$。`],
  'zt2026-3-3': ['先标两个序列的起点，再做逐点卷积。', String.raw`输出起点为 $-1$、长度为 $5$；$y(-1)=3$，$y(0)=3\cdot2+2\cdot1=8$。`],
  'zt2026-5-1': ['把时间尺度的变化与频谱幅度变化分别写下。', String.raw`通式为 $x(at)\FTpair |a|^{-1}X(j\omega/a)$，本题取 $a=2$。`],
  'zt2026-5-2': ['分别检查初值、终值定理的适用条件，再计算极限。', String.raw`分母为 $(z-1)(z+3/4)$；$z=1$ 是单极点，另一极点在单位圆内。`],
  'zt2026-6': ['把两次全响应分别写成零输入项与零状态项的线性组合。', String.raw`两式相减得 $y_{zs}=(e^{-t}-4\cos2t)u(t)$，再代回得到 $y_{zi}$。`],
  'zt2026-7': ['按题目采用的因果约定，先列极点和 ROC，再判断虚轴是否在内。', String.raw`三式极点分别为 $\{-1,-3\}$、$\{1\}$、$\{-1,-2\}$。若不约定因果，还需另给 ROC。`],
  'zt2026-8': ['先从 Sa 的频谱支撑求最高角频率，再换算为 Hz。', String.raw`$y_1$ 的 $\omega_m=100\pi$，$f_m=50\,\mathrm{Hz}$；相加后的 $\omega_m=200\pi$。`],
  'zt2026-9': ['先把 H(z) 改写为 z⁻¹ 形式，再用极点划分可能 ROC。', String.raw`$H(z)=\frac23[\frac z{z-2}-\frac z{z-1/2}]$，两个极点的模分别为 $2$ 和 $1/2$。`],
  'zt2026-10': ['由零极点写含 K 的系统函数，再用给定初值定 K。', String.raw`$H(s)=Ks/(s^2+2s+7/4)$，$\lim_{s\to\infty}sH(s)=K$；稳态角频率为 $\sqrt3/2$。`],
};

export function supportForProblem(p: Problem) {
  return { ...(reviewedHints[p.id] ? { hints: reviewedHints[p.id] } : {}),
    pitfalls: p.pitfalls ?? pitfalls[p.pattern ?? ''] ?? [], prerequisites: prerequisiteCards(p) };
}

export function errorRoutes(e: Pick<AttemptEvent, 'grade' | 'tags' | 'skillErrors' | 'score'>) {
  const failed = e.grade < 3 || !!e.score && e.score.earned < e.score.max;
  const concept = failed && (e.tags.includes('概念不清') || e.tags.includes('公式记错') || (e.skillErrors ?? []).some(id => ['roc-missing', 'roc-stability', 'initial-state', 'sampling-alias'].includes(id)));
  const method = failed && (e.tags.includes('方法不会') || e.skillErrors?.includes('method-selection'));
  const calculation = failed && (e.tags.includes('计算失误') || e.tags.includes('粗心审题') || e.skillErrors?.includes('transform-algebra'));
  return { failed, concept, method: !!method, calculation: !!calculation, backtrack: concept || failed && e.grade === 0 };
}

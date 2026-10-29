// 采用连续角频率 ω、离散归一化角频率 Ω；LT/ZT 默认双边。
export const transformColumns=['CTFT · 连续傅里叶','DTFT · 离散傅里叶','LT · 双边拉氏','ZT · 双边 z 变换'];
export const transformRows: {name:string;cells:string[]}[]=[
  {name:'定义',cells:[String.raw`$X(j\omega)=\int_{-\infty}^{\infty}x(t)e^{-j\omega t}dt$`,String.raw`$X(e^{j\Omega})=\sum_{n=-\infty}^{\infty}x[n]e^{-j\Omega n}$`,String.raw`$X(s)=\int_{-\infty}^{\infty}x(t)e^{-st}dt$`,String.raw`$X(z)=\sum_{n=-\infty}^{\infty}x[n]z^{-n}$`]},
  {name:'时移',cells:[String.raw`$x(t-t_0)\FTpair e^{-j\omega t_0}X(j\omega)$`,String.raw`$x[n-n_0]\FTpair e^{-j\Omega n_0}X(e^{j\Omega})$，$n_0\in\mathbb Z$`,String.raw`$x(t-t_0)\LTpair e^{-st_0}X(s)$`,String.raw`$x[n-n_0]\ZTpair z^{-n_0}X(z)$；ROC 的 $0,\infty$ 端点可能变化。`]},
  {name:'频移 / 指数加权',cells:[String.raw`$e^{j\omega_0t}x(t)\FTpair X(j(\omega-\omega_0))$`,String.raw`$e^{j\Omega_0n}x[n]\FTpair X(e^{j(\Omega-\Omega_0)})$`,String.raw`$e^{at}x(t)\LTpair X(s-a)$；ROC 随 $\Re a$ 平移。`,String.raw`$\alpha^n x[n]\ZTpair X(z/\alpha)$，$\alpha\ne0$；ROC 半径乘 $|\alpha|$。`]},
  {name:'尺度 / 抽取',cells:[String.raw`$x(at)\FTpair \frac1{|a|}X(j\omega/a)$，实数 $a\ne0$。`,String.raw`整数 $M>0$：$x[Mn]$ 的 DTFT 为 $\frac1M\sum_{k=0}^{M-1}X(e^{j(\Omega+2\pi k)/M})$。`,String.raw`$x(at)\LTpair \frac1{|a|}X(s/a)$，实数 $a\ne0$；ROC 按 $s/a$ 映射。`,String.raw`离散抽取不能套连续尺度公式。反褶：$x[-n]\ZTpair X(z^{-1})$；ROC 半径取倒数。`]},
  {name:'时域卷积',cells:[String.raw`$x*h\FTpair X(j\omega)H(j\omega)$`,String.raw`$x*h\FTpair X(e^{j\Omega})H(e^{j\Omega})$`,String.raw`$x*h\LTpair X(s)H(s)$；ROC 至少含原 ROC 的交集，消去极点时可能扩大。`,String.raw`$x*h\ZTpair X(z)H(z)$；ROC 至少含原 ROC 的交集，消去极点时可能扩大。`]},
  {name:'微分 / 一阶差分',cells:[String.raw`$x'(t)\FTpair j\omega X(j\omega)$；边界项需消失或采用广义变换。`,String.raw`$x[n]-x[n-1]\FTpair (1-e^{-j\Omega})X(e^{j\Omega})$`,String.raw`双边：$x'(t)\LTpair sX(s)$（边界项消失）。单边见下方初态说明。`,String.raw`双边：$x[n]-x[n-1]\ZTpair(1-z^{-1})X(z)$；单边需保留初始样本。`]},
  {name:'ROC 与存在性',cells:[String.raw`绝对可积可保证通常 FT 存在。LT 的 ROC 含虚轴时可令 $s=j\omega$；广义频谱另论。`,String.raw`绝对可和可保证通常 DTFT 存在。ZT 的 ROC 含单位圆时可令 $z=e^{j\Omega}$。`,String.raw`ROC 是竖直条带，不含极点。右边有理信号通常为最右极点右侧；LTI 稳定时 ROC 包含虚轴。`,String.raw`ROC 是以原点为中心的圆环，不含极点。有理右边序列在最外极点外侧；LTI 稳定时 ROC 包含单位圆。`]},
];
export const transformConditions=String.raw`**先说明变换口径。** 本表 LT/ZT 采用双边，不能直接拿来消去初态。以从 $0^-$ 开始的单边拉氏为例：

$$\Laplace\{x'(t)\}=sX(s)-x(0^-).$$

CTFT 的 $\omega$ 单位为 rad/s；DTFT 的 $\Omega$ 单位为 rad/sample、以 $2\pi$ 为周期。ROC 必须和代数式一起写。稳定性通常指 BIBO；因果有理系统才能进一步使用“连续极点全在左半平面 / 离散极点全在单位圆内”的快捷判据，且须排除不合条件的多项式微分项。`;

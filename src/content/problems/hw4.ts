import type { Problem } from '../../types';
import { problem as make } from './helper';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make('hw4', ...args);
const r = String.raw;
const trans: [string, string, string, Partial<Problem>?][] = [
  [r`(1-e^{-at})u(t)/a,\quad a>0`, r`1/[s(s+a)]`, r`分别变换常数与指数：$(1/a)[1/s-1/(s+a)]$。`],
  [r`e^{-t}u(t-2)`, r`e^{-2(s+1)}/(s+1)`, r`原信号等于 $e^{-2}e^{-(t-2)}u(t-2)$，时移因子外还要保留 $e^{-2}$。`],
  [r`e^{-t}[u(t)-u(t-2)]`, r`[1-e^{-2(s+1)}]/(s+1)`, r`直接积分 $\int_0^2e^{-(s+1)t}dt$，$s=-1$ 为可去奇点。`],
  [r`[s_1e^{-s_1t}-s_2e^{-s_2t}]u(t)/(s_1-s_2),\quad s_1\ne s_2`, r`s/[(s+s_1)(s+s_2)]`, r`合并 $\{s_1/(s+s_1)-s_2/(s+s_2)\}/(s_1-s_2)$。`],
  [r`[e^{-\alpha t}-e^{-\beta t}]u(t)/(\beta-\alpha),\quad\alpha\ne\beta`, r`1/[(s+\alpha)(s+\beta)]`, r`两指数变换相减，分子为 $\beta-\alpha$，约去常系数。`],
  [r`te^{-t}u(t)`, r`1/(s+1)^2`, r`对 $1/(s+1)$ 作 $-d/ds$，或直接积分。`],
  [r`[e^{-3t}-e^{-4t}]u(t)/t`, r`\ln[(s+4)/(s+3)]`, r`用时域除以 $t$ 的性质：$\int_s^\infty[1/(\sigma+3)-1/(\sigma+4)]d\sigma$。$t=0$ 为可去点。`],
  [r`(1-e^{-at})u(t)/t,\quad a>0`, r`\ln[(s+a)/s]`, r`积分 $\int_s^\infty[1/\sigma-1/(\sigma+a)]d\sigma$，默认在收敛半平面连续选对数分支。`],
  [r`e^{-t}\sin2t\,u(t)`, r`2/[(s+1)^2+4]`, r`正弦变换 $2/(s^2+4)$，再将 $s$ 替换为 $s+1$。`],
  [r`(\sin t+2\cos t)u(t)`, r`(1+2s)/(s^2+1)`, '利用线性分别变换正弦和余弦。'],
  [r`\sin(at)u(t)/t,\quad a>0`, r`\arctan(a/s)`, r`积分 $\int_s^\infty a/(\sigma^2+a^2)d\sigma$。正实 $s$ 时等于 $\pi/2-\arctan(s/a)$。`],
  [r`t^2\cos2t\,u(t)`, r`2s(s^2-12)/(s^2+4)^3`, r`对余弦的变换 $s/(s^2+4)$ 求二阶 $s$ 导数，二次乘 $t$ 的负号抵消。`],
  [r`(1-\cos\alpha t)e^{-\beta t}u(t)`, r`\alpha^2/\{(s+\beta)[(s+\beta)^2+\alpha^2]\}`, r`在 $1/s-s/(s^2+\alpha^2)$ 中将 $s$ 换成 $s+\beta$，再合并。`],
  [r`e^{-t+2}u(t-2)`, r`e^{-2s}/(s+1)`, r`这是 $e^{-t}u(t)$ 整体延时 2，指数已写成 $-(t-2)$。`],
  [r`\sin t\,u(t-2)`, r`e^{-2s}(s\sin2+\cos2)/(s^2+1)`, r`写为 $\sin[(t-2)+2]u(t-2)$，展开为 $\cos(t-2)\sin2+\sin(t-2)\cos2$。余弦项的变换分子必须含 $s$。`, { verified: 'corrected', note: '纸书第 98 页最终变换的 sin2 项漏乘 s，变成 sin2+cos2。按时移、差角及直接积分更正。' }],
  [r`e^{-at}\sin(\beta t+\theta)u(t)`, r`[\beta\cos\theta+(s+a)\sin\theta]/[(s+a)^2+\beta^2]`, '先展开正弦初相，再用指数平移。'],
  [r`t\cos^3(3t)u(t)`, r`\frac14[3(s^2-9)/(s^2+9)^2+(s^2-81)/(s^2+81)^2]`, r`$\cos^3(3t)=[3\cos3t+\cos9t]/4$；对变换作 $-d/ds$。`],
  [r`e^{-t/a}x(t/a),\quad a>0,\quad x(t)\text{因果},\ x\leftrightarrow X(s)`, r`aX(as+1)`, r`时域展宽给 $aX(as)$，再用指数平移 $s\mapsto s+1/a$。`],
  [r`e^{-at}x(t/a),\quad a>0,\quad x(t)\text{因果},\ x\leftrightarrow X(s)`, r`aX[a(s+a)]`, r`展宽给 $aX(as)$，指数衰减使 $s\mapsto s+a$。`],
  [r`e^{-t/a}x(at)u(t),\quad a>0,\quad x(t)\text{因果},\ x\leftrightarrow X(s)`, r`X(s/a+1/a^2)/a`, r`压缩给 $X(s/a)/a$，再把 $s$ 换成 $s+1/a$；自变量变为 $(s+1/a)/a$。`, { verified: 'corrected', note: '纸书第 98 页写成 X(a/s+1/a²)/a，倒置了尺度后的自变量。应为 X(s/a+1/a²)/a。尺度题按教材隐含的 a>0、因果信号约定。' }],
  [r`e^{-(t+a)}\cos(\omega_0t)u(t)`, r`e^{-a}(s+1)/[(s+1)^2+\omega_0^2]`, r`$e^{-a}$ 是常系数，并非时移；$e^{-t}$ 使频域变量加 1。`],
  [r`2\delta(t)-3e^{-7t}u(t)`, r`2-3/(s+7)`, '冲激变换为常数 1，指数用对应变换。'],
  [r`2\delta(t-t_0)+3\delta(t),\quad t_0\ge0`, r`2e^{-st_0}+3`, '每个冲激变换为其强度乘时间位置的指数因子。'],
  [r`(t^3+t^2+t+1)u(t)`, r`6/s^4+2/s^3+1/s^2+1/s`, r`使用 $t^nu(t)\leftrightarrow n!/s^{n+1}$，分别代入 3、2、1、0。`],
];
const zp = r`因果系统零点 $s=0$，极点 $-1\pm j\sqrt3/2$，$h(0^+)=2$（图 4.19）。`;
const block21 = r`因果零状态系统图 4.21：上支路串联 $H_1=1/(s+2),H_2=2/(s+3)$，下支路 $h_3=\delta(t)$；两支路相加。`;
const block22 = r`图 4.22 是正反馈，前向 $G(s)=K/(s^2+2s+2)$，反馈 $B(s)=1/(s+3)$；$K$ 为实数。`;

export const hw4: Problem[] = [
  ...trans.map(([signal, result, method, extra], i) => p('4.1('+(i+1)+')', ['4.1', '4.2'], 'laplace-calc', '求拉普拉斯变换：$'+signal+'$。', '$X(s)='+result+'$。', method, extra)),
  p('4.3(1)', ['4.2'], 'laplace-calc', r`因果信号 $F(s)=(s-6)/[(s+2)(s+5)]$，求初值和终值。`, '$f(0^+)=1$，$f(\\infty)=0$。', r`$sF(s)$ 的极点均在左半平面，可用终值定理。分别求 $\lim_{s\to\infty}sF$ 与 $\lim_{s\to0}sF$。`),
  p('4.3(2)', ['4.2'], 'laplace-calc', r`因果信号 $F(s)=10(s+2)/[s(s+5)]$，求初值和终值。`, '$f(0^+)=10$，$f(\\infty)=4$。', r`$sF=10(s+2)/(s+5)$，极点 $-5$ 满足终值条件。反变换为 $(4+6e^{-5t})u(t)$，可直接检查两端。`, { verified: 'corrected', note: '纸书第 100 页终值写为 0；代入 s=0 及反变换都得到 4。' }),
  p('4.3(3)', ['4.2'], 'laplace-calc', r`因果信号 $F(s)=1/(s+3)^3$，求初值和终值。`, '初值 0，终值 0。', r`逆变换为 $t^2e^{-3t}u(t)/2$；$sF$ 的极点在左半平面，初终值定理均可用。`),
  p('4.3(4)', ['4.2'], 'laplace-calc', r`因果信号 $F(s)=(s+3)/[(s+1)^2(s+2)]$，求初值和终值。`, '初值 0，终值 0。', r`$sF$ 在 $\infty$ 和 0 均趋于 0，且其所有极点实部严格为负，终值定理有效。`),
  p('4.5(1)', ['4.2'], 'laplace-calc', r`因果 $x(t)\leftrightarrow X(s)$，求 $e^{-2t}x(2t)$ 的 LT。`, r`$\frac12X[(s+2)/2]$。`, '先时间压缩，再做指数频移。'),
  p('4.5(2)', ['4.2'], 'laplace-calc', r`因果 $x(t)\leftrightarrow X(s)$，求 $(t-2)^2x(t/2-1)$ 的 LT。$X''$ 表示对自变量求二阶导数。`, r`$8e^{-2s}X''(2s)$。`, r`先对 $t^2x(t/2)$ 变换：$\frac{d^2}{ds^2}[2X(2s)]=8X''(2s)$，再将整个信号延时 2。`, { verified: 'corrected', note: '原题在第 101 页是 (t−2)²，资料第 102 页解答按一次幂计算，漏掉平方。按二阶频域微分更正。' }),
  p('4.5(3)', ['4.2'], 'laplace-calc', r`因果 $x(t)\leftrightarrow X(s)$，求 $te^{-t}x(3t)$ 的 LT。$X'$ 表示对自变量的导数。`, r`$-\frac19X'[(s+1)/3]$。`, r`不含 $t$ 的变换为 $X[(s+1)/3]/3$，对整个式子取 $-d/ds$，链式求导再产生 $1/3$。`),
  p('4.5(4)', ['4.2'], 'laplace-calc', r`因果 $x(t)\leftrightarrow X(s)$，$a>0,b>0$，求 $x(at-b)$ 的 LT。`, r`$\frac1a e^{-bs/a}X(s/a)$。`, r`$x[a(t-b/a)]$ 是压缩后的信号延时 $b/a$。`),
  p('4.11(1)', ['4.5', '2.2'], 'ode-s-solve', r`$y'+ay=x$，$x=e^{-at}u(t)$，$y(0^-)=C$。求 H(s)、零输入、零状态和全响应。`, r`$H=1/(s+a)$；$y_{zi}=Ce^{-at}u(t)$，$y_{zs}=te^{-at}u(t)$，$y=(C+t)e^{-at}u(t)$。`, r`单边变换 $(s+a)Y=C+1/(s+a)$；初值项和输入项分别反变换。输入极点与系统极点重合产生 $te^{-at}$。`),
  p('4.11(2)', ['4.5', '2.2'], 'ode-s-solve', r`$y'+2y=x$，$x=\sin(\omega_0t)u(t)$，$y(0^-)=1$。求 H(s)、零输入、零状态和全响应。`, r`$H=1/(s+2)$，$y_{zi}=e^{-2t}u(t)$；$y_{zs}=[\omega_0(e^{-2t}-\cos\omega_0t)+2\sin\omega_0t]u(t)/(4+\omega_0^2)$；全响应为两者相加。`, r`$Y_{zs}=\omega_0/[(s+2)(s^2+\omega_0^2)]$，部分分式分成一阶指数项及正弦、余弦项。初始状态单独给 $Y_{zi}=1/(s+2)$。`),
  p('4.11(3)', ['4.5', '2.2'], 'ode-s-solve', r`$y''+5y'+4y=2x'+5x$，$x=e^{-2t}u(t)$，$y(0^-)=2,y'(0^-)=5$。求 H(s)、零输入、零状态和全响应。`, r`$H=(2s+5)/[(s+1)(s+4)]$；$y_{zi}=(13e^{-t}/3-7e^{-4t}/3)u(t)$，$y_{zs}=(e^{-t}-e^{-2t}/2-e^{-4t}/2)u(t)$；$y=(16e^{-t}/3-e^{-2t}/2-17e^{-4t}/6)u(t)$。`, r`单边变换初值项为 $(2s+15)/[(s+1)(s+4)]$，输入项为 $(2s+5)/[(s+1)(s+2)(s+4)]$。输入含阶跃，导数含冲激，$y'(0^+)=5+2=7$，可检查全响应。`),
  p('4.11(4)', ['4.5', '2.2'], 'ode-s-solve', r`$y'''+3y''+2y'=4x+x'$，$x=u(t)$，$y(0^-)=1,y'(0^-)=0,y''(0^-)=1$。求 H(s)、零输入、零状态和全响应。`, r`$H=(s+4)/[s(s+1)(s+2)]$；$y_{zi}=(3/2-e^{-t}+e^{-2t}/2)u(t)$，$y_{zs}=(2t-5/2+3e^{-t}-e^{-2t}/2)u(t)$；$y=(2t-1+2e^{-t})u(t)$。`, r`初值项分子为 $s^2+3s+3$；输入项再除以 $s$。两部分正确相加后，$e^{-2t}$ 项消去，常数 $3/2-5/2=-1$，$e^{-t}$ 系数为 2；检查 $y(0^+)=1,y'(0^+)=0$。`, { verified: 'corrected', note: '纸书第 110 页最后的全响应相加错误，写为 −2e⁻ᵗ−5/2+2t，连初值都不满足。两部分相加应为 2t−1+2e⁻ᵗ。' }),
  p('4.18(1)', ['3.7', '4.6'], 'sine-steady', r`因果 $H(s)=(s+2)/(s^2+4s+3)$，输入 $5\cos(2t+\pi/6)u(t)$，求正弦稳态响应。`, r`$5\sqrt{8/65}\cos[2t+\pi/6-\arctan(9/7)]$。`, r`极点 $-1,-3$ 保证暂态衰减。$H(j2)=(14-18j)/65$，模 $\sqrt{8/65}$，相角 $-\arctan(9/7)$。输入幅度 5 必须乘入。`, { verified: 'corrected', note: '纸书第 115 页输出幅度写为约 0.35，漏乘输入的 5；正确幅度约 1.754。' }),
  p('4.18(2)', ['3.7', '4.6'], 'sine-steady', r`因果 $H(s)=(s+2)/(s^2+4s+3)$，输入 $10\sin(3t+\pi/4)u(t)$，求正弦稳态响应。`, r`$\frac{\sqrt{65}}3\sin[3t+\pi/4-\arctan(7/4)]$。`, r`$H(j3)=(4-7j)/30$，模为 $\sqrt{65}/30$，相角 $-\arctan(7/4)$。乘输入幅度 10 后为 $\sqrt{65}/3$。`, { verified: 'corrected', note: '纸书第 115 页输出幅度写为约 0.27，漏乘输入的 10；正确幅度约 2.687。' }),
  p('4.19(1)', ['4.6', '4.2'], 'zp-h0', zp+'求系统函数。', r`$H(s)=2s/(s^2+2s+7/4)$。`, r`先由根写 $Ks/[(s+1)^2+3/4]$，初值定理给 $K=2$。`),
  p('4.19(2)', ['4.6', '3.7'], 'zp-h0', zp+'求频率响应。', r`$H(j\omega)=2j\omega/(7/4-\omega^2+2j\omega)$。`, '因果 ROC 包含虚轴，代入 s=jω。'),
  p('4.19(3)', ['4.6', '4.3'], 'zp-h0', zp+'求冲激响应。', r`$h=e^{-t}[2\cos(\sqrt3t/2)-4\sin(\sqrt3t/2)/\sqrt3]u(t)$。`, r`把分子写成 $2(s+1)-2$，分别匹配余弦与正弦变换。初值必须为 2。`),
  p('4.19(4)', ['4.6', '3.7'], 'zp-h0', zp+r`输入 $\sin(\sqrt3t/2)u(t)$，求正弦稳态响应。`, r`$\frac{\sqrt3}2\sin(\sqrt3t/2+\pi/6)$。`, r`$H(j\sqrt3/2)=j\sqrt3/(1+j\sqrt3)$，相位为 $\pi/2-\pi/3=\pi/6$。`),
  p('4.21(1)', ['4.6', '4.3'], 'block-to-Hs', block21+'求系统函数和冲激响应。', r`$H=1+2/[(s+2)(s+3)]$，$h=\delta(t)+2(e^{-2t}-e^{-3t})u(t)$。`, '串联相乘、并联相加；常数 1 对应直接通路的冲激。', { figures: ['figures/hw4/q21.png'] }),
  p('4.21(2)', ['4.5', '2.3'], 'block-to-Hs', block21+r`输入 $u(t)$，求零状态响应。`, r`$y_{zs}=(4/3-e^{-2t}+2e^{-3t}/3)u(t)$。`, r`$Y=H/s$。部分分式为 $4/(3s)-1/(s+2)+2/[3(s+3)]$；$y(0^+)=1$ 来自直接支路，终值 $H(0)=4/3$。`, { figures: ['figures/hw4/q21.png'] }),
  p('4.22(1)', ['4.6'], 'routh', block22+'求闭环系统函数。', r`$H(s)=K(s+3)/(s^3+5s^2+8s+6-K)$。`, r`正反馈 $H=G/(1-GB)$，乘开 $(s^2+2s+2)(s+3)-K$ 得分母。`, { figures: ['figures/hw4/q22.png'] }),
  p('4.22(2)', ['4.7'], 'routh', block22+'求稳定时 K 的范围。', '$-34<K<6$。', r`三阶劳斯第一列为 $1,5,(34+K)/5,6-K$。全为正要求 $K>-34$ 且 $K<6$。若另限定正增益，才进一步取 $0<K<6$。`, { figures: ['figures/hw4/q22.png'] }),
  p('4.22(3)', ['4.7', '4.3'], 'routh', block22+'在临界稳定边界求冲激响应。', r`$K=-34$：$\frac{34}{33}[2e^{-5t}-2\cos(2\sqrt2t)-\frac{23}{2\sqrt2}\sin(2\sqrt2t)]u(t)$；

$K=6$：$\{9/4+e^{-5t/2}[-9\cos(\sqrt7t/2)/4+3\sin(\sqrt7t/2)/(4\sqrt7)]\}u(t)$。`, r`在 $K=-34$，分母为 $(s+5)(s^2+8)$，出现纯虚极点；在 $K=6$，分母为 $s(s^2+5s+8)$，出现原点极点。两端都在内部渐近稳定区的边界，均不满足 BIBO 稳定；分别作部分分式。`, { figures: ['figures/hw4/q22.png'], verified: 'corrected', note: '资料第 119 页只计算 K=−34，遗漏同样处于临界边界的 K=6。完整范围的两端都应检查。' }),
];

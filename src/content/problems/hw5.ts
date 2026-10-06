import { problem as make } from './helper';
const p = (...args: Parameters<typeof make> extends [string, ...infer R] ? R : never) => make('hw5', ...args);
const r = String.raw;

export const hw5 = [
  p('5.2(1)', ['5.2', '3.4'], 'nyquist', r`求 $x(t)=\mathrm{Sa}(50t)$ 的最低抽样频率和奈奎斯特间隔，$\mathrm{Sa}(v)=\sin v/v$。`, r`$f_N=50/\pi$ Hz，$T_N=\pi/50$ s。`, r`$\mathrm{Sa}(at)$ 的矩形谱位于 $|\omega|<a$。最高角频率 $\omega_m=50$，换成 Hz 后 $f_m=\omega_m/(2\pi)$；$f_N=2f_m=\omega_m/\pi$，$T_N=1/f_N$。`),
  p('5.2(2)', ['5.2', '3.4'], 'nyquist', r`求 $x(t)=\mathrm{Sa}^2(100t)$ 的最低抽样频率和奈奎斯特间隔。`, r`$f_N=200/\pi$ Hz，$T_N=\pi/200$ s。`, r`时域平方对应两矩形谱卷积，支撑由 $[-100,100]$ 扩大为 $[-200,200]$，是三角谱。$\omega_m=200$，再用 $f_N=\omega_m/\pi$。`),
  p('5.2(3)', ['5.2', '3.4'], 'nyquist', r`求 $x(t)=\mathrm{Sa}(50t)+\mathrm{Sa}(100t)$ 的最低抽样频率和奈奎斯特间隔。`, r`$f_N=100/\pi$ Hz，$T_N=\pi/100$ s。`, r`频谱相加，取两个支撑的并集；最高角频率为 $\max(50,100)=100$。不是把两个带宽相加。`),
  p('5.2(4)', ['5.2', '3.4'], 'nyquist', r`求 $x(t)=\mathrm{Sa}(100t)+\mathrm{Sa}^2(60t)$ 的最低抽样频率和奈奎斯特间隔。`, r`$f_N=120/\pi$ Hz，$T_N=\pi/120$ s。`, r`两项的最高角频率为 100 和 $2\times60=120$。相加取最大值，得 $f_N=120/\pi$。最低频率是理想抽样极限，实际留裕量可取严格大于此值。`),
];

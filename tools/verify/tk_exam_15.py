"""课程15：从p62..64原题独立计算，包含同题来源及错误4π命题。"""
from common import *

v = Symbol('v', real=True)
omega = Symbol('omega', real=True)
ell = Symbol('ell', integer=True)
period = Symbol('period', positive=True)
K = Symbol('K', real=True)
a = Symbol('a')
q = Symbol('q')
rho = Symbol('rho')

delay = Symbol('delay', real=True)
gain = Symbol('gain', real=True)
arbitrary = Function('f')
eq('一1 无失真冲激核实现任意输入整体平移', integrate(arbitrary(t-v)*gain*DiracDelta(v-delay), (v, -oo, oo)), gain*arbitrary(t-delay))
eq('一1 延时冲激的FT相位', integrate(gain*DiracDelta(v-delay)*exp(-I*omega*v), (v, -oo, oo)), gain*exp(-I*omega*delay))
g = 1-exp(-2*t)
eq('一2 阶跃导数的普通部分', diff(g, t), 2*exp(-2*t))
eq('一2 阶跃起点无额外冲激', g.subs(t, 0), 0)
eq('一2 导数LT等于sG', lt(diff(g, t)), s*lt(g))
F = (4*s+5)/(2*s+1)
regular = Rational(3, 2)*exp(-t/2)
eq('一3 分离2δ的常数项', F, 2+lt(regular))
eq('一3 常规右初值属于普通部分', limit(regular, t, 0, dir='+'), Rational(3, 2))
eq('一3 去除冲激后初值定理', limit(s*(F-2), s, oo), Rational(3, 2))
check('一3 直接套sF的极限不满足有限初值条件', limit(s*F, s, oo) == oo)
eq('一3 普通尾部终值', limit(regular, t, oo), 0)
eq('一3 s趋零的终值口径', limit(s*F, s, 0), 0)
eq('一4 有限斜坡的频谱DC', integrate(3*v, (v, 0, 1)), Rational(3, 2))
samples = {-3: 8, 0: -2, 1: 1, 2: -1}
eq('一5 逐下标定义双边Z变换', sum(value*z**(-k) for k, value in samples.items()), 8*z**3-2+1/z-1/z**2)
check('一5 正幂确为负下标提前3拍', samples[-3] == 8 and -3 not in range(0, 3))
weighted = rho*diff(1/(1-rho), rho)
eq('一6 几何级数导数产生k权重', weighted, rho/(1-rho)**2)
eq('一6 以a/z代公比的Z式', weighted.subs(rho, a/z), a*z/(z-a)**2)
check('一6 a0序列全零不保留假极点', all(k*Integer(0)**k == 0 for k in range(20)))
eq('一7 Sa100的临界角采样率', 2*100, 200)
eq('一7 Hz与角频率换算', 200/(2*pi), 100/pi)
eq('一7 奈奎斯特间隔秒', 2*pi/200, pi/100)
eq('一8 稳定左边核的绝对和', summation(Rational(1, 2)**n, (n, 1, oo)), 1)
eq('一8 左边核的Z及圆外极点反例', (-rho/(1-rho)).subs(rho, z/2), z/(z-2))
check('一8 圆外极点2的左ROC包含整个单位圆', 1 < 2)
eq('一9 实正交的定义积分例子', integrate(sin(v)*cos(v), (v, 0, 2*pi)), 0)
eq('一9 复内积须共轭才得到正的自身范数', integrate(exp(I*v)*conjugate(exp(I*v)), (v, 0, 2*pi)), 2*pi)
eq('一9 漏共轭会错误判自身正交', integrate(exp(I*v)**2, (v, 0, 2*pi)), 0)
eq('一10 周期冲激串单周期FS定义', integrate(DiracDelta(v)*exp(-I*ell*2*pi*v/period), (v, -period/2, period/2))/period, 1/period)

# 七项滑动和从实际输入样本和单位样值直接核对。
lags = list(range(-1, 6))
ff = {0: 2, 2: -1, 3: 4}
gg = {-1: 1, 1: -3}
def sliding(fun, k):
    return sum(fun(k+r) for r in lags)

check('二1 任意样本和满足线性叠加', all(sliding(lambda j: 2*ff.get(j, 0)-3*gg.get(j, 0), k) == 2*sliding(lambda j: ff.get(j, 0), k)-3*sliding(lambda j: gg.get(j, 0), k) for k in range(-10, 12)))
check('二1 输入移位与输出移位一致', all(sliding(lambda j: ff.get(j-3, 0), k) == sliding(lambda j: ff.get(j, 0), k-3) for k in range(-10, 12)))
hslide = {k: sliding(lambda j: int(j == 0), k) for k in range(-8, 9)}
check('二1 单位核支撑负5至正1', [k for k in hslide if hslide[k]] == list(range(-5, 2)))
check('二1 未来输入造成非因果', hslide[-5] == 1)
eq('二1 七点核绝对和给稳定幅度界', sum(abs(value) for value in hslide.values()), 7)
check('二1 当前外还有样本故有记忆', hslide[1] != 0)

def parallel_h(k):
    return int(k == 0)+Rational(1, 2)**(k-2)*u(k-2)

check('二2 时域串联δ延时两拍后再加直通', all(parallel_h(k) == int(k == 0)+sum(int(m == 2)*Rational(1, 2)**(k-m)*u(k-m) for m in range(-8, 21)) for k in range(-4, 15)))
check('二2 首三个单位样值', [parallel_h(k) for k in range(3)] == [1, 0, 1])
eq('二2 系统函数两条并联通路', 1+q**2/(1-q/2), (1-q/2+q*q)/(1-q/2))

# −K是前向支路增益，两加法器入口都相加。
forward = 1-K/(s+3)
unknown = Symbol('unknown')
inferred = solve(Eq(forward/(1-forward*unknown), 2), unknown)[0]
H2 = (s+3+K)/(2*(s+3-K))
eq('二3 正反馈总H2反解', inferred, H2)
eq('二3 代回原闭环总H为2', forward/(1-forward*H2), 2)
eq('二3 H2分离直通和实际一阶核', H2, Rational(1, 2)+K/(s+3-K))
eq('二3 K0实际约消为常量', H2.subs(K, 0), Rational(1, 2))
eq('二3 未约消的一般极点', (s+3-K).subs(s, K-3), 0)
check('二3 K3不衰减核的绝对积分', integrate(3, (t, 0, oo)) == oo)
eq('二3 K4非因果稳定核的绝对积分', integrate(4*exp(v), (v, -oo, 0)), 4)
eq('二3 K4代回仍是形式闭环2', (forward/(1-forward*H2)).subs(K, 4), 2)

# 输入级数是周期分布；在每个冲激位置cos因子恰为1。
eq('二4 冲激位置的调制因子', cos(2*pi*ell), 1)
eq('二4 邻线两个半强度相加为原强度', Rational(1, 2)*(2*pi+2*pi), 2*pi)
check('二4 低通只留下0和正负1', [j for j in range(-5, 6) if abs(j) < Rational(3, 2)] == [-1, 0, 1])
eq('二4 留下三个指数后的实输出', exp(-I*t)+1+exp(I*t), 1+2*cos(t))
eq('二5 矩形谱按定义逆回Sa', integrate(pi*exp(I*omega*t), (omega, -1, 1))/(2*pi), sin(t)/t)
eq('二5 Parseval定义的频域总能量', integrate(pi*pi, (omega, -1, 1))/(2*pi), pi)
eq('二5 独立时域能量定义积分', 2*integrate(sin(t)**2/t**2, (t, 0, oo)), pi)

# 图A4，内部+3/−2反馈且输出为w+4w上一拍。
Hq = (1+4*q)/(1-3*q+2*q*q)
eq('三1 原图系统函数独立因式分解', Hq, (1+4*q)/((1-q)*(1-2*q)))
eq('三1 单位核部分分式', Hq, -5/(1-q)+6/(1-2*q))
eq('三1 单边初态分子', 3*(-1)-2*2-2*q*(-1), -7+2*q)
eq('三1 零输入Z分式', (-7+2*q)/((1-q)*(1-2*q)), 5/(1-q)-12/(1-2*q))
eq('三1 输入4幂的零状态Z分式', Hq/(1-4*q), Rational(5, 3)/(1-q)-6/(1-2*q)+Rational(16, 3)/(1-4*q))
def zi1(k):
    return {-1: -1, -2: 2}.get(k, (5-12*2**k)*u(k))
def zs1(k):
    return (Rational(5, 3)-6*Integer(2)**k+Rational(16, 3)*Integer(4)**k)*u(k)
def full1(k):
    return zi1(k)+zs1(k)
def h1(k):
    return (-5+6*Integer(2)**k)*u(k)
recurrence('三1 零输入代原初态齐次差分', zi1, [1, -3, 2], lambda k: 0, lo=0)
recurrence('三1 零状态代原输入与延时', zs1, [1, -3, 2], lambda k: Integer(4)**k*u(k)+4*Integer(4)**(k-1)*u(k-1))
recurrence('三1 完全响应含负1负2初态', full1, [1, -3, 2], lambda k: Integer(4)**k*u(k)+4*Integer(4)**(k-1)*u(k-1), lo=0)
recurrence('三1 单位样值代原输入输出方程', h1, [1, -3, 2], lambda k: int(k == 0)+4*int(k == 1))
eq('三1 完全响应首样本', full1(0), -6)
A = Matrix([[0, 1], [-2, 3]])
B = Matrix([0, 1])
C = Matrix([[-2, 7]])
eq('三1 状态与输出含直通回算H', (C*(z*eye(2)-A).inv()*B)[0]+1, Hq.subs(q, 1/z))
wm3, wm2, wm1 = symbols('wm3 wm2 wm1')
states = solve([wm1+4*wm2+1, wm2+4*wm3-2, wm1-3*wm2+2*wm3], [wm3, wm2, wm1])
check('三1 由输出初态独立恢复内部状态', states[wm2] == 0 and states[wm1] == -1)
eq('三1 状态初值给输出首样本', (C*Matrix([states[wm2], states[wm1]]))[0]+1, full1(0))

# 第二综合题的输入基数2与实际极点2共振。
den = (1-2*q)*(1-3*q)
Hq2 = q/den
eq('三2 系统函数交叉相乘', Hq2*(1-5*q+6*q*q), q)
eq('三2 原给初态分子', 5*1-6*1-6*q*1, -1-6*q)
eq('三2 零输入部分分式', (-1-6*q)/den, 8/(1-2*q)-9/(1-3*q))
eq('三2 共振零状态保留二重极点', Hq2/(1-2*q), 3/(1-3*q)-3/(1-2*q)-2*q/(1-2*q)**2)
def zi2(k):
    return {-1: 1, -2: 1}.get(k, (8*Integer(2)**k-9*Integer(3)**k)*u(k))
def zs2(k):
    return (3*Integer(3)**k-(k+3)*Integer(2)**k)*u(k)
def full2(k):
    return zi2(k)+zs2(k)
def h2(k):
    return (Integer(3)**k-Integer(2)**k)*u(k)
recurrence('三2 零输入含题给两负下标初态', zi2, [1, -5, 6], lambda k: 0, lo=0)
recurrence('三2 共振零状态回原差分', zs2, [1, -5, 6], lambda k: Integer(2)**(k-1)*u(k-1))
recurrence('三2 完全响应回原输入及初态', full2, [1, -5, 6], lambda k: Integer(2)**(k-1)*u(k-1), lo=0)
recurrence('三2 单位核保留输入一拍延时', h2, [1, -5, 6], lambda k: int(k == 1))
check('三2 完全响应前三点', [full2(k) for k in range(3)] == [-1, -10, -42])
check('三2 单位样值前三点', [h2(k) for k in range(3)] == [0, 1, 5])
check('三2 因果实际极点2和3不在单位圆内', roots(z*z-5*z+6, z) == {2, 3})
finish()

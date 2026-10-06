"""课程题库 05：独立积分、卷积、框图回算、初态及频率选择核对。"""
from common import *
from sympy.discrete.convolutions import convolution

v = Symbol('v', real=True)
q = Symbol('q', real=True)
omega = Symbol('omega', real=True)  # 允许零频率，保留直流冲激。
delay = Symbol('delay', real=True)
band = Symbol('band', positive=True)

for power in range(3):
    eq(f'一1 缩放冲激的检验函数 t^{power}',
       integrate(v**power*DiracDelta(2*v-2), (v, 0, 2)), Rational(1, 2))
check('一2 独立有限卷积', convolution([1, -2, 1, 2], [2, 1, 3]) == [2, -3, 3, -1, 5, 6])
xf = lambda k: {-1: 1, 0: -2, 1: 1, 2: 2}.get(k, 0)
hf = lambda k: {0: 2, 1: 1, 2: 3}.get(k, 0)
ys = {-1: 2, 0: -3, 1: 3, 2: -1, 3: 5, 4: 6}
check('一2 全支撑及箭头下标', all(sum(xf(m)*hf(k-m) for m in range(-6, 8)) == ys.get(k, 0) for k in range(-5, 9)))
eq('一3 连续周期直接代入', sin(v+2*pi), sin(v))
check('一3 离散角频率不是 2π 的有理倍', (1/(2*pi)).is_irrational is True)
eq('一4 延时冲激卷积', integrate(v**2*DiracDelta(t-v-delay), (v, -oo, oo)), (t-delay)**2)
eq('一4 积分器由冲激累加成阶跃', integrate(exp(-v), (v, 0, t)), 1-exp(-t))
# δ' 是奇分布：δ'(t-v)=-δ'(v-t)，先标准化到积分变量，避开 CAS 的反向导数符号问题。
eq('一4 微分器的分布卷积', integrate(-v**2*DiracDelta(v-t, 1), (v, -oo, oo)), 2*t)
H5 = (1+I*w)/(1-I*w)
eq('一5 幅度的平方', H5*conjugate(H5), 1)
eq('一5 相位斜率独立求导', im(diff(H5, w)/H5), 2/(1+w*w))
check('一5 相位不是线性的', simplify(diff(2*atan(w), w, 2)) != 0)
eq('一6 矩形谱直接逆积分', integrate(pi*exp(I*w*t), (w, -1, 1))/(2*pi), sin(t)/t)
eq('一6 Parseval 的谱能量', integrate(pi**2, (v, -1, 1))/(2*pi), pi)
eq('一6 时域能量直接积分', integrate((sin(v)/v)**2, (v, -oo, oo)), pi)
eq('一7 稳定普通核的绝对积分样例', integrate(exp(-v), (v, 0, oo)), 1)
eq('一7 有限冲激直通的卷积增益', integrate(3*DiracDelta(v-delay)*cos(t-v), (v, -oo, oo)), 3*cos(t-delay))
eq('一8 双边带支撑相加上界', band+band, 2*band)
eq('一8 边缘余弦平方的倍频', expand_trig(cos(band*v)**2)-(1+cos(2*band*v))/2, 0)
g9 = lambda k: Rational(1, 4)**k*u(k)
h9 = lambda k: g9(k)-g9(k-1)
check('一9 差分与显式脉冲核相同', all(h9(k) == int(k == 0)-3*Rational(1, 4)**k*u(k-1) for k in range(-5, 15)))
check('一9 累加核还原阶跃响应', all(sum(h9(m) for m in range(k+1)) == g9(k) for k in range(15)))
eq('一9 z 域差分回查', (1-q)/(1-q/4), 1-3*q/(4*(1-q/4)))
# 将检验函数取零于右边界，避免非紧支撑多项式的边界项。
edge = pi/2
for power in range(3):
    phi = v**power*(pi-v)**2
    lhs = -integrate(sin(v)*diff(phi, v), (v, 0, pi))-integrate(sin(v)*diff(phi, v), (v, edge, pi))
    rhs = integrate(cos(v)*phi, (v, 0, pi))+integrate(cos(v)*phi, (v, edge, pi))+phi.subs(v, edge)
    eq(f'一10 原题加号的分布导数检验 {power}', lhs, rhs)
eq('一10 原点冲激强度', sin(0), 0)
eq('一10 π/2 跳变冲激强度', sin(edge), 1)

def overlap(value, lo, hi):
    return max(min(hi, value-1)-max(lo, value-2), 0)
def y1(value):
    if 0 <= value < 1: return 2*value
    if 1 <= value < 2: return 6-4*value
    if 2 <= value <= 3: return 2*value-6
    return Integer(0)
check('二1 卷积重叠长度逐点', all(y1(vv) == 2*(overlap(vv, -1, 0)-overlap(vv, 0, 1)) for vv in [Rational(j, 8) for j in range(-16, 41)]))
eq('二1 输出正负面积相消', integrate(2*v, (v, 0, 1))+integrate(6-4*v, (v, 1, 2))+integrate(2*v-6, (v, 2, 3)), 0)
eq('二1 峰值及零点', y1(1)+y1(2)+y1(Rational(3, 2)), 0)
def old(vv):
    if 0 <= vv < 1: return 2*vv
    if 1 <= vv < 2: return Integer(1)
    return Integer(0)
def transformed(vv):
    if -6 < vv <= -4: return Integer(1)
    if -4 < vv <= -2: return -vv-2
    return Integer(0)
check('二2 反向展宽波形逐点回查', all(transformed(vv) == old(-vv/2-1) for vv in [Rational(j, 8) for j in range(-72, 1)]))
eq('二2 冲激缩放强度及位置', integrate(DiracDelta(-v/2-4), (v, -oo, oo)), 2)
eq('二2 冲激一阶矩', integrate(v*DiracDelta(-v/2-4), (v, -oo, oo)), -16)

# 原题混写 2s；以下两问均明确以 2s -> 2z 为条件。
AA = Matrix([[0, 1, 0], [0, 0, 1], [-1, -2, -3]])
BB = Matrix([0, 0, 1])
CC = Matrix([[0, -2, 1]])
den3 = z**3+3*z*z+2*z+1
H3 = (z*z-2*z)/den3
eq('二3 状态空间独立回算 H(z)', (CC*(z*eye(3)-AA).inv()*BB)[0], H3)
eq('二3 特征多项式', AA.charpoly(z).as_expr(), den3)
eq('二3 延时链代数回算', (q-2*q*q)/(1+3*q+2*q*q+q**3), H3.subs(z, 1/q))
wrong = (q+2*q*q+q**3)/(1+3*q+2*q*q+q**3)
check('二3 原参考图多接支路且符号不符', simplify(wrong-H3.subs(z, 1/q)) != 0)
state = zeros(3, 1)
impulses = []
for k in range(12):
    impulses.append((CC*state)[0])
    state = AA*state+BB*int(k == 0)
check('二3 输出严格延时且前两非零项', impulses[:3] == [0, 1, -5])
check('二3 状态递推核与原系数逐点一致', all(simplify(sum(coef*(impulses[k-j] if k >= j else 0) for j, coef in enumerate([1, 3, 2, 1]))-(int(k == 1)-2*int(k == 2))) == 0 for k in range(12)))

den4 = (s-2)*(s-3)
H4 = (4*s+1)/den4
zi4 = exp(3*t)
zs4 = -exp(-t)/4-3*exp(2*t)+Rational(13, 4)*exp(3*t)
eq('二4 单边变换初态项', s+3-5, s-2)
eq('二4 零输入变换', lt(zi4), (s-2)/den4)
eq('二4 零输入初值', zi4.subs(t, 0), 1)
eq('二4 零输入初始导数', diff(zi4, t).subs(t, 0), 3)
eq('二4 齐次微分方程', diff(zi4, t, 2)-5*diff(zi4, t)+6*zi4, 0)
eq('二4 输入定义积分', lt(exp(-t)), 1/(s+1))
eq('二4 零状态变换', lt(zs4), H4/(s+1))
eq('二4 零状态初值', zs4.subs(t, 0), 0)
eq('二4 输入导数冲激所致右导数', diff(zs4, t).subs(t, 0), 4)
eq('二4 正时间原方程回查', diff(zs4, t, 2)-5*diff(zs4, t)+6*zs4, -3*exp(-t))
eq('二4 完全响应右导数', diff(zi4+zs4, t).subs(t, 0), 7)
check('二4 因果增长极点', roots(den4, s) == {2, 3})

Hpole = 2*s*(s-2)/((s+1)*(s+3))
eq('二5 增益的无穷远条件', limit(Hpole, s, oo), 2)
check('二5 原图零点极点', roots(2*s*(s-2), s) == {0, 2} and roots((s+1)*(s+3), s) == {-1, -3})
eq('二5 直通及指数部分分式', Hpole, 2+3/(s+1)-15/(s+3))
g5 = -3*exp(-t)+5*exp(-3*t)
eq('二5 条件因果 h 的回算含 δ', 2+lt(3*exp(-t)-15*exp(-3*t)), Hpole)
eq('二5 条件因果 g 的回算', lt(g5), Hpole/s)
eq('二5 阶跃原点跃变为直通增益', g5.subs(t, 0), 2)
eq('二5 普通部分的阶跃导数', diff(g5, t), 3*exp(-t)-15*exp(-3*t))
left_rate = Symbol('left_rate', positive=True)
eq('二5 左边指数回算，s=-1-a 位于左 ROC', integrate(-3*exp(left_rate*v), (v, -oo, 0)), (3/(s+1)).subs(s, -1-left_rate))
eq('二5 另一左边指数回算，s=-3-a 位于左 ROC', integrate(15*exp(left_rate*v), (v, -oo, 0)), (-15/(s+3)).subs(s, -3-left_rate))

dend = (1+q)*(1+2*q)
Hd = (2+q)/dend
eq('三1 初态分子', -3*Rational(1, 2)-2*q*Rational(1, 2)-2*Rational(1, 4), -2-q)
eq('三1 零输入部分分式', (-2-q)/dend, 1/(1+q)-3/(1+2*q))
eq('三1 零状态部分分式', Hd/(1-q), -1/(2*(1+q))+2/(1+2*q)+1/(2*(1-q)))
def zi(k): return (-Integer(1))**k-3*(-Integer(2))**k if k >= 0 else {-1: Rational(1, 2), -2: Rational(1, 4)}.get(k, 0)
def zs(k): return (-(-Integer(1))**k/2+2*(-Integer(2))**k+Rational(1, 2))*u(k)
check('三1 带原初态的齐次递推', all(zi(k)+3*zi(k-1)+2*zi(k-2) == 0 for k in range(15)))
recurrence('三1 零状态逐点原方程', zs, [1, 3, 2], lambda k: 2*u(k)+u(k-1))
check('三1 完全响应带初态逐点原方程', all(zi(k)+zs(k)+3*(zi(k-1)+zs(k-1))+2*(zi(k-2)+zs(k-2)) == 2*u(k)+u(k-1) for k in range(15)))
eq('三1 完全响应首样本', zi(0)+zs(0), 0)
eq('三1 系统函数因式化', Hd.subs(q, 1/z), z*(2*z+1)/((z+1)*(z+2)))
check('三1 极点及零点未消去', roots((z+1)*(z+2), z) == {-1, -2} and not simplify(z*(2*z+1)).subs(z, -1) == 0)
impulse = lambda k: 3*(-Integer(2))**k*u(k)-(-Integer(1))**k*u(k)
recurrence('三1 冲激核独立回算', impulse, [1, 3, 2], lambda k: 2*int(k == 0)+int(k == 1))
check('三1 核不绝对可和的增长下界', all(abs(impulse(k)) >= 2**k for k in range(20)))

cutoff = 80*pi
low = integrate(exp(I*omega*(t-2)), (omega, -cutoff, cutoff))/(2*pi)
eq('三2 低通部分逆变换', simplify(low.rewrite(exp)), simplify((80*sin(cutoff*(t-2))/(cutoff*(t-2))).rewrite(exp)))
eq('三2 延时中心处低通极限', limit(low, t, 2), 80)
eq('三2 全频直通部分的延时相位', integrate(DiracDelta(v-2)*exp(-I*w*v), (v, -oo, oo)), exp(-2*I*w))
gain = lambda ww: Integer(1 if abs(ww) > cutoff else 0)
check('三2 DC 与低频被抑制，高频通过', [gain(0), gain(60*pi), gain(120*pi)] == [0, 0, 1])
eq('三2 120π 的延时恰为整数周期', cos(120*pi*(t-2)), cos(120*pi*t))
eq('三2 原图相位斜率给延时 2', -diff(-2*w, w), 2)
finish()

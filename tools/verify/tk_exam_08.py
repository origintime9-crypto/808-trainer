"""课程8：独立复核原图的卷积、跳变导数、电路和双负反馈，不读取网页答案。"""
from common import *

v = Symbol('v', real=True)
omega = Symbol('omega', real=True)
q = Symbol('q', real=True)
cv = Symbol('cv', real=True)
K = Symbol('K', real=True)
R = Symbol('R', positive=True)
L = Symbol('L', positive=True)
C = Symbol('C', positive=True)
gstep = lambda value: min(max(value, 0), 1)
eq('一5 不可公度正弦的线谱逆变换', integrate(pi*(DiracDelta(omega-1)+DiracDelta(omega+1)+DiracDelta(omega-sqrt(2))+DiracDelta(omega+sqrt(2)))*exp(I*omega*v), (omega, -oo, oo))/(2*pi), cos(v)+cos(sqrt(2)*v))
check('一5 非周期线谱的频率比确为无理数', sqrt(2).is_rational is False)
check('一7 积分阶跃响应逐点', all(gstep(value) == max(value, 0)-max(value-1, 0) for value in [Rational(j, 8) for j in range(-12, 25)]))
eq('一7 h面积与阶跃终值', integrate(1, (v, 0, 1)), 1)
eq('一8 左半平面二重极点的尾部', limit((1+t)*exp(-t), t, oo), 0)
tri_inv = (integrate(pi/100*(1+omega/200)*exp(I*omega*t), (omega, -200, 0))+integrate(pi/100*(1-omega/200)*exp(I*omega*t), (omega, 0, 200)))/(2*pi)
# 先化到指数域再消去：直接化简200t与100t会触发数百阶三角多项式分解。
# 两边仍来自独立的定义积分与原题Sa平方，检查内容不变。
eq('一9 原Sa平方的三角谱逆定义积分', simplify(expand((tri_inv-sin(100*t)**2/(10000*t*t)).rewrite(exp))), 0)
eq('一9 支撑上界与抽样率', 2*Integer(200), 400)
eq('一9 边缘谱连续为零', (pi/100*(1-omega/200)).subs(omega, 200), 0)
delayed = integrate((v-2+(v-2)**2/2)*exp(-s*v), (v, 2, oo))
eq('一10 用f=t+1独立回算延时积分LT', delayed, exp(-2*s)*(1/s+1/s**2)/s)
check('一10 源答案的负号导致不同输入输出', simplify(delayed+exp(-2*s)*(1/s+1/s**2)/s) != 0)

# 二1：h在-1..0，积分窗口是t..t+1，保留全部绝对时间下标。
overlap = lambda value, lo, hi: max(min(hi, value+1)-max(lo, value), 0)
def conv(value):
    if -2 <= value < -1: return 2*value+4
    if -1 <= value < 0: return -4*value-2
    if 0 <= value <= 1: return 2*value-2
    return Integer(0)
check('二1 原图重叠积分逐点', all(conv(value) == 2*(overlap(value, -1, 0)-overlap(value, 0, 1)) for value in [Rational(j, 8) for j in range(-28, 20)]))
check('二1 双峰及过零时刻', [conv(-1), conv(0), conv(-Rational(1, 2))] == [2, -2, 0])
eq('二1 卷积正负面积相消', integrate(2*v+4, (v, -2, -1))+integrate(-4*v-2, (v, -1, 0))+integrate(2*v-2, (v, 0, 1)), 0)
eq('二1 斜坡表示右端恢复为零', expand(2*((v+2)-3*(v+1)+3*v-(v-1))), 0)

# 二2：先按原图两段直线作积分，再用微分性质校核两个冲激。
F2 = integrate((v+2)*exp(-I*w*v), (v, -2, 0))+integrate((v-2)*exp(-I*w*v), (v, 0, 4))
D2 = integrate(exp(-I*w*v), (v, -2, 4))-4-2*exp(-4*I*w)
eq('二2 正常斜率加原点及右端跳变回查', simplify((I*w*F2-D2).rewrite(exp)), 0)
eq('二2 右端跳变量不能遗漏', 0-(4-2), -2)
eq('二2 导数的总面积为零', 6-4-2, 0)
eq('二2 导数一阶矩等于原面积负值', integrate(v, (v, -2, 4))-2*4, -(integrate(v+2, (v, -2, 0))+integrate(v-2, (v, 0, 4))))
orig = lambda value: value+2 if -2 < value < 0 else value-2 if 0 < value < 4 else 0
shifted = lambda value: -value/2-3 if -10 < value < -2 else 1-value/2 if -2 < value < 2 else 0
probes = [Rational(j, 4) for j in range(-48, 17) if j not in [-40, -8, 8]]
check('二2 反转展宽平移逐点', all(shifted(value) == orig(-value/2-1) for value in probes))
eq('二2 从原节点反解新断点', solve(Eq(-v/2-1, 4), v)[0], -10)
eq('二2 中间节点反解新断点', solve(Eq(-v/2-1, 0), v)[0], -2)
eq('二2 另一端点反解新断点', solve(Eq(-v/2-1, -2), v)[0], 2)
eq('二2 新中间跳变为+4', (1-v/2).subs(v, -2)-(-v/2-3).subs(v, -2), 4)

# 二3：g'=f，故z'=y；若没有边界条件，仍允许常数核造成不同z。
eq('二3 三角g面积', integrate(v+1, (v, -1, 0))+integrate(1-v, (v, 0, 1)), 1)
eq('二3 已知f面积为零', integrate(1, (v, -1, 0))+integrate(-1, (v, 0, 1)), 0)
Y3 = (exp(-s)-exp(-3*s))/s-2*exp(-4*s)
Z3 = integrate((v-1)*exp(-s*v), (v, 1, 3))+integrate(2*exp(-s*v), (v, 3, 4))
eq('二3 取零积分常数的原分段LT', Z3, (exp(-s)-exp(-3*s))/s**2-2*exp(-4*s)/s)
eq('二3 积分输出导数回查原y', s*Z3, Y3)
eq('二3 y包含冲激后总面积为零', 3-1-2, 0)
eq('二3 取零常数输出面积', integrate(v-1, (v, 1, 3))+integrate(2, (v, 3, 4)), 4)
eq('二3 添加常数核不会改变已知f的响应', K*(integrate(1, (v, -1, 0))+integrate(-1, (v, 0, 1))), 0)
eq('二3 添加常数核会使g的响应增加K', K*(integrate(v+1, (v, -1, 0))+integrate(1-v, (v, 0, 1))), K)

# 二4：背景1外，直接积分紧支撑负梯形。
F4 = integrate(-(v+3)*exp(-I*w*v), (v, -3, -2))-integrate(exp(-I*w*v), (v, -2, 2))+integrate((v-3)*exp(-I*w*v), (v, 2, 3))
eq('二4 负梯形定义积分', simplify((F4-2*(cos(3*w)-cos(2*w))/(w*w)).rewrite(exp)), 0)
eq('二4 与两个Sa乘积等价', -4*sin(5*w/2)*sin(w/2)/(w*w), 2*(cos(3*w)-cos(2*w))/(w*w))
eq('二4 紧支撑部分的零频面积', limit(F4, w, 0), -5)
eq('二4 背景常数的广义逆变换', integrate(2*pi*DiracDelta(omega)*exp(I*omega*v), (omega, -oo, oo))/(2*pi), 1)

# 二5：元件阻抗、初态KVL、电流连续性均独立检查。
impedance = L*s+R+1/(C*s)
H5 = (R/impedance).subs({R: Rational(3, 2), L: Rational(1, 2), C: 1})
eq('二5 由串联阻抗回算H', H5, 3*s/((s+1)*(s+2)))
h5 = -3*exp(-t)+6*exp(-2*t)
eq('二5 h的直接变换回查', lt(h5), H5)
check('二5 两实际极点都在左半平面', roots((s+1)*(s+2), s) == {-1, -2})
eq('二5 绝对可积核', integrate(h5, (t, 0, log(2)))-integrate(h5, (t, log(2), oo)), Rational(3, 2))
I5 = (2/s+Rational(1, 2)-1/s)/(s/2+Rational(3, 2)+1/s)
eq('二5 含电感电流及电容电压初态的KVL', I5, 1/(s+1))
eq('二5 电阻输出完整变换', Rational(3, 2)*I5, Rational(3, 2)/(s+1))
eq('二5 电流的正时间原KVL', diff(exp(-t), t)/2+Rational(3, 2)*exp(-t)+(2-exp(-t)), 2)
eq('二5 电容初压及电流初值', (2-exp(-t)).subs(t, 0), 1)
eq('二5 电容电压导数与串联电流', diff(2-exp(-t), t), exp(-t))
eq('二5 不擅自丢掉初态的响应分解', -Rational(9, 2)*exp(-t)+6*exp(-2*t)+6*exp(-t)-6*exp(-2*t), Rational(3, 2)*exp(-t))

# 三1：Sa平方由原频谱重叠求出，再代入并联加法器的实际正负号。
H1inv = (integrate((pi+omega/2)*exp(I*omega*t), (omega, -2*pi, 0))+integrate((pi-omega/2)*exp(I*omega*t), (omega, 0, 2*pi)))/(2*pi)
eq('三1 斜边低通谱直接逆积分', simplify(expand((H1inv-sin(pi*t)**2/(pi*t*t)).rewrite(exp))), 0)
eq('三1 原图负h1加h2的DC', pi-pi, 0)
eq('三1 高频直通增益', pi-0, pi)
eq('三1 基波π处增益', pi-(pi-pi/2), pi/2)
eq('三1 核为πSa平方的原点极限', limit(sin(pi*t)**2/(pi*t*t), t, 0), pi)
harmonics = {1: pi/2, 3: pi, 5: pi, 7: pi, 9: pi}
check('三1 各条奇谐波按实际增益', all(simplify(2/(pi*j)*gain-(1 if j == 1 else Rational(2, j))) == 0 for j, gain in harmonics.items()))
eq('三1 输出级数与减去基波的形式一致', sin(pi*v)+sum(Rational(2, j)*sin(j*pi*v) for j in [3, 5, 7, 9]), 2*sum(sin(j*pi*v)/j for j in [1, 3, 5, 7, 9])-sin(pi*v))

# 三2：各反馈支路乘负权，再经加法器的负入口，不能只读块内负号。
feedback1 = (-1)*(-Rational(1, 4))
feedback2 = (-1)*(-Rational(1, 8))
den = 1-feedback1*q-feedback2*q*q
eq('三2 原图双负反馈消元', den, (1-q/2)*(1+q/4))
eq('三2 H的独立部分分式', 1/den, Rational(2, 3)/(1-q/2)+Rational(1, 3)/(1+q/4))
h = lambda k: (Rational(2, 3)*Rational(1, 2)**k+Rational(1, 3)*(-Rational(1, 4))**k)*u(k)
recurrence('三2 单位样值响应逐点回原反馈递推', h, [1, -feedback1, -feedback2], lambda k: int(k == 0))
check('三2 实际极点而非误写的-1/8', roots(z*z-z/4-Rational(1, 8), z) == {Rational(1, 2), -Rational(1, 4)})
eq('三2 非负稳定核的绝对和', summation(Rational(2, 3)*Rational(1, 2)**n+Rational(1, 3)*(-Rational(1, 4))**n, (n, 0, oo)), Rational(8, 5))
check('三2 原核逐点非负', all(h(k) > 0 for k in range(20)))
Zi = (Rational(3, 8)+q/8)/den
eq('三2 原初态分子加号独立回算', feedback1*1+feedback2*1+feedback2*q*1, Rational(3, 8)+q/8)
eq('三2 零输入部分分式', Zi, Rational(5, 12)/(1-q/2)-Rational(1, 24)/(1+q/4))
zi = lambda k: {-1: Integer(1), -2: Integer(1)}.get(k, 0) if k < 0 else Rational(5, 12)*Rational(1, 2)**k-Rational(1, 24)*(-Rational(1, 4))**k
zs = lambda k: (2*Rational(1, 2)**k-Rational(8, 7)*Rational(1, 3)**k+Rational(1, 7)*(-Rational(1, 4))**k)*u(k)
full = lambda k: zi(k)+zs(k)
check('三2 零输入保留原初态的递推', all(zi(k)-zi(k-1)/4-zi(k-2)/8 == 0 for k in range(16)))
recurrence('三2 零状态原输入递推', zs, [1, -Rational(1, 4), -Rational(1, 8)], lambda k: Rational(1, 3)**k*u(k))
check('三2 完全响应原初态及输入递推', all(full(k)-full(k-1)/4-full(k-2)/8 == Rational(1, 3)**k for k in range(16)))
eq('三2 零状态部分分式', 1/(den*(1-q/3)), 2/(1-q/2)-Rational(8, 7)/(1-q/3)+Rational(1, 7)/(1+q/4))
eq('三2 完全响应三指数相加', zi(t)+zs(t), Rational(29, 12)*Rational(1, 2)**t-Rational(8, 7)*Rational(1, 3)**t+Rational(17, 168)*(-Rational(1, 4))**t)
eq('三2 完全响应首项', full(0), Rational(11, 8))
eq('三2 完全响应第二项', full(1), Rational(77, 96))
Hz = simplify(1/den.subs(q, 1/z))
eq('三2 分子在原点有二重零点', limit(Hz/(z*z), z, 0), -8)
eq('三2 原点不与分母抵消', (z*z-z/4-Rational(1, 8)).subs(z, 0), -Rational(1, 8))
magden = (Rational(5, 4)-cv)*(Rational(17, 16)+cv/2)
eq('三2 单位圆模平方分母', expand(magden), Rational(85, 64)-Rational(7, 16)*cv-cv*cv/2)
eq('三2 DC幅度', 1/sqrt(magden.subs(cv, 1)), Rational(8, 5))
eq('三2 Nyquist端点幅度', 1/sqrt(magden.subs(cv, -1)), Rational(8, 9))
minimum_c = solve(Eq(diff(magden, cv), 0), cv)[0]
eq('三2 最小幅度处的cosΩ', minimum_c, -Rational(7, 16))
eq('三2 真实最小幅度', 1/sqrt(magden.subs(cv, minimum_c)), 16*sqrt(2)/27)
check('三2 源图8/9是端点值并非最低值', 16*sqrt(2)/27 < Rational(8, 9))
check('三2 分母二阶导数为负证明驻点为最大', diff(magden, cv, 2) < 0)
finish()

"""课程26原图独立求解：重叠区间、未知圆滑波形、零极点条件族及原正负反馈。"""
from common import *
v = Symbol('v', real=True)
A = Symbol('A', real=True)
b = Symbol('b', positive=True)
q = Symbol('q')

# 原填空与已录入题完全相同，仍从定义复核本卷参数。
eq('一1 全脉宽能量', integrate(A**2, (v, -b/2, b/2)), A**2*b)
real_seq = {0: Integer(1), 1: Integer(-2), 2: Integer(3)}
complex_seq = {0: Integer(1), 1: I}
correlation = lambda seq, lag: sum(value*conjugate(seq.get(index-lag, 0)) for index, value in seq.items())
check('一2 实相关偶对称', all(correlation(real_seq, j) == correlation(real_seq, -j) for j in range(-4, 5)))
check('一2 实相关幅度不超过能量', all(abs(correlation(real_seq, j)) <= correlation(real_seq, 0) for j in range(-4, 5)))
eq('一2 原点相关为能量', correlation(real_seq, 0), sum(value**2 for value in real_seq.values()))
eq('一2 复序列相关非偶', correlation(complex_seq, 1), I)
eq('一2 复序列共轭对称', correlation(complex_seq, -1), conjugate(correlation(complex_seq, 1)))
check('一3 左平面因果指数核绝对积分有限', integrate(exp(-2*t), (t, 0, oo)).is_finite)
check('一3 虚轴极点常数核不绝对可积', integrate(Integer(1), (t, 0, oo)) == oo)
H4 = lt(exp(-t) + t*cos(2*t))
N4, D4 = fraction(cancel(H4))
check('一4 不可约分母五次', degree(D4, s) == 5)
check('一4 分子分母没有公因子', gcd(N4, D4) == 1)
check('一4 全部实际极点', roots(D4, s) == {-1, 2*I, -2*I})
eq('一4 正负虚轴极点各二阶', D4, (s+1)*(s**2+4)**2)
# ω为实数时指数实部恒为−5，收敛已独立确认；避免SymPy留下未化简的arg条件分支。
F5 = integrate(exp(-5*t)*sin(3*t)*exp(-I*w*t), (t, 0, oo), conds='none')
eq('一5 定义FT', F5, 3/((5+I*w)**2+9))
eq('一5 零频积分', integrate(exp(-5*t)*sin(3*t), (t, 0, oo)), Rational(3, 34))
eq('一6 sinc平方直接积分', integrate((sin(v)/v)**2, (v, -oo, oo)), pi)
eq('一6 两宽矩形谱Parseval', integrate(pi**2, (v, -1, 1))/(2*pi), pi)
eq('一7 有界输入的L1界', integrate(exp(-t), (t, 0, oo)), 1)
eq('一8 正弦平方达到双带宽', expand_trig(cos(2*v)), 2*cos(v)**2-1)
g = lambda k: Rational(1, 4)**k*u(k)
h9 = lambda k: (Integer(k == 0)-3*Rational(1, 4)**k*u(k-1))
check('一9 从阶跃做一拍差分', all(h9(j) == g(j)-g(j-1) for j in range(-4, 20)))
check('一9 累加还原原阶跃', all(sum(h9(m) for m in range(j+1)) == g(j) for j in range(16)))
eq('一9 ZT初值', limit((1-q)/(1-q/4), q, 0), 1)
derivative = diff(sin(v)*(Heaviside(v)+Heaviside(v-pi/2)), v)
eq('一10 后半段普通导数仍双倍', diff(2*sin(v), v), 2*cos(v))
eq('一10 原点跳跃系数', sin(0), 0)
eq('一10 后端跳跃系数为正', sin(pi/2), 1)
eq('一10 分布导数展开', derivative, cos(v)*(Heaviside(v)+Heaviside(v-pi/2))+sin(v)*DiracDelta(v)+sin(v)*DiracDelta(v-pi/2))

# 二1：只由原两个矩形的交集长度求卷积，峰值不能当作面积。
overlap = lambda time: 2*Max(0, Min(1, time+3)-Max(0, time+1))
for time, value in [(-4, 0), (-3, 0), (-Rational(5, 2), 1), (-2, 2), (-Rational(3, 2), 2), (-1, 2), (-Rational(1, 2), 1), (0, 0), (1, 0)]:
    eq('二1 原重叠t='+str(time), overlap(time), value)
eq('二1 三段定义面积', integrate(2*(v+3), (v, -3, -2))+integrate(2, (v, -2, -1))+integrate(-2*v, (v, -1, 0)), 4)
eq('二1 两输入面积相乘', integrate(1, (v, 0, 1))*integrate(2, (v, -3, -1)), 4)

# 二2：因果性消除周期歧义，h是0..1矩形。A-3只能确定积分族。
H2 = integrate(exp(-s*v), (v, 0, 1))
X2 = integrate(exp(-s*v), (v, 0, 2))
Y2 = integrate(v*exp(-s*v), (v, 0, 1))+integrate(exp(-s*v), (v, 1, 2))+integrate((3-v)*exp(-s*v), (v, 2, 3))
eq('二2 原输入输出LT关系', H2*X2, Y2)
step = lambda time: Max(0, Min(1, time))
for time, value in [(-1, 0), (0, 0), (Rational(1, 2), Rational(1, 2)), (1, 1), (2, 1), (4, 1)]:
    eq('二2 阶跃定义积分t='+str(time), step(time), value)
eq('二2 阶跃差分回原梯形', step(Rational(3, 2))-step(-Rational(1, 2)), 1)
P = Function('P')
eq('二2 未知输入通式上升段导数', diff(integrate(P(tau), (tau, 0, t)), t), P(t))
eq('二2 未知输入通式下降段导数', diff(integrate(P(tau), (tau, t-1, 1)), t), -P(t-1))
# 两个满足端点0、中心峰高1的合法输入，输出峰高不同，证明不能暗选抛物线。
for hump in [sin(pi*v), 4*v*(1-v)]:
    eq('二2 合法示例左端'+str(hump), hump.subs(v, 0), 0)
    eq('二2 合法示例右端'+str(hump), hump.subs(v, 1), 0)
    eq('二2 合法示例中心峰高'+str(hump), hump.subs(v, Rational(1, 2)), 1)
eq('二2 正弦示例峰高', integrate(sin(pi*v), (v, 0, 1)), 2/pi)
eq('二2 抛物线示例峰高', integrate(4*v*(1-v), (v, 0, 1)), Rational(2, 3))
check('二2 原图不足以定唯一输出', simplify(2/pi-Rational(2, 3)) != 0)

# 二3：答案使用FT性质，这里另用有限区间定义积分独立回查。
X3 = (1-exp(-1)*exp(-I*w))/(1+I*w)
eq('二3 定义FT与性质一致', integrate(exp(-v)*exp(-I*w*v), (v, 0, 1)), X3)
eq('二3 延迟副本在1后相消', exp(-v)-exp(-1)*exp(-(v-1)), 0)
eq('二3 原点面积', limit(X3, w, 0), 1-exp(-1))
eq('二3 可去的虚频表达', X3.subs(w, -I), (1-exp(-2))/2)

# 二4：先由原微分方程得到H，再分别反演和定义卷积。
H = 2/(s**2+6*s+8)
h = exp(-2*t)-exp(-4*t)
eq('二4 冲激核LT', lt(h), H)
eq('二4 极点由原方程', factor(s**2+6*s+8), (s+2)*(s+4))
check('二4 原稳定因果极点', roots(s**2+6*s+8, s) == {-2, -4})
eq('二4 频响从定义FT', integrate(h*exp(-I*w*t), (t, 0, oo), conds='none'), H.subs(s, I*w))
y4 = (t-Rational(1, 2))*exp(-2*t)+exp(-4*t)/2
eq('二4 指数输入定义卷积', integrate((exp(-2*tau)-exp(-4*tau))*exp(-2*(t-tau)), (tau, 0, t)), y4)
eq('二4 输出LT回H乘X', lt(y4), H/(s+2))
eq('二4 原微分方程正时域', diff(y4, t, 2)+6*diff(y4, t)+8*y4, 2*exp(-2*t))
eq('二4 零状态右初值', y4.subs(t, 0), 0)
eq('二4 零状态右初导数', diff(y4, t).subs(t, 0), 0)

# 二5：原δ[k-1]响应是h[k-1]，不是h本身。
h5 = lambda k: Rational(1, 2)**(k+1)*u(k)
x5 = lambda k: 2*Integer(k == 0)+u(k)
y5 = lambda k: (1+Rational(1, 2)**(k+1))*u(k)
check('二5 原延迟冲激响应回下标', all(h5(j-1) == Rational(1, 2)**j*u(j-1) for j in range(-4, 20)))
check('二5 新输入定义卷积', all(sum(h5(m)*x5(j-m) for m in range(0, max(0, j)+1)) == y5(j) for j in range(-4, 20)))
eq('二5 首样本', y5(0), Rational(3, 2))
eq('二5 ZT乘积', (Rational(1, 2)/(1-q/2))*(2+1/(1-q)), 1/(1-q)+Rational(1, 2)/(1-q/2))

# 三1原图未标实轴极点坐标和重零点阶数，只核验明示条件a=5/2、r=2。
C = Rational(25, 4)
N = (s+3)*(s+1)**2
D = (s+Rational(5, 2))*((s+1)**2+4)
Hc = C*N/D
eq('三1 条件DC增益', Hc.subs(s, 0), Rational(3, 2))
check('三1 条件零点左平面', roots(N, s) == {-3, -1})
check('三1 条件极点位置', roots(D, s) == {-Rational(5, 2), -1+2*I, -1-2*I})
check('三1 条件系统非全通镜像', roots(N, s) != {Rational(5, 2), 1+2*I, 1-2*I})
eq('三1 条件直通系数', limit(Hc, s, oo), C)
hc = 2*exp(-t)*cos(2*t)-14*exp(-t)*sin(2*t)+Rational(9, 8)*exp(-Rational(5, 2)*t)
eq('三1 条件常规核LT加直通', C+lt(hc), Hc)
eq('三1 条件实核积分', integrate(hc, (t, 0, oo)), -Rational(19, 4))
eq('三1 工程0负端约定回总面积', C+integrate(hc, (t, 0, oo)), Rational(3, 2))
eq('三1 分母微分系数', expand(D), s**3+Rational(9, 2)*s**2+10*s+Rational(25, 2))
eq('三1 分子微分系数', expand(N), s**3+5*s**2+7*s+3)
h1 = ((2+12*t)*exp(-t)-4*exp(-3*t))/25
eq('三1 条件逆核LT', Rational(4, 25)+lt(h1), 1/Hc)
eq('三1 条件逆核卷积回单位冲激', (Rational(4, 25)+lt(h1))*(C+lt(hc)), 1)
check('三1 条件正逆传输均真有理或等次', degree(N, s) == degree(D, s))
eq('三1 若原点冲激按半权则增益不同', (-Rational(75, 13))*(Rational(6, 25)-Rational(1, 2)), Rational(3, 2))
for multiplicity in [1, 2, 3]:
    family = (s+3)*(s+1)**multiplicity/D
    eq('三1 重零点阶数'+str(multiplicity)+'不由DC决定', family.subs(s, 0), Rational(6, 25))
    check('三1 重零点阶数'+str(multiplicity)+'相对次数', degree(fraction(cancel(family))[0], s)-degree(fraction(cancel(family))[1], s) == multiplicity-2)

# 三2：由原箭头和入口符号直接递推，没有沿用旧题不同前馈2/3。
Hd = (1+q)/(1-Rational(3, 4)*q+q**2/8)
eq('三2 原前馈反馈相除', Hd, 6/(1-q/2)-5/(1-q/4))
hn = lambda k: (6*Rational(1, 2)**k-5*Rational(1, 4)**k)*u(k)
recurrence('三2 原差分逐样本回查', hn, [1, -Rational(3, 4), Rational(1, 8)], lambda k: Integer(k == 0)+Integer(k == 1))
eq('三2 首样本', hn(0), 1)
eq('三2 次样本', hn(1), Rational(7, 4))
eq('三2 第三样本', hn(2), Rational(19, 16))
eq('三2 DC核总和', summation((6*Rational(1, 2)**n-5*Rational(1, 4)**n), (n, 0, oo)), Rational(16, 3))
eq('三2 H在单位圆原点增益', Hd.subs(q, 1), Rational(16, 3))
check('三2 实际极点都在单位圆内', roots(z**2-Rational(3, 4)*z+Rational(1, 8), z) == {Rational(1, 2), Rational(1, 4)})
eq('三2 含直接通路的零点', Hd.subs(q, 1/z), z*(z+1)/((z-Rational(1, 2))*(z-Rational(1, 4))))
finish()

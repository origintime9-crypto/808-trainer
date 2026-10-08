"""课程27：只由87–89页题面求解；未标折点保留参数，不把单次响应当作系统证据。"""
from common import *
v = Symbol('v', real=True)
q = Symbol('q')
c = Symbol('c', real=True)
a = Symbol('a', positive=True)

# 十填空：原箭头、周期、时域运算与连续/离散两种解释。
eq('一1 冲激尺度因子', abs(Rational(1, 2)), Rational(1, 2))
check('一1 冲激位置在矩形内部', 0 < 1 < 2)
fh = {-1: 1, 0: -2, 1: 1, 2: 2}
hh = {0: 2, 1: 1, 2: 3}
yc = [sum(value*hh.get(j-k, 0) for k, value in fh.items()) for j in range(-1, 5)]
check('一2 按原零下标有限卷积', yc == [2, -3, 3, -1, 5, 6])
eq('一2 序列总和', sum(yc), sum(fh.values())*sum(hh.values()))
eq('一3 连续周期', simplify(sin(v+2*pi)-sin(v)), 0)
check('一3 数字频率与2π的比无理', (1/(2*pi)).is_rational is False)
eq('一4 延时器核的LT', exp(-s*Symbol('t0', positive=True)), exp(-s*Symbol('t0', positive=True)))
eq('一4 积分器核', lt(Integer(1)), 1/s)
eq('一4 微分器传输', s, s)
H5 = (1+I*w)/(1-I*w)
eq('一5 全通幅度平方', H5*conjugate(H5), 1)
eq('一5 相位斜率', diff(2*atan(w), w), 2/(1+w**2))
check('一5 相位斜率不恒定', simplify(diff(2/(1+w**2), w)) != 0)
eq('一6 时间压缩保留谐波幅度', (3*cos(3*v)).subs(v, 2*v), 3*cos(6*v))
eq('一7 点乘筛选', sum(Integer(2)**j*Integer(j == 3) for j in range(-4, 10)), 8)
eq('一8 定义卷积', integrate(exp(-(t-tau)), (tau, 0, t)), 1-exp(-t))
Fc = integrate(exp(-a*v)*exp(-I*w*v), (v, 0, oo), conds='none') + integrate(exp(a*v)*exp(-I*w*v), (v, -oo, 0), conds='none')
eq('一9 连续FT定义', Fc, 2*a/(a**2+w**2))
Fd = (1-exp(-2*a))/(1-2*exp(-a)*cos(w)+exp(-2*a))
eq('一9 离散几何级数与双曲函数', Fd.rewrite(exp), (sinh(a)/(cosh(a)-cos(w))).rewrite(exp))
eq('一9 离散频谱周期', Fd.subs(w, w+2*pi), Fd)
check('一9 两种解释确实不相同', simplify(Fd.subs({a: 1, w: 0})-2) != 0)
eq('一10 右边几何ZT', summation((a*q)**n, (n, 0, oo)).args[0][0], 1/(1-a*q))
eq('一10 a=0首样本', (1/(1-a*q)).subs(a, 0), 1)

# 二1：g(τ)=f1(−τ/2)，折点c没有标签。仅c=2时给数值示例。
ramp = (4+2*v)/(4-c)
eq('二1 f1左端', ramp.subs(v, -2), 0)
eq('二1 f1折点', ramp.subs(v, -c/2), 1)
shifted = ramp.subs(v, t+1)
eq('二1 y1参数上升段', shifted, 2*(t+3)/(4-c))
eq('二1 y1参数折点', shifted.subs(t, -1-c/2), 1)
eq('二1 c=2示例上升段', shifted.subs(c, 2), t+3)
eq('二1 两个合法折点改变答案', shifted.subs({c: 1, t: -Rational(5, 2)})-shifted.subs({c: 2, t: -Rational(5, 2)}), -Rational(1, 6))
eq('二1 y1支撑起点由τ=4映射', solve(Eq(-2*(v+1), 4), v)[0], -3)
eq('二1 y1折点映射', solve(Eq(-2*(v+1), c), v)[0], -1-c/2)
eq('二1 f2冲激映射位置', solve(Eq(5-3*v, -1), v)[0], 2)
eq('二1 f2冲激映射强度', Rational(9, 3), 3)
phi = v**2+2*v+1
eq('二1 f2经测试函数的分布尺度核对', 9*phi.subs(v, 2)/abs(-3), 3*phi.subs(v, 2))

# 二2：给定右半平面ROC，几何展开与分段积分分别回算阶梯LT。
m = Symbol('m', integer=True, nonnegative=True)
F2 = 1/(s*(1-exp(-2*s)))
step_term = integrate((m+1)*exp(-s*v), (v, 2*m, 2*m+2))
eq('二2 每段台阶的定义积分', step_term, (m+1)*(1-exp(-2*s))*exp(-2*m*s)/s)
geom = diff(q/(1-q), q)
finite = sum((j+1)*q**j for j in range(12))
eq('二2 有限加权级数直接展开', (1-q)**2*finite, 1-13*q**12+12*q**13)
eq('二2 收敛例子的加权尾项趋零', limit((m+1)*Rational(1, 2)**m, m, oo), 0)
eq('二2 台阶和几何级数', geom, 1/(1-q)**2)
eq('二2 分段定义LT回原式', ((1-q)*geom/s).subs(q, exp(-2*s)), F2)
eq('二2 延时阶跃级数回原式', 1/s/(1-exp(-2*s)), F2)
for at, expected in [(Rational(1, 2), 1), (Rational(5, 2), 2), (Rational(9, 2), 3), (Rational(13, 2), 4)]:
    eq('二2 台阶中段t='+str(at), sum(u(at-2*j) for j in range(6)), expected)

# 二3：原单次响应可满足K=2、td=10，但未给LTI，不能据此认定整个系统。
t0 = Symbol('t0', positive=True)
E = 1+exp(-s*t0)/s
R = 2*exp(-10*s)+2*exp(-(t0+10)*s)/s
eq('二3 所给输入输出的延时比例', R, 2*exp(-10*s)*E)
# 平滑测试泛函L[x]=∫exp(-t²)x(t)dt；L[e]>0。
Le = 1+sqrt(pi)*erfc(t0)/2
eq('二3 原阶跃和冲激的高斯测试泛函', 1+integrate(exp(-v**2), (v, t0, oo)), Le.rewrite(erf))
check('二3 合法t0=0时测试泛函严格为正', Le.subs(t0, 0).is_positive)
# T[x]=2x(t−10)+L[x](L[x]−Le)exp(−t²)。
# x=e和x=0时附加项均为0，x=2e时附加项非零；不涉及δ平方。
amplitude = Symbol('A', real=True)
extra = amplitude*Le*(amplitude*Le-Le)
eq('二3 反例系统对原输入附加项零', extra.subs(amplitude, 1), 0)
eq('二3 反例系统对零输入附加项零', extra.subs(amplitude, 0), 0)
eq('二3 反例系统对二倍输入附加项', extra.subs(amplitude, 2), 2*Le**2)
check('二3 二倍输入违反线性缩放', (2*Le.subs(t0, 0)**2).is_positive)

# 二4：实偶带通频响逆FT；全时间正弦输出不得额外乘阶跃。
hn = integrate((4-v)*cos(v*t)/2, (v, 2, 4))/pi
expected_hn = (cos(2*t)-cos(4*t))/(2*pi*t**2)-sin(2*t)/(pi*t)
eq('二4 原谱定义逆FT', hn, expected_hn)
eq('二4 原点可去极限', limit(hn, t, 0), 1/pi)
eq('二4 双通带面积', 2*integrate((4-v)/2, (v, 2, 4))/(2*pi), 1/pi)
Hfreq = lambda omega: Rational(4-abs(omega), 2) if 2 < abs(omega) < 4 else Integer(0)
for freq, value in [(0, 0), (1, 0), (3, Rational(1, 2)), (5, 0), (-3, Rational(1, 2))]:
    eq('二4 频率选择ω='+str(freq), Hfreq(freq), value)
eq('二4 输出', Hfreq(0)+Rational(3, 5)*Hfreq(1)*cos(t)+Rational(2, 5)*Hfreq(3)*cos(3*t)+Rational(1, 5)*Hfreq(5)*cos(5*t), cos(3*t)/5)

# 二5：原h[0]=1、h[1]=−1，有限核直接卷积；原点不可漏。
x5 = lambda k: Rational(1, 2)**k*u(k)
y5 = lambda k: Integer(k == 0)-Rational(1, 2)**k*u(k-1)
check('二5 逐样本定义卷积', all(y5(k) == x5(k)-x5(k-1) for k in range(-4, 20)))
eq('二5 首样本', y5(0), 1)
eq('二5 次样本', y5(1), -Rational(1, 2))
eq('二5 ZT乘积', (1-q)/(1-q/2), 1-(q/2)/(1-q/2))
eq('二5 核绝对和', sum(abs(v) for v in [1, -1]), 2)
eq('二5 输出全和', 1-summation(Rational(1, 2)**n, (n, 1, oo)), 0)

# 三1：两点平均的DTFT、周期与低通分类。
Havg = (1+exp(-I*w))/2
eq('三1 因式分解', expand(Havg.rewrite(cos)), expand((exp(-I*w/2)*cos(w/2)).rewrite(cos)))
eq('三1 模平方', expand_complex(Havg*conjugate(Havg)).expand(trig=True), cos(w/2)**2)
eq('三1 频响2π周期', Havg.subs(w, w+2*pi), Havg)
for freq, value in [(0, 1), (pi/2, Rational(1, 2)), (pi, 0), (2*pi, 1)]:
    eq('三1 关键频率模平方ω='+str(freq), (Havg*conjugate(Havg)).subs(w, freq), value)
eq('三1 两有限冲激的ZT', Rational(1, 2)+Rational(1, 2)*q, (1+q)/2)
check('三1 0..π幅度递减', diff(cos(v/2), v).subs(v, pi/2).is_negative)

# 三2：原反馈+3/−2，输出w+4w[-1]，输入4^k与负初态独立递推。
H = (1+4*q)/(1-3*q+2*q**2)
eq('三2 消去中间变量的系统函数', (1+4*q)/((1-q)*(1-2*q)), H)
eq('三2 H部分分式', H, -5/(1-q)+6/(1-2*q))
h = lambda k: (6*Integer(2)**k-5)*u(k)
zi = lambda k: (5-12*Integer(2)**k)*u(k)
zs = lambda k: (Rational(5, 3)-6*Integer(2)**k+Rational(16, 3)*Integer(4)**k)*u(k)
total = lambda k: (Rational(20, 3)-18*Integer(2)**k+Rational(16, 3)*Integer(4)**k)*u(k)
recurrence('三2 冲激响应全起点递推', h, [1, -3, 2], lambda k: Integer(k == 0)+4*Integer(k == 1))
recurrence('三2 零状态全起点递推', zs, [1, -3, 2], lambda k: Integer(4)**k*u(k)+4*Integer(4)**(k-1)*u(k-1))
eq('三2 零输入初态ZT', (-7+2*q)/(1-3*q+2*q**2), 5/(1-q)-12/(1-2*q))
eq('三2 零状态ZT', H/(1-4*q), Rational(5, 3)/(1-q)-6/(1-2*q)+Rational(16, 3)/(1-4*q))
actual = {-2: Integer(2), -1: Integer(-1)}
for k in range(16):
    actual[k] = 3*actual[k-1]-2*actual[k-2]+Integer(4)**k+4*Integer(4)**(k-1)*u(k-1)
    eq('三2 原初态递推k='+str(k), actual[k], total(k))
    eq('三2 响应分解k='+str(k), zi(k)+zs(k), total(k))
    eq('三2 有限卷积零状态k='+str(k), sum(h(j)*Integer(4)**(k-j) for j in range(k+1)), zs(k))
A = Matrix([[0, 1], [-2, 3]])
B = Matrix([0, 1])
C = Matrix([[-2, 7]])
eq('三2 按原x1/x2顺序状态回算H', (C*(z*eye(2)-A).inv()*B)[0]+1, H.subs(q, 1/z))
check('三2 状态实际特征值', set(A.eigenvals()) == {1, 2})
state = Matrix([0, -1])
for k in range(8):
    eq('三2 状态输出与原递推k='+str(k), (C*state)[0]+Integer(4)**k, actual[k])
    state = A*state+B*Integer(4)**k
finish()

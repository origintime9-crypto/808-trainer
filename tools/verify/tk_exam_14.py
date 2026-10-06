"""课程14：按p60..62原题独立计算，初终值、分布跳变与前馈结构分别检查。"""
from common import *

v = Symbol('v', real=True)
omega = Symbol('omega', real=True)
wc = Symbol('wc', positive=True)
q = Symbol('q')

check('一1 移位冲激与加权阶跃的卷积', all(
    sum(Integer(j)*u(j)*int(k-j+2 == 0) for j in range(-10, 16)) == (k+2)*u(k+2)
    for k in range(-8, 12)))
ratio = Symbol('ratio', real=True)
geom = summation(ratio**n, (n, 0, oo))
assert isinstance(geom, Piecewise)
eq('一2 原半幅指数的单边Z定义级数', geom.args[0][0].subs(ratio, 2/z)/2, z/(2*(z-2)))
eq('一2 初样本确为二分之一', (Integer(2)**0)/2, Rational(1, 2))
samples = {-2: 2, -1: -1, 0: 4, 1: 0, 2: 5}
check('一3 任意有限样例以移位单位样值展开', all(sum(value*int(k-j == 0) for j, value in samples.items()) == samples.get(k, 0) for k in range(-6, 7)))

# 终值定理不成立：给出两个趋向无穷的取样子列，有不同极限。
base = (1-cos(2*t))/4
X = (1-exp(-2*s))/(s*(s*s+4))
eq('一4 未延时部分的定义LT', lt(base), 1/(s*(s*s+4)))
eq('一4 两秒差分的变换', (1-exp(-2*s))*lt(base), X)
eq('一4 原点初值', limit(base, t, 0, dir='+'), 0)
eq('一4 初值定理回算', limit(s*X, s, oo), 0)
eq('一4 形式终值极限虽是零', limit(s*X, s, 0, dir='+'), 0)
tail = (cos(2*(t-2))-cos(2*t))/4
eq('一4 延时后尾部为持续正弦', expand((tail-sin(2)*sin(2*t-2)/2).rewrite(exp)), 0)
eq('一4 正峰取样子列恒值', tail.subs(t, 1+pi/4+pi*(n+1)), sin(2)/2)
eq('一4 负峰取样子列恒值', tail.subs(t, 1+3*pi/4+pi*(n+1)), -sin(2)/2)
check('一4 两个子列的值不同所以终值不存在', sin(2).is_zero is False)
check('一4 sX的虚轴极点', roots(s*s+4, s) == {2*I, -2*I})
eq('一4 虚轴极点没有分子抵消', Abs(1-exp(-4*I))**2, 2-2*cos(4))

inverse = 1/(1+2*q)
eq('一5 逆系统的代数乘积', (1+2*q)*inverse, 1)
recurrence('一5 因果逆核实际冲激检查', lambda k: Integer(-2)**k*u(k), [1, 2], lambda k: int(k == 0))
recurrence('一5 左边逆核实际冲激检查', lambda k: -Integer(-2)**k*u(-k-1), [1, 2], lambda k: int(k == 0))
eq('一5 稳定左边逆的绝对和', summation(Rational(1, 2)**(n+1), (n, 0, oo)), 1)
eq('一5 因果逆尾部幅值增长', Abs(Integer(-2)**n), 2**n)
eq('一6 冲激导数的FT定义作用', integrate(exp(-I*omega*v)*DiracDelta(v, 1), (v, -oo, oo)), I*omega)
seq = {i: value for i, value in enumerate([0, 1, 2, 3, 4, 3, 2, 1])}
check('一7 时间抽取而非幅度乘二', [seq.get(2*k, 0) for k in range(4)] == [0, 2, 4, 2])
check('一7 抽取的带外整数样值', all(seq.get(2*k, 0) == 0 for k in [-3, -2, -1, 4, 5]))
discrete = {1: 1, 3: 6, 5: -2}
eq('一8 有限延时序列的定义Z多项式', sum(a*z**(-k) for k, a in discrete.items()), z**(-1)+6*z**(-3)-2*z**(-5))
eq('一10 因果稳定核的绝对和样例', summation(Rational(1, 2)**n, (n, 0, oo)), 2)
check('一10 稳定左边核的极点可在单位圆外', 2 > 1)

# 谐波指数系数从定义积分计算，幅相与单边功率采用不同归一化。
f = 3*cos(t)+sin(5*t+pi/6)-2*cos(8*t-2*pi/3)
as_exp = expand(f.rewrite(exp))

def period_integral(expr):
    # 已展开为常数和整数频率指数，直接取原函数，避免通用积分器反复化简复相位。
    total = Integer(0)
    for term in Add.make_args(expand(expr)):
        coefficient, kernel = term.as_independent(t, as_Add=False)
        if kernel == 1:
            primitive = coefficient*t
        else:
            assert kernel.func == exp, kernel
            slope = diff(kernel.args[0], t)
            assert slope != 0 and not slope.has(t)
            primitive = term/slope
        assert simplify(diff(primitive, t)-term) == 0
        total += primitive.subs(t, 2*pi)-primitive.subs(t, 0)
    return simplify(total)

coeff = {}
for k, expected in [(0, 0), (1, Rational(3, 2)), (-1, Rational(3, 2)), (5, exp(-I*pi/3)/2), (-5, exp(I*pi/3)/2), (8, exp(I*pi/3)), (-8, exp(-I*pi/3))]:
    c = period_integral(as_exp*exp(-I*k*t))/(2*pi)
    coeff[k] = c
    eq(f'二1 指数FS定义积分n={k}', c, expected)
eq('二1 七个指数系数重构信号', expand((sum(c*exp(I*k*t) for k, c in coeff.items())-f).rewrite(exp)), 0)
check('二1 单边三个幅度', [simplify(2*Abs(coeff[k])) for k in [1, 5, 8]] == [3, 1, 2])
eq('二1 第五谐波相位由正弦转换', coeff[5]/Abs(coeff[5]), exp(-I*pi/3))
eq('二1 第八谐波负振幅转正相位', coeff[8]/Abs(coeff[8]), exp(I*pi/3))
eq('二1 单边功率总和', Rational(9, 2)+Rational(1, 2)+2, 7)
eq('二1 周期平均功率定义积分', period_integral(as_exp**2)/(2*pi), 7)
eq('二1 指数系数Parseval回查', sum(Abs(c)**2 for c in coeff.values()), 7)
eq('二2 门频谱反演回原Sa', integrate(exp(I*w*t), (w, -wc, wc))/(2*pi), sin(wc*t)/(pi*t))
eq('二2 Sa在原点的连续值', limit(sin(wc*t)/(pi*t), t, 0), wc/pi)

# 输入有跳变2且传输直接项为1，不能把零状态右初值设成0。
H = (s*s+3*s+2)/(s*s+5*s+6)
eq('二3 实际约消的零状态系统函数', H, (s+1)/(s+3))
eq('二3 高频直接传输增益', limit(H, s, oo), 1)
xs = 1/s+1/(s+1)
zs = Rational(1, 3)+Rational(5, 3)*exp(-3*t)
zi = 4*exp(-2*t)-3*exp(-3*t)
full = 4*exp(-2*t)-Rational(4, 3)*exp(-3*t)+Rational(1, 3)
eq('二3 零状态从原输入定义LT求得', lt(zs), H*xs)
eq('二3 零输入与零状态还原完全响应', zi+zs, full)
eq('二3 零输入回原二阶齐次式', diff(zi, t, 2)+5*diff(zi, t)+6*zi, 0)
eq('二3 完全响应正时间回原方程', diff(full, t, 2)+5*diff(full, t)+6*full, 2)
eq('二3 零输入右初值', zi.subs(t, 0), 1)
eq('二3 零输入右导数', diff(zi, t).subs(t, 0), 1)
eq('二3 零状态右初值是2而非0', zs.subs(t, 0), 2)
eq('二3 零状态右导数是负5', diff(zs, t).subs(t, 0), -5)
eq('二3 完全响应右初值是3', full.subs(t, 0), 3)
eq('二3 完全响应右导数是负4', diff(full, t).subs(t, 0), -4)
eq('二3 原点δ′系数匹配输入跳变', zs.subs(t, 0), 1+exp(0))
eq('二3 原点δ系数匹配输入导数与三倍跳变', diff(zs, t).subs(t, 0)+5*zs.subs(t, 0), -1+3*2)

A = Matrix([[0, 1], [-3, -5]])
B = Matrix([0, 1])
C = Matrix([[7, 2]])
eq('二4 直接型状态实现回算传输函数', (C*(s*eye(2)-A).inv()*B)[0], (2*s+7)/(s*s+5*s+3))
eq('二4 状态反馈的特征多项式', (s*eye(2)-A).det(), s*s+5*s+3)
eq('二5 Hz临界间隔', 1/Integer(2*400), Rational(1, 800))
eq('二5 一毫秒抽样的Hz频率', 1/Rational(1, 1000), 1000)
eq('二5 最近谱副本内侧边缘Hz', 1000-400, 600)
check('二5 五百Hz截止处于安全区间', 400 < 500 < 600)
eq('二5 理想冲激采样恢复通带增益T', Rational(1, 1000)*1000, 1)

# 原图只有第一支反馈，后两支是前馈。
Hq = (1+q/4)*(1+q/3)/(1-q/2)
eq('三1 原图三段乘积展开', Hq, (1+Rational(7, 12)*q+q*q/12)/(1-q/2))
eq('三1 传输函数改写为z多项式', Hq.subs(q, 1/z), (z+Rational(1, 4))*(z+Rational(1, 3))/(z*(z-Rational(1, 2))))
eq('三1 除法分离两个直接延时项', Hq, Rational(5, 2)/(1-q/2)-Rational(3, 2)-q/6)
def hh(k):
    return Rational(5, 2)*Rational(1, 2)**k*u(k)-Rational(3, 2)*int(k == 0)-Rational(1, 6)*int(k == 1)

recurrence('三1 冲激响应逐点代原差分', hh, [1, -Rational(1, 2)], lambda k: int(k == 0)+Rational(7, 12)*int(k == 1)+Rational(1, 12)*int(k == 2))
check('三1 冲激前三点', [hh(k) for k in range(3)] == [1, Rational(13, 12), Rational(5, 8)])
check('三1 尾部的等价表达', all(hh(k) == Rational(5, 8)*Rational(1, 2)**(k-2) for k in range(2, 20)))
eq('三1 冲激核总和等于直流增益', summation(Rational(5, 2)*Rational(1, 2)**n, (n, 0, oo))-Rational(3, 2)-Rational(1, 6), Hq.subs(q, 1))

# 实系数有限Laurent多项式的共轭恒等式和域内零点共轭。
zz = Symbol('zz', complex=True, nonzero=True)
Xz = sum(value*zz**(-k) for k, value in samples.items())
eq('三2 有限实序列的嵌套共轭', conjugate(Xz.subs(zz, conjugate(zz))), Xz)
pair_poly = zz*zz+zz+1
pair_roots = roots(pair_poly, zz)
check('三2 非实根确为共轭对', pair_roots == {-Rational(1, 2)+sqrt(3)*I/2, -Rational(1, 2)-sqrt(3)*I/2})
check('三2 共轭根代回仍是零', all(simplify(pair_poly.subs(zz, conjugate(root))) == 0 for root in pair_roots))
finish()

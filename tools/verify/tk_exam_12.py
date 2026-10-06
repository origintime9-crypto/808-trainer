"""课程12：从p56..58题面重新求解，含重复来源，不读取网页答案。"""
from common import *

v = Symbol('v', real=True)
theta = Symbol('theta', real=True)
q = Symbol('q')
aa = Symbol('aa', positive=True)
wm = Symbol('wm', positive=True)
TT = Symbol('TT', positive=True)
freq = Symbol('freq', real=True)

# 填空：原点、频率单位与缩放系数分别核对。
period = 2*pi/4
eq('一1 非零余弦的基波周期', period, pi/2)
eq('一1 整周期平移恢复原信号', cos(4*(t+period)+pi/3), cos(4*t+pi/3))
eq('一2 冲激导数乘积在常数试验函数上的作用', integrate(sin(v)*DiracDelta(v, 1), (v, -oo, oo)), -1)
eq('一2 冲激导数乘积在非恒定试验函数上的作用', integrate((1+v+v*v)*sin(v)*DiracDelta(v, 1), (v, -oo, oo)), -1)
eq('一2 乘积公式中δ′系数为零', sin(0), 0)
eq('一2 乘积公式中δ系数为负一', -diff(sin(v), v).subs(v, 0), -1)
hseq = {0: 1, 1: -1, 2: 2}
fseq = {-1: 1, 0: 2, 1: -2, 2: 1}
result = [sum(fseq.get(k, 0)*hseq.get(m-k, 0) for k in fseq) for m in range(-1, 5)]
check('一3 依两个箭头确定的六点卷积', result == [1, 1, -2, 7, -5, 2])
eq('一3 第三项不能漏负号', sum(fseq.get(k, 0)*hseq.get(1-k, 0) for k in fseq), -2)
eq('一3 有限卷积的样值总和', sum(result), sum(fseq.values())*sum(hseq.values()))
coeff = {0: 1, 1: -Rational(1, 2), -1: -Rational(1, 2), 3: -I/5, -3: I/5}
eq('一4 五项指数级数重构', sum(c*exp(I*k*t) for k, c in coeff.items()), 1-cos(t)+Rational(2, 5)*sin(3*t))
check('一4 实信号的系数共轭对称', all(coeff[-k] == conjugate(c) for k, c in coeff.items()))
eq('一4 给定周期对应角基频', 2*pi/(2*pi), 1)
# 对一般正尺度b，先由卷积换元得到b系数；另用不同衰减率的可积信号定义积分检查。
scale = Symbol('scale', positive=True)
conv = integrate(exp(-v)*exp(-2*(t-v)), (v, 0, t))
conv_scaled = integrate(exp(-2*v)*exp(-4*(t-v)), (v, 0, t))
eq('一5 两个缩放信号卷积须乘二', conv.subs(t, 2*t), 2*conv_scaled)
eq('一5 任意正尺度卷积的换元检查', conv.subs(t, scale*t), scale*integrate(exp(-scale*v)*exp(-2*scale*(t-v)), (v, 0, t)))
check('一5 不乘二在普通样例上不成立', simplify(conv.subs(t, 2*t)-conv_scaled) != 0)

def step(x):
    return exp(-x)*Heaviside(x)+Heaviside(-1-x)

check('一6 按给定阶跃移位相减逐段核对', all(simplify(step(x-1)-step(x-2)-(
    exp(-(x-1))*Heaviside(x-1)-exp(-(x-2))*Heaviside(x-2)+Heaviside(-x)-Heaviside(1-x)
)) == 0 for x in [-2, Rational(1, 2), Rational(3, 2), Rational(5, 2), 4]))
eq('一6 原阶跃响应的远负时间基线', step(-2), 1)
eq('一6 提前矩形部分的符号', step(Rational(1, 2)-1)-step(Rational(1, 2)-2), -1)

# 三次输入输出仅在相同初态的完全响应解释下相容，不能默认全为零状态。
a, b = exp(-t), exp(-2*t)
inputs = [a+2*b, 2*a+b, a+b]
outputs = [a+5*b, 5*a+b, a+b]
eq('一7 输入线性依赖关系', inputs[0]+inputs[1]-3*inputs[2], 0)
eq('一7 输出不满足同一零状态依赖关系', outputs[0]+outputs[1]-3*outputs[2], 3*(a+b))
check('一7 零状态解释的矛盾并非零函数', simplify(outputs[0]+outputs[1]-3*outputs[2]) != 0)
za, zb, la, lb = symbols('za zb la lb')
sol_a = solve([la+za-1, 2*la+za-5, la+za-1], [la, za])
sol_b = solve([2*lb+zb-5, lb+zb-1, lb+zb-1], [lb, zb])
check('一7 求公共初态与对a的零状态作用', sol_a == {la: 4, za: -3})
check('一7 求公共初态与对b的零状态作用', sol_b == {lb: 4, zb: -3})
zi = -3*(a+b)
check('一7 同一初态时三组完全响应均回算', all(simplify(4*x+zi-y) == 0 for x, y in zip(inputs, outputs)))
eq('一7 仿射组合构造目标输入', -2*inputs[0]+3*inputs[2], a-b)
eq('一7 仿射组合系数和为一保持初态', -2+3, 1)
eq('一7 同初态目标输出', -2*outputs[0]+3*outputs[2], a-7*b)
eq('一7 单独用前两组零状态推算的结果不同', outputs[1]-outputs[0], 4*(a-b))
# 具体有非零初态的LTI状态实现：B=0,D=4，隐藏自主模式产生公共零输入。
state = Matrix([-3*a, -3*b])
A = diag(-1, -2)
check('一7 公共零输入的实际线性状态实现', simplify(diff(state, t)-A*state) == zeros(2, 1))
check('一7 实现的初始状态一致', state.subs(t, 0) == Matrix([-3, -3]))
eq('一7 状态输出实现公共响应', (Matrix([[1, 1]])*state)[0], zi)

eq('一8 左半平面重极点的普通衰减项', limit(t**3*exp(-aa*t), t, oo), 0)
eq('一8 左半平面简单极点的普通衰减项', limit(exp(-aa*t), t, oo), 0)
# Sa(100t)的普通谱高π/100、支撑±100；平方后两矩形交叠得到三角谱。
eq('一9 Sa平方的频域卷积归一化', (pi/100)**2/(2*pi), pi/20000)
eq('一9 三角谱的中心幅值', pi/20000*200, pi/100)
eq('一9 平方后最高角频率', 100+100, 200)
eq('一9 最小抽样角频率', 2*200, 400)
eq('一9 Hz口径不等于400', 400/(2*pi), 200/pi)
eq('一10 延时累计积分的非恒定样例', integrate(exp(-(t-v)), (v, 2, t)), 1-exp(-(t-2)))
eq('一10 样例单边LT必须正延时因子', lt((1-exp(-t))).factor()*exp(-2*s), exp(-2*s)/(s*(s+1)))

# 计算题：乘积奇偶性、指数系数、三种下标明确的采样与初态分解。
odd_a = v+v**3
odd_b = sin(v)
even_a = 1+v*v
even_b = cos(v)
eq('二1 奇乘奇的符号抵消', (odd_a*odd_b).subs(v, -v), odd_a*odd_b)
eq('二1 偶乘偶仍为偶', (even_a*even_b).subs(v, -v), even_a*even_b)
eq('二1 奇乘偶仍为奇', (odd_a*even_b).subs(v, -v), -odd_a*even_b)
xx = cos(2*t+pi/4)
for k, c in [(-2, 0), (-1, exp(-I*pi/4)/2), (0, 0), (1, exp(I*pi/4)/2), (2, 0), (3, 0)]:
    eq(f'二2 指数FS定义积分n={k}', integrate(cos(2*v+pi/4)*exp(-I*k*2*v), (v, 0, pi))/pi, c)
eq('二2 两项指数级数重构余弦', (exp(I*pi/4)*exp(2*I*t)+exp(-I*pi/4)*exp(-2*I*t))/2, xx)

def triangle(x):
    return Max(1-Abs(sympify(x)), 0)

for interval, indices, values in [
    (Rational(1, 4), list(range(-4, 5)), [0, Rational(1, 4), Rational(1, 2), Rational(3, 4), 1, Rational(3, 4), Rational(1, 2), Rational(1, 4), 0]),
    (Rational(1, 2), list(range(-2, 3)), [0, Rational(1, 2), 1, Rational(1, 2), 0]),
    (Integer(1), [-1, 0, 1], [0, 1, 0]),
]:
    check(f'二3 Ts={interval}逐样值及原点', [triangle(interval*k) for k in indices] == values)
    check(f'二3 Ts={interval}带外样值为零', all(triangle(interval*k) == 0 for k in [-20, 20]))
initial = Symbol('initial', real=True)
yi = initial*exp(-2*t)
ys = 2*exp(-t)+(3-initial)*exp(-2*t)
full = 2*exp(-t)+3*exp(-2*t)
eq('二4 任意左初态的两部分相加', yi+ys, full)
eq('二4 齐次零输入响应', diff(yi, t)+2*yi, 0)
eq('二4 正时间原输入为二倍衰减指数', diff(full, t)+2*full, 2*exp(-t))
eq('二4 单边初态和原点冲激强度', (s+2)*lt(full)-initial, 2/(s+1)+5-initial)
eq('二4 无原点冲激才确定左初态5', solve(5-initial, initial)[0], 5)
eq('二4 零初态时所给完全响应含五倍冲激', (5-initial).subs(initial, 0), 5)
Astate = Matrix([[0, 1, 0], [0, 0, 1], [-1, -3, -2]])
Bstate = Matrix([0, 0, 1])
Cstate = Matrix([[1, 0, 1]])
eq('二5 状态实现回算给定传递函数', (Cstate*(s*eye(3)-Astate).inv()*Bstate)[0], (s*s+1)/(s**3+2*s*s+3*s+1))
eq('二5 特征多项式回算', (s*eye(3)-Astate).det(), s**3+2*s*s+3*s+1)

# 离散综合从原初态递推，而非仅验证最终有理式。
def yzi(k):
    if k == -1: return Integer(-2)
    if k == -2: return Integer(3)
    return -Rational(9, 2)*Rational(1, 2)**k+Rational(7, 3)*Rational(1, 3)**k

def yzs(k):
    return (-Rational(1, 2)*Rational(1, 2)**k+Rational(1, 6)*Rational(1, 3)**k+Rational(1, 2))*u(k)

def yf(k):
    if k == -1: return Integer(-2)
    if k == -2: return Integer(3)
    return -5*Rational(1, 2)**k+Rational(5, 2)*Rational(1, 3)**k+Rational(1, 2)

def impulse(k):
    return (Rational(1, 2)*Rational(1, 2)**k-Rational(1, 3)*Rational(1, 3)**k)*u(k)

recurrence('三1 零输入代回原初态', yzi, [6, -5, 1], lambda k: 0, lo=0)
recurrence('三1 零状态代回原方程', yzs, [6, -5, 1], u)
recurrence('三1 完全响应代回原初态', yf, [6, -5, 1], u, lo=0)
check('三1 两响应逐点相加', all(simplify(yzi(k)+yzs(k)-yf(k)) == 0 for k in range(18)))
eq('三1 初态完全响应首样本', yf(0), -2)
H = 1/(6-5*q+q*q)
eq('三1 冲激核部分分式', H, Rational(1, 2)/(1-q/2)-Rational(1, 3)/(1-q/3))
recurrence('三1 单位样值核独立代回', impulse, [6, -5, 1], lambda k: int(k == 0))
check('三1 因果实际极点均在单位圆内', roots(6*z*z-5*z+1, z) == {Rational(1, 2), Rational(1, 3)})
recurrence('三1 新输入零状态为两倍延时旧响应', lambda k: 2*yzs(k-1), [6, -5, 1], lambda k: 2*u(k-1))
recurrence('三1 新输入完全响应保留原初态', lambda k: yzi(k)+2*yzs(k-1), [6, -5, 1], lambda k: 2*u(k-1), lo=0)
eq('三1 新完全响应首样本不受未接通输入影响', yzi(0)+2*yzs(-1), -Rational(13, 6))

# 三2原图：输入带宽ω1而H1带宽2ω1；恢复增益只在输入带被约束。
H1 = 1-Abs(freq)/(2*wm)
eq('三2 原图基带中心高度', H1.subs(freq, 0), 1)
eq('三2 原图输入带边缘高度', H1.subs(freq, wm), Rational(1, 2))
eq('三2 冲激串单周期积分给系数一除T', integrate(DiracDelta(v), (v, -TT/2, TT/2))/TT, 1/TT)
eq('三2 由最近谱边缘求临界间隔', solve(2*pi/TT-2*wm, TT)[0], pi/wm)
eq('三2 带内倒数补偿恢复原信号', (TT/H1)*H1/TT, 1)
eq('三2 中心所需恢复增益', (TT/H1).subs(freq, 0), TT)
eq('三2 输入带边缘所需恢复增益', (TT/H1).subs(freq, wm), 2*TT)
check('三2 严格抽样示例存在截止设计间隔', wm < 2*wm < 4*wm-wm)
eq('三2 临界时设计间隔宽度为零', (2*pi/TT-2*wm).subs(TT, pi/wm), 0)
finish()

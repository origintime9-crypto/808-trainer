"""课程16：p64..66题面独立计算，含半无限谱、右边序列和双源RLC。"""
from common import *

v = Symbol('v', real=True)
omega = Symbol('omega', real=True)
tn = Symbol('tn', real=True, nonzero=True)
alpha = Symbol('alpha', positive=True)
a = Symbol('a', positive=True)
q = Symbol('q')
coef1, coef2 = symbols('coef1 coef2')
fun1, fun2 = Function('fun1'), Function('fun2')

eq('一1 时间扭曲仍满足输入线性叠加', (coef1*fun1(v)+coef2*fun2(v)).subs(v, cos(v)), coef1*fun1(cos(v))+coef2*fun2(cos(v)))
check('一1 输出零时刻读取未来输入一时刻', cos(0) > 0)
# 先由分布导数定义作分部积分；SymPy对相加后的δ/δ′直接积分会丢项。
weight=v*v+2
eq('一2 δ及δ导数的定义作用', integrate((weight-diff(weight,v))*DiracDelta(v-1), (v, -oo, oo)), 1)
width=Symbol('width',positive=True)
smooth=exp(-v*v/width**2)/(sqrt(pi)*width)
smooth_value=integrate(((v+1)**2+2)*(diff(smooth,v)+smooth),(v,-oo,oo))
eq('一2 平滑冲激及其导数的独立极限',limit(smooth_value,width,0,dir='+'),1)
f2 = Piecewise((1, And(v > -2, v < 2)), (-1, And(v > 2, v < 4)), (0, True))
eq('一3 原图两秒矩形卷积在4的重叠定义', integrate(2*f2.subs(v, 4-v), (v, 0, 2)), -4)
derivative_ft = exp(2)*(1-2/(2+I*omega))
eq('一4 常数e平方与冲激导数FT', derivative_ft, exp(2)*I*omega/(2+I*omega))
eq('一4 整个导数的频谱DC为0', derivative_ft.subs(omega, 0), 0)
eq('一4 高频直通权值确为e平方', limit(derivative_ft, omega, oo), exp(2))
eq('一5 展开冲激串的Z几何级数', 1/(1+q), (z/(z+1)).subs(z, 1/q))
check('一5 展开冲激串逐下标为交替右边序列', all(sum((-1)**m*int(k == m) for m in range(20)) == (-1)**k*u(k) for k in range(-4, 15)))
eq('一6 延时正弦的定义单边积分', integrate(exp(-s*t)*sin(t-1), (t, 1, oo)), exp(-s)/(s*s+1))
eq('一7 时间尺度翻倍后的最高角频率', 2*2*pi, 4*pi)
eq('一7 临界抽样间隔秒', pi/(4*pi), Rational(1, 4))
eq('一7 频率Hz和抽样率一致', (2*4*pi)/(2*pi), 4)

# 在负频率端指数衰减，逆变换定义可以直接求积；alpha趋0给广义极限。
inverse_reg = integrate(exp(alpha*(omega-1)+I*omega*v), (omega, -oo, 1), conds='none')/pi
eq('一8 半无限门正则化的逆定义积分', inverse_reg, exp(I*v)/(pi*(alpha+I*v)))
eq('一8 正则化冲激近似的总面积为1', integrate(alpha/(pi*(alpha*alpha+v*v)), (v, -oo, oo)), 1)
eq('一8 非零时刻的PV虚部符号', limit(-tn/(pi*(alpha*alpha+tn*tn)), alpha, 0, dir='+'), -1/(pi*tn))
eq('一8 调制不改变原点冲激权值', exp(I*v).subs(v, 0), 1)
eq('一8 逆谱用PV对反查的符号', 1+(-I/pi)*(-I*pi)*sign(omega-1), 1-sign(omega-1))
eq('一8 低频侧反查值为2', 1-refine(sign(omega-1), Q.negative(omega-1)), 2)
eq('一8 高频侧反查值为0', 1-refine(sign(omega-1), Q.positive(omega-1)), 0)
eq('一8 对称边缘值为1', (1-sign(omega-1)).subs(omega, 1), 1)
eq('一9 右边几何Z与外ROC的有理式', 1/(1-a/z), z/(z-a))
eq('一10 阶跃FT的衰减正则化', integrate(exp(-(alpha+I*omega)*v), (v, 0, oo), conds='none'), 1/(alpha+I*omega))
eq('一10 正则化实部总面积为π', integrate(alpha/(alpha*alpha+omega*omega), (omega, -oo, oo)), pi)

# f=+1 on (0,1), -1 on (1,2); h=f(2-t)=-f。
fb = Piecewise((1, And(v > 0, v < 1)), (-1, And(v > 1, v < 2)), (0, True))
check('二1 原图反向平移核在各开放区间为负f', all(fb.subs(v, 2-j) == -fb.subs(v, j) for j in [Rational(1, 2), Rational(3, 2), -1, 3]))
pieces = [(0, 1, -v), (1, 2, 3*v-4), (2, 3, -3*v+8), (3, 4, v-4)]
def yconv(value):
    for left, right, expr in pieces:
        if left <= value <= right:
            return expr.subs(v, value)
    return Integer(0)

check('二1 波形节点逐个回时域定义积分', all(simplify(integrate(fb*fb.subs(v, 2-j+v), (v, 0, 2))-yconv(j)) == 0 for j in [Rational(-1, 2), 0, Rational(1, 2), 1, Rational(3, 2), 2, Rational(5, 2), 3, Rational(7, 2), 4, 5]))
Fcompact = integrate(exp(-s*v), (v, 0, 1))-integrate(exp(-s*v), (v, 1, 2))
wave_lt = sum(integrate(expr*exp(-s*v), (v, left, right)) for left, right, expr in pieces)
eq('二1 完整分段波形定义LT等于卷积乘积', wave_lt, -Fcompact**2)
eq('二1 整个波形总面积为0', sum(integrate(expr, (v, left, right)) for left, right, expr in pieces), 0)
eq('二1 反向核中心卷积值等于原信号能量', integrate(fb*fb, (v, 0, 2)), yconv(2))
Gstep = 1/(s+1)
Hstep = s*Gstep
eq('二2 阶跃微分保留单位直通', Hstep, 1-1/(s+1))
eq('二2 全时域指数激励按实际卷积求得', 3*exp(2*t)-integrate(exp(-tau)*3*exp(2*(t-tau)), (tau, 0, oo)), 2*exp(2*t))
eq('二2 正指数位于收敛半平面的增益', Hstep.subs(s, 2), Rational(2, 3))
period_piece = integrate(exp(-s*v)*sin(pi*v), (v, 0, 1))
eq('二3 绝对正弦首周期LT定义', period_piece, pi*(1+exp(-s))/(s*s+pi*pi))
period_lt = period_piece/(1-exp(-s))
eq('二3 每周期累加的LT', period_lt, pi*(1+exp(-s))/((s*s+pi*pi)*(1-exp(-s))))
eq('二3 原信号每周期平均值', integrate(sin(pi*v), (v, 0, 1)), 2/pi)
eq('二3 s趋零的留数与均值相符', limit(s*period_lt, s, 0, dir='+'), 2/pi)

fs_signal = 2*sin(pi*v/2+pi/4)-cos(4*pi*v/3-3*pi/4)
eq('二4 十二秒后信号重复', fs_signal.subs(v, v+12), fs_signal)
eq('二4 基波角频率', 2*pi/12, pi/6)
eq('二4 第一分量的谐波次数', (pi/2)/(pi/6), 3)
eq('二4 第二分量的谐波次数', (4*pi/3)/(pi/6), 8)
eq('二4 非零次数互素保障基本周期', gcd(3, 8), 1)

def elementary_integral(expr):
    total = 0
    for term in Add.make_args(expand(expr.rewrite(exp))):
        term = powsimp(term, force=True)
        constant, kernel = term.as_independent(v, as_Add=False)
        slope = simplify(diff(kernel, v)/kernel)
        primitive = term*v if slope == 0 else term/slope
        assert simplify(diff(primitive, v)-term) == 0
        total += primitive.subs(v, 12)-primitive.subs(v, 0)
    return simplify(total)

cs = {}
for harmonic in [-8, -3, 0, 1, 2, 3, 5, 8]:
    cs[harmonic] = elementary_integral(fs_signal*exp(-I*harmonic*pi*v/6))/12
    expected = {-8: exp(-I*pi/4)/2, -3: exp(I*pi/4), 3: exp(-I*pi/4), 8: exp(I*pi/4)/2}.get(harmonic, 0)
    eq('二4 FS定义积分n='+str(harmonic), cs[harmonic], expected)
eq('二4 第一实谐波单边幅度', 2*Abs(cs[3]), 2)
eq('二4 第二实谐波单边幅度', 2*Abs(cs[8]), 1)
# 使用同一Euler基核对恒等式，避免自动展开高次三角多项式耗时数分钟。
eq('二4 复系数完整重构原信号', expand(sum(cs[j]*exp(I*j*pi*v/6) for j in [-8, -3, 3, 8]).rewrite(exp)), expand(fs_signal.rewrite(exp)))

# 标准二阶有理解释；若只数有限极点，另核对含无穷远极点的右边序列。
pole = expand_complex(exp(I*pi/3))/2
den = z*z-z/2+Rational(1, 4)
eq('二5 实系数两共轭极点形成分母', (z-pole)*(z-conjugate(pole)), den)
scale = Symbol('scale', real=True)
eq('二5 由F1求增益', solve(Eq(scale/den.subs(z, 1), Rational(8, 3)), scale)[0], 2)
Fbase = 2*z*z/den
eq('二5 标准二阶F1回核', Fbase.subs(z, 1), Rational(8, 3))
eq('二5 原点二零的首个非零系数', limit(Fbase/(z*z), z, 0), 8)
check('二5 实际共轭极点模均为半', all(simplify(Abs(root)) == Rational(1, 2) for root in roots(den, z)))
def seq(k):
    return (4/sqrt(3))*Rational(1, 2)**k*sin((k+1)*pi/3)*u(k)
recurrence('二5 标准实右边序列回因果二阶递推', seq, [1, -Rational(1, 2), Rational(1, 4)], lambda k: 2*int(k == 0))
alternative = (1+z)*Fbase/2
eq('二5 条件反例仍保留题给F1', alternative.subs(z, 1), Rational(8, 3))
eq('二5 条件反例仍为原点恰二阶零', limit(alternative/(z*z), z, 0), 4)
eq('二5 条件反例有额外有限零点负1', alternative.subs(z, -1), 0)
check('二5 条件反例未约消题给两有限极点', all(simplify((1+root)/2) != 0 for root in roots(den, z)))
eq('二5 条件反例另有无穷远极点', limit(alternative/z, z, oo), 1)
eq('二5 条件反例在负1有提前样值', (seq(-1)+seq(0))/2, 1)
check('二5 提前序列仍为右边而非无限左边', all((seq(k)+seq(k+1))/2 == 0 for k in range(-10, -1)))

# 双源RLC，i_L向右、i_S向下，i_R采用上节点向地的被动参考方向。
V, IL = symbols('V IL')
def circuit(v0, i0, us, current):
    return solve([s*IL-i0-us+V, IL-(s*V/2-v0/2+V+current)], [V, IL])

zi = circuit(Integer(1), Integer(1), Integer(0), Integer(0))
zs = circuit(Integer(0), Integer(0), 1/s, 1/s)
complete = circuit(Integer(1), Integer(1), 1/s, 1/s)
D = s*s+2*s+2
vzi = exp(-t)*(cos(t)+sin(t))
vzs = 1-exp(-t)*(cos(t)+3*sin(t))
vfull = 1-2*exp(-t)*sin(t)
izi = exp(-t)*cos(t)
izs = 2-exp(-t)*(2*cos(t)+sin(t))
ifull = 2-exp(-t)*(cos(t)+sin(t))
eq('三1 零输入单边模型的电压LT', zi[V], (s+2)/D)
eq('三1 双源零状态的电压LT', zs[V], 2*(1-s)/(s*D))
eq('三1 完全电压LT', complete[V], (s*s+2)/(s*D))
eq('三1 零输入逆式回定义LT', lt(vzi), zi[V])
eq('三1 零状态逆式回定义LT', lt(vzs), zs[V])
eq('三1 完全电压逆式回定义LT', lt(vfull), complete[V])
eq('三1 三个电压分解相加', vzi+vzs, vfull)
eq('三1 零输入电感电流LT', lt(izi), zi[IL])
eq('三1 零状态电感电流LT', lt(izs), zs[IL])
eq('三1 完全电感电流LT', lt(ifull), complete[IL])
for name, voltage, current, source_flag in [('零输入', vzi, izi, 0), ('零状态', vzs, izs, 1), ('完全', vfull, ifull, 1)]:
    eq('三1 '+name+'回原KCL', current, diff(voltage, t)/2+voltage+source_flag)
    eq('三1 '+name+'回原KVL', diff(current, t), source_flag-voltage)
eq('三1 电容电压开通连续', vfull.subs(t, 0), 1)
eq('三1 电感电流开通连续', ifull.subs(t, 0), 1)
eq('三1 零输入的右初始导数', diff(vzi, t).subs(t, 0), 0)
eq('三1 电流源开通使零状态右导数负2', diff(vzs, t).subs(t, 0), -2)
eq('三1 完全响应右初始导数', diff(vfull, t).subs(t, 0), -2)
eq('三1 电流阶跃的δ系数与导数跳变相符', (diff(vfull, t).subs(t, 0)-diff(vzi, t).subs(t, 0))/2, -1)

H = (a-s)/(a+s)
eq('三2 微分方程的系统函数含负直通', H, -1+2*a/(s+a))
Hw = H.subs(s, I*omega)
eq('三2 全通幅度平方', Hw*conjugate(Hw), 1)
phase_outputs = []
for frequency, phase in [(1/sqrt(3), pi/3), (1, pi/2), (sqrt(3), 2*pi/3)]:
    value = simplify(Hw.subs({a: 1, omega: frequency}))
    eq('三2 实频点'+str(frequency)+'的负相位', value, exp(-I*phase))
    phase_outputs.append(cos(frequency*t-phase))
    eq('三2 实频点'+str(frequency)+'回原微分方程', (1+I*frequency)*value, 1-I*frequency)
eq('三2 稳定普通核加有限直通的总变差', 1+integrate(2*a*exp(-a*v), (v, 0, oo)), 3)
finish()

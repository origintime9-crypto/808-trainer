"""顺序第九套（原卷未编号）：从原式、原图及参数独立复核，不读取网页答案。"""
from common import *

v = Symbol('v', real=True)
Om = Symbol('Om', real=True)
q = Symbol('q')
duration = Symbol('duration', positive=True)
sampling = Symbol('sampling', positive=True)
aa, bb = symbols('aa bb', real=True)

# 加权积分器：积分中的时间权重是tau，输入u(t)的正时间输出为t²/2。
eq('一1 加权积分的叠加关系', integrate(v*(aa+bb*v), (v, 0, t)), aa*integrate(v, (v, 0, t))+bb*integrate(v*v, (v, 0, t)))
eq('一1 单位冲激在1的加权响应', integrate(v*DiracDelta(v-1), (v, -oo, 3)), 1)
eq('一1 冲激延时到2时权重改变', integrate(v*DiracDelta(v-2), (v, -oo, 4)), 2)
check('一1 两次冲激输出不同证明时变', Integer(1) != Integer(2))
eq('一1 未来部分不影响当前输出', Heaviside(t-(t+1)), 0)
eq('一1 有界阶跃输入的输出', integrate(v, (v, 0, t)), t*t/2)
check('一1 有界输入产生无界尾部', limit(t*t/2, t, oo) == oo)

# 无失真与一阶高通：明确幅度/反相及稳定ROC条件。
delay = Symbol('delay', real=True)
gain = Symbol('gain', real=True)
eq('一2 延时冲激的定义变换', integrate(gain*DiracDelta(v-delay)*exp(-I*w*v), (v, -oo, oo)), gain*exp(-I*w*delay))
eq('一3 原方程零状态H', 1/(1+Rational(3, 4)*q), 4/(4+3*q))
eq('一3 DC幅度', 1/(1+Rational(3, 4)), Rational(4, 7))
eq('一3 Nyquist幅度', 1/(1-Rational(3, 4)), 4)
eq('一3 单位圆模平方分母', expand((1+Rational(3, 4)*exp(I*Om))*(1+Rational(3, 4)*exp(-I*Om))).rewrite(cos).expand(complex=True), Rational(25, 16)+Rational(3, 2)*cos(Om))
check('一3 高频端增益高于DC', Integer(4) > Rational(4, 7))
check('一3 因果H实际极点', roots(z+Rational(3, 4), z) == {-Rational(3, 4)})
eq('一3 因果核绝对和', summation(Rational(3, 4)**n, (n, 0, oo)), 4)
check('一3 另一ROC的左边尾部不趋零', limit(Rational(3, 4)**(-n-1), n, oo) == oo)

gate_inv = integrate(exp(I*w*t), (w, -100*pi, 100*pi))/(2*pi)
eq('一4 原低通门谱直接逆积分', simplify(expand((gate_inv-sin(100*pi*t)/(pi*t)).rewrite(exp))), 0)
eq('一4 h原点可去极限', limit(sin(100*pi*t)/(pi*t), t, 0), 100)

f = {-1: 1, 0: 2, 1: -2, 2: 1}
h = {0: 1, 1: -1, 2: 2}
conv = {k: sum(f.get(j, 0)*h.get(k-j, 0) for j in range(-1, 3)) for k in range(-1, 5)}
check('一5 原下标逐点卷积', list(conv.values()) == [1, 1, -2, 7, -5, 2])
eq('一5 零下标不能移到首项', conv[0], 1)
eq('一5 总和回查', sum(conv.values()), sum(f.values())*sum(h.values()))
eq('一6 门核总面积与阶跃终值', integrate(1, (v, 0, 1)), 1)
eq('一6 门核前半段阶跃积分', integrate(1, (v, 0, Rational(1, 2))), Rational(1, 2))
eq('一7 延时积分用有界输入f=1回算LT', integrate((v-2)*exp(-s*v), (v, 2, oo)), exp(-2*s)/(s*s))
F8 = (1/(2+I*(w-100))+1/(2+I*(w+100)))/2
eq('一8 衰减正弦分解所得频谱', F8, (2+I*w)/(10004-w*w+4*I*w))
eq('一8 零频面积', F8.subs(w, 0), Rational(1, 5002))
eq('一9 整数下标的固定2π周期性', exp(-I*(Om+2*pi)*n), exp(-I*Om*n))
check('一9 连续频谱不必具有2π周期', Integer(2) != 2/(1+4*pi*pi))
eq('一10 门谱首正零点', (2*sin(w*duration/2)/w).subs(w, 2*pi/duration), 0)
eq('一10 门谱主瓣零点间宽度', 2*pi/duration-(-2*pi/duration), 4*pi/duration)

# 二1：定义积分区分复系数与实谐波幅度；矩形周期信号并非严格带限。
def coeff(width, period, height, order):
    return integrate(height*exp(-I*2*pi*order*v/period), (v, -width/2, width/2))/period
tau1, T1, E1 = Rational(1, 10**6), Rational(2, 10**6), Integer(1)
tau2, T2, E2 = Rational(2, 10**6), Rational(4, 10**6), Integer(3)
eq('二1 第一脉冲谐波基间隔Hz', 1/T1, 500000)
eq('二1 第二脉冲谐波基间隔Hz', 1/T2, 250000)
eq('二1 第一首零点角频率', 2*pi/tau1, 2000000*pi)
eq('二1 第二首零点角频率', 2*pi/tau2, 1000000*pi)
eq('二1 第一首零点单边带宽Hz', 1/tau1, 1000000)
eq('二1 第二首零点单边带宽Hz', 1/tau2, 500000)
c1 = simplify(coeff(tau1, T1, E1, 1))
c2 = simplify(coeff(tau2, T2, E2, 1))
eq('二1 第一基波复系数定义积分', c1, 1/pi)
eq('二1 第二基波复系数定义积分', c2, 3/pi)
eq('二1 实余弦基波需加正负两条系数', 2*c1, 2/pi)
eq('二1 两个实基波幅度的比值', 2*c1/(2*c2), Rational(1, 3))
eq('二1 偶次谐波确实为零', coeff(tau1, T1, E1, 2), 0)
eq('二1 第三奇谐波并未被首零点截去', coeff(tau1, T1, E1, 3), -1/(3*pi))
eq('二1 所有奇谐波的非零系数形式', sin((2*n+1)*pi/2)/(pi*(2*n+1)), (-1)**n/(pi*(2*n+1)))

# 二2：原波形两段斜线；导数必须保留两个跳变冲激。
F2 = integrate((v+2)*exp(-I*w*v), (v, -2, 0))+integrate((v-2)*exp(-I*w*v), (v, 0, 4))
D2 = integrate(exp(-I*w*v), (v, -2, 4))-4-2*exp(-4*I*w)
eq('二2 分布导数从原波形变换回查', simplify((I*w*F2-D2).rewrite(exp)), 0)
eq('二2 右端跳变的冲激权重', 0-(4-2), -2)
check('二2 反转展宽平移后的原三个节点', Matrix([solve(Eq(-v/2-1, x), v)[0] for x in [4, 0, -2]]) == Matrix([-10, -2, 2]))

H3 = 4*z*(z+2)/((z+1)*(z+3))
eq('二3 根据零极点与H无穷值恢复增益', limit(H3, z, oo), 4)
eq('二3 独立部分分式', H3, 2*z/(z+1)+2*z/(z+3))
eq('二3 两指数响应首项', 2*(1+1), 4)
check('二3 -1在单位圆上而非圆外', abs(Integer(-1)) == 1)
check('二3 -3严格在单位圆外', abs(Integer(-3)) > 1)
eq('二3 原点确为单零点', limit(H3/z, z, 0), Rational(8, 3))
check('二3 因果核尾部不趋零', limit(2*(1+3**n), n, oo) == oo)

h4 = integrate((4-w)*cos(w*t)/2, (w, 2, 4))/pi
eq('二4 原斜边谱独立逆积分', simplify((h4-(cos(2*t)-cos(4*t))/(2*pi*t*t)+sin(2*t)/(pi*t)).rewrite(exp)), 0)
eq('二4 h0与谱面积回查', integrate((4-w)/2, (w, 2, 4))/pi, 1/pi)
eq('二4 输入只有角频率3通过', Rational(2, 5)*(4-3)/2, Rational(1, 5))

# 二5缺图：以下只验证明确采用串联LC/R的条件解，并构造另一合法拓扑反例。
Zseries = s/2+Rational(3, 2)+1/s
H5 = Rational(3, 2)/Zseries
eq('二5 串联拓扑条件H', H5, 3*s/((s+1)*(s+2)))
eq('二5 条件h的变换', lt(-3*exp(-t)+6*exp(-2*t)), H5)
eq('二5 初态单边KVL条件输出', Rational(3, 2)*(2/s+Rational(1, 2)-1/s)/Zseries, Rational(3, 2)/(s+1))
Zparallel = (s/2)*(1/s)/(s/2+1/s)
Hother = Rational(3, 2)/(Rational(3, 2)+Zparallel)
check('二5 同值元件的另一拓扑可有不同H', simplify(Hother-H5) != 0)
check('二5 初压1时另一拓扑y0可不同', Integer(2)-1 != Rational(3, 2))

# 三1：完整重做双延时消元、原初态递推及状态空间。
H = (1+4*q)/(1-3*q+2*q*q)
zi = lambda k: {-1: Integer(-1), -2: Integer(2)}.get(k, 0) if k < 0 else 5-12*Integer(2)**k
zs = lambda k: (Rational(5, 3)-6*Integer(2)**k+Rational(16, 3)*Integer(4)**k)*u(k)
f3 = lambda k: Integer(4)**k*u(k)
eq('三1 原图反馈与前馈消元', H, -5/(1-q)+6/(1-2*q))
check('三1 原初态齐次递推', all(zi(k)-3*zi(k-1)+2*zi(k-2) == 0 for k in range(15)))
recurrence('三1 原输入与一拍前馈的零状态递推', zs, [1, -3, 2], lambda k: f3(k)+4*f3(k-1))
check('三1 完整原初态和输入的递推', all(zi(k)+zs(k)-3*(zi(k-1)+zs(k-1))+2*(zi(k-2)+zs(k-2)) == f3(k)+4*f3(k-1) for k in range(15)))
eq('三1 零状态部分分式', H/(1-4*q), Rational(5, 3)/(1-q)-6/(1-2*q)+Rational(16, 3)/(1-4*q))
eq('三1 全响应首样本', zi(0)+zs(0), -6)
check('三1 源零状态首样本错误', -Rational(5, 3)+12-Rational(52, 3) != zs(0))
AA, BB, CC = Matrix([[0, 1], [-2, 3]]), Matrix([0, 1]), Matrix([[-2, 7]])
eq('三1 状态和直通共同回算H', (CC*(z*eye(2)-AA).inv()*BB)[0]+1, H.subs(q, 1/z))

# 三2：因果双线性微分器的单位圆极点，不伪称普通DTFT收敛。
Hd = 2/sampling*(1-q)/(1+q)
eq('三2 单延时实现', (2/sampling-4/(sampling*(z+1))).subs(z, 1/q), Hd)
eq('三2 单位圆形式代入', simplify((Hd.subs(q, exp(-I*Om))-I*2/sampling*tan(Om/2)).rewrite(exp)), 0)
eq('三2 正频率样例相位', Hd.subs(q, exp(-I*pi/2)), 2*I/sampling)
eq('三2 负频率样例相位翻转', Hd.subs(q, exp(I*pi/2)), -2*I/sampling)
eq('三2 因果冲激响应尾项不趋零', limit(abs(4*(-1)**n/sampling), n, oo), 4/sampling)
finish()

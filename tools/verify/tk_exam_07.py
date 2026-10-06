"""第七套（原卷未编号）：依据原式、原图独立积分和递推，不读取网页答案。"""
from common import *

v = Symbol('v', real=True)
q = Symbol('q', real=True)
omega = Symbol('omega', real=True)
R = Symbol('R', positive=True)
delay = Symbol('delay', real=True)
T = Symbol('T', positive=True)
cut = Symbol('cut', positive=True)
kint = Symbol('kint', integer=True)

eq('一1 零输入反例破坏齐次性', 2*0-1, -1)
eq('一1 固定延时保持输出关系', 2*(v-delay)**2-1, (2*v*v-1).subs(v, v-delay))
M = Symbol('M', positive=True)
check('一1 有界输入端点的最大输出幅度', expand((2*M+1)**2-(2*M-1)**2) > 0)
eq('一2 冲激乘余弦的测试函数筛选', cos(2*v).subs(v, 0), 1)
ff = {-1: 1, 0: 2, 1: -2, 2: 1}
hh = {0: 1, 1: -1, 2: 2}
yy = {j: sum(ff.get(m, 0)*hh.get(j-m, 0) for m in range(-1, 3)) for j in range(-2, 6)}
check('一3 按绝对下标独立卷积', [yy[j] for j in range(-1, 5)] == [1, 1, -2, 7, -5, 2])
eq('一3 z多项式独立交叉检查', expand((z+2-2/z+1/z**2)*(1-1/z+2/z**2)), z+1-2/z+7/z**2-5/z**3+2/z**4)
eq('一3 卷积和及原序列总和', sum(yy.values()), sum(ff.values())*sum(hh.values()))
fs = 1+Rational(1, 2)*exp(I*pi)*exp(I*v)+Rational(1, 2)*exp(-I*pi)*exp(-I*v)-I*exp(3*I*v)/5+I*exp(-3*I*v)/5
eq('一4 复指数级数成对合成', expand_complex(fs), 1-cos(v)+Rational(2, 5)*sin(3*v))
eq('一4 周期2π的DC回算', integrate(1-cos(v)+Rational(2, 5)*sin(3*v), (v, -pi, pi))/(2*pi), 1)
signal5 = exp(-2*v)*cos(100*v)
eq('一5 定义积分分解为两个衰减指数', integrate(exp((-2+I*(100-w))*v)/2+exp((-2-I*(100+w))*v)/2, (v, 0, oo), conds='none'), (2+I*w)/((2+I*w)**2+10000))
eq('一5 分母实虚部分', expand((2+I*w)**2+10000), 10004-w*w+4*I*w)
eq('一6 DTFT基函数的2π周期性', exp(-I*2*pi*kint), 1)
G = 1-2*exp(-I*omega)+3*exp(-2*I*omega)
eq('一6 有限序列DTFT周期实例', G.subs(omega, omega+2*pi), G)
dual_inverse = integrate(exp((1+I*v)*omega), (omega, -oo, 0), conds='none')+integrate(exp((-1+I*v)*omega), (omega, 0, oo), conds='none')
eq('一7 对偶性质用逆定义积分回查', dual_inverse, 2/(1+v*v))
width = Symbol('width', positive=True)
rect = integrate(exp(-I*w*v), (v, -width/2, width/2))
eq('一8 门函数频谱按定义积分', simplify((rect-2*sin(w*width/2)/w).rewrite(exp)), 0)
eq('一8 主瓣零点随时宽变化', (4*pi/width).subs(width, 2*width), 2*pi/width)
eq('一9 不绝对可积Sa信号的条件收敛积分', integrate(sin(v)/v, (v, -oo, oo)), pi)
eq('一9 增长指数有拉氏变换', lt(exp(t)), 1/(s-1))
eq('一9 指数加权解释', exp(-v)*exp(-s*v), exp(-(s+1)*v))
eq('一10 正半轴Dirichlet积分', integrate(sin(v)/v, (v, 0, oo)), pi/2)

# 二1：按每个台阶的时间区间积分，再用几何级数回算。
one_interval = integrate(exp(-s*v), (v, 2*n, 2*(n+1)))
eq('二1 第n个区间拉氏积分', one_interval, exp(-2*s*n)*(1-exp(-2*s))/s)
eq('二1 加权几何级数还原F', (1-exp(-2*s))/s/(1-exp(-2*s))**2, 1/(s*(1-exp(-2*s))))
eq('二1 原点右值与初值极限', limit(1/(1-exp(-2*s)), s, oo), 1)
check('二1 每隔2秒增加一个单位阶跃', all(sum(int(bool(vv >= 2*j)) for j in range(10)) == int(vv//2)+1 for vv in [Rational(j, 4) for j in range(0, 65)]))
eq('二1 长期增长率', limit((n+1)/(2*n+1), n, oo), Rational(1, 2))

# 二2：从两个原图斜边的逆积分求h，不用资料中间式。
pos = integrate((4-omega)/2*exp(I*omega*t), (omega, 2, 4))
neg = integrate((4+omega)/2*exp(I*omega*t), (omega, -4, -2))
h2 = (cos(2*t)-cos(4*t))/(2*pi*t*t)-sin(2*t)/(pi*t)
eq('二2 原图两段逆变换定义积分', simplify((pos+neg)/(2*pi)), h2)
eq('二2 与Sa写法等价', sin(t)*sin(3*t)/(pi*t*t)-sin(2*t)/(pi*t), h2)
eq('二2 h原点可去极限', limit(h2, t, 0, dir='+'), 1/pi)
eq('二2 唯一通过的输入谐波', Rational(2, 5)*Rational(4-3, 2), Rational(1, 5))
eq('二2 原图谱的面积', (integrate((4-omega)/2, (omega, 2, 4))+integrate((4+omega)/2, (omega, -4, -2)))/(2*pi), 1/pi)

# 二3：并联再串联的定义卷积及传递函数均回算。
combined = lambda k: (2-Rational(1, 2)**k)*u(k)
check('二3 并联核再卷积逐样本', all(sum(Rational(1, 2)**j*u(j)*u(k-j-1) for j in range(0, max(k+1, 0)))+Rational(1, 2)**k*u(k) == combined(k) for k in range(-8, 21)))
eq('二3 z域并联串联合成', (q/(1-q)+1)/(1-q/2), 2/(1-q)-1/(1-q/2))
eq('二3 首样本和非衰减尾部', combined(0), 1)
eq('二3 核不趋于零，系统不稳定', limit(2-Rational(1, 2)**n, n, oo), 2)

# 二4：x(1-2t)的分段定义及积分。
fleft = 2-2*v
fright = 2*v
eq('二4 左半段按原图尺度反转', 1+(1-2*v), fleft)
eq('二4 右半段按原图尺度反转', 1-(1-2*v), fright)
eq('二4 面积直接积分', integrate(fleft, (v, 0, Rational(1, 2)))+integrate(fright, (v, Rational(1, 2), 1)), Rational(3, 2))
eq('二4 能量直接积分', integrate(fleft*fleft, (v, 0, Rational(1, 2)))+integrate(fright*fright, (v, Rational(1, 2), 1)), Rational(7, 3))
F4 = integrate(fleft*exp(-I*w*v), (v, 0, Rational(1, 2)))+integrate(fright*exp(-I*w*v), (v, Rational(1, 2), 1))
target = (4*sin(w/2)/w-8*sin(w/4)**2/(w*w))*exp(-I*w/2)
eq('二4 傅里叶变换定义积分', simplify((F4-target).rewrite(exp)), 0)
eq('二4 F零频极限', limit(F4, w, 0), Rational(3, 2))
eq('二4 对称截断中的跳点平均值', Rational(0+2, 2), 1)
# 正负频率相加后只剩偶实部；实部积分收敛到π。
real_pair = 2*sin(w)/w+(2+2*cos(w)-4*cos(w/2))/(w*w)
eq('二4 频谱实部独立化简', trigsimp(expand_complex(F4)).as_real_imag()[0], real_pair)
eq('二4 对称主值第一项', 2*integrate(2*sin(v)/v, (v, 0, oo)), 2*pi)
# 两个1/w²余项的对称积分互相抵消。
eq('二4 可积余项的独立积分', 2*(4*integrate((1-cos(v/2))/(v*v), (v, 0, oo))-2*integrate((1-cos(v))/(v*v), (v, 0, oo))), 0)
imag_tail = -2*(1-cos(w))/w+8*sin(w/4)**2*sin(w/2)/(w*w)
eq('二4 非对称尾部的虚部表达式', expand_complex(F4).as_real_imag()[1], imag_tail)
eq('二4 虚部主项的积分原函数', diff(-2*log(v)+2*Ci(v), v), -2*(1-cos(v))/v)
check('二4 分开两尾积分不收敛', limit(-2*log(R)+2*Ci(R), R, oo) == -oo)
eq('二4 Parseval频域能量', 2*pi*Rational(7, 3), 14*pi/3)
eq('二4 频谱加门窗的卷积定义积分', 2*pi*(integrate(fleft, (v, 0, Rational(1, 2)))+integrate(fright, (v, Rational(1, 2), 1))), 3*pi)

# 二5：先并联延时，再截取Sa输入的实际频谱支撑。
inv_rect = integrate(exp(I*omega*(t-delay)), (omega, -cut, cut))/(2*pi)
eq('二5 低通逆变换定义积分', simplify((inv_rect-sin(cut*(t-delay))/(pi*(t-delay))).rewrite(exp)), 0)
eq('二5 延时并联的频域系数', exp(-I*w*delay)*(1+exp(-I*w*T)), exp(-I*w*delay)+exp(-I*w*(delay+T)))
eq('二5 输入未截频时的逆积分', integrate(exp(I*omega*(t-delay)), (omega, -1, 1))/2, sin(t-delay)/(t-delay))
eq('二5 输入截频后的增益是cut', integrate(exp(I*omega*(t-delay)), (omega, -cut, cut))/2, sin(cut*(t-delay))/(t-delay))
eq('二5 两分支输出相同延时规律', sin(cut*(t-delay-T))/(t-delay-T), (sin(cut*(t-delay))/(t-delay)).subs(t, t-T))
eq('二5 临界cut=1两种解一致', (sin(cut*(t-delay))/(t-delay)).subs(cut, 1), sin(t-delay)/(t-delay))

# 三1：冲激周期积分、实际线谱支撑和各条谱线增益。
eq('三1 单周期冲激指数FS系数', integrate(DiracDelta(v)*exp(-I*Rational(3, 2)*pi*n*v), (v, -Rational(2, 3), Rational(2, 3)))/Rational(4, 3), Rational(3, 4))
eq('三1 基频从周期回算', 2*pi/Rational(4, 3), 3*pi/2)
check('三1 只有n=-1,0,1落于通带', [j for j in range(-6, 7) if abs(3*pi*j/2) < 2*pi] == [-1, 0, 1])
line_y = sum(Rational(3, 4)*exp(I*3*pi*j*(v-Rational(3, 2))/2) for j in [-1, 0, 1])
eq('三1 通过谱线直接重构输出', expand_complex(line_y), Rational(3, 4)+3*sqrt(2)/4*(cos(3*pi*v/2)+sin(3*pi*v/2)))
eq('三1 输出DC与冲激串平均值相同', integrate(expand_complex(line_y), (v, 0, Rational(4, 3)))/Rational(4, 3), Rational(3, 4))

# 三2：从原图w、延时和输出支路消元，再直接用原初值递推。
H = (1+4*q)/(1-3*q+2*q*q)
eq('三2 原图消元和零状态系统函数', (1+4*q)/(1-3*q+2*q*q), -5/(1-q)+6/(1-2*q))
zi = lambda k: { -1: Integer(-1), -2: Integer(2)}.get(k, 0) if k < 0 else 5-12*Integer(2)**k
zs = lambda k: (Rational(5, 3)-6*Integer(2)**k+Rational(16, 3)*Integer(4)**k)*u(k)
ff3 = lambda k: Integer(4)**k*u(k)
check('三2 零输入保留原初态的齐次递推', all(zi(k)-3*zi(k-1)+2*zi(k-2) == 0 for k in range(18)))
recurrence('三2 零状态逐样本原图递推', zs, [1, -3, 2], lambda k: ff3(k)+4*ff3(k-1))
check('三2 完全响应带原初态递推', all(zi(k)+zs(k)-3*(zi(k-1)+zs(k-1))+2*(zi(k-2)+zs(k-2)) == ff3(k)+4*ff3(k-1) for k in range(18)))
eq('三2 零输入部分分式', (-7+2*q)/(1-3*q+2*q*q), 5/(1-q)-12/(1-2*q))
eq('三2 零状态正确部分分式', H/(1-4*q), Rational(5, 3)/(1-q)-6/(1-2*q)+Rational(16, 3)/(1-4*q))
eq('三2 完全响应独立相加', zi(t)+zs(t), Rational(20, 3)-18*2**t+Rational(16, 3)*4**t)
eq('三2 零状态首项必须是1', zs(0), 1)
eq('三2 完全响应首项必须是-6', zi(0)+zs(0), -6)
wrong_zs = -Rational(5, 3)+12-Rational(52, 3)
check('三2 原零状态首样本不满足原方程', wrong_zs != 1)
h = lambda k: (-5+6*Integer(2)**k)*u(k)
recurrence('三2 h逐样本回查', h, [1, -3, 2], lambda k: int(k == 0)+4*int(k == 1))
AA = Matrix([[0, 1], [-2, 3]])
BB = Matrix([0, 1])
CC = Matrix([[-2, 7]])
eq('三2 状态实现加直通回算H', (CC*(z*eye(2)-AA).inv()*BB)[0]+1, H.subs(q, 1/z))
eq('三2 原图直通与h0一致', limit(H.subs(q, 1/z), z, oo), h(0))
check('三2 因果ROC极点确实包含1与2', roots(z*z-3*z+2, z) == {1, 2})
finish()

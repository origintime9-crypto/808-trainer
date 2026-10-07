"""课程17独立复核：按原题定义积分、ROC、变换及原微分式验算。"""
from common import *

v = Symbol('v', real=True)
omega = Symbol('omega', real=True)
a = Symbol('a', real=True)

# 原点信息属于题设，不从网页答案读入。
f = {0: 1, 1: 1, 2: 1}
h = {1: 1, 2: 2, 3: 3}
expected = {1: 1, 2: 3, 3: 6, 4: 5, 5: 3}
for k in range(-2, 8):
    eq('一1 定义卷积k='+str(k), sum(value*h.get(k-j, 0) for j, value in f.items()), expected.get(k, 0))
eq('一1 卷积总和回原序列总和', sum(expected.values()), sum(f.values())*sum(h.values()))

D = s*s+4*s+8
eq('一2 共轭极点生成分母', (s+2-2*I)*(s+2+2*I), D)
gain = Symbol('gain', real=True)
eq('一2 右初值确定增益', solve(Eq(limit(s*gain*(s-2)/D, s, oo), 2), gain)[0], 2)
Hplot = 2*(s-2)/D
hp = 2*exp(-2*t)*cos(2*t)-4*exp(-2*t)*sin(2*t)
eq('一2 独立逆式回LT定义', lt(hp), Hplot)
eq('一2 冲激响应普通右值', hp.subs(t, 0), 2)
eq('一2 实零点必须为正2', Hplot.subs(s, 2), 0)

unilateral = integrate(exp(-s*v), (v, 0, 2))
eq('一3 单边只积分正时间段', unilateral, (1-exp(-2*s))/s)
eq('一3 s0可去奇点值', limit(unilateral, s, 0), 2)
bilateral = integrate(exp(-s*v), (v, -2, 2))
check('一3 单边不等于整段双边', simplify(unilateral-bilateral) != 0)

Fz = z*z/((z-1)*(z-2))
eq('一4 两个指定ROC分式', -z/(z-1)+2*z/(z-2), Fz)
ratio = Symbol('ratio', positive=True)
eq('一4 右边单位序列几何和', summation(ratio**n, (n, 0, oo)).subs(ratio, Rational(1, 2)), 2)
eq('一4 左边极点2的负样本定义和', -summation(2**(1-n)*Rational(3,2)**n, (n, 1, oo)), -6)
eq('一4 环域内z=3/2的序列定义变换', -3-6, Fz.subs(z, Rational(3,2)))
def annular(k):
    return -Integer(1) if k >= 0 else -Integer(2)**(k+1)
recurrence('一4 两边序列回原有理递推', annular, [1, -3, 2], lambda k: int(k==0))

eq('一5 尺度压缩后临界抽样间隔', 2*pi/(2*2*2*pi), Rational(1,4))
alpha = Symbol('alpha', positive=True)
regularized_inverse = integrate(exp(alpha*(v-1))*exp(I*v*t)/pi, (v, -oo, 1))
eq('一6 半无限谱正则化的定义逆积分', regularized_inverse, exp(I*t)/(pi*(alpha+I*t)))
eq('一6 实部形成单位δ的面积', integrate(alpha/(pi*(alpha**2+v*v)), (v, -oo, oo)), 1)
eq('一6 非原点正则化极限负号', limit(regularized_inverse, alpha, 0, dir='+'), -I*exp(I*t)/(pi*t))

# 两积分器直接型：q1=q，q2=q′，输出q1+2q2。
A = Matrix([[0,1],[-2,-3]])
B = Matrix([0,1])
C = Matrix([[1,2]])
eq('一7 状态式回算原微分方程传输', (C*(s*eye(2)-A).inv()*B)[0], (2*s+1)/(s*s+3*s+2))
eq('一8 阶跃响应普通导数', diff(1-exp(-2*t), t), 2*exp(-2*t))
eq('一8 起点值为零无额外δ', (1-exp(-2*t)).subs(t, 0), 0)
eq('一9 零频面积定义', integrate(3*v, (v, 0, 1)), Rational(3,2))

# 由原三角式的正频率复系数校验两个不同幅度口径。
cs = {0: Integer(1), 1: exp(-I*pi/4), 3: exp(I*pi/3)/4, 5: exp(-I*5*pi/12)/8}
for harmonic, expected_amp in [(1,2),(3,Rational(1,2)),(5,Rational(1,4))]:
    eq('一10 第'+str(harmonic)+'次单边振幅', 2*Abs(cs[harmonic]), expected_amp)
    eq('一10 第'+str(harmonic)+'次复系数共轭重构',
       cs[harmonic]*exp(I*harmonic*t)+conjugate(cs[harmonic])*exp(-I*harmonic*t),
       {1:2*cos(t-pi/4),3:cos(3*t+pi/3)/2,5:cos(5*t-5*pi/12)/4}[harmonic])
eq('一10 含直流的周期平均功率', cs[0]**2+sum(2*Abs(cs[k])**2 for k in [1,3,5]), Rational(101,32))

def geo(k):
    return a**k if k >= 0 else Integer(0)
for k in range(-3, 12):
    eq('二1 两核定义卷积k='+str(k), geo(k)-a*geo(k-1), int(k==0))
eq('二1 稳定核在余弦频率4的传输相消', (1-a*exp(-4*I))/(1-a*exp(-4*I)), 1)
eq('二1 a0的卷积核依然为δ', geo(0).subs(a, 0), 1)

left, right = 3*(v+1), 3*(3-v)
tw = Symbol('triangle_w', real=True, nonzero=True)
triangle = integrate(left*exp(-I*tw*v), (v, -1, 1))+integrate(right*exp(-I*tw*v), (v, 1, 3))
eq('二2(1) 原三角面积', integrate(left, (v, -1,1))+integrate(right,(v,1,3)), 12)
eq('二2(2) 时域原点到频谱积分', 2*pi*left.subs(v,0), 6*pi)
eq('二2(3) 能量定义', integrate(left**2,(v,-1,1))+integrate(right**2,(v,1,3)), 48)
# 由两宽2单位门的卷积、峰高和时移导出FT，可去零点另验。
eq('二2 非零频率原波形定义FT回核', triangle, 12*exp(-I*tw)*(sin(tw)/tw)**2)
eq('二2 定义谱的原点可去极限', limit(triangle,tw,0), 12)
eq('二2 时移因子不能遗漏', diff(exp(-I*omega),omega).subs(omega,0), -I)

Rpart, Ipart, theta, phase = symbols('Rpart Ipart theta phase', real=True)
eq('二3 复响应取实部的代数证明', re((Rpart+I*Ipart)*exp(I*theta)), Rpart*cos(theta)-Ipart*sin(theta))
amp = Symbol('amp', nonnegative=True)
eq('二3 幅相式展开证明', amp*cos(phase)*cos(theta)-amp*sin(phase)*sin(theta), amp*cos(theta+phase))

# 换元雅可比1/3与两个压缩FT系数1/3独立核对。
eq('二4 时域换元缩放系数', Rational(1,3), diff(v/3,v))
eq('二4 频域两次压缩系数与Ay3t一致', Rational(1,3)**2, Rational(1,3)/3)
fexp, hexp = exp(-t), exp(-2*t)
ysample = exp(-t)-exp(-2*t)
rsample = integrate(exp(-3*v)*exp(-6*(t-v)), (v,0,t))
eq('二4 非平凡指数样本直接积分', rsample, ysample.subs(t,3*t)/3)

P = s*s+5*s+6
Q = s*s+3*s+2
X = 1/s+1/(s+1)
Yzs = cancel(Q*X/P)
yzs = Rational(1,3)+Rational(5,3)*exp(-3*t)
yzi = 4*exp(-2*t)-3*exp(-3*t)
yfull = 4*exp(-2*t)-Rational(4,3)*exp(-3*t)+Rational(1,3)
eq('二5 零状态逆式回LT', lt(yzs), Yzs)
eq('二5 零输入回原齐次微分式', diff(yzi,t,2)+5*diff(yzi,t)+6*yzi, 0)
eq('二5 两响应相加回原给定完全响应', yzi+yzs, yfull)
eq('二5 输入作用下正时间微分方程', diff(yfull,t,2)+5*diff(yfull,t)+6*yfull, diff(1+exp(-t),t,2)+3*diff(1+exp(-t),t)+2*(1+exp(-t)))
eq('二5 零输入右初值', yzi.subs(t,0), 1)
eq('二5 零输入普通右导数', diff(yzi,t).subs(t,0), 1)
eq('二5 输入直接项使零状态右值2', yzs.subs(t,0), 2)
eq('二5 完全响应普通右导数', diff(yfull,t).subs(t,0), -4)
eq('二5 原点δprime跳变系数', yfull.subs(t,0)-yzi.subs(t,0), 2)
eq('二5 原点δ跳变系数', diff(yfull,t).subs(t,0)-diff(yzi,t).subs(t,0)+5*2, 5)

Hall = (s-1)/(s+1)
Y = 1/(s+2)
Finput = Y/Hall
fcausal = 2*exp(t)/3+exp(-2*t)/3
eq('三1(1) 因果逆输入定义LT', lt(fcausal), Finput)
eq('三1(1) 前向系统乘回所给输出', cancel(Hall*lt(fcausal)), Y)
stable_input = -Rational(2,3)*integrate(exp(v)*exp(-s*v),(v,-oo,0),conds='none')+Rational(1,3)/(s+2)
eq('三1(1) 稳定非因果逆输入的双边LT', stable_input, Finput)
eq('三1(1) 两不同输入的差为零点指数', fcausal-exp(-2*t)/3, 2*exp(t)/3)
stable_past = integrate(exp(-v)*exp(-2*(t-v))/3,(v,0,t))-integrate(exp(-v)*2*exp(t-v)/3,(v,t,oo))
eq('三1(1) 双边有界输入实际卷积的正时间输出', exp(-2*t)/3-2*stable_past, exp(-2*t))
tm = Symbol('tm', negative=True)
eq('三1(1) 双边有界输入实际卷积的负时间输出', -2*exp(tm)/3-2*integrate(-2*exp(-v)*exp(tm-v)/3,(v,0,oo)), 0)
eq('三1(1) 所差全时间指数实际卷积为0', exp(t)-2*integrate(exp(-v)*exp(t-v),(v,0,oo)),0)
anti_positive = integrate(exp(-v)*exp(-2*(t-v))/3,(v,-oo,0))
eq('三1(1) 同一有界输入在左ROC前向实现的正时间输出', exp(-2*t)/3+2*anti_positive, exp(-2*t))
anti_negative = integrate(exp(-v)*exp(-2*(tm-v))/3,(v,-oo,tm))-integrate(exp(-v)*2*exp(tm-v)/3,(v,tm,0))
eq('三1(1) 同一有界输入在左ROC前向实现的负时间输出', -2*exp(tm)/3+2*anti_negative, 0)
eq('三1(1) 有界输入在前向极点处的加权总面积为0', -Rational(2,3)*integrate(exp(2*v),(v,-oo,0))+Rational(1,3)*integrate(exp(-v),(v,0,oo)),0)
eq('三1(2) 前向唯一有限极点', (s+1).subs(s,-1), 0)
eq('三1(2) 正直通加稳定尾部', Hall, 1-2/(s+1))
eq('三1(3) 原因果指数输入输出的LT', lt(-exp(-t)+2*exp(-3*t)), Hall/(s+3))
Hw = Hall.subs(s,I*omega)
eq('三1(4) 全通幅度平方', Hw*conjugate(Hw), 1)
eq('三1(4) 原点增益为负1', Hw.subs(omega,0), -1)
eq('三1(4) 展开的实虚部', Hw, (omega**2-1+2*I*omega)/(1+omega**2))
for freq, expected in [(1,I),(sqrt(3),exp(I*pi/3)),(-1,-I)]:
    eq('三1(4) 具体频点相位'+str(freq), Hw.subs(omega,freq), expected)
eq('三1(5) 一积分器模型回传输', 1-2/(s+1), Hall)

Hlast = (4*s+2)/((s+1)*(s+3))
hlast = -exp(-t)+5*exp(-3*t)
eq('三2(1) 冲激响应定义LT', lt(hlast), Hlast)
eq('三2(1) 首值4', hlast.subs(t,0), 4)
check('三2(2) 因果实际极点严格左半平面', roots((s+1)*(s+3),s)=={-1,-3})
eq('三2(2) 绝对积分的有限上界', integrate(exp(-v)+5*exp(-3*v),(v,0,oo)), Rational(8,3))
eq('三2(3) 直流增益', Hlast.subs(s,0), Rational(2,3))
eq('三2(3) 正弦频率1恰为单位复增益', Hlast.subs(s,I), 1)
response = 4+10*cos(t+pi/4)
forcing = 6+10*cos(t+pi/4)
eq('三2(3) 稳态答案回原微分方程', diff(response,t,2)+4*diff(response,t)+3*response, 4*diff(forcing,t)+2*forcing)
finish()

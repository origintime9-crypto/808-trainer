"""课程11：从p54..56题面和图直接计算，含重复来源，不读取网站答案。"""
from common import *

v = Symbol('v', real=True)
omega = Symbol('omega', real=True)
aa = Symbol('aa', positive=True)
ww = Symbol('ww', positive=True)
q = Symbol('q')

shift = Symbol('shift', negative=True)
eq('一1 原节点在移位后的坐标', (v+shift)-v, shift)
check('一1 负移位参数向左', shift < 0)
eq('一2 连续FT一般不固定2π周期的反例', (1/(1+I*omega)).subs(omega, 0), 1)
check('一2 同一连续谱增2π不等于原值', simplify(1/(1+I*2*pi)-1) != 0)
eq('一2 离散指数核的2π周期', exp(-I*(omega+2*pi)*n), exp(-I*omega*n))
eq('一3 冲激位置不在积分域内', integrate(4*v*v*DiracDelta(v+1), (v, 0, oo)), 0)
eq('一4 单边衰减正则化的FT', integrate(exp(-(aa+I*omega)*v), (v, 0, oo), conds='none'), 1/(aa+I*omega))
eq('一4 正则化实部的总面积', integrate(aa/(aa*aa+omega*omega), (omega, -oo, oo)), pi)
eq('一4 非零频率的虚部极限', limit(-omega/(aa*aa+omega*omega), aa, 0, dir='+'), -1/omega)

lags = list(range(-1, 6))
eq('一5 滑动和为七项', len(lags), 7)
check('一5 包含未来样本所以非因果', max(lags) > 0)
check('一5 包含多个时刻所以有记忆', min(lags) != max(lags))
check('一5 同一移位后的访问下标相等', [k-3 for k in lags] == [(-3)+k for k in lags])
eq('一5 正单位输入达到七倍上界', sum(Integer(1) for k in lags), 7)
eq('一6 原点取样不产生尺度因子', integrate((1+2*v)*DiracDelta(v), (v, -oo, oo)), 1)
freq, t0 = symbols('freq t0', real=True)
eq('一7 正弦调制的两指数差', (exp(I*freq*t0)-exp(-I*freq*t0))/(2*I), sin(freq*t0))
eq('一7 平方与正弦调制的两个系数相乘', 1/(2*pi)/(2*I), 1/(4*pi*I))
eq('一8 Hz的临界低通抽样率', 2*100000, 200000)
eq('一8 临界抽样间隔', 1/Integer(200000), Rational(5, 1000000))
eq('一8 边缘正弦在临界抽样点丢失的例子', sin(2*pi*100000*n/200000), 0)
eq('一9 因果积分等于与u卷积的有界样例', integrate(v+1, (v, 0, t)), t*t/2+t)

def given_step(value):
    return exp(-value)*Heaviside(value)+Heaviside(-1-value)

def actual_step(value):
    # h=g'中的三项从远负时间积分；原给定g与该通常阶跃响应相差常数1。
    return Heaviside(value)-(1-exp(-value))*Heaviside(value)-Heaviside(value+1)

check('一10 两移位阶跃叠加的五段样例', all(simplify(
    given_step(x-1)-given_step(x-2)-(
        exp(-(x-1))*Heaviside(x-1)-exp(-(x-2))*Heaviside(x-2)+Heaviside(-x)-Heaviside(1-x)
    )) == 0 for x in [Rational(-3, 2), Rational(1, 2), Rational(3, 2), Rational(5, 2), 4]))
eq('一10 原阶跃的远负时间不是0', given_step(-2), 1)
eq('一10 导数核的通常阶跃积分却为0', actual_step(-2), 0)
check('一10 两阶跃响应的常数差确为1', all(simplify(given_step(x)-actual_step(x)) == 1 for x in [-2, Rational(-1, 2), Rational(1, 2), 2]))
check('一10 矩形输入消去未定常数基线', all(simplify(
    given_step(x-1)-given_step(x-2)-actual_step(x-1)+actual_step(x-2)
    ) == 0 for x in [Rational(-3, 2), Rational(1, 2), Rational(3, 2), Rational(5, 2)]))

# 连续二阶系统：先由单边导数项与左初态求变换，再独立回算解析式。
H = s/(s+1)**2
Yi = (s+4)/(s+1)**2
Ys = H/(s+1)
yi = (1+3*t)*exp(-t)
ys = (t-t*t/2)*exp(-t)
y = (1+4*t-t*t/2)*exp(-t)
eq('二1 单边变换初态分子', (s*1+2+2*1)/(s*s+2*s+1), Yi)
eq('二1 零输入的定义变换', lt(yi), Yi)
eq('二1 零状态的系统与输入乘积', lt(ys), Ys)
eq('二1 两部分相加得到完全响应', yi+ys, y)
eq('二1 零输入原左初值', yi.subs(t, 0), 1)
eq('二1 零输入原左导数', diff(yi, t).subs(t, 0), 2)
eq('二1 零状态在原点不跳值', ys.subs(t, 0), 0)
eq('二1 输入导数含冲激使右导数增加1', diff(ys, t).subs(t, 0), 1)
eq('二1 正时间微分方程', diff(y, t, 2)+2*diff(y, t)+y, -exp(-t))
eq('二1 完全响应右导数为3', diff(y, t).subs(t, 0), 3)
eq('二1 冲激响应的定义变换', lt((1-t)*exp(-t)), H)
eq('二1 频响实际代入', H.subs(s, I*omega), I*omega/(1+I*omega)**2)
eq('二1 核绝对积分按t1分段', integrate((1-t)*exp(-t), (t, 0, 1))+integrate((t-1)*exp(-t), (t, 1, oo)), 2/E)
check('二1 因果实际极点', roots((s+1)**2, s) == {-1})

# 原零极点图中的参数由|cos t|直流独立定标。
dc = integrate(cos(v), (v, -pi/2, pi/2))/pi
eq('二2 绝对余弦的一个周期平均值', dc, 2/pi)
gain = (5/pi)/dc
eq('二2 从输入输出直流比得到H0', gain, Rational(5, 2))
base = (s-2)/((s+4)*(s*s+2*s+5))
K = gain/base.subs(s, 0)
eq('二2 由DC定标的比例常数', K, -25)
H2 = K*base
check('二2 原图三个极点', roots((s+4)*(s*s+2*s+5), s) == {-4, -1+2*I, -1-2*I})
eq('二2 原图唯一有限零点', simplify(H2).subs(s, 2), 0)
eq('二2 全时域常量的零状态输出', H2.subs(s, 0), Rational(5, 2))
eq('二2 与零初态阶跃初值不同', limit(H2, s, oo), 0)

# 离散二阶系统，输入2^k与极点2共振，必须含k乘幂。
def zi(k):
    if k == -1 or k == -2: return Integer(1)
    return 8*Integer(2)**k-9*Integer(3)**k

def zs(k):
    return (3*Integer(3)**k-(k+3)*Integer(2)**k)*u(k)

def full(k):
    if k == -1 or k == -2: return Integer(1)
    return (5-k)*Integer(2)**k-6*Integer(3)**k

recurrence('二3 零输入逐点回原初态齐次式', zi, [1, -5, 6], lambda k: 0, lo=0, hi=18)
recurrence('二3 零状态逐点回延时输入', zs, [1, -5, 6], lambda k: Integer(2)**(k-1)*u(k-1), lo=0, hi=18)
recurrence('二3 完全响应逐点回原方程', full, [1, -5, 6], lambda k: Integer(2)**(k-1)*u(k-1), lo=0, hi=18)
check('二3 三个首样本复核', [full(k) for k in range(3)] == [-1, -10, -42])
check('二3 零输入加零状态', all(zi(k)+zs(k) == full(k) for k in range(18)))
Hd = q/(1-5*q+6*q*q)
eq('二3 系统函数的因式化', Hd.subs(q, 1/z), z/((z-2)*(z-3)))
eq('二3 原左初态的单边分子', ((5-6*q)*1-6*1)/(1-5*q+6*q*q), 8/(1-2*q)-9/(1-3*q))
eq('二3 共振的零状态变换', Hd/(1-2*q), 3/(1-3*q)-3/(1-2*q)-2*q/(1-2*q)**2)
recurrence('二3 冲激核带一时刻延时', lambda k: (Integer(3)**k-Integer(2)**k)*u(k), [1, -5, 6], lambda k: int(k == 1))
check('二3 冲激核首项012的实际值', [3**k-2**k for k in range(3)] == [0, 1, 5])
check('二3 最大极点3位于单位圆外', roots(z*z-5*z+6, z) == {2, 3})
eq('二4 衰减正弦的定义LT到FT', lt(exp(-aa*t)*sin(ww*t)).subs(s, I*omega), ww/((aa+I*omega)**2+ww**2))
check('二4 正时间核衰减确保FT存在', limit(exp(-aa*t), t, oo) == 0)
eq('二5 绝对和在参数1/2时的定义求和', summation(Rational(1, 2)**n, (n, 0, oo)), 2)
check('二5 单位模参数的核不衰减', Abs((-1)**n) == 1)
check('二5 因果序列负时间样本为0', all(u(k) == 0 for k in range(-8, 0)))

# 两组完全重复的图仍从本卷条件重新运算，不读取旧验证或网页常量。
cutoff = 80*pi
low = integrate(exp(I*omega*(t-2)), (omega, -cutoff, cutoff))/(2*pi)
eq('三1 高通低通互补部分逆积分', simplify(expand((low-sin(cutoff*(t-2))/(pi*(t-2))).rewrite(exp))), 0)
eq('三1 高通直通的延时因子', integrate(DiracDelta(v-2)*exp(-I*omega*v), (v, -oo, oo)), exp(-2*I*omega))
check('三1 稳态输入三频率筛选', [abs(vv)>cutoff for vv in [0, 60*pi, 120*pi]] == [False, False, True])
eq('三1 输出的延时为120个周期', cos(120*pi*(t-2)), cos(120*pi*t))

def F(value):
    return 2*Max(1-Abs(sympify(value))/10, 0)

def B(value):
    return (F(value-100)+F(value+100))/2

def C(value):
    return B(value) if 80<abs(value)<100 else Integer(0)

def D(value):
    return (C(value-100)+C(value+100))/2

def Out(value):
    return D(value) if abs(value)<15 else Integer(0)

points = [Rational(k, 2) for k in range(-430, 431) if k%2]
eq('三2 A余弦的正负谱线强度', 2*pi/2, pi)
check('三2 B两副本峰值与支撑', B(100) == 1 and B(-100) == 1 and all(B(vv) == 0 for vv in points if not 90<abs(vv)<110))
check('三2 C只留下向原点的半谱', all(C(vv) == ((vv-90)/10 if vv>0 else (-vv-90)/10) for vv in points if 90<abs(vv)<100))

def expected_d(value):
    if abs(value)<10: return F(value)/4
    if -200<value<-190: return (-190-value)/20
    if 190<value<200: return (value-190)/20
    return Integer(0)

check('三2 D半带移频的全部频段', all(D(vv) == expected_d(vv) for vv in points))
check('三2 E全基带只缩为1/4', all(Out(vv) == F(vv)/4 for vv in points))
inv_F = (integrate(2*(1+omega/10)*exp(I*omega*t), (omega, -10, 0))+integrate(2*(1-omega/10)*exp(I*omega*t), (omega, 0, 10)))/(2*pi)
eq('三2 原输入逆变换的定义积分', simplify(expand((inv_F-10/pi*(sin(5*t)/(5*t))**2).rewrite(exp))), 0)
eq('三2 输出原点值由谱面积复核', (integrate(2*(1+omega/10)/4, (omega, -10, 0))+integrate(2*(1-omega/10)/4, (omega, 0, 10)))/(2*pi), Rational(5, 2)/pi)

finish()

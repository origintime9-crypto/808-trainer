"""课程10：按p49..54原式、原图与参数独立求解，不读取网页答案。"""
from common import *

aa = Symbol('aa', positive=True)
bb = Symbol('bb', positive=True)
Om = Symbol('Om', real=True)
kap = Symbol('kap', real=True)
q = Symbol('q')
Ts = Symbol('Ts', positive=True)
wm = Symbol('wm', positive=True)
offset = Symbol('offset', real=True)

eq('一1 从能量定义积分', integrate(aa**2, (tau, -bb/2, bb/2)), aa**2*bb)
eq('一1 平移脉冲能量不变', integrate(aa**2, (tau, offset-bb/2, offset+bb/2)), aa**2*bb)

def corr(values, lag):
    return sum(values[i]*conjugate(values[i-lag]) for i in range(len(values)) if 0 <= i-lag < len(values))

seq = [Integer(1), Integer(-2), Integer(3)]
eq('一2 实序列零延时自相关等于能量', corr(seq, 0), 14)
check('一2 实序列的偶对称性', all(corr(seq, k) == corr(seq, -k) for k in range(-4, 5)))
check('一2 自相关模不超过零延时值', all(Abs(corr(seq, k)) <= corr(seq, 0) for k in range(-4, 5)))
seq_c = [Integer(1), I]
eq('一2 复序列非偶对称反例', corr(seq_c, 1), I)
check('一2 复序列Hermitian对称', all(corr(seq_c, k) == conjugate(corr(seq_c, -k)) for k in range(-3, 4)))

eq('一3 左半平面因果指数核绝对积分', integrate(exp(-aa*t), (t, 0, oo)), 1/aa)
check('一3 右半平面因果指数核发散', limit(exp(aa*t), t, oo) == oo)
check('一3 虚轴因果复指数核模不衰减', Abs(exp(I*t)).simplify() == 1)

h = exp(-t)+t*cos(2*t)
H = lt(h)
eq('一4 从h求单边拉氏变换', H, 1/(s+1)+(s*s-4)/(s*s+4)**2)
num, den = fraction(cancel(H))
eq('一4 不可约分母是五阶', degree(den, s), 5)
eq('一4 分子分母无公因子', gcd(num, den), 1)
eq('一4 极点及重数对应原核', den, (s+1)*(s*s+4)**2)
check('一4 二重虚轴核在周期峰值处无界', limit(exp(-n*pi)+n*pi, n, oo) == oo)

eq('一5 指数正弦从拉氏定义得到FT', lt(exp(-5*t)*sin(3*t)).subs(s, I*w), 3/((5+I*w)**2+9))
eq('一5 反变换检查', inv_lt(3/((s+5)**2+9)), exp(-5*t)*sin(3*t))
eq('一6 时间压缩使基频翻倍而幅度不变', 3*cos(3*aa*(2*t)), 3*cos(3*(2*aa)*t))
eq('一7 样值脉冲筛选求和', sum(Integer(2)**k*int(k == 3) for k in range(-8, 9)), 8)
eq('一8 因果卷积定义积分', integrate(exp(-(t-tau)), (tau, 0, t)), 1-exp(-t))
eq('一8 卷积变换与结果一致', lt(1-exp(-t)), 1/(s*(s+1)))

eq('一9 两侧指数的收敛条件', re(-aa+I*w), -aa)
ct_exp = integrate(exp(-aa*tau)*exp(-I*w*tau), (tau, 0, oo), conds='none')+integrate(exp(aa*tau)*exp(-I*w*tau), (tau, -oo, 0), conds='none')
eq('一9 连续指数从双边定义积分', ct_exp, 2*aa/(aa**2+w**2))
rho = exp(-aa)
dt_exp = 1+rho*exp(I*Om)/(1-rho*exp(I*Om))+rho*exp(-I*Om)/(1-rho*exp(-I*Om))
dt_closed = sinh(aa)/(cosh(aa)-cos(Om))
eq('一9 离散正负时刻几何级数', simplify(expand((dt_exp-dt_closed).rewrite(exp))), 0)
eq('一9 离散频谱的2π周期', dt_closed.subs(Om, Om+2*pi), dt_closed)
eq('一9 连续频谱原点值', (2*aa/(aa**2+w**2)).subs(w, 0), 2/aa)
eq('一9 离散频谱原点值', simplify(expand((dt_closed.subs(Om, 0)-(1+rho)/(1-rho)).rewrite(exp))), 0)
eq('一10 右边指数的Z定义求和', summation(Rational(1, 2)**n*z**(-n), (n, 0, oo)).args[0][0], z/(z-Rational(1, 2)))
check('一10 一般几何级数有限项系数', all(expand(series(1/(1-kap*q), q, 0, 7).removeO()).coeff(q, k) == kap**k for k in range(7)))
eq('一10 零参数对应单位样值变换', (1/(1-kap*q)).subs(kap, 0), 1)

fundamental = 2*pi/(pi/6)
eq('二1 从周期求基频', fundamental, 12)
check('二1 八次谐波仍在通带', 8*fundamental <= 100)
check('二1 九次及负九次在阻带', 9*fundamental > 100 and Abs(-9*fundamental) > 100)
check('二1 有符号谱线筛选', [k for k in range(-12, 13) if Abs(k*fundamental) <= 100] == list(range(-8, 9)))

primitive = -exp(-I*w*tau)/(I*w)-exp(-I*(w-1)*tau)/(2*I*(w-1))-exp(-I*(w+1)*tau)/(2*I*(w+1))
eq('二2 原函数微分回原积分核', diff(primitive, tau), ((1+cos(tau))*exp(-I*w*tau)).rewrite(exp))
Fwin = primitive.subs(tau, pi)-primitive.subs(tau, -pi)
Fclosed = -2*sin(pi*w)/(w*(w*w-1))
eq('二2 从有限区间FT定义积分', simplify(expand((Fwin-Fclosed).rewrite(exp))), 0)
for value, answer in [(0, 2*pi), (1, pi), (-1, pi)]:
    eq('二2 可去频点'+str(value), limit(Fclosed, w, value), answer)
    eq('二2 该频点直接积分'+str(value), integrate((1+cos(tau))*exp(-I*value*tau), (tau, -pi, pi)), answer)
eq('二2 乘积卷积公式与定义相同', 2*sin(pi*w)/w+sin(pi*(w-1))/(w-1)+sin(pi*(w+1))/(w+1), Fclosed)
eq('二2 实偶信号频谱的偶对称', Fclosed.subs(w, -w), Fclosed)

def square_coeff(k):
    return simplify((-integrate(exp(-I*k*pi*tau/2), (tau, -2, -1))+integrate(exp(-I*k*pi*tau/2), (tau, -1, 1))-integrate(exp(-I*k*pi*tau/2), (tau, 1, 2)))/4)

eq('二3 原图周期四秒对应ω0', 2*pi/4, pi/2)
eq('二3 原图正负面积相抵', square_coeff(0), 0)
eq('二3 原图基波复系数', square_coeff(1), 2/pi)
eq('二3 原图三次复系数', square_coeff(3), -2/(3*pi))
check('二3 原图所有检查偶次为零', all(square_coeff(k) == 0 for k in [-6, -4, -2, 2, 4, 6]))
check('二3 截止2π仅留正负一三次', [k for k in range(-8, 9) if Abs(k*pi/2) <= 2*pi and square_coeff(k) != 0] == [-3, -1, 1, 3])
eq('二3 成对实基波幅度', 2*square_coeff(1), 4/pi)
eq('二3 成对实三次项系数', 2*square_coeff(3), -4/(3*pi))

shift = Symbol('shift', integer=True)
x0, x1, a0, a1 = symbols('x0 x1 a0 a1')
eq('二4 线性叠加', n*(a0*x0+a1*x1), a0*n*x0+a1*n*x1)
eq('二4 输入移位与输出移位之差', n*x0-(n-shift)*x0, shift*x0)
check('二4 因果无记忆仅访问当前输入', not (n*x0).has(x1))
check('二4 用输入恒1证明不稳定', limit(n, n, oo) == oo)

def full(k):
    if k == -1: return Integer(0)
    if k == -2: return Rational(1, 2)
    return Rational(1, 6)+Rational(1, 2)*(-1)**k-Rational(2, 3)*(-2)**k

recurrence('二5 原初态与阶跃的逐点递推', full, [1, 3, 2], lambda k: 1, lo=0, hi=20)
check('二5 首三样本与逐点计算一致', [full(k) for k in range(3)] == [0, 1, -2])
Y = (1/(1-q)-1)/(1+3*q+2*q*q)
eq('二5 从单边移位初态求Y', Y.subs(q, 1/z), z*z/((z-1)*(z+1)*(z+2)))
eq('二5 部分分式再合成Y', Y, Rational(1, 6)/(1-q)+Rational(1, 2)/(1+q)-Rational(2, 3)/(1+2*q))
eq('二5 零输入与零状态分解相加', -1/(1+q)+1/(1+2*q)+Rational(1, 6)/(1-q)+Rational(3, 2)/(1+q)-Rational(5, 3)/(1+2*q), Y)

G = (1+kap*q/3)/(1-kap*q/2)
eq('三1 按正反馈和正输出节点消元', (1+kap*q/3)*(1/(1-kap*q/2)), G)
eq('三1 脉冲直通与延时尾部', G, 1+5*kap*q/(6*(1-kap*q/2)))
eq('三1 固定参数极点', cancel(G.subs(q, 1/z)), (z+kap/3)/(z-kap/2))
eq('三1 零参数极点零点相消', G.subs(kap, 0), 1)
check('三1 无相消时单位圆条件', solve_univariate_inequality(Abs(kap/2)<1, kap, relational=False) == Interval.open(-2, 2))
eq('三1 临界κ2的尾部不衰减', (5*kap/6*(kap/2)**n).subs(kap, 2), Rational(5, 3))
eq('三1 临界κ负2的尾部模不衰减', Abs((5*kap/6*(kap/2)**n).subs(kap, -2)), Rational(5, 3))
check('三1 真时变增益n/2的单位脉冲样本增长', [factorial(k)/2**k for k in range(4, 9)] == [Rational(3, 2), Rational(15, 4), Rational(45, 4), Rational(315, 8), Rational(315, 2)])

Y1pos = 1-w/(2*wm)
eq('三2(1) 输入带内两个谱相乘', 1*(1-w/(2*wm)), Y1pos)
eq('三2(1) 中心高度', Y1pos.subs(w, 0), 1)
eq('三2(1) 两个截断端点高度', Y1pos.subs(w, wm), Rational(1, 2))
eq('三2(2) FT乘积卷积后复制系数', (2*pi/Ts)/(2*pi), 1/Ts)
eq('三2(2) 严格不重叠转换到T', (2*pi/Ts-2*wm)*Ts/(2*wm), pi/wm-Ts)
eq('三2(2) 临界相邻正负边缘接触', (2*pi/Ts-wm).subs(Ts, pi/wm), wm)
eq('三2(3) 输入带内恢复条件', (Y1pos/Ts)*(Ts/Y1pos), 1)
eq('三2(3) 恢复滤波器DC增益', (Ts/Y1pos).subs(w, 0), Ts)
eq('三2(3) 恢复滤波器输入边缘增益', (Ts/Y1pos).subs(w, wm), 2*Ts)
check('三2(3) 仅输入带内被恢复条件限定', simplify(Ts/(1-Rational(3, 2)*wm/(2*wm))) == 4*Ts)
eq('三2(3) 另取1.5ω1截止时不可仍把倒数增益写2T', (Ts/Y1pos).subs(w, Rational(3, 2)*wm), 4*Ts)
eq('三2(3) 取ωs4ω1时有截止设计余量', (4*wm-wm)-wm, 2*wm)

finish()

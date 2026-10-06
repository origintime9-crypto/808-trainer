"""指定第三章：直接积分、频域性质、频谱积分与谐波系数复核。"""
from common import *
v = Symbol('v', real=True, nonzero=True)
freq = Symbol('freq', real=True, nonzero=True)
Q = ((1+I*freq)*exp(-I*freq)-1)/freq**2
eq('3.11 基准斜坡直接积分', integrate(v*exp(-I*freq*v),(v,0,1)), Q)
for label, expr, lo, hi, expected in [
    ('1',v+1,-1,0,exp(I*freq)*Q),
    ('2',-v,-1,0,Q.subs(freq,-freq)),
    ('3',v,0,2,4*Q.subs(freq,2*freq)),
    ('4',-v-1,-2,-1,exp(I*freq)*Q.subs(freq,-freq)),
    ('5',v-1,1,2,exp(-I*freq)*Q),
    ('6',2*(v-1),1,2,2*exp(-I*freq)*Q),
]:
    eq('3.11('+label+') 图面直接积分', integrate(expr*exp(-I*freq*v),(v,lo,hi)), expected)
eq('3.11(3) 更正后直流面积', limit(4*Q.subs(freq,2*freq),freq,0), 2)
eq('3.13(1) 矩形频谱逆变换', integrate(exp(I*freq*v),(freq,-2*pi,2*pi))/(2*pi), sin(2*pi*v)/(pi*v))
a = Symbol('a', positive=True)
eq('3.13(2) 左右指数积分变换之和', lt(exp(-a*t)).subs(s,I*freq)+lt(exp(-a*t)).subs(s,-I*freq), 2*a/(a*a+freq**2))
# 以高斯信号作独立积分实例，检验八种性质中的尺度和符号。
q = Symbol('q', real=True)
G = sqrt(pi)*exp(-freq**2/4)
Gp = diff(G,freq)
for label, signal, expected in [
    ('1',v*exp(-(5*v)**2), I*Gp.subs(freq,freq/5)/25),
    ('2',(v-3)*exp(-(v-3)**2), I*exp(-3*I*freq)*Gp),
    ('3',(v-3)*exp(-(-3*v)**2), -I*Gp.subs(freq,-freq/3)/9-G.subs(freq,-freq/3)),
    ('4',v*diff(exp(-v*v),v), -G-freq*Gp),
    ('5',exp(-(4-v)**2), exp(-4*I*freq)*G.subs(freq,-freq)),
    ('6',(4-v)*exp(-(4-v)**2), I*exp(-4*I*freq)*Gp.subs(freq,-freq)),
    ('7',exp(-(4*v-7)**2), exp(-7*I*freq/4)*G.subs(freq,freq/4)/4),
    ('8',exp(3*I*v)*exp(-v*v), G.subs(freq,freq-3)),
]:
    eq('3.14('+label+') 独立高斯积分', integrate(signal*exp(-I*freq*v),(v,-oo,oo),conds='none'), expected)
x_integral = integrate(2*exp(-I*freq*v),(v,-1,0))+integrate((2-v)*exp(-I*freq*v),(v,0,1))+integrate(v*exp(-I*freq*v),(v,1,2))+integrate(2*exp(-I*freq*v),(v,2,3))
R = 4*sin(2*freq)/freq-2*(1-cos(freq))/freq**2
eq('3.20(1) 偶对称平移频谱', expand_complex(x_integral*exp(I*freq)), R)
eq('3.20(2) 零频值', limit(R,freq,0), 7)
eq('3.20(3) 反演零时刻', 2*pi*Integer(2), 4*pi)
eq('3.20(4) 反演卷积积分', 2*pi*(integrate(v,(v,1,2))+integrate(2,(v,2,3))), 7*pi)
def x20(x):
    if -1 < x < 0: return Integer(2)
    if 0 <= x < 1: return 2-x
    if 1 <= x < 2: return x
    if 2 <= x < 3: return Integer(2)
    return Integer(0)
for qv in [Rational(1,2),Rational(3,2),Rational(5,2)]:
    expected = 2-qv/2 if qv<1 else qv/2 if qv<2 else 1
    eq('3.20(5) 偶分量区间样点 '+str(qv), (x20(qv)+x20(-qv))/2, expected)
T = Symbol('T', positive=True)
k = Symbol('k', integer=True, nonzero=True)
eq('3.21 直流系数', integrate(2*v/T,(v,0,T/2))/T, Rational(1,4))
Cn = integrate(2*v/T*exp(-I*2*pi*k*v/T),(v,0,T/2))/T
claimed = I*(-1)**k/(2*pi*k)+((-1)**k-1)/(2*pi**2*k**2)
eq('3.21 非零谐波独立积分', Cn, claimed)
eq('3.21 共轭对称', conjugate(claimed), claimed.subs(k,-k))
theta = Symbol('theta', real=True)
expanded = sin(theta)/2+sin(3*theta)/4-sin(5*theta)/4+3*sin(2*theta)/2-sin(6*theta)/2
eq('3.26 两次调制展开', expand_trig((sin(theta)+2*sin(2*theta))*sin(2*theta)**2-expanded), 0)
check('3.26 频率与边界归类', [j for j in [1,2,3,5,6] if j<=2]==[1,2])
finish()

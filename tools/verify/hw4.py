"""第 4 章老师指定题：独立积分、单边变换、初值与反馈边界检查。"""
from common import *

a, b, beta, alpha, c = symbols('a b beta alpha c', positive=True)
theta = Symbol('theta', real=True)
v = Symbol('v', positive=True)
cases = [
    (1, (1-exp(-a*t))/a, 1/(s*(s+a))),
    (2, exp(-t), exp(-2*(s+1))/(s+1), 2),
    (3, exp(-t), (1-exp(-2*(s+1)))/(s+1), 0, 2),
    (4, (a*exp(-a*t)-b*exp(-b*t))/(a-b), s/((s+a)*(s+b))),
    (5, (exp(-alpha*t)-exp(-beta*t))/(beta-alpha), 1/((s+alpha)*(s+beta))),
    (6, t*exp(-t), 1/(s+1)**2),
    (9, exp(-t)*sin(2*t), 2/((s+1)**2+4)),
    (10, sin(t)+2*cos(t), (1+2*s)/(s*s+1)),
    (12, t*t*cos(2*t), 2*s*(s*s-12)/(s*s+4)**3),
    (13, (1-cos(alpha*t))*exp(-beta*t), alpha**2/((s+beta)*((s+beta)**2+alpha**2))),
    (14, exp(-t+2), exp(-2*s)/(s+1), 2),
    (15, sin(t), exp(-2*s)*(s*sin(2)+cos(2))/(s*s+1), 2),
    (16, exp(-a*t)*sin(beta*t+theta), (beta*cos(theta)+(s+a)*sin(theta))/((s+a)**2+beta**2)),
    (17, t*(3*cos(3*t)+cos(9*t))/4, (3*(s*s-9)/(s*s+9)**2+(s*s-81)/(s*s+81)**2)/4),
    (18, exp(-t/a)*exp(-b*t/a), a/(a*s+1+b)),
    (19, exp(-a*t)*exp(-b*t/a), a/(a*(s+a)+b)),
    (20, exp(-t/a)*exp(-b*a*t), 1/(a*(s/a+1/a**2+b))),
    (21, exp(-(t+a))*cos(b*t), exp(-a)*(s+1)/((s+1)**2+b*b)),
    (24, t**3+t*t+t+1, 6/s**4+2/s**3+1/s**2+1/s),
]
for item in cases:
    no, signal, expected, *bounds = item
    actual = integrate(signal*exp(-s*t), (t, *(bounds if len(bounds)==2 else [bounds[0],oo] if bounds else [0,oo])))
    eq('4.1('+str(no)+') 独立定义积分', actual, expected)
eq('4.1(7) 除以 t 的积分', integrate(1/(v+3)-1/(v+4),(v,s,oo)), log((s+4)/(s+3)))
eq('4.1(8) 除以 t 的积分', integrate(1/v-1/(v+a),(v,s,oo)), log((s+a)/s))
eq('4.1(11) 正弦除以 t 的直接变换', lt(sin(a*t)/t), atan(a/s))
eq('4.1(17) 三倍角恒等式', expand_trig(cos(3*t)**3-(3*cos(3*t)+cos(9*t))/4), 0)
eq('4.1(22) 冲激与指数', 2*laplace_transform(DiracDelta(tau),tau,s,noconds=True)-3*lt(exp(-7*t)), 2-3/(s+7))
eq('4.1(23) 时移冲激', laplace_transform(2*DiracDelta(tau-a)+3*DiracDelta(tau),tau,s,noconds=True), 2*exp(-s*a)+3)

for i, F, start, end in [
    (1,(s-6)/((s+2)*(s+5)),1,0),
    (2,10*(s+2)/(s*(s+5)),10,4),
    (3,1/(s+3)**3,0,0),
    (4,(s+3)/((s+1)**2*(s+2)),0,0),
]:
    eq('4.3('+str(i)+') 初值', limit(s*F,s,oo), start)
    eq('4.3('+str(i)+') 终值', limit(s*F,s,0), end)
    check('4.3('+str(i)+') 终值定理极点条件', all(re(x)<0 for x in roots(denom(cancel(s*F)),s)))
eq('4.3(2) 更正后的反变换', lt(4+6*exp(-5*t)), 10*(s+2)/(s*(s+5)))

eq('4.5(1) 指数样例直接积分', lt(exp(-2*t)*exp(-2*b*t)), 1/(2*((s+2)/2+b)))
eq('4.5(2) 平方与时移直接积分', integrate((t-2)**2*exp(-b*(t/2-1))*exp(-s*t),(t,2,oo)), 8*exp(-2*s)*2/(2*s+b)**3)
eq('4.5(3) 乘 t 直接积分', lt(t*exp(-t)*exp(-3*b*t)), 1/(9*((s+1)/3+b)**2))
eq('4.5(4) 尺度与延时积分', integrate(exp(-c*(a*t-b))*exp(-s*t),(t,b/a,oo)), exp(-b*s/a)/(a*(s/a+c)))

D3 = (s+1)*(s+4)
D4 = s*(s+1)*(s+2)
solutions = [
    (1, c*exp(-a*t), t*exp(-a*t), c/(s+a), 1/(s+a)**2),
    (2, exp(-2*t), (b*(exp(-2*t)-cos(b*t))+2*sin(b*t))/(4+b*b), 1/(s+2), b/((s+2)*(s*s+b*b))),
    (3, (13*exp(-t)-7*exp(-4*t))/3, exp(-t)-exp(-2*t)/2-exp(-4*t)/2, (2*s+15)/D3, (2*s+5)/(D3*(s+2))),
    (4, Rational(3,2)-exp(-t)+exp(-2*t)/2, 2*t-Rational(5,2)+3*exp(-t)-exp(-2*t)/2, (s*s+3*s+3)/D4, (s+4)/(s*D4)),
]
for no, zi, zs, ZI, ZS in solutions:
    eq('4.11('+str(no)+') 零输入变换', lt(zi), ZI)
    eq('4.11('+str(no)+') 零状态变换', lt(zs), ZS)
    eq('4.11('+str(no)+') 零状态的输出初值', limit(zs,t,0), 0)
y3 = Rational(16,3)*exp(-t)-exp(-2*t)/2-Rational(17,6)*exp(-4*t)
eq('4.11(3) 全响应相加', solutions[2][1]+solutions[2][2], y3)
eq('4.11(3) 右侧导数跳变', limit(diff(y3,t),t,0), 7)
eq('4.11(3) t>0 微分方程', diff(y3,t,2)+5*diff(y3,t)+4*y3, exp(-2*t))
y4 = 2*t-1+2*exp(-t)
eq('4.11(4) 更正全响应', solutions[3][1]+solutions[3][2], y4)
eq('4.11(4) 右侧二阶导数跳变', limit(diff(y4,t,2),t,0), 2)
eq('4.11(4) t>0 微分方程', diff(y4,t,3)+3*diff(y4,t,2)+2*diff(y4,t), 4)

H = (s+2)/((s+1)*(s+3))
for i, frequency, inputamp, value, amplitude in [
    (1,2,5,(14-18*I)/65,5*sqrt(Rational(8,65))),
    (2,3,10,(4-7*I)/30,sqrt(65)/3),
]:
    eq('4.18('+str(i)+') 复频响', H.subs(s,I*frequency), value)
    eq('4.18('+str(i)+') 保留输入幅度', inputamp*Abs(value), amplitude)
Hb = 2*s/(s*s+2*s+Rational(7,4))
eq('4.19(3) 冲激响应', lt(exp(-t)*(2*cos(sqrt(3)*t/2)-4*sin(sqrt(3)*t/2)/sqrt(3))), Hb)
eq('4.19(4) 稳态幅相', Hb.subs(s,I*sqrt(3)/2), sqrt(3)*exp(I*pi/6)/2)
H21 = 1+2/((s+2)*(s+3))
eq('4.21(1) 冲激响应', 1+lt(2*(exp(-2*t)-exp(-3*t))), H21)
eq('4.21(2) 阶跃响应', lt(Rational(4,3)-exp(-2*t)+2*exp(-3*t)/3), H21/s)

K = Symbol('K', real=True)
G = K/(s*s+2*s+2)
B = 1/(s+3)
closed = K*(s+3)/(s**3+5*s*s+8*s+6-K)
eq('4.22(1) 正反馈系统函数', G/(1-G*B), closed)
check('4.22(2) 劳斯全范围', reduce_inequalities([(34+K)/5>0,6-K>0],K).as_set() == Interval.open(-34,6))
hm = Rational(34,33)*(2*exp(-5*t)-2*cos(2*sqrt(2)*t)-23*sin(2*sqrt(2)*t)/(2*sqrt(2)))
hp = Rational(9,4)+exp(-5*t/2)*(-9*cos(sqrt(7)*t/2)/4+3*sin(sqrt(7)*t/2)/(4*sqrt(7)))
eq('4.22(3) K=-34 边界反变换', lt(hm), closed.subs(K,-34))
eq('4.22(3) K=6 边界反变换', lt(hp), closed.subs(K,6))
check('4.22(3) 两端均有非衰减极点', roots(denom(closed.subs(K,-34)),s)=={-5,2*sqrt(2)*I,-2*sqrt(2)*I} and 0 in roots(denom(closed.subs(K,6)),s))
finish()

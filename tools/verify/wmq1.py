"""教材第一章余题独立复核；不读取网页答案。"""
from common import *
v = Symbol('v', real=True)
A = Symbol('A', positive=True)
L = Symbol('L', positive=True)
q = Symbol('q', positive=True)
f = cos(10*v) + cos(20*v)
eq('1.3(1) π/5 平移恢复', expand(f.subs(v, v+pi/5)), f)
check('1.3(1) π/10 不恢复', simplify(f.subs(v, pi/10)-f.subs(v,0)) != 0)
check('1.3(1) 最小基频两谐波互质', gcd(Integer(1), Integer(2)) == 1)
eq('1.3(2) 复指数恢复', exp(I*5*(v+2*pi/5)), exp(I*5*v))
check('1.3(3) 一段移位变号、两段恢复', all((-1)**(k+1)==-(-1)**k and (-1)**(k+2)==(-1)**k for k in range(-9,10)))
eq('1.5(1) 线段代入', (A*(v+1)/2).subs(v,2*v-3), A*(v-1))
eq('1.5(2) 反向线段', (A*(v+1)/2).subs(v,-2-v), -A*(v+1)/2)
eq('1.5(3) 反褶后门内值', (A*(v+1)/2).subs(v,2-v), A*(3-v)/2)

def original(x):
    return A*(x+1)/2 if -1<x<1 else 0

def transformed(x, case):
    if case==1: return A*(x-1) if 1<x<2 else 0
    if case==2: return -A*(x+1)/2 if -3<x<-1 else 0
    return A*(3-x)/2 if 1<x<2 else 0

samples=[Rational(k,4) for k in range(-17,18) if k not in [-12,-4,4,8,12]]
for case, arg, gate in [(1,lambda x:2*x-3,lambda x:1), (2,lambda x:-2-x,lambda x:1 if x<0 else 0), (3,lambda x:2-x,lambda x:1 if x<2 else 0)]:
    check(f'1.5({case}) 支持区间与门函数样点', all(simplify(original(arg(x))*gate(x)-transformed(x,case))==0 for x in samples))
eq('1.5(3) 右内侧高度', (A*(3-v)/2).subs(v,2), A/2)

def g(x):
    if 1<x<2: return A*(x-1)
    if 2<=x<3: return A
    return 0

def restored(x):
    if -1<x<=1: return A
    if 1<x<3: return A*(3-x)/2
    return 0

check('1.6) 逆变换关键点', [(5-2*k) for k in [1,2,3]]==[3,1,-1])
check('1.6) 独立样点回代 f(5−2t)=g(t)', all(simplify(restored(5-2*x)-g(x))==0 for x in samples if x not in [1,3]))
eq('1.7(1) 光滑乘子筛选', cos(3*v).subs(v,0), 1)
eq('1.7(2) 定积分', integrate(sin(2*v),(v,0,t)), (1-cos(2*t))/2)
eq('1.7(2) 普通导数', diff(sin(2*v),v), 2*cos(2*v))
eq('1.7(2) 原点没有冲激', sin(2*v).subs(v,0), 0)
eq('1.7(3) 光滑乘子筛选', exp(-2*v).subs(v,0), 1)
for multiplier in [cos(3*v),exp(-2*v)]:
    for phi in [exp(-v**2), (1+v)*exp(-v**2), sin(v)*exp(-v**2)]:
        product_derivative_action = -diff(multiplier*phi,v).subs(v,0)+diff(multiplier,v).subs(v,0)*phi.subs(v,0)
        eq('1.7(1/3) 乘积微分在测试函数上的作用', product_derivative_action, -diff(phi,v).subs(v,0))

# 用归一化高斯逼近冲激，显式检验正负尺度与任意非零原点样值。
eps = Symbol('eps', positive=True)
for scale in [-3, -1, Rational(-1,2), Rational(1,2), 1, 3]:
    gaussian=exp(-(scale*v/eps)**2)/(sqrt(pi)*eps)
    eq(f'1.8 尺度{scale} 总质量', integrate(gaussian,(v,-oo,oo)), 1/Abs(scale))
    for phi in [exp(-v**2), (1+v+v**2)*exp(-v**2)]:
        action=integrate(gaussian*phi,(v,-oo,oo))
        eq(f'1.8 尺度{scale} 测试函数极限', limit(action,eps,0,dir='+'), phi.subs(v,0)/Abs(scale))

def source1(x): return x if 0<x<1 else 0
def even1(x): return Abs(x)/2 if Abs(x)<1 else 0
def odd1(x): return x/2 if Abs(x)<1 else 0
def source2(x):
    if Rational(-3,2)<x<Rational(-1,2): return -(x+Rational(3,2))
    if Rational(-1,2)<x<Rational(1,2): return x+Rational(1,2)
    if Rational(1,2)<x<Rational(3,2): return -(x-Rational(1,2))
    return 0
def even2(x):
    if Abs(x)<Rational(1,2): return Rational(1,2)
    if Rational(1,2)<Abs(x)<Rational(3,2): return Rational(-1,2)
    return 0
def odd2(x):
    if Abs(x)<Rational(1,2): return x
    if Rational(1,2)<Abs(x)<Rational(3,2): return sign(x)*(1-Abs(x))
    return 0

samples=[Rational(k,8) for k in range(-24,25) if k not in [-12,-8,-4,4,8,12]]
for no, src, even, odd in [(1,source1,even1,odd1),(2,source2,even2,odd2)]:
    check(f'1.9({no}) 偶分量从定义计算', all(simplify(even(x)-(src(x)+src(-x))/Integer(2))==0 for x in samples))
    check(f'1.9({no}) 奇分量从定义计算', all(simplify(odd(x)-(src(x)-src(-x))/Integer(2))==0 for x in samples))
    check(f'1.9({no}) 分量对称且相加还原', all(even(x)==even(-x) and odd(x)==-odd(-x) and simplify(even(x)+odd(x)-src(x))==0 for x in samples))
for src in [source1, lambda x:exp(-x) if x>0 else 0, lambda x:sin(x) if x>0 else 0]:
    check('1.10 因果信号三段样点', all(simplify((src(x)-src(-x))/Integer(2)-(src(x)+src(-x))/Integer(2)*sign(x))==0 for x in samples))
eq('1.11(1) 一个整流周期平均', integrate(sin(v),(v,0,pi))/pi, 2/pi)
eq('1.11(1) 零频率', Abs(sin(0)), 0)
K = Symbol('K', real=True)
eq('1.11(2) 完整余弦周期均值', integrate(K*(1+cos(v)),(v,0,2*pi))/(2*pi), K)
eq('1.11(2) 零频率', K*(1+cos(0)), 2*K)

# 回算框图系统函数与一般非零初态；不是只复核零初态传递函数。
eq('1.12(1) 一个积分器闭环加直通', Rational(1,2)+Rational(1,4)/(s+Rational(5,2)), (s+3)/(2*s+5))
xx,vv=Function('x')(v),Function('v')(v)
yy=vv+xx/2
eq('1.12(1) 一般时域方程消元', (2*diff(yy,v)+5*yy-diff(xx,v)-3*xx).subs(diff(vv,v),xx/4-Rational(5,2)*vv), 0)
eq('1.12(2) 两积分器输出和', (s+1)/(s**2+4*s+2), (1+1/s)/(s+4+2/s))
ww=Function('w')(v)
yy=diff(ww,v)+ww
ode=diff(ww,v,2)+4*diff(ww,v)+2*ww
eq('1.12(2) 算子消元', diff(yy,v,2)+4*diff(yy,v)+2*yy, diff(ode,v)+ode)
y0,yp0,x0=symbols('y0 yp0 x0',real=True)
w0=yp0+3*y0-x0; v0=x0-2*y0-yp0
eq('1.12(2) 初态输出值', w0+v0,y0)
eq('1.12(2) 初态输出导数', v0+x0-4*v0-2*w0,yp0)

signals=[v*exp(-v),exp(v),2*v*exp(-v),10*exp(-v)*sin(v)]
energies=[Rational(1,4),(exp(2)-1)/2,Integer(2),Rational(25,2)]
intervals=[(0,oo),(0,1),(0,oo),(0,oo)]
for no,(signal,energy,bounds) in enumerate(zip(signals,energies,intervals),1):
    factor=2 if no==3 else 1
    eq(f'1.14({no}) 幅度平方积分', factor*integrate(signal**2,(v,*bounds)),energy)
    eq(f'1.14({no}) 有限能量平均功率上界', limit(energy/(2*L),L,oo),0)
eq('1.14(3) 两半轴独立回算', integrate(4*v**2*exp(2*v),(v,-oo,0))+integrate(4*v**2*exp(-2*v),(v,0,oo)),2)

# 矩形频谱 F=π (|ω|<1)，Parseval 得 sinc 的双边能量，再用偶性及尺度。
omega=Symbol('omega',real=True)
eq('1.14(5) 非归一化 sinc Parseval', integrate(pi**2,(omega,-1,1))/(2*pi), pi)
eq('1.14(5) 非归一化 sinc 单边', integrate(pi**2,(omega,-1,1))/(4*pi), pi/2)
eq('1.14(5) 归一化尺度再取半边', integrate(pi**2,(omega,-1,1))/(4*pi*pi), Rational(1,2))
eq('1.14(5) sinc 原点可去极限', limit(sin(v)/v,v,0),1)
for freq in [Integer(1),2*pi]:
    mean=integrate(sin(freq*v)**2,(v,-L,L))/(2*L)
    eq(f'1.14(6) 频率{freq}平方长时平均',limit(mean,L,oo),Rational(1,2))
cross=integrate(2*sin(v)*sin(2*pi*v),(v,-L,L))/(2*L)
eq('1.14(6) 交叉项平均消失',limit(cross,L,oo),0)
check('1.14(6) 频率比无理', (2*pi).is_irrational is True)

core=exp(-v)*cos(v)
eq('1.16 指数余弦普通导数',diff(core,v),-exp(-v)*(cos(v)+sin(v)))
for point,weight in [(0,1),(pi,-1),(2*pi,-1)]:
    jump=core.subs(v,0) if point==0 else (cos(point) if point==pi else -cos(point))
    eq(f'1.16 t={point}的跳变冲激',jump,weight)
eq('1.16 第一段积分还原',1+integrate(diff(core,v),(v,0,t)),core.subs(v,t))
eq('1.16 窗口内部积分还原',-1+integrate(-sin(v),(v,pi,t)),cos(t))
eq('1.16 窗口关闭后积分消失',-1+integrate(-sin(v),(v,pi,2*pi))-1,0)
G=lt(exp(-t)*cos(t))+integrate(exp(-s*v)*cos(v),(v,pi,2*pi))
H=1-lt(exp(-t)*(cos(t)+sin(t)))+integrate(-exp(-s*v)*sin(v),(v,pi,2*pi))-exp(-pi*s)-exp(-2*pi*s)
eq('1.16 拉氏域H=sG与普通项加跳变一致',H,s*G)
finish()

"""课程题库 01：从题面系数独立积分、代数与递推，不读取网页答案。"""
from common import *
from sympy.discrete.convolutions import convolution

v=Symbol('v', real=True)
omega=Symbol('omega', positive=True)
q=Symbol('q')
g=v*v+4
eq('一1 普通二阶导数', diff(g,v,2), 2)
check('一1 分布边界系数', g.subs(v,0)==4 and diff(g,v).subs(v,0)==0)
check('一2 有限序列独立卷积', convolution([1,2,-2,1],[3,4,2,4])==[3,10,4,3,8,-6,4])
eq('一3 延时冲激的频响样例', integrate(3*DiracDelta(v-2)*exp(-I*w*v),(v,-oo,oo)), 3*exp(-2*I*w))
eq('一4 抽样间隔', pi/(omega/4), 4*pi/omega)
f=4*cos(20*pi*v)+2*cos(30*pi*v)
eq('一5 平均功率定义积分', integrate(f*f,(v,0,Rational(1,5)))/Rational(1,5), 10)
eq('一6 时移反例 f(t)=t、延时 1', (3*v-1)-3*(v-1),2)
f1=v*v; f2=sin(v)
eq('一6 输入尺度算子叠加', (2*f1-3*f2).subs(v,3*v), 2*f1.subs(v,3*v)-3*f2.subs(v,3*v))
check('一7 虚轴上实际极点', roots((s*s+1)*(s-1),s)=={1,I,-I})
check('一8 包含单位圆极点', roots(2*z*z+z-1,z)=={Rational(1,2),-1})
eq('一9 冲激积分', integrate((v*v+2*v)*DiracDelta(1-v),(v,-oo,oo)), 3)
sample=exp(-(v-3)**2)
eq('一10 延时实偶的对称性', sample.subs(v,3+t),sample.subs(v,3-t))

# 按 f=2·1_[0,2)、h=1_[0,1)+2·1_[1,2)，逐区间算重叠长度。
pieces=[
 (0,1, 2*t),
 (1,2, 4*t-2),
 (2,3, 10-2*t),
 (3,4, 16-4*t),
]
for a,b,expected in pieces:
    vals=[Rational(3*a+b,4),Rational(a+b,2),Rational(a+3*b,4)]
    actual=[]
    for value in vals:
        lo=max(0,value-2); hi=min(2,value)
        total=0
        # h(value-v) 取 1 时 v∈(value-1,value]，取 2 时 v∈(value-2,value-1]。
        for weight,lower,upper in [(1,value-1,value),(2,value-2,value-1)]:
            start=max(lo,lower); end=min(hi,upper)
            if end>start: total+=integrate(2*weight,(v,start,end))
        actual.append(simplify(total-expected.subs(t,value)))
    check(f'二1 区间 {a}..{b} 直接积分',all(delta==0 for delta in actual))
eq('二1 输出面积乘积', sum(integrate(expr,(t,a,b)) for a,b,expr in pieces),4*3)
check('二2 并联延时单位样值', [Integer(k==0)+(Rational(1,2)**(k-2) if k>=2 else 0) for k in range(5)]==[1,0,1,Rational(1,2),Rational(1,4)])
coeff={0:2,-1:2,1:2,-2:1,2:1}
eq('二3 指数谱合成', sum(value*exp(I*k*v) for k,value in coeff.items()),2+4*cos(v)+2*cos(2*v))
def yin(value):
    return value if 0<=value<2 else Integer(0)
def gout(value):
    if value<0: return Integer(0)
    if value<1: return value
    m=floor(value)
    return 2*(value-m)+1
probe=[Rational(j,4) for j in range(-5,30) if j%4]
check('二4 阶跃的延时叠加', all(sum(yin(value-i) for i in range(12))==gout(value) for value in probe))
check('二4 回代矩形输入响应',all(gout(value)-gout(value-1)==yin(value) for value in probe))
eq('二5 定义逆积分',integrate(2*exp(I*v*t),(v,-1,1))/(2*pi),2*sin(t)/(pi*t))
eq('二5 可去极限',limit(2*sin(t)/(pi*t),t,0),2/pi)

den=(s+2)*(s+5)
H=(2*s+3)/den
zi=2*exp(-2*t)-exp(-5*t)
zs=exp(-t)/4+exp(-2*t)/3-Rational(7,12)*exp(-5*t)
yt=exp(-t)/4+Rational(7,3)*exp(-2*t)-Rational(19,12)*exp(-5*t)
eq('三1(1) 零输入变换',lt(zi),(s+8)/den)
eq('三1(1) 零状态变换',lt(zs),H/(s+1))
eq('三1(1) 全响应相加',zi+zs,yt)
check('三1(1) 初值和冲激匹配',yt.subs(t,0)==1 and diff(yt,t).subs(t,0)==3)
eq('三1(1) 正时间方程回代',diff(yt,t,2)+7*diff(yt,t)+10*yt,exp(-t))
h=-exp(-2*t)/3+Rational(7,3)*exp(-5*t)
eq('三1(2) 冲激响应变换',lt(h),H)
check('三1(2) 因果稳定极点',roots(den,s)=={-2,-5})
A=Matrix([[0,1],[-10,-7]]); B=Matrix([0,1]); C=Matrix([[3,2]])
eq('三1(3) 直接型结构回算',(C*(s*eye(2)-A).inv()*B)[0],H)

Hd=1/(1+3/z+2/z**2)
eq('三2(1) 零输入分式',4/z*Hd,4/(1+1/z)-4/(1+2/z))
eq('三2(1) 零状态分式',Hd/(1-1/z),Rational(1,6)/(1-1/z)-Rational(1,2)/(1+1/z)+Rational(4,3)/(1+2/z))
def ad(k): return (4*Integer(-1)**k-4*Integer(-2)**k)*u(k)
def bd(k): return (Rational(1,6)-Rational(1,2)*Integer(-1)**k+Rational(4,3)*Integer(-2)**k)*u(k)
def full(k):
    return {-2:Integer(3),-1:Integer(-2)}.get(k,ad(k)+bd(k))
recurrence('三2(1) 含真实初态的全响应',full,[1,3,2],lambda k:Integer(1),lo=0)
recurrence('三2(1) 零状态递推',bd,[1,3,2],u,lo=0)
eq('三2(2) 冲激分式',Hd,-1/(1+1/z)+2/(1+2/z))
recurrence('三2(2) 冲激递推',lambda k:(-Integer(-1)**k+2*Integer(-2)**k)*u(k),[1,3,2],lambda k:Integer(k==0))
def short(k):
    return {-2:Integer(3),-1:Integer(-2)}.get(k,ad(k)+bd(k)-bd(k-5))
recurrence('三2(3) 矩形输入全响应',short,[1,3,2],lambda k:u(k)-u(k-5),lo=0)
recurrence('三2(3) 矩形输入零状态',lambda k:bd(k)-bd(k-5),[1,3,2],lambda k:u(k)-u(k-5),lo=0)
finish()

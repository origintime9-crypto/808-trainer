"""课程23：有限窗频谱、原负支路有限卷积、分布导数、指定状态和原常量输入。"""
from common import *
v=Symbol('v',real=True)
freq=Symbol('freq',real=True,nonzero=True)
R=Symbol('R',positive=True)

# 一1/2：用原时间窗定义积分，而非读取网页变换表。
shift_window=integrate(Rational(1,2)*exp(-I*freq*v),(v,-3,3))
eq('一1 半高宽6矩形的原定义FT',expand_complex(shift_window),sin(3*freq)/freq)
eq('一1 原加6对应频率左移2',3*w+6,3*(w+2))
eq('一1 时间负调制的移频方向',exp(-2*I*v)*exp(-I*w*v),exp(-I*(w+2)*v))
eq('一1 移频可去奇点高度3',limit(sin(3*freq)/freq,freq,0),3)
odd_ft=integrate(exp(-I*w*v),(v,-4,0))-integrate(exp(-I*w*v),(v,0,4))
odd_expected=2*I*(1-cos(4*w))/w
eq('一2 原正左负右有限窗FT',expand_complex(odd_ft),odd_expected)
eq('一2 原面积相消的DC',integrate(1,(v,-4,0))-integrate(1,(v,0,4)),0)
eq('一2 原点可去极限0',limit(odd_expected,w,0),0)
eq('一2 实奇时间信号给纯虚谱',re(odd_expected),0)
eq('一2 频谱保留奇性',odd_expected.subs(w,-w),-odd_expected)

# 一3：独立每周期积分回原LT，再按有限时刻的局部和核对区间。
period_lt=integrate(exp(-s*v),(v,0,1))/(1-exp(-2*s))
eq('一3 一个开关周期定义LT',period_lt,1/(s*(1+exp(-s))))
rho=Symbol('rho',positive=True)
N=Symbol('N',integer=True,nonnegative=True)
finite_series=summation((-rho)**n,(n,0,N))
eq('一3 原交替几何级数有限部分和',finite_series,(1-(-rho)**(N+1))/(1+rho))
eq('一3 Re s正时原级数余项模趋0',limit(exp(-(N+1)*s),N,oo),0)
for k in range(10):
    time=Rational(2*k+1,2)
    value=sum((-1)**j*Heaviside(time-j) for j in range(k+2))
    eq('一3 局部有限阶跃和t='+str(time),value,int(k%2==0))
eq('一3 s趋0给周期平均而非终值',limit(s*period_lt,s,0,dir='+'),Rational(1,2))

original_wave=sqrt(2)*cos(t+pi/4)
eq('一4 原正45度相位展开',expand_trig(original_wave),cos(t)-sin(t))
eq('一4 定义LT另加原δ质量',1+lt(original_wave),1+(s-1)/(s*s+1))
eq('一4 原δ不能丢的高s极限',limit(1+lt(original_wave),s,oo),1)
for zp in [3,4,-3,-4,3*I]:
    eq('一5 原负2右序列在ROC内ZT z='+str(zp),
       summation((-Integer(2)/zp)**n,(n,0,oo)),zp/(zp+2))
check('一5 原边界z2的项不趋0',abs((-Integer(2)/2)**20)==1)
eq('一5 定义序列首样值',Integer(-2)**0,1)

# 一6–10是课程22同题，仍从原数学定义核对，而非复制网页答案。
periodic=sin(2*pi*v/3)+cos(pi*v)
eq('一6 公共周期6同时复现',expand_trig(periodic.subs(v,v+6)),expand_trig(periodic))
check('一7 非整周期移位不保留采样格点',Rational(1,2) not in set(range(-4,5)))
aa,bb,x1,x2,g=symbols('aa bb x1 x2 g')
eq('一7 原冲激格点乘法满足叠加',(aa*x1+bb*x2)*g,aa*x1*g+bb*x2*g)
weight=1-2*v*v+sin(pi*v/3)
eq('一8 原负2尺度冲激定义积分',integrate(weight*DiracDelta(1-2*v),(v,-oo,oo)),Rational(1,2))
eq('一9 原负2支撑不在非负求和域',sum((3*k+1)*int(k==-2) for k in range(50)),0)
epsilon=Symbol('epsilon',positive=True)
dirichlet=integrate(exp(-epsilon*t)*sin(t)/t,(t,0,oo))
eq('一10 原1π系数的两侧Abel极限',limit(2*dirichlet/pi,epsilon,0,dir='+'),1)

# 二1：独立的原矩形与自卷积三角谱、谱零点相位条件。
rectangle_ft=integrate(exp(-I*w*v),(v,0,2))
triangle_ft=integrate(v*exp(-I*w*v),(v,0,2))+integrate((4-v)*exp(-I*w*v),(v,2,4))
G=4*(sin(w)/w)**2*exp(-2*I*w)
eq('二1 原矩形FT',expand_complex(rectangle_ft),2*sin(w)/w*exp(-I*w))
eq('二1 自卷积不是模平方',rectangle_ft**2,G)
eq('二1 三角时域定义FT独立回查',expand_complex(triangle_ft),G)
eq('二1 频谱模等于非负平方sinc',Abs(G),4*(sin(w)/w)**2)
eq('二1 自卷积原面积4',integrate(v,(v,0,2))+integrate(4-v,(v,2,4)),4)
eq('二1 原点谱可去极限4',limit(G,w,0),4)
for k in [-3,-2,-1,1,2,3]: eq('二1 非零整数π谱零点n='+str(k),G.subs(w,k*pi),0)

# 二2：原全时间序列，直接对整数样本计算原邻拍关系。
def original_sequence(k): return cos(pi*k/2)+sin(pi*k)
check('二2 原sinπk在整数格点恒零',all(sin(pi*k)==0 for k in range(-12,15)))
check('二2 原邻拍输出含负时间逐点代回',all(
    simplify((original_sequence(k-1)+2*original_sequence(k)+original_sequence(k+1))/4
             -cos(pi*k/2)/2)==0 for k in range(-12,15)))
omega=Symbol('omega',real=True)
Hd=(exp(-I*omega)+2+exp(I*omega))/4
eq('二2 原三点FIR频响',expand_complex(Hd),cos(omega/2)**2)
eq('二2 原π2频点增益',Hd.subs(omega,pi/2),Rational(1,2))
check('二2 未来输入系数非零证明非因果',Rational(1,4)>0)

# 二3：原下入口负号先形成有限窗；原h2无u，全时间卷积有定义。
kernel=1+cos(pi*(v-tau)/2)
original_out=integrate(kernel,(tau,0,2))
expected_out=2+4/pi*sin(pi*v/2)
eq('二3 原负延时支路形成有限窗的定义卷积',original_out,expected_out)
eq('二3 原核直流的窗面积增益',integrate(1,(tau,0,2)),2)
eq('二3 原余弦窗积分保留正弦系数',integrate(cos(pi*(v-tau)/2),(tau,0,2)),4/pi*sin(pi*v/2))
eq('二3 原负时间输出不擅加阶跃',original_out.subs(v,-2),2)
eq('二3 原零时刻输出不擅当因果起点',original_out.subs(v,0),2)
# 不能将两发散步响分开求；使用同一截断再相减回原有限窗。
truncated_difference=integrate(kernel,(tau,0,R))-integrate(kernel,(tau,2,R))
eq('二3 原同一远端截断的两支路相减',truncated_difference,expected_out)

# 二4：原输入导数的δ先保留，再从定义LT和直接卷积双向核对。
X1=lt(exp(-3*t))
X2=1+lt(1-4*exp(-3*t))
eq('二4 原输入分布导数和积分的LT',X2,(s*s+3)/(s*(s+3)))
eq('二4 原x2操作含δ的LT另算',s*X1+3*X1/s,X2)
eq('二4 原两输出关系的左边增益',X2+4*X1,(s+1)/s)
H=(1/(s+2))/(X2+4*X1)
h=-exp(-t)+2*exp(-2*t)
eq('二4 解得核定义LT',lt(h),H)
y1=integrate(powsimp(expand(h.subs(t,t-tau)*exp(-3*tau))),(tau,0,t))
y1_expected=-exp(-t)/2+2*exp(-2*t)-3*exp(-3*t)/2
eq('二4 原x1独立定义卷积',y1,y1_expected)
step_h=integrate(h.subs(t,tau),(tau,0,t))
y2=h+step_h-4*y1
eq('二4 原x2全部分布项独立卷积',y2,2*exp(-t)-7*exp(-2*t)+6*exp(-3*t))
eq('二4 两实际响应回原输出关系',y2,-4*y1+exp(-2*t))
eq('二4 原输入冲激给y2右起值1',limit(y2,t,0,dir='+'),1)

# 二5：从原y[-1]=2逐点递推，全响应和ZI/ZS只核对k>=0。
def drive(k): return Rational(1,2)**k*u(k)
def output(k):
    if k==-1:return Integer(2)
    return Rational(3,2)*(Rational(1,2)**k-Rational(-1,2)**k) if k>=0 else Integer(0)
def zi(k): return Integer(2) if k==-1 else -Rational(-1,2)**k if k>=0 else Integer(0)
def zs(k): return Rational(3,2)*Rational(1,2)**k-Rational(1,2)*Rational(-1,2)**k if k>=0 else Integer(0)
recurrence('二5 原初态全响应逐点回原式',output,[1,Rational(1,2)],lambda k:drive(k)+drive(k-1),lo=0,hi=32)
recurrence('二5 原初态独立ZI递推',zi,[1,Rational(1,2)],lambda k:0,lo=0,hi=32)
recurrence('二5 零初态独立ZS递推',zs,[1,Rational(1,2)],lambda k:drive(k)+drive(k-1),lo=0,hi=32)
eq('二5 原k0初态使输出0',output(0),0)
check('二5 全响应为两部分之和',all(simplify(output(k)-zi(k)-zs(k))==0 for k in range(32)))

# 三1：原指定状态变换、微分关系、状态回传与原三积分器节点消元。
a=Symbol('a',real=True,nonzero=True)
b,c,d=symbols('b c d',real=True)
y,yp,ypp,x=symbols('y yp ypp x')
T=Matrix([[a,0,0],[b,a,0],[c,b,a]])
A=Matrix([[-b/a,1,0],[-c/a,0,1],[-d/a,0,0]])
B=Matrix([0,0,1])
C=Matrix([[1/a,0,0]])
qstate=Matrix([y,yp,ypp])
qdot=Matrix([yp,ypp,(x-b*ypp-c*yp-d*y)/a])
eq('三1 原状态变换行列式a3',T.det(),a**3)
check('三1 原a0退化时不可保持三状态独立',T.subs(a,0).det()==0)
for k in range(3):eq('三1 原指定状态微分关系行='+str(k+1),(T*qdot)[k],(A*T*qstate+B*x)[k])
eq('三1 原输出增益1a保持y',(C*T*qstate)[0],y)
expected=1/(a*s**3+b*s**2+c*s+d)
eq('三1 状态C逆sIA乘B回原ODE',(C*(s*eye(3)-A).inv()*B)[0],expected)
L1,L2,L3=symbols('L1 L2 L3')
state_nodes=solve([s*L3-x+d*L1/a,s*L2-L3+c*L1/a,s*L1-L2+b*L1/a],[L1,L2,L3])
eq('三1 原三积分器节点独立消元',state_nodes[L1]/(a*x),expected)

# 三2：原第一反馈−2、第二反馈−1、输出前馈2/1。
P1,P2,Y,X=symbols('P1 P2 Y X')
nodes=solve([s*P2-X+2*P2,s*P1-P2+P1,Y-2*P2-P1],[P1,P2,Y])
Horiginal=nodes[Y]/X
eq('三2 原节点消元回系统函数',Horiginal,(2*s+3)/((s+2)*(s+1)))
stable_h=exp(-t)+exp(-2*t)
eq('三2 原因果核定义LT回节点式',lt(stable_h),Horiginal)
check('三2 原实际两极点无约消',roots((s+2)*(s+1),s)=={-2,-1})
eq('三2 原核绝对积分有限',integrate(stable_h,(t,0,oo)),Rational(3,2))
eq('三2 按字面cos2全时间常量卷积',integrate(stable_h*cos(2),(t,0,oo)),Rational(3,2)*cos(2))
eq('三2 字面常量应使用直流增益',Horiginal.subs(s,0),Rational(3,2))
eq('三2 仅补t后的条件频率值',Horiginal.subs(s,2*I),(9-13*I)/20)
conditional=integrate(expand_trig((exp(-tau)+exp(-2*tau))*cos(2*(v-tau))),(tau,0,oo))
eq('三2 仅补t后的条件全时间余弦卷积',conditional,(9*cos(2*v)+13*sin(2*v))/20)
finish()

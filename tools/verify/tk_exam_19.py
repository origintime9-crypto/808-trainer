"""顺序第19套（原卷未编号）：原波形、作用域、求和和四延时节点复核。"""
from common import *

v=Symbol('v',real=True)
q=Symbol('q')
a=Symbol('a',positive=True)
b=Symbol('b',real=True)
f=v+1; g=v*v-3
# 本例两输入在v<−2为零，故对t>0的原下限−∞可改写成−2。
linear_integral=integrate(a*f+b*g,(v,-2,2*t-1))
eq('一1 可积输入的叠加定义',linear_integral,a*integrate(f,(v,-2,2*t-1))+b*integrate(g,(v,-2,2*t-1)))
for k in range(-3,7):
    eq('一2 原序列逐点求和k='+str(k),sum(Integer(2)**i*int(i==2) for i in range(-5,k+1)),4*u(k-2))
eq('一3 原图重叠区间定义卷积点',integrate(1-v,(v,-1,0)),Rational(3,2))
eq('一3 用左/右矩形交叠再次检查',integrate(1-v,(v,Max(-1,-1),Min(1,0))),Rational(3,2))
eq('一4 先换元再合并指数的积分核',exp(I*4*(v+2))*exp(-I*w*(v+2)),exp(-I*2*(w-4))*exp(-I*(w-4)*v))
eq('一5 单边延时余弦回LT定义',integrate(exp(-s*v)*cos(2*(v-1)),(v,1,oo)),s*exp(-s)/(s*s+4))
eq('一6 两个宽2矩形卷积的最右支撑',1+1,2)
eq('一6 平方Sa的最大临界抽样间隔',2*pi/(2*2),pi/2)

# 原文ε(t−1)可保留为参数。两种可能的离散变量替换分别检查，不猜单一答案。
def sum_k(k):
    return Integer(2)**k*sum(Integer(-1)**j for j in range(k)) if k>=0 else Integer(0)
def sum_i(k):
    return Integer(2)**k*sum(Integer(-1)**j*u(j-1) for j in range(k)) if k>=0 else Integer(0)
for k in range(9):
    eq('一7 若ε(k−1)的原有限和k='+str(k),sum_k(k), (Integer(2)**k-Integer(-2)**k)/2)
    expected= -Integer(2)**k if k>0 and k%2==0 else Integer(0)
    eq('一7 若ε(i−1)的原有限和k='+str(k),sum_i(k),expected)
recurrence('一7 按k解释的原和决定Z分子',sum_k,[1,0,-4],lambda k:2*int(k==1))
recurrence('一7 按i解释的原和决定Z分子',sum_i,[1,0,-4],lambda k:-4*int(k==2))
eq('一7 奇位置定义几何级数的有理式',2/z/(1-4/z**2),2*z/(z*z-4))
eq('一7 偶位置定义几何级数的有理式',-4/z**2/(1-4/z**2),-4/(z*z-4))
check('一7 两种解释在非空ROC也不相同',cancel(2*z/(z*z-4)+4/(z*z-4))!=0)

def periodic(k):
    return 2*cos(pi*k/3)+3*sin(pi*k/4)
check('一8 全部基本周期位置平移24',all(simplify(periodic(k+24)-periodic(k))==0 for k in range(24)))
for candidate in [1,2,3,4,6,8,12]:
    check('一8 排除较小约数周期'+str(candidate),any(simplify(periodic(k+candidate)-periodic(k))!=0 for k in range(24)))
for upper,expected in [(1,0),(2,3),(3,6)]:
    eq('一9 冲激积分实际上界'+str(upper),integrate((v*v+2)*DiracDelta(2-v),(v,0,upper)),expected)

base=inverse_gate=integrate(exp(I*w*t),(w,-2,2))/(2*pi)
eq('一10 宽4单位门定义逆变换',base,sin(2*t)/(pi*t))
shifted=(sin(2*(v-pi))/(pi*(v-pi))+sin(2*(v+pi))/(pi*(v+pi)))/2
eq('一10 双移位结果化简',shifted,v*sin(2*v)/(pi*(v*v-pi*pi)))
eq('一10 移频门谱原点时域值',shifted.subs(v,0),0)
for value in [pi,-pi]:
    eq('一10 两个移位中心可去极限'+str(value),limit(shifted,v,value),1/pi)

# 二1反求f(t)：用试验函数检查g(t)=f(2−2t)中的冲激尺度。
for phi in [Integer(1),v,v*v+v+1,exp(v)]:
    g_action=integrate(phi,(v,0,1))-phi.subs(v,2)
    recovered_action=integrate(phi.subs(v,1-v/2),(v,0,2))/2-phi.subs(v,2)
    eq('二1 分布反缩放的原图作用 '+str(phi),recovered_action,g_action)
eq('二1 原冲激位置反变换',solve(Eq(2-2*v,-2),v)[0],2)
eq('二1 恢复后的冲激再缩放强度',2/Abs(-2),1)
input_lt=integrate(exp(-s*v),(v,0,2))-2*exp(2*s)
primitive_lt=-2*integrate(exp(-s*v),(v,-2,0))+integrate((v-2)*exp(-s*v),(v,0,2))
eq('二1 有限支撑积分图回原f的双边LT',s*primitive_lt,input_lt)
eq('二1 原f总面积含冲激',2-2,0)
eq('二1 积分图原点两侧连续',Integer(-2),(v-2).subs(v,0))
eq('二1 积分图最终回零',(v-2).subs(v,2),0)

# 二2用原V形图积分求FT；条件频谱积分再用Abel核在时域独立计算。
V_spectrum=2*integrate(v*cos(w*v),(v,0,1))
eq('二2 原V形FT定义积分',V_spectrum,2*sin(w)/w+2*(cos(w)-1)/(w*w))
eq('二2 原面积给F0',2*integrate(v,(v,0,1)),1)
eq('二2 谱式原点的可去极限',limit(V_spectrum,w,0),1)
freq=Symbol('freq',positive=True)
poisson=2*integrate(exp(-a*t)*cos(freq*t),(t,0,oo))
eq('二2 频谱指数衰减的双边逆积分核',poisson,2*a/(a*a+freq*freq))
eq('二2 正负自变量的核相同',cos(-freq*t),cos(freq*t))
eq('二2 零自变量的核',2*integrate(exp(-a*t),(t,0,oo)),2/a)
abel=2*integrate(v*2*a/(a*a+v*v),(v,0,1))
eq('二2 原V形和Abel核的定义积分',abel,2*a*log(1+1/a**2))
eq('二2 条件谱积分极限',limit(abel,a,0,dir='+'),0)
eq('二2 零频率值乘谱积分',1*limit(abel,a,0,dir='+'),0)

period=2*pi/3
signal=2-4*cos(6*v)+2*sin(9*v)
cs={0:Integer(2),1:Integer(0),2:Integer(-2),3:-I}
for harmonic in [0,1,2,3]:
    coefficient=(integrate(signal*cos(3*harmonic*v),(v,0,period))-I*integrate(signal*sin(3*harmonic*v),(v,0,period)))/period
    eq('二3 原周期积分的复系数C'+str(harmonic),coefficient,cs[harmonic])
eq('二3 单边幅相图回原信号',2+4*cos(6*v+pi)+2*cos(9*v-pi/2),signal)
eq('二3 二次谐波单边幅度',2*Abs(cs[2]),4)
eq('二3 三次谐波单边幅度',2*Abs(cs[3]),2)

# 二4 sin(πt)sin(2πt)/(πt²)的分母只有一个π，不能按单位高梯形。
for point,height in [(0,pi),(pi/2,pi),(2*pi,pi/2),(3*pi,0),(4*pi,0)]:
    overlap=Max(0,Min(pi,point+2*pi)-Max(-pi,point-2*pi))/2
    eq('二4 两原矩形谱定义交叠ω='+str(point),overlap,height)
inverse_trap=(integrate(pi*cos(v*t),(v,0,pi))+integrate((3*pi-v)*cos(v*t)/2,(v,pi,3*pi)))/pi
eq('二4 梯形谱定义逆积分回原h',inverse_trap,sin(pi*t)*sin(2*pi*t)/(pi*t*t))
eq('二4 原h原点连续值',limit(sin(pi*t)*sin(2*pi*t)/(pi*t*t),t,0),2*pi)
eq('二4 正弦稳态选频输出',pi+pi*cos(2*pi*t)/2+0*sin(6*pi*t),pi*(1+cos(2*pi*t)/2))

gain=Symbol('gain')
formal=gain*s/((s-1)*(s+3))
eq('二5 通常严格真有理的右初值定增益',solve(Eq(limit(s*formal,s,oo),4),gain)[0],4)
formal=formal.subs(gain,4)
eq('二5 形式部分分式',formal,1/(s-1)+3/(s+3))
eq('二5 候选因果核回LT',lt(exp(t)+3*exp(-3*t)),formal)
eq('二5 原常数的形式零点',formal.subs(s,0),0)
truncated=integrate(exp(v)+3*exp(-3*v),(v,0,t))
eq('二5 有限窗常数卷积回原积分',truncated,exp(t)-exp(-3*t))
check('二5 全时间常数的普通因果卷积发散',limit(truncated,t,oo)==oo)
eq('二5 不能改成阶跃再称输出零',lt(truncated),formal/s)
eq('二5 加s直接项不改变普通核右值',limit(exp(t)+3*exp(-3*t),t,0),4)

# A4每一节点先递推，给定全响应样值只用于确定同一初态。
H_first=3*(1+q)/(1-2*q)
eq('三1 原两输出增益和反馈生成H',H_first.subs(q,1/z),3*(z+1)/(z-2))
ws=0
zs=[]
for k in range(8):
    prev=ws;ws=1+2*prev
    observed=3*ws+3*prev
    zs.append(observed)
    eq('三1 原节点阶跃零状态k='+str(k),observed,9*Integer(2)**k-6)
eq('三1 所给全响应减零状态在2',42-zs[2],12)
eq('三1 由样值求齐次系数',Rational(42-zs[2],4),3)
initial=Rational(1,3)
for k in range(6):
    now=2*initial
    eq('三1 原节点零输入k='+str(k),3*now+3*initial,3*Integer(2)**k)
    initial=now
eq('三1 给定全响应样值回验',3*2**2+zs[2],42)
check('三1 因果核外ROC不含单位圆',Integer(2)>1)

# A5原箭头：输出向下×2；下支路向左，经−1、−1回上端，合成+x4。
A=Matrix([[1,-2,0,1],[2,1,0,0],[2,-2,2,-1],[0,0,-2,1]])
B=Matrix([1,0,0,0]);C=Matrix([[1,-1,0,0]])
H_state=(C*(z*eye(4)-A).inv()*B)[0]
H_top=(z-3)/(z*z-2*z+5)
H_bottom=-4/(z*(z-3))
eq('三2 两个二阶原支路的反馈合成',H_top/(1-H_top*H_bottom),H_state)
actual=(z*z-3*z)/(z**3-2*z*z+5*z+4)
eq('三2 四状态传输约消为三阶',H_state,actual)
eq('三2 原状态特征式及额外模',A.charpoly(z).as_expr(),(z-3)*(z**3-2*z*z+5*z+4))
eq('三2 可控秩说明隐藏模',Matrix.hstack(*[A**j*B for j in range(4)]).rank(),3)
eq('三2 可观秩说明隐藏模',Matrix.vstack(*[C*A**j for j in range(4)]).rank(),3)
num,den=fraction(cancel(actual))
eq('三2 实际三阶传输已不可约',gcd(num,den),1)
eq('三2 实际极点乘积为负4',-Poly(den,z).all_coeffs()[-1],-4)
check('三2 实际极点模乘积大于1，必有圆外极点',Integer(4)>1)
state=zeros(4,1)
samples=[]
for k in range(10):
    inp=Integer(k==0)
    x1,x2,x3,x4=state
    y=x1-x2
    original_next=Matrix([inp+x1-2*x2+x4,2*x1+x2,2*y+2*x3-x4,-2*x3+x4])
    check('三2 原箭头逐状态更新k='+str(k),original_next==A*state+B*inp)
    samples.append(y)
    expected_rhs=int(k==1)-3*int(k==2)
    eq('三2 原状态输出回实际传输递推k='+str(k),y-2*(samples[k-1] if k>=1 else 0)+5*(samples[k-2] if k>=2 else 0)+4*(samples[k-3] if k>=3 else 0),expected_rhs)
    state=original_next
eq('三2 无直接通路',limit(actual,z,oo),0)
eq('三2 一拍系数对应原首状态',limit(z*actual,z,oo),1)

finish()

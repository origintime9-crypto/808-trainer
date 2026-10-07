"""课程18：从原图、卷积定义、频谱支撑与状态递推独立复核。"""
from common import *

v = Symbol('v', real=True)
phi = v**3 + 2*v + 7
eq('一1 原余弦平移一个基波周期', 3*cos(4*(v+pi/2)+pi/3), 3*cos(4*v+pi/3))
eq('一2 冲激导数作用于试验函数', -diff(sin(v)*phi, v).subs(v,0), -phi.subs(v,0))
# 两个非对称因果指数可检查压缩卷积的雅可比。
original_conv = integrate(exp(-tau)*exp(-3*(t-tau)), (tau,0,t))
compressed_conv = integrate(exp(-2*tau)*exp(-6*(t-tau)), (tau,0,t))
eq('一3 定义积分检查二倍尺度系数', original_conv.subs(t,2*t), 2*compressed_conv)

def step_response(value):
    return (exp(-value) if value >= 0 else 0) + int(bool(value <= -1))
def shifted_output(value):
    return ((exp(-(value-1)) if value >= 1 else 0)
            -(exp(-(value-2)) if value >= 2 else 0)
            +int(bool(value<=0))-int(bool(value<=1)))
for value in [-2, Rational(1,2), Rational(3,2), 3]:
    eq('一4 原阶跃移位叠加t='+str(value), step_response(value-1)-step_response(value-2), shifted_output(value))
eq('一4 远负时间原阶跃的非零基线', step_response(-3), 1)
eq('一5 平方的二倍频率例', expand_trig(cos(v)**2), (1+cos(2*v))/2)

def g(k):
    return Rational(1,4)**k*u(k)
def impulse(k):
    return Integer(k==0)-3*Rational(1,4)**k*u(k-1)
for k in range(-2,8):
    eq('一6 阶跃差分k='+str(k), g(k)-g(k-1), impulse(k))
    eq('一6 脉冲累加还原阶跃k='+str(k), sum(impulse(j) for j in range(-3,k+1)), g(k))
eq('一6 Z域阶跃/脉冲关系', (1-1/z)/(1-1/(4*z)), (z-1)/(z-Rational(1,4)))
eq('一7 原点冲激权重', sin(0), 0)
eq('一7 π/2处冲激权重', sin(pi/2), 1)
eq('一7 后半段普通导数不能丢掉', diff(2*sin(v),v), 2*cos(v))
eq('一8 Hz临界抽样率', 2*10000, 20000)
eq('一8 临界抽样间隔', Rational(1,20000), Rational(50,10**6))
eq('一8 边缘正弦在临界采样点可全零', sin(2*pi*10000*n/20000), 0)
sigma = Symbol('sigma', real=True)
eq('一9 双边LT积分核与指数加权FT', exp(-(sigma+I*w)*v), exp(-sigma*v)*exp(-I*w*v))
eq('一9 在虚轴取值的积分核', exp(-(sigma+I*w)*v).subs(sigma,0), exp(-I*w*v))
alpha = Symbol('alpha', positive=True)
regularized = 2*integrate(exp(-alpha*t)*sin(t)/t, (t,0,oo))
eq('一10 狄利克雷积分的Abel正则化', regularized, pi-2*atan(alpha))
eq('一10 两个等价反正切式的导数', diff(regularized,alpha),diff(2*atan(1/alpha),alpha))
eq('一10 两个反正切式在α1的积分常数',regularized.subs(alpha,1),2*atan(1))
eq('一10 正则化极限', limit(regularized,alpha,0,dir='+'), pi)

inverse_rect = integrate(exp(I*w*t),(w,-1,1))/(2*pi)
eq('二1 原矩形谱逆变换', inverse_rect, sin(t)/(pi*t))
eq('二1 导数能量的频域定义积分', integrate(v*v,(v,-1,1))/(2*pi), 1/(3*pi))
eq('二1 频谱端点对应角频率1', limit(sin(t)/(pi*t),t,0), 1/pi)

# 二2按两个输入矩形的重叠长度积分，不从已写出的折线取值。
nodes = [-2,-1,0,1]
segments = [2*(v+2), -4*v-2, 2*v-2]
for j in range(3):
    midpoint = Rational(nodes[j]+nodes[j+1],2)
    overlap_plus = Max(0, Min(0,midpoint+1)-Max(-1,midpoint))
    overlap_minus = Max(0, Min(1,midpoint+1)-Max(0,midpoint))
    eq('二2 第'+str(j+1)+'段中点原重叠长度', 2*(overlap_plus-overlap_minus), segments[j].subs(v,midpoint))
    for numerator in [1,3]:
        point = nodes[j]+Rational(numerator,4)
        plus = Max(0,Min(0,point+1)-Max(-1,point))
        minus = Max(0,Min(1,point+1)-Max(0,point))
        eq('二2 原重叠长度t='+str(point), 2*(plus-minus), segments[j].subs(v,point))
eq('二2 左支撑端点', segments[0].subs(v,-2),0)
eq('二2 右支撑端点', segments[-1].subs(v,1),0)
eq('二2 折点负1连续', segments[0].subs(v,-1), segments[1].subs(v,-1))
eq('二2 折点0连续', segments[1].subs(v,0),segments[2].subs(v,0))
eq('二2 输出面积等于两个输入面积乘积', sum(integrate(segments[j],(v,nodes[j],nodes[j+1])) for j in range(3)), (1-1)*2)
# 全部输入/输出有限支撑，双边LT定义积分给出第二条独立检验路径。
F_time = integrate(exp(-s*v),(v,-1,0))-integrate(exp(-s*v),(v,0,1))
H_time = 2*integrate(exp(-s*v),(v,-1,0))
Y_time = sum(integrate(segments[j]*exp(-s*v),(v,nodes[j],nodes[j+1])) for j in range(3))
eq('二2 各原区间积分的卷积定理检查',Y_time,F_time*H_time)

# 宽1高1矩形自卷积：两个移动区间的交集给三角谱，系数1/(2π)。
for frequency in [-Rational(3,2),-Rational(3,4),0,Rational(1,4),Rational(3,2)]:
    intersection = Max(0,Min(Rational(1,2),frequency+Rational(1,2))-Max(-Rational(1,2),frequency-Rational(1,2)))
    eq('二3 矩形谱自卷积支撑ω='+str(frequency),intersection,Max(1-Abs(frequency),0))
triangle_inverse = (integrate((1+v)*exp(I*v*t),(v,-1,0))+integrate((1-v)*exp(I*v*t),(v,0,1)))/(4*pi*pi)
eq('二3 三角谱定义逆积分回原平方',triangle_inverse,(sin(t/2)/(pi*t))**2)
modulated_inverse = simplify(expand_complex(triangle_inverse*(exp(I*t)+exp(-I*t))/2))
eq('二3 两个平移三角谱回原调制信号',modulated_inverse,(sin(t/2)/(pi*t))**2*cos(t))
eq('二3 原点可去极限',limit(modulated_inverse,t,0),1/(4*pi*pi))
eq('二3 谱面积回原点值',2*integrate(1-Abs(v),(v,-1,1))/(4*pi),2*pi/(4*pi*pi))
for frequency,height in [(-2,0),(-1,1/(4*pi)),(0,0),(1,1/(4*pi)),(2,0)]:
    eq('二3 移频谱折点ω='+str(frequency),(Max(1-Abs(frequency-1),0)+Max(1-Abs(frequency+1),0))/(4*pi),height)
eq('二3 临界采样角频率',2*pi/(pi/2),4)
eq('二3 本谱最大采样间隔',2*pi/(2*2),pi/2)

# 二4按归一化ω/ω0列出每次谐波调制后的开区间，只有±1在目标带内。
for harmonic in range(-4,5):
    low,high = harmonic-Rational(1,2),harmonic+Rational(1,2)
    meets = max(low,Rational(1,2)) < min(high,Rational(3,2)) or max(low,-Rational(3,2)) < min(high,-Rational(1,2))
    check('二4 原谐波支撑选择k='+str(harmonic),meets == (Abs(harmonic)==1))
amplitude = Symbol('amplitude',positive=True)
phase = Symbol('phase',real=True)
eq('二4 共轭谐波合成实余弦',amplitude*exp(I*phase)*exp(I*v)+amplitude*exp(-I*phase)*exp(-I*v),2*amplitude*cos(v+phase))
eq('二4 目标系数无需除以余弦幅度',1*amplitude,amplitude)

H_cont = (s+2)/(s*s+3*s+2)
eq('二5 原零状态多项式约消',H_cont,1/(s+1))
eq('二5 因果冲激响应回定义LT',lt(exp(-t)),H_cont)
zs = integrate(exp(-tau)*exp(-3*(t-tau)),(tau,0,t))
eq('二5 原时域卷积积分',zs,(exp(-t)-exp(-3*t))/2)
eq('二5 正时间响应代原二阶方程',diff(zs,t,2)+3*diff(zs,t)+2*zs,diff(exp(-3*t),t)+2*exp(-3*t))
eq('二5 右初值',limit(zs,t,0),0)
eq('二5 输入导数冲激对应右导数',limit(diff(zs,t),t,0),1)

# A3：第一延时正反馈1，第二延时负反馈.24；输出.5支路是负号。
q = Symbol('q')
W = 1/(1-q+Rational(6,25)*q*q)
H_discrete = (1-Rational(1,2)*q+q*q)*W
eq('三1 两延时原反馈支路生成分母',1-q+Rational(6,25)*q*q,(1-Rational(3,5)*q)*(1-Rational(2,5)*q))
Hz = H_discrete.subs(q,1/z)
eq('三1 输出负.5支路回z形式',Hz,(z*z-z/2+1)/(z*z-z+Rational(6,25)))
check('三1 因果实际极点严格单位圆内',roots(z*z-z+Rational(6,25),z)=={Rational(3,5),Rational(2,5)})
eq('三1 分子不消去极点.6',(z*z-z/2+1).subs(z,Rational(3,5)),Rational(53,50))
eq('三1 分子不消去极点.4',(z*z-z/2+1).subs(z,Rational(2,5)),Rational(24,25))
eq('三1 独立部分分式还原',Rational(25,6)+Rational(53,6)/(1-Rational(3,5)*q)-12/(1-Rational(2,5)*q),H_discrete)
def h(k):
    return Rational(25,6)*int(k==0)+(Rational(53,6)*Rational(3,5)**k-12*Rational(2,5)**k)*u(k)
recurrence('三1 脉冲闭式回原输入输出差分',h,[1,-1,Rational(6,25)],lambda k:int(k==0)-Rational(1,2)*int(k==1)+int(k==2))
def y(k):
    if k<0:return Integer(0)
    if k==0:return Integer(1)
    if k==1:return Rational(3,2)
    return Rational(212,9)*Rational(3,5)**k-42*Rational(2,5)**k
ws = {}
observed = {}
for k in range(12):
    inp = int(k in [0,1])
    ws[k] = inp+ws.get(k-1,0)-Rational(6,25)*ws.get(k-2,0)
    observed[k] = ws[k]-Rational(1,2)*ws.get(k-1,0)+ws.get(k-2,0)
    eq('三1 原图逐节点递推零状态k='+str(k),observed[k],y(k))
    eq('三1 两脉冲的定义卷积k='+str(k),h(k)+h(k-1),y(k))
recurrence('三1 输入两点脉冲回原差分',y,[1,-1,Rational(6,25)],lambda k:int(k in [0,1])-Rational(1,2)*int(k-1 in [0,1])+int(k-2 in [0,1]))
eq('三1 两脉冲输出总和/DC增益',Rational(175,9)+Rational(25,6)+Rational(212,9)/(1-Rational(3,5))-42/(1-Rational(2,5)),2*H_discrete.subs(q,1))

# A4状态严格取原图三个延时器的输出；直通项来自输入的两条分支。
A=Matrix([[1,0,0],[0,2,-5],[0,1,0]])
B=Matrix([2,1,0]); C=Matrix([[1,2,-5]]); direct=3
H_state=(C*(z*eye(3)-A).inv()*B)[0]+direct
H_flow=2*z/(z-1)+z*z/(z*z-2*z+5)
eq('三2 状态式与两原图反馈支路回算',H_state,H_flow)
eq('三2 两支路原直通增益',limit(H_flow,z,oo),direct)
check('三2 原矩阵的三个特征根',set(A.eigenvals())=={Integer(1),1+2*I,1-2*I})
num,den=fraction(cancel(H_flow))
eq('三2 传输没有隐藏约消极点',gcd(num,den),1)
check('三2 因果收敛域外边界超过单位圆',sqrt(5)>1)
eq('三2 原状态均可控',Matrix.hstack(B,A*B,A*A*B).rank(),3)
eq('三2 原状态均可观',Matrix.vstack(C,C*A,C*A*A).rank(),3)
state=Matrix([0,0,0]); top_delay=0; bottom1=0; bottom2=0
for k in range(10):
    inp=Integer(k==0)
    top_now=2*inp+top_delay
    bottom_now=inp+2*bottom1-5*bottom2
    eq('三2 逐支路输出与当前状态时标k='+str(k),top_now+bottom_now,(C*state)[0]+direct*inp)
    next_state=A*state+B*inp
    check('三2 三延时原节点更新k='+str(k),next_state==Matrix([top_now,bottom_now,bottom1]))
    top_delay,bottom1,bottom2=top_now,bottom_now,bottom1
    state=next_state

finish()

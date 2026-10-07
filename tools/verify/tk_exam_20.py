"""课程20：相同填空独立复算、奇对称谱、缺字符条件式、双边输入和隐藏模矛盾。"""
from common import *

v = Symbol('v', real=True)
a = Symbol('a', positive=True)
b = Symbol('b', real=True)
q = Symbol('q')
# 已同题合并的填空仍按本卷原数值复核。
for power in range(3):
    phi = v**power*exp(-v*v)
    action = integrate((v*v+4)*diff(phi,v,2),(v,0,oo))
    expected = 2*integrate(phi,(v,0,oo))-4*diff(phi,v).subs(v,0)
    eq('一1 二阶分布导数的高斯试验函数'+str(power),action,expected)
fseq = [1,2,-2,1]; hseq = [3,4,2,4]
actual = [sum(fseq[i]*hseq[k-i] for i in range(4) if 0<=k-i<4) for k in range(7)]
check('一2 首项原点约定下直接离散卷积',actual==[3,10,4,3,8,-6,4])
eq('一2 所列幅度总面积乘积',sum(actual),sum(fseq)*sum(hseq))
delay = Symbol('delay', real=True)
eq('一3 从无失真输出回频谱比',exp(-I*w*delay)*b, b*exp(-I*w*delay))
om = Symbol('om', positive=True)
eq('一4 原图明确t/4的奈奎斯特间隔',pi/(om/4),4*pi/om)
signal = 4*cos(20*pi*v)+2*cos(30*pi*v)
eq('一5 定义周期积分的平均功率',5*integrate(signal**2,(v,0,Rational(1,5))),10)
check('一6 延时前后不交换的具体输入',exp(-(3*v-1))!=exp(-3*(v-1)))
eq('一6 输入幅度叠加',b*(3*v)+a*(3*v)**2,(b*v+a*v*v).subs(v,3*v))
check('一7 原分母的实际极点',roots((s*s+1)*(s-1),s)=={I,-I,1})
check('一7 虚轴两极点未被分子约消',all(((s*s+1)*(s-1)).subs(s,r)==0 for r in [I,-I]))
Hfill = z*z/((z-1)*(2*z+1))
eq('一8 本卷一次项负号回原H',Hfill,1/(2-z**-1-z**-2))
check('一8 全部实际极点含单位圆上的+1',roots((z-1)*(2*z+1),z)=={1,-Rational(1,2)})
check('一8 与课程01不同，不能按相同稳定结论合并',cancel(Hfill-1/(2+z**-1-z**-2))!=0)
eq('一9 原负自变量冲激定义筛选',integrate((v*v+2*v)*DiracDelta(1-v),(v,-oo,oo)),3)
even = exp(-(v-3)**2)
eq('一10 延时实偶信号的中心3',even.subs(v,3+a),even.subs(v,3-a))

# 二1仅按中图是y1(t)、相应卷积存在解释；原图纵轴F(ω)与题干冲突。
X1 = integrate(exp(-s*v),(v,0,1))
X2 = integrate(v*exp(-s*v),(v,0,1))+integrate(exp(-s*v),(v,1,oo))
Y1 = integrate(exp(-s*v),(v,-1,1))-integrate(exp(-s*v),(v,1,2))
Y2 = integrate((v+1)*exp(-s*v),(v,-1,1))+integrate((3-v)*exp(-s*v),(v,1,2))+integrate(exp(-s*v),(v,2,oo))
eq('二1 原x2与x1的双边LT关系',X2,X1/s)
eq('二1 条件输出波形独立积分回LT',Y2,Y1/s)
eq('二1 中图总面积与输出平台',2-1,1)
for boundary,left,right in [(-1,0,v+1),(1,v+1,3-v),(2,3-v,1)]:
    eq('二1 输出折点连续'+str(boundary),sympify(left).subs(v,boundary),sympify(right).subs(v,boundary))

# 二2原图关于t=1奇对称；不能把线性相位的符号跳变抹掉。
X = integrate(exp(-I*w*v),(v,-1,0))+integrate((1-v)*exp(-I*w*v),(v,0,2))-integrate(exp(-I*w*v),(v,2,3))
B = 2*(sin(w)-w*cos(2*w))/w**2
eq('二2 三段定义FT与移位纯虚因子',X,I*exp(-I*w)*B)
eq('二2 原信号零面积',1+integrate(1-v,(v,0,2))-1,0)
eq('二2 零频可去值',limit(I*exp(-I*w)*B,w,0),0)
moment = integrate(v,(v,-1,0))+integrate(v*(1-v),(v,0,2))-integrate(v,(v,2,3))
eq('二2 原图一阶矩',moment,-Rational(11,3))
eq('二2 频谱零点附近斜率与原矩',limit(diff(I*exp(-I*w)*B,w),w,0),-I*moment)
check('二2 正频率π/2处谱虚因子正',B.subs(w,pi/2)>0)
check('二2 正频率π处谱虚因子负，必须跳π',B.subs(w,pi)<0)
eq('二2 原图中心反射的正负斜坡',1-(1+a),-(1-(1-a)))
# Abel阻尼的频谱积分核是2a/(a²+t²)，直接由原时域三段积分。
poisson = 2*(integrate(a/(a*a+v*v),(v,-1,0))+integrate((1-v)*a/(a*a+v*v),(v,0,2))-integrate(a/(a*a+v*v),(v,2,3)))
eq('二2 频谱条件积分的Abel反演极限',limit(poisson,a,0,dir='+'),2*pi)
eq('二2 X平方相位e^-jω对应卷积在负1',integrate(1,(v,-1,0)),1)
eq('二2 X平方积分不含共轭，卷积重叠给2π',2*pi*integrate(1,(v,-1,0)),2*pi)
check('二2 绝对平方积分取能量会不同',integrate(1,(v,-1,0))+integrate((1-v)**2,(v,0,2))+integrate(1,(v,2,3))!=1)

# 二3因果H的实际两个衰减极点。
Hs = (3-2*s)/((s+1)*(s+2))
h = 5*exp(-t)-7*exp(-2*t)
ys = 6*t-13+20*exp(-t)-7*exp(-2*t)
eq('二3 原频响回s变量',Hs.subs(s,I*w),(3-I*2*w)/(2-w*w+I*3*w))
eq('二3 冲激响应定义LT',lt(h),Hs)
eq('二3 原点普通冲激响应为负2',limit(h,t,0),-2)
eq('二3 4t阶跃输入定义卷积',integrate(4*tau*(5*exp(-(t-tau))-7*exp(-2*(t-tau))),(tau,0,t)),ys)
eq('二3 零状态象函数与独立逆变换',lt(ys),4*Hs/s**2)
eq('二3 时域原ODE残差',diff(ys,t,2)+3*diff(ys,t)+2*ys,12*t-8)
eq('二3 零状态右初值',limit(ys,t,0),0)
eq('二3 零状态右导数',limit(diff(ys,t),t,0),0)

# 二4字面为乘积，放大原图未出现运算符。两种补符号只作条件解。
for c in [-1,2,3]:
    def full(k):
        return 1+Integer(c)*(Integer(2)**k-k-1)
    eq('二4 条件常数C='+str(c)+'给定y0',full(0),1)
    eq('二4 条件常数C='+str(c)+'给定y1',full(1),1)
    check('二4 常数'+str(c)+'原位移递推',all(simplify(full(k+2)-3*full(k+1)+2*full(k)-c)==0 for k in range(15)))
check('二4 字面乘积不能满足幅度线性',2*2*2 != 2*(2*1*1))
Ac = Matrix([[3,-2],[1,0]])
Bc = Matrix([1,0]); Cc = Matrix([[1,b]])
Hc = (Cc*(z*eye(2)-Ac).inv()*Bc)[0]
eq('二4 补为f[k+1]+bf[k]时的零状态H',Hc,(z+b)/((z-1)*(z-2)))
eq('二4 输入两延时与输出反馈的标准型',cancel((q+b*q*q)/(1-3*q+2*q*q)).subs(q,1/z),Hc)

# 二5直接由原两次调制和两滤波器逐点计算，ωc=7ω1作非重叠检验。
def raw_x(value):
    return Max(0,1-Abs(sympify(value)))
wc = Integer(7); carrier = wc+1
def r1(value):
    return (raw_x(value-wc)+raw_x(value+wc))/2
def r2(value):
    return r1(value) if wc<abs(value)<2*wc else Integer(0)
def r3(value):
    return (r2(value-carrier)+r2(value+carrier))/2
for sample in [Rational(-9,10),Rational(-1,2),0,Rational(1,3),Rational(9,10)]:
    eq('二5 原调制滤波链低通内ω/ω1='+str(sample),r3(sample),Abs(sample)/4)
for sample in [-20,-15,-3,-1,1,3,15,20]:
    output = r3(sample) if abs(sample)<1 else Integer(0)
    eq('二5 H2阻带ω/ω1='+str(sample),output,0)
eq('二5 基带中心由两端零幅合成',r3(0),0)
eq('二5 第一次仅保留正载频外半谱',r2(wc+Rational(1,2)),Rational(1,4))
eq('二5 第一次载频内半谱滤除',r2(wc-Rational(1,2)),0)

# 三1阶跃差分先确定一般h，再以π零点定a。
aa = Symbol('aa', real=True)
Hgeneral = aa+2-1/(1-Rational(1,2)/z)
eq('三1 a先由全时间cosπk的零频响条件',solve(Eq(Hgeneral.subs(z,-1),0),aa)[0],-Rational(4,3))
Hd = Hgeneral.subs(aa,-Rational(4,3))
eq('三1 一阶单位样值核回系统函数',Hd,-(z+1)/(3*(z-Rational(1,2))))
def hd(k):
    return Rational(2,3)*int(k==0)-Rational(1,2)**k*u(k)
def step(k):
    return (-Rational(4,3)+Rational(1,2)**k)*u(k)
for k in range(-2,10):
    eq('三1 原阶跃差分k='+str(k),step(k)-step(k-1),hd(k))
recurrence('三1 差分方程对单位样值核逐点成立',hd,[1,-Rational(1,2)],lambda k:-Rational(1,3)*(int(k==0)+int(k==1)))
eq('三1 h的绝对和证明普通频响存在',Rational(1,3)+summation(Rational(1,2)**n,(n,1,oo)),Rational(4,3))
eq('三1 π频率实际收敛几何级数',Rational(2,3)-1/(1+Rational(1,2)),0)
Ad = Matrix([[Rational(1,2)]]); Bd = Matrix([1]); Cd = Matrix([[-Rational(1,2)]])
# y=−w/3−wprev/3，w=x+(1/2)wprev；消去w的直接项−1/3。
eq('三1 反馈框图独立状态回H',(Cd*(z*eye(1)-Ad).inv()*Bd)[0]-Rational(1,3),Hd)
Xleft = z/(1-z/3)
eq('三1 左边输入定义几何级数',3*(z/3)/(1-z/3),Xleft)
Yleft = cancel(Hd*Xleft)
eq('三1 共存环域内的两极点部分分式',Yleft,-Rational(3,5)*z/(z-Rational(1,2))+Rational(8,5)*z/(z-3))
def bilateral(k):
    return -Rational(3,5)*Rational(1,2)**k*u(k)-Rational(8,5)*Integer(3)**k*u(-k-1)
def input_left(k):
    return Integer(3)**(k+1)*u(-k-1)
for k in range(-5,6):
    m = Symbol('m', integer=True)
    low = max(0,k+1)
    tail = -Integer(3)**(k+1)*Rational(1,6)**low/(1-Rational(1,6))
    convolution = Rational(2,3)*input_left(k)+tail
    eq('三1 从绝对收敛无穷卷积定左右输出k='+str(k),convolution,bilateral(k))
recurrence('三1 双边输入/输出回差分方程',bilateral,[1,-Rational(1,2)],lambda k:-Rational(1,3)*(input_left(k)+input_left(k-1)))
eq('三1 x0为零仍由负时间输入产生y0',bilateral(0),-Rational(3,5))

# 三2实际两积分器节点约束，不能把不受约束二阶ODE的所有输出当成原图输出。
A = Matrix([[-5,-6],[1,0]])
Bstate = Matrix([1,0]); C = Matrix([[-2,-4]])
Hg = (C*(s*eye(2)-A).inv()*Bstate)[0]+1
eq('三2 按原箭头积分器节点回H',Hg,(s+1)/(s+3))
eq('三2 保留所有原反馈的未约简H',Hg,(s*s+3*s+2)/(s*s+5*s+6))
eq('三2 双积分器特征多项式',A.charpoly().as_expr().subs(A.charpoly().gen,s),(s+2)*(s+3))
eq('三2 可观秩仅1，−2不是输出自由模',C.col_join(C*A).rank(),1)
check('三2 所有零输入输出满足一阶关系',(C*A+3*C).is_zero_matrix)
eq('三2 输入项得y导数+3y=f导数+f',(C*Bstate)[0]+3,1)
given_f = 3*(1+exp(-t))
given_y = 4*exp(-2*t)+3*exp(-3*t)+1
residual = diff(given_y,t)+3*given_y-diff(given_f,t)-given_f
eq('三2 原全响应代原图的非零残差',residual,4*exp(-2*t))
check('三2 原全响应与原框图不能同时成立',residual!=0)
Zs = cancel(Hg*lt(given_f))
eq('三2 原图真正零状态响应',Zs,1/s+5/(s+3))
conditional_zi = 4*exp(-2*t)-2*exp(-3*t)
eq('三2 仅按放宽的二阶方程相减的形式ZI',given_y-(1+5*exp(-3*t)),conditional_zi)
eq('三2 形式ZI通过二阶齐次式',diff(conditional_zi,t,2)+5*diff(conditional_zi,t)+6*conditional_zi,0)
eq('三2 形式ZI仍不满足原图输出关系',diff(conditional_zi,t)+3*conditional_zi,4*exp(-2*t))
eq('三2 全响应右极限',limit(given_y,t,0),8)
eq('三2 全响应右普通导数',limit(diff(given_y,t),t,0),-17)
eq('三2 原图冲激直通使零状态右初值为6',limit(1+5*exp(-3*t),t,0),6)
eq('三2 放宽二阶式下的条件左初值',limit(conditional_zi,t,0),2)
eq('三2 放宽二阶式下的条件左导数',limit(diff(conditional_zi,t),t,0),-2)
eq('三2 真正原图要求条件y左导数为负6',-3*Integer(2),-6)
check('三2 两个候选左初值不符合原图',-2!=-6)
finish()
"""课程24独立复核：保留零下标、常数指数、未给时段和半三角通带。"""
from common import *
from sympy import trigsimp

v=Symbol('v',real=True)
rho=Symbol('rho',positive=True)

# 十填空虽然合并旧编号，本卷仍按原数据重新独立核对。
T=lambda x:2*x-1
check('一1 零输入不是零输出',T(0)!=0)
check('一1 倍乘违反线性',T(2*3)!=2*T(3))
eq('一1 固定偏置下延时两侧相同',T(v-2),T(v).subs(v,v-2))
eq('一2 连续冲激筛选余弦系数',cos(2*v).subs(v,0),1)
hk={0:1,1:-1,2:2}
fk={-1:1,0:2,1:-2,2:1}
conv=lambda k:sum(a*fk.get(k-j,0) for j,a in hk.items())
expected=[1,1,-2,7,-5,2]
check('一3 原箭头下标的直接卷积和',[conv(k) for k in range(-1,5)]==expected)
check('一3 支撑外均为零',all(conv(k)==0 for k in list(range(-8,-1))+list(range(5,12))))
eq('一3 定义ZT多项式乘积',sum(a*z**(-k) for k,a in hk.items())*sum(a*z**(-k) for k,a in fk.items()),sum(a*z**(-k) for k,a in zip(range(-1,5),expected)))
eq('一3 全序列求和等于输入总和乘积',sum(expected),sum(hk.values())*sum(fk.values()))
wave=1-cos(v)+Rational(2,5)*sin(3*v)
for k,target in [(0,1),(1,-Rational(1,2)),(-1,-Rational(1,2)),(3,-I/5),(-3,I/5),(2,0),(4,0)]:
 eq('一4 定义FS积分核对k='+str(k),integrate(wave*exp(-I*k*v),(v,0,2*pi))/(2*pi),target)
eq('一5 Euler展开保持原余弦',((exp(100*I*t)+exp(-100*I*t))/2).expand(complex=True),cos(100*t))
L=Symbol('L',positive=True)
for frequency in [w-100,w+100]:
 primitive=-exp(-(2+I*frequency)*v)/(2+I*frequency)
 eq('一5 复指数原函数核对偏频='+str(frequency),diff(primitive,v),exp(-(2+I*frequency)*v))
 eq('一5 复指数尾项模保留真实衰减偏频='+str(frequency),Abs(exp(-(2+I*frequency)*L)),exp(-2*L))
eq('一5 绝对收敛尾项界限趋零',limit(exp(-2*L),L,oo),0)
F5=lt(exp(-2*t)*cos(100*t)).subs(s,I*w)
eq('一5 定义FT积分回两移频分式',F5,(1/(2+I*(w-100))+1/(2+I*(w+100)))/2)
eq('一5 合并复频分母',F5,(2+I*w)/(10004-w**2+4*I*w))
eq('一5 零频定义面积',limit(F5,w,0),Rational(1,5002))
f6=2*cos(3*t)+exp(-2)*sin(3*t)
eq('一6 常数e负2的定义LT',lt(f6),(2*s**2+3*s*exp(-2))/(s*(s**2+9)))
eq('一6 首值仍为2',limit(f6,t,0,dir='+'),2)
eq('一6 常数指数决定右导数',limit(diff(f6,t),t,0,dir='+'),3*exp(-2))
y7=integrate(exp(-2*tau)*exp(-5*(v-tau)),(tau,-2,v))
eq('一7 原积分本身未改上下限',y7,(exp(-2*v)-exp(-5*v-6))/3)
shifted7=simplify(y7.subs(v,t-2))
eq('一7 原起点负2换元成正时间核',shifted7,exp(4)*(exp(-2*t)-exp(-5*t))/3)
eq('一7 零扩展核有有限普通面积',integrate(shifted7,(t,0,oo)),exp(4)/10)
F7=exp(2*I*w)*lt(shifted7).subs(s,I*w)
eq('一7 在负2之前补零才得所列FT',F7,exp(4+2*I*w)/((2+I*w)*(5+I*w)))
eq('一7 零扩展的起点值为0',y7.subs(v,-2),0)
eq('一7 定义面积核对直流值',limit(F7,w,0),exp(4)/10)
check('一7 未给时段另加矩形改变FT',integrate(Integer(1),(v,-4,-3))!=0)
eq('一8 由两右边指数的几何级数',z/(z-2)+z/(z+3),(2*z**2+z)/((z-2)*(z+3)))
q=Symbol('q')
coeffs=series(((2*z**2+z)/((z-2)*(z+3))).subs(z,1/q),q,0,9).removeO()
check('一8 有理式长除核对九个样值',all(coeffs.coeff(q,k)==2**k+(-3)**k for k in range(9)))
check('一8 ROC外边界实际极点3',roots((z-2)*(z+3),z)=={2,-3})
eq('一8 无穷远值等于首样值',limit((2*z**2+z)/((z-2)*(z+3)),z,oo),2)
a=Symbol('a',real=True,nonzero=True)
wm=Symbol('wm',positive=True)
eq('一9 按定义在实际通带积分',integrate(exp(I*w*a),(w,-wm,wm))/(2*pi),sin(wm*a)/(pi*a))
eq('一9 延时中心的可去极限',limit(sin(wm*a)/(pi*a),a,0),wm/pi)
fm=Symbol('fm',positive=True)
eq('一10 时间乘积的三倍最高谐波',trigsimp(cos(v)*cos(2*v)-(cos(v)+cos(3*v))/2),0)
eq('一10 按原Hz给临界间隔',1/(2*3*fm),1/(6*fm))
eq('一10 改为rad每秒时须有pi',2*pi/(2*3*wm),pi/(3*wm))
yp=expand_trig(cos(v+pi/4)*cos(2*v+pi/4))
ym=expand_trig(cos(v-pi/4)*cos(2*v-pi/4))
eq('一10 临界两输入乘积可有不同信号',trigsimp(yp-ym),-sin(3*v))
eq('一10 临界采样无法分辨边界正弦',(-sin(3*v)).subs(v,n*pi/3),0)

# 二1：定义交叠积分与整个紧支撑输出的LT独立回查。
segments=[(0,1,v/2),(1,2,Rational(1,2)),(2,3,(3-v)/2),(4,5,-(v-4)/2),(5,6,-(6-v)/2)]
def yc(value):
 for lo,hi,expr in segments:
  if lo<=value<hi:return expr.subs(v,value)
 return Integer(0)
for value in [Rational(k,4) for k in range(-3,29)]:
 pos_lo=max(Integer(0),value-2)
 pos_hi=min(Integer(1),value)
 neg_lo=max(Integer(0),value-5)
 neg_hi=min(Integer(1),value-4)
 direct=(integrate(Rational(1,2),(tau,pos_lo,pos_hi)) if pos_hi>pos_lo else 0)-(integrate(Rational(1,2),(tau,neg_lo,neg_hi)) if neg_hi>neg_lo else 0)
 eq('二1 原正负矩形定义交叠t='+str(value),direct,yc(value))
X1=integrate(exp(-s*v),(v,0,1))
X2=(integrate(exp(-s*v),(v,0,2))-integrate(exp(-s*v),(v,4,5)))/2
Y= sum(integrate(expr*exp(-s*v),(v,lo,hi)) for lo,hi,expr in segments)
eq('二1 输出分段定义LT等于两输入LT乘积',Y,X1*X2)
eq('二1 正负波形总面积',sum(integrate(expr,(v,lo,hi)) for lo,hi,expr in segments),Rational(1,2))
eq('二1 输入两面积的乘积',integrate(1,(v,0,1))*(integrate(Rational(1,2),(v,0,2))-integrate(Rational(1,2),(v,4,5))),Rational(1,2))

# 二2：不忽略原偶数限制；构造另一个合法奇数延拓证明不唯一。
even=lambda k:Rational(1,2)**k if k>=0 and k%2==0 else Integer(0)
other=lambda k:Rational(1,2)**k if k>=0 else Integer(0)
H1=1/(1-z**(-2)/4)
H2=1-z**(-2)/4
eq('二2 原偶数级数的有限部分和',sum((q**2/4)**m for m in range(9)),(1-(q**2/4)**9)/(1-q**2/4))
check('二2 原偶数级数ROC模严格小于1',expand(4*(Rational(1,2)+rho)**2-1).is_positive)
eq('二2 条件逆系统的乘积恒等1',H1*H2,1)
check('二2 原逐整数卷积回单位样值',all(even(k)-even(k-2)/4==Integer(k==0) for k in range(-8,48)))
eq('二2 从原H1倒数求第二拍抽头',expand((1/H1).subs(z,1/q)).coeff(q,2),-Rational(1,4))
eq('二2 第二子系统有零点正负半',expand(z**2*H2),z**2-Rational(1,4))
check('二2 未给奇数值的两个延拓都符合偶数项',all(even(k)==other(k) for k in range(0,32,2)))
check('二2 同偶数项仍可有不同奇数值',even(1)!=other(1))
check('二2 另一个延拓需一阶逆核',all(other(k)-other(k-1)/2==Integer(k==0) for k in range(-8,48)))
h2=lambda k:Integer(k==0)-Rational(1,4)*Integer(k==2)
eq('二2 由定义ZT回FIR系统函数',sum(h2(k)*z**(-k) for k in range(3)),H2)
check('二2 第二子系统Hankel秩证明两状态必需',Matrix([[h2(1),h2(2)],[h2(2),h2(3)]]).rank()==2)
check('二2 整体单位样值的记忆秩为0',Matrix([[0,0],[0,0]]).rank()==0)

# 二3/4虽合并课程22，按本卷定义卷积和原变量代换重新核对。
step=1-exp(-t)-t*exp(-t)
h3=diff(step,t)
eq('二3 原阶跃导数',h3,t*exp(-t))
eq('二3 原阶跃没有冲激权重',limit(step,t,0,dir='+'),0)
eq('二3 从定义LT求系统函数',lt(h3),1/(s+1)**2)
y3=2-3*exp(-t)+exp(-3*t)
eq('二3 目标象函数定义LT',lt(y3),6/(s*(s+1)*(s+3)))
eq('二3 由目标反求输入象函数',lt(y3)/lt(h3),2/s+4/(s+3))
eq('二3 原定义卷积回目标响应',integrate((t-tau)*exp(-(t-tau))*(2+4*exp(-3*tau)),(tau,0,t)),y3)
eq('二3 目标起点不产生delta撇',limit(y3,t,0,dir='+'),0)
eq('二3 目标右导数不产生delta',limit(diff(y3,t),t,0,dir='+'),0)
sigma=Symbol('sigma',real=True)
xi=Symbol('xi',real=True)
eq('二4 原tau等于xi加2的指数代换',exp(-2*(v-(xi+2))),exp(4)*exp(-2*(v-xi)))
eq('二4 原下限移位成xi大于t减3',v-1-2,v-3)
left=exp(4)*exp(-2*v)
for value in [-3,-1,0,1,3,Rational(7,2),4,5]:
 lo=max(2,value-1)
 direct=integrate(exp(-2*(value-tau)),(tau,lo,3)) if lo<3 else 0
 lo2=max(0,value-3)
 kernel=integrate(exp(4)*exp(-2*(value-xi)),(xi,lo2,1)) if lo2<1 else 0
 eq('二4 原积分与推导核作用同紧支撑输入t='+str(value),direct,kernel)
eq('二4 原左边核定义双边LT',integrate(left*exp(-(-2-rho)*v),(v,-oo,3)),(-exp(-3*s-2)/(s+2)).subs(s,-2-rho))
check('二4 原左尾绝对积分发散',integrate(left,(v,-oo,3))==oo)
check('二4 负时间冲激核非零',left.subs(v,-1)!=0)

# 二5：实际相消、时域卷积和输入导数的冲激匹配。
H5=(s+2)/(s**2+3*s+2)
eq('二5 先约消实际相消因子',H5,1/(s+1))
eq('二5 冲激核定义LT回原系统函数',lt(exp(-t)),H5)
eq('二5 原冲激输入的delta撇系数',limit(exp(-t),t,0,dir='+'),1)
eq('二5 原冲激输入的delta系数',limit(diff(exp(-t),t)+3*exp(-t),t,0,dir='+'),2)
zs5=integrate(exp(-(t-tau))*exp(-3*tau),(tau,0,t))
eq('二5 原时域卷积直接求ZS',zs5,(exp(-t)-exp(-3*t))/2)
eq('二5 ZS定义LT回系统函数乘输入',lt(zs5),H5/(s+3))
eq('二5 正时间ODE普通项核对',diff(zs5,t,2)+3*diff(zs5,t)+2*zs5,-exp(-3*t))
eq('二5 零状态右初值为0',limit(zs5,t,0,dir='+'),0)
eq('二5 输入导数冲激使右导数为1',limit(diff(zs5,t),t,0,dir='+'),1)
eq('二5 相消后不能删除任意初态负2模态',diff(exp(-2*t),t,2)+3*diff(exp(-2*t),t)+2*exp(-2*t),0)

# 三1：在原通带逐点实施采样、滤波和调制，独立检验半谱的增益。
eq('三1 B由周期定义求谱线强度',2*pi/Rational(2,100),100*pi)
eq('三1 C时域相乘有频域归一化',100*pi/(2*pi),50)
G=lambda value:Max(1-Abs(sympify(value)),Integer(0))/10
C=lambda value:50*sum(G(value-5*k) for k in range(-3,4))
def dfilter(value):
 av=abs(value)
 gain=1 if 5<av<6 else (Rational(1,2) if av==5 else 0)
 return C(value)*gain
E=lambda value:(dfilter(value-5)+dfilter(value+5))/2
F=lambda value:E(value) if abs(value)<=1 else Integer(0)
for center in [-10,-5,0,5,10]:eq('三1 C原副本峰高中心='+str(center),C(center),5)
for value,target in [(Rational(21,4),Rational(15,4)),(Rational(11,2),Rational(5,2)),(Rational(23,4),Rational(5,4)),(Rational(19,4),0),(Rational(9,2),0)]:
 eq('三1 D正副本只留外半v='+str(value),dfilter(value),target)
 eq('三1 D负副本只留外半v='+str(value),dfilter(-value),target)
for value in [Rational(k,4) for k in range(-4,5)]:
 eq('三1 E中央增益25v='+str(value),E(value),25*G(value))
for value in [Rational(41,4),Rational(21,2),Rational(43,4)]:
 eq('三1 E正高频半谱v='+str(value),E(value),Rational(5,2)*(11-value))
 eq('三1 E负高频半谱v='+str(value),E(-value),Rational(5,2)*(11-value))
for value in [Rational(k,2) for k in range(-24,25)]:
 eq('三1 F实际两级滤波最终为25G v='+str(value),F(value),25*G(value))
omega=Symbol('omega',real=True)
gactual=(1-omega/(20*pi))/10
input_area=2*integrate(gactual,(omega,0,20*pi))
eq('三1 A原三角谱面积核对f0',input_area/(2*pi),1)
inverseG=integrate(gactual*cos(omega*t),(omega,0,20*pi))/pi
eq('三1 A定义逆FT回Sa平方',trigsimp(inverseG-(sin(10*pi*t)/(10*pi*t))**2),0)
eq('三1 F输出峰与逆FT面积一致',25*input_area/(2*pi),25)
eq('三1 D两个半谱总面积',2*integrate(5*(1-(omega-100*pi)/(20*pi)),(omega,100*pi,120*pi)),100*pi)

# 三2：原微分方程、0负初态与直接型两积分器，重新核对全部联合问。
den=(s+2)*(s+5)
H=(2*s+3)/den
zi=2*exp(-2*t)-exp(-5*t)
zs=exp(-t)/4+exp(-2*t)/3-Rational(7,12)*exp(-5*t)
full=exp(-t)/4+Rational(7,3)*exp(-2*t)-Rational(19,12)*exp(-5*t)
eq('三2 初态象函数回ZI',lt(zi),(s+8)/den)
eq('三2 原输入象函数乘H回ZS',lt(zs),H/(s+1))
eq('三2 两响应相加回全响应',zi+zs,full)
eq('三2 ZI原0负值延续为1',limit(zi,t,0,dir='+'),1)
eq('三2 ZI原0负导数延续为1',limit(diff(zi,t),t,0,dir='+'),1)
eq('三2 ZS右初值0',limit(zs,t,0,dir='+'),0)
eq('三2 输入2f撇含delta使右导数2',limit(diff(zs,t),t,0,dir='+'),2)
eq('三2 全响应右初值1',limit(full,t,0,dir='+'),1)
eq('三2 全响应右导数3而非0负给值1',limit(diff(full,t),t,0,dir='+'),3)
eq('三2 ZI正时间齐次ODE',diff(zi,t,2)+7*diff(zi,t)+10*zi,0)
eq('三2 全响应正时间原ODE',diff(full,t,2)+7*diff(full,t)+10*full,exp(-t))
h=-exp(-2*t)/3+Rational(7,3)*exp(-5*t)
eq('三2 原冲激核定义LT',lt(h),H)
eq('三2 核初值2对应输入导数delta撇',limit(h,t,0,dir='+'),2)
check('三2 原因果两实际极点均左半平面',roots(den,s)=={-2,-5})
check('三2 核绝对积分有有限指数上界',integrate(exp(-2*t)/3+Rational(7,3)*exp(-5*t),(t,0,oo))==Rational(19,30))
A=Matrix([[-7,-10],[1,0]])
B=Matrix([1,0])
output=Matrix([[2,3]])
eq('三2 直接型节点回系统函数',(output*(s*eye(2)-A).inv()*B)[0],H)
initial=Matrix([Rational(23,7),-Rational(13,7)])
eq('三2 两积分器初始化匹配原y0负',(output*initial)[0],1)
eq('三2 两积分器初始化匹配原y撇0负',(output*A*initial)[0],1)
eq('三2 两积分器有输入后右导数3',(output*(A*initial+B))[0],3)
eq('三2 原状态初值的直接型回ZI',(output*(s*eye(2)-A).inv()*initial)[0],(s+8)/den)
finish()

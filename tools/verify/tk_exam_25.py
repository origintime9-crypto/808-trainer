"""课程25独立求解：原箭头、毫安能量、6/4分差分问、三ROC与半周期保持。"""
from common import *
v=Symbol('v',real=True)
a=Symbol('a',real=True,nonzero=True)
rho=Symbol('rho',positive=True)
k=Symbol('k',integer=True)

# 十填空仍按原数据检查，虽然最终沿用旧题编号。
initial=Symbol('initial',real=True)
operator=lambda f:v**2*f*diff(f,v)+2*initial
eq('一1 原非线性倍乘差',operator(2*v)-2*operator(v),2*v**3-2*initial)
check('一1 即使零初态仍非线性',(operator(2*v)-2*operator(v)).subs(initial,0)!=0)
eq('一1 原延时一单位的时变差',operator(v-1)-operator(v).subs(v,v-1),2*v**2-3*v+1)
eq('一2 原冲激根在积分域外',integrate((2*v**2+3*v)*DiracDelta(v/2-2),(v,-oo,3)),0)
eq('一2 保留原冲激尺度',DiracDelta(v/2-2).expand(diracdelta=True,wrt=v),2*DiracDelta(v-4))
eq('一3 两阶跃公共区间积分',integrate(Integer(1),(v,1,2)),1)
check('一3 原两尺度不改变矩形高度',all(Heaviside(2*x-2)*Heaviside(4-2*x)==val for x,val in [(-1,0),(0,0),(Rational(3,2),1),(3,0)]))
f1={0:1,1:2,2:4};f2={-1:2,0:5,1:3}
convolution=lambda j:sum(value*f2.get(j-index,0) for index,value in f1.items())
check('一4 定义卷积逐下标',[convolution(j) for j in range(-1,4)]==[2,9,21,26,12])
eq('一4 原箭头下零时刻样值',convolution(0),9)
eq('一4 两输入ZT乘积回全部下标',sum(c*z**(-j) for j,c in f1.items())*sum(c*z**(-j) for j,c in f2.items()),sum(convolution(j)*z**(-j) for j in range(-1,4)))
eq('一4 全序列和校验',sum(convolution(j) for j in range(-1,4)),sum(f1.values())*sum(f2.values()))
delay=Symbol('delay',real=True)
gain=Symbol('gain',real=True)
eq('一5 冲激核定义卷积还原无失真关系',integrate(gain*DiracDelta(tau-delay)*((v-tau)**2+1),(tau,-oo,oo)),gain*((v-delay)**2+1))
eq('一5 冲激核定义FT',integrate(gain*DiracDelta(v-delay)*exp(-I*w*v),(v,-oo,oo)),gain*exp(-I*w*delay))
for point,value in [(-1,0),(0,0),(Rational(1,2),Rational(1,2)),(1,1),(3,1)]:
 eq('一6 原矩形核积分t='+str(point),integrate(Heaviside(point-tau),(tau,0,1)),value)
G6=integrate(t*exp(-s*t),(t,0,1))+integrate(exp(-s*t),(t,1,oo))
eq('一6 阶跃定义LT回H除以s',G6,(1-exp(-s))/s**2)
for function in [Integer(1),exp(-3*t),t**2]:
 q7=integrate(function.subs(t,t-tau),(tau,0,t))
 Y7=exp(-2*s)*lt(q7)
 eq('一7 原单边积分延时例='+str(function),Y7,exp(-2*s)*lt(function)/s)
eq('一8 衰减余弦由定义LT取虚轴',lt(exp(-2*t)*cos(100*t)).subs(s,I*w),(2+I*w)/(10004-w**2+4*I*w))
eq('一8 两Euler分式FT保持100角频率',(1/(2+I*(w-100))+1/(2+I*(w+100)))/2,(2+I*w)/(10004-w**2+4*I*w))
eq('一8 零频面积',integrate(exp(-2*t)*cos(100*t),(t,0,oo)),Rational(1,5002))
eq('一9 整数下标使DTFT核二pi周期',exp(-I*(w+2*pi)*k),exp(-I*w*k))
check('一9 连续谱不必二pi周期',2/(1+0**2)!=2/(1+(2*pi)**2))
width=Symbol('width',positive=True)
eq('一10 单位门定义FT',integrate(exp(-I*w*v),(v,-width/2,width/2)),2*sin(w*width/2)/w)
eq('一10 第一零点与宽度互反',(2*sin(w*width/2)/w).subs(w,2*pi/width),0)
eq('一10 原点可去峰为门宽',limit(2*sin(w*width/2)/w,w,0),width)

# 二1：在原自然定义域内，显式t而非cos造成时变。
natural=lambda clock,signal:(clock+5)*cos(Integer(1)/sympify(signal))
eq('二1 非零常输入延时对比',natural(v,1)-natural(v-1,1),cos(1))
check('二1 时变反例差非零',cos(1)!=0)
eq('二1 同时刻非零值相同则输出相同',natural(v,exp(v)).subs(v,0),natural(0,1))

# 二2：先从两个有限矩形谱定义反演，再用时域平方及Parseval核验。
omega=Symbol('omega',real=True)
W=2000*pi
carrier=2*pi*10**6
t0=Rational(1,1000)
envelope=sin(W*a)/(2*pi*a)
inverse_env=integrate(exp(I*omega*a)/2,(omega,-W,W))/(2*pi)
# 原角频率的整数倍会触发高阶三角多项式展开；用同一Euler基核对精确恒等式。
eq('二2 包络由有限带矩形定义反演',inverse_env,envelope.rewrite(exp))
eq('二2 原式平移后的包络',sin(2*pi*(1000*(a+t0)-1))/(2*pi*((a+t0)-t0)),envelope)
eq('二2 延时载波相位恰为整数周',cos(carrier*(a+t0)),cos(carrier*a))
two_bands=sum(integrate(exp(I*omega*a)/4,(omega,center-W,center+W)) for center in [-carrier,carrier])/(2*pi)
eq('二2 原双带反演回调制电流',expand(two_bands),expand((envelope*cos(carrier*a)).rewrite(exp)))
eq('二2 可去点的毫安值',limit(envelope*cos(carrier*a),a,0),1000)
eq('二2 双带内定义模平方',Abs(exp(-I*w*t0)/4)**2,Rational(1,16))
check('二2 双带严格分离',carrier>W)
energy_mA=sum(integrate(Rational(1,16),(omega,center-W,center+W)) for center in [-carrier,carrier])/(2*pi)
eq('二2 两带角频率Parseval总积分',energy_mA,250)
q=Symbol('q',real=True)
sinc_square=integrate((sin(q)/q)**2,(q,-oo,oo))
base_energy=W*sinc_square/(4*pi**2)
eq('二2 包络时域定义平方积分',base_energy,500)
# 包络平方在±2W内；由两个矩形的定义卷积交叠长度直接核对2carrier处为零。
overlap=lambda shift:Max(0,Min(W,shift+W)-Max(-W,shift-W))
eq('二2 包络平方在两倍载波频率无分量',overlap(2*carrier)/4,0)
eq('二2 cos平方的时域能量与谱一致',base_energy/2,energy_mA)
eq('二2 毫安平方单位换成安培能量',energy_mA/10**6,Rational(1,4000))
eq('二2 换成毫焦而不是焦',1000*energy_mA/10**6,Rational(1,4))
window=Symbol('window',positive=True)
eq('二2 有限能量长时间功率上界为零',limit(energy_mA/(2*window),window,oo),0)

# 二3：独立频移副本界限，临界相位反例也由允许的两个真实乘积构造。
A=Symbol('A',positive=True);B=Symbol('B',positive=True)
eq('二3 乘积的最高和频由恒等式核对',expand_trig(cos((A+B)*v)+cos((A-B)*v)),2*cos(A*v)*cos(B*v))
sampling=pi/(A+B)
eq('二3 角频率谱副本刚接触间隔',2*pi/sampling,2*(A+B))
product1=sin(A*v)*cos(B*v)
product2=-cos(A*v)*sin(B*v)
eq('二3 允许的两乘积相差最高频正弦',expand_trig(sin((A+B)*v)),product1-product2)
eq('二3 临界样值确实不能区分该边缘相位',sin((A+B)*v).subs(v,k*sampling),0)

# 二4：保留原有限求和的末抽头，不使用网页答案生成期望。
delta=lambda index:Integer(index==0)
forcing=lambda index:sum(delta(index-j)-2*delta(index-j-1) for j in range(5))
check('二4 原求和的六拍强迫项',[forcing(j) for j in range(6)]==[1,-1,-1,-1,-1,-2])
zero={-1:Integer(0)}
for index in range(30):
 zero[index]=zero[index-1]/2+forcing(index)
check('二4 原递推前六ZS值',[zero[j] for j in range(6)]==[1,-Rational(1,2),-Rational(5,4),-Rational(13,8),-Rational(29,16),-Rational(93,32)])
check('二4 末强迫后半倍尾部',all(zero[j]==-Rational(93,32)*Rational(1,2)**(j-5) for j in range(5,30)))
qz=Symbol('qz')
numerator=sum(qz**j-2*qz**(j+1) for j in range(5))
series_zs=series(numerator/(1-qz/2),qz,0,16).removeO()
check('二4 原有理函数长除独立回递推',all(series_zs.coeff(qz,j)==zero[j] for j in range(16)))
zi=lambda index:Rational(1,2)**(index+1)
check('二4 原非零初态的前四ZI',[zi(j) for j in range(4)]==[Rational(1,2),Rational(1,4),Rational(1,8),Rational(1,16)])
eq('二4 ZI原负一下标初值',zi(-1),1)
recurrence('二4 ZI逐拍原齐次方程',zi,[1,-Rational(1,2)],lambda j:0,lo=0,hi=30)
eq('二4 分解后的全响应首拍满足原式',zero[0]+zi(0),Rational(3,2))

# 二5：只验证明确标注的左右−4/4条件解释，不改写原图。
F=integrate(v*exp(-I*w*v),(v,0,2))
Y=integrate(-v*exp(-I*w*v)/4,(v,-4,0))+integrate(v*exp(-I*w*v)/4,(v,0,4))
eq('二5 条件两半波形定义FT回尺度和反褶',Y,F.subs(w,2*w)+F.subs(w,-2*w))
eq('二5 原实信号负频率共轭',F.subs(w,-w),conjugate(F))
eq('二5 条件偶波形频谱为两倍实部',Y,2*re(F.subs(w,2*w)))
eq('二5 条件面积独立回原点频谱',integrate(-v/4,(v,-4,0))+integrate(v/4,(v,0,4)),4)
eq('二5 直接谱零频极限',limit(Y,w,0),4)
f=lambda value:value if 0<value<2 else Integer(0)
check('二5 条件缩放波形逐点核对',all((f(point/2)+f(-point/2))/2==(abs(point)/4 if 0<abs(point)<4 else 0) for point in [Integer(-5),Integer(-3),Integer(-1),Integer(0),Integer(1),Integer(3),Integer(5)]))

# 三1：三种不同时间支持的核，定义双边LT与原点冲激匹配均核验。
den=s**2-s-2
H=1/den
eq('三1 原分母因式分解',den,(s-2)*(s+1))
check('三1 实际有限极点及无约消',roots(den,s)=={-1,2})
eq('三1 独立部分分式留数',H,(1/(s-2)-1/(s+1))/3)
right=(exp(2*v)-exp(-v))/3
left=(exp(-v)-exp(2*v))/3
middle_left=-exp(2*v)/3
middle_right=-exp(-v)/3
sigma_right=2+rho
sigma_left=-1-rho
right_lt=integrate(exp(-sigma_right*v)*right,(v,0,oo))
left_lt=integrate(exp(-sigma_left*v)*left,(v,-oo,0))
eq('三1 原因果核定义LT及右ROC',right_lt,H.subs(s,sigma_right))
eq('三1 原左边核定义LT及左ROC',left_lt,H.subs(s,sigma_left))
for sigma in [-Rational(1,2),0,1,Rational(3,2)]:
 middle_lt=integrate(exp(-sigma*v)*middle_left,(v,-oo,0))+integrate(exp(-sigma*v)*middle_right,(v,0,oo))
 eq('三1 稳定条带内定义双边LT sigma='+str(sigma),middle_lt,H.subs(s,sigma))
eq('三1 双边稳定核绝对积分',-integrate(middle_left,(v,-oo,0))-integrate(middle_right,(v,0,oo)),Rational(1,2))
check('三1 原因果核绝对积分发散',integrate(right,(v,0,oo))==oo)
check('三1 原左边核绝对积分发散',integrate(left,(v,-oo,0))==oo)
for name,negative,positive in [('因果',Integer(0),right),('稳定',middle_left,middle_right),('左边',left,Integer(0))]:
 eq('三1 '+name+'核原点连续无delta撇',positive.subs(v,0)-negative.subs(v,0),0)
 eq('三1 '+name+'核原点导数跳1匹配输入delta',diff(positive,v).subs(v,0)-diff(negative,v).subs(v,0),1)
 eq('三1 '+name+'核负时间齐次ODE',diff(negative,v,2)-diff(negative,v)-2*negative,0)
 eq('三1 '+name+'核正时间齐次ODE',diff(positive,v,2)-diff(positive,v)-2*positive,0)

# 三2：原平顶从0起保持半周期，补偿必须包含正相位。
T=Rational(1,8000)
hold=T/2
Q=integrate(exp(-I*w*v),(v,0,hold))
Q_expected=hold*sin(w*T/4)/(w*T/4)*exp(-I*w*T/4)
eq('三2 持有脉冲定义FT含实际延迟',Q,Q_expected)
eq('三2 持有脉冲零频面积',limit(Q,w,0),hold)
HL=2*exp(I*w*T/4)/(sin(w*T/4)/(w*T/4))
eq('三2 恢复补偿与平顶采样基带乘积',HL*Q/T,1)
eq('三2 恢复DC增益不是T',limit(HL,w,0),2)
edge=8000*pi
eq('三2 通带边缘归一化自变量',edge*T/4,pi/4)
eq('三2 带边缘幅度单侧值',Abs(HL.subs(w,edge)),pi/sqrt(2))
eq('三2 正边缘相位补偿',arg(HL.subs(w,edge)),pi/4)
eq('三2 负边缘相位补偿',arg(HL.subs(w,-edge)),-pi/4)
eq('三2 真实恢复滤波器共轭对称',HL.subs(w,-w),conjugate(HL))
eq('三2 原8kHz采样的4kHz正弦样值全零',sin(edge*k*T),0)
eq('三2 边缘正弦信号本身并非零',sin(edge/(16000)),1)
finish()

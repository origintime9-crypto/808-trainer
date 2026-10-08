"""教材第三章余题：从积分、周期系数、分布边界与原系统独立复核。"""
from common import *
v=Symbol('v',real=True,nonzero=True)
T,E,A,b,a,q= symbols('T E A b a q',positive=True)
k=Symbol('k',integer=True,nonzero=True)

# 3.1 按定义检验包含零阶的内积，不使用网页表格。
for m0,n0 in [(0,0),(1,1),(2,2),(0,1),(1,0),(1,2),(2,4)]:
    value=integrate(cos(m0*v)*cos(n0*v),(v,0,2*pi))
    eq(f'3.1 正交定义m={m0} n={n0}',value,2*pi if m0==n0==0 else pi if m0==n0 else 0)

# 3.2 原题第三个余弦幅度为−5，而非−1；由定义积分求两侧系数。
x2=10*cos(2*v+pi/4)+7*cos(3*v-pi/3)-5*cos(4*v)
c2={2:5*exp(I*pi/4),-2:5*exp(-I*pi/4),3:Rational(7,2)*exp(-I*pi/3),-3:Rational(7,2)*exp(I*pi/3),4:Rational(-5,2),-4:Rational(-5,2)}
for j in [-4,-3,-2,0,1,2,3,4]:
    eq('3.2(1) 原余弦完整周期积分n='+str(j),integrate(expand_trig(x2)*exp(-I*j*v),(v,0,2*pi))/(2*pi),c2.get(j,0))
eq('3.2(2) 物理频率最大公约数',gcd_list([400,600,800]),200)
eq('3.2(2) 最小周期',1/Integer(gcd_list([400,600,800])),Rational(1,200))
eq('3.2(3) 新公共基频Hz',gcd_list([400,500,600,800]),100)
eq('3.2(3) 新周期',1/Integer(gcd_list([400,500,600,800])),Rational(1,100))
for j in [-5,5]:
    eq('3.2(3) 新分量相位定义积分n='+str(j),integrate(cos(5*v+pi/2)*exp(-I*j*v),(v,0,2*pi))/(2*pi),I/2 if j==5 else -I/2)

eq('3.3(1) 独立复指数展开',exp(I*v),cos(v)+I*sin(v))
eq('3.3(1) 原频率最小周期',2*pi/200,pi/100)
eq('3.3(2) 三角展开',expand_trig(cos(v-pi/4)),(cos(v)+sin(v))/sqrt(2))
for j in [-1,1]:
    eq('3.3(2) 移相余弦系数积分n='+str(j),integrate(cos(v-pi/4)*exp(-I*j*v),(v,0,2*pi))/(2*pi),exp(-I*j*pi/4)/2)
for j in [-2,-1,0,1,2]:
    expected={-2:I/2,-1:S.Half,0:0,1:S.Half,2:-I/2}[j]
    eq('3.3(3) 完整周期积分n='+str(j),integrate((cos(v)+sin(2*v))*exp(-I*j*v),(v,0,2*pi))/(2*pi),expected)

cn4=integrate(exp(-v)*exp(-I*k*pi*v),(v,-1,1))/2
eq('3.3(4) 任意非零整数系数定义',cn4,(-1)**k*(exp(1)-exp(-1))/(2*(1+I*k*pi)))
eq('3.3(4) 直流另积分',integrate(exp(-v),(v,-1,1))/2,sinh(1))
for j in [1,2,3]:
    eq('3.3(4) 余弦系数纠错n='+str(j),integrate(exp(-v)*cos(j*pi*v),(v,-1,1)),(-1)**j*(exp(1)-exp(-1))/(1+j*j*pi*pi))
    eq('3.3(4) 正弦系数n='+str(j),integrate(exp(-v)*sin(j*pi*v),(v,-1,1)),(-1)**j*j*pi*(exp(1)-exp(-1))/(1+j*j*pi*pi))
eq('3.3(5) 条件T2定义系数',integrate(v*exp(-I*k*pi*v),(v,-1,1))/2,I*(-1)**k/(k*pi))
eq('3.3(5) 实奇信号条件直流',integrate(v,(v,-1,1))/2,0)
for j in range(-4,5):
    expected=-I/4 if j==2 else I/4 if j==-2 else 2/(pi*(4-j*j)) if j%2 else S.Zero
    eq('3.3(6) 特殊阶数不漏项n='+str(j),integrate(sin(pi*v)*exp(-I*j*pi*v/2),(v,0,2))/4,expected)
eq('3.3(6) 直接sin同频平方积分b2',integrate(sin(pi*v)**2,(v,0,2))/2,S.Half)
eq('3.3(7) 倍角式',expand_trig(sin(v)**2-(1-cos(2*v))/2),0)
eq('3.3(7) 半周期重复',sin(v+pi)**2,sin(v)**2)

# 3.4/5 对周期内的原波形积分，包含独立均值。
eq('3.4 非零系数按原E,T缩放积分',integrate(E*exp(-I*k*2*pi*v),(v,0,S.Half)),E*(1-(-1)**k)/(I*2*pi*k))
eq('3.4 直流包含幅度E',integrate(E,(v,0,S.Half)),E/2)
for j in [1,2,3]:
    eq('3.4 三角正弦系数n='+str(j),2*integrate(E*sin(2*pi*j*v),(v,0,S.Half)),2*E/(pi*j) if j%2 else 0)
eq('3.5(a) 原对称矩形定义非零系数',expand_complex(integrate(exp(-I*k*pi*v/2),(v,-1,1))/4),sin(k*pi/2)/(k*pi))
eq('3.5(a) 不漏直流',integrate(Integer(1),(v,-1,1))/4,S.Half)
eq('3.5(b) 非零下降锯齿系数',integrate(E*(1-v)*exp(-I*k*2*pi*v),(v,0,1)),E/(I*2*pi*k))
eq('3.5(b) 直流面积除T',integrate(E*(1-v/T),(v,0,T))/T,E/2)
eq('3.6 非基本周期定义n3',integrate(cos(2*pi*v)*exp(-I*3*2*pi*v/3),(v,0,3))/3,S.Half)
eq('3.6 非基本周期定义n1',integrate(cos(2*pi*v)*exp(-I*2*pi*v/3),(v,0,3))/3,0)

# 3.7 乘积系数用有限Laurent多项式独立归组；余弦平方反例否定必最小周期T。
z0=Symbol('z0');d={-1:S.Half,1:S.Half}; ee={-2:I/2,2:-I/2}
product=expand(sum(value*z0**j for j,value in d.items())*sum(value*z0**j for j,value in ee.items()))
for j in range(-4,5):
    eq('3.7 乘积归组等于系数卷积k='+str(j),product.coeff(z0,j),sum(value*ee.get(j-m,0) for m,value in d.items()))
eq('3.7 反例乘积半周期重复',cos(v+pi)**2,cos(v)**2)
check('3.7 反例基本周期缩短为半周期',simplify(cos(v+pi/2)**2-cos(v)**2)!=0)
for j in [-2,-1,0,1,2]:
    deriv_coeff=(1 if j==0 else 0)-exp(-I*j*pi)
    cn=I*(-1)**j/(j*pi) if j else S.Zero
    eq('3.8 锯齿常导数加跳变冲激n='+str(j),deriv_coeff,I*j*pi*cn)

tau0=Symbol('tau0',positive=True)
X9a=integrate(exp(-I*w*v),(v,0,tau0))
eq('3.9(a) 原图定义FT',X9a,(1-exp(-I*w*tau0))/(I*w))
eq('3.9(a) 零频极限',limit(X9a,w,0),tau0)
eq('3.9(a) 中心延时形式',X9a,tau0*sin(w*tau0/2)/(w*tau0/2)*exp(-I*w*tau0/2))
X9b=integrate(E*(1-v/T)*exp(-I*w*v),(v,0,T))
eq('3.9(b) 原图定义FT',X9b,E/(I*w)+E*(1-exp(-I*w*T))/(T*w*w))
eq('3.9(b) 零频极限面积',limit(X9b,w,0),E*T/2)
# a>0，b,w实数：绝对值由exp(-a*v)控制，可先化为指数再逐项积分。
# conds='none'只跳过SymPy未能判定的复参数arg条件，不跳过答案相等检验。
eq('3.10(1) 衰减余弦定义积分',integrate((exp(-a*v)*cos(b*v)*exp(-I*w*v)).rewrite(exp).expand(),(v,0,oo),conds='none'),(a+I*w)/((a+I*w)**2+b*b))
eq('3.10(1) 零调制退化',((a+I*w)/((a+I*w)**2+b*b)).subs(b,0),1/(a+I*w))
eq('3.10(2) 原区间和衰减率3',integrate(exp(-(3+I*w)*v),(v,-2,3)),(exp(2*(3+I*w))-exp(-3*(3+I*w)))/(3+I*w))
X103=integrate((v*exp(-2*v)*sin(4*v)*exp(-I*w*v)).rewrite(exp).expand(),(v,0,oo),conds='none')
eq('3.10(3) 直接半轴积分',X103,8*(2+I*w)/((2+I*w)**2+16)**2)
eq('3.10(3) 频域微分独立解',I*diff(4/((2+I*w)**2+16),w),X103)
# 3.10(4) 从谱冲激逐一反演，与原信号比较；避免把稠密非周期性与连续谱混同。
inv104=(pi/I*(exp(I*v)-exp(-I*v))+pi*exp(I*pi/4)*exp(I*2*pi*v)+pi*exp(-I*pi/4)*exp(-I*2*pi*v))/(2*pi)
eq('3.10(4) 所有冲激权重反演',expand_complex(inv104),sin(v)+cos(2*pi*v+pi/4))
check('3.10(4) 两物理频率比非有理', (2*pi).is_rational is False)
def overlap(x): return max(S.Zero,min(Integer(1),x+2)-max(Integer(-1),x-2))
def trap(x):return pi if abs(x)<=1 else pi*(3-abs(x))/2 if abs(x)<3 else S.Zero
for at in [-4,Rational(-5,2),-1,0,1,Rational(5,2),4]:
    eq('3.10(5) 原两矩形频谱定义卷积ω='+str(at),pi*overlap(at)/2,trap(at))
eq('3.10(5) 梯形总面积回时间原点',(integrate(pi,(v,-1,1))+2*integrate(pi*(3-v)/2,(v,1,3)))/(2*pi),2)
eq('3.10(6) 单位矩形零频积分系数',Integer(1)*pi,pi)
eq('3.10(6) 累计原点对称性',integrate(sin(pi*v)/(pi*v),(v,-oo,0)),S.Half)
for freq in [pi/2,2*pi]:
    eq('3.10(6) jω乘积恢复被积谱ω='+str(freq),I*freq*(1/(I*freq) if abs(freq)<pi else 0),1 if abs(freq)<pi else 0)

X12a=integrate(v/tau0*exp(-I*w*v),(v,-tau0,tau0))
expected12a=2*I*(w*tau0*cos(w*tau0)-sin(w*tau0))/(w*w*tau0)
eq('3.12(a) 原奇斜坡定义积分',X12a,expected12a)
eq('3.12(a) 两端分布跳变FT',I*w*X12a,2*sin(w*tau0)/(w*tau0)-2*cos(w*tau0))
eq('3.12(a) 零频面积极限',limit(X12a,w,0),0)
d0,c0= symbols('d0 c0',positive=True)
# τ1=c0, τ2=c0+d0，确保图形斜段上下限，不让积分假设倒置。
X12b=2*integrate(E*cos(w*v),(v,0,c0/2))+2*integrate(E*(c0+d0-2*v)/d0*cos(w*v),(v,c0/2,(c0+d0)/2))
target12b=4*E*(cos(w*c0/2)-cos(w*(c0+d0)/2))/(d0*w*w)
eq('3.12(b) 原梯形分段定义积分',X12b,target12b)
eq('3.12(b) 面积极限',limit(X12b,w,0),E*(2*c0+d0)/2)
eq('3.12(b) 二阶跳变系数回算',-w*w*X12b,4*E/d0*(cos(w*(c0+d0)/2)-cos(w*c0/2)))
eq('3.12(b) 独立卷积两矩形',2*E/d0*(2*sin(w*(2*c0+d0)/4)/w)*(2*sin(w*d0/4)/w),target12b)

# 3.15 用非对称实信号独立核对实/虚与奇/偶；不是只复写符号声明。
testx=exp(-a*v)  # 右半轴指数，偶/奇部分的正半轴各为半个指数。
even_ft=integrate((exp(-a*v)*cos(w*v)).rewrite(exp).expand(),(v,0,oo),conds='none')
odd_ft=-I*integrate((exp(-a*v)*sin(w*v)).rewrite(exp).expand(),(v,0,oo),conds='none')
eq('3.15 偶部定义FT等实部',even_ft,a/(a*a+w*w))
eq('3.15 奇部定义FT等j虚部',odd_ft,-I*w/(a*a+w*w))
eq('3.15 两部分相加回右边指数',even_ft+odd_ft,1/(a+I*w))
G16=integrate(exp(-a*2*(v-1))*exp(-I*w*v),(v,1,oo),conds='none')
eq('3.16 具体原g定义FT检验尺度延时',G16,exp(-I*w)/(2*(a+I*w/2)))
eq('3.16 累计终值等G0',integrate(exp(-a*2*(v-1)),(v,1,oo)),1/(2*a))
eq('3.16 δ权重',pi*limit(G16,w,0),pi/(2*a))

# 3.17 以Abel衰减正弦、余弦独立求普通部分；谱线来自洛伦兹核质量。
regulated_cos=integrate((exp(-a*v)*cos(b*v)*exp(-I*w*v)).rewrite(exp).expand(),(v,0,oo),conds='none')
regulated_sin=integrate((exp(-a*v)*sin(b*v)*exp(-I*w*v)).rewrite(exp).expand(),(v,0,oo),conds='none')
eq('3.17(1) ω≠±b的Abel普通部分',limit(regulated_cos,a,0,dir='+'),(1/(I*(w-b))+1/(I*(w+b)))/2)
eq('3.17(2) ω≠±b的Abel普通部分',limit(regulated_sin,a,0,dir='+'),(1/(I*(w-b))-1/(I*(w+b)))/(2*I))
eq('3.17 洛伦兹核全质量为π',integrate(a/(a*a+v*v),(v,-oo,oo)),pi)
eq('3.17(1) 两条谱线逆变换系数', (pi/2)/(2*pi),Rational(1,4))
eq('3.17(2) 正频率冲激系数', pi/(2*I),-I*pi/2)

def length(x,u1,u2):return max(S.Zero,min(u1/2,x+u2/2)-max(-u1/2,x-u2/2))
def defined_conv(x,u1,u2):
    a0=(u1+u2)/2;b0=abs(u1-u2)/2;m0=min(u1,u2)
    return m0 if abs(x)<=b0 else a0-abs(x) if abs(x)<a0 else S.Zero
for u1,u2 in [(Integer(2),Integer(4)),(Integer(4),Integer(2)),(Integer(2),Integer(2))]:
    check('3.18(1) 原区间滑动重叠交换与等宽'+str((u1,u2)),all(length(Rational(i,4),u1,u2)==defined_conv(Rational(i,4),u1,u2) for i in range(-16,17)))
eq('3.18(2) 原矩形直接积分再相乘',integrate(exp(-I*w*v),(v,-c0/2,c0/2))*integrate(exp(-I*w*v),(v,-d0/2,d0/2)),c0*d0*(sin(w*c0/2)/(w*c0/2))*(sin(w*d0/2)/(w*d0/2)))
eq('3.18(2) 频谱原点等卷积面积',limit(c0*d0*(sin(w*c0/2)/(w*c0/2))*(sin(w*d0/2)/(w*d0/2)),w,0),c0*d0)
X19=2*integrate(exp(-I*w*v),(v,0,1))+integrate(exp(-I*w*v),(v,1,2))
eq('3.19 原两台阶定义FT',X19,(2-exp(-I*w)-exp(-2*I*w))/(I*w))
eq('3.19 零频面积',limit(X19,w,0),3)

# 3.22 非端点冲激区间筛选完整权重，包含n=0。
for j in range(-3,4):
    coeff=(1-exp(-I*j*pi))/T
    eq('3.22 交替冲激级数系数n='+str(j),coeff,2/T if j%2 else 0)
    eq('3.22 周期FT权重区别2πn='+str(j),2*pi*coeff,4*pi/T if j%2 else 0)
eq('3.23 两段原谱定义逆积分', (integrate(A*exp(I*A)*exp(I*w*v),(w,-b,0))+integrate(A*exp(-I*A)*exp(I*w*v),(w,0,b)))/(2*pi),A*(sin(b*v-A)+sin(A))/(pi*v))
x23=A*(sin(b*v-A)+sin(A))/(pi*v)
eq('3.23 正弦积化和差',x23,A*b/pi*(sin(b*v/2)/(b*v/2))*cos(b*v/2-A))
eq('3.23 原点从谱积分独立算',A*b*cos(A)/pi,limit(x23,v,0))
check('3.23 原书缺2不是正确幅度',A*b*cos(A)/pi != A*b*cos(A)/(2*pi))
eq('3.24(1) 单冲激逆FT',integrate(DiracDelta(w-b)*exp(I*w*v),(w,-oo,oo))/(2*pi),exp(I*b*v)/(2*pi))
eq('3.24(2) 两冲激原符号逆FT',integrate((DiracDelta(w+b)-DiracDelta(w-b))*exp(I*w*v),(w,-oo,oo))/(2*pi),sin(b*v)/(I*pi))
x243=integrate(exp(I*w*v),(w,-b,b))/(2*pi)
eq('3.24(3) 有限矩形原谱逆积分',x243,sin(b*v)/(pi*v))
eq('3.24(3) 可去点',limit(x243,v,0),b/pi)
x244=integrate(w/pi*exp(I*w*v),(w,-b,b))/(2*pi)
eq('3.24(4) 有限带条件逆积分',x244,I*(sin(b*v)-b*v*cos(b*v))/(pi*pi*v*v))
eq('3.24(4) 条件原点',limit(x244,v,0),0)
check('3.24(4) 印刷分段条件在负频率冲突',(-2*b<=b) and (Abs(-2*b)>b))
eq('3.25(1) 从时间候选定义FT核验',integrate(v*exp(-2*v)*exp(-I*w*v),(v,0,oo),conds='none'),1/(2+I*w)**2)
eq('3.25(1) 两衰减指数独立卷积',integrate(exp(-2*tau)*exp(-2*(t-tau)),(tau,0,t)),t*exp(-2*t))
Fabs=2*integrate((v*exp(-a*v)*cos(w*v)).rewrite(exp).expand(),(v,0,oo),conds='none')
Framp=2*integrate(v*exp(-a*v)*exp(-I*w*v),(v,0,oo),conds='none')
eq('3.25(2) |t|Abel定义谱',Fabs,2*(a*a-w*w)/(a*a+w*w)**2)
eq('3.25(2) 两候选非零频率极限相同',limit(Fabs,a,0,dir='+'),limit(Framp,a,0,dir='+'))
eq('3.25(2) 非零频率普通分式',limit(Fabs,a,0,dir='+'),-2/w**2)
eq('3.25(2) 奇部谱为洛伦兹导数',Framp-Fabs,2*I*diff(a/(a*a+w*w),w))
for side in [t,-t]:
    eq('3.25(2) 奇部时间差等t的两侧'+str(side),2*side*Heaviside(side)-Abs(side),side)
check('3.25(2) 普通1/ω²原点积分发散',limit(integrate(1/v**2,(v,a,1)),a,0,dir='+')==oo)

# 系统题同时核对直通、原ODE、初态跳变，不只部分分式。
H27=(1-s)/(1+s);h27=2*exp(-t)
g27=-1+integrate(h27.subs(t,tau),(tau,0,t))
eq('3.27(1) 原H含直通分解',H27,-1+2/(s+1))
eq('3.27(1) δ卷积加连续积分',g27,1-2*exp(-t))
eq('3.27(1) 跳变−1',g27.subs(t,0),-1)
eq('3.27(1) 终值',limit(g27,t,oo),1)
y27=-exp(-2*t)+integrate(h27.subs(t,tau)*exp(-2*(t-tau)),(tau,0,t))
eq('3.27(2) 原h与输入独立卷积',y27,2*exp(-t)-3*exp(-2*t))
eq('3.27(2) 原频谱乘积回算',lt(y27),H27/(s+2))
for freq in [1,3]:
    eq('3.28 原H复值ω='+str(freq),1/(1+I*freq),(1-I*freq)/(1+freq*freq))
y28=(sin(v)-cos(v))/2+(sin(3*v)-3*cos(3*v))/10
eq('3.28 原一阶方程直接回代',diff(y28,v)+y28,sin(v)+sin(3*v))
check('3.28 幅度增益不同足以否定无失真',Abs(1/(1+I))!=Abs(1/(1+3*I)))
eq('3.28 原相位−atan3',atan(im(1/(1+3*I))/re(1/(1+3*I))),-atan(3))
zi29=7*exp(-2*t)-5*exp(-3*t)
zs29=integrate((-2*exp(-2*tau)+3*exp(-3*tau))*exp(-(t-tau)),(tau,0,t))
eq('3.29 ZS原h卷积',zs29,-exp(-t)/2+2*exp(-2*t)-3*exp(-3*t)/2)
eq('3.29 ZI左初值',zi29.subs(t,0),2)
eq('3.29 ZI左初态导数',diff(zi29,t).subs(t,0),1)
y29=zi29+zs29
eq('3.29 全响应相加',y29,-exp(-t)/2+9*exp(-2*t)-Rational(13,2)*exp(-3*t))
eq('3.29 正时间原ODE',diff(y29,t,2)+5*diff(y29,t)+6*y29,-exp(-t))
eq('3.29 输出值无跳变',y29.subs(t,0),2)
eq('3.29 原输入δ使导数跳1',diff(y29,t).subs(t,0)-1,1)
h30=(exp(-t)+exp(-3*t))/2
eq('3.30 原ODE频谱关系',lt(h30),(s+2)/(s*s+4*s+3))
eq('3.30 正时间齐次方程',diff(h30,t,2)+4*diff(h30,t)+3*h30,0)
eq('3.30 δ′系数匹配原输入',h30.subs(t,0),1)
eq('3.30 δ系数匹配原输入',diff(h30,t).subs(t,0)+4*h30.subs(t,0),2)
eq('3.31 两次调制原积独立展开',(8*cos(100*v)*cos(500*v)**2).rewrite(exp).expand(),(4*cos(100*v)+2*cos(900*v)+2*cos(1100*v)).rewrite(exp).expand())
check('3.31 低通仅保留100',100<120 and 900>120 and 1100>120)
delta=Symbol('delta',real=True,nonzero=True)
for name,width,height,expected0 in [('3.32(1)',2*pi,Integer(1),2),('3.32(2)',pi,Integer(1),1),('3.32(3)',2*pi,Rational(1,3),Rational(2,3))]:
    value=integrate(height*exp(I*w*delta),(w,-width,width))/(2*pi)
    eq(name+' 原带宽高度逆积分',value,height*sin(width*delta)/(pi*delta))
    eq(name+' t=2可去极限',limit(value,delta,0),expected0)

finish()

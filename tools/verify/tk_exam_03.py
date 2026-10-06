"""课程题库 03：从定义独立验证变换、条件卷积、状态和调制链。"""
from common import *
from sympy.discrete.convolutions import convolution

v=Symbol('v',real=True)
fm=Symbol('fm',positive=True)
wm=Symbol('wm',positive=True)
delay=Symbol('delay',real=True)
state=Symbol('state',real=True)
a,b=symbols('a b',positive=True)
q=Symbol('q',real=True)

eq('一1 冲激时移定义变换',integrate(3*DiracDelta(v-2)*exp(-I*w*v),(v,-oo,oo)),3*exp(-2*I*w))
eq('一2 Hz 与角频单位换算',1/(6*fm),pi/(3*(2*pi*fm)))
eq('一3 阶跃交集面积',integrate(1,(v,1,2)),1)
check('一4 有限序列独立卷积',convolution([1,2,4],[2,5,3])==[2,9,21,26,12])
check('一4 零下标定位',0+(-1)==-1 and 2+1==3)
def op(expr):return v*v*expr*diff(expr,v)+2*state
eq('一5 输入倍乘不满足线性',op(2*v)-2*op(v),2*v**3-2*state)
eq('一5 平移不满足时不变',op(v-1)-op(v).subs(v,v-1),2*v*v-3*v+1)
eq('一6 冲激位置在区间外',integrate((2*v*v+3*v)*DiracDelta(v/2-2),(v,-oo,3)),0)
eq('一7 常数指数的拉氏变换',lt(2*cos(3*t)+exp(-2)*sin(3*t)),(2*s*s+3*s*exp(-2))/(s*(s*s+9)))
eq('一7 右初值',limit(s*(2*s+3*exp(-2))/(s*s+9),s,oo),2)
y8=(exp(-2*v)-exp(-5*v-6))/3
eq('一8 原积分时域计算',integrate(exp(-2*tau)*exp(-5*(v-tau)),(tau,-2,v)),y8)
eq('一8 零延拓的完整傅里叶积分',integrate(y8*exp(-I*w*v),(v,-2,oo),conds='none'),exp(4+2*I*w)/((2+I*w)*(5+I*w)))
eq('一8 信号面积独立检查',integrate(y8,(v,-2,oo)),exp(4)/10)
eq('一9 从序列几何级数反查',1/(1-2/z)+1/(1+3/z),(2*z*z+z)/((z-2)*(z+3)))
eq('一9 初项',limit((2*z*z+z)/((z-2)*(z+3)),z,oo),2)
eq('一10 低通定义逆积分',integrate(exp(I*w*(v-delay)),(w,-wm,wm))/(2*pi),sin(wm*(v-delay))/(pi*(v-delay)))
eq('一10 延时中心极限',limit(sin(wm*(v-delay))/(pi*(v-delay)),v,delay),wm/pi)
eq('二1 符号函数矩形逆积分',integrate(2*exp(I*w*t),(w,-1,1))/(2*pi),2*sin(t)/(pi*t))

h12=integrate(exp(-3*(v-tau)),(tau,1,v-2))
h13=integrate(exp(-2*(v-tau)),(tau,1,v))
eq('二2 延时阶跃与截断指数直接卷积',h12,exp(-6)*(1-exp(-3*(v-3)))/3)
eq('二2 延时阶跃与因果指数直接卷积',h13,(1-exp(-2*(v-1)))/2)
H2=(1+exp(-s)/s)*(exp(-6-2*s)/(s+3)+1/(s+2))
independent_H2=exp(-3*s-6)*(1/s-1/(s+3))/3+exp(-s)*(1/s-1/(s+2))/2+exp(-2*s-6)/(s+3)+1/(s+2)
eq('二2 四项变换反查串并联',independent_H2,H2)

def ramp(value):return max(value,0)
def conv_param(value,aa,bb):
    return 2*(ramp(value+1)-ramp(value-1))-(ramp(value+1-aa)-ramp(value-1-aa))-(ramp(value+1-bb)-ramp(value-1-bb))
def overlap(lo,hi,value):
    return max(min(hi,value+1)-max(lo,value-1),0)
def by_overlap(value,aa,bb):
    return 2*overlap(0,aa,value)+overlap(aa,bb,value)
probes=[Rational(j,4) for j in range(-20,41)]
pairs=[(1,2),(Rational(1,2),3),(2,Rational(5,2))]
check('二3 参数卷积与独立重叠积分一致',all(conv_param(value,aa,bb)==by_overlap(value,aa,bb) for aa,bb in pairs for value in probes))
def conditional(value):
    if -1<value<0:return 2*(value+1)
    if 0<=value<1:return value+2
    if 1<=value<2:return 5-2*value
    if 2<=value<3:return 3-value
    return Integer(0)
check('二3 条件分段式覆盖所有区间',all(conv_param(value,1,2)==conditional(value) for value in probes))
eq('二3 条件波形面积',integrate(2*(v+1),(v,-1,0))+integrate(v+2,(v,0,1))+integrate(5-2*v,(v,1,2))+integrate(3-v,(v,2,3)),6)

A=Matrix([[0,1],[-3,-5]]);B=Matrix([0,1]);C=Matrix([[7,2]])
eq('二4 状态矩阵回算原系统函数',(C*(s*eye(2)-A).inv()*B)[0],(2*s+7)/(s*s+5*s+3))
wrong=Matrix([[0,1],[-1,-5]])
check('二4 参考漏系数确实改变系统',simplify((C*(s*eye(2)-wrong).inv()*B)[0]-(2*s+7)/(s*s+5*s+3))!=0)

width=Symbol('width',positive=True)
period=Symbol('period',positive=True)
freq=Symbol('freq',real=True,nonzero=True)
coef=(integrate((1+2*v/width)*exp(-I*freq*v),(v,-width/2,0))+integrate((1-2*v/width)*exp(-I*freq*v),(v,0,width/2)))/period
eq('二5 三角脉冲傅里叶系数直接积分',coef,width/(2*period)*(sin(freq*width/4)/(freq*width/4))**2)
eq('二5 平均值及恢复增益',limit(coef,freq,0)*(2*period/width),1)
c0,c1,ap,am=symbols('c0 c1 ap am',real=True)
bp=c0*ap+c1*am;bm=c1*ap+c0*am
eq('二5 临界正边缘谱线解耦',(c0*bp-c1*bm)/(c0*c0-c1*c1),ap)
eq('二5 临界负边缘谱线解耦',(c0*bm-c1*bp)/(c0*c0-c1*c1),am)
check('二5 有限三角宽度的可逆样例',all(0<float((sin(pi*value/2)/(pi*value/2))**2)<1 for value in [Rational(1,100),Rational(1,2),1]))

den=(s+2)*(s+5);H=(2*s+1)/den
eq('三1(1) 冲激响应拉氏回算',lt(-exp(-2*t)+3*exp(-5*t)),H)
check('三1(1) 因果左半平面极点',roots(den,s)=={-2,-5})
zi=Rational(17,3)*exp(-2*t)-Rational(5,3)*exp(-5*t)
zs=-exp(-t)/4+exp(-2*t)-3*exp(-5*t)/4
eq('三1(2) 初態项的拉氏回算',lt(zi),(4*s+25)/den)
eq('三1(2) 初值',zi.subs(t,0),4)
eq('三1(2) 初始导数',diff(zi,t).subs(t,0),-3)
eq('三1(2) 时域齐次方程',diff(zi,t,2)+7*diff(zi,t)+10*zi,0)
eq('三1(3) 输入与系统乘积变换',lt(zs),H/(s+1))
eq('三1(3) 零状态连续值',zs.subs(t,0),0)
eq('三1(3) 输入冲激引起的导数跳变',diff(zs,t).subs(t,0),2)
eq('三1(3) 正时间微分方程',diff(zs,t,2)+7*diff(zs,t)+10*zs,-exp(-t))
eq('三1(3) 全响应及受激跳变',diff(zi+zs,t).subs(t,0),-1)
shifted=zs.subs(t,v-1)
eq('三1(4) 延时后从 t=1 起的拉氏积分',integrate(shifted*exp(-s*v),(v,1,oo)),exp(-s)*H/(s+1))

# 用实际 rad/s 频率逐点运算，避免把另卷的 π 单位带入本题。
def inp(value):return Integer(2)*max(1-abs(sympify(value))/10,0)
def node_b(value):return (inp(value-100)+inp(value+100))/2
def node_c(value):return node_b(value) if 80<abs(value)<100 else Integer(0)
def node_d(value):return (node_c(value-100)+node_c(value+100))/2
def node_e(value):return node_d(value) if abs(value)<15 else Integer(0)
freqs=[Rational(j,2) for j in range(-430,431) if j%2]
check('三2 B 副本支撑与峰值',node_b(100)==1 and node_b(-100)==1 and all(node_b(value)==0 for value in freqs if not 90<abs(value)<110))
check('三2 C 内侧半谱及幅度',all(node_c(value)==(inp(value-100) if value>0 else inp(value+100))/2 for value in freqs if 90<abs(value)<100) and all(node_c(value)==0 for value in freqs if not 90<abs(value)<100))
def expected_d(value):
    if abs(value)<10:return inp(value)/4
    if -200<value<-190:return (-190-value)/20
    if 190<value<200:return (value-190)/20
    return Integer(0)
check('三2 D 全部频段移频结果',all(node_d(value)==expected_d(value) for value in freqs))
check('三2 E 输出完整谱为四分之一',all(node_e(value)==inp(value)/4 for value in freqs))
inverse_input=(integrate(2*(1+w/10)*exp(I*w*t),(w,-10,0))+integrate(2*(1-w/10)*exp(I*w*t),(w,0,10)))/(2*pi)
eq('三2 输入谱定义逆变换',inverse_input,10/pi*(sin(5*t)/(5*t))**2)
eq('三2 输出零时值面积检查',limit(inverse_input/4,t,0),Rational(5,2)/pi)
finish()

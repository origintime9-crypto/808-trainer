"""课程题库 02：独立的算子、变换、状态方程、递推及频谱检查。"""
from common import *
from sympy.discrete.convolutions import convolution

v=Symbol('v',real=True)
state=Symbol('state',real=True)
fm=Symbol('fm',positive=True)
eps=Symbol('eps',positive=True)
amp=Symbol('amp',real=True)
a,b=symbols('a b',real=True)
q=Symbol('q')
def op(expr):
    return v*v*expr*diff(expr,v)+2*state
eq('一1 输入倍乘的非线性反例',op(2*v)-2*op(v),2*v**3-2*state)
eq('一1 时间平移反例',op(v-1)-op(v).subs(v,v-1),2*v*v-3*v+1)
eq('一2 冲激在区间外',integrate((2*v*v+3*v)*DiracDelta(v/2-2),(v,-oo,3)),0)
eq('一3 阶跃交集积分',integrate(1,(v,1,2)),1)
check('一4 有限序列独立卷积',convolution([1,2,4],[2,5,3])==[2,9,21,26,12])
check('一4 下标加和',0+(-1)==-1 and 2+1==3)
eq('一5 冲激无失真频响样例',integrate(3*DiracDelta(v-2)*exp(-I*w*v),(v,-oo,oo)),3*exp(-2*I*w))
eq('一6 合成带宽抽样间隔',1/(2*(fm+2*fm)),1/(6*fm))
check('一7 实际虚轴极点',roots((s*s+1)*(s-1),s)=={1,I,-I})
check('一8 单位圆实际极点',roots(2*z*z+z-1,z)=={Rational(1,2),-1})
eq('一9 冲激尺度与筛选',integrate((v*v+2*v)*DiracDelta(1-v),(v,-oo,oo)),3)
eq('一10 延时对称中心',exp(-((3+t)-3)**2),exp(-((3-t)-3)**2))

eq('二1 理想低通冲激响应定义逆积分',integrate(exp(I*v*t)/3,(v,-3,3))/(2*pi),sin(3*t)/(3*pi*t))
eq('二1 输入通带稳态响应',3*Rational(1,3)+cos(2*t)/3,1+cos(2*t)/3)
def given_wave(value):
    if -2<value<0:return value+1
    if 0<value<1:return Integer(1)
    if 1<value<2:return Integer(-1)
    return Integer(0)
def wanted_wave(value):
    if -1<value<0:return Integer(-1)
    if 0<value<1:return Integer(1)
    if 1<value<3:return 2-value
    return Integer(0)
probe=[Rational(j,4) for j in range(-16,21) if j%4]
check('二2 从已知复合波形直接映射',all(given_wave(1-value)==wanted_wave(value) for value in probe))
check('二2 各分界点坐标',[1-vv for vv in [-2,0,1,2]]==[3,1,0,-1])
left_regularized=integrate(2*exp(eps*(v-2))*exp(-I*w*v),(v,-oo,2),conds='none')
eq('二3 左边阶跃频谱的非零频率极限',limit(left_regularized,eps,0,dir='+'),-2*exp(-2*I*w)/(I*w))
triangle=integrate(amp*(1+v/2)*exp(-I*w*v),(v,-2,0))+integrate(amp*(1-v/2)*exp(-I*w*v),(v,0,2))
eq('二3 未给峰高的三角频谱',triangle,2*amp*sin(w)**2/w**2)
eq('二3 三角面积',limit(triangle,w,0),2*amp)
Hd=-1/(1+1/z)-2/(1+1/(2*z))
eq('二4 冲激变换分式合成',Hd,(-3-Rational(5,2)/z)/(1+Rational(3,2)/z+Rational(1,2)/z**2))
recurrence('二4 差分方程冲激回代',lambda k:(Integer(-1)**(k-1)+(-Rational(1,2))**(k-1))*u(k),[1,Rational(3,2),Rational(1,2)],lambda k:-3*Integer(k==0)-Rational(5,2)*Integer(k==1))
A=Matrix([[-a,0],[0,-b]]);B=Matrix([1,1]);C=Matrix([[1,1],[1,1]])
M=C*(z*eye(2)-A).inv()*B
eq('二5 第一输出结构回算',M[0],1/(z+a)+1/(z+b))
eq('二5 第二输出结构回算',M[1],M[0])
check('二5 一拍更新负反馈',A*Matrix([2,3])+B*5==Matrix([5-2*a,5-3*b]))

den=(1-Rational(1,2)/z)*(1-Rational(1,4)/z)
H=(2+3/z)/den
eq('三1(1) 系统函数分式',H,16/(1-Rational(1,2)/z)-14/(1-Rational(1,4)/z))
def impulse(k):return (16*Rational(1,2)**k-14*Rational(1,4)**k)*u(k)
coeff=[1,-Rational(3,4),Rational(1,8)]
recurrence('三1(1) 冲激递推',impulse,coeff,lambda k:2*Integer(k==0)+3*Integer(k==1))
eq('三1(2) 真实初态生成象函数',(Rational(3,4)*2-Rational(1,8)*(2/z-1))/den,Rational(9,4)/(1-Rational(1,2)/z)-Rational(5,8)/(1-Rational(1,4)/z))
def zi(k):return (Rational(9,4)*Rational(1,2)**k-Rational(5,8)*Rational(1,4)**k)*u(k)
def zi_initial(k):return {-1:Integer(2),-2:Integer(-1)}.get(k,zi(k))
recurrence('三1(2) 零输入含初态递推',zi_initial,coeff,lambda k:Integer(0),lo=0)
eq('三1(3) 阶跃零状态分式',H/(1-1/z),-16/(1-Rational(1,2)/z)+Rational(14,3)/(1-Rational(1,4)/z)+Rational(40,3)/(1-1/z))
def zs(k):return (-16*Rational(1,2)**k+Rational(14,3)*Rational(1,4)**k+Rational(40,3))*u(k)
recurrence('三1(3) 零状态阶跃递推',zs,coeff,lambda k:2*u(k)+3*u(k-1))
def full(k):
    return {-1:Integer(2),-2:Integer(-1)}.get(k,zi(k)+zs(k))
recurrence('三1(4) 全响应含初态递推',full,coeff,lambda k:2*u(k)+3*u(k-1),lo=0)
eq('三1(4) 初始完整输出',full(0),Rational(29,8))
eq('三1(4) 暂态与稳态相加',zi(n)+zs(n),-Rational(55,4)*Rational(1,2)**n+Rational(97,24)*Rational(1,4)**n+Rational(40,3))
eq('三1(4) 稳态独立终值',H.subs(z,1),Rational(40,3))
check('三1(5) 因果稳定极点',roots(z*z-Rational(3,4)*z+Rational(1,8),z)=={Rational(1,2),Rational(1,4)})

eq('三2 B 采样角频率',2*pi/Rational(1,50),100*pi)
def fa(value):return Rational(1,10)*max(1-abs(value),0)
def fc(value):return 50*sum(fa(value-5*k) for k in range(-4,5))
def fd(value):return fc(value) if 5<abs(value)<6 else Integer(0)
def fe(value):return (fd(value+5)+fd(value-5))/2
def ff(value):return fe(value) if abs(value)<1 else Integer(0)
freq=[Rational(j,8) for j in range(-96,97) if j%8]
check('三2 C 谱副本峰高及比例',all(fc(value)==50*fa(value) for value in freq if abs(value)<1) and fc(0)==5 and fc(5)==5)
check('三2 D 两侧半谱窗',all(fd(value)==50*(fa(value-5) if value>0 else fa(value+5)) for value in freq if 5<abs(value)<6) and all(fd(value)==0 for value in freq if not 5<abs(value)<6))
def expected_e(value):
    if abs(value)<1:return 25*fa(value)
    if 10<value<11:return Rational(5,2)*(11-value)
    if -11<value<-10:return Rational(5,2)*(11+value)
    return Integer(0)
check('三2 E 半带移频及全部频段',all(fe(value)==expected_e(value) for value in freq))
check('三2 F 基带滤波恢复',all(ff(value)==25*fa(value) for value in freq))
triangle_a=integrate(Rational(1,10)*(1+v/(20*pi))*exp(I*v*t),(v,-20*pi,0))+integrate(Rational(1,10)*(1-v/(20*pi))*exp(I*v*t),(v,0,20*pi))
eq('三2 输入三角谱定义逆积分',triangle_a/(2*pi),(sin(10*pi*t)/(10*pi*t))**2)
eq('三2 输出峰值时间检查',limit(25*triangle_a/(2*pi),t,0),25)
finish()

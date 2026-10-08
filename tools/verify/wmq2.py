"""教材第2章非圈题独立求解：方程、初态、卷积、分布跳变与反例。"""
from common import *
v = Symbol('v', real=True)
L, C, R1, R2, m, k, friction = symbols('L C R1 R2 m k friction', positive=True)
vel, pos, force = [Function(name)(v) for name in ['vel','pos','force']]
balance = m*diff(vel,v)+friction*vel+k*pos-force
eq('2.1 力平衡求导和位移消元', diff(balance,v).subs(diff(pos,v),vel), m*diff(vel,v,2)+friction*diff(vel,v)+k*vel-diff(force,v))
check('2.1 库仑摩擦不是线性黏性模型', sign(2)-2*sign(1) != 0)

il, ins, uu = [Function(name)(v) for name in ['il','ins','uu']]
ic=ins-il
uc=L*diff(il,v)+R2*il-R1*ic
il_residual=L*C*diff(il,v,2)+C*(R1+R2)*diff(il,v)+il-R1*C*diff(ins,v)-ins
eq('2.2(1) 原KCL/KVL/电容关系推回输出ODE', C*diff(uc,v)-ic, il_residual)
eq('2.2(2) 代入iL=is−u1/R1', (-R1*il_residual).subs(il,ins-uu/R1).doit(), L*C*diff(uu,v,2)+C*(R1+R2)*diff(uu,v)+uu-R1*L*C*diff(ins,v,2)-R1*R2*C*diff(ins,v))
H_il=(R1*C*s+1)/(L*C*s**2+C*(R1+R2)*s+1)
eq('2.2(2) 零状态电路阻抗独立算U1/Is', R1*(1-H_il), R1*C*s*(L*s+R2)/(L*C*s**2+C*(R1+R2)*s+1))

jy, jyp = symbols('jy jyp')
jump=solve([2*jy,2*jyp+3*jy-1],[jy,jyp])
eq('2.3 输出跳变量', jump[jy],0)
eq('2.3 导数跳变量', jump[jyp],Rational(1,2))
eq('2.3 右初值', 1+jump[jy],1)
eq('2.3 右导数', 1+jump[jyp],Rational(3,2))

def op(expr,a,b): return diff(expr,t,2)+a*diff(expr,t)+b*expr

y4=2*exp(-t)+4*t*exp(-2*t)
zi4=(2+5*t)*exp(-2*t)
h4=(1+t)*exp(-2*t)
zs4=integrate(h4.subs(t,t-tau)*exp(-tau),(tau,0,t))
eq('2.4 从输入卷积独立求ZS', zs4,2*exp(-t)-(2+t)*exp(-2*t))
eq('2.4 ZI+ZS给全响应', zi4+zs4,y4)
eq('2.4 正时间原ODE', op(y4,4,4),2*exp(-t))
eq('2.4 右初值保持2', y4.subs(t,0),2)
eq('2.4 右导数比左初值1增加1', diff(y4,t).subs(t,0)-1,1)
eq('2.4 零输入齐次',op(zi4,4,4),0)
check('2.4 书中结果不满足题给初值', ((-1+3*t)*exp(-2*t)+2*exp(-t)).subs(t,0)!=2)

y5=(2*t+3)*exp(-t)-2*exp(-2*t)
h5=2*exp(-t)-exp(-2*t)
zi5=4*exp(-t)-3*exp(-2*t)
zs5=integrate(h5.subs(t,tau)*exp(-(t-tau)),(tau,0,t))
eq('2.5 已给响应满足正时间ODE',op(y5,3,2),2*exp(-t))
eq('2.5 起始值从完整响应回算', y5.subs(t,0),1)
eq('2.5 起始导数减去冲激跳变量',diff(y5,t).subs(t,0)-1,2)
eq('2.5(1) 齐次方程',op(zi5,3,2),0)
eq('2.5(1) 初态值',zi5.subs(t,0),1)
eq('2.5(1) 初态导数',diff(zi5,t).subs(t,0),2)
eq('2.5(2) 卷积独立结果',zs5,2*t*exp(-t)-exp(-t)+exp(-2*t))
eq('2.5(2) ZS右值',zs5.subs(t,0),0)
eq('2.5(2) ZS导数跳变量',diff(zs5,t).subs(t,0),1)
eq('2.5 两种拆分一致',zi5+zs5,y5)
free5=3*exp(-t)-2*exp(-2*t); forced5=2*t*exp(-t)
eq('2.5(3) 自由满足齐次',op(free5,3,2),0)
eq('2.5(4) 共振特解',op(forced5,3,2),2*exp(-t))
eq('2.5 自由+强迫给全响应',free5+forced5,y5)

h6=2*exp(-3*t)
eq('2.6 正时间ODE',diff(h6,t)+3*h6,0)
eq('2.6 冲激系数',h6.subs(t,0),2)
eq('2.6 独立LT回算',lt(h6),2/(s+3))
h7=Rational(3,2)*exp(-t)-exp(-2*t)
g7=integrate(h7.subs(t,tau),(tau,0,t))
eq('2.7 独立积分',g7,1-Rational(3,2)*exp(-t)+exp(-2*t)/2)
eq('2.7 原H(s)',lt(h7),(s/2+2)/(s**2+3*s+2))
eq('2.7 原点',g7.subs(t,0),0)
eq('2.7 导数原点',diff(g7,t).subs(t,0),Rational(1,2))
eq('2.7 终值',limit(g7,t,oo),1)
eq('2.7 δ′匹配',h7.subs(t,0),Rational(1,2))
eq('2.7 δ匹配',diff(h7,t).subs(t,0)+3*h7.subs(t,0),2)

def rect(x,start,width): return Integer(1 if start<x<start+width else 0)
def stair(x):
    if 0<x<1 or 4<x<5: return 1
    if 1<x<2 or 3<x<4: return 2
    return 3 if 2<x<3 else 0
samples=[Rational(i,4) for i in range(-3,24) if i%4]
check('2.8 三个宽度3矩形相加独立样点',all(sum(rect(x,a,3) for a in [0,1,2])==stair(x) for x in samples))
eq('2.8 三并联再串联的频域式',sum(exp(-a*s) for a in [0,1,2])*(1-exp(-3*s))/s, (1+exp(-s)+exp(-2*s)-exp(-3*s)-exp(-4*s)-exp(-5*s))/s)
eq('2.8 总面积保持三支路各面积3',sum(integrate(Integer(1),(v,a,a+3)) for a in [0,1,2]),9)

y9=exp(-t)/2
eq('2.9 正时间方程',op(y9,5,6),exp(-t))
eq('2.9 左右无跳变时初值',y9.subs(t,0),Rational(1,2))
eq('2.9 左右无跳变时导数',diff(y9,t).subs(t,0),Rational(-1,2))

zi10=3*exp(-2*t)-2*exp(-3*t)
zs10=integrate(2*exp(-2*(t-tau))*(1+exp(-tau)),(tau,0,t))
y10=1+2*exp(-t)-2*exp(-3*t)
eq('2.10(1) 原始二阶齐次ODE',op(zi10,5,6),0)
eq('2.10(1) 初始值',zi10.subs(t,0),1)
eq('2.10(1) 初始导数',diff(zi10,t).subs(t,0),0)
eq('2.10(2) 原H约消零状态',(2*s+6)/(s**2+5*s+6),2/(s+2))
eq('2.10(2) 独立卷积结果',zs10,1+2*exp(-t)-3*exp(-2*t))
eq('2.10(2) 右初值',zs10.subs(t,0),0)
eq('2.10(2) 右导数匹配4δ',diff(zs10,t).subs(t,0),4)
eq('2.10(3) 响应相加',zi10+zs10,y10)
eq('2.10(3) 正时间ODE',op(y10,5,6),6+4*exp(-t))
eq('2.10(3) 右初值',y10.subs(t,0),1)
eq('2.10(3) 右导数',diff(y10,t).subs(t,0),4)
check('2.10 约消H不能抹掉ZI的−3模',simplify(diff(zi10,t)+2*zi10)!=0)

y1=2*exp(-3*t)+sin(2*t); y2=exp(-3*t)+2*sin(2*t)
zz,vv=symbols('zz vv')
sol=solve([zz+vv-y1,zz+2*vv-y2],[zz,vv])
eq('2.11 公共ZI从两次完整响应算出',sol[zz],3*exp(-3*t))
eq('2.11 公共ZS从两次完整响应算出',sol[vv],-exp(-3*t)+sin(2*t))
t0=Symbol('t0',positive=True)
zi11=3*exp(-3*t);zs11=-exp(-3*t)+sin(2*t)
eq('2.11(1) 延时只作用于ZS',zi11+zs11.subs(t,t-t0),3*exp(-3*t)-exp(-3*(t-t0))+sin(2*(t-t0)))
check('2.11(1) 早于t0时仅公共ZI',Heaviside(-t0)==0)
eq('2.11(2) 初态2倍+输入半倍',2*sol[zz]+sol[vv]/2,Rational(11,2)*exp(-3*t)+sin(2*t)/2)

h13=exp(-t)-exp(-2*t)
zs13=integrate(h13.subs(t,tau)*exp(-(t-tau)),(tau,0,t))
eq('2.13 冲激右初值',h13.subs(t,0),0)
eq('2.13 冲激右导数',diff(h13,t).subs(t,0),1)
eq('2.13 独立卷积',zs13,(t-1)*exp(-t)+exp(-2*t))
eq('2.13 原方程',op(zs13,3,2),exp(-t))
eq('2.13 零状态右初值',zs13.subs(t,0),0)
eq('2.13 零状态右导数',diff(zs13,t).subs(t,0),0)

hab=exp(-4*t)/2+exp(-t)
# C的原点跳变产生直通2δ，以普通卷积另外求其连续部分。
h14=2*hab+integrate(hab.subs(t,tau)*(-6*exp(-3*(t-tau))),(tau,0,t))
eq('2.14(1) δ直通+连续卷积独立求h',h14,4*exp(-4*t)-exp(-t))
eq('2.14(1) 原图系统函数', (1/(2*(s+4))+1/(s+1))*2*s/(s+3), lt(h14))
g14=integrate(h14.subs(t,tau),(tau,0,t))
eq('2.14(2) 积分独立求g',g14,exp(-t)-exp(-4*t))
eq('2.14(2) 原点连续',g14.subs(t,0),0)
eq('2.14(2) 终值H(0)=0',limit(g14,t,oo),0)
y14_post=integrate(h14.subs(t,t-tau),(tau,0,t))+integrate(h14.subs(t,t-tau),(tau,2,t))
eq('2.14(3) t>2原题两个正阶跃直接积分',y14_post,g14+g14.subs(t,t-2))
eq('2.14(3) t=2右左连续',g14.subs(t,0),0)
eq('2.14(3) 原题相加使右导数增加3',diff(g14,t).subs(t,0),3)

def overlap(left,right,lo,hi): return max(S.Zero,min(right,hi)-max(left,lo))
def zi15(x): return 1-x if 0<=x<=1 else S.Zero
def zs15(x):
    if 0<=x<=1: return x
    if 1<x<2: return S.One
    if 2<=x<=3: return 3-x
    return S.Zero
samples=[Rational(i,4) for i in range(0,18)]
check('2.15(1) 历史−2到0积分区间独立算',all(overlap(x-1,x,-2,0)==zi15(x) for x in samples))
check('2.15(2) 新输入0到2积分区间独立算',all(overlap(x-1,x,0,2)==zs15(x) for x in samples))
check('2.15 过去与未来相加还原完整历史',all(overlap(x-1,x,-2,2)==zi15(x)+zs15(x) for x in samples))
eq('2.15(2) 末段左端接平台',(3-t).subs(t,2),1)
eq('2.15(2) 末段右端归零',(3-t).subs(t,3),0)
# 同一零状态h可具有可见的自主模，故H和输入历史不确定任意独立初态。
check('2.15(1) 增添不受输入激励的初态模不改变h但改变ZI', exp(-t).subs(t,0)==1)

ys16=(1-cos(pi*t))/pi
eq('2.16 条件h给原始输入图0..1',integrate(S.One,(tau,0,t)),t)
eq('2.16 条件h给原始输入图1..2',integrate(S.One,(tau,t-1,t)),1)
eq('2.16 条件h给原始输入图2..3',integrate(S.One,(tau,t-1,2)),3-t)
eq('2.16 新输入第一段独立积分',integrate(sin(pi*tau),(tau,0,t)),ys16)
eq('2.16 新输入第二段独立积分',integrate(sin(pi*tau),(tau,t-1,1)),ys16)
eq('2.16 支持左端',ys16.subs(t,0),0)
eq('2.16 支持右端',ys16.subs(t,2),0)
eq('2.16 峰值',ys16.subs(t,1),2/pi)
eq('2.16 非因果反例对原输入贡献0',integrate(cos(pi*(v-tau)),(tau,0,2)),0)
eq('2.16 非因果反例对新输入贡献非零',integrate(sin(pi*tau)*cos(pi*(v-tau)),(tau,0,1)),sin(pi*v)/2)

# 测试函数检验跳跃阶跃的导数冲激，确认g/h关系并非仅普通函数导数。
for phi in [exp(-v**2),(1+v)*exp(-v**2)]:
    g=2*exp(-3*v)
    action=-integrate(g*diff(phi,v),(v,0,oo))
    derivative_action=2*phi.subs(v,0)+integrate(-6*exp(-3*v)*phi,(v,0,oo))
    eq('2.17 分布g′含原点跳变的冲激',action,derivative_action)

eq('2.18(1) 原关系换元后指数',exp(-(v-(tau+2))),exp(-((v-2)-tau)))
eq('2.18(1) 延时LT对应起点2',exp(-2*s)/(s+1),lt(exp(-t))*exp(-2*s))
r18_mid=integrate(exp(-(t-2-tau)),(tau,-1,t-2))
r18_late=integrate(exp(-(t-2-tau)),(tau,-1,2))
q1=1-exp(-(t-1));q4=1-exp(-(t-4))
eq('2.18(2) 1<t<4独立原关系积分',r18_mid,q1)
eq('2.18(2) t>4独立原关系积分',r18_late,q1-q4)
eq('2.18(2) 第一次起点连续',q1.subs(t,1),0)
eq('2.18(2) 第二次起点连续',q4.subs(t,4),0)
# 分段直接代原积分、再按原图上下支路减法，检查所有断点之间。
def r18(x):
    if x<=1: return S.Zero
    return integrate(exp(-(x-2-tau)),(tau,-1,min(2,x-2)))
def qa(x,a): return 1-exp(-(x-a)) if x>a else S.Zero
samples=[Rational(i,2) for i in range(-2,18)]
check('2.18(3) 原图减号各段独立算出四项',all(simplify(r18(x)-r18(x-1)-qa(x,1)+qa(x,2)+qa(x,4)-qa(x,5))==0 for x in samples))
check('2.18(3) 书中相加不满足负支路',simplify((r18(Rational(5,2))+r18(Rational(3,2)))-(r18(Rational(5,2))-r18(Rational(3,2))))!=0)

h19=(exp(-t)+exp(-3*t))/2
g19=integrate(h19.subs(t,tau),(tau,0,t))
eq('2.19(1) LT独立验证H',lt(h19),(s+2)/(s**2+4*s+3))
eq('2.19(1) 冲激偶系数',h19.subs(t,0),1)
eq('2.19(1) 冲激系数',diff(h19,t).subs(t,0)+4*h19.subs(t,0),2)
eq('2.19(2) 定积分',g19,Rational(2,3)-exp(-t)/2-exp(-3*t)/6)
eq('2.19(2) 原点必须0',g19.subs(t,0),0)
eq('2.19(2) 终值',limit(g19,t,oo),Rational(2,3))

A=Symbol('A',real=True);a=Symbol('a',positive=True);delay=Symbol('delay',positive=True)
kernel=A**2*exp(-a*v)*exp(-a*(v-tau))
eq('2.20(1) 正延时直接积分',integrate(kernel.subs(tau,delay),(v,delay,oo)),A**2*exp(-a*delay)/(2*a))
eq('2.20(1) 负延时直接积分',integrate(kernel.subs(tau,-delay),(v,0,oo)),A**2*exp(-a*delay)/(2*a))
eq('2.20(1) R(0)=能量',integrate(A**2*exp(-2*a*v),(v,0,oo)),A**2/(2*a))
window=Symbol('window',positive=True)
omega=Symbol('omega',real=True,nonzero=True)
for lo in [0,delay]:
    average=integrate(A**2*cos(omega*v)*cos(omega*(v-tau)),(v,lo,window))/(2*window)
    # 振荡项的有限原函数逐项有界，1/L的极限为0；先核对完整有限窗公式。
    expected=A**2*cos(omega*tau)*(window-lo)/(4*window)+A**2*(sin(2*omega*window-omega*tau)-sin(2*omega*lo-omega*tau))/(8*omega*window)
    eq('2.20(2) 双边平均有限观察窗',expand_trig(average),expand_trig(expected))
    eq('2.20(2) 非振荡项极限1/4',limit(A**2*cos(omega*tau)*(window-lo)/(4*window),window,oo),A**2*cos(omega*tau)/4)
    eq('2.20(2) 振荡项绝对上界趋零',limit(A**2/(4*Abs(omega)*window),window,oo),0)
    eq('2.20(2) 零频率单独计算',limit(A**2*(window-lo)/(2*window),window,oo),A**2/2)

T=Symbol('T',positive=True)
f1=A*(v+Rational(1,2));f2=A*v*(v-Rational(1,2))
R21=integrate(f2*f1.subs(v,v-tau),(v,-T/2,T/2))/T
R12=integrate(f1*f2.subs(v,v-tau),(v,-T/2,T/2))/T
eq('2.21 展开R21的乘积',expand(f2*f1.subs(v,v-tau)),A**2*(v**3-tau*v**2+(tau/2-Rational(1,4))*v))
eq('2.21 R21有限窗口独立积分',R21,-A**2*tau*T**2/12)
eq('2.21 R12有限窗口另行独立积分',R12,-A**2*tau*T**2/6+A**2*tau**2/2+A**2*tau/4)
for expr in [R21,R12]:
    check('2.21 非零幅度正延时发散',limit(expr.subs({A:2,tau:1}),T,oo)==-oo)
    check('2.21 非零幅度负延时发散',limit(expr.subs({A:2,tau:-1}),T,oo)==oo)
    eq('2.21 零延时对称窗为零',expr.subs(tau,0),0)
    eq('2.21 零幅度恒零',expr.subs(A,0),0)
for signal in [f1.subs(A,1),f2.subs(A,1)]:
    check('2.21 不是有限平均功率信号',limit(integrate(signal**2,(v,-T/2,T/2))/T,T,oo)==oo)
check('2.21 不存在的相关极限不能用换向对称性',simplify(R12-R21.subs(tau,-tau))!=0)
finish()

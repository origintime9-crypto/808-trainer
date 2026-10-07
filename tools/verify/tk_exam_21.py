"""课程21：独立定义、Abel分布、累计阶跃的斜坡、二阶输入导数及复合通路。"""
from common import *
v=Symbol('v',real=True)
a=Symbol('a',positive=True)
eps=Symbol('eps',positive=True)
q=Symbol('q')
# 重复题也按本卷原条件复算，不读取已有解答模块。
g=1-exp(-2*t)
eq('一1 阶跃导数无冲激的起点',limit(g,t,0),0)
eq('一1 定义阶跃积分',integrate(2*exp(-2*tau),(tau,0,t)),g)
eq('一2 原有限斜坡窗零频面积',integrate(3*v,(v,0,1)),Rational(3,2))
f=1+2*cos(v-pi/4)+Rational(1,2)*cos(3*v+pi/3)+Rational(1,4)*cos(5*v-5*pi/12)
coeff={0:Integer(1),1:exp(-I*pi/4),3:exp(I*pi/3)/4,5:exp(-I*5*pi/12)/8}
for k in [1,3,5]: coeff[-k]=conjugate(coeff[k])
for k in [0,1,2,3,5]:
    # 将原积分逐项化为整数频率指数，再按定义积分，避开混合指数的慢速通用积分。
    terms=Add.make_args(expand(f.rewrite(exp)*exp(-I*k*v)))
    calculated=0
    for term in terms:
        rate=simplify(diff(term,v)/term)
        calculated+=term.subs(v,0)*integrate(exp(rate*v),(v,0,2*pi))/(2*pi)
    eq('一3 原信号定义FS积分n='+str(k),calculated,coeff.get(k,0))
eq('一3 完整复指数系数回原三角式',
   expand_trig(expand_complex(sum(c*exp(I*k*v) for k,c in coeff.items()))),expand_trig(f))
for k,amp in [(1,2),(3,Rational(1,2)),(5,Rational(1,4))]:
    eq('一3 单边振幅保留两倍系数n='+str(k),2*Abs(coeff[k]),amp)
eq('一3 DC只保留一次',coeff[0],1)
eq('一4 Sa100原矩形谱由定义反演',expand_complex(integrate(exp(I*w*t),(w,-100,100))/200),sin(100*t)/(100*t))
eq('一4 抽样角频率换Hz',Integer(200)/(2*pi),100/pi)
eq('一4 临界抽样间隔',1/(100/pi),pi/100)
for k in range(-3,4):
    x=lambda m:Integer(m*m+2*m-3)
    eq('一5 逐样值脉冲展开k='+str(k),sum(x(m)*int(k==m) for m in range(-4,5)),x(k))
window=(1-cos(2*t))*Heaviside(t)/4-(1-cos(2*(t-2)))*Heaviside(t-2)/4
eq('一6 两延时部分定义LT',lt(window),(1-exp(-2*s))/(s*(s*s+4)))
eq('一6 延时前普通初值',limit((1-cos(2*t))/4,t,0),0)
tail=(cos(2*(v-2))-cos(2*v))/4
eq('一6 正时间2秒以后原函数',tail,sin(2)*sin(2*v-2)/2)
for phase,expected in [(pi/4,sin(2)/2),(3*pi/4,-sin(2)/2)]:
    eq('一6 无穷样本子列不相同相位'+str(phase),tail.subs(v,n*pi+1+phase),expected)
check('一6 两个不同子列极限反证终值',sin(2)!=0)
for kernel,name in [
    (lambda k:Integer(-2)**k*u(k),'因果'),
    (lambda k:-Integer(-2)**k*u(-k-1),'稳定反因果')]:
    recurrence('一7 '+name+'逆核回单位样值',kernel,[1,2],lambda k:int(k==0))
eq('一7 反因果逆核绝对和',summation(Rational(1,2)**n,(n,1,oo)),1)
check('一7 因果逆核不趋于0',abs(Integer(-2)**20)>1)
eq('一8 稀疏延时逐样值定义ZT',sum((int(k==1)+6*int(k==3)-2*int(k==5))*z**(-k) for k in range(7)),z**-1+6*z**-3-2*z**-5)
eq('一10 稳定左边核可含圆外极点的绝对和',summation(Rational(1,2)**n,(n,1,oo)),1)

# 二1原阶跃窗导数和移动上下限不改为常数上下限。
eq('二1 阶跃窗的分布导数',diff(Heaviside(v)-Heaviside(v-2),v),DiracDelta(v)-DiracDelta(v-2))
for sample,expected in [(0,0),(Rational(3,2),1),(4,1),(6,0),(8,0)]:
    eq('二1 原移动积分限t='+str(sample),integrate(DiracDelta(v),(v,sample-5,sample-1)),expected)
hwin=1-exp(-2*s)
xwin=(exp(-s)-exp(-5*s))/s
output_window=Heaviside(t-1)-Heaviside(t-3)-Heaviside(t-5)+Heaviside(t-7)
eq('二1 独立输出窗回定义LT',lt(output_window),hwin*xwin)
for sample,expected in [(0,0),(Rational(3,2),1),(Rational(7,2),0),(Rational(11,2),-1),(Rational(15,2),0)]:
    eq('二1 波形平台t='+str(sample),output_window.subs(t,sample),expected)

# 二2第一信号L1；第二需给Abel分布极限，不能将零频奇点当普通函数。
base=1/(1+v*v)
eq('二2 一阶微分回原4t分子',-2*diff(base,v),4*v/(1+v*v)**2)
nu=Symbol('nu',positive=True)
inverse=(integrate(-I*2*pi*nu*exp(-nu)*exp(I*nu*t),(nu,0,oo))
        +integrate(I*2*pi*nu*exp(-nu)*exp(-I*nu*t),(nu,0,oo)))/(2*pi)
eq('二2 频域定义反演独立回原奇信号',inverse,4*t/(1+t*t)**2)
eq('二2 原奇信号绝对积分有限',2*integrate(4*v/(1+v*v)**2,(v,0,oo)),4)
abel=2*(a*a-w*w)/(a*a+w*w)**2
# a>0保证绝对收敛；不采用通用积分器对arg(w)产生的冗余条件。
eq('二2 |t|指数阻尼FT由定义积分',integrate(t*exp(-a*t)*(exp(-I*w*t)+exp(I*w*t)),(t,0,oo),conds='none'),abel)
eq('二2 Abel极限在非零频率取普通表达式',limit(abel,a,0,dir='+'),-2/w**2)
eq('二2 Abel零频值不能取有限极限',abel.subs(w,0),2/a**2)
for scale in [1,4]:
    phi=exp(-scale*v*v)
    action=2*integrate(v*diff(phi,v,2),(v,0,oo))
    eq('二2 D²|t|以高斯试验函数检查'+str(scale),action,2*phi.subs(v,0))
    # 正负两侧截止定义的有限部，减去2φ(0)/eps。
    tail_integral=2*(exp(-scale*eps**2)/eps-sqrt(pi*scale)*erfc(sqrt(scale)*eps))
    eq('二2 有限部截止积分的导数'+str(scale),diff(tail_integral,eps),-2*exp(-scale*eps**2)/eps**2)
    fp_action=limit(tail_integral-2/eps,eps,0,dir='+')
    eq('二2 固定有限部对高斯的作用'+str(scale),fp_action,-2*sqrt(pi*scale))
    # Abel核=2d/dω[ω/(a²+ω²)]，分部积分后正则积分可取a→0。
    paired=integrate(4*scale*v*v*exp(-scale*v*v)/(a*a+v*v),(v,-oo,oo))
    eq('二2 Abel分布与负2有限部同一作用'+str(scale),limit(paired,a,0,dir='+'),-2*fp_action)

# 二3累计的是阶跃响应：任意有限因果核的定义双重和回离散斜坡。
symbols_h=symbols('h0:5',real=True)
for k in range(9):
    stepk=lambda j:sum(symbols_h[m] for m in range(5) if m<=j) if j>=0 else Integer(0)
    cumulative=sum(stepk(j) for j in range(k+1))
    convolution=sum(symbols_h[m]*(k-m+1) for m in range(5) if m<=k)
    eq('二3 任意五项因果核原双重和k='+str(k),cumulative,convolution)
eq('二3 斜坡输入的定义ZT',1/(1-q)+q/(1-q)**2,1/(1-q)**2)
def ramp(k): return Integer(k+1)*u(k)
check('二3 若误用阶跃，h=δ反例立即失败',sum(1 for j in range(4))!=u(3))
check('二3 不限定因果输入，差分器可加常数且输出不变',
      all(ramp(k)-ramp(k-1)==(ramp(k)+1)-(ramp(k-1)+1) for k in range(-5,8)))

# 二4与课程20综合a/b/c同题，保留一般阶跃条件。
aa=Symbol('aa',real=True)
Hgeneral=aa+2-1/(1-Rational(1,2)/z)
eq('二4 原π输入零输出确定a',solve(Eq(Hgeneral.subs(z,-1),0),aa)[0],-Rational(4,3))
Hd=Hgeneral.subs(aa,-Rational(4,3))
eq('二4 系统函数与唯一有限极点',Hd,-(z+1)/(3*(z-Rational(1,2))))
def hk(k): return Rational(2,3)*int(k==0)-Rational(1,2)**k*u(k)
recurrence('二4 原样值核回差分方程',hk,[1,-Rational(1,2)],lambda k:-Rational(1,3)*(int(k==0)+int(k==1)))
eq('二4 右边核绝对和有限',Rational(1,3)+summation(Rational(1,2)**n,(n,1,oo)),Rational(4,3))

# 二5输入的二阶导数使输出本身和普通导数都跳变。
den=(s+2)*(s+5)
H=(2*s*s+1)/den
ordinary_h=3*exp(-2*t)-17*exp(-5*t)
zi=Rational(17,3)*exp(-2*t)-Rational(5,3)*exp(-5*t)
zs=Rational(3,4)*exp(-t)-3*exp(-2*t)+Rational(17,4)*exp(-5*t)
full=zi+zs
eq('二5 原H长除法给2δ直通',2+lt(ordinary_h),H)
eq('二5 实际因果极点',len(roots(den,s)),2)
eq('二5 ZI定义LT与左初态项',lt(zi),(4*s+25)/den)
eq('二5 ZI初值',limit(zi,t,0),4)
eq('二5 ZI导数初值',limit(diff(zi,t),t,0),-3)
eq('二5 ZI原齐次方程',diff(zi,t,2)+7*diff(zi,t)+10*zi,0)
conv_integrand=powsimp(expand((3*exp(-2*(t-tau))-17*exp(-5*(t-tau)))*exp(-tau)))
eq('二5 ZS包含直接项的定义卷积',2*exp(-t)+integrate(conv_integrand,(tau,0,t)),zs)
eq('二5 ZS象函数定义LT',lt(zs),H/(s+1))
eq('二5 全响应右初值',limit(full,t,0),6)
eq('二5 全响应普通右导数',limit(diff(full,t),t,0),-19)
eq('二5 ZS本身发生跳变2',limit(zs,t,0),2)
eq('二5 ZS普通右导数跳变负16',limit(diff(zs,t),t,0),-16)
eq('二5 δprime匹配左右跳值',limit(full,t,0)-4,2)
eq('二5 δ匹配导数跳与7倍跳值',limit(diff(full,t),t,0)+3+7*(limit(full,t,0)-4),-2)
eq('二5 t大于0的原方程',diff(full,t,2)+7*diff(full,t)+10*full,3*exp(-t))

# 三1旁路为正、H2支路为负；先整体化简再检验普通频响存在。
gate_inverse=integrate(exp(I*w*t),(w,-2,2))/(4*pi)
eq('三1 原sin2t/(2πt)对应半增益矩形',expand_complex(gate_inverse),sin(2*t)/(2*pi*t))
gv=sin(2*v)/(2*pi*v)
eq('三1 积分器消微分前驱核负无穷极限',limit(gv,v,-oo),0)
kernel=gv-gv.subs(v,v-pi)
eq('三1 两相减sinc回时域整核',kernel,-sin(2*v)/(2*v*(v-pi)))
eq('三1 原点可去值',limit(kernel,v,0),1/pi)
eq('三1 π点可去值',limit(kernel,v,pi),-1/pi)
eq('三1 原图前驱与积分后核的导数',diff(kernel,v),diff(gv,v)-diff(gv.subs(v,v-pi),v))
K=(1-exp(-I*pi*w))/2
eq('三1 复合频响相位分解',K,I*exp(-I*pi*w/2)*sin(pi*w/2))
for freq,expected in [(0,0),(1,1),(-1,1),(2,0)]:
    eq('三1 通带关键频率ω='+str(freq),K.subs(w,freq),expected)
check('三1 输入sin4t在|ω|小于2通带之外',Abs(Integer(4))>2)
eq('三1 负外尾积分上界有限',integrate(1/v**2,(v,2*pi,oo)),1/(2*pi))
eq('三1 消去h3的原点δ支路',limit(I*w*K,w,0),0)
eq('三1 稳态输出cos t定义功率',integrate(cos(v)**2,(v,0,2*pi))/(2*pi),Rational(1,2))
eq('三1 两个通带边缘都有零，避免额外边线',K.subs(w,-2),0)

# 三2与课程01相同，独立对负时刻初态及两种输入逐点递推。
def zi_dis(k): return 4*Integer(-1)**k-4*Integer(-2)**k
def zs_dis(k): return (Rational(1,6)-Rational(1,2)*Integer(-1)**k+Rational(4,3)*Integer(-2)**k)*u(k)
def full_dis(k): return zi_dis(k)+zs_dis(k)
eq('三2 原负一初态',zi_dis(-1),-2)
eq('三2 原负二初态',zi_dis(-2),3)
recurrence('三2 原初态ZI递推',zi_dis,[1,3,2],lambda k:0,lo=0)
recurrence('三2 阶跃ZS递推',zs_dis,[1,3,2],lambda k:u(k),lo=0)
recurrence('三2 完全响应原递推',full_dis,[1,3,2],lambda k:u(k),lo=0)
def h_dis(k): return (-Integer(-1)**k+2*Integer(-2)**k)*u(k)
recurrence('三2 单位样值核原差分式',h_dis,[1,3,2],lambda k:int(k==0))
def rect_zs(k): return zs_dis(k)-zs_dis(k-5)
recurrence('三2 改矩形输入逐点ZS',rect_zs,[1,3,2],lambda k:u(k)-u(k-5),lo=0)
recurrence('三2 改矩形输入仍保留同一ZI',lambda k:zi_dis(k)+rect_zs(k),[1,3,2],lambda k:u(k)-u(k-5),lo=0)
eq('三2 零初态系统函数原q式',1/((1+q)*(1+2*q)),1/(1+3*q+2*q*q))
check('三2 极点负1在单位圆，因果实现不稳定',roots((z+1)*(z+2),z)=={-1,-2})
finish()

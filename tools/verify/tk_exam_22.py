"""课程22：原上下限、实际ROC与有理延拓、移频三角谱及希尔伯特主值。"""
from common import *
v=Symbol('v',real=True)
a=Symbol('a',positive=True)
wp=Symbol('wp',positive=True)
q=Symbol('q')
# 一：定义与原点、频率单位、半无限谱的分布口径。
wave=sin(2*pi*v/3)+cos(pi*v)
eq('一1 共周期6逐项还原',expand_trig(wave.subs(v,v+6)),expand_trig(wave))
eq('一1 共周期是两周期整数倍',6/Integer(3),2)
eq('一1 另一周期整数倍',6/Integer(2),3)
# 固定抽样格点与任意时间移位不交换；用平滑常输入的冲激位置作反例。
check('一2 非整数采样周期移位改变格点',Rational(1,2) not in set(range(-3,4)))
alpha,beta=symbols('alpha beta',real=True)
x1,x2=symbols('x1 x2',real=True)
gate=Symbol('gate')
eq('一2 固定梳状乘法的叠加',(alpha*x1+beta*x2)*gate,alpha*x1*gate+beta*x2*gate)
weight=1-2*v*v+sin(pi*v/3)
eq('一3 原1−2t冲激的尺度模及筛选',weight.subs(v,Rational(1,2))/2,Rational(1,2))
eq('一3 定义冲激积分独立筛选',integrate(weight*DiracDelta(1-2*v),(v,-oo,oo)),Rational(1,2))
eq('一4 支撑负2不在原求和范围',sum((3*k+1)*int(k==-2) for k in range(50)),0)
dirichlet=integrate(exp(-a*t)*sin(t)/t,(t,0,oo))
eq('一5 两侧Abel定义积分',dirichlet,pi/2-atan(a))
eq('一5 带原1/π系数的反常积分',limit(2*dirichlet/pi,a,0,dir='+'),1)
eq('一6 全时间指数与冲激导数',-diff(exp(-2*(v-tau)),tau).subs(tau,0),-2*exp(-2*v))
eq('一6 非因果全指数普通导数',diff(exp(-2*v),v),-2*exp(-2*v))
band=Symbol('band',positive=True)
eq('一7 f与f2t的卷积支撑边缘之和',band+2*band,3*band)
eq('一7 1000Hz原数值奈奎斯特上界',2*(1000+2000),6000)
theta=Symbol('theta',real=True)
# 先在无量纲相位上核对积化和差；1000倍相位的多项式展开无助于验证。
eq('一7 原带边余弦乘压缩余弦的三倍频项',
   expand_trig(cos(theta)*cos(2*theta)),
   expand_trig((cos(theta)+cos(3*theta))/2))
eq('一7 三倍相位对应原3000Hz',3*(2*pi*1000*v),2*pi*3000*v)
half_inverse=integrate(exp((-a+I*v)*wp),(wp,0,oo),conds='none')/pi
eq('一8 正半轴2u频谱阻尼反演',half_inverse,1/(pi*(a-I*v)))
eq('一8 阻尼谱实部是单位冲激近似',re(half_inverse),a/(pi*(a*a+v*v)))
eq('一8 实核单位质量',integrate(a/(pi*(a*a+v*v)),(v,-oo,oo)),1)
eq('一8 非零时间虚核极限',limit(im(half_inverse),a,0,dir='+'),1/(pi*v))
original=s/(s+1)
eq('一9 从原单边LT分离冲激',original,1-1/(s+1))
eq('一9 时压缩指数频移的完整代入',original.subs(s,(s+2)/3),(s+2)/(s+5))
eq('一9 时域δ缩放后系数为1',3*Rational(1,3),1)
eq('一9 普通部分定义LT回新信号',1+lt(-3*exp(-5*t)),(s+2)/(s+5))
finite=(z**4-1)/(z**5*(z-1))
eq('一10 原分子差幂约消',finite,sum(z**(-k) for k in [2,3,4,5]))
eq('一10 可去点z1不是实际极点',limit(finite,z,1),4)
eq('一10 实际延时极点最高阶',limit(z**5*finite,z,0),1)
for k in range(-2,8):
    eq('一10 原Laurent反演k='+str(k),sum(int(k==j) for j in [2,3,4,5]),int(2<=k<=5))

# 二1：原三角图没有峰高，以参数A保持原条件。
A=Symbol('A',real=True)
eq('二1 周期2的原冲激列FS系数',integrate(DiracDelta(v)*exp(-I*pi*3*v),(v,-1,1))/2,Rational(1,2))
eq('二1 梳状谱线强度不是FS系数',2*pi*Rational(1,2),pi)
check('二1 首非零谱线π在截止3之外',pi>3)
eq('二1 唯一通过的直流线反演',pi*A/(2*pi),A/2)
triangle_h=3*A/(2*pi)*(sin(3*t/2)/(3*t/2))**2
triangle_inverse=integrate(A*(1-wp/3)*cos(wp*t),(wp,0,3))/pi
eq('二1 原三角频响定义逆变换',triangle_inverse,triangle_h)
eq('二1 未知峰高保留总核面积',limit(A*(1-wp/3),wp,0),A)

# 二2：τ−2换元后积分下限t−3，系统依赖未来输入。
original_kernel=exp(-2*(v-(tau+2)))
eq('二2 原积分平移的指数增益e4',original_kernel,exp(4)*exp(-2*(v-tau)))
eq('二2 换元后的输入时刻下限',v-1-2,v-3)
eq('二2 卷积核截至σ3',v-(v-3),3)
for delay in [-2,0,2,4]:
    lhs=integrate(exp(-2*(v-tau))*DiracDelta(tau-2-delay),(tau,v-1,oo))
    rhs=exp(4-2*(v-delay))*Heaviside(3-(v-delay))
    # 逐个非边缘输出时刻避免连续冲激落在端点的半值约定。
    for time in [-1,1,5,8]:
        if time-delay==3: continue
        eq('二2 原移动积分对δ输入d/t='+str((delay,time)),lhs.subs(v,time),rhs.subs(v,time))
eq('二2 左边增长核的LT收敛条件积分',
   integrate(exp(4-2*v)*exp(-(-3)*v),(v,-oo,3)),exp(7))
eq('二2 在ROC内s负3回闭式',(-exp(-3*(-3)-2)/((-3)+2)),exp(7))
check('二2 负时间核值非零证明非因果',exp(4-2*(-1))>0)

# 二3：从阶跃微分得到核，再独立卷积和响应的分布微分。
step=1-exp(-t)-t*exp(-t)
h=t*exp(-t)
known=2-3*exp(-t)+exp(-3*t)
required=2+4*exp(-3*t)
eq('二3 阶跃导数回原h',diff(step,t),h)
eq('二3 阶跃起点没有额外δ',limit(step,t,0),0)
eq('二3 核定义LT',lt(h),1/(s+1)**2)
eq('二3 原目标响应定义LT',lt(known),6/(s*(s+1)*(s+3)))
eq('二3 解得输入定义LT回原目标',lt(required)*lt(h),lt(known))
conv=powsimp(expand((t-tau)*exp(-(t-tau))*(2+4*exp(-3*tau))))
eq('二3 直接定义因果卷积',integrate(conv,(tau,0,t)),known)
eq('二3 完整逆算子的普通部分',diff(known,t,2)+2*diff(known,t)+known,required)
eq('二3 目标起点无δprime项',limit(known,t,0),0)
eq('二3 目标起点无δ项',limit(diff(known,t),t,0),0)
eq('二3 目标二阶起值回输入6',limit(diff(known,t,2),t,0),6)

# 二4：原零点0/−1、极点1/−3、高频有理值2；全部ROC逐点回差分式。
Hz=2*z*(z+1)/((z-1)*(z+3))
eq('二4 部分分式和原图函数',z/(z-1)+z/(z+3),Hz)
eq('二4 有理延拓的原H∞值',limit(Hz,z,oo),2)
check('二4 原图两个零点没有约消',roots(2*z*(z+1),z)=={0,-1})
check('二4 实际极点1和负3',roots((z-1)*(z+3),z)=={1,-3})
eq('二4 因果q展开三项',series(Hz.subs(z,1/q),q,0,3).removeO(),2-2*q+10*q*q)
for name,kernel in [
    ('因果',lambda k:(1+Integer(-3)**k)*u(k)),
    ('混合',lambda k:u(k)-Integer(-3)**k*u(-k-1)),
    ('左边',lambda k:-(1+Integer(-3)**k)*u(-k-1)),
]:
    recurrence('二4 '+name+'核回原H的差分式',kernel,[1,2,-3],lambda k:2*int(k==0)+2*int(k==1))
eq('二4 混合核负下标尾的绝对指数和',summation(Rational(1,3)**n,(n,1,oo)),Rational(1,2))
check('二4 因果核不衰减',abs(1+Integer(-3)**20)>1)

# 二5：原4sin4移频谱和一正一负两三角密度，独立正反积分。
shifted=integrate(2*exp(I*(2*pi-w)*v),(v,-4,4))
eq('二5a 时间窗原定义FT',expand_complex(shifted),4*sin(4*(w-2*pi))/(w-2*pi))
eq('二5a 谱可去奇点的极限',limit(4*sin(4*(w-2*pi))/(w-2*pi),w,2*pi),16)
eq('二5a 用调制中心原积分另查峰高',integrate(2,(v,-4,4)),16)
tri_base=2*integrate((1-wp)*cos(wp*t),(wp,0,1))
eq('二5b 原单三角逆核未乘归一化',tri_base,2*(1-cos(t))/t**2)
inverse=tri_base*(exp(2*I*t)-exp(-2*I*t))/(2*pi)
target=I*sin(2*t)/pi*(sin(t/2)/(t/2))**2
eq('二5b 原正负三角的全部逆变换',expand_complex(inverse),target)
eq('二5b 原时域原点零',limit(target,t,0),0)
eq('二5b 两三角正负面积相消',integrate(wp-1,(wp,1,2))+integrate(3-wp,(wp,2,3)),1)
check('二5b 原时间信号纯虚',re(target)==0)

# 三1：从原图逐延时递推，不能把第一延时旁路当输入直通。
Hq=q*(1+q*q)/(1-q*q)
def kernel(k): return Integer(0 if k<1 or k%2==0 else 1 if k==1 else 2)
def step_out(k): return sum(kernel(m) for m in range(k+1)) if k>=0 else Integer(0)
W,X,Y=symbols('W X Y')
solved=solve([W-X-q*q*W,Y-q*W-q**3*W],[W,Y])
eq('三1 原三个延时的前馈与两拍反馈节点消元',solved[Y]/X,Hq)
recurrence('三1 单位样值原闭环递推',kernel,[1,0,-1],lambda k:int(k==1)+int(k==3))
eq('三1 第一输出样值在k1而非k0',kernel(0),0)
eq('三1 第三输出样值含反馈和旁路',kernel(3),2)
recurrence('三1 阶跃输入的原闭环递推',step_out,[1,0,-1],lambda k:u(k-1)+u(k-3))
for k in range(8):
    eq('三1 阶跃直接卷积样值k='+str(k),step_out(k),0 if k==0 else 2*((k+1)//2)-1)
summed=Rational(1,2)+2*summation(Rational(1,2)**(2*n+3),(n,0,oo))
eq('三1 全时间2k输入的绝对收敛增益',summed,Rational(5,6))
eq('三1 z2原H直接求值',Hq.subs(q,Rational(1,2)),Rational(5,6))
recurrence('三1 全时间指数含负下标逐点回原递推',lambda k:Rational(5,6)*Integer(2)**k,
           [1,0,-1],lambda k:Integer(2)**(k-1)+Integer(2)**(k-3))

# 三2：主值核的Abel正则化与L2能量；没有普通1/t奇点积分。
xi=Symbol('xi',positive=True)
cos_integral=integrate(exp(-a*t)*cos(wp*t),(t,0,oo),conds='none')
eq('三2 对频率求导后的绝对收敛积分',cos_integral,a/(a*a+wp*wp))
sine_over_t=integrate(a/(a*a+xi*xi),(xi,0,wp))
eq('三2 sin核除t的原点起始积分',sine_over_t,atan(wp/a))
eq('三2 正频率主值核变换',limit(-2*I*sine_over_t/pi,a,0,dir='+'),-I)
eq('三2 负频率由实奇核共轭',conjugate(-I),I)
eq('三2 正频率模平方保留能量',Abs(-I)**2,1)
eq('三2 负频率模平方保留能量',Abs(I)**2,1)
eq('三2 独立L2例原e负绝对值能量',2*integrate(exp(-2*t),(t,0,oo)),1)
eq('三2 同例双边频谱Parseval能量',integrate(4/(1+v*v)**2,(v,-oo,oo))/(2*pi),1)
eq('三2 同例输出谱乘主值增益的能量',2*integrate(Abs(-I*2/(1+wp*wp))**2,(wp,0,oo))/(2*pi),1)
finish()

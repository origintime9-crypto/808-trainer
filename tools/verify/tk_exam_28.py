"""课程28：从89–90页原题独立积分、有限累加与原始无限和递推，不读取网页答案。"""
from common import *
q = Symbol('q')
v = Symbol('v', real=True)
b = Symbol('b', real=True)
A, T, width = symbols('A T width', positive=True)

# 填空：题面与旧题确实相同，仍从原式检查。
eq('一1 原积分含负冲激尺度', integrate((v-3)*DiracDelta(-2*v+4), (v,-5,5)), -Rational(1,2))
F = sqrt(pi)*exp(-w**2/4)*exp(-I*w)
eq('一2 实信号频谱共轭关系', F.subs(w,-w), conjugate(F))
eq('一2 偶部分取频谱实部', (F+F.subs(w,-w))/2, sqrt(pi)*exp(-w**2/4)*cos(w))
eq('一3 因果核拉氏定义', lt(exp(-t)), 1/(s+1))
eq('一3 频响模平方', (1/(1+I*w))*conjugate(1/(1+I*w)), 1/(1+w**2))
eq('一4 原周期平均', integrate(Integer(10),(v,-1,1))/5, 4)
for k in range(-3,7):
    eq('一5 累计阶跃 n='+str(k), sum(u(j) for j in range(-5,k+1)), (k+1)*u(k))
eq('一6 δ只取x的原点', (1+2*v+4*v**2).subs(v,0), 1)
check('一6 δ(t)自变量没有缩放', abs(diff(v,v)) == 1)
Q = integrate(pi*exp(-(w-v)**2/4-v**2/4), (v,-oo,oo), conds='none')
eq('一7 高斯谱卷积验证平方变换', Q/(2*pi), sqrt(pi/2)*exp(-w**2/8))
ft2 = sqrt(pi/2)*exp(-w**2/8)
eq('一7 调制后两谱与总系数', (ft2.subs(w,w-b)-ft2.subs(w,w+b))/(2*I),
   (Q.subs(w,w-b)-Q.subs(w,w+b))/(4*pi*I))
eq('一8 100kHz的临界频率', 2*Integer(100000), 200000)
eq('一8 临界间隔秒', 1/(2*Integer(100000)), Rational(1,200000))
eq('一8 临界正弦会全零', sin(2*pi*100000*n/200000), 0)
eq('一9 累积积分的指数例', integrate(exp(-v),(v,0,t)), 1-exp(-t))
eq('一9 阶跃卷积同一例', integrate(exp(-tau),(tau,0,t)), 1-exp(-t))
g = lambda x: exp(-x)*Heaviside(x)+Heaviside(-1-x)
formal = lambda x: exp(-(x-1))*Heaviside(x-1)-exp(-(x-2))*Heaviside(x-2)+Heaviside(-x)-Heaviside(1-x)
for value in [-2,-Rational(1,2),Rational(1,2),Rational(3,2),Rational(5,2)]:
    eq('一10 按原响应移位 '+str(value), g(value-1)-g(value-2), formal(value))
eq('一10 原给g远负端仍为1', g(-2), 1)

# 二1按原要求做时域，另外用LT交叉检查，不以LT代替题解。
rise = integrate(exp(-2*(t-tau)), (tau,0,t))
decay = integrate(exp(-2*(t-tau)), (tau,0,2))
eq('二1 开通期间时域卷积', rise, (1-exp(-2*t))/2)
eq('二1 关断后时域卷积', decay, (1-exp(-4))*exp(-2*(t-2))/2)
eq('二1 开通阶段回微分方程', diff(rise,t)+2*rise, 1)
eq('二1 关断阶段回微分方程', diff(decay,t)+2*decay, 0)
eq('二1 原点右值', rise.subs(t,0), 0)
eq('二1 关断两段连续', rise.subs(t,2), decay.subs(t,2))
eq('二1 峰值', rise.subs(t,2), (1-exp(-4))/2)
eq('二1 总输出面积', integrate(rise,(t,0,2))+integrate(decay,(t,2,oo)), 1)
eq('二1 冲激面积', integrate(exp(-2*t),(t,0,oo)), Rational(1,2))
eq('二1 独立分段LT', integrate(rise*exp(-s*t),(t,0,2))+integrate(decay*exp(-s*t),(t,2,oo)),
   (1-exp(-2*s))/(s*(s+2)))

# 二2由每个样值的有限交错和及8样本块建立Z，不猜无限级数的边界。
def sequence(k):
    return sum((-1)**j*u(k-4*j) for j in range(max(0,k//4+1)))
for k in range(-4,24):
    eq('二2 原有限交错和 n='+str(k), sequence(k), int(k>=0 and (k//4)%2==0))
check('二2 全时间不是8周期', sequence(-8) != sequence(0))
X = 1/((1-q)*(1+q**4))
eq('二2 分块几何形式', (1+q+q**2+q**3)/(1-q**8), X)
eq('二2 前24项长除法', series(X,q,0,24).removeO(), sum(sequence(k)*q**k for k in range(24)))
eq('二2 转z多项式', X.subs(q,1/z), z**5/((z-1)*(z**4+1)))
num, den = fraction(cancel(X.subs(q,1/z)))
check('二2 原点五重零', Poly(num,z).terms() == [((5,),1)])
check('二2 无实际相消', degree(gcd(num,den),z) == 0)
check('二2 实际极点总数五', degree(den,z) == 5)
for m in range(4):
    pole = exp(I*(2*m+1)*pi/4)
    eq('二2 单位圆根 m='+str(m), simplify(pole**4), -1)
    eq('二2 根模 m='+str(m), abs(pole), 1)
eq('二2 z=1为实际极点', den.subs(z,1), 0)
check('二2 无穷多个非零项排除单位圆绝对收敛', all(sequence(8*k)==1 for k in range(12)))

# 二3定义积分、卷积构造与连续极限交叉检查，级数系数不混同冲激强度。
ftriangle = 2*A/T*integrate((1-v/width)*cos(w*v),(v,0,width))
expected = A*width/T*(sin(w*width/2)/(w*width/2))**2
eq('二3 定义积分得系数包络', ftriangle, expected)
eq('二3 零阶由原三角面积', 2/T*integrate(A*(1-v/width),(v,0,width)), A*width/T)
eq('二3 包络的原点极限', limit(expected,w,0), A*width/T)
eq('二3 卷积矩形给同一三角谱', (A/width)*(2*sin(w*width/2)/w)**2/T, expected)
eq('二3 复系数实偶', expected.subs(w,-w), expected)
eq('二3 直流FT冲激强度', 2*pi*limit(expected,w,0), 2*pi*A*width/T)
eq('二3 谱线间隔仅由周期决定', 2*pi/T, (2*pi*(n+1)/T-2*pi*n/T))

# 二4有理式只在频响存在条件下使用；保留另一ROC的区别。
H4 = (s+3)/(s+4)**2
eq('二4 j4实际复值', H4.subs(s,4*I), (4-3*I)/32)
eq('二4 幅值平方', H4.subs(s,4*I)*conjugate(H4.subs(s,4*I)), Rational(25,1024))
eq('二4 10度转弧度', 10*pi/180, pi/18)
eq('二4 因果h的独立LT', lt((1-t)*exp(-4*t)), H4)
eq('二4 相角的复数表示', (4-3*I)/5, exp(-I*atan(Rational(3,4))).expand(complex=True))
eq('二4 右半ROC分界真实极点', (s+4).subs(s,-4), 0)

# 二5FT定义找有限长核，再时域积到阶跃；不是将H误当阶跃变换。
H5 = integrate(exp(-v)*exp(-I*w*v),(v,0,1))
eq('二5 频响定义积分', H5, (1-exp(-(1+I*w)))/(1+I*w))
eq('二5 核面积也是终值', integrate(exp(-v),(v,0,1)), 1-exp(-1))
step = integrate(exp(-v),(v,0,t))
eq('二5 尚未封顶的阶跃', step, 1-exp(-t))
eq('二5 延迟表达在1后常值', (1-exp(-t))-exp(-1)*(1-exp(-(t-1))), 1-exp(-1))
eq('二5 t=1连续', step.subs(t,1), 1-exp(-1))
eq('二5 0..1求导回核', diff(step,t), exp(-t))

# 综合一：原无限和递推、H部分分式、DTFT模及基本单元实际级联。
D = 1+q/4-q**2/8
B = 1-q-Rational(3,4)*q/(1-q/2)
H = cancel(B/D)
eq('三1 原左差分因子', D, (1-q/4)*(1+q/2))
eq('三1 原无限和的输入端', B, (1-2*q)*(1-q/4)/(1-q/2))
eq('三1 抵消后的H', H, (1-2*q)/(1-q**2/4))
eq('三1 转z有理式', H.subs(q,1/z), z*(z-2)/(z**2-Rational(1,4)))
check('三1 实际零点', roots(z*(z-2),z) == {Integer(0),Integer(2)})
check('三1 实际极点', roots(z**2-Rational(1,4),z) == {Rational(1,2),-Rational(1,2)})
check('三1 被抵消的1/4不是H极点', (1-q**2/4).subs(q,4) != 0)
eq('三1 因果核部分分式', -Rational(3,2)/(1-q/2)+Rational(5,2)/(1+q/2), H)
kernel = lambda k: (-Rational(3,2)*Rational(1,2)**k+Rational(5,2)*(-Rational(1,2))**k)*u(k)
eq('三1 偶下标绝对和', summation(Rational(1,4)**n,(n,0,oo)), Rational(4,3))
eq('三1 奇下标绝对和', summation(2*Rational(1,4)**n,(n,0,oo)), Rational(8,3))
eq('三1 总绝对和有限', Rational(4,3)+Rational(8,3), 4)
eq('三1 有符号DC增益', H.subs(q,1), -Rational(4,3))
eq('三1 π增益', H.subs(q,-1), 4)
Hw = H.subs(q,exp(-I*w))
mag2 = simplify(expand_complex(Hw*conjugate(Hw)))
eq('三1 DTFT模平方', mag2, 16/(5+4*cos(w)))
eq('三1 幅频2π周期', 16/(5+4*cos(w+2*pi)), 16/(5+4*cos(w)))
eq('三1 正主频段幅度导数', diff(4/sqrt(5+4*cos(w)),w), 8*sin(w)/(5+4*cos(w))**Rational(3,2))
AP = (1-2*exp(-I*w))/(1-exp(-I*w)/2)
eq('三1 仅第一级为常数幅度全通', simplify(expand_complex(AP*conjugate(AP))), 4)
eq('三1 级联基本单元的传递乘积', 1/(1-q/2)*(1-2*q)*1/(1+q/2), H)
def original_response(source, count=18):
    y = {-1:Integer(0),-2:Integer(0)}
    for k in range(count):
        rhs=source(k)-source(k-1)-Rational(3,4)*sum(Rational(1,2)**j*source(k-j-1) for j in range(k))
        y[k]=simplify(rhs-y[k-1]/4+y[k-2]/8)
    return y
def cascade_response(source, count=18):
    last_v=last_y=Integer(0)
    out={}
    for k in range(count):
        now_v=source(k)+last_v/2
        now_w=now_v-2*last_v
        now_y=now_w-last_y/2
        out[k]=now_y
        last_v,last_y=now_v,now_y
    return out
sources=[
 ('冲激',lambda k:Integer(k==0)),
 ('阶跃',lambda k:u(k)),
 ('交替',lambda k:(-1)**k*u(k)),
 ('有限混合',lambda k:Integer([2,-1,0,3,1,-2][k]) if 0<=k<6 else Integer(0)),
]
for name,source in sources:
    raw=original_response(source)
    cascade=cascade_response(source)
    check('三1 '+name+'按原无限和18点与卷积一致',
          all(simplify(raw[k]-sum(kernel(k-j)*source(j) for j in range(k+1)))==0 for k in range(18)))
    check('三1 '+name+'基本单元级联18点与原式一致', all(raw[k]==cascade[k] for k in range(18)))

# 综合二的负时刻初态和输入延时，从原递推核验，不读旧题解析。
full={-1:Integer(1),-2:Integer(1)}
zi={-1:Integer(1),-2:Integer(1)}
zs={-1:Integer(0),-2:Integer(0)}
for k in range(14):
    forcing=Integer(2)**(k-1) if k>=1 else Integer(0)
    full[k]=5*full[k-1]-6*full[k-2]+forcing
    zi[k]=5*zi[k-1]-6*zi[k-2]
    zs[k]=5*zs[k-1]-6*zs[k-2]+forcing
    eq('三2 完全响应原递推 k='+str(k), full[k], (5-k)*Integer(2)**k-6*Integer(3)**k)
    eq('三2 两响应分解 k='+str(k), zi[k]+zs[k], full[k])
check('三2 零输入14点与独立闭式一致', all(zi[k] == 8*Integer(2)**k-9*Integer(3)**k for k in range(14)))
check('三2 零状态14点与重根输入闭式一致', all(zs[k] == 3*Integer(3)**k-(k+3)*Integer(2)**k for k in range(14)))
eq('三2 零输入闭式首项', zi[0], 8-9)
eq('三2 零状态闭式首项', zs[0], 3-3)
eq('三2 H与单位样值首两项', q/((1-2*q)*(1-3*q)), 1/(1-3*q)-1/(1-2*q))
for k in range(8):
    eq('三2 h原差分回代 k='+str(k), (3**k-2**k)-5*(3**(k-1)-2**(k-1))*u(k-1)
       +6*(3**(k-2)-2**(k-2))*u(k-2), Integer(k==1))
finish()

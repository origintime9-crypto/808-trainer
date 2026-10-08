"""第5章习题：独立积分、谱支撑、几何级数、周期叠加与卷积复核。"""
from common import *

T, a, A = symbols('T a A', positive=True)
omega = Symbol('omega', real=True, nonzero=True)  # 可去的0点另用极限复核。
c, v = symbols('c v', real=True)
m = Symbol('m', integer=True)

# 5.1 抽样梳的一周期系数、复制谱系数和恢复核；临界谱线有独立反例。
eq('5.1 一周期冲激的级数系数', integrate(DiracDelta(v), (v, -T/2, T/2))/T, 1/T)
eq('5.1 频域卷积2π系数抵消', (2*pi/T)/(2*pi), 1/T)
kernel = integrate(T*exp(I*omega*t), (omega, -pi/T, pi/T))/(2*pi)
eq('5.1 理想恢复核定义积分', kernel, T*sin(pi*t/T)/(pi*t))
eq('5.1 原点的恢复核连续值', limit(kernel, t, 0), 1)
for index in [-4, -2, -1, 1, 2, 4]:
    eq(f'5.1 基数内插非零格点{index}', kernel.subs(t, index*T), 0)
eq('5.1 端点正弦在临界所有整数格点消失', sin(pi*m), 0)
check('5.1 端点正弦本身不为零', sin(pi/2) == 1)

# 5.3 两个不同矩形谱的卷积，用区间相交长度算平台与两侧坡。
def overlap(lo1, hi1, lo2, hi2):
    return Max(0, Min(hi1, hi2)-Max(lo1, lo2))

def raw_product_spectrum(value):
    return overlap(-1000*pi, 1000*pi, value-2000*pi, value+2000*pi)/(4000000*pi)

for value, expected in [(0, Rational(1,2000)), (500*pi, Rational(1,2000)),
                        (1000*pi, Rational(1,2000)), (2000*pi, Rational(1,4000)),
                        (3000*pi, 0), (4000*pi, 0), (-2000*pi, Rational(1,4000))]:
    eq(f'5.3 原两矩形卷积ω={value}', raw_product_spectrum(value), expected)
eq('5.3 最大间隔按合成支撑求', pi/(1000*pi+2000*pi), Rational(1,3000))
eq('5.3 临界复制间距', 2*pi/Rational(1,3000), 6000*pi)
eq('5.3 复制后平台是1.5', raw_product_spectrum(0)*3000, Rational(3,2))
eq('5.3 两端均为0可临界相接', raw_product_spectrum(3000*pi)+raw_product_spectrum(-3000*pi), 0)

# 5.4 原指数的普通FT，再由实际样值的绝对收敛几何级数求抽样谱。
eq('5.4 原指数由定义积分得到FT', integrate(exp(-v)*exp(-I*omega*v), (v,0,oo), conds='none'), 1/(1+I*omega))
eq('5.4 指数的绝对可积包络', integrate(exp(-v), (v,0,oo)), 1)
check('5.4 任意实ω的原谱分母模平方严格正', (1+omega**2).is_positive)
qg = Symbol('qg', positive=True)
conditional_series = summation(qg**m, (m,1,oo))
check('5.4 几何级数使用qg<1的收敛分支', conditional_series.args[0][1] == (qg < 1))
check('5.4 真实比率的指数严格负，因而0<qg<1', (-T*(1+s)).is_negative)
series = conditional_series.args[0][0].subs(qg,exp(-T*(1+s)))
eq('5.4 正时间实际样值的几何级数', series, 1/(exp((1+s)*T)-1))
q = exp(-T)
zeta = exp(-I*omega*T)
sampled = c+q*zeta/(1-q*zeta)
eq('5.4 抽样谱严格按2π/T重复', sampled.subs(omega, omega+2*pi/T), sampled)
half = sampled.subs(c,S.Half)
right = sampled.subs(c,1)
eq('5.4 两种原点规范相差半个冲激谱', right-half, S.Half)
eq('5.4 半值原点的实际直流峰', half.subs(omega,0), (1+q)/(2*(1-q)))
eq('5.4 右值原点的实际直流峰', right.subs(omega,0), 1/(1-q))
eq('5.4 半值原点的π谷', half.subs(omega,pi/T), (1-q)/(2*(1+q)))
eq('5.4 右值原点的π谷', right.subs(omega,pi/T), 1/(1+q))
mod2half = half*conjugate(half)
eq('5.4 半值原点的精确幅度平方', trigsimp(expand_complex(mod2half)), (1+q*q+2*q*cos(omega*T))/(4*(1+q*q-2*q*cos(omega*T))))
check('5.4 T=1时资料1/T不是精确峰值', abs(float(half.subs({T:1,omega:0}))-1) > 0.08)

# 5.5 原三角脉冲直接积分，频域20Hz抽样给时间50ms周期叠加。
width = Rational(1,20)
triangle_ft = integrate(A*(1+v/width)*exp(-I*omega*v), (v,-width,0))+integrate(A*(1-v/width)*exp(-I*omega*v), (v,0,width))
eq('5.5 三角脉冲的定义积分', triangle_ft, A*(1-cos(omega*width))*2/(width*omega**2))
eq('5.5 三角谱原点面积', limit(triangle_ft, omega,0), A*width)
eq('5.5 Hz正确换算角频率间距', 2*pi*20, 40*pi)
eq('5.5 时间周期应为50ms', 2*pi/(40*pi), width)
for index in [-5,-2,-1,1,2,5]:
    eq(f'5.5 除直流外第{index}条频域样值为0', triangle_ft.subs(omega,index*40*pi), 0)
eq('5.5 无权角频率梳只剩直流', A*width/(2*pi), A/(40*pi))
eq('5.5 0<t<50ms两个相邻三角相加为常数', A*(1-v/width)+A*v/width, A)
eq('5.5 Hz梳归一化下直流', A*width, A/20)
check('5.5 原书0.3秒不是20Hz给定周期', abs(float(2*pi/20)-0.05) > 0.25)

# 5.6 条件版：两侧普通谱带[-2a,-a]∪[a,2a]；临界平移不重叠。
intervals = [(-2*a+2*a*j,-a+2*a*j) for j in range(-2,3)]+[(a+2*a*j,2*a+2*a*j) for j in range(-2,3)]
for i,left in enumerate(intervals):
    for j,right_band in enumerate(intervals[:i]):
        eq(f'5.6 临界复制带{i}/{j}内部交长', overlap(*left,*right_band), 0)
eq('5.6 双侧谱占用长度给最小复制周期下界', a+a, 2*a)
eq('5.6 单正频带的反例只需a间距', overlap(a,2*a,a+a,2*a+a), 0)
eq('5.6 若仅一側谱最低值不能由两侧结论推出', (2*a-a), a)

# 5.7 用原框图的延迟差分积分，整个核有限长，无普通FT收敛困难。
H = integrate(exp(-s*v), (v,0,T))
eq('5.7(1) 有限核定义LT', H, (1-exp(-s*T))/s)
eq('5.7(1) 整函数的可去原点', limit(H,s,0), T)
eq('5.7(1) 有限核的绝对面积', integrate(1,(v,0,T)), T)
Hw = integrate(exp(-I*omega*v), (v,0,T))
eq('5.7(2) 有限核定义FT', Hw, (1-exp(-I*omega*T))/(I*omega))
eq('5.7(2) 对称幅度与延迟因子的合成', T*sin(omega*T/2)/(omega*T/2)*exp(-I*omega*T/2), (1-exp(-I*omega*T))/(I*omega))
eq('5.7(2) 直流极限T', limit((1-exp(-I*omega*T))/(I*omega),omega,0), T)
for index in [-3,-2,-1,1,2,3]:
    eq(f'5.7(2) 第{index}实际零点', Hw.subs(omega,index*2*pi/T), 0)
# 实际复响应验证主值相位，不只比较两种相位的书写形式。
for xvalue in [Rational(-11,4),Rational(-7,4),Rational(-3,4),Rational(1,4),Rational(5,4),Rational(9,4)]:
    response=(1-exp(-2*pi*I*xvalue))/(2*pi*I*xvalue)
    phase=-sign(xvalue)*pi*(Abs(xvalue)-floor(Abs(xvalue)))
    eq(f'5.7(2) x={xvalue}主值相位还原复响应', simplify(expand_complex(response/Abs(response))), exp(I*phase))
    check(f'5.7(2) x={xvalue}主值相位范围', -pi < phase <= pi)
check('5.7(2) 原书n=1的负瓣下限会与正瓣重叠', 2*(1+1) < 2*(2*1+1))
for value,expected in [(T/4,T/4),(T,T),(3*T/2,T/2),(5*T/2,0)]:
    eq(f'5.7(3) 原两矩形卷积t={value}', overlap(0,T,value-T,value), expected)
eq('5.7(3) 原卷积总面积T²', integrate(v,(v,0,T))+integrate(2*T-v,(v,T,2*T)), T*T)
eq('5.7(3) 原卷积LT回框图输入', integrate(v*exp(-s*v),(v,0,T))+integrate((2*T-v)*exp(-s*v),(v,T,2*T)), H*H)
# 输出的保持区间由实际冲激筛选核确定；格点单点约定不改变普通区间。
weights=[S(1),S(2)/3,S(4)/3]
for sample_index in range(3):
    for fraction in [Rational(1,4),Rational(3,4)]:
        value=(sample_index+fraction)*T
        computed=sum(weights[j] for j in range(3) if 0 < simplify(value-j*T) < T)
        eq(f'5.7(4) 第{sample_index}区间内{fraction}的真实筛选',computed,weights[sample_index])
eq('5.7(4) 保持核直流增益不是1', limit(H,s,0), T)
eq('5.7(4) 有限窗并非理想低通，首个零点', Hw.subs(omega,2*pi/T), 0)
finish()

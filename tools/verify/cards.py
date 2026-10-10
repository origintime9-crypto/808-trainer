"""知识卡适用条件的独立复核；从积分、有限和及递推推导，不读取网页答案。

并非对100张定义/定理卡的机器证明；逐卡课件考点索引另见 card_sources.json。
这里覆盖本次修正的公式、反例与边界，以及常用变换的代表性验证。
"""
from common import *

# 周期：直接用一整个公共周期中的样值判断最小周期，避免把LCM当成答案。
def basic_period(values):
    return next(k for k in range(1, len(values)+1)
                if all(simplify(values[(i+k) % len(values)]-values[i]) == 0 for i in range(len(values))))

eq('3π/7余弦既约周期14', basic_period([cos(3*pi*k/7) for k in range(14)]), 14)
eq('零频率离散常量周期1', basic_period([Integer(1)]*6), 1)
seq1 = [Integer(1),0,0,0,0,0]
seq2 = [Integer(0),0,0,1,0,0]
eq('两个周期6序列之和基本周期3', basic_period([a+b for a,b in zip(seq1,seq2)]), 3)
eq('两输入各自基本周期6', basic_period(seq1)+basic_period(seq2), 12)
eq('连续周期示例平移2不变', expand_trig(sin(2*pi*(t+2))+cos(3*pi*(t+2))), sin(2*pi*t)+cos(3*pi*t))

# 筛选与冲激偶：以光滑测试函数的分布作用直接推导。
r = Symbol('r', real=True)
f = r**3+2*r+1
phi = exp(-r**2)
eq('冲激偶乘积作用包含两项', -diff(f*phi,r).subs(r,0), -f.subs(r,0)*diff(phi,r).subs(r,0)-diff(f,r).subs(r,0)*phi.subs(r,0))
eq('负尺度冲激筛选含绝对值', integrate((r+1)*DiracDelta(3-2*r),(r,-oo,oo)), Rational(5,4))
eq('阶跃偶奇分解在原点半值约定', (Heaviside(r)+Heaviside(-r)).subs(r,0)/2, Rational(1,2))

# 响应分解：任意符号零输入、零状态分量，直接解二元方程。
yi, ys, k = symbols('yi ys k')
sol = solve([yi+ys-Symbol('y1'),yi+k*ys-Symbol('y2')],[yi,ys])
eq('不同激励倍数才能识别零状态', sol[ys], (Symbol('y2')-Symbol('y1'))/(k-1))
eq('同倍数k=1退化', Matrix([[1,1],[1,k]]).det().subs(k,1), 0)

# 因果卷积直接积分，另检查 a=0 与重指数的极限。
a,b = symbols('a b', positive=True)
eq('指数与阶跃卷积', integrate(exp(-a*tau),(tau,0,t)), (1-exp(-a*t))/a)
eq('a=0卷积回到t', limit((1-exp(-a*t))/a,a,0), t)
formula = (exp(-a*t)-exp(-b*t))/(b-a)
eq('两不同指数卷积', integrate(exp(-a*tau-b*(t-tau)),(tau,0,t),conds='none'), formula)
eq('指数重合极限', limit(formula,b,a), t*exp(-a*t))
signed = [Integer(1),-1]
conv = [sum(signed[j]*signed[i-j] for j in range(2) if 0<=i-j<2) for i in range(3)]
check('带符号有限卷积首末不抵消', conv == [1,-2,1])
signed2 = [Integer(1),1]
conv2 = [sum(signed[j]*signed2[i-j] for j in range(2) if 0<=i-j<2) for i in range(3)]
check('内部抵消不能缩短首末支撑跨度', conv2[1] == 0 and conv2[0] != 0 and conv2[-1] != 0)

# CTFT按本项目角频率约定从积分验证，Sa尺度要求正宽度。
wc = Symbol('wc', positive=True)
eq('宽4矩形FT', integrate(exp(-I*w*tau),(tau,-2,2)), 4*sin(2*w)/(2*w))
eq('矩形频谱反演得到低通核（非零时刻）', integrate(exp(I*w*tau),(tau,-wc,wc))/(2*pi), sin(wc*w)/(pi*w))
eq('Sa原点极限', limit(sin(wc*r)/(wc*r),r,0), 1)
# a>0 且频率为实数已经保证这些半轴指数积分收敛，避免SymPy未化简的arg分支。
eq('指数FT', integrate(exp(-a*tau-I*w*tau),(tau,0,oo),conds='none'), 1/(a+I*w))
eq('对偶指数的逆FT', integrate(exp(a*tau+I*r*tau),(tau,-oo,0),conds='none'), 1/(a+I*r))
eq('双边衰减指数FT', integrate(exp(a*tau-I*w*tau),(tau,-oo,0),conds='none')+integrate(exp(-a*tau-I*w*tau),(tau,0,oo),conds='none'), 2*a/(a*a+w*w))
eq('频域微分乘积法则', I*diff(I*w*Function('X')(w),w), -Function('X')(w)-w*diff(Function('X')(w),w))

# LT：冲激项先分离；时间延后所有项一起移位。
F = s**2/(s**2+2*s+2)
eq('长除分离直通项', F, 1-(2*s+2)/((s+1)**2+1))
eq('普通部分的独立LT', lt(-2*exp(-t)*cos(t)), -(2*s+2)/((s+1)**2+1))
eq('长除示例整体延时LT', exp(-s)*(1+lt(-2*exp(-t)*cos(t))), exp(-s)*F)
check('直通系统h初值不可直接取sH', limit(s*(s+1)/(s+3),s,oo) == oo)
eq('分离直通项后的普通初值', limit(s*((s+1)/(s+3)-1),s,oo), -2)
eq('因果左半平面指数绝对可积', integrate(exp(-3*tau),(tau,0,oo)), Rational(1,3))
eq('反因果右半平面极点仍可绝对可积', integrate(exp(tau),(tau,-oo,0)), 1)
eq('反因果例LT（Re s<1）', integrate(-exp(tau)*exp(-Rational(1,2)*tau),(tau,-oo,0)), (1/(s-1)).subs(s,Rational(1,2)))
check('积分器阶跃响应无终值', limit(t,t,oo) == oo)
eq('形式H(0)不代表不稳定阶跃终值', (1/(s-1)).subs(s,0), -1)
eq('微分器有界sin(t²)产生增长导数', diff(sin(t*t),t), 2*t*cos(t*t))
eq('微分器沿t=sqrt(2πm)的输出增长', diff(sin(t*t),t).subs(t,sqrt(2*pi*Symbol('m',integer=True,positive=True))), 2*sqrt(2*pi*Symbol('m',integer=True,positive=True)))

# 抽样临界值：边界正弦的样值全为零。
eq('Nyquist边界正弦被采为0', sin(2*pi*n/2), 0)
eq('10kHz低通临界间隔50µs', 1/(2*Integer(10000)), Rational(50,10**6))

# 二重特征根的两个线性独立解与二重共振，直接代回前向差分。
lam = Symbol('lam', positive=True)
def repeated_operator(expr):
    return simplify(expr.subs(n,n+2)-2*lam*expr.subs(n,n+1)+lam**2*expr)
eq('二重根常系数模态不能遗漏', repeated_operator(lam**n), 0)
eq('二重根n模态', repeated_operator(n*lam**n), 0)
eq('两模态初值行列式非零', Matrix([[1,0],[lam,lam]]).det(), lam)
eq('二重共振n²λⁿ特解', repeated_operator(n**2*lam**n/(2*lam**2)), lam**n)
eq('仅乘n不能解二重共振', repeated_operator(n*lam**n), 0)
zero_companion = Matrix([[0,1],[0,0]])
check('零重根初始状态第二维仍贡献第1步', zero_companion*Matrix([Symbol('A'),Symbol('B')]) == Matrix([Symbol('B'),0]))
check('零重根在第2步后消失', zero_companion**2 == zeros(2))

# ZT采用几何级数及有限Laurent和，单独检查0/∞端点。
q = Symbol('q', positive=True)
eq('ZT右边几何级数', summation(Rational(1,2)**n*q**(-n),(n,0,oo)).subs(q,2), (q/(q-Rational(1,2))).subs(q,2))
eq('ZT左边几何级数', summation(-2**(-n)*q**n,(n,1,oo)).subs(q,1), (q/(q-2)).subs(q,1))
eq('n加权指数ZT', -z*diff(z/(z-Rational(1,2)),z), Rational(1,2)*z/(z-Rational(1,2))**2)
eq('右边a=0约分为1', cancel(z/(z-0)), 1)
eq('a=0的n加权序列为零', cancel(0*z/(z-0)**2), 0)
eq('纯延时ZT无穷点有限', limit(z**(-2),z,oo), 0)
check('提前ZT无穷点不收敛', limit(z,z,oo) == oo)
eq('圆外H的提前项长除', z**2/(z-2), z+2+4/(z-2))
check('圆外但不因果的无穷点', limit(z**2/(z-2),z,oo) == oo)
eq('含公共ROC的卷积可能扩大ROC', (z-Rational(1,2))/z*z/(z-Rational(1,2)), 1)
check('无公共ROC的左右卷积项不趋于零', limit(2**n*Rational(1,2)**(-n),n,oo) == oo)
eq('单位阶跃终值', limit((1-1/z)*z/(z-1),z,1), 1)
eq('交替序列套终值给0但序列不收敛', limit((1-1/z)*z/(z+1),z,1), 0)
check('交替序列偶奇子序列极限不同', (-1)**2 != (-1)**3)
eq('有限序列DTFT关于Ω周期2π', sum(Integer(v)*exp(-I*w*j) for j,v in enumerate([1,2,-1])).subs(w,w+2*pi), sum(Integer(v)*exp(-I*w*j) for j,v in enumerate([1,2,-1])))
check('无理频率复指数不存在整数基本周期', sqrt(2).is_rational is False)
# 广义线谱的完整分布结论在逐卡来源/人工定理审核中记录，不以有限数值和冒充证明。
finish()

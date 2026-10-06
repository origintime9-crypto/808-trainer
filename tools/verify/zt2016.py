"""2016 印刷卷独立复核。题面歧义与少 1 分问题详见 CONTENT_COVERAGE.md。"""
from common import *

# 填空：阶跃响应必须先差分才能得到冲激响应。
q = Rational(-1, 4)
G = 1 / (1 - q / z)
eq('一1 阶跃响应对应 H', (1 - 1 / z) * G, (z - 1) / (z + Rational(1, 4)))
check('一2 抽样与尺度', Rational(1, 4000) == Rational(250, 10**6) and 2 * 3 * 2000 == 12000)
a = Symbol('a', nonzero=True, real=True)
b = Symbol('b', positive=True)
eq('一3 冲激筛选连续延拓', limit(2 / Abs(a) * sin(b * tau) / tau, tau, 0), 2 * b / Abs(a))
eq('一4 矩形谱逆变换', integrate(exp(I*w*t), (w, -b, b)) / (2*pi), sin(b*t)/(pi*t))
k = Symbol('k', real=True)
check('一7 两极点同时稳定', reduce_inequalities([-3*k-9 < 0, k < 0], k).as_set() == Interval.open(-3,0))
H = 1/(s+3)
eq('一9 输入幅度必须保留', 4 / sqrt(3**2 + 3**2), 2*sqrt(2)/3)
eq('一9 相角', arg(1/(3+3*I)), -pi/4)
T = Symbol('T', positive=True)
eq('一10 有限时宽拉氏变换', integrate(exp(-(s+b)*t), (t, 0, T)), (1-exp(-(s+b)*T))/(s+b))

# 二：直接由框图串/并/反馈关系计算。
eq('二1 左半平面极点', lt(exp(-b*t)), 1/(s+b))
X = (1-exp(-s))/s
H2 = (1+exp(-s)+exp(-2*s))*X
eq('二2 卷积后的梯形', X*H2, (1-exp(-s)-exp(-3*s)+exp(-4*s))/s**2)
hn = lambda j: (Rational(3,5)*Integer(3)**j + Rational(2,5)*Integer(-2)**j)*u(j)
recurrence('二3 正反馈冲激响应', hn, [1,-1,-6], lambda j: u(j)-u(j-1))
gn = lambda j: (Rational(9,10)*Integer(3)**j + Rational(4,15)*Integer(-2)**j - Rational(1,6))*u(j)
recurrence('二3 正反馈阶跃响应', gn, [1,-1,-6], u)

# 三：连续串并联框图。
H = 1 + 2/((s+2)*(s+3))
eq('三1 系统函数与 ODE', H, (s**2+5*s+8)/(s**2+5*s+6))
eq('三1 冲激响应非直通部分', lt(2*exp(-2*t)-2*exp(-3*t)), H-1)
eq('三2 阶跃响应', lt(Rational(4,3)-exp(-2*t)+Rational(2,3)*exp(-3*t)), H/s)
check('三3 零点', roots(s**2+5*s+8, s) == {(-5+I*sqrt(7))/2,(-5-I*sqrt(7))/2})
eq('三5 频率响应代数', H.subs(s,I*w), (8-w**2+5*I*w)/(6-w**2+5*I*w))

# 四：冲激响应为 0..T 的矩形，矩形输入的卷积为三角形。
eq('四1 积分器相减', (1-exp(-s*T))/s, integrate(exp(-s*t),(t,0,T)))
eq('四2 幅相分解', integrate(exp(-I*w*t),(t,0,T)), 2*sin(w*T/2)/w*exp(-I*w*T/2))
Ytri = integrate(t*exp(-s*t),(t,0,T))+integrate((2*T-t)*exp(-s*t),(t,T,2*T))
eq('四3 三角形卷积', Ytri, ((1-exp(-s*T))/s)**2)
eq('四4 冲激驱动保持器的一段', integrate(exp(-s*t),(t,0,T)), (1-exp(-s*T))/s)

# 五：末端延时节点只反馈，输出只有 w+2w(n-1)。
Hz = (1+2/z)/(1+2/z+1/z**2)
eq('五3 H(z)', Hz, z*(z+2)/(z+1)**2)
hn = lambda j: (1-j)*Integer(-1)**j*u(j)
recurrence('五1 修正冲激响应', hn, [1,2,1], lambda j: Integer(j==0)+2*Integer(j==1))
check('五1 边界值', [hn(j) for j in range(4)] == [1,0,-1,2])
check('五5 二阶单位圆极点', factor(z**2+2*z+1) == (z+1)**2)
check('五6 不绝对可和', limit(Abs((1-n)*(-1)**n), n, oo) == oo)
finish()

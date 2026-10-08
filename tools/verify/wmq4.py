"""教材第4章余题：从原积分、正向LT、卷积、初態与Hurwitz主子式独立复核。"""
from common import *
v = Symbol('v', real=True)
T, a, alpha, beta, q = symbols('T a alpha beta q', positive=True)
omega = Symbol('omega', real=True)
k = Symbol('k', real=True)

# 4.2 已知象函数先独立还原，再对每个时间操作作积分，不读取网页公式。
X = 1/(s*s+2*s+5)
x = exp(-t)*sin(2*t)/2
eq('4.2 原X对应时间函数', lt(x), X)
cumulative = integrate(x.subs(t, v), (v, 0, t))
eq('4.2(1) 累计积分直接LT', lt(cumulative), X/s)
eq('4.2(1) 累计远时值', limit(cumulative, t, oo), S.One/5)
eq('4.2(2) 实调制直接LT', lt(x*cos(omega*t)), (X.subs(s, s-I*omega)+X.subs(s, s+I*omega))/2)
eq('4.2(2) 零调制还原原信号', lt(x*cos(0*t)), X)
shifted = integrate(exp(-2*(v-2))*sin(4*(v-2))/2*exp(-s*v), (v, 2, oo))
eq('4.2(3) 起点2的缩放信号定义积分', shifted, 2*exp(-2*s)/(s*s+4*s+20))
eq('4.2(4) 除t直接LT', lt(x/t), atan(2/(s+1))/2)
atan_gap = atan(2/(s+1))/2-(pi/4-atan((s+1)/2)/2)
eq('4.2(4) 两种实域反正切写法导数相同', diff(atan_gap, s), 0)
eq('4.2(4) 两种实域反正切写法在s=1的值相同', atan_gap.subs(s, 1), 0)
eq('4.2(4) 原点无奇异', limit(x/t, t, 0), 1)
eq('4.2(4) s域积分导数', diff(pi/4-atan((s+1)/2)/2, s), -X)
eq('4.2(5) 原普通二阶导数乘t直接LT', lt(t*diff(x, t, 2)), -2*s*(s+5)/(s*s+2*s+5)**2)
eq('4.2(5) 分布导数的频域微分同结果', -diff(s*s*X, s), lt(t*diff(x, t, 2)))
eq('4.2(5) 原二导数中δ权重', diff(x, t).subs(t, 0), 1)

# 4.4 六图直接对有限时窗积分；负时间部分不能污染单边变换。
blocks = [
    ('a', integrate(exp(-s*v), (v, 0, T)), (1-exp(-s*T))/s, T),
    ('b', integrate(v/T*exp(-s*v), (v, 0, T)), (1-(1+s*T)*exp(-s*T))/(T*s*s), T/2),
    ('c', integrate(v*exp(-s*v), (v, 0, 1))+integrate((2-v)*exp(-s*v), (v, 1, 2)), (1-exp(-s))**2/s**2, 1),
    ('d', integrate(sin(pi*v)*exp(-s*v), (v, 0, 2)), pi*(1-exp(-2*s))/(s*s+pi*pi), 0),
    ('e', integrate(exp(-s*v), (v, 0, 2)), (1-exp(-2*s))/s, 2),
    ('f', integrate(exp(-s*v), (v, 0, 1))-integrate(exp(-s*v), (v, 1, 2)), (1-exp(-s))**2/s, 0),
]
for no, computed, expected, area in blocks:
    eq(f'4.4({no}) 原分段定义积分', computed, expected)
    eq(f'4.4({no}) 原点面积与可去奇点', limit(expected, s, 0), area)
eq('4.4(d) 正虚轴表观奇点直接原积分', integrate(sin(pi*v)*exp(-I*pi*v), (v, 0, 2)), -I)
eq('4.4(d) 负虚轴表观奇点直接原积分', integrate(sin(pi*v)*exp(I*pi*v), (v, 0, 2)), I)
eq('4.4(e) 负时间斜坡面积非零但单边忽略', integrate(v+1, (v, -1, 0)), S.Half)

# 4.6 每题由独立时间候选作正向LT，原分式逐项核对。
inverse_cases = [
    (1, exp(-7*t), 1/(s+7)),
    (2, 2*exp(-3*t/2), 4/(2*s+3)),
    (3, S(4)/3*(1-exp(-3*t)), 4/(s*(s+3))),
    (4, (1-cos(3*t))/3, 3/(s*(s*s+9))),
    (5, exp(-2*t)-exp(-3*t), 1/((s+2)*(s+3))),
    (6, 12*exp(-3*t)-8*exp(-2*t), 4*s/((s+2)*(s+3))),
    (7, exp(-t)-exp(-2*t), 1/(s*s+3*s+2)),
    (8, 1-exp(-t/q), 1/(s*(q*s+1))),
    (9, 1-2*exp(-t/q), (1-q*s)/(s*(1+q*s))),
    (10, (q*omega*(exp(-t/q)-cos(omega*t))+sin(omega*t))/(1+(q*omega)**2), omega/((s*s+omega*omega)*(1+q*s))),
    (11, 7*exp(-3*t)-3*exp(-2*t), (4*s+5)/(s*s+5*s+6)),
    (12, (400*exp(-t)+19500*exp(-200*t))/199, 100*(s+5)/(s*s+201*s+200)),
    (13, (t*t-t+1)*exp(-t)-exp(-2*t), (s+3)/((s+1)**3*(s+2))),
    (17, exp(-t)*(2*cos(2*t)+sin(2*t)), (2*s+4)/(s*s+2*s+5)),
    (20, S(2)/3+exp(-3*t)/12-3*exp(-t)/4-t*exp(-t)/2, (s+2)/(s*(s+3)*(s+1)**2)),
    (21, exp(-2*t)+3*exp(-3*t), (4*s*s+17*s+18)/((s+2)**2*(s+3))),
    (22, 1-exp(-t/2)*(cos(sqrt(3)*t/2)+sin(sqrt(3)*t/2)/sqrt(3)), 1/(s*(s*s+s+1))),
    (24, (1-2*a*t)*exp(-a*t), (s-a)/(s+a)**2),
]
for no, value, given in inverse_cases:
    eq(f'4.6({no}) 时间候选正向LT回原分式', lt(value), given)
eq('4.6(5)/(7) 极点不同不合并', 1/((s+2)*(s+3))-1/(s*s+3*s+2), -2/((s+1)*(s+2)*(s+3)))
eq('4.6(10) 零频率连续值', inverse_cases[9][1].subs(omega, 0), 0)
eq('4.6(12) 正确残量和', Rational(400, 199)+Rational(19500, 199), 100)
eq('4.6(12) 错残量会变5000常数', cancel(Rational(100,199)*(49/(s+1)+150/(s+200))*(s+1)*(s+200)), 100*s+5000)
D14 = (a-alpha)**2+beta**2
h14 = -a/D14*exp(-a*t)+exp(-alpha*t)*(a/D14*cos(beta*t)+(alpha*alpha+beta*beta-a*alpha)/(beta*D14)*sin(beta*t))
eq('4.6(14) 两个不同衰减参数通式LT', lt(h14), s/((s+a)*((s+alpha)**2+beta*beta)))
h140 = (-a*exp(-a*t)+(a+alpha*(alpha-a)*t)*exp(-alpha*t))/(a-alpha)**2
eq('4.6(14) β为0的时间连续极限', limit(h14, beta, 0), h140)
eq('4.6(14) β为0但a≠α的极限LT', lt(h140), s/((s+a)*(s+alpha)**2))
eq('4.6(14) 全退化三重实极点', lt((t-a*t*t/2)*exp(-a*t)), s/(s+a)**3)
eq('4.6(14) 无除零卷积内核LT', lt(exp(-alpha*t)*(cos(beta*t)-alpha*sin(beta*t)/beta)), s/((s+alpha)**2+beta*beta))
D15 = (beta*beta+alpha*alpha-a*a)**2+4*alpha*alpha*a*a
h15 = ((beta*beta+alpha*alpha-a*a)*cos(a*t)+2*alpha*a*sin(a*t)+exp(-alpha*t)*((a*a-alpha*alpha-beta*beta)*cos(beta*t)-alpha/beta*(a*a+alpha*alpha+beta*beta)*sin(beta*t)))/D15
eq('4.6(15) 一般二阶对二阶通式LT', lt(h15), s/((s*s+a*a)*((s+alpha)**2+beta*beta)))
h150 = ((alpha*alpha-a*a)*cos(a*t)+2*alpha*a*sin(a*t)+exp(-alpha*t)*(a*a-alpha*alpha-alpha*(a*a+alpha*alpha)*t))/(alpha*alpha+a*a)**2
eq('4.6(15) β为0的时间连续极限', limit(h15, beta, 0), h150)
eq('4.6(15) β为0的连续极限LT', lt(h150), s/((s*s+a*a)*(s+alpha)**2))
eq('4.6(15) 无除零卷积原两核', lt(cos(a*t))*lt(exp(-alpha*t)*sin(beta*t)/beta), s/((s*s+a*a)*((s+alpha)**2+beta*beta)))
eq('4.6(15) 重合纯虚极点', lt(t*sin(a*t)/(2*a)), s/(s*s+a*a)**2)
eq('4.6(15) 频率全零的退化积分', lt(t*t/2), 1/s**3)
eq('4.6(16) 延时定义积分', integrate((1-cos(v-1))/4*exp(-s*v), (v, 1, oo)), exp(-s)/(4*s*(s*s+1)))
eq('4.6(18) 对数频域导数对应t乘法', -diff(log((s-1)/s), s), 1/s-1/(s-1))
eq('4.6(18) 对数无穷边界常数0', limit(log((s-1)/s), s, oo), 0)
eq('4.6(18) 时间原点连续极限', limit((1-exp(t))/t, t, 0), -1)
eq('4.6(19) 原假分式包含2δ', 2+lt(3*exp(-t)-S(5)/2*exp(-3*t/2)), (4*s*s+11*s+10)/(2*s*s+5*s+3))
eq('4.6(19) 普通部分右值', (3*exp(-t)-S(5)/2*exp(-3*t/2)).subs(t, 0), S.Half)
eq('4.6(21) 原分子相消因子', 4*s*s+17*s+18, (s+2)*(4*s+9))
A, K = symbols('A K', real=True)
eq('4.6(23) 非零K时正向LT', lt(A*sin(K*t)/K), A/(s*s+K*K))
eq('4.6(23) K=0连续退化', limit(A*sin(K*t)/K, K, 0), A*t)
eq('4.6(23) 零频率候选LT', lt(A*t), A/s**2)
eq('4.6(24) a=0化成阶跃', ((1-2*a*t)*exp(-a*t)).subs(a, 0), 1)

# 4.7 首周期的原图有限积分/冲激筛选，随后只沿右边重复。
repeat = 1/(1-exp(-s*T))
repeated = [
    ('a', integrate(exp(-s*v), (v, 0, T/2))*repeat, 1/(s*(1+exp(-s*T/2)))),
    ('b', (exp(-s*T/2)-exp(-s*T))*repeat, exp(-s*T/2)/(1+exp(-s*T/2))),
    ('c', integrate((1-2*v/T)*exp(-s*v), (v, 0, T))*repeat, (1+exp(-s*T))/(s*(1-exp(-s*T)))-2/(T*s*s)),
    ('d', (integrate(exp(-s*v), (v, 0, T/2))-integrate(exp(-s*v), (v, T/2, T)))*repeat, (1-exp(-s*T/2))/(s*(1+exp(-s*T/2)))),
]
for no, computed, expected in repeated:
    eq(f'4.7({no}) 原一周期有限块重复', computed, expected)
eq('4.7(a) 非零均值边界', limit(s*repeated[0][1], s, 0), S.Half)
eq('4.7(b) 无原点δ的高频极限', limit(repeated[1][1], s, oo), 0)
eq('4.7(c) Abel边界并非普通积分', limit(repeated[2][1], s, 0), T/6)
eq('4.7(d) 正负半周Abel边界', limit(repeated[3][1], s, 0), T/4)
eq('4.7(c) 每周期均值为0', integrate(1-2*v/T, (v, 0, T)), 0)

# 4.8 先核对因果时间函数、ROC相关极点与普通/广义边界。
ftcases = [(1, exp(-t)*cos(t), (s+1)/(s*s+2*s+2)),
           (2, -2+3*exp(-t), (s-2)/(s*s+s)),
           (3, exp(t)/5+4*exp(-4*t)/5, s/(s*s+3*s-4))]
for no, value, given in ftcases:
    eq(f'4.8({no}) 因果逆变换候选LT', lt(value), given)
# 实ω时被积函数的模不超过e^-v，先确认可积；避免SymPy留下恒真辐角的Piecewise条件。
eq('4.8(1) 虚轴积分的绝对可积包络', integrate(exp(-v), (v, 0, oo)), 1)
eq('4.8(1) 虚轴原收敛积分', integrate(exp(-v)*cos(v)*exp(-I*omega*v), (v, 0, oo), conds='none'), (1+I*omega)/((1+I*omega)**2+1))
eq('4.8(2) 非衰减普通尾', limit(ftcases[1][1], t, oo), -2)
epsilon = Symbol('epsilon', positive=True)
eq('4.8(2) u的Abel核实部面积是π', integrate(epsilon/(epsilon**2+omega**2), (omega, -oo, oo)), pi)
eq('4.8(2) u的Abel核分解支持δ和PV', 1/(epsilon+I*omega), epsilon/(epsilon**2+omega**2)-I*omega/(epsilon**2+omega**2))
check('4.8(3) 因果指数增长导致普通与温和边界失败', limit(ftcases[2][1], t, oo) == oo)
eq('4.8(3) 增长极点为+1', s*s+3*s-4, (s-1)*(s+4))

# 4.9/10 卷积或原H乘输入独立检查；原点导数冲激不能忽略。
h9 = 1-exp(-2*t)
g9 = integrate(h9.subs(t, tau), (tau, 0, t))
eq('4.9(1) 原h与阶跃卷积', g9, t-S.Half+exp(-2*t)/2)
eq('4.9(1) 原右值0', g9.subs(t, 0), 0)
eq('4.9(1) 有限矩形输入变换', lt(g9)*(1-exp(-2*s)), lt(h9)*(1-exp(-2*s))/s)
eq('4.9(1) 有限矩形输入终值2', limit(g9-g9.subs(t, t-2), t, oo), 2)
eq('4.9(2) 反求输入时域卷积', integrate((1-exp(-2*tau))*(1+2*(t-tau)), (tau, 0, t)), t*t)
H10 = (s+1)/(s+2)
for no, value, xf, forcing in [(1, (1+exp(-2*t))/2, 1/s, 1),
                                (2, exp(-2*t), 1/(s+1), 0),
                                (3, (1-t)*exp(-2*t), 1/(s+2), -exp(-2*t))]:
    eq(f'4.10({no}) 原H乘输入', lt(value), H10*xf)
    eq(f'4.10({no}) 原点输入δ产生右值1', value.subs(t, 0), 1)
    eq(f'4.10({no}) 回原正时间ODE', diff(value, t)+2*value, forcing)

# 4.12 从原左初态的齐次方程检查，没有输入时0−和0+相同。
for no, value, b, c, y0, dy0 in [(1, 4*exp(-t)-3*exp(-2*t), 3, 2, 1, 2),
                                (2, 2*exp(-2*t)-exp(-3*t), 5, 6, 1, -1),
                                (3, sin(2*t)/2, 0, 4, 0, 1)]:
    eq(f'4.12({no}) 回原齐次ODE', diff(value, t, 2)+b*diff(value, t)+c*value, 0)
    eq(f'4.12({no}) 原初值', value.subs(t, 0), y0)
    eq(f'4.12({no}) 原初导数', diff(value, t).subs(t, 0), dy0)
    eq(f'4.12({no}) 左初态单边式', lt(value), (s*y0+dy0+b*y0)/(s*s+b*s+c))

# 4.13 响应分解、正时间原方程与原点冲激跳变三重核对。
D = s*s+5*s+6
H13 = (8*s+2)/D
response13 = [
    (1, 5*exp(-2*t)-4*exp(-3*t), S.One/3+7*exp(-2*t)-S(22)/3*exp(-3*t), 1/s, 1, 2, 2),
    (2, exp(-2*t)-exp(-3*t), (22-14*t)*exp(-2*t)-22*exp(-3*t), 1/(s+2), 0, 1, -14*exp(-2*t)),
]
for no, zi, zs, xf, y0, dy0, rhs in response13:
    eq(f'4.13({no}) ZI原初態式', lt(zi), (s*y0+dy0+5*y0)/D)
    eq(f'4.13({no}) ZS原H乘输入', lt(zs), H13*xf)
    total = zi+zs
    eq(f'4.13({no}) 全响应原正时间ODE', diff(total, t, 2)+5*diff(total, t)+6*total, rhs)
    eq(f'4.13({no}) 全响应右值连续', total.subs(t, 0), y0)
    eq(f'4.13({no}) 原输入微分给导数跳8', diff(total, t).subs(t, 0)-dy0, 8)

# 4.14 按明示的最简ODE，初态右侧跳变与普通t>0均验证。
y141 = 4*exp(-t)-3*exp(-2*t)
eq('4.14(1) 原初態和H共同给全LT', lt(y141), (s+5)/((s+1)*(s+3))*(1+1/(s+2)))
eq('4.14(1) 原正时间ODE', diff(y141, t, 2)+4*diff(y141, t)+3*y141, 3*exp(-2*t))
eq('4.14(1) 右值保留原左值1', y141.subs(t, 0), 1)
eq('4.14(1) 原输入导数使右导数为2', diff(y141, t).subs(t, 0), 2)
y142 = 2*t+S.Half+exp(-2*t)/2
D142 = s*(s+1)*(s+2)
eq('4.14(2) 原初態和H共同给全LT', lt(y142), (s*s+4*s+6)/D142+(s+4)/(s*D142))
eq('4.14(2) 原三阶ODE', diff(y142, t, 3)+3*diff(y142, t, 2)+2*diff(y142, t), 4)
eq('4.14(2) 右值保留1', y142.subs(t, 0), 1)
eq('4.14(2) 右导数保留1不同于4.11(4)', diff(y142, t).subs(t, 0), 1)
eq('4.14(2) 原输入导数使二导数跳1', diff(y142, t, 2).subs(t, 0), 2)

# 4.15/16 用原时间卷积反推，不将阶跃响应当冲激核。
input15 = exp(-2*t)
regular15 = exp(-t)/2-exp(-3*t)
eq('4.15 δ直通与普通核卷积回原给定输出', input15/2+integrate(regular15.subs(t, tau)*exp(-2*(t-tau)), (tau, 0, t)), exp(-t)/2-exp(-2*t)+exp(-3*t))
eq('4.15 原Y除X得直通', limit((s+2)*(1/(2*(s+1))-1/(s+2)+1/(s+3)), s, oo), S.Half)
eq('4.16 原g右值0故导数无δ', (1-exp(-2*t)).subs(t, 0), 0)
eq('4.16 候选输入与原g导数卷积', integrate(2*exp(-2*tau)*(1-exp(-2*(t-tau))/2), (tau, 0, t)), 1-exp(-2*t)-t*exp(-2*t))

# 4.17 同一初态的两组观测反求H和ZI，第三输入完整斜坡相减。
H17 = s/(s+1)
ZI17 = 2/(s+1)
eq('4.17 第一已知全响应回乘', H17+ZI17, 1+1/(s+1))
eq('4.17 第二已知全响应回乘', H17/s+ZI17, 3/(s+1))
eq('4.17 第三输入定义积分', integrate(v*exp(-s*v), (v, 0, 1))+integrate(exp(-s*v), (v, 1, oo)), (1-exp(-s))/s**2)
eq('4.17 第三全响应重构LT', lt(1+exp(-t))-exp(-s)*lt(1-exp(-t)), H17*(1-exp(-s))/s**2+ZI17)
eq('4.17 延时点连续', (1-exp(-t)).subs(t, 0), 0)
eq('4.17 最终尾为0', limit(1+exp(-t)-(1-exp(-(t-1))), t, oo), 0)

# 4.20 全部四任务：实际根、冲激直通、画图的关键数值与稳定性。
pole_cases = [
    (1, s/(s+2), s, s+2, {0}, {-2}, 1, -2*exp(-2*t)),
    (2, (s+1)/(s*s+2*s+2), s+1, s*s+2*s+2, {-1}, {-1+I, -1-I}, 0, exp(-t)*cos(t)),
    (3, (s*s+2*s-3)/((s+2)*(s+5)), s*s+2*s-3, (s+2)*(s+5), {-3, 1}, {-2, -5}, 1, -exp(-2*t)-4*exp(-5*t)),
    (4, (s-3)/(s*(s+1)*(s+2)), s-3, s*(s+1)*(s+2), {3}, {0, -1, -2}, 0, -S(3)/2+4*exp(-t)-S(5)/2*exp(-2*t)),
]
for no, given, numerator, denominator, zeroes, poles, direct, regular in pole_cases:
    check(f'4.20({no}) 独立求实际零点', roots(numerator, s) == zeroes)
    check(f'4.20({no}) 独立求实际极点', roots(denominator, s) == poles)
    eq(f'4.20({no}) 含直通冲激的h回LT', direct+lt(regular), given)
    eq(f'4.20({no}) 无穷频率与δ系数', limit(given, s, oo), direct)
eq('4.20(1) 普通核绝对积分有限', integrate(2*exp(-2*t), (t, 0, oo)), 1)
eq('4.20(2) 第一次过零t=π/2', (exp(-t)*cos(t)).subs(t, pi/2), 0)
eq('4.20(2) 普通核有绝对可积指数界', integrate(exp(-t), (t, 0, oo)), 1)
eq('4.20(3) 普通核绝对积分有限', integrate(exp(-2*t)+4*exp(-5*t), (t, 0, oo)), Rational(13, 10))
h204 = pole_cases[3][-1]
eq('4.20(4) h右值0无冲激', h204.subs(t, 0), 0)
eq('4.20(4) h右导数1', diff(h204, t).subs(t, 0), 1)
eq('4.20(4) 原曲线驻点', diff(h204, t).subs(t, log(S(5)/4)), 0)
eq('4.20(4) 最大0.1不漏小正峰', h204.subs(t, log(S(5)/4)), S.One/10)
check('4.20(4) 驻点是极大', diff(h204, t, 2).subs(t, log(S(5)/4)) < 0)
eq('4.20(4) 尾值−1.5', limit(h204, t, oo), -S(3)/2)
check('4.20(4) 有界阶跃输入导致无界输出', limit(integrate(h204.subs(t, tau), (tau, 0, t)), t, oo) == -oo)

# 稳定性不用原错误劳斯数值：独立构造Hurwitz矩阵的首要主子式。
def hurwitz(coeff):
    n = len(coeff)-1
    matrix = Matrix(n, n, lambda i, j: coeff[2*(j+1)-(i+1)] if 0 <= 2*(j+1)-(i+1) < len(coeff) else 0)
    return [matrix[:i, :i].det() for i in range(1, n+1)]

mins23 = hurwitz([1, k, 2, 1])
for j, expected in enumerate([k, 2*k-1, 2*k-1]):
    eq(f'4.23 第{j+1}阶独立Hurwitz主子式', mins23[j], expected)
check('4.23 全部正主子式严格范围', reduce_inequalities([v0 > 0 for v0 in mins23], k).as_set() == Interval.open(S.Half, oo))
eq('4.23 边界含纯虚根不纳入', s**3+s*s/2+2*s+1, (s+S.Half)*(s*s+2))
eq('4.24(1) 原多项式精确因式', s**4+3*s**3+4*s*s+6*s+4, (s*s+2)*(s+1)*(s+2))
check('4.24(1) 两个实际纯虚根', {I*sqrt(2), -I*sqrt(2)}.issubset(roots(s**4+3*s**3+4*s*s+6*s+4, s)))
eq('4.24(1) 原Routh零行辅助多项式', 2*s*s+4, 2*(s*s+2))
mins242 = hurwitz([1, 25, 10, 4])
check('4.24(2) 首要主子式全正', all(v0 > 0 for v0 in mins242))
for j, expected in enumerate([25, 246, 984]):
    eq(f'4.24(2) 第{j+1}阶主子式', mins242[j], expected)
mins243 = hurwitz([1, 4, 2, 3, 9, 4])
for j, expected in enumerate([4, 5, -113, -929, -3716]):
    eq(f'4.24(3) 第{j+1}阶独立主子式', mins243[j], expected)
col243 = [S.One, mins243[0]]+[mins243[i]/mins243[i-1] for i in range(1, 5)]
check('4.24(3) 第一列两次变号', sum(bool(col243[i]*col243[i+1] < 0) for i in range(5)) == 2)

# 最后一页4.25不能漏；相消与重极点严格左半平面分别核对。
eq('4.25(1) 原分母因式', s*s+5*s+4, (s+1)*(s+4))
eq('4.25(1) 原实际h候选LT', lt((-exp(-t)+4*exp(-4*t))/3), s/(s*s+5*s+4))
eq('4.25(1) 普通核可积界', integrate((exp(-t)+4*exp(-4*t))/3, (t, 0, oo)), S(2)/3)
D252 = s**4+7*s**3+17*s*s+17*s+6
eq('4.25(2) 原四阶分母精确因式', D252, (s+1)**2*(s+2)*(s+3))
eq('4.25(2) 没有分子分母相消', gcd(s*s-s+1, D252), 1)
mins252 = hurwitz([1, 7, 17, 17, 6])
for j, expected in enumerate([7, 102, 1440, 8640]):
    eq(f'4.25(2) 第{j+1}阶主子式', mins252[j], expected)
eq('4.25(2) 正确s¹首项240/17', mins252[2]/mins252[1], S(240)/17)
check('4.25(2) 独立主子式全部正', all(v0 > 0 for v0 in mins252))
D253 = s**5+s**4+2*s**3+2*s*s+1
eq('4.25(3) 分子零点−1不相消', D253.subs(s, -1), 1)
eq('4.25(3) 原s项确实缺项', expand(D253).coeff(s, 1), 0)
eps_col = [S.One, S.One, epsilon, 2+1/epsilon, -1-epsilon/(2+1/epsilon), S.One]
check('4.25(3) ε替代零首项后两次变号', sum(bool(simplify(eps_col[i]*eps_col[i+1]) < 0) for i in range(5)) == 2)
# 数值求全部五根作独立旁证，不用网页或参考解的失稳断言。
poly_var = Symbol('root')
values = nroots(D253.subs(s, poly_var), maxsteps=100)
check('4.25(3) 全根数值旁证两个右半平面', sum(bool(re(v0) > 0) for v0 in values) == 2)
finish()

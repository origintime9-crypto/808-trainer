"""独立复核新增对照表约定、交互实验及逐题提示的关键中间式。"""
from sympy import (I, pi, oo, symbols, integrate, exp, sqrt, simplify, limit, cos, sin, expand, Rational as Q)

t, w = symbols('t w', real=True)
s, z = symbols('s z')
sigma, w0 = symbols('sigma w0', positive=True, real=True)
checks = 0
def check(name, actual, expected):
    global checks
    assert simplify(actual-expected) == 0, (name, actual, expected)
    checks += 1
    print('OK', name)

# CTFT 明确使用角频率，不采用 SymPy 默认的 2πf 约定。
base = integrate(exp(-t*t)*exp(-I*w*t), (t, -oo, oo))
check('CTFT Gaussian', base, sqrt(pi)*exp(-w*w/4))
scaled = integrate(exp(-4*t*t)*exp(-I*w*t), (t, -oo, oo))
check('CTFT scale |a|', scaled, sqrt(pi)*exp(-w*w/16)/2)
check('bilateral LT negative scale', Q(1,2)/(1-s/(-2)), 1/(s+2))

# 有限双边序列精确检验 z 变换时移、反褶以及 DTFT 整数抽取。
samples = {-2:1,-1:-2,0:3,1:4,2:5,3:-1,4:2}
X = sum(v*z**(-n) for n,v in samples.items())
check('ZT shift', sum(v*z**(-(n+3)) for n,v in samples.items()), z**-3*X)
check('ZT reversal', sum(v*z**n for n,v in samples.items()), X.subs(z,1/z))
for m in [2,3,4]:
    for n in samples:
        value = sum(exp(-I*2*pi*k*n/m) for k in range(m))/m
        check(f'DTFT decimation M={m}, n={n}', expand(value, complex=True), 1 if n % m == 0 else 0)

# 单位矩形卷积：左右半段的积分限直接由区间交集得到。
a=symbols('a', real=True, positive=True)
check('convolution rising', integrate(1,(t,0,a)),a)
check('convolution falling', integrate(1,(t,a-1,1)),2-a)
check('convolution total area', integrate(t,(t,0,1))+integrate(2-t,(t,1,2)),1)

# 共轭极点示例的真实幅频公式与峰频。
D=(I*w+sigma)**2+w0**2
check('pole magnitude denominator', expand(D*D.conjugate()), (sigma*sigma+w0*w0-w*w)**2+4*sigma*sigma*w*w)
check('resonant stationary frequency', ((sigma*sigma+w0*w0-w*w)**2+4*sigma*sigma*w*w).diff(w).subs(w*w,w0*w0-sigma*sigma),0)

# 首轮逐题提示所引用的中间式，不只检验题库最终答案。
check('2026-1-2 continuous extension',limit(sin(2*t)/t,t,0),2)
check('2026-5-2 poles',expand((z-1)*(z+Q(3,4))),z*z-z/4-Q(3,4))
y1=exp(-t)-cos(2*t);y2=2*exp(-t)-5*cos(2*t)
check('2026-6 zero-state', y2-y1, exp(-t)-4*cos(2*t))
check('2026-9 partial fractions',Q(2,3)*(z/(z-2)-z/(z-Q(1,2))),z/(z*z-Q(5,2)*z+1))
check('2026-10 gain',limit(s*(s/(s*s+2*s+Q(7,4))),s,oo),1)
print(f'新增学习工具 {checks} 项符号检查完成。')

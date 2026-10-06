"""第 6 章：离散周期、按绝对下标卷积、收敛与系统性质反例。"""
from common import *
from math import gcd

for label, numerator, denominator, expected in [('1',3,14,14),('3',13,6,6)]:
    eq('6.2('+label+') 互质周期', denominator//gcd(numerator,denominator), expected)
check('6.2(2)(4) 非周期频率', not Rational(1,8)/(2*pi) in S.Rationals and not 5/(2*pi) in S.Rationals)
fs = [
    {-1:1,0:2,1:1},
    {k:1 for k in range(-2,3)},
    {0:3,1:2,2:1},
    {0:1,1:-1,2:1,3:-1},
]
def conv(left,right):
    out={}
    for k,x in left.items():
        for m,y in right.items(): out[k+m]=out.get(k+m,Integer(0))+x*y
    return out
diff12 = {k:fs[1].get(k,0)-fs[0].get(k,0) for k in range(-2,3)}
expected = [
    (conv(fs[0],fs[1]),-3,[1,3,4,4,4,3,1]),
    (conv(fs[1],fs[2]),-2,[3,5,6,6,6,3,1]),
    (conv(fs[1],fs[3]),-2,[1,0,1,0,0,-1,0,-1]),
    (conv(diff12,fs[2]),-2,[3,2,-2,-2,2,2,1]),
]
for i,(actual,start,values) in enumerate(expected,1):
    check('6.4('+str(i)+') 绝对下标数值卷积', actual == dict(enumerate(values,start)))
    Z = sum(v*z**(-k) for k,v in actual.items())
    left,right = [(fs[0],fs[1]),(fs[1],fs[2]),(fs[1],fs[3]),(diff12,fs[2])][i-1]
    eq('6.4('+str(i)+') z 多项式交叉检查', Z, sum(v*z**(-k) for k,v in left.items())*sum(v*z**(-k) for k,v in right.items()))
half = Rational(1,2)
check('6.6 g*h 恰为冲激', all(half**k*u(k)-half*half**(k-1)*u(k-1)==Integer(k==0) for k in range(-5,10)))
check('6.6 x*g 双边抵消', all(half**k-half*half**(k-1)==0 for k in range(-8,9)))
M = Symbol('M', integer=True, nonnegative=True)
k = Symbol('k', integer=True, nonnegative=True)
eq('6.6 x*h 部分和', summation(half**(n-k)*half**k,(k,0,M)), (M+1)*half**n)
check('6.6 部分和发散', limit((M+1)*half**n,M,oo)==oo)
q = Symbol('q', real=True)
eq('6.7(1) 零输入破坏线性', 4*0-2, -2)
check('6.7(1) 资料有界不等式反例', abs(4*(-1)-2) > 4*abs(-1)-2)
a, b = symbols('a b')
xx, yy = Function('x'), Function('y')
eq('6.7(2) 固定延时的线性性', (a*xx(n)+b*yy(n)).subs(n,n-3), a*xx(n-3)+b*yy(n-3))
check('6.7(3) 常输入产生时变输出', simplify(sin(3*pi/7+pi/4)-sin(pi/4)) != 0)
check('6.7(4) 齐次性反例', (2*1)**3 != 2*1**3)
eq('6.7(5) 有界输入 u(-n) 的逐点收敛反例', summation(1,(k,0,M)), M+1)
check('6.7(5) 输出不稳定', limit(M+1,M,oo)==oo)
eq('6.7(6) 零输入破坏线性', exp(0), 1)
finish()

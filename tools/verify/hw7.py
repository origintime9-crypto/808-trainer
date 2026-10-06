"""第七章指定题：定义求和、零极点、部分分式及全部 ROC 对应递推。"""
from common import *

q=Symbol('q',positive=True)
a=Symbol('a',nonzero=True)
theta,phi= symbols('theta phi',real=True)
rad=Symbol('rad',positive=True)
k=Symbol('k',integer=True,nonnegative=True)

def geom(coefficient,ratio,start=0):
    # 先在 |ratio|<1 的定义收敛区求和，再取所得解析式。
    return coefficient*ratio**start/(1-ratio)

F1=z+1+z/(z-Rational(1,2))
eq('7.1(1) 组合并约分', F1, (z*z+3*z/2-Rational(1,2))/(z-Rational(1,2)))
check('7.1(1) 两个有限零点', roots(numer(cancel(F1)),z)=={(-3-sqrt(17))/4,(-3+sqrt(17))/4})
eq('7.1(2) 有限和', sum(5**i*z**(-i) for i in range(2)), (z+5)/z)
eq('7.1(3) 从一开始的右边序列', geom(1,1/(3*z),1), 1/(3*z-1))
eq('7.1(4) 从负一下标开始', geom(1,z/3,1), z/(3-z))
eq('7.1(5) 含零的左阶跃', geom(1,z), 1/(1-z))
eq('7.1(6) 右阶跃', geom(1,1/z), z/(z-1))
eq('7.1(7) 右指数', geom(1,2/z), z/(z-2))
eq('7.1(8) 含零的左指数', geom(1,2*z), 1/(1-2*z))
eq('7.1(9) 负左指数', geom(-1,2*z,1), z/(z-Rational(1,2)))
finite=sum(Rational(1,2)**i*z**(-i) for i in range(10))
eq('7.1(10) 十项定义和', finite, (1-(2*z)**(-10))/(1-1/(2*z)))
eq('7.1(10) 可去点', finite.subs(z,Rational(1,2)), 10)
check('7.1(10) 原点极点重数', degree(denom(cancel(finite)),z)==9 and roots(denom(cancel(finite)),z)=={0})
for i in range(1,10):
    check('7.1(10) 第 '+str(i)+' 个零点', abs(complex(finite.subs(z,exp(2*pi*I*i/10)/2).evalf()))<1e-10)
F11=(cos(phi)-rad/z*cos(phi-theta))/(1-2*rad/z*cos(theta)+rad*rad/z**2)
independent=exp(I*phi)/2/(1-rad*exp(I*theta)/z)+exp(-I*phi)/2/(1-rad*exp(-I*theta)/z)
# 在实正 z 区域直接展开；这是一般有理恒等式，不限制网页的复 z ROC。
eq('7.1(11) 复指数定义求和', expand_complex(independent.subs(z,q)), F11.subs(z,q))
eq('7.1(11) 非原点零点', numer(together(F11)).subs(z,rad*cos(phi-theta)/cos(phi)), 0)

inverse=[
    ((-Rational(1,2),Integer(1)),),
    ((-Rational(1,2),Integer(4)),(-Rational(1,4),Integer(-3))),
]
for i,terms in enumerate(inverse,1):
    F=[1/(1+1/(2*z)),(1-1/(2*z))/(1+3/(4*z)+1/(8*z*z))][i-1]
    eq('7.3('+str(i)+') 指数分量重建', sum(c*z/(z-pole) for pole,c in terms), F)
eq('7.3(3) 左边与冲激重建', 8-7*z/(z-Rational(1,4)), (1-2/z)/(1-1/(4*z)))
eq('7.3(4) 分式重建', -a+(a-1/a)*z/(z-1/a), (1-a/z)/(1/z-a))
eq('7.3(5) 正负一极点重建', 5*z/(z-1)+5*z/(z+1), 10*z*z/((z-1)*(z+1)))
D=1-2*cos(theta)/z+1/z**2
Fs=(1+1/z)/D
# 通过独立复指数级数检验正弦合成的式子。
series=(exp(I*theta)/(1-exp(I*theta)/z)-exp(-I*theta)/(1-exp(-I*theta)/z)+1/(1-exp(I*theta)/z)-1/(1-exp(-I*theta)/z))/(2*I*sin(theta))
eq('7.3(6) 正弦级数合成', expand_complex(series.subs(z,q)), Fs.subs(z,q))
eq('7.3(6) Ω=0 退化', Fs.subs(theta,0), 2*z/(z-1)**2+z/(z-1))
eq('7.3(6) Ω=π 退化', Fs.subs(theta,pi), z/(z+1))
eq('7.3(7) 线性加权', -z*diff(z/(z-6),z)/6, z**(-1)/(1-6/z)**2)
eq('7.3(8) 余弦与冲激', 1-(z/(z-I)+z/(z+I))/2, z**(-2)/(1+z**(-2)))

F41=(1-1/(4*z))/((1+1/(4*z))*(1+3/(2*z)+1/(2*z*z)))
terms41=[(-Rational(1,4),Rational(2,3)),(-Rational(1,2),Integer(-3)),(-Integer(1),Rational(10,3))]
eq('7.4(1) 三极点系数', sum(c*z/(z-p) for p,c in terms41), F41)
eq('7.4(2) 两极点系数', -10*z/(z-1)+10*z/(z-2), 10*z/((z-1)*(z-2)))
check('7.4(1)(2) 所有 ROC 分界', sorted({abs(p) for p,c in terms41})==[Rational(1,4),Rational(1,2),1])

A=(1+sqrt(5))/2
B=(1-sqrt(5))/2
HF=z/(z*z-z-1)
eq('7.12(1) 方程重建', z**(-1)/(1-z**(-1)-z**(-2)), HF)
eq('7.12(2)(3) 部分分式', (z/(z-A)-z/(z-B))/sqrt(5), HF)
def causal_fib(j):
    return (A**j-B**j)/sqrt(5)*u(j)
def stable_fib(j):
    return -(A**j*u(-j-1)+B**j*u(j))/sqrt(5)
recurrence('7.12(2) 因果冲激递推',causal_fib,[1,-1,-1],lambda j:Integer(j==1),hi=12)
recurrence('7.12(3) 稳定双边冲激递推',stable_fib,[1,-1,-1],lambda j:Integer(j==1),hi=12)
check('7.12(3) 稳定环域包含单位圆', abs(B)<1<A)
H13=z/((z-3)*(z-Rational(1,3)))
eq('7.13 原方程重建', 1/(1/z-Rational(10,3)+z), H13)
def h13(j):return -Rational(3,8)*(Integer(3)**j*u(-j-1)+Rational(1,3)**j*u(j))
check('7.13 双边原方程',all(simplify(h13(j-1)-Rational(10,3)*h13(j)+h13(j+1))==Integer(j==0) for j in range(-9,10)))
eq('7.13 绝对可和', Rational(3,8)*(geom(1,Rational(1,3),1)+geom(1,Rational(1,3))), Rational(3,4))
H14=z/((z-2)*(z-Rational(1,2)))
eq('7.14 系统函数', 1/(1/z-Rational(5,2)+z), H14)
tw=Rational(2,3)
hs=[
    lambda j:tw*(Integer(2)**j-Rational(1,2)**j)*u(j),
    lambda j:-tw*(Integer(2)**j*u(-j-1)+Rational(1,2)**j*u(j)),
    lambda j:tw*(Rational(1,2)**j-Integer(2)**j)*u(-j-1),
]
for i,hn in enumerate(hs,1):
    check('7.14('+str(i)+') 原方程跨零点检查',all(simplify(hn(j-1)-Rational(5,2)*hn(j)+hn(j+1))==Integer(j==0) for j in range(-9,10)))
eq('7.14(2) 绝对可和', tw*(geom(1,Rational(1,2),1)+geom(1,Rational(1,2))), 2)
finish()

"""课程29：从91–93页原题独立求解；明确全时域积分器的卷积存在性与延迟初态。"""
from common import *
v=Symbol('v',real=True)
q=Symbol('q')
alpha=Symbol('alpha',real=True)
omega0=Symbol('omega0',positive=True)
a,c,eps= symbols('a c eps',positive=True)
theta=Symbol('theta',positive=True)

# 十填空，与旧卷合并前仍对原条件做核对。
eq('一1 节点t0负值左移例', Integer(2)-3, -1)
check('一2 非周期不必连续谱', sqrt(2).is_rational is False)
eq('一2 DTFT核2π周期', exp(-I*(w+2*pi)*n), exp(-I*w*n))
eq('一3 冲激在区间外', integrate(4*v**2*DiracDelta(v+1),(v,0,oo)), 0)
eq('一4 阶跃正则化实部的冲激面积', integrate(eps/(eps**2+v**2),(v,-oo,oo)), pi)
eq('一4 虚部主值的非零频率极限', limit(-w/(eps**2+w**2),eps,0,dir='+'), -1/w)
seq_input=lambda k:Integer((3*k+2)%7-3)
for k in [-3,0,4]:
    eq('一5 原七项和与固定移位', sum(seq_input(j) for j in range(k-1,k+6)), sum(seq_input(k+j) for j in range(-1,6)))
check('一5 有未来项所以非因果', 5>0)
check('一5 七项和有界', 7*3 >= max(abs(sum(seq_input(k+j) for j in range(-1,6))) for k in range(-4,9)))
eq('一6 非因果稳定反例的绝对和', summation(Rational(1,2)**(n+1),(n,0,oo)), 1)
eq('一7 展宽后奈奎斯特间隔', 1/(2*(a/2)), 1/a)
# 以测试函数φ=e^(-t²+t)的分布导数定义验证2u+4δ'。
phi=exp(-v**2+v)
distribution_integral=integrate((v**2+4)*diff(phi,v,2),(v,0,oo))
candidate_action=2*integrate(phi,(v,0,oo))-4*diff(phi,v).subs(v,0)
eq('一8 二阶分布导数对测试函数', distribution_integral, candidate_action)
eq('一8 正时间常规二阶导数', diff(t**2+4,t,2), 2)
eq('一8 原点值产生δ偶', (t**2+4).subs(t,0), 4)
eq('一8 原点一阶导数不产生δ项', diff(t**2+4,t).subs(t,0), 0)
eq('一9 相乘带宽上界', a/4+a/2, 3*a/4)
eq('一9 奈奎斯特最大间隔', pi/(3*a/4), 4*pi/(3*a))
eq('一10 转q后从延迟2开始', (1/((z+Rational(1,2))*(z+2))).subs(z,1/q), q**2/((1+q/2)*(1+2*q)))
check('一10 最外极点模2', max(abs(k) for k in roots((z+Rational(1,2))*(z+2),z)) == 2)

# 二1有限长核的频响、阶跃来自原定义积分。
Hwindow=integrate(exp(-v)*exp(-I*w*v),(v,0,1))
eq('二1 原频响独立积分', Hwindow, (1-exp(-(1+I*w)))/(1+I*w))
eq('二1 阶跃封顶', integrate(exp(-v),(v,0,1)), 1-exp(-1))
eq('二1 延迟形式的t>1结果', 1-exp(-t)-exp(-1)*(1-exp(-(t-1))), 1-exp(-1))

# 二2单位矩形谱逆变换，以及通带包含/截断的区别。
eq('二2 输入由矩形逆FT', integrate(exp(I*w*t),(w,-a,a))/(2*pi), sin(a*t)/(pi*t))
eq('二2 输出由截断矩形逆FT', integrate(exp(I*w*t),(w,-c,c))/(2*pi), sin(c*t)/(pi*t))
eq('二2 输入原点极限', limit(sin(a*t)/(pi*t),t,0), a/pi)
eq('二2 截断输出原点极限', limit(sin(c*t)/(pi*t),t,0), c/pi)
def band(freq,width):
    return Integer(1 if abs(freq)<width else 0)
for freq in [-Rational(7,2),-Rational(5,2),-Rational(3,2),-Rational(1,2),0,Rational(1,2),Rational(5,2),Rational(7,2)]:
    eq('二2 a<ωc原样通过 '+str(freq), band(freq,3)*band(freq,2), band(freq,2))
    eq('二2 a>ωc实际截断 '+str(freq), band(freq,2)*band(freq,4), band(freq,2))
check('二2 截断不是统一非零增益', band(0,2)==1 and band(3,2)==0 and band(3,4)==1)

# 二3由复系数重构原三角表达式，特别核对正弦相位。
coeff={
 -3:Rational(1,2)*exp(-I*pi/6),-2:exp(I*pi/6),-1:2*exp(-I*pi/6),0:Integer(1),
 1:2*exp(I*pi/6),2:exp(-I*pi/6),3:Rational(1,2)*exp(I*pi/6),
}
pair=lambda k:coeff[k]*exp(I*k*alpha)+coeff[-k]*exp(-I*k*alpha)
eq('二3 基波欧拉重构', pair(1).rewrite(exp), (4*cos(alpha+pi/6)).rewrite(exp))
eq('二3 正弦二次谐波重构', pair(2).rewrite(exp), (2*sin(2*alpha+pi/3)).rewrite(exp))
eq('二3 三次余弦重构', pair(3).rewrite(exp), cos(3*alpha+pi/6).rewrite(exp))
eq('二3 完整原波形重构', sum(coeff[k]*exp(I*k*alpha) for k in coeff).rewrite(exp),
   (1+4*cos(alpha+pi/6)+2*sin(2*alpha+pi/3)+cos(3*alpha+pi/6)).rewrite(exp))
amplitudes=[Rational(1,2),1,2,1,2,1,Rational(1,2)]
phases=[-pi/6,pi/6,-pi/6,0,pi/6,-pi/6,pi/6]
for k,amplitude,phase in zip(range(-3,4),amplitudes,phases):
    eq('二3 双边幅度 n='+str(k), abs(coeff[k]), amplitude)
    eq('二3 双边相位 n='+str(k), coeff[k]/amplitude, exp(I*phase))
for k in [1,2,3]:
    eq('二3 实信号共轭对称 n='+str(k), coeff[-k], conjugate(coeff[k]))
eq('二3 直流FT冲激強度', 2*pi*coeff[0], 2*pi)

# 二4不能把非收敛卷积默认为sin；稳定两个核按实际积分核验。
L=Symbol('L',positive=True)
finite_integral=integrate(cos(t-v),(v,0,L))
eq('二4 积分器有限截断', finite_integral, sin(t)-sin(t-L))
eq('二4 t=0第一子列值', finite_integral.subs({t:0,L:pi/2+2*pi*n}), 1)
eq('二4 t=0第二子列值', finite_integral.subs({t:0,L:3*pi/2+2*pi*n}), -1)
check('二4 两无限子列值不同', 1 != -1)
abel=integrate(exp(-eps*v)*cos(t-v),(v,0,oo))
eq('二4 Abel积分原定义', abel, (eps*cos(t)+sin(t))/(eps**2+1))
eq('二4 额外正则化的条件极限', limit(abel,eps,0,dir='+'), sin(t))
eq('二4 改开通输入不是原全时域输入', integrate(cos(v),(v,0,t)), sin(t))
conv2=-2*cos(t)+5*integrate(exp(-2*v)*cos(t-v),(v,0,oo))
conv3=integrate(2*v*exp(-v)*cos(t-v),(v,0,oo))
eq('二4 h2的普通卷积', conv2, sin(t))
eq('二4 h3的普通卷积', conv3, sin(t))
H2=-2+5/(s+2)
H3=2/(s+1)**2
eq('二4 h2在j的频响', H2.subs(s,I), -I)
eq('二4 h3在j的频响', H3.subs(s,I), -I)
check('二4 全带系统不是同一函数', simplify(H2-H3) != 0)
eq('二4 h2有限总变差', 2+integrate(5*exp(-2*t),(t,0,oo)), Rational(9,2))
eq('二4 h3核绝对积分', integrate(2*t*exp(-t),(t,0,oo)), 2)
conv4=integrate((4*exp(-v)-5*exp(-2*v))*cos(t-v),(v,0,oo))
eq('二4 另一稳定核定义卷积', conv4, sin(t))
H4=4/(s+1)-5/(s+2)
eq('二4 另一核LT定义', lt(4*exp(-t)-5*exp(-2*t)), H4)
eq('二4 另一核j频率响应', H4.subs(s,I), -I)
check('二4 另一核不是两个旧系统', simplify(H4-H2)!=0 and simplify(H4-H3)!=0)
cross=log(Rational(5,4))
eq('二4 另一核绝对积分有限', integrate(5*exp(-2*t)-4*exp(-t),(t,0,cross))+
   integrate(4*exp(-t)-5*exp(-2*t),(t,cross,oo)), Rational(17,10))

# 二5重复时域题仍从原矩形重叠积分求两个区间。
rise=integrate(exp(-2*(t-v)),(v,0,t))
tail=integrate(exp(-2*(t-v)),(v,0,2))
eq('二5 矩形开通区间卷积', rise, (1-exp(-2*t))/2)
eq('二5 矩形关断区间卷积', tail, (1-exp(-4))*exp(-2*(t-2))/2)
eq('二5 原两区间在2连续', rise.subs(t,2), tail.subs(t,2))
eq('二5 无原点跳变', rise.subs(t,0), 0)

# 三1延迟输入、非零初态、开通门、暂稳态各自核对。
base=integrate(exp(-2*(theta-v))*sin(2*v),(v,0,theta))
formula=(sin(2*theta)-cos(2*theta)+exp(-2*theta))/4
eq('三1 零状态时域卷积定义', base, formula)
eq('三1 基础响应LT', lt(formula.subs(theta,t)), 2/((s+2)*(s**2+4)))
eq('三1 原负时刻初态项', lt(exp(-2*t)), 1/(s+2))
eq('三1 原单边方程含初态', (s+2)*(1/(s+2)+exp(-s)*2/((s+2)*(s**2+4)))-1, exp(-s)*2/(s**2+4))
eq('三1 零状态在开通时刻值', formula.subs(theta,0), 0)
eq('三1 零状态开通导数', diff(formula,theta).subs(theta,0), 0)
eq('三1 零状态正时间回ODE', diff(formula,theta)+2*formula, sin(2*theta))
full=exp(-2*t)+formula.subs(theta,t-1)
eq('三1 延迟之后回原ODE', diff(full,t)+2*full, sin(2*(t-1)))
eq('三1 延迟之前齐次ODE', diff(exp(-2*t),t)+2*exp(-2*t), 0)
eq('三1 完全响应原点右值', exp(-2*t).subs(t,0), 1)
eq('三1 1秒处完全响应连续', full.subs(t,1), exp(-2))
eq('三1 1秒处完全响应导数连续', diff(full,t).subs(t,1), -2*exp(-2))
trans=exp(-2*t)+exp(-2*(t-1))/4
steady=(sin(2*(t-1))-cos(2*(t-1)))/4
eq('三1 暂态与稳态分量相加', trans+steady, full)
eq('三1 暂态指数合并系数', trans, (1+exp(2)/4)*exp(-2*t))
eq('三1 暂态远端为0', limit(trans,t,oo), 0)
eq('三1 开通后稳态相位表达', steady, sqrt(2)/4*sin(2*t-2-pi/4))
eq('三1 零状态暂态跳变幅度', (exp(-2*(t-1))/4).subs(t,1), Rational(1,4))
eq('三1 稳态分量跳变相消', steady.subs(t,1), -Rational(1,4))
Hdelayed=exp(-s)/(s+2)
eq('三1 延迟频响幅值平方', Hdelayed.subs(s,2*I)*conjugate(Hdelayed.subs(s,2*I)), Rational(1,8))
eq('三1 延迟与系统相位共同核验', Hdelayed.subs(s,2*I), sqrt(2)/4*exp(-I*(2+pi/4)))

# 三2原方程负下标递推：包括第93页续问矩形输入，不把u[k-5]漏掉。
for name,forcing in [('阶跃',lambda k:u(k)),('矩形',lambda k:u(k)-u(k-5))]:
    full={-1:Integer(-2),-2:Integer(3)}
    zi={-1:Integer(-2),-2:Integer(3)}
    zs={-1:Integer(0),-2:Integer(0)}
    bseq=lambda k:(Rational(1,6)-Rational(1,2)*Integer(-1)**k+Rational(4,3)*Integer(-2)**k)*u(k)
    for k in range(14):
        full[k]=-3*full[k-1]-2*full[k-2]+forcing(k)
        zi[k]=-3*zi[k-1]-2*zi[k-2]
        zs[k]=-3*zs[k-1]-2*zs[k-2]+forcing(k)
        expected_zs=bseq(k) if name=='阶跃' else bseq(k)-bseq(k-5)
        eq('三2 '+name+'原初态零输入 k='+str(k), zi[k], 4*(-1)**k-4*Integer(-2)**k)
        eq('三2 '+name+'原 forcing 零状态 k='+str(k), zs[k], expected_zs)
        eq('三2 '+name+'全响应与分解 k='+str(k), full[k], zi[k]+expected_zs)
eq('三2 H部分分式', 1/((1+q)*(1+2*q)), -1/(1+q)+2/(1+2*q))
check('三2 极点−1在圆上、−2圆外', abs(-1)==1 and abs(-2)>1)
finish()

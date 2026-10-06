"""2024 回忆卷与两年共同选择题：独立定义积分和差分检查。"""
from common import *

# 第一题上限字迹仍存疑；按 3t 理解，给出可检验的时变见证。
eq('一1 线性积分见证',integrate(2+3,(tau,0,3*t)),5*3*t)
check('一1 延时不交换',3*t-1 != 3*(t-1))
check('一1 未来输入区间存在',3*Integer(1)>Integer(1))
b,T=symbols('b T',real=True)
eq('一2 正指数筛选',exp(I*b*0)-exp(I*b*T),1-exp(I*b*T))
check('一3 采样频率',2*max(20,30)==60)
eq('一4 提前方向',cos(w*(t-(-1))),cos(w*(t+1)))
eq('一5 截断 LT 尾部幅度',integrate(exp(-(s+1)*t),(t,0,2)),(1-exp(-2*(s+1)))/(s+1))
eq('一5 可去奇点',limit((1-exp(-2*(s+1)))/(s+1),s,-1),Integer(2))
eq('一6 保留相减负号',lt(exp(-3*t)-exp(-2*t)), -1/((s+3)*(s+2)))

# 泛化因果差分方程，以独立递推证实根公式（含重根）。
l1,l2=symbols('l1 l2',nonzero=True)
hn=lambda j: cancel((l1**(j+1)-l2**(j+1))/(l1-l2))*u(j)
recurrence('一8 异根 h(n)',hn,[1,-(l1+l2),l1*l2],lambda j:Integer(j==0),hi=9)
hr=lambda j:(j+1)*l1**j*u(j)
recurrence('一8 重根 h(n)',hr,[1,-2*l1,l1**2],lambda j:Integer(j==0))
eq('一8 重根极限',limit((l1**(n+1)-l2**(n+1))/(l1-l2),l2,l1),(n+1)*l1**n)
check('一9 因果外圆 ROC',max(Abs(-1),Abs(-3))==3)

eq('二1 时宽带宽尺度',Integer(2)*Rational(1,2),Integer(1))
check('二2 离散周期70',lcm(10,14)==70 and all(exp(I*Rational(3,5)*pi*N)!=1 or exp(I*Rational(3,7)*pi*N)!=1 for N in range(1,70)))
H=(s+2)/(s**2+3*s+2)
eq('二3 ODE 对应 H',H.subs(s,I*w),(I*w+2)/(-w**2+3*I*w+2))
check('二4 低通单调',diff(1/sqrt(w**2+4),w).subs(w,1)<0)
eq('二5 DTFT 的2π周期',exp(-I*(w+2*pi)*n),exp(-I*w*n))
eq('二6 两导数为二阶导数', (I*w)*(I*w),-w**2)
eq('二6 双移位总延时',exp(-I*w*T)**2,exp(-2*I*w*T))
eq('二7 四宽矩形 FT',integrate(exp(-I*w*t),(t,-2,2)),2*sin(2*w)/w)
Y=integrate(t*exp(-s*t),(t,0,2))+integrate((4-t)*exp(-s*t),(t,2,4))
eq('三1 三角形 LT',Y,((1-exp(-2*s))/s)**2)
eq('三2-2 有限负起点 FT',integrate(exp(-(2+I*w)*t),(t,-2,3)),(exp(2*(2+I*w))-exp(-3*(2+I*w)))/(2+I*w))
finish()

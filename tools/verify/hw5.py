"""第 5 章抽样题：矩形、三角谱的逆变换及单位换算。"""
from common import *
a = Symbol('a', positive=True)
v = Symbol('v', real=True)
eq('5.2 Sa 的矩形谱逆积分', integrate(pi/a*exp(I*v*t),(v,-a,a))/(2*pi), sin(a*t)/(a*t))
tri = integrate(pi/a*(1+v/(2*a))*exp(I*v*t),(v,-2*a,0))+integrate(pi/a*(1-v/(2*a))*exp(I*v*t),(v,0,2*a))
eq('5.2 Sa 平方的三角谱逆积分', expand_complex(tri/(2*pi)), sin(a*t)**2/(a*t)**2)
for i, bandwidth, frequency, interval in [
    (1,50,50/pi,pi/50),
    (2,200,200/pi,pi/200),
    (3,max(50,100),100/pi,pi/100),
    (4,max(100,2*60),120/pi,pi/120),
]:
    eq('5.2('+str(i)+') Hz 换算', bandwidth/(2*pi)*2, frequency)
    eq('5.2('+str(i)+') 奈奎斯特间隔', 1/frequency, interval)
finish()

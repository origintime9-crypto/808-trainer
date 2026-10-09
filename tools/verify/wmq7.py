"""第7章：从定义、原递推、实际极点及复数有限序列独立复核ZT/DTFT。"""
from common import *

q, a, b, v = symbols('q a b v')
k = Symbol('k', integer=True)
ri = Symbol('ri', integer=True, nonnegative=True)
U = lambda index: S.One if index >= 0 else S.Zero
D = lambda index: S.One if index == 0 else S.Zero
def right(p, index):
    return S(p)**index if index >= 0 else S.Zero
def left(p, index):
    return -S(p)**index if index < 0 else S.Zero

# 7.2/5 从几何和及部分分式核对，不以同一有理式猜序列方向。
eq('7.2几何式转为z', (1/(1-q/2)).subs(q,1/z), z/(z-Rational(1,2)))
eq('7.2零点0',z.subs(z,0),0)
check('7.2实际极点1/2',roots(z-Rational(1,2),z)=={Rational(1,2)})
X5=-3*q/(2-5*q+2*q*q)
eq('7.5原有理式的部分分式',X5,1/(1-q/2)-1/(1-2*q))
check('7.5实际极点两种模',roots(2*z*z-5*z+2,z)=={Rational(1,2),S(2)})
seq5=[lambda i:right(Rational(1,2),i)-right(2,i),
      lambda i:left(Rational(1,2),i)-left(2,i),
      lambda i:right(Rational(1,2),i)-left(2,i)]
for case,fn in enumerate(seq5,1):
    recurrence('7.5('+str(case)+')原差分恒等式',fn,[2,-5,2],lambda i:-3*D(i-1))
for case,index,value in [(1,0,0),(1,1,-Rational(3,2)),(2,-1,-Rational(3,2)),(3,0,1),(3,-1,Rational(1,2))]:
    eq(f'7.5({case})实际两侧样值{index}',seq5[case-1](index),value)

# 7.6 因果初值/终值先检查实际未抵消极点，再用直接核验证极限。
X6=[(1+q+q*q)/((1-q)*(1-2*q)),1/((1-q/2)*(1+q/2)),q/(1-Rational(3,2)*q+q*q/2)]
closed6=[S.Half-3/(1-q)+Rational(7,2)/(1-2*q),
         S.Half/(1-q/2)+S.Half/(1+q/2),2/(1-q)-2/(1-q/2)]
for i,(original,closed) in enumerate(zip(X6,closed6),1):
    eq(f'7.6({i})独立部分分式',original,closed)
    eq(f'7.6({i})初值',limit(original,q,0),[1,1,0][i-1])
check('7.6(1)2处未抵消阻止终值定理',cancel(X6[0]).subs(q,Rational(1,2))==zoo)
check('7.6(1)渐增指数确无有限终值',limit(-3+Rational(7,2)*2**ri,ri,oo)==oo)
eq('7.6(2)偶数子序列', (Rational(1,2)**(2*ri)+(-Rational(1,2))**(2*ri))/2,Rational(1,4)**ri)
eq('7.6(2)奇数子序列', (Rational(1,2)**(2*ri+1)+(-Rational(1,2))**(2*ri+1))/2,0)
eq('7.6(2)偶数子序列极限0',limit(Rational(1,4)**ri,ri,oo),0)
eq('7.6(3)实际核终值',limit(2*(1-Rational(1,2)**ri),ri,oo),2)
for i in [1,2]:
    eq(f'7.6({i+1})终值定理的可用极限',limit((z-1)*X6[i].subs(q,1/z),z,1),[0,2][i-1])

# 7.7 直接定义卷积的上下限，包含原点、相等底数与零底数。
eq('7.7(1)双边H含原点',b/(b-z),1/(1-z/b))
eq('7.7(1)变换乘积及条件环域分式',z/(z-a)*b/(b-z),b/(b-a)*(z/(z-a)-z/(z-b)))
eq('7.7(1)a=0后实际ROC可含原点',cancel((z/(z-a)*b/(b-z)).subs(a,0)),b/(b-z))
for av,bv in [(1,2),(Rational(1,2),2),(-1,2),(0,2)]:
    for index in range(-3,4):
        lo=max(0,index)
        ratio=S(av)/bv
        direct=S(bv)**index*ratio**lo/(1-ratio)
        expected=S(bv)/(bv-av)*(right(av,index)+(S(bv)**index if index<0 else 0))
        eq(f'7.7(1)直接尾部几何和a={av},b={bv},n={index}',direct,expected)
check('7.7(1)比值模>=1时卷积项不衰减',abs(S(2)/2)>=1 and abs(S(3)/2)>1)
for av in [0,1,Rational(1,2),2]:
    for index in range(6):
        direct=sum(right(av,m)*D(index-m-2) for m in range(index+1))
        eq(f'7.7(2)直接样值卷积a={av},n={index}',direct,right(av,index-2))
        direct3=sum(right(av,m)*U(index-m-1) for m in range(index+1))
        if index<=0:closed=S.Zero
        elif av==1:closed=S(index)
        else:closed=(1-S(av)**index)/(1-S(av))
        eq(f'7.7(3)有限直接卷积a={av},n={index}',direct3,closed)
eq('7.7(3)z域乘积',(z/(z-a))/(z-1),z/((z-a)*(z-1)))

# 7.8 独立从实际递推计算样值；单边移位公式必须带过去初态。
y81=Rational(1,3)+Rational(2,3)*cos(2*pi*k/3)+4*sqrt(3)/3*sin(2*pi*k/3)
Y81=(z**3+2*z*z-2*z)/((z*z+z+1)*(z-1))
eq('7.8(1)原单边移位方程',(z*z+z+1)*Y81-z*z-3*z,z/(z-1))
ys81=[S(1),S(2)]
for index in range(2,11):ys81.append(1-ys81[-1]-ys81[-2])
for index,value in enumerate(ys81):eq(f'7.8(1)原递推n={index}',y81.subs(k,index),value)
eq('7.8(1)单边初值',limit(Y81,z,oo),1)
y82=Rational(250,27)+Rational(148,225)*(-Rational(1,5))**k-Rational(133,675)*Rational(1,10)**k
Y82=Rational(250,27)/(1-q)+Rational(148,225)/(1+q/5)-Rational(133,675)/(1-q/10)
eq('7.8(2)单边过去状态项',(1+q/10-q*q/50)*Y82,10/(1-q)-Rational(7,25)+2*q/25)
values82={-2:S(6),-1:S(4)}
for index in range(10):
    values82[index]=10-values82[index-1]/10+values82[index-2]/50
    eq(f'7.8(2)原递推n={index}',y82.subs(k,index),values82[index])
eq('7.8(2)首样值不能用近似系数',values82[0],Rational(243,25))
eq('7.8(2)次样值',values82[1],Rational(2277,250))
y83=S.Half+Rational(9,20)*Rational(9,10)**k
Y83=S.Half/(1-q)+Rational(9,20)/(1-Rational(9,10)*q)
eq('7.8(3)单边过去状态项',(1-Rational(9,10)*q)*Y83,Rational(1,20)/(1-q)+Rational(9,10))
last=S(1)
for index in range(9):
    last=Rational(9,10)*last+Rational(1,20)
    eq(f'7.8(3)原递推n={index}',y83.subs(k,index),last)
y84=Rational(13,9)*(-2)**k+k/3-Rational(4,9)
Y84=z*(z*z-3*z+3)/((z-1)**2*(z+2))
eq('7.8(4)单边有理式',Y84.subs(z,1/q),Rational(13,9)/(1+2*q)+q/(3*(1-q)**2)-Rational(4,9)/(1-q))
eq('7.8(4)原强迫递推',y84+2*y84.subs(k,k-1),k-2)
eq('7.8(4)给定初值',y84.subs(k,0),1)
eq('7.8(4)若原式含n=0的过去状态',y84.subs(k,-1),-Rational(3,2))
eq('7.8(4)−2极点分子不抵消', (z*(z*z-3*z+3)).subs(z,-2),-26)

# 7.9 每个合法ROC的核都回代原差分方程；频响存在性按单位圆而非形式代入。
H9=[z/(3*(z-2)),z**3/(z-1)**3,(z*z-3)/((z-2)*(z-3))]
eq('7.9(1)原差分方程H',(3-6/z)*H9[0],1)
eq('7.9(2)原三阶输出多项式',(1-3/z+3/z**2-1/z**3)*H9[1],1)
eq('7.9(3)原前馈反馈关系',(1-5/z+6/z**2)*H9[2],1-3/z**2)
for label,fn in [('右边',lambda i:right(2,i)/3),('左边',lambda i:left(2,i)/3)]:
    recurrence('7.9(1)'+label+'核原方程',fn,[3,-6],D)
for label,fn in [('右边',lambda i:S((i+1)*(i+2))/2*U(i)),('左边',lambda i:-S((i+1)*(i+2))/2*U(-i-1))]:
    recurrence('7.9(2)'+label+'三重极点核原方程',fn,[1,-3,3,-1],D)
h93=[lambda i:-D(i)/2-right(2,i)/2+2*right(3,i),
      lambda i:-D(i)/2-right(2,i)/2+2*left(3,i),
      lambda i:-D(i)/2-left(2,i)/2+2*left(3,i)]
for case,fn in enumerate(h93,1):recurrence(f'7.9(3)合法ROC分支{case}原方程',fn,[1,-5,6],lambda i:D(i)-3*D(i-2))
eq('7.9(3)含δ的部分分式',H9[2],-S.Half-z/(2*(z-2))+2*z/(z-3))
eq('7.9(3)因果核的两个等价写法',h93[0](0),1)
for index in range(-3,8):
    delayed=D(index)-(S(2)**(index-1)*U(index-1))+6*S(3)**(index-1)*U(index-1)
    eq(f'7.9(3)因果核等价延迟式n={index}',h93[0](index),delayed)
eq('7.9(3)原点不是零点',H9[2].subs(z,0),-S.Half)
check('7.9(2)原点和1分别是三重零极点',factor(H9[1])==z**3/(z-1)**3)
check('7.9(3)实际有限零点±sqrt3',roots(z*z-3,z)=={-sqrt(3),sqrt(3)})
eq('7.9(1)稳定左边核的绝对和',summation(Rational(1,3)/2**(ri+1),(ri,0,oo)),Rational(1,3))
eq('7.9(3)左边核两指数尾均可和',summation(Rational(1,2)/2**(ri+1)+2/3**(ri+1),(ri,0,oo)),Rational(3,2))
check('7.9两因果ROC均排除单位圆',not (1>2) and not (1>3))
check('7.9(2)两ROC均排除单位圆',not (1>1) and not (1<1))
eq('7.9(3)因果直接型−6反馈与−3前馈',(1-3*q*q)/(1-5*q+6*q*q),H9[2].subs(z,1/q))

# 7.10 题面有理式只含1/2和1，不能根据给出的边界2改写原题。
H10=1/((1-q/2)*(1-q))
eq('7.10原印出H分式',H10,-1/(1-q/2)+2/(1-q))
check('7.10实际极点1/2与1',roots((z-Rational(1,2))*(z-1),z)=={Rational(1,2),S.One})
check('7.10给定中间ROC内确实含极点1',Rational(1,2)<1<2)
check('7.10给定外侧是收敛子集而非最大域',S(3)>2 and Rational(3,2)>1 and not Rational(3,2)>2)
for label,fn in [('右边',lambda i:-right(Rational(1,2),i)+2*right(1,i)),
                 ('中间',lambda i:-right(Rational(1,2),i)+2*left(1,i)),
                 ('左边',lambda i:-left(Rational(1,2),i)+2*left(1,i))]:
    recurrence('7.10实际'+label+'核原H',fn,[1,-Rational(3,2),Rational(1,2)],D)
check('7.10(3)合法内侧ROC不包含单位圆',not(1<Rational(1,2)))

# 7.11 约分后实际极点；边界单位极点不满足BIBO。
denoms=[8*z*z-2*z-3,2*z*z+5*z+2,2*z*z+z-1,z*z-z+1]
nums=[z+2,8*(z*z-z-1),2*z-4,z*z+z]
expected_roots=[{-S.Half,Rational(3,4)},{-S.Half,-S(2)},{S.Half,-S.One},{(1+I*sqrt(3))/2,(1-I*sqrt(3))/2}]
for case,(denom,num,expected) in enumerate(zip(denoms,nums,expected_roots),1):
    check(f'7.11({case})实际全体复根',roots(denom,z)==expected)
    for pole in expected:check(f'7.11({case})极点{pole}未抵消',simplify(num.subs(z,pole))!=0)
eq('7.11(4)复根正模1',Abs((1+I*sqrt(3))/2),1)
check('7.11(4)原书实数根不是该多项式根',simplify(denoms[3].subs(z,(1+sqrt(3))/2))!=0)

# 7.15 完全相同任务的原方程/零态核，网页合并到已有手写19编号。
eq('7.15系统函数',(1+1/z)*(z/(z+1)),1)
recurrence('7.15(1)因果核',lambda i:right(-1,i),[1,1],D)
recurrence('7.15(1)反因果核',lambda i:left(-1,i),[1,1],D)
recurrence('7.15(2)零态全时间递推',lambda i:5*(1+(-1)**i)*U(i),[1,1],lambda i:10*U(i))
eq('7.15(2)Y分式',10/((1-q)*(1+q)),5/(1-q)+5/(1+q))

# 7.16/17 由有限几何多项式推无限和，检验收敛及频移符号。
r0,c0=symbols('r0 c0')
for N in [0,1,4,8]:
    eq(f'7.16指数定义有限和N={N}',sum((r0*q)**j for j in range(N+1)),(1-(r0*q)**(N+1))/(1-r0*q))
eq('7.16(3)固定负调制乘原指数的变换核',1/(1-r0*c0*q),sum((r0*c0*q)**j for j in range(6))+(r0*c0*q)**6/(1-r0*c0*q))
eq('7.16(4)两个复指数的半和',(1/(1-r0*c0*q)+1/(1-r0*q/c0))/2,
   (1-r0*(c0+1/c0)*q/2)/(1-r0*(c0+1/c0)*q+r0*r0*q*q))
eq('7.16(4)Ω0=0约分退化为指数',cancel(((1-r0*q)/(1-2*r0*q+r0*r0*q*q))),1/(1-r0*q))
for av in [0,Rational(1,2),-Rational(1,2),I/2]:
    check(f'7.17(2)a={av}绝对收敛条件',Abs(av)<1)
eq('7.17(2)a=0首项为1',1/(1-0*q),1)
for av in [1,-1,I,2]:check(f'7.17(2)a={av}项的模不趋0',Abs(av)>=1)
eq('7.16(1)移位δ唯一项',sum(D(index-3)*q**index for index in range(-5,6)),q**3)
eq('7.17(3)有限三样值Laurent多项式',q**(-1)/2+1+q/2,(q+1)**2/(2*q))
eq('7.17(3)原点频谱等于样值和',(q**(-1)/2+1+q/2).subs(q,1),2)
window=sum(q**index for index in range(-3,3))
eq('7.17(4)六点有限窗及相位',window,q**(-3)*(1-q**6)/(1-q))
eq('7.17(4)可去奇点q=1为6',limit(window,q,1),6)
for omega in [pi/3,pi/2,2*pi/3,-pi/2]:
    direct=window.subs(q,exp(-I*omega))
    closed=exp(I*omega/2)*sin(3*omega)/sin(omega/2)
    eq('7.17(4)相位正弦式Ω='+str(omega),direct,closed)

# 7.18 复数有限序列反例及Laurent多项式恒等式。
# q=e^(-jΩ)、v=e^(-jθ)。周期积分的1/(2π)对应选择v^0系数。
xx={-3:1+I,-2:2,-1:-I,0:3,1:1+2*I,2:-2,3:I,4:2-I}
yy={-2:I,0:2-I,1:-3,3:1+I}
X=sum(value*q**index for index,value in xx.items())
Y=sum(value*q**index for index,value in yy.items())
def periodic_integral(poly):return expand(poly).coeff(v,0)
eq('7.18(1)整数移位定义',sum(value*q**(index+3) for index,value in xx.items()),q**3*X)
conj_correct=sum(conjugate(value)*q**index for index,value in xx.items())
eq('7.18(2)共轭同时频率反转',conj_correct,sum(conjugate(value)*(1/q)**(-index) for index,value in xx.items()))
check('7.18(2)原书共轭不反转的反例',expand((-I*q)-(-I/q))!=0)
eq('7.18(3)时反转定义',sum(value*q**(-index) for index,value in xx.items()),X.subs(q,1/q))
conv={index:sum(xx.get(m,0)*yy.get(index-m,0) for m in xx) for index in range(-5,8)}
eq('7.18(4)直接有限卷积求DTFT',sum(value*q**index for index,value in conv.items()),X*Y)
product=sum(value*yy.get(index,0)*q**index for index,value in xx.items())
eq('7.18(5)周期积分及1/2π正交系数',periodic_integral(X.subs(q,v)*Y.subs(q,q/v)),product)
eq('7.18(6)频域求导的+j符号',q*diff(X,q),sum(index*value*q**index for index,value in xx.items()))
eq('7.18(7)抽取偶点及两个混叠副本',sum(value*v**index for index,value in xx.items() if index%2==0),(X.subs(q,v)+X.subs(q,-v))/2)
eq('7.18(8)平方只含X与X',periodic_integral(X.subs(q,v)*X.subs(q,q/v)),sum(value**2*q**index for index,value in xx.items()))
check('7.18(8)复杂平方不能换模平方',I**2==-1 and Abs(I)**2==1)
eq('7.18(9)插零不产生1/2幅度因子',sum(value*q**(2*index) for index,value in xx.items()),X.subs(q,q*q))
eq('7.18(9)π周期的有限序列检验',X.subs(q,(-q)**2),X.subs(q,q*q))

finish()

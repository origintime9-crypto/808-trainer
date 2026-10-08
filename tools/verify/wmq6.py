"""第6章补题：直接样值、有限求和、原递推和相关定义的独立复核。"""
from common import *

ni = Symbol('ni', integer=True)
ri = Symbol('ri', integer=True, nonnegative=True)
a, b = symbols('a b')
q = Symbol('q')
U = lambda value: S.One if value >= 0 else S.Zero
delta = lambda value: S.One if value == 0 else S.Zero
def vect(name, actual, expected):
    check(name, Matrix(actual) == Matrix(expected))

# 6.1 按定义计算两侧样值，尤其未乘u的三角序列不能默认右边序列。
funcs = [lambda k:Rational(1,2)**k*U(k), lambda k:-Rational(1,2)**(k+1)*U(-k),
 lambda k:2**(S(k)-1)*U(k-1),lambda k:S(k)*U(k),
 lambda k:cos(pi*k/5-pi/10),lambda k:Rational(5,6)**k*sin(pi*k/5)]
samples = [[(-2,0),(0,1),(1,Rational(1,2)),(3,Rational(1,8))],
 [(-3,-4),(-1,-1),(0,-Rational(1,2)),(1,0)],
 [(0,0),(1,1),(2,2),(5,16)],[(-1,0),(0,0),(1,1),(5,5)]]
for i, rows in enumerate(samples):
 for index, expected in rows:eq(f'6.1({i+1})定义样值n={index}',funcs[i](index),expected)
eq('6.1(5)双侧余弦原点',funcs[4](0),cos(pi/10))
eq('6.1(5)负下标也有值',funcs[4](-1),cos(3*pi/10))
eq('6.1(5)周期10',trigsimp(funcs[4](ni+10)-funcs[4](ni)),0)
eq('6.1(6)左侧负下标',funcs[5](-1),-Rational(6,5)*sin(pi/5))
eq('6.1(6)每隔5点为零',funcs[5](5*ni),0)
eq('6.1(6)周期正弦包络减半不构成周期',funcs[5](11)/funcs[5](1),Rational(5,6)**10)

# 6.3三个实际周期序列均使用非零叠加权重；结果基本周期小于最小公倍数。
seq1=[2,-Rational(3,2),Rational(1,2),0,Rational(1,2),-Rational(3,2)]
seq2=[-1,1];seq3=[1,-Rational(1,2),-Rational(1,2)]
seqsum=[seq1[k%6]+seq2[k%2]+seq3[k%3] for k in range(6)]
vect('6.3 非零权重叠加样值',seqsum,[2,-1,-1,2,-1,-1])
def fundamental(values):
 return next(d for d in range(1,len(values)+1) if all(values[k]==values[(k+d)%len(values)] for k in range(len(values))))
check('6.3 三输入基本周期6/2/3',tuple(map(fundamental,[seq1,seq2,seq3]))==(6,2,3))
check('6.3 结果基本周期3不是最小公倍数6',fundamental(seqsum)==3 and ilcm(6,2,3)==6)

# 6.5从有限多项式卷积求和，不除以a或b，包含零底数与相等底数。
for N in [0,1,3]:
 for r0 in range(7):
  direct=sum(a**k*b**(r0-k) for k in range(min(N,r0)+1))
  closed=(a**(r0+1)-b**(r0+1))/(a-b) if r0<N else b**(r0-N)*(a**(N+1)-b**(N+1))/(a-b)
  eq(f'6.5定义有限和N={N},r={r0}',direct,closed)
  equal=(min(N,r0)+1)*a**r0
  eq(f'6.5相等底数极限N={N},r={r0}',limit(closed,b,a),equal)
  for av,bv in [(0,2),(2,0),(0,0)]:
   zero_direct=sum(S(av)**k*S(bv)**(r0-k) for k in range(min(N,r0)+1))
   via=direct.subs({a:av,b:bv})
   eq(f'6.5零底数{av}/{bv}N={N},r={r0}',zero_direct,via)

# 6.8单位样值的实际支撑及绝对和。阶乘序列从n=0起定义。
eq('6.8(1)延迟2因果',sum(delta(k-2) for k in range(-5,0)),0)
vect('6.8(2)离散反向脉冲仍在正3',[delta(3-k) for k in range(-4,5)],[delta(k-3) for k in range(-4,5)])
check('6.8(3)负时间非零',U(4-(-1))==1)
check('6.8(3)左侧部分绝对和无界',limit(ri+5,ri,oo)==oo)
eq('6.8(4)包含零点的左指数绝对和',summation(Rational(1,3)**ri,(ri,0,oo)),Rational(3,2))
eq('6.8(5)有限指数实际绝对和',sum(2**k for k in range(3)),7)
eq('6.8(6)阶乘绝对和不是无穷',summation(1/factorial(ri),(ri,0,oo)),E)
check('6.8(6)阶乘尾项比值给收敛界',Rational(1,4)<Rational(1,2))

# 6.9根据原图两条加法支路和一个实际延时，直接检查冲激逐点响应。
for index in range(-3,10):eq(f'6.9原并联及一拍延时n={index}',U(index-1)+U(index-6),U((index-1))+U((index-1)-5))

# 6.10按算子顺序计算：B既不是LTI，δ响应不能推广为任意输入的卷积核。
h=lambda k:Rational(1,2)**k*U(k)
for index in [-2,-1,0,1,2,4]:
 ab=index*h(index);ba=sum(h(k)*(index-k)*delta(index-k) for k in range(max(0,index)+1))
 eq(f'6.10(1)B→A直接卷积n={index}',ba,0)
 eq(f'6.10(1)A→B直接乘时变因子n={index}',ab,index*Rational(1,2)**index*U(index))
eq('6.10(1)次序不同的n=1反例',h(1),Rational(1,2))
eq('6.10(2)全时间常数2通过A产生4',summation(2*Rational(1,2)**ri,(ri,0,oo)),4)
eq('6.10(2)右边开通常数的条件版本',sum(2*h(k) for k in range(4)),4*(1-Rational(1,2)**4))
eq('6.10(2)书中误加n不成立的原点',h(0)+2,3)
check('6.10(2)两个次序在零点不同',h(0)+2!=h(0)+4)

# 6.11存在的全时间输出可保留N，但因谐波被消除基本周期可以更短。
periodic=[S(1),-S(1)]
output=[periodic[k%2]+periodic[(k-1)%2] for k in range(6)]
vect('6.11一阶有限核可滤除周期2输入',output,[0]*6)
eq('6.11从零态开始的常数响应不必周期',S(2)-Rational(1,2),Rational(3,2))

# 6.12/13从实际一步账项、相邻最高点验证所写模型，不作为财务建议。
D,H=symbols('D H')
eq('6.12第一月先计息再偿还',100000*Rational(101,100)-D,101000-D)
eq('6.12第二月一致递推',Rational(101,100)*(101000-D)-D,102010-Rational(201,100)*D)
eq('6.13几何递推与初高',H/3**(ri+1)-H/3**ri/3,0)

# 6.14原递推的特征根和给定初态，分别按实际求解起点核对。
k=Symbol('k',integer=True)
y14a=-(-1)**k+2*(-2)**k
eq('6.14(1)原齐次方程',y14a.subs(k,k+2)+3*y14a.subs(k,k+1)+2*y14a,0)
eq('6.14(1)初态-1',y14a.subs(k,-1),0);eq('6.14(1)初态0',y14a.subs(k,0),1)
y14b=Rational(13,9)*(-2)**k+k/3-Rational(4,9)
eq('6.14(2)原递推n>=1',y14b+2*y14b.subs(k,k-1),k-2)
eq('6.14(2)初态0',y14b.subs(k,0),1);eq('6.14(2)若方程含n=0需推导负时间值',y14b.subs(k,-1),-Rational(3,2))

# 6.15保留两种不同初始化截点，不能把已受激的给定输出当作零输入初态。
book15=(Rational(11,16)*k*k-Rational(17,16)*k-Rational(1,8))*(-2)**k
opened15=(3*k*k-5*k)/4*(-2)**k
for expression,name in [(book15,'保留1/2/3初值的齐次分支'),(opened15,'u从0开通的分解分支')]:
 eq('6.15(1)'+name,expression.subs(k,k+3)+6*expression.subs(k,k+2)+12*expression.subs(k,k+1)+8*expression,0)
for index,expected in [(1,1),(2,2),(3,-23)]:eq(f'6.15(1)书中初始化n={index}',book15.subs(k,index),expected)
eq('6.15(1)原强迫方程推回y0',(-23+6*2+12*1+8*0),1)
eq('6.15(1)u0作用的y3必须减掉1',opened15.subs(k,3),-24)
eq('6.15(2)保留y0的齐次分支',5*Rational(6,5)**k-6*Rational(6,5)**(k-1),0)
eq('6.15(2)原方程推回y-1',(S(5)*1-10)/6,-Rational(5,6))
eq('6.15(2)从0开通的零输入实际y0',Rational(6,5)*(-Rational(5,6)),-1)

# 6.16独立从前馈δ+δ移位、原递推和实际卷积得h与零状态输出。
kernel=(3*2**k-2)
eq('6.16单位样值实验的H', (1+q)/(1-3*q+2*q*q),-2/(1-q)+3/(1-2*q))
for index in range(7):
 conv=sum((3*2**m-2)*2**(index-m) for m in range(index+1))
 closed=(3*index-1)*2**index+2
 eq(f'6.16(2)定义卷积n={index}',conv,closed)
 eq(f'6.16h回查两项实际激励n={index}',kernel.subs(k,index)-3*(kernel.subs(k,index-1) if index>=1 else 0)+2*(kernel.subs(k,index-2) if index>=2 else 0),delta(index)+delta(index-1))
zi_book=4-4*2**k;zi_at0=5-6*2**k
for expression in [zi_book,zi_at0]:eq('6.16两初始化分支均为齐次',expression-3*expression.subs(k,k-1)+2*expression.subs(k,k-2),0)
eq('6.16保留给定y0分支原点',zi_book.subs(k,0),0)
eq('6.16强迫从0开通全响应原点',zi_at0.subs(k,0)+1,0)
eq('6.16两分支负初态均保持2',zi_at0.subs(k,-1),2)
eq('6.16原强迫式给出负初态-2',zi_at0.subs(k,-2),Rational(7,2))
eq('6.16零状态第三样值回查22',(3*2-1)*2**2+2,22)

# 6.17原方程、两已给初始输出；6.18阶跃差分求h，正向回查重建方程。
y17=-2*2**k+Rational(5,2)*3**k+Rational(1,2)
eq('6.17原前向方程',y17.subs(k,k+2)-5*y17.subs(k,k+1)+6*y17,1)
eq('6.17初态0',y17.subs(k,0),1);eq('6.17初态1',y17.subs(k,1),4)
step18=lambda n0:(2**n0+3*5**n0+10)*U(n0)
for index in range(-2,8):eq(f'6.18(1)原阶跃逐点回查n={index}',step18(index)-7*step18(index-1)+10*step18(index-2),14*U(index)-85*U(index-1)+111*U(index-2))
for index in [0,1,9,10,11,13]:
 direct=sum((step18(m)-step18(m-1))*2*(U(index-m)-U(index-m-10)) for m in range(index+1))
 eq(f'6.18(2)真实幅度2矩形的直接卷积n={index}',direct,2*(step18(index)-step18(index-10)))

# 6.19/20按有限序列定义独立计算，相关不能直接照搬h*Rxx的方向。
finite_h={0:1,1:2,2:4};finite_x={0:1,2:-1}
conv=lambda left,right,index:sum(value*right.get(index-pos,0) for pos,value in left.items())
vect('6.19有限卷积全向量与正确负尾',[conv(finite_x,finite_h,index) for index in range(5)],[1,2,3,-2,-4])
xx={1:1,2:1,3:1};yy={-1:1,0:-1,1:1,2:-1}
corr=lambda left,right,index:sum(value*left.get(pos+index,0) for pos,value in right.items())
vect('6.20(1a)定义自相关',[corr(xx,xx,index) for index in range(-2,3)],[1,2,3,2,1])
vect('6.20(1b)定义交错自相关',[corr(yy,yy,index) for index in range(-3,4)],[-1,2,-3,4,-3,2,-1])
vect('6.20(2a)定义互相关',[corr(xx,yy,index) for index in range(-1,5)],[-1,0,-1,1,0,1])
for index in range(-5,6):eq(f'6.20(2b)定义反向互相关n={index}',corr(yy,xx,index),corr(xx,yy,-index))
for hh in [{1:1},{-2:2,1:-3,3:1}]:
 output={n0:conv(xx,hh,n0) for n0 in range(-5,8)}
 rxx={n0:corr(xx,xx,n0) for n0 in range(-4,5)}
 reversed_h={-n0:value for n0,value in hh.items()}
 for index in range(-5,6):eq(f'6.20(3)有限输入与独立卷积h={hh},n={index}',corr(xx,output,index),conv(rxx,reversed_h,index))
check('6.20(3)δ延迟核直接给出负延时互相关',corr({0:1},{1:1},-1)==1 and corr({0:1},{1:1},1)==0)
finish()

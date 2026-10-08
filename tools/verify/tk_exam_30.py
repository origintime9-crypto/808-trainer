"""课程30：按93–95页原条件独立复核，同题也重新核对，缺少ROC/完整初态显式验证。"""
from common import *
q=Symbol('q')
v=Symbol('v',real=True)

# 十填空：仿射偏置、分布筛选、原点箭头、指数系数及变换。
eq('一1 零输入仍为负一',2*0-1,-1)
check('一1 有界输入有界',max(abs(2*k-1) for k in range(-5,6))<=11)
eq('一2 筛选系数',cos(2*t).subs(t,0),1)
h={0:1,1:-1,2:2}
x={-1:1,0:2,1:-2,2:1}
conv={k:sum(h.get(j,0)*x.get(k-j,0) for j in range(3)) for k in range(-1,5)}
check('一3 原箭头卷积',list(conv.values())==[1,1,-2,7,-5,2])
eq('一3 多项式相乘保留下标',sum(x[k]*q**k for k in x)*sum(h[k]*q**k for k in h),sum(conv[k]*q**k for k in conv))
coeff={0:1,1:-Rational(1,2),-1:-Rational(1,2),3:-I/5,-3:I/5}
eq('一4 复级数重建',sum(c*exp(I*k*t) for k,c in coeff.items()),1-cos(t)+Rational(2,5)*sin(3*t))
eq('一5 欧拉分解与原信号',exp(-2*v)*(exp(I*100*v)+exp(-I*100*v))/2,exp(-2*v)*cos(100*v))
# 两指数实部都为−2，积分绝对收敛；去掉SymPy未自动消去的arg条件。
transform=integrate((exp((-2+I*(100-w))*v)+exp((-2-I*(100+w))*v))/2,(v,0,oo),conds='none')
eq('一5 原定义FT',transform,(2+I*w)/(10004-w**2+4*I*w))
formal=lambda a:exp(-a)*Heaviside(a)+Heaviside(-1-a)
eq('一6 两延时阶跃形式差',formal(t-1)-formal(t-2),exp(-(t-1))*Heaviside(t-1)-exp(-(t-2))*Heaviside(t-2)+Heaviside(-t)-Heaviside(1-t))
eq('一6 给定阶跃远负端基线',limit(formal(v),v,-oo),1)
a=Matrix([1,0]);b=Matrix([0,1])
inputs=[a+2*b,2*a+b,a+b]
outputs=[a+5*b,5*a+b,a+b]
check('一7 零状态叠加矛盾',outputs[0]+outputs[1]!=3*outputs[2])
check('一7 同初态组合输入',-2*inputs[0]+3*inputs[2]==a-b)
check('一7 同初态条件输出',-2*outputs[0]+3*outputs[2]==a-7*b)
eq('一8 稳定有理重复极点尾部',limit(t**2*exp(-t),t,oo),0)
eq('一9 平方使最高角频率翻倍',100+100,200)
eq('一9 奈奎斯特角频率',2*200,400)
eq('一10 延迟积分LT',lt((1-exp(-(t-2)))*Heaviside(t-2)),exp(-2*s)/(s*(s+1)))

# 二1 独立偶谱逆FT及指定谐波输出。
inverse=integrate((4-w)/2*cos(w*t),(w,2,4))/pi
candidate=(cos(2*t)-cos(4*t))/(2*pi*t**2)-sin(2*t)/(pi*t)
eq('二1 逆FT积分',inverse,candidate)
eq('二1 原点极限',limit(candidate,t,0),1/pi)
weights={0:1,1:Rational(3,5),3:Rational(2,5),5:Rational(1,5)}
gain=lambda freq:Rational(4-abs(freq),2) if 2<abs(freq)<4 else Integer(0)
eq('二1 指定全时域输出',sum(weights[f]*gain(f)*cos(f*t) for f in weights),cos(3*t)/5)

# 二2 同一零极点+h0，两ROC/增益确实都合法，不能默认因果。
H=(1+q**2)/(1-q**2)
eq('二2 部分分式',H,1/(1-q)+1/(1+q)-1)
check('二2 原零点',roots(z**2+1,z)=={I,-I})
check('二2 原极点',roots(z**2-1,z)=={-1,1})
right=lambda k:(1+Integer(-1)**k)*u(k)-(1 if k==0 else 0)
left=lambda k:(1+Integer(-1)**k)*u(-k-1)+(1 if k==0 else 0)
eq('二2 外ROC首值',right(0),1)
eq('二2 内ROC首值',left(0),1)
for k in range(-8,9):
    eq('二2 外ROC由H的原差分 k='+str(k),right(k)-right(k-2),Integer(k==0)+Integer(k==2))
    eq('二2 内ROC由负H的原差分 k='+str(k),left(k)-left(k-2),-Integer(k==0)-Integer(k==2))
check('二2 两候选不同',right(2)!=left(2) and right(-2)!=left(-2))
check('二2 内外核均不衰减',right(20)==2 and left(-20)==2)

# 二3 从每个区间台阶积分回算LT，不依赖网页的展开答案。
step=Symbol('step',integer=True,nonnegative=True)
segment=integrate((step+1)*exp(-s*t),(t,2*step,2*step+2))
eq('二3 每段独立LT积分',segment,(step+1)*(1-exp(-2*s))*exp(-2*step*s)/s)
check('二3 几何比指数为负保证其模小于一',(-2*s).is_negative is True)
ratio=Symbol('ratio')
# |ratio|<1时，对几何级数ratio/(1-ratio)求导给Σ(m+1)ratio^m。
weighted=(1-ratio)*diff(ratio/(1-ratio),ratio)/s
eq('二3 按几何级数导数求所有段LT',weighted.subs(ratio,exp(-2*s)),1/(s*(1-exp(-2*s))))
for k in range(6):
    eq('二3 半整数落点阶梯 '+str(k),sum(u(k-2*j) for j in range(6)),floor(Rational(k,2))+1)

# 二4 只在完整初态相反时推出H，独立卷积/非最小实际实现核对条件解。
X1=1/(1-q);X2=q/(2*(1-q)**2)
Y1=2/(1-q);Y2=q/(1-q)**2-1/(1-q)
conditionalH=cancel((Y1+Y2)/(X1+X2))
eq('二4 消去完整相反初态后的H',conditionalH,1/(1-q/2))
eq('二4 一阶原y[-1]无法再复现首样本',1+Rational(1,2)*1,Rational(3,2))
check('二4 一阶首值与原给2不一致',Rational(3,2)!=2)
for k in range(16):
    response=sum(Rational(1,2)**j*Rational(1,2)**(k-j) for j in range(k+1))
    eq('二4 条件零状态独立卷积 k='+str(k),response,(k+1)*Rational(1,2)**k)
A=diag(Rational(1,2),0);B=Matrix([1,0]);C=Matrix([[Rational(1,2),1]])
eq('二4 实际非最小实现H',(C*(z*eye(2)-A).inv()*B)[0]+1,1/(1-Rational(1,2)/z))
for initial,forcing,target,name in [
    (Matrix([4,-1]),lambda k:Integer(1),lambda k:Integer(2),'第一组'),
    (Matrix([-4,1]),lambda k:Rational(k,2),lambda k:Integer(k-1),'第二组')]:
    eq('二4 '+name+'上一拍实际输出',(C*initial)[0],1 if name=='第一组' else -1)
    state=A*initial
    for k in range(10):
        eq('二4 '+name+'全响应独立状态演化 k='+str(k),(C*state)[0]+forcing(k),target(k))
        state=A*state+B*forcing(k)

# 二5 与三2(4)状态实现由原系数独立回算。
A3=Matrix([[0,1,0],[0,0,1],[-1,-3,-2]])
B3=Matrix([0,0,1]);C3=Matrix([[1,0,1]])
eq('二5 三阶实现回算H',(C3*(s*eye(3)-A3).inv()*B3)[0],(s**2+1)/(s**3+2*s**2+3*s+1))

# 三1 输入只限±ω1，复制权重及倒数补偿。
W,T=symbols('W T',positive=True)
H1=lambda freq:1-Abs(freq)/(2*W)
eq('三1 输入带边缘内侧增益',H1(W),Rational(1,2))
eq('三1 复制增益与恢复补偿相乘',(H1(w)/T)*(T/H1(w)),1)
eq('三1 临界间隔对应中心间隔',(2*pi/T).subs(T,pi/W),2*W)
eq('三1 中心恢复增益',T/H1(0),T)
eq('三1 输入带边缘恢复增益',T/H1(W),2*T)
check('三1 示例截止在设计间隔',1<2<4-1)

# 三2 从图直接反馈及原初态递推，不使用错误旧参考答案。
Den=1-3*q+2*q**2;Hz=(1+4*q)/Den
eq('三2 H的部分分式',Hz,-5/(1-q)+6/(1-2*q))
eq('三2 初态分子部分分式',(-7+2*q)/Den,5/(1-q)-12/(1-2*q))
eq('三2 零状态部分分式',Hz/(1-4*q),Rational(5,3)/(1-q)-6/(1-2*q)+Rational(16,3)/(1-4*q))
zi={-1:Integer(-1),-2:Integer(2)}
zs={-1:Integer(0),-2:Integer(0)}
full={-1:Integer(-1),-2:Integer(2)}
forcing=lambda k:Integer(4)**k*u(k)
for k in range(16):
    zi[k]=3*zi[k-1]-2*zi[k-2]
    zs[k]=3*zs[k-1]-2*zs[k-2]+forcing(k)+4*forcing(k-1)
    full[k]=3*full[k-1]-2*full[k-2]+forcing(k)+4*forcing(k-1)
    eq('三2 原递推零输入 k='+str(k),zi[k],5-12*Integer(2)**k)
    eq('三2 原递推零状态 k='+str(k),zs[k],Rational(5,3)-6*Integer(2)**k+Rational(16,3)*Integer(4)**k)
    eq('三2 原递推全响应 k='+str(k),full[k],Rational(20,3)-18*Integer(2)**k+Rational(16,3)*Integer(4)**k)
A2=Matrix([[0,1],[-2,3]]);B2=Matrix([0,1]);C2=Matrix([[-2,7]])
eq('三2 按原图标签状态回算',(C2*(z*eye(2)-A2).inv()*B2)[0]+1,Hz.subs(q,1/z))
finish()

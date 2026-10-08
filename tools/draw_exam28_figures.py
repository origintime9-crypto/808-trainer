"""课程28：从原资料裁题图，按独立解绘图；矩形宽度、单位圆重数和基本单元增益明确标注。"""
from pathlib import Path
from math import cos, sin, sqrt, pi, exp
from PIL import Image
from figure_svg import start, label, line, polyline, save
root=Path(__file__).resolve().parents[1]
folder=root/'public/figures/tk-exam-28'
folder.mkdir(parents=True, exist_ok=True)
page=Image.open(root/'work/pages/tk-exams/p90.png')
page.crop((335,747,1037,955)).save(folder/'q2-3.png', optimize=True)
page.crop((126,1168,1255,1278)).save(folder/'q3-1.png', optimize=True)

p=start(height=484,title='矩形输入与一阶因果LTI时域输出：先上升，t=2之后指数衰减')
label(p,360,30,'x(t)=u(t)−u(t−2)，零状态时域输出',23)
mx=lambda value:137+98*value
def panel(base,title,scale):
    line(p,f'M62 {base}H690',arrow=True)
    line(p,f'M137 {base+15}V{base-99}',arrow=True)
    label(p,81,base-86,title,21)
    for value in range(6):
        line(p,f'M{mx(value)} {base}V{base+5}')
        label(p,mx(value)-10 if value==0 else mx(value),base+29,str(value),19)
    label(p,685,base+30,'t',19)
panel(167,'x(t)',90)
polyline(p,[(mx(-.55),167),(mx(0),167),(mx(0),77),(mx(2),77),(mx(2),167),(mx(5.2),167)])
label(p,121,84,'1',19,'end')
panel(371,'y(t)',160)
points=[(mx(-.55),371),(mx(0),371)]
for i in range(261):
    value=i/50
    result=(1-exp(-2*value))/2 if value<=2 else (1-exp(-4))*exp(-2*(value-2))/2
    points.append((mx(value),371-160*result))
polyline(p,points)
line(p,f'M{mx(2)} 371V{371-80*(1-exp(-4))}',dash=True)
label(p,421,275,'峰值(1−e⁻⁴)/2≈0.491',20)
label(p,119,296,'1/2',19,'end')
label(p,360,453,'输入t=2关断；输出连续并向0衰减',21)
save(folder/'a2-1.svg',p)

p=start(height=369,title='右边序列：每八项四个1四个0，负下标均为0')
label(p,360,30,'x[n]：四个1、四个0的右边序列',23)
mx=lambda value:131+25.5*value
line(p,'M50 235H690',arrow=True)
line(p,'M131 254V74',arrow=True)
for k in range(-2,21):
    value=1 if k>=0 and (k//4)%2==0 else 0
    if value: line(p,f'M{mx(k)} 235V119','#0f766e',2)
    p.append(f'<circle cx="{mx(k)}" cy="{235-116*value}" r="4" fill="#0f766e"/>')
    if k in [-2,0,3,4,7,8,11,12,15,16,19,20]:
        label(p,mx(k)-8 if k==0 else mx(k),265,str(k).replace('-','−'),18)
label(p,114,125,'1',20,'end')
label(p,685,288,'n',20)
label(p,360,319,'u[0]=1；x[0..3]=1、x[4..7]=0',20)
label(p,360,349,'正时间尾部重复，整条序列不是周期序列',20)
save(folder/'a2-2a.svg',p)

def pole_zero(name,title,zeros,poles,caption,radius=1):
    p=start(height=394,title=title)
    label(p,360,29,title,22)
    cx,cy,scale=295,204,130
    line(p,'M55 204H676',arrow=True)
    line(p,'M295 348V49',arrow=True)
    p.append(f'<circle cx="{cx}" cy="{cy}" r="{scale}" fill="none" stroke="#94a3b8" stroke-dasharray="4 4"/>')
    label(p,678,229,'Re z',18)
    label(p,327,60,'Im z',18)
    for point,multiplicity in zeros:
        px,py=cx+scale*point.real,cy-scale*point.imag
        p.append(f'<circle cx="{px}" cy="{py}" r="6" fill="white" stroke="#0f766e" stroke-width="2.5"/>')
        if multiplicity>1: label(p,px+21,py+26,str(multiplicity)+'重',19)
    for point in poles:
        px,py=cx+scale*point.real,cy-scale*point.imag
        line(p,f'M{px-6} {py-6}L{px+6} {py+6}M{px-6} {py+6}L{px+6} {py-6}','#b45309',2.5)
    for value in [-1,1,2]:
        line(p,f'M{cx+scale*value} 204V210')
        label(p,cx+scale*value,233,str(value).replace('-','−'),18)
    label(p,512,62,'○ 零点   × 极点',19)
    label(p,505,92,'ROC：|z|>'+str(radius),19)
    label(p,360,371,caption,19)
    save(folder/name,p)
pole_zero('a2-2b.svg','X(z)：原点五重零、单位圆五个极点',
          [(0j,5)],[1+0j]+[complex(cos((2*m+1)*pi/4),sin((2*m+1)*pi/4)) for m in range(4)],
          '极点1及eʲ⁽²ᵐ⁺¹⁾π/4；外侧ROC不含单位圆',1)
pole_zero('a3-1-1.svg','H(z)：零点0、2，极点±1/2',
          [(0j,1),(2+0j,1)],[.5+0j,-.5+0j],
          '虚线是单位圆；实际极点模1/2，因果系统稳定',.5)

p=start(height=376,title='有限长指数核的阶跃响应：t=1以后为1−e⁻¹')
label(p,360,30,'s(t)：t=1后保持1−e⁻¹',23)
mx=lambda value:163+149*value
my=lambda value:268-205*value
line(p,'M62 268H690',arrow=True)
line(p,'M163 286V79',arrow=True)
polyline(p,[(mx(-.55),my(0)),(mx(0),my(0))]+[(mx(k/100),my(1-exp(-k/100))) for k in range(101)]+[(mx(3.3),my(1-exp(-1)))])
line(p,f'M163 {my(1-exp(-1))}H{mx(1)}',dash=True)
line(p,f'M{mx(1)} 268V{my(1-exp(-1))}',dash=True)
for value in [0,1,2,3]: label(p,mx(value)-9 if value==0 else mx(value),299,str(value),20)
label(p,148,my(1-exp(-1))+7,'1−e⁻¹',20,'end')
label(p,685,300,'t',20)
label(p,360,347,'阶跃终值等于核面积与H(0)',21)
save(folder/'a2-5.svg',p)

p=start(height=387,title='数字滤波器幅频4/√(5+4cosΩ)，主周期高通型')
label(p,360,31,'|H(eʲΩ)|=4/√(5+4cosΩ)',23)
mx=lambda value:71+(value+2)*145
my=lambda value:287-48*value
line(p,'M50 287H690',arrow=True)
line(p,'M361 305V65',arrow=True)
polyline(p,[(mx(-2+k/100),my(4/sqrt(5+4*cos((-2+k/100)*pi)))) for k in range(401)])
for value in [-2,-1,0,1,2]:
    line(p,f'M{mx(value)} 287V293')
    label(p,mx(value)-11 if value==0 else mx(value),317,str(value).replace('-','−'),19)
label(p,347,my(4)+6,'4',20,'end')
label(p,347,my(4/3)+7,'4/3',20,'end')
label(p,659,339,'Ω/π',19)
label(p,360,368,'2π周期；整个H非全通、非最小相位',20)
save(folder/'a3-1-2.svg',p)

p=start(height=486,title='级联基本单元：两个延时器，反馈+1/2、前馈−2及反馈−1/2')
label(p,360,29,'级联实现：两个延时器',23)
def box(x,y,value,width=58):
    p.append(f'<rect x="{x-width/2}" y="{y-20}" width="{width}" height="40" fill="white" stroke="#334155" stroke-width="1.7"/>')
    label(p,x,y+7,value,20)
def summer(x,y):
    p.append(f'<circle cx="{x}" cy="{y}" r="18" fill="white" stroke="#334155" stroke-width="1.7"/>')
    label(p,x,y+7,'Σ',21)
for x in [151,379,554]:summer(x,122)
line(p,'M43 122H132',arrow=True);label(p,54,100,'x[n]',20)
line(p,'M169 122H360',arrow=True);label(p,242,100,'v[n]',20)
line(p,'M397 122H535',arrow=True);label(p,464,100,'w[n]',20)
line(p,'M572 122H689',arrow=True);label(p,644,100,'y[n]',20)
p.append('<circle cx="272" cy="122" r="3" fill="#334155"/>')
line(p,'M272 122V205',arrow=True);box(272,226,'z⁻¹')
line(p,'M272 246V285H229',arrow=True);box(200,285,'+1/2')
line(p,'M171 285H151V141',arrow=True)
p.append('<circle cx="272" cy="285" r="3" fill="#334155"/>')
line(p,'M272 285H321',arrow=True);box(350,285,'−2')
line(p,'M379 285V141',arrow=True)
p.append('<circle cx="645" cy="122" r="3" fill="#334155"/>')
line(p,'M645 122V205',arrow=True);box(645,226,'z⁻¹')
line(p,'M645 246V285H603',arrow=True);box(574,285,'−1/2')
line(p,'M545 285H515V170H554V141',arrow=True)
label(p,272,330,'存v[n−1]',19)
label(p,645,330,'存y[n−1]',19)
label(p,360,377,'v=x+(1/2)v[-1]；w=v−2v[-1]',20)
label(p,360,412,'y=w−(1/2)y[-1]；增益符号只算一次',20)
label(p,360,451,'零初态回算H=(1−2q)/[(1−q/2)(1+q/2)]',19)
save(folder/'a3-1-3.svg',p)
print('课程28：2幅原题PNG、7幅答案SVG已生成。')

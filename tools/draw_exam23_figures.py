"""课程23：原无阶跃核、指定状态与常量输入；开关波、幅相谱、三积分器。"""
from pathlib import Path
from math import sin,pi
from PIL import Image
from figure_svg import start,label,line,polyline,save
root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-23'
folder.mkdir(parents=True,exist_ok=True)
for page,box,name in [
 (80,(344,119,1041,311),'q2-3.png'),
 (79,(400,1610,763,1682),'q2-3-formula.png'),
 (80,(492,807,891,937),'q3-1.png'),
 (80,(363,1073,1026,1267),'q3-2.png'),
 (80,(298,1354,765,1405),'q3-2-input.png'),
]:
 Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name,optimize=True)

def circle(p,x,y,filled=False,radius=4):
 p.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="'+('#0f766e' if filled else 'white')+'" stroke="#0f766e" stroke-width="2"/>')
def box(p,x,y,width,height,text):
 p.append(f'<rect x="{x}" y="{y}" width="{width}" height="{height}" rx="3" fill="#f0fdfa" stroke="#0f766e" stroke-width="1.8"/>')
 label(p,x+width/2,y+height/2+8,text,22)

p=start(height=351,title='课程23一3：原LT的因果开关区间，不是累计斜坡')
label(p,360,29,'f=Σ(−1)ⁿu(t−n)：每两秒的开关波段',22)
mx=lambda t:88+87*t
my=lambda a:241-126*a
line(p,'M42 241H690',arrow=True)
line(p,'M88 265V79',arrow=True)
polyline(p,[(43,241),(88,241)])
for k in range(7):
 value=1 if k%2==0 else 0
 polyline(p,[(mx(k),my(value)),(mx(min(k+1,6.7)),my(value))])
 circle(p,mx(k),my(value))
 if k<6:circle(p,mx(k+1),my(value))
 line(p,f'M{mx(k)} 241V115','#94a3b8',1.2,dash=True)
 label(p,mx(k)-11 if k==0 else mx(k),271,str(k),19)
label(p,67,121,'1',20,'end')
label(p,119,88,'f(t)',20)
label(p,689,271,'t',20)
label(p,360,314,'开圈不规定跳点；t<0按因果扩展为0',19)
label(p,360,341,'2m<t<2m+1为1，下一秒为0；m≥0',19)
save(folder/'a1-3.svg',p)

p=start(height=704,title='课程23二1：自卷积的平方sinc幅度谱和相位延拓')
label(p,360,29,'|G|=4(sin ω/ω)²；G(0)=4，旁瓣无限延伸',22)
mx=lambda x:360+95*x
my=lambda a:255-40*a
line(p,'M45 255H686',arrow=True)
line(p,'M360 280V66',arrow=True)
polyline(p,[(mx(x),my(4 if abs(x)<1e-10 else 4*(sin(pi*x)/(pi*x))**2)) for x in [-3.2+6.4*i/320 for i in range(321)]])
for x in [-3,-2,-1,0,1,2,3]:label(p,mx(x)-12 if x==0 else mx(x),284,str(x).replace('-','−'),18)
label(p,340,101,'4',19,'end')
label(p,390,77,'|G|',20)
label(p,679,310,'ω/π',20)
label(p,360,333,'非零频谱处 φ=−2ω（模2π）；谱零点未定义',20)
line(p,'M45 496H686',arrow=True)
line(p,'M360 651V360',arrow=True)
my=lambda phase_over_pi:496-22*phase_over_pi
polyline(p,[(mx(-3.2),my(6.4)),(mx(3.2),my(-6.4))])
for x in [-3,-2,-1,1,2,3]:circle(p,mx(x),my(-2*x))
for x in [-3,-2,-1,0,1,2,3]:label(p,mx(x)-12 if x==0 else mx(x),524,str(x).replace('-','−'),18)
label(p,338,370,'+6',19,'end')
label(p,338,635,'−6',19,'end')
label(p,397,379,'φ/π',20)
label(p,680,550,'ω/π',20)
label(p,360,674,'相位图取延拓分支；非零整数ω/π处画开圈',19)
label(p,360,698,'ω=0的谱值为4，相位0，可去点不画开圈',19)
save(folder/'a2-1.svg',p)

p=start(height=755,title='课程23三1：指定λ状态的三积分器框图，a非零')
label(p,360,29,'指定状态实现：反馈来自 λ₁；a≠0',22)
line(p,'M360 51V78',arrow=True)
label(p,402,65,'x(t)',21)
for sy,iy,oy,state,gain in [(96,137,211,'λ₃','−d/a'),(267,308,382,'λ₂','−c/a'),(438,479,553,'λ₁','−b/a')]:
 p.append(f'<circle cx="360" cy="{sy}" r="16" fill="white" stroke="#334155" stroke-width="1.8"/>')
 label(p,360,sy+7,'+',22)
 line(p,f'M360 {sy+16}V{iy-4}',arrow=True)
 box(p,319,iy,82,49,'1/s')
 line(p,f'M360 {iy+49}V{oy}','#0f766e',2)
 circle(p,360,oy,True,3)
 label(p,416,oy+7,state,23)
 if state!='λ₁':line(p,f'M360 {oy}V{sy+171-18}',arrow=True)
 box(p,208,sy-21,70,42,gain)
 line(p,f'M170 {sy}H205',arrow=True)
 line(p,f'M278 {sy}H341',arrow=True)
line(p,'M360 553H170V96')
line(p,'M360 553V590',arrow=True)
box(p,326,594,68,44,'1/a')
line(p,'M360 638V681',arrow=True)
label(p,408,676,'y(t)',22)
label(p,360,717,'λ̇₃=x−(d/a)λ₁，λ̇₂=λ₃−(c/a)λ₁',19)
label(p,360,738,'λ̇₁=λ₂−(b/a)λ₁；输出 y=λ₁/a',19)
save(folder/'a3-1.svg',p)
print('课程23题图完成：五幅原图局部、三幅独立答案SVG。')

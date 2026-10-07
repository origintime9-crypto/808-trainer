"""课程21：移动积分限、负支路原图，输出窗及复合频响。"""
from pathlib import Path
from math import sin, pi
from PIL import Image
from figure_svg import start, label, line, polyline, save

root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-21'
folder.mkdir(parents=True,exist_ok=True)
for page,box,name in [
 (75,(307,1151,541,1227),'q2-1.png'),
 (76,(351,788,1030,967),'q3-1.png'),
]:
 Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name,optimize=True)

def circle(parts,x,y,radius=4):
 parts.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="white" stroke="#0f766e" stroke-width="2"/>')

p=start(height=407,title='课程21二1：移动积分窗延时相减后为正负两个矩形')
label(p,360,29,'y=f(t)−f(t−2)：两个分离的矩形平台',22)
label(p,360,56,'原输入仅1<t<5为1，3<t<5重叠相消',19)
mx=lambda t:92+75*t
my=lambda y:207-101*y
line(p,'M47 207H690',arrow=True)
line(p,'M92 338V77',arrow=True)
for segment in [[(.05,0),(1,0)],[(1,1),(3,1)],[(3,0),(5,0)],[(5,-1),(7,-1)],[(7,0),(7.8,0)]]:
 polyline(p,[(mx(t),my(y)) for t,y in segment])
for t,amp in [(1,1),(3,1),(5,-1),(7,-1)]:
 line(p,f'M{mx(t)} 207V{my(amp)}','#94a3b8',1.5,dash=True)
 circle(p,mx(t),my(amp)); circle(p,mx(t),207)
for t in [0,1,3,5,7]: label(p,mx(t)-11 if t==0 else mx(t),232,str(t),19)
label(p,72,111,'1',19,'end')
label(p,72,315,'−1',19,'end')
label(p,127,84,'y(t)',20)
label(p,682,233,'t',20)
label(p,360,369,'开圈不指定跳点值，端点依所用u(0)约定',19)
label(p,360,394,'1<t<3为+1；5<t<7为−1；其他非端点为0',18)
save(folder/'a2-1.svg',p)

p=start(height=564,title='课程21三1：半增益低通与延时相减的幅度和相位')
label(p,360,28,'|H|=|sin(πω/2)|（|ω|<2），带外0',22)
mx=lambda w:360+126*w
my=lambda a:241-144*a
line(p,'M47 241H690',arrow=True)
line(p,'M360 267V71',arrow=True)
polyline(p,[(51,241),(mx(-2),241)])
polyline(p,[(mx(-2+4*i/240),my(abs(sin(pi*(-2+4*i/240)/2)))) for i in range(241)])
polyline(p,[(mx(2),241),(677,241)])
for w in [-2,-1,0,1,2]: label(p,mx(w)-12 if w==0 else mx(w),271,str(w).replace('-','−'),18)
label(p,338,103,'1',19)
label(p,386,85,'|H|',20)
label(p,684,271,'ω',20)
label(p,360,308,'相位取主值；ω=0、±2以及带外未定义',20)
py=lambda angle:426-68*angle/(pi/2)
line(p,'M48 426H689',arrow=True)
line(p,'M360 529V330',arrow=True)
polyline(p,[(mx(-2),py(pi/2)),(mx(0),py(-pi/2))])
polyline(p,[(mx(0),py(pi/2)),(mx(2),py(-pi/2))])
for w,phase in [(-2,pi/2),(0,-pi/2),(0,pi/2),(2,-pi/2)]: circle(p,mx(w),py(phase))
for w in [-2,-1,0,1,2]: label(p,mx(w)-12 if w==0 else mx(w),451,str(w).replace('-','−'),18)
label(p,335,364,'π/2',18,'end')
label(p,335,499,'−π/2',18,'end')
label(p,393,344,'∠H',20)
label(p,683,451,'ω',20)
label(p,360,550,'负半带−π/2−πω/2；正半带π/2−πω/2',18)
save(folder/'a3-1.svg',p)
print('课程21题图完成：两幅原图局部、两幅独立答案SVG。')

"""课程22：保留原冲激偶、积分限与图示；独立绘制延时样值及主值频响。"""
from pathlib import Path
from PIL import Image
from figure_svg import start, label, line, polyline, save

root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-22'
folder.mkdir(parents=True,exist_ok=True)
for page,box,name in [
 (77,(347,928,630,978),'q1-6.png'),
 (77,(516,1355,865,1554),'q2-1.png'),
 (77,(540,1594,848,1660),'q2-2.png'),
 (78,(479,409,916,607),'q2-4.png'),
 (78,(479,734,921,970),'q2-5.png'),
 (78,(312,1062,1065,1317),'q3-1.png'),
]:
 Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name,optimize=True)

def circle(parts,x,y,filled=False,radius=4):
 parts.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="'+('#0f766e' if filled else 'white')+'" stroke="#0f766e" stroke-width="2"/>')

p=start(height=613,title='课程22三1：三延时正反馈的冲激与阶跃样值，均延后一拍')
label(p,360,28,'原图：两拍正反馈，第一与第三延时相加',22)
label(p,360,59,'h[k]：首奇拍1，之后奇拍2，偶拍0',21)
mx=lambda k:105+73*k
my=lambda value:243-65*value
line(p,'M57 243H681',arrow=True)
line(p,'M105 266V86',arrow=True)
for k,value in enumerate([0,1,0,2,0,2,0,2]):
 if value: line(p,f'M{mx(k)} 243V{my(value)}','#0f766e',2.7)
 circle(p,mx(k),my(value),True)
 if value: label(p,mx(k),my(value)-12,str(value),18)
 label(p,mx(k)-11 if k==0 else mx(k),273,str(k),18)
label(p,126,94,'h[k]',20)
label(p,687,272,'k',20)
label(p,360,314,'阶跃输出：0、1、1、3、3、5、5、7…',22)
my=lambda value:525-22*value
line(p,'M57 525H681',arrow=True)
line(p,'M105 549V352',arrow=True)
for k,value in enumerate([0,1,1,3,3,5,5,7]):
 if value: line(p,f'M{mx(k)} 525V{my(value)}','#0f766e',2.7)
 circle(p,mx(k),my(value),True)
 if value: label(p,mx(k),my(value)-12,str(value),18)
 label(p,mx(k)-11 if k==0 else mx(k),555,str(k),18)
label(p,127,360,'y[k]',20)
label(p,687,555,'k',20)
label(p,360,591,'h[0]=y[0]=0；所有负下标均0，无输入直通',19)
save(folder/'a3-1.svg',p)

p=start(height=560,title='课程22三2：希尔伯特主值频响，正频率负九十度')
label(p,360,29,'H(jω)=−j sgn ω：非零频率幅度1',22)
line(p,'M48 239H689',arrow=True)
line(p,'M360 268V70',arrow=True)
polyline(p,[(59,112),(360,112)])
polyline(p,[(360,112),(667,112)])
circle(p,360,112)
circle(p,360,239,True)
label(p,337,117,'1',19,'end')
label(p,343,268,'0',19,'end')
label(p,390,87,'|H|',20)
label(p,682,267,'ω',20)
label(p,174,155,'ω<0',20)
label(p,545,155,'ω>0',20)
label(p,360,301,'原点按 H(0)=0；原点相位未定义',21)
line(p,'M48 442H689',arrow=True)
line(p,'M360 526V331',arrow=True)
polyline(p,[(59,377),(360,377)])
polyline(p,[(360,507),(667,507)])
circle(p,360,377)
circle(p,360,507)
label(p,332,361,'+π/2',19,'end')
label(p,337,526,'−π/2',19,'end')
label(p,343,470,'0',19,'end')
label(p,394,344,'∠H',20)
label(p,682,470,'ω',20)
label(p,360,550,'负频率 +π/2；正频率 −π/2，不连接原点跳变',19)
save(folder/'a3-2.svg',p)
print('课程22题图完成：六幅原图局部、两幅独立答案SVG。')

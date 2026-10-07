"""原卷未编号第19套：原图分裁、冲激反缩放、单边幅相与π高梯形。"""
from pathlib import Path
from PIL import Image
from figure_svg import start,label,line,polyline,save

root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-19'
folder.mkdir(parents=True,exist_ok=True)
for page,box,name in [
    (71,(324,357,609,587),'q1-3a.png'),
    (71,(795,345,1094,557),'q1-3b.png'),
    (71,(238,855,650,950),'q1-7.png'),
    (71,(505,1290,878,1596),'q2-1.png'),
    (72,(559,108,817,300),'q2-2.png'),
    (72,(515,853,879,1084),'q3-1.png'),
    (72,(493,1240,918,1519),'q3-2.png'),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name,optimize=True)

p=start(height=535,title='第19套二1：反缩放冲激与从负无穷开始的积分')
label(p,360,31,'f(2−2t)反求原信号：负冲激在−2、强度−2',21)
mx=lambda t:360+86*t
line(p,'M63 161H679',arrow=True)
line(p,'M360 254V63',arrow=True)
label(p,382,68,'f(t)',20)
label(p,679,189,'t',19)
polyline(p,[(65,161),(mx(0),161),(mx(0),91),(mx(2),91),(mx(2),161),(663,161)])
line(p,f'M{mx(-2)} 161V236','#b91c1c',2.8,True)
label(p,mx(-2)+28,224,'(−2)',21)
label(p,346,98,'1',18,'end')
for t in [-2,0,2]: label(p,mx(t)-10 if t==0 else mx(t),185,str(t).replace('-','−'),18)
label(p,515,221,'普通矩形：0<t<2',19)
line(p,'M63 351H679',arrow=True)
line(p,'M360 485V297',arrow=True)
label(p,397,302,'I(t)',20)
polyline(p,[(65,351),(mx(-2),351),(mx(-2),459),(mx(0),459),(mx(2),351),(663,351)])
line(p,f'M{mx(-2)} 351V459','#b91c1c',2.5,dash=True)
for t in [-2,0,2]: label(p,mx(t)-10 if t==0 else mx(t),377,str(t).replace('-','−'),18)
label(p,348,467,'−2',19,'end')
label(p,679,377,'t',19)
label(p,490,439,'斜率+1',19)
label(p,360,516,'负冲激跳−2，矩形面积+2；积分最终回到0',19)
save(folder/'a2-1.svg',p)

p=start(height=535,title='第19套二3：单边振幅与相位，基频3 rad/s')
label(p,360,30,'2−4cos6t+2sin9t：单边振幅及相位',22)
xs={0:100,6:418,9:577}
line(p,'M64 253H684',arrow=True)
line(p,'M100 272V61',arrow=True)
label(p,82,70,'A',20)
for omega,amp in [(0,2),(6,4),(9,2)]:
    x,y=xs[omega],253-amp*40
    line(p,f'M{x} 253V{y}','#0f766e',3)
    p.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#0f766e"/>')
    label(p,x+15 if omega==0 else x,y-9,amp,20)
    label(p,x,280,omega,18)
label(p,681,299,'ω (rad/s)',17,'end')
label(p,254,83,'直流幅度2',19)
line(p,'M64 429H684',arrow=True)
line(p,'M100 493V324',arrow=True)
label(p,81,332,'φ',22)
for omega,y,text in [(0,429,'0'),(6,339,'π'),(9,474,'−π/2')]:
    x=xs[omega]
    if omega:line(p,f'M{x} 429V{y}','#2563eb',2.8)
    p.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#2563eb"/>')
    label(p,x+18 if omega==0 else x,y-10 if omega!=9 else y+25,text,19)
    label(p,x,453,omega,18)
label(p,681,455,'ω (rad/s)',17,'end')
label(p,360,523,'正振幅配相位π表示负余弦；零幅谱线相位未定义',18)
save(folder/'a2-3.svg',p)

p=start(height=365,title='第19套二4：π高梯形频率响应')
label(p,360,31,'H(ω)：平台π；H(2π)=π/2，H(6π)=0',22)
mx=lambda v:360+86*v
line(p,'M61 247H686',arrow=True)
line(p,'M360 268V60',arrow=True)
label(p,395,61,'H(ω)',19)
polyline(p,[(65,247),(mx(-3),247),(mx(-1),93),(mx(1),93),(mx(3),247),(667,247)])
line(p,f'M{mx(2)} 247V170','#94a3b8',1.4,dash=True)
line(p,f'M360 170H{mx(2)}','#94a3b8',1.4,dash=True)
label(p,348,99,'π',20,'end')
label(p,348,177,'π/2',20,'end')
for x in [-3,-1,0,1,2,3]:
    line(p,f'M{mx(x)} 247V253')
    label(p,mx(x),282,str(x).replace('-','−'),18)
label(p,682,306,'ω/π',19,'end')
label(p,360,338,'原h的分母是πt²；输出π+(π/2)cos2πt',20)
save(folder/'a2-4.svg',p)
print('第19套：7幅原图PNG、3幅答案SVG已生成。')

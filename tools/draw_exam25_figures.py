"""课程25：保留坐标冲突与半周期平顶原图，绘制条件解和ROC。"""
from pathlib import Path
from math import sin, pi
from PIL import Image
from figure_svg import start, label, line, polyline, save
root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-25'
folder.mkdir(parents=True,exist_ok=True)
for page,bounds,name in [
 (84,(236,492,1148,663),'q2-3.png'),
 (84,(342,923,1056,1148),'q2-5.png'),
 (85,(380,114,1000,352),'q3-2.png'),
]:
 Image.open(root/'work/pages/tk-exams'/f'p{page}.png').crop(bounds).save(folder/name,optimize=True)

p=start(height=389,title='课程25二2：电流能谱密度，两个分离带宽及毫安换算')
label(p,360,30,'两带能谱密度：电流已换算为安培',23)
label(p,360,63,'Ψₓ(ω)单位 A²·s²；ωc=2π×10⁶ rad/s',20)
for center,subscript in [(193,'ω+ωc'),(539,'ω−ωc')]:
 mx=lambda value:center+74*value
 line(p,f'M{center-142} 245H{center+144}',arrow=True)
 line(p,f'M{center} 263V93',arrow=True)
 polyline(p,[(center-135,245),(mx(-1),245),(mx(-1),126),(mx(1),126),(mx(1),245),(center+132,245)])
 for value in [-1,0,1]:
  line(p,f'M{mx(value)} 245V251')
  label(p,mx(value)-8 if value==0 else mx(value),276,str(value).replace('-','−'),19)
 label(p,center,305,'('+subscript+')/(2000π)',20)
 label(p,center,108,'10⁻⁶/16',20)
label(p,360,344,'每带宽4000π rad/s；两带没有重叠',20)
label(p,360,378,'Parseval：250 mA²·s = 0.25 mJ（1 Ω）',21)
save(folder/'a2-2.svg',p)

p=start(height=398,title='课程25二5：原坐标标反，明确采用左负4右正4的条件图')
label(p,360,31,'采用横轴−4/+4的条件波形',23)
mx=lambda value:360+56*value
my=lambda value:274-163*value
line(p,'M55 274H688',arrow=True)
line(p,'M360 292V72',arrow=True)
polyline(p,[(mx(-5),274),(mx(-4),274),(mx(-4),my(1)),(360,274),(mx(4),my(1)),(mx(4),274),(mx(5),274)])
for value in [-4,0,4]:
 line(p,f'M{mx(value)} 274V280')
 label(p,mx(value)-10 if value==0 else mx(value),307,str(value).replace('-','−'),20)
label(p,344,my(1)+6,'1',20,'end')
label(p,390,88,'y(t)',21)
label(p,687,302,'t',21)
label(p,360,346,'原图左印4、右印−4，条件解释已写明',20)
label(p,360,381,'Y(jω)=2R(2ω)，Y(0)=4',22)
save(folder/'a2-5.svg',p)

p=start(height=402,title='课程25三1：有限极点负1和2，三个不同ROC')
label(p,360,30,'H(s)无有限零点；极点−1、2',23)
mx=lambda value:350+91*value
left,right=mx(-1),mx(2)
p.append(f'<rect x="66" y="68" width="{left-66}" height="197" fill="#fff7ed"/>')
p.append(f'<rect x="{left}" y="68" width="{right-left}" height="197" fill="#ecfdf5"/>')
p.append(f'<rect x="{right}" y="68" width="{671-right}" height="197" fill="#fff7ed"/>')
line(p,'M46 215H690',arrow=True)
line(p,'M350 278V61',arrow=True)
for value in [-1,2]:
 x=mx(value)
 line(p,f'M{x} 71V274',dash=True)
 line(p,f'M{x-7} 208L{x+7} 222M{x-7} 222L{x+7} 208','#0f766e',2.8)
 label(p,x,302,str(value).replace('-','−'),21)
label(p,340,300,'0',20)
label(p,375,66,'jω',21)
label(p,683,244,'σ',21)
label(p,158,99,'Re s<−1',21)
label(p,392,99,'−1<Re s<2',21)
label(p,605,99,'Re s>2',21)
label(p,360,346,'中间条带：包含虚轴，稳定且非因果',21)
label(p,360,386,'左ROC非因果不稳定；右ROC因果不稳定',20)
save(folder/'a3-1.svg',p)

p=start(height=609,title='课程25三2：半周期平顶的幅度补偿与正相位补偿')
label(p,360,30,'恢复器幅度与相位（通带内）',23)
label(p,360,64,'ξ=ω/(8000π)，Sa(v)=sin(v)/v',20)
mx=lambda value:360+168*value
ma=lambda value:273-87*value
gain=lambda value:2 if value==0 else 2*(pi*value/4)/sin(pi*value/4)
line(p,'M45 273H691',arrow=True)
line(p,'M360 290V81',arrow=True)
polyline(p,[(mx(-1.65),273),(mx(-1),273),(mx(-1),ma(gain(-1)))])
polyline(p,[(mx(k/80),ma(gain(k/80))) for k in range(-80,81)])
polyline(p,[(mx(1),ma(gain(1))),(mx(1),273),(mx(1.65),273)])
label(p,130,96,'π/√2',19)
label(p,338,ma(2)+6,'2',19,'end')
label(p,422,97,'|H_L|',21)
for value in [-1,0,1]:
 line(p,f'M{mx(value)} 273V279')
 label(p,mx(value)-9 if value==0 else mx(value),305,str(value).replace('-','−'),20)
label(p,691,305,'ξ',20)
label(p,360,348,'阻带相位无定义；以下仅画通带相位',21)
line(p,'M45 472H691',arrow=True)
line(p,'M360 541V377',arrow=True)
polyline(p,[(mx(-1),537),(mx(1),407)])
for value in [-1,0,1]:
 line(p,f'M{mx(value)} 472V478')
 label(p,mx(value)-9 if value==0 else mx(value),504,str(value).replace('-','−'),20)
label(p,342,412,'π/4',18,'end')
label(p,342,542,'−π/4',18,'end')
label(p,442,395,'∠H_L=ωT/4',21)
label(p,691,504,'ξ',20)
label(p,360,572,'持有0..T/2的延迟用正相位补偿',21)
label(p,360,602,'4 kHz/8 kHz临界：保留边缘谱线条件',20)
save(folder/'a3-2.svg',p)
print('课程25题图完成：三幅原图PNG、四幅独立答案SVG。')

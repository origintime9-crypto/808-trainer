"""课程24：保留原图和偶数限制，绘制负脉冲卷积、两种实现；同题频谱复用已核验旧图。"""
from pathlib import Path
from PIL import Image
from figure_svg import start,label,line,polyline,save
root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-24'
folder.mkdir(parents=True,exist_ok=True)
for page,bounds,name in [
 (82,(402,130,1001,384),'q2-1.png'),
 (82,(122,395,1290,620),'q2-2.png'),
]:
 Image.open(root/'work'/'pages'/'tk-exams'/f'p{page}.png').crop(bounds).save(folder/name,optimize=True)

p=start(height=449,title='课程24二1：负半高脉冲卷积，3到4之间为零')
label(p,360,31,'正梯形与负三角：支撑0..3和4..6',23)
mx=lambda v:99+82*v
my=lambda v:222-228*v
line(p,'M44 222H676',arrow=True)
line(p,'M99 362V62',arrow=True)
polyline(p,[(mx(v),my(a)) for v,a in [(-.55,0),(0,0),(1,.5),(2,.5),(3,0),(4,0),(5,-.5),(6,0),(6.7,0)]])
for value in range(7):
 line(p,f'M{mx(value)} 222V228')
 label(p,mx(value)-10 if value==0 else mx(value),252,value,19)
label(p,84,my(.5)+7,'1/2',19,'end')
label(p,84,my(-.5)+7,'−1/2',19,'end')
label(p,128,77,'y(t)',21)
label(p,681,254,'t',21)
label(p,360,394,'正面积1，负面积−1/2；总面积1/2',20)
label(p,360,431,'负脉冲位于4..5，负卷积位于4..6',20)
save(folder/'a2-1.svg',p)

def block(p,x,y,text,width=72):
 p.append(f'<rect x="{x}" y="{y}" width="{width}" height="44" fill="#f0fdfa" stroke="#0f766e" stroke-width="1.8"/>')
 label(p,x+width/2,y+29,text,22)

p=start(height=474,title='课程24二2：总系统恒等直通与第二子系统FIR分别实现')
label(p,360,31,'“该系统”两种指代分别画图',23)
label(p,360,70,'整体H=1：0延迟器、0非单位增益乘法器',21)
line(p,'M105 110H618',arrow=True)
label(p,79,117,'x[k]',21)
label(p,665,117,'y[k]',21)
label(p,360,173,'第二子系统H₂：2单位延迟器、1乘法器',21)
line(p,'M67 237H601',arrow=True)
p.append('<circle cx="620" cy="237" r="17" fill="white" stroke="#334155" stroke-width="1.8"/>')
label(p,620,245,'+',24)
line(p,'M638 237H689',arrow=True)
label(p,85,216,'x₂[k]',21)
label(p,678,216,'y₂[k]',21)
p.append('<circle cx="130" cy="237" r="3" fill="#0f766e"/>')
line(p,'M130 237V337H192',arrow=True)
block(p,198,315,'z⁻¹')
line(p,'M270 337H324',arrow=True)
block(p,330,315,'z⁻¹')
line(p,'M402 337H464',arrow=True)
block(p,470,315,'−1/4',96)
line(p,'M566 337H620V256',arrow=True)
label(p,360,404,'y₂[k]=x₂[k]−x₂[k−2]/4',23)
label(p,360,443,'以上H₂采用原奇数样值补零的条件',20)
label(p,360,468,'最少元件数量不把单位直通计为乘法器',19)
save(folder/'a2-2.svg',p)

print('课程24题图完成：两幅原图、两幅答案SVG；同题频谱与直接型图复用旧图。')

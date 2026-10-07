"""课程20：八幅原图局部、条件积分图、直接型I、V形谱、零极点与单延时实现。"""
from pathlib import Path
from PIL import Image
from figure_svg import start, label, line, polyline, save

root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-20'
folder.mkdir(parents=True,exist_ok=True)
for page,box,name in [
 (73,(413,976,553,1115),'q2-1a.png'),
 (73,(558,976,790,1152),'q2-1b.png'),
 (73,(803,976,981,1115),'q2-1c.png'),
 (73,(548,1273,829,1465),'q2-2.png'),
 (74,(486,218,639,268),'q2-4.png'),
 (74,(244,546,477,734),'q2-5a.png'),
 (74,(484,550,1238,731),'q2-5b.png'),
 (74,(484,1265,899,1515),'q3-2.png'),
]:
 Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name,optimize=True)

def box(parts,x,y,width,height,text,size=21):
 parts.append(f'<rect x="{x}" y="{y}" width="{width}" height="{height}" fill="white" stroke="#334155" stroke-width="1.8"/>')
 label(parts,x+width/2,y+height/2+7,text,size)
def summer(parts,x,y):
 parts.append(f'<circle cx="{x}" cy="{y}" r="19" fill="white" stroke="#334155" stroke-width="1.8"/>')
 label(parts,x,y+7,'Σ',24)
def dot(parts,x,y):
 parts.append(f'<circle cx="{x}" cy="{y}" r="3.4" fill="#334155"/>')

p=start(height=350,title='课程20二1：中图作为y1(t)时的条件积分波形')
label(p,360,29,'条件：原F(ω)标签的中图解释为y₁(t)',21)
label(p,360,56,'y₂从t=−1起升，t=1达2，t=2回到平台1',19)
mx=lambda t:300+86*t
my=lambda y:250-80*y
line(p,'M50 250H690',arrow=True)
line(p,'M300 275V66',arrow=True)
polyline(p,[(53,250),(mx(-1),250),(mx(1),my(2)),(mx(2),my(1)),(678,my(1))])
for t in [-1,0,1,2]:
 label(p,mx(t)-10 if t==0 else mx(t),277,str(t).replace('-','−'),19)
for y in [1,2]: label(p,282,my(y)+6,y,19,'end')
label(p,687,275,'t',20)
label(p,335,80,'y₂(t)',20)
line(p,f'M{mx(1)} {my(2)}V250','#94a3b8',1.5,dash=True)
line(p,f'M{mx(2)} {my(1)}V250','#94a3b8',1.5,dash=True)
label(p,360,322,'正面积2，负面积−1；从负无穷积分后最终为1',19)
save(folder/'a2-1.svg',p)

p=start(height=420,title='课程20二4：右端缺符号，线性条件式及字面乘积的直接型I')
label(p,360,30,'延时形式：y[k]=3y[k−1]−2y[k−2]+ψ(f₁,f₂)',21)
line(p,'M35 128H109',arrow=True)
box(p,110,107,60,42,'D')
line(p,'M170 128H284',arrow=True)
dot(p,215,128)
box(p,285,107,60,42,'D')
line(p,'M345 128H439',arrow=True)
box(p,440,107,120,42,'ψ(f₁,f₂)',21)
line(p,'M560 128H580',arrow=True)
summer(p,600,128)
line(p,'M620 128H694',arrow=True)
dot(p,660,128)
line(p,'M215 128V67H500V106',arrow=True)
label(p,56,112,'f[k]',20)
label(p,215,157,'f₁',20)
label(p,394,157,'f₂',20)
label(p,684,111,'y[k]',20)
line(p,'M660 128V250H574',arrow=True)
box(p,515,229,58,42,'D')
line(p,'M515 250H409',arrow=True)
dot(p,450,250)
box(p,350,229,58,42,'D')
line(p,'M350 250H279')
dot(p,280,250)
line(p,'M450 250V181H600V148',arrow=True)
label(p,526,173,'+3',21)
line(p,'M280 250V316H650V160L615 142',arrow=True)
label(p,584,306,'−2',21)
label(p,450,279,'y[k−1]',19)
label(p,280,279,'y[k−2]',19)
label(p,360,366,'ψ=f₁+bf₂，b=±2：补运算符后的线性条件版本',19)
label(p,360,396,'字面ψ=2f₁f₂：需要乘法器，该版本非线性',19)
save(folder/'a2-4.svg',p)

p=start(height=530,title='课程20二5：外半谱调制得到中心为零的V形输出谱')
label(p,360,28,'H₁只留外半谱，再乘cos(ωc+ω₁)t',22)
line(p,'M50 218H687',arrow=True)
line(p,'M360 242V61',arrow=True)
label(p,382,78,'R₂',21)
polyline(p,[(53,218),(160,218),(240,118),(240,218),(480,218),(480,118),(560,218),(675,218)])
for x,text in [(160,'−ωc−ω₁'),(240,'−ωc'),(480,'ωc'),(560,'ωc+ω₁')]:
 label(p,x,250,text,17)
label(p,252,112,'A/2',19)
label(p,507,112,'A/2',19)
label(p,350,240,'0',17)
label(p,687,245,'ω',20)
label(p,360,290,'Y(jω)：每次余弦各乘1/2，最终两边内侧A/4',20)
line(p,'M50 433H687',arrow=True)
line(p,'M360 458V309',arrow=True)
label(p,382,324,'Y',21)
polyline(p,[(53,433),(190,433),(190,333),(360,433),(530,333),(530,433),(675,433)])
label(p,190,463,'−ω₁',20)
label(p,530,463,'ω₁',20)
label(p,348,458,'0',18)
label(p,687,460,'ω',20)
label(p,312,335,'A/4',20)
line(p,'M190 333H530','#94a3b8',1.4,dash=True)
label(p,360,511,'|ω|<ω₁内Y=A|ω|/(4ω₁)；严格通带边界取0',19)
save(folder/'a2-5.svg',p)

p=start(height=355,title='课程20三1：零点负1、极点二分之一，外收敛域含单位圆')
p.append('<rect x="37" y="55" width="646" height="245" rx="12" fill="#ecfdf5"/>')
p.append('<circle cx="360" cy="181" r="57.5" fill="white" stroke="#0f766e" stroke-dasharray="5 4" stroke-width="1.6"/>')
p.append('<circle cx="360" cy="181" r="115" fill="none" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1.5"/>')
label(p,360,30,'H(z)=−(z+1)/[3(z−1/2)]',23)
line(p,'M67 181H668',arrow=True)
line(p,'M360 304V52',arrow=True)
p.append('<circle cx="245" cy="181" r="8" fill="white" stroke="#2563eb" stroke-width="2.6"/>')
line(p,'M411 174L425 188M425 174L411 188','#b91c1c',2.5)
label(p,245,216,'−1 ○',20)
label(p,418,216,'1/2 ×',20)
label(p,345,206,'0',18)
label(p,652,208,'Re z',19)
label(p,387,72,'Im z',19)
label(p,511,93,'ROC |z|>1/2',21)
label(p,508,276,'虚线外圆：|z|=1',18)
label(p,360,337,'极点仅1/2；常数阶跃项经差分消去，H无极点1',18)
save(folder/'a3-1-b.svg',p)

p=start(height=355,title='课程20三1：单延时正反馈，两条负三分之一前馈')
label(p,360,29,'w=x+(1/2)w[k−1]，y=−w/3−w[k−1]/3',21)
line(p,'M35 110H149',arrow=True)
summer(p,170,110)
line(p,'M190 110H344',arrow=True)
dot(p,260,110)
box(p,345,89,81,42,'−1/3')
line(p,'M426 110H535',arrow=True)
summer(p,555,110)
line(p,'M575 110H690',arrow=True)
label(p,66,96,'x[k]',21)
label(p,260,92,'w[k]',20)
label(p,665,95,'y[k]',21)
line(p,'M260 110V235H293',arrow=True)
box(p,294,214,60,42,'D')
line(p,'M354 235H415')
dot(p,416,235)
line(p,'M416 235H555V130',arrow=True)
label(p,506,222,'−1/3',22)
line(p,'M416 235V300H170V130',arrow=True)
label(p,272,290,'+1/2',22)
label(p,419,264,'w[k−1]',19)
label(p,360,337,'D为一拍延时，当前输出有直接项−x[k]/3',19)
save(folder/'a3-1-d.svg',p)
print('课程20题图完成：八幅原图局部、五幅独立答案SVG。')
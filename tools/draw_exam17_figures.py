"""课程17：原零极点/三角图、两积分器、两种幅度谱及全通实现。"""
from pathlib import Path
from math import atan, pi
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-17'
folder.mkdir(parents=True, exist_ok=True)
for page, box, name in [
    (67, (545, 380, 846, 718), 'q1-2.png'),
    (68, (560, 171, 870, 405), 'q2-2.png'),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name, optimize=True)

def circle(parts,x,y,radius=20,text='Σ'):
    parts.append(f'<circle cx="{x}" cy="{y}" r="{radius}" fill="white" stroke="#334155" stroke-width="1.8"/>')
    label(parts,x,y+7,text,21)

def node(parts,x,y):
    parts.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="#334155"/>')

def integrator(parts,x,y):
    parts.append(f'<rect x="{x}" y="{y-27}" width="78" height="54" rx="4" fill="#f0fdfa" stroke="#0f766e" stroke-width="1.8"/>')
    label(parts,x+39,y+7,'1/s',22)

p = start(height=440,width=860,title='课程17一7：两积分器直接型信号流图')
label(p,430,32,'直接型：q″+3q′+2q=f，y=2q′+q',23)
circle(p,130,180)
circle(p,735,180)
integrator(p,245,180)
integrator(p,455,180)
line(p,'M35 180H110',arrow=True)
line(p,'M150 180H245',arrow=True)
line(p,'M323 180H455',arrow=True)
line(p,'M533 180H715',arrow=True)
line(p,'M755 180H830',arrow=True)
label(p,49,163,'f(t)',20)
label(p,199,161,'q″',20)
label(p,378,220,'q′=q₂',19)
label(p,619,220,'q=q₁',19)
label(p,810,161,'y(t)',20)
node(p,360,180)
node(p,570,180)
line(p,'M360 180V96H735V160',arrow=True)
label(p,550,83,'×2',22)
line(p,'M360 180V300H155L140 198',arrow=True)
label(p,263,286,'×(−3)',22)
line(p,'M570 180V365H90L118 198',arrow=True)
label(p,290,352,'×(−2)',22)
label(p,430,421,'箭头输入按所标增益相加；输出包含q′及q两条支路',18)
save(folder/'a1-7.svg',p)

p = start(height=490,width=760,title='课程17一10：单边振幅与双边复系数模')
label(p,380,29,'同一信号，两种幅度口径；Ω₀=1 rad/s',23)
line(p,'M65 209H710',arrow=True)
line(p,'M90 229V57',arrow=True)
label(p,77,54,'Aₙ',20)
for n,val in [(0,1),(1,2),(3,.5),(5,.25)]:
    x,y=90+n*108,209-val*63
    line(p,f'M{x} 209V{y}','#0f766e',3)
    p.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#0f766e"/>')
    label(p,x,y-10,{.5:'½',.25:'¼'}.get(val,str(val)),19)
    label(p,x,235,n,18)
label(p,677,255,'ω/Ω₀',18)
label(p,414,64,'单边余弦振幅',20)
line(p,'M65 419H710',arrow=True)
line(p,'M380 435V286',arrow=True)
label(p,424,295,'|Cₙ|',20)
for n,val in [(-5,.125),(-3,.25),(-1,1),(0,1),(1,1),(3,.25),(5,.125)]:
    x,y=380+n*52,419-val*86
    line(p,f'M{x} 419V{y}','#2563eb',2.5)
    p.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="#2563eb"/>')
    label(p,x,y-11,{.125:'⅛',.25:'¼'}.get(val,str(val)),18)
    label(p,x,444,str(n).replace('-','−'),17)
label(p,690,453,'ω/Ω₀',18)
label(p,174,299,'双边复系数模',20)
label(p,380,479,'非零余弦分成两线；直流C₀=1只占一线，不减半',18)
save(folder/'a1-10.svg',p)

p = start(height=420,title='课程17三1：零点1、极点负1与稳定ROC')
label(p,360,30,'稳定ROC：Re s>−1；右半平面零点不影响稳定性',21)
p.append('<rect x="230" y="62" width="435" height="249" rx="8" fill="#ecfdf5"/>')
line(p,'M230 54V319','#94a3b8',1.7,dash=True)
line(p,'M65 191H688',arrow=True)
line(p,'M360 326V52',arrow=True)
label(p,692,216,'σ',19)
label(p,379,62,'jω',19)
line(p,'M223 184L237 198M223 198L237 184','#b91c1c',2.8)
p.append('<circle cx="490" cy="191" r="8" fill="white" stroke="#2563eb" stroke-width="2.6"/>')
label(p,230,223,'−1',20)
label(p,360,223,'0',20)
label(p,490,223,'+1',20)
label(p,540,282,'Re s>−1',22)
label(p,360,362,'×：极点；○：零点；虚轴在ROC内，边界极点不含',18)
label(p,360,398,'h(t)=δ(t)−2e⁻ᵗu(t)：因果且稳定',20)
save(folder/'a3-1-roc.svg',p)

p = start(height=490,title='课程17三1：全通幅度和主值相位')
label(p,360,29,'H(jω)=(jω−1)/(jω+1)',23)
mx=lambda x:360+70*x
line(p,'M57 146H680',arrow=True)
line(p,'M360 169V53',arrow=True)
polyline(p,[(mx(-4),79),(mx(4),79)])
label(p,347,73,'1',18,'end')
label(p,86,54,'|H|',20)
label(p,680,139,'ω',18)
line(p,'M57 326H680',arrow=True)
line(p,'M360 449V213',arrow=True)
for value in [pi,-pi]:
    y=326-value*32
    line(p,f'M65 {y}H656','#94a3b8',1.2,dash=True)
    label(p,346,y-5,'π' if value>0 else '−π',18,'end')
for sign in [-1,1]:
    xs=[sign*(.002+3.998*i/200) for i in range(201)]
    polyline(p,[(mx(x),326-(sign*pi-2*atan(x))*32) for x in xs])
p.append(f'<circle cx="360" cy="{326-pi*32}" r="4" fill="#0f766e"/>')
p.append(f'<circle cx="360" cy="{326+pi*32}" r="4" fill="white" stroke="#0f766e" stroke-width="2"/>')
label(p,149,218,'arg H (rad)',19)
label(p,680,316,'ω',18)
for x in [-4,-2,0,2,4]:
    for y in [146,326]:
        line(p,f'M{mx(x)} {y}V{y+5}')
        label(p,mx(x),y+25,str(x).replace('-','−'),18)
label(p,360,472,'H(0)=−1；主值相位原点取π，跳变来自分支选择',18)
save(folder/'a3-1-frequency.svg',p)

p = start(height=410,width=850,title='课程17三1：含正直通的一积分器全通实现')
label(p,425,30,'q′=f−q；y=f−2q；H=1−2/(s+1)',23)
circle(p,215,195)
circle(p,730,195)
integrator(p,345,195)
line(p,'M33 195H195',arrow=True)
line(p,'M235 195H345',arrow=True)
line(p,'M423 195H710',arrow=True)
line(p,'M750 195H821',arrow=True)
node(p,120,195)
node(p,485,195)
line(p,'M120 195V91H730V175',arrow=True)
label(p,425,78,'直通增益 +1',20)
label(p,575,181,'×(−2)',22)
label(p,495,220,'q',20)
line(p,'M485 195V321H215V215',arrow=True)
label(p,349,307,'反馈 ×(−1)',20)
label(p,60,179,'f(t)',20)
label(p,294,179,'q′',20)
label(p,790,178,'y(t)',20)
label(p,425,393,'负反馈−1构成1/(s+1)，负支路−2与正直通相加',19)
save(folder/'a3-1-model.svg',p)
print('课程17：2幅原题图、5幅独立答案图已生成。')

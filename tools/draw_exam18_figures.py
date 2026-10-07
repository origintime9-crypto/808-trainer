"""课程18：原矩形谱/波形/两离散图，移频谱和带通图；相同卷积沿用旧图。"""
from pathlib import Path
from PIL import Image
from figure_svg import start, label, line, polyline, save

root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-18'
folder.mkdir(parents=True,exist_ok=True)
for page,box,name in [
    (69,(625,988,817,1168),'q2-1.png'),
    (70,(445,746,985,1048),'q3-1.png'),
    (70,(494,1220,938,1526),'q3-2.png'),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name,optimize=True)

p=start(height=365,title='课程18二3：平方sinc余弦调制的两个三角谱')
label(p,360,31,'F(ω)=[Λ(ω−1)+Λ(ω+1)]/(4π)',23)
mx=lambda v:360+128*v
line(p,'M57 253H686',arrow=True)
line(p,'M360 272V64',arrow=True)
label(p,396,66,'F(ω)',19)
polyline(p,[(57,253),(mx(-2),253),(mx(-1),97),(mx(0),253),(mx(1),97),(mx(2),253),(668,253)])
for frequency in [-2,-1,0,1,2]:
    line(p,f'M{mx(frequency)} 253V259')
    label(p,mx(frequency),284,str(frequency).replace('-','−'),18)
line(p,'M232 97H488','#94a3b8',1.4,dash=True)
label(p,353,121,'1/(4π)',20,'end')
label(p,677,301,'ω (rad/s)',18,'end')
label(p,360,335,'峰在±1，带宽边界±2；T最大=π/2 s',19)
save(folder/'a2-3.svg',p)

p=start(height=365,title='课程18二4：保留载波正负一次谐波的理想带通')
label(p,360,31,'仅保留k=±1边带，通带增益1',23)
mx=lambda v:360+162*v
line(p,'M57 248H689',arrow=True)
line(p,'M360 272V61',arrow=True)
label(p,395,62,'H(ω)',19)
for low,high in [(-1.5,-.5),(.5,1.5)]:
    polyline(p,[(mx(low),248),(mx(low),100),(mx(high),100),(mx(high),248)])
    for edge in [low,high]:
        p.append(f'<circle cx="{mx(edge)}" cy="100" r="4.5" fill="white" stroke="#0f766e" stroke-width="2"/>')
label(p,349,107,'1',20,'end')
for frequency,text in [(-1.5,'−3/2'),(-.5,'−1/2'),(0,'0'),(.5,'1/2'),(1.5,'3/2')]:
    line(p,f'M{mx(frequency)} 248V254')
    label(p,mx(frequency),281,text,18)
label(p,686,307,'ω/ω₀',19,'end')
label(p,360,337,'题设F在边界为零；目标含a₁及其共轭，无需再除以2|a₁|',17)
save(folder/'a2-4.svg',p)
print('课程18：3幅原题PNG、2幅答案SVG；重复卷积复用课程08题图和答案图已生成。')

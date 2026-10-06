"""课程题库 03：保留缺失时间的原图，绘制条件卷积、直接型及节点谱。"""
from pathlib import Path
from PIL import Image
from figure_svg import start,label,line,polyline,save,spectrum

root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-03'
folder.mkdir(parents=True,exist_ok=True)
for page,no,box in [
    (11,'2-2',(335,890,1048,1070)),
    (11,'2-3',(474,1310,948,1560)),
    (12,'2-5',(350,1340,1030,1540)),
    (14,'3-2',(350,324,1040,590)),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/f'q{no}.png',optimize=True)

p=start(380,title='仅在 a=1、b=2 时的卷积图')
mx=lambda value:75+(value+2)*100
my=lambda value:275-60*value
label(p,360,32,'条件例子：a=1、b=2',22)
line(p,'M35 275H690',arrow=True)
line(p,f'M{mx(0)} 301V57',arrow=True)
for value in [-1,0,1,2,3]:label(p,mx(value),302,value,18)
for value in [1,2,3]:
    label(p,mx(0)-18,my(value)+6,value,18,'end')
    line(p,f'M{mx(0)} {my(value)}H{mx(1)}',dash=True)
polyline(p,[(mx(x),my(y)) for x,y in [(-1,0),(0,2),(1,3),(2,1),(3,0)]])
label(p,676,299,'t',18)
label(p,360,341,'仅用于已确认转折时刻的情形，原题图未给 a、b',17)
label(p,360,368,'支撑 −1..3，峰值 3，面积 6',17)
save(folder/'a2-3.svg',p)

p=start(455,title='H(s)=(2s+7)/(s²+5s+3) 的直接型')
def block(x,y,value):
    p.append(f'<rect x="{x}" y="{y}" width="60" height="44" fill="white" stroke="#334155" stroke-width="1.8"/>')
    label(p,x+30,y+29,value,22)
def dot(x,y):p.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="#334155"/>')
label(p,360,27,'直接型：x₁=w，x₂=w′',22)
p.append('<circle cx="125" cy="185" r="20" fill="white" stroke="#334155" stroke-width="1.8"/>')
p.append('<circle cx="650" cy="85" r="20" fill="white" stroke="#334155" stroke-width="1.8"/>')
label(p,125,192,'Σ',20);label(p,650,92,'Σ',20)
label(p,35,178,'f(t)',20)
line(p,'M55 185H104',arrow=True);label(p,108,176,'+',17)
line(p,'M145 185H210',arrow=True);label(p,177,166,'x₂′',18)
block(210,163,'1/s');line(p,'M270 185H450',arrow=True);label(p,353,173,'x₂',21)
block(450,163,'1/s');line(p,'M510 185H605');label(p,558,173,'x₁',21)
dot(345,185);dot(590,185)
line(p,'M345 185V85H400',arrow=True);block(400,63,'2')
line(p,'M460 85H630',arrow=True);label(p,631,74,'+',17)
line(p,'M590 185V169',arrow=True);block(560,125,'7')
line(p,'M590 125V114H650V105',arrow=True);label(p,665,113,'+',17)
line(p,'M670 85H702',arrow=True);label(p,690,68,'y(t)',19)
line(p,'M345 185V285H280',arrow=True);block(220,263,'5')
line(p,'M220 285H125V205',arrow=True);label(p,110,215,'−',19)
line(p,'M590 185V365H280',arrow=True);block(220,343,'3')
line(p,'M220 365H85V125H125V165',arrow=True);label(p,109,160,'−',19)
# 反馈线与外部输入交叉处无连接：用留白画跨线桥。
p.append('<circle cx="85" cy="185" r="5" fill="white"/>')
line(p,'M85 179V191')
label(p,360,410,'x₁′=x₂；x₂′=f−5x₂−3x₁；y=2x₂+7x₁',20)
label(p,360,438,'圆点表示分支连接；跨线处不连接',17)
save(folder/'a2-4.svg',p)

axis={'axis_label':'ω (rad/s)'}
spectrum(folder/'a3-2-a.svg','A 点：cos(100t) 的冲激谱',130,1,[],
         [-100,0,100],[],'谱线在 ±100 rad/s，每根冲激强度 π',
         [(-100,'π'),(100,'π')],**axis)
spectrum(folder/'a3-2-b.svg','B 点：两个完整三角副本',125,1,
         [[(-110,0),(-100,1),(-90,0)],[(90,0),(100,1),(110,0)]],
         [-100,0,100],[1],'中心 ±100，半宽 10，峰高 1',**axis)
spectrum(folder/'a3-2-c.svg','C 点：保留朝原点的半谱',120,1,
         [[(-100,0),(-100,1),(-90,0)],[(90,0),(100,1),(100,0)]],
         [-100,0,100],[1],'保留 −100..−90 与 90..100，峰高 1',**axis)
spectrum(folder/'a3-2-d.svg','D 点：基带与高频半谱',230,.5,
         [[(-200,0),(-200,.5),(-190,0)],[(-10,0),(0,.5),(10,0)],[(190,0),(200,.5),(200,0)]],
         [-200,0,200],[(.5,'1/2')],'基带 −10..10；另有 −200..−190、190..200',**axis)
spectrum(folder/'a3-2-e.svg','E 点：恢复基带，Y=F/4',16,.5,
         [[(-10,0),(0,.5),(10,0)]],[-10,0,10],[(.5,'1/2')],
         '峰高 1/2，带宽上界 10 rad/s，y(t)=f(t)/4',**axis)
print('课程题库 03：四幅原题图、条件卷积图、直接型图、五幅节点谱。')

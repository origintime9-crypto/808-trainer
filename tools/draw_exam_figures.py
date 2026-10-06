"""按已核对的课程题库条件绘制答案波形和系统框图。"""
from pathlib import Path
from html import escape
from PIL import Image

root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-01'
folder.mkdir(parents=True,exist_ok=True)
for page,no,box in [
    (1,'2-1',(505,1265,879,1455)),
    (2,'2-2',(430,529,950,691)),
    (2,'2-3',(502,841,901,1044)),
    (2,'2-4',(571,1249,849,1499)),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/f'q{no}.png',optimize=True)

def start(height):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="680" height="{height}" viewBox="0 0 680 {height}" role="img">',
            '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0L8,4L0,8Z" fill="#334155"/></marker></defs>',
            f'<rect width="680" height="{height}" fill="white"/>']
def label(p,x,y,txt,size=19,anchor='middle'):
    p.append(f'<text x="{x}" y="{y}" font-family="Arial,Microsoft YaHei,sans-serif" font-size="{size}" text-anchor="{anchor}" fill="#334155">{escape(txt)}</text>')
def line(p,path,color='#334155',width=1.8,arrow=False,dash=False):
    p.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="{width}"'+(' marker-end="url(#arrow)"' if arrow else '')+(' stroke-dasharray="4 4"' if dash else '')+'/>')
def save(no,p): (folder/f'{no}.svg').write_text('\n'.join(p+['</svg>']),encoding='utf-8')

p=start(355); mx=lambda v:90+120*v; my=lambda v:282-35*v
line(p,'M50 282H645',arrow=True);line(p,'M90 305V40',arrow=True)
label(p,108,32,'y(t)');label(p,647,306,'t')
for x in range(5): label(p,mx(x),308,str(x),17)
for y in [2,4,6]: label(p,67,my(y)+6,str(y),17)
for x,y in [(1,2),(2,6),(3,4),(4,0)]:
    line(p,f'M{mx(x)} 282V{my(y)}',dash=True)
line(p,'M'+ 'L'.join(f'{mx(x)},{my(y)}' for x,y in [(0,0),(1,2),(2,6),(3,4),(4,0)]),'#0f766e',3)
label(p,350,344,'折点：(0,0)、(1,2)、(2,6)、(3,4)、(4,0)',17)
save('a2-1',p)

p=start(345); mx=lambda v:70+104*v;my=lambda v:265-62*v
line(p,'M35 265H645',arrow=True);line(p,'M70 287V35',arrow=True)
label(p,110,29,'g(t)');label(p,645,287,'t')
for x in range(6):label(p,mx(x),293,str(x),17)
for y in [1,2,3]:label(p,47,my(y)+6,str(y),17)
line(p,f'M{mx(0)} {my(0)}L{mx(1)} {my(1)}','#0f766e',3)
for m in range(1,5):
    line(p,f'M{mx(m)} {my(1)}L{mx(m+1)} {my(3)}','#0f766e',3)
    line(p,f'M{mx(m+1)} {my(3)}V{my(1)}',dash=True)
    p.append(f'<circle cx="{mx(m+1)}" cy="{my(3)}" r="4" fill="white" stroke="#0f766e"/>')
label(p,610,my(2),'…',25)
label(p,365,329,'t≥1：每个整数区间由 1 升至 3，再跳回 1',17)
save('a2-4',p)

p=start(400)
def arrow(path):line(p,path,arrow=True)
def block(x,y,width,txt):
    p.append(f'<rect x="{x}" y="{y}" width="{width}" height="42" rx="4" fill="#f0fdfa" stroke="#0f766e" stroke-width="2"/>')
    label(p,x+width/2,y+28,txt)
def node(x,y):
    p.append(f'<circle cx="{x}" cy="{y}" r="18" fill="white" stroke="#334155" stroke-width="2"/>');label(p,x,y+7,'Σ',22)
node(130,95);node(590,95)
label(p,49,73,'f(t)');arrow('M30 95H110');arrow('M150 95H205')
block(205,74,66,'1/s');arrow('M271 95H360');block(360,74,66,'1/s')
label(p,315,74,"q′");label(p,461,74,'q')
arrow('M426 95H467');block(467,74,50,'3');arrow('M517 95H570')
arrow('M315 95V35H467');block(467,14,50,'2');arrow('M517 35H565L580 77')
arrow('M609 95H650');label(p,644,74,'y(t)')
arrow('M315 95V185H254');block(202,164,52,'−7');arrow('M202 185H130V115')
arrow('M446 95V277H254');block(194,256,60,'−10');arrow('M194 277H95V108L114 99')
label(p,340,348,"q″=f−7q′−10q，y=2q′+3q",20)
label(p,340,380,'两个积分器、负反馈 −7 和 −10、前馈 2 和 3',17)
save('a3-1-3',p)
print('课程题库 01：四幅题面裁剪，三幅独立答案图。')

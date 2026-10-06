"""按手写题确认的输入和系数绘制条件框图、抽样谱及直接型框图。"""
from pathlib import Path
from html import escape

folder = Path(__file__).resolve().parents[1]/'public'/'figures'/'tk-key'
folder.mkdir(parents=True,exist_ok=True)
def svg_start(height):
    return ['<svg xmlns="http://www.w3.org/2000/svg" width="680" height="'+str(height)+'" viewBox="0 0 680 '+str(height)+'" role="img">',
            '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0L8,4L0,8Z" fill="#334155"/></marker></defs>',
            '<rect width="680" height="'+str(height)+'" fill="white"/>']
def text(parts,x,y,value,size=19,anchor='middle'):
    parts.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}" font-family="Arial,Microsoft YaHei,sans-serif" fill="#334155">{escape(value)}</text>')
def arrow(parts,d):
    parts.append(f'<path d="{d}" fill="none" stroke="#334155" stroke-width="1.8" marker-end="url(#arrow)"/>')
def box(parts,x,y,w,h,label):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="#f0fdfa" stroke="#0f766e" stroke-width="2"/>')
    text(parts,x+w/2,y+h/2+6,label)
def save(name,parts):
    (folder/(name+'.svg')).write_text('\n'.join(parts+['</svg>']),encoding='utf-8')

p=svg_start(200)
text(p,90,63,'x(t)')
arrow(p,'M45 90H231')
p.append('<circle cx="250" cy="90" r="18" fill="white" stroke="#334155" stroke-width="2"/>')
text(p,250,97,'×',24)
arrow(p,'M269 90H360')
box(p,360,62,140,56,'H(jω)')
arrow(p,'M500 90H630')
text(p,615,65,'y(t)')
arrow(p,'M250 165V110')
text(p,250,187,'s(t)=cos 500t')
save('q9',p)

p=svg_start(360)
mx=lambda v:65+(v+9.5)*550/19
my=lambda y:272-y*120
arrow(p,'M40 272H640')
arrow(p,'M340 295V45')
text(p,355,31,'|Fₛ|')
text(p,535,338,'ω / (1000π)',18)
points=[]
for center in [-6,0,6]:points += [(center-3,0),(center-1,1.5),(center+1,1.5),(center+3,0)]
p.append('<polyline points="'+' '.join(f'{mx(x):.1f},{my(y):.1f}' for x,y in points)+'" fill="none" stroke="#0f766e" stroke-width="3"/>')
for v in [-9,-6,-3,0,3,6,9]:text(p,mx(v),303,str(v),17)
text(p,315,my(1.5)+5,'3/2',18)
text(p,350,330,'...',18)
text(p,45,260,'...',18)
text(p,650,260,'...',18)
save('a16',p)

p=svg_start(395)
text(p,68,60,'x(n)')
arrow(p,'M45 85H270')
p.append('<circle cx="290" cy="85" r="19" fill="white" stroke="#334155" stroke-width="2"/>')
text(p,290,94,'Σ',26)
arrow(p,'M310 85H617')
text(p,610,62,'y(n)')
arrow(p,'M106 85V155')
box(p,74,155,64,45,'z⁻¹')
arrow(p,'M106 200V239H235L276 99')
text(p,233,221,'1')
arrow(p,'M470 85V150')
box(p,438,150,64,45,'z⁻¹')
arrow(p,'M470 195V220H375L305 100')
text(p,374,208,'3')
arrow(p,'M470 220V266')
box(p,438,266,64,45,'z⁻¹')
arrow(p,'M470 311V338H290V105')
text(p,379,360,'−2')
text(p,340,387,'y=x+x(n−1)+3y(n−1)−2y(n−2)',17)
save('a17',p)
print('手写重点：调制条件框图、抽样谱、直接型 I 框图。')

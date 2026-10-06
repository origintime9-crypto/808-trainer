"""由独立求解的有限零极点与 ROC 绘制第七章图；不复制资料答案图。"""
from pathlib import Path
from math import pi, cos, sin, sqrt
from html import escape

folder = Path(__file__).resolve().parents[1] / 'public' / 'figures' / 'hw7'
folder.mkdir(parents=True, exist_ok=True)

def diagram(name, zeros, poles, roc, inner=0, outer=None, note='', shade=True):
    extent=max([1]+[abs(p[0]) for p in zeros+poles]+([outer] if outer else []))
    scale=155/extent
    cx,cy=320,205
    px=lambda z:cx+z.real*scale
    py=lambda z:cy-z.imag*scale
    parts=['<svg xmlns="http://www.w3.org/2000/svg" width="680" height="445" viewBox="0 0 680 445" role="img">',
           '<rect width="680" height="445" fill="white"/>',
           '<defs><clipPath id="plot"><rect x="70" y="60" width="530" height="310"/></clipPath></defs>']
    def text(x,y,val,size=18,color='#334155',anchor='middle'):
        parts.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}" font-family="Arial,Microsoft YaHei,sans-serif" fill="{color}">{escape(val)}</text>')
    def circle(radius,fill,stroke='none',dash=''):
        parts.append(f'<circle cx="{cx}" cy="{cy}" r="{radius*scale}" fill="{fill}" stroke="{stroke}" stroke-width="1.5"'+(f' stroke-dasharray="{dash}"' if dash else '')+'/>')
    parts.append('<g clip-path="url(#plot)">')
    if shade:
        if outer is None: parts.append('<rect x="70" y="60" width="530" height="310" fill="#e6f5ef"/>')
        else: circle(outer,'#e6f5ef')
        if inner: circle(inner,'white')
    circle(1,'none','#94a3b8','4 5')
    for bound in [inner,outer]:
        if bound: circle(bound,'none','#15803d','8 5')
    parts.append('</g>')
    parts += [
        '<path d="M70 205H600 M594 201L600 205L594 209 M320 365V60 M316 66L320 60L324 66" stroke="#475569" fill="none" stroke-width="1.5"/>',
    ]
    text(625,211,'Re z')
    text(cx+32,74,'Im z')
    text(cx-14,224,'0',16)
    text(cx+scale,232,'1',16,'#64748b')
    for pts,kind in [(zeros,'zero'),(poles,'pole')]:
        for value,label,*order in pts:
            value=complex(value);x,y=px(value),py(value)
            if kind=='zero':
                parts.append(f'<circle cx="{x}" cy="{y}" r="6" fill="white" stroke="#0369a1" stroke-width="2"/>')
                text(x,y+32,label,16,'#0369a1')
            else:
                parts.append(f'<path d="M{x-6} {y-6}L{x+6} {y+6} M{x-6} {y+6}L{x+6} {y-6}" stroke="#b45309" stroke-width="2.5"/>')
                text(x,y-15,label+(' ×'+str(order[0]) if order else ''),16,'#b45309')
    text(340,30,roc,20,'#166534')
    text(340,397,'○ 零点    × 极点    '+('绿色：ROC    ' if shade else '')+'灰虚线：单位圆',17)
    if note: text(340,427,note,16)
    (folder/(name+'.svg')).write_text('\n'.join(parts+['</svg>']),encoding='utf-8')

specs=[
    ([((-3-sqrt(17))/4,'-1.781'),((-3+sqrt(17))/4,'0.281')],[(.5,'0.5')],.5,None,'ROC: |z| > 0.5','有限平面示意；本题 ROC 不含 ∞'),
    ([(-5,'-5')],[(0,'0')],0,None,'ROC: |z| > 0',''),
    ([],[(1/3,'1/3')],1/3,None,'ROC: |z| > 1/3',''),
    ([(0,'0')],[(3,'3')],0,3,'ROC: |z| < 3',''),
    ([],[(1,'1')],0,1,'ROC: |z| < 1',''),
    ([(0,'0')],[(1,'1')],1,None,'ROC: |z| > 1',''),
    ([(0,'0')],[(2,'2')],2,None,'ROC: |z| > 2',''),
    ([],[(.5,'0.5')],0,.5,'ROC: |z| < 0.5',''),
    ([(0,'0')],[(.5,'0.5')],0,.5,'ROC: |z| < 0.5',''),
    ([(.5*complex(cos(2*pi*k/10),sin(2*pi*k/10)),'') for k in range(1,10)],[(0,'0',9)],0,None,'ROC: |z| > 0','九个零点位于半径 0.5 圆上；z=0.5 为可去点'),
    ([(0,'0'),(.8,'0.8')],[(complex(.4,.4*sqrt(3)),'0.4+j0.693'),(complex(.4,-.4*sqrt(3)),'0.4−j0.693')],.8,None,'ROC: |z| > 0.8','参数示例：r=0.8，ω₀=π/3，φ=π/6，A=1'),
]
for i,(zeros,poles,inner,outer,roc,note) in enumerate(specs,1):
    diagram('a1-'+str(i),zeros,poles,roc,inner,outer,note)
diagram('a12',[(0,'0')],[((1+sqrt(5))/2,'a₁'),((1-sqrt(5))/2,'a₂')],'ROC: |z| > a₁',(1+sqrt(5))/2,None,'a₁=(1+√5)/2，a₂=(1−√5)/2')
diagram('a14',[(0,'0')],[(2,'2'),(.5,'0.5')],'极点 0.5 与 2；ROC 按题目指定',0,None,'三种 ROC：外侧、两圆之间、内侧；本图不标 ROC',False)
print('第 7 章：13 张由公式生成的零极点图。')

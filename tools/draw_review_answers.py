"""按独立解答绘制 SVG 答案图；不复用资料中有误的答案图。"""
from pathlib import Path
from html import escape

root = Path(__file__).resolve().parents[1] / 'public' / 'figures'


def svg(width=640, height=285):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img">',
            '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#334155"/></marker></defs>',
            f'<rect width="{width}" height="{height}" fill="white"/>']


def line(parts, x1, y1, x2, y2, arrow=False, color='#334155', width=1.6):
    parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"' + (' marker-end="url(#arrow)"' if arrow else '') + '/>')


def label(parts, x, y, text, size=19, anchor='middle', color='#334155'):
    parts.append(f'<text x="{x}" y="{y}" font-family="Arial, sans-serif" font-size="{size}" text-anchor="{anchor}" fill="{color}">{escape(str(text))}</text>')


def save(parts, paper, name):
    path = root / paper / (name + '.svg')
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n'.join(parts + ['</svg>']), encoding='utf-8')
    print(path)


def plot(paper, name, lo, hi, ymax, ticks, wave=None, stems=None, impulses=None):
    parts = svg()
    mx = lambda x: 52 + (x-lo) * 540/(hi-lo)
    my = lambda y: 211 - y*145/ymax
    line(parts, 32, 211, 614, 211, True)
    line(parts, mx(0), 227, mx(0), 38, True)
    label(parts, 620, 240, 'k' if stems else 't')
    label(parts, mx(0)+16, 30, 'y')
    for x in ticks:
        line(parts, mx(x), 211, mx(x), 217)
        label(parts, mx(x), 244, x, 17)
    if wave:
        coords = ' '.join(f'{mx(x)},{my(y)}' for x, y in wave)
        parts.append(f'<polyline points="{coords}" fill="none" stroke="#0f766e" stroke-width="3"/>')
    for x, value in (stems or {}).items():
        line(parts, mx(x), 211, mx(x), my(value), color='#0f766e', width=3)
        parts.append(f'<circle cx="{mx(x)}" cy="{my(value)}" r="4" fill="#0f766e"/>')
        label(parts, mx(x), my(value)-12, value)
    for x, strength in (impulses or {}).items():
        line(parts, mx(x), 211, mx(x), my(ymax*.78), True, color='#0f766e', width=2.5)
        label(parts, mx(x), my(ymax*.78)-13, f'({strength})')
    save(parts, paper, name)


plot('tk-review', 'a12', -9, 1, 3, [-8,-6,-4,-2,0], wave=[(-9,0),(-6,0),(-6,1),(-4,1),(-4,2),(-2,0),(1,0)], impulses={-8:2})
plot('tk-review', 'a13', -2, 2, 4, [-2,-1,0,1,2], stems={-1:3,1:3})
plot('tk-total', 'a2-1', -5, 1, 1.5, [-4,-3,-2,-1,0], stems={-4:1,-3:1,-2:1})
plot('tk-total', 'a2-2', -5, 5, 3, [-4,-2,0,2,4], wave=[(-5,0),(-4,0),(-2,2),(0,0),(2,2),(4,0),(5,0)])
plot('tk-total', 'a2-3', -3, 5, 8, [-2,-1,0,1,2,3,4], stems={-2:3,-1:5,0:6,1:6,2:6,3:3,4:1})
plot('tk-total', 'a2-4', -1, 4, 1.5, [0,1,2,3], wave=[(-1,0),(0,0),(1,1),(2,1),(3,0),(4,0)])

parts = svg(740, 360)
def path(points):
    coords = ' '.join(f'{x},{y}' for x,y in points)
    parts.append(f'<polyline points="{coords}" fill="none" stroke="#334155" stroke-width="1.8" marker-end="url(#arrow)"/>')
def block(x,y,text):
    parts.append(f'<rect x="{x}" y="{y}" width="80" height="40" fill="white" stroke="#334155" stroke-width="1.6"/>')
    label(parts, x+40, y+27, text)
for cx in [150,675]:
    parts.append(f'<circle cx="{cx}" cy="180" r="20" fill="white" stroke="#334155" stroke-width="1.6"/>')
    label(parts, cx, 187, 'Σ', 24)
path([(30,180),(130,180)])
path([(170,180),(230,180)])
path([(310,180),(395,180)])
path([(475,180),(655,180)])
path([(695,180),(725,180)])
path([(355,180),(355,70),(675,70),(675,160)])
path([(355,180),(355,260),(135,260),(140,198)])
path([(540,180),(540,325),(165,325),(160,198)])
block(230,160,'1/s')
block(395,160,'1/s')
block(470,50,'2')
block(230,240,'−3')
block(410,305,'−2')
for x in [355,540]:
    parts.append(f'<circle cx="{x}" cy="180" r="3.5" fill="#334155"/>')
label(parts, 34, 158, 'x(t)')
label(parts, 705, 158, 'y(t)')
label(parts, 348, 154, "q′(t)")
label(parts, 536, 154, 'q(t)')
label(parts, 583, 168, '1', 17)
save(parts, 'tk-review', 'a21')

parts = svg(640, 435)
cx,cy,radius = 285,208,155
parts.append(f'<circle cx="{cx}" cy="{cy}" r="{radius}" fill="none" stroke="#94a3b8" stroke-dasharray="5 5"/>')
line(parts, 95, cy, 493, cy, True)
line(parts, cx, 388, cx, 25, True)
label(parts, 515, cy+7, 'Re(z)', 20)
label(parts, cx+28, 22, 'Im(z)', 20)
label(parts, cx+radius, cy+29, '1', 17)
for value,depth in [(0,25),(2/3,25)]:
    x=cx+radius*value
    parts.append(f'<circle cx="{x}" cy="{cy}" r="6" fill="white" stroke="#0f766e" stroke-width="2"/>')
    label(parts, x, cy+depth, '0' if value==0 else '2/3', 17)
for value,depth in [(1/3,48),(1/2,72)]:
    x=cx+radius*value
    line(parts,x-5,cy-5,x+5,cy+5,color='#be123c',width=2)
    line(parts,x-5,cy+5,x+5,cy-5,color='#be123c',width=2)
    line(parts,x,cy+7,x,cy+depth-15,color='#cbd5e1',width=1)
    label(parts,x,cy+depth,'1/3' if value==1/3 else '1/2',17)
label(parts, 315, 418, '○ zero   × pole', 19)
save(parts,'tk-review','a24')

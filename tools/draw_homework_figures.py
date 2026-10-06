"""从核对后的公式绘制课后题答案 SVG，原题图单独裁剪。"""
from pathlib import Path
from html import escape
from math import sin, cos, exp, pi
from PIL import Image

root = Path(__file__).resolve().parents[1]
folder = root / 'public' / 'figures' / 'hw1'
folder.mkdir(parents=True, exist_ok=True)
with Image.open(root / 'work' / 'pages' / 'textbook' / 'p18.png') as im:
    im.crop((330, 975, 660, 1220)).save(folder / 'q1-a.png', optimize=True)
    im.crop((750, 975, 1060, 1220)).save(folder / 'q1-b.png', optimize=True)


def plot(name, lo, hi, ymin, ymax, ticks, points, xlabel='t'):
    width, height = 660, 310
    mx = lambda x: 60 + (x-lo)*530/(hi-lo)
    my = lambda y: 235 - (y-ymin)*185/(ymax-ymin)
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img">',
             '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#334155"/></marker></defs>',
             f'<rect width="{width}" height="{height}" fill="white"/>']
    def line(x1, y1, x2, y2, arrow=False):
        parts.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#334155" stroke-width="1.5"' + (' marker-end="url(#arrow)"' if arrow else '') + '/>')
    def text(x, y, value, anchor='middle'):
        parts.append(f'<text x="{x}" y="{y}" font-family="Arial,sans-serif" font-size="18" text-anchor="{anchor}" fill="#334155">{escape(str(value))}</text>')
    line(35, my(0), 617, my(0), True)
    line(mx(0), 252, mx(0), 27, True)
    text(632, my(0)+20, xlabel)
    text(mx(0)+18, 29, 'f')
    for x, label in ticks:
        line(mx(x), my(0), mx(x), my(0)+5)
        text(mx(x), 276, label)
    for y in ([1] if ymin == 0 else [-1, 1]):
        if ymin <= y <= ymax:
            line(mx(0)-4, my(y), mx(0), my(y))
            text(mx(0)-9, my(y)+5, y, 'end')
    coords = ' '.join(f'{mx(x):.3f},{my(y):.3f}' for x, y in points)
    parts.append(f'<polyline points="{coords}" fill="none" stroke="#0f766e" stroke-width="3"/>')
    (folder / (name+'.svg')).write_text('\n'.join(parts+['</svg>']), encoding='utf-8')


def sampled(lo, hi, fn, count=450):
    return [(lo+(hi-lo)*i/count, fn(lo+(hi-lo)*i/count)) for i in range(count+1)]


plot('a2-1', 0, 3, -.4, .5, [(0,'0'),(1,'1'),(1.5,'1.5'),(2,'2'),(3,'3')],
     [(0,0),(1,0)] + sampled(1,2,lambda t:exp(-t)*cos(2*pi*t)) + [(2,0),(3,0)])
plot('a2-2', -2, 2, 0, 1.2, [(-1,'-1'),(0,'0'),(1,'1')],
     [(-2,0),(-1,0),(-1,.5),(0,1),(1,.5),(1,0),(2,0)])
plot('a2-3', -1, 6, 0, 1.2, [(i,str(i)) for i in range(7)],
     [(-1,0)] + sampled(0,6,lambda t:max(0,sin(pi*t))))
points=[(-.5,0),(0,0)]
for k in range(4):
    points += [(k,0),(k+1,1),(k+1,0)]
plot('a2-4', -.5, 4.5, 0, 1.2, [(i,str(i)) for i in range(5)], points+[(4.5,.5)])
points=[]
for k in range(-3,3):
    y=1 if k%2==0 else -1
    points += [(k,y),(k+1,y)]
plot('a2-5', -3.5, 3.5, -1.3, 1.3, [(i,str(i)) for i in range(-3,4)], points)
plot('a2-6', -.2, 1.2, -1.3, 1.3,
     [(0,'0'),(.25,'T/4'),(.5,'T/2'),(.75,'3T/4'),(1,'T')],
     [(-.2,0)] + sampled(0,1,lambda q:sin(4*pi*q)) + [(1.2,0)], 't')
print('第 1 章：2 张原题图、6 张独立作图答案。')
folder = root / 'public' / 'figures' / 'hw3'
folder.mkdir(parents=True, exist_ok=True)
for page, name, box in [
    (77, 'q11', (245, 1188, 1160, 1715)),
    (84, 'q20', (300, 508, 620, 790)),
    (85, 'q21', (392, 542, 1000, 783)),
]:
    with Image.open(root / 'work' / 'pages' / 'textbook' / f'p{page:02d}.png') as im:
        im.crop(box).save(folder / (name+'.png'), optimize=True)
plot('a20-5', -3.5, 3.5, 0, 2.3, [(i,str(i)) for i in range(-3,4)],
     [(-3.5,0),(-3,0),(-3,1),(-2,1),(-1,.5),(-1,1.5),(0,2),(1,1.5),(1,.5),(2,1),(3,1),(3,0),(3.5,0)])
print('第 3 章：3 张原题图、偶分量答案图。')
folder = root / 'public' / 'figures' / 'hw4'
folder.mkdir(parents=True, exist_ok=True)
for page, name, box in [
    (126, 'q21', (342, 815, 1048, 1128)),
    (127, 'q22', (424, 339, 970, 675)),
]:
    with Image.open(root / 'work' / 'pages' / 'textbook' / f'p{page:02d}.png') as im:
        im.crop(box).save(folder / (name+'.png'), optimize=True)
print('第 4 章：2 张框图条件图。')
folder = root / 'public' / 'figures' / 'hw6'
folder.mkdir(parents=True, exist_ok=True)
with Image.open(root / 'work' / 'pages' / 'textbook' / 'p151.png') as im:
    im.crop((331, 380, 1040, 1010)).save(folder / 'q4.png', optimize=True)
print('第 6 章：数值序列原题图。')

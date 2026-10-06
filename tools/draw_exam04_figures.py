"""课程题库 04：原题图裁剪及独立重绘的波形、积分输出、直接型。"""
from pathlib import Path
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-04'
folder.mkdir(parents=True, exist_ok=True)
for page, no, box in [
    (15, '2-1', (487, 886, 918, 1140)),
    (16, '2-3', (380, 198, 1030, 428)),
    (16, '2-4', (540, 1060, 850, 1280)),
    (16, '2-5', (550, 1560, 850, 1750)),
    (18, '3-2', (425, 443, 1010, 642)),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/f'q{no}.png', optimize=True)

p = start(355, title='f(−2t−4) 的波形')
mx = lambda value: 62+(value+4.5)/5*610
my = lambda value: 184-76*value
label(p, 360, 29, 'f(−2t−4)：翻转、压缩、左移', 23)
line(p, 'M32 184H690', arrow=True)
line(p, f'M{mx(0)} 280V65', arrow=True)
for value, text in [(-4, '−4'), (-3.5, '−7/2'), (-3, '−3'), (-2.5, '−5/2'), (-2, '−2'), (0, '0')]:
    line(p, f'M{mx(value)} 184V190')
    label(p, mx(value), 208, text, 18)
for value in [-1, 1]:
    label(p, mx(0)-15, my(value)+5, value, 18, 'end')
    line(p, f'M{mx(-4)} {my(value)}H{mx(0)}', dash=True)
polyline(p, [(mx(x), my(y)) for x, y in [(-4.35, 0), (-4, 0), (-3.5, -1), (-3, -1)]])
polyline(p, [(mx(x), my(y)) for x, y in [(-3, 1), (-2.5, 1), (-2, 0), (-0.1, 0)]])
line(p, f'M{mx(-3)} {my(-1)}V{my(1)}', '#0f766e', dash=True)
label(p, 681, 205, 't', 20)
label(p, 360, 316, '支撑 −4..−2；t=−3 从 −1 跳到 +1', 20)
label(p, 360, 343, '原断点 a 映到 −(a+4)/2，斜率变成 −2', 18)
save(folder/'a2-1.svg', p)

p = start(325, title='积分输出 u(t+1)−u(t−1)')
mx = lambda value: 360+135*value
my = lambda value: 227-115*value
label(p, 360, 30, 'y_g(t)=u(t+1)−u(t−1)', 23)
line(p, 'M35 227H687', arrow=True)
line(p, 'M360 252V63', arrow=True)
for value in [-2, -1, 0, 1, 2]:
    label(p, mx(value), 253, str(value).replace('-', '−'), 19)
label(p, 342, my(1)+6, '1', 20, 'end')
polyline(p, [(mx(x), my(y)) for x, y in [(-2.2, 0), (-1, 0), (-1, 1), (1, 1), (1, 0), (2.2, 0)]])
label(p, 677, 255, 't', 19)
label(p, 360, 302, '高度 1，宽度 2；t>1 回到零', 21)
save(folder/'a2-5.svg', p)

p = start(455, title='H(s)=(2s+1)/(s²+5s+6) 的直接型')
def block(x, y, value):
    p.append(f'<rect x="{x}" y="{y}" width="60" height="44" fill="white" stroke="#334155" stroke-width="1.8"/>')
    label(p, x+30, y+29, value, 22)
def dot(x, y): p.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="#334155"/>')
label(p, 360, 27, '直接型：w″+5w′+6w=f', 23)
p.append('<circle cx="125" cy="185" r="20" fill="white" stroke="#334155" stroke-width="1.8"/>')
p.append('<circle cx="650" cy="85" r="20" fill="white" stroke="#334155" stroke-width="1.8"/>')
label(p, 125, 192, 'Σ', 20); label(p, 650, 92, 'Σ', 20)
label(p, 35, 178, 'f(t)', 20)
line(p, 'M55 185H104', arrow=True); label(p, 108, 176, '+', 17)
line(p, 'M145 185H210', arrow=True); label(p, 177, 166, 'x₂′', 18)
block(210, 163, '1/s'); line(p, 'M270 185H450', arrow=True); label(p, 353, 173, 'x₂', 21)
block(450, 163, '1/s'); line(p, 'M510 185H605'); label(p, 558, 173, 'x₁', 21)
dot(345, 185); dot(590, 185)
line(p, 'M345 185V85H400', arrow=True); block(400, 63, '2')
line(p, 'M460 85H630', arrow=True); label(p, 631, 74, '+', 17)
line(p, 'M590 185V169', arrow=True); block(560, 125, '1')
line(p, 'M590 125V114H650V105', arrow=True); label(p, 665, 113, '+', 17)
line(p, 'M670 85H702', arrow=True); label(p, 690, 68, 'y(t)', 19)
line(p, 'M345 185V285H280', arrow=True); block(220, 263, '5')
line(p, 'M220 285H125V205', arrow=True); label(p, 110, 215, '−', 19)
line(p, 'M590 185V365H280', arrow=True); block(220, 343, '6')
line(p, 'M220 365H85V125H125V165', arrow=True); label(p, 109, 160, '−', 19)
p.append('<circle cx="85" cy="185" r="5" fill="white"/>')
line(p, 'M85 179V191')
label(p, 360, 410, 'x₁′=x₂；x₂′=f−5x₂−6x₁；y=x₁+2x₂', 20)
label(p, 360, 438, '圆点是分支连接；跨线处不连接', 18)
save(folder/'a31-3.svg', p)
print('课程题库 04：五幅原题图、变换波形、积分输出、直接型框图。')

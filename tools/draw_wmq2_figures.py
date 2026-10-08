"""教材第二章：原题图裁剪及独立卷积图，不复制书中错误答案。"""
from pathlib import Path
from math import cos, pi
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root / 'public' / 'figures' / 'wmq2'
folder.mkdir(parents=True, exist_ok=True)
for page, crops in [
    (39, [('q2-1', (755, 1530, 1205, 1710))]),
    (40, [('q2-2', (195, 745, 575, 1070))]),
    (45, [('q2-8', (370, 1465, 1050, 1670))]),
    (51, [('q2-14', (400, 795, 995, 1075))]),
    (53, [('q2-16', (630, 305, 1170, 525))]),
    (54, [('q2-18-a', (275, 820, 560, 1025)), ('q2-18-b', (570, 815, 1100, 1030))]),
]:
    with Image.open(root / 'work' / 'pages' / 'textbook' / f'p{page}.png') as im:
        for name, box in crops:
            im.crop(box).save(folder / (name + '.png'), optimize=True)


def clean_label(parts, x, y, text, size=21, anchor='middle'):
    label(parts, x, y, text, size, anchor)
    parts[-1] = parts[-1].replace('fill="#334155"', 'fill="#334155" stroke="white" stroke-width="5" paint-order="stroke fill" stroke-linejoin="round"')


def plot(name, title, xspan, ymax, points, ticks, yticks, caption):
    parts = start(350, 660, title)
    mx = lambda x: 64 + (x-xspan[0])/(xspan[1]-xspan[0])*526
    my = lambda y: 258-y/ymax*165
    label(parts, 330, 34, title, 23)
    line(parts, 'M38 258H617', arrow=True)
    line(parts, f'M{mx(0)} 285V57', arrow=True)
    label(parts, 632, 264, 't', 22)
    for x, text in ticks:
        line(parts, f'M{mx(x)} 258v5')
        clean_label(parts, mx(x), 290, text)
    polyline(parts, [(mx(x), my(y)) for x, y in points], width=3.2)
    for y, text in yticks:
        line(parts, f'M{mx(0)-4} {my(y)}h4')
        clean_label(parts, mx(0)-10, my(y)+7, text, anchor='end')
    label(parts, 330, 331, caption, 19)
    save(folder / (name+'.svg'), parts)


plot('a2-8', 'h₂ 宽度为 3：三个矩形平移相加', (-0.6, 5.6), 3.4,
     [(-.6,0),(0,0),(0,1),(1,1),(1,2),(2,2),(2,3),(3,3),(3,2),(4,2),(4,1),(5,1),(5,0),(5.6,0)],
     [(i,str(i)) for i in range(6)], [(1,'1'),(2,'2'),(3,'3')], '开区间高度 1、2、3、2、1；竖线表示跳变')
plot('a2-15-1', '以 t=0 为起点：条件零输入响应', (-0.35, 1.5), 1.25,
     [(0,1),(1,0),(1.5,0)], [(0,'0'),(1,'1')], [(1,'1')], '只画 t≥0；初态由过去输入形成，无额外初态')
plot('a2-15-2', '零状态：宽度 2 与宽度 1 矩形卷积', (-0.4, 3.5), 1.25,
     [(-.4,0),(0,0),(1,1),(2,1),(3,0),(3.5,0)], [(i,str(i)) for i in range(4)], [(1,'1')], '末段为 3−t，t=3 连续回到零')
plot('a2-16', '因果、零状态条件下的新输入响应', (-0.4, 2.5), 0.8,
     [(-.4,0),(0,0)]+[(i/100,(1-cos(pi*i/100))/pi) for i in range(1,201)]+[(2.5,0)],
     [(0,'0'),(1,'1'),(2,'2')], [(2/pi,'2/π')], '条件解：(1−cos πt)/π，仅在 0<t<2 非零')
print('教材第二章补题图已生成：7幅原题裁图、4幅独立答案SVG。')

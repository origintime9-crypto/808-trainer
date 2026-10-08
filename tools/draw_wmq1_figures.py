"""教材第一章补题：裁剪已目视核对的题图，按独立解答绘制答案图。"""
from pathlib import Path
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root / 'public' / 'figures' / 'wmq1'
folder.mkdir(parents=True, exist_ok=True)
for page, crops in [
    (21, [('q1-5', (815, 1200, 1180, 1455))]),
    (22, [('q1-6', (185, 825, 490, 1080))]),
    (23, [('q1-9-1', (345, 1405, 625, 1670)), ('q1-9-2', (685, 1405, 1070, 1670))]),
]:
    with Image.open(root / 'work' / 'pages' / 'textbook' / f'p{page}.png') as im:
        for name, box in crops:
            im.crop(box).save(folder / (name + '.png'), optimize=True)


def clean_label(parts, x, y, text, size=21, anchor='middle'):
    label(parts, x, y, text, size, anchor)
    parts[-1] = parts[-1].replace('fill="#334155"', 'fill="#334155" stroke="white" stroke-width="5" paint-order="stroke fill" stroke-linejoin="round"')


def panel(parts, title, xspan, yrange, segments, xticks, yticks, top=0, caption=''):
    lo, hi = xspan
    ymin, ymax = yrange
    mx = lambda x: 58 + (x - lo) / (hi - lo) * 535
    my = lambda y: top + 75 + (ymax - y) / (ymax - ymin) * 210
    label(parts, 330, top + 33, title, 23)
    line(parts, f'M38 {my(0)}H617', arrow=True)
    line(parts, f'M{mx(0)} {top+292}V{top+52}', arrow=True)
    label(parts, 632, my(0) + 7, 't', 22)
    for x, text in xticks:
        line(parts, f'M{mx(x)} {my(0)}v5')
        clean_label(parts, mx(x), my(0) + 27, text)
    for segment in segments:
        polyline(parts, [(mx(x), my(y)) for x, y in segment], width=3.2)
    for y, text in yticks:
        line(parts, f'M{mx(0)-4} {my(y)}h4')
        clean_label(parts, mx(0) - 10, my(y) + 7, text, anchor='end')
    label(parts, 330, top + 327, caption, 20)


for name, title, xspan, segments, ticks, caption in [
    ('a1-5-1', 'f(2t−3)', (-0.4, 2.8), [[(-0.4, 0), (1, 0), (2, 1), (2, 0), (2.8, 0)]], [(0, '0'), (1, '1'), (2, '2')], '非零区间 (1, 2)，原幅度 A 保留'),
    ('a1-5-2', 'f(−2−t)u(−t)', (-3.8, 0.6), [[(-3.8, 0), (-3, 0), (-3, 1), (-1, 0), (0.6, 0)]], [(-3, '−3'), (-1, '−1'), (0, '0')], '非零区间 (−3, −1)，门函数不再截断'),
    ('a1-5-3', 'f(2−t)u(2−t)', (-0.4, 2.8), [[(-0.4, 0), (1, 0), (1, 1), (2, 0.5), (2, 0), (2.8, 0)]], [(0, '0'), (1, '1'), (2, '2')], 't=2 左极限为 A/2，之后为零'),
    ('a1-6', '由 g(t)=f(5−2t) 反求 f(t)', (-1.8, 3.8), [[(-1.8, 0), (-1, 0), (-1, 1), (1, 1), (3, 0), (3.8, 0)]], [(-1, '−1'), (0, '0'), (1, '1'), (3, '3')], '关键点按 t=(5−τ)/2 反向映射'),
]:
    parts = start(350, 660, title)
    panel(parts, title, xspan, (-0.12, 1.18), segments, ticks, [(0.5, 'A/2'), (1, 'A')], caption=caption)
    save(folder / (name + '.svg'), parts)


for no, even, odd in [
    ('1', [[(-1.6, 0), (-1, 0), (-1, 0.5), (0, 0), (1, 0.5), (1, 0), (1.6, 0)]],
     [[(-1.6, 0), (-1, 0), (-1, -0.5), (1, 0.5), (1, 0), (1.6, 0)]]),
    ('2', [[(-1.8, 0), (-1.5, 0), (-1.5, -0.5), (-0.5, -0.5), (-0.5, 0.5), (0.5, 0.5), (0.5, -0.5), (1.5, -0.5), (1.5, 0), (1.8, 0)]],
     [[(-1.8, 0), (-1.5, 0), (-1.5, 0.5), (-0.5, -0.5), (0.5, 0.5), (1.5, -0.5), (1.5, 0), (1.8, 0)]]),
]:
    parts = start(700, 660, '奇偶分量；竖线只表示左右极限的跳变')
    ticks = [(-1, '−1'), (0, '0'), (1, '1')] if no == '1' else [(-1.5, '−3/2'), (-0.5, '−1/2'), (0.5, '1/2'), (1.5, '3/2')]
    for title, segments, top in [('偶分量 fₑ(t)', even, 0), ('奇分量 fₒ(t)', odd, 350)]:
        panel(parts, title, (-1.8, 1.8), (-0.75, 0.75), segments, ticks, [(-0.5, '−1/2'), (0.5, '1/2')], top, '竖线表示跳变，不指定跳变单点的取值')
    save(folder / f'a1-9-{no}.svg', parts)


def box(parts, x, y, w, text):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="44" rx="5" fill="#f0fdfa" stroke="#0f766e" stroke-width="2"/>')
    label(parts, x+w/2, y+30, text, 24)


def summation(parts, x, y):
    parts.append(f'<circle cx="{x}" cy="{y}" r="16" fill="white" stroke="#334155" stroke-width="2"/>')
    label(parts, x, y+7, '+', 23)


def dot(parts, x, y):
    parts.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#334155"/>')


parts = start(350, 720, '一积分器：v′=x/4−5v/2，y=v+x/2')
label(parts, 360, 32, 'v′=x/4−5v/2，y=v+x/2', 25)
for x, text in [(80, '1/4'), (300, '∫')]: box(parts, x, 98, 80, text)
box(parts, 440, 42, 80, '1/2')
box(parts, 310, 228, 90, '−5/2')
summation(parts, 235, 120); summation(parts, 580, 120)
line(parts, 'M25 120H80', arrow=True); label(parts, 24, 103, 'x', 23)
line(parts, 'M160 120H219', arrow=True); line(parts, 'M251 120H300', arrow=True)
label(parts, 273, 102, 'v′', 21)
line(parts, 'M380 120H564', arrow=True); label(parts, 418, 102, 'v', 23)
line(parts, 'M596 120H690', arrow=True); label(parts, 685, 102, 'y', 23)
line(parts, 'M55 120V64H440', arrow=True)
line(parts, 'M520 64H580V104', arrow=True)
line(parts, 'M425 120V250H400', arrow=True)
line(parts, 'M310 250H235V136', arrow=True)
dot(parts, 55, 120); dot(parts, 425, 120)
label(parts, 360, 322, '反馈支路内已含负系数，两个加法器均取加号', 21)
save(folder / 'a1-12-1.svg', parts)

parts = start(445, 720, '双积分器：v′=x−4v−2w，w′=v，y=v+w')
label(parts, 360, 31, 'v′=x−4v−2w，w′=v，y=v+w', 25)
summation(parts, 145, 180); summation(parts, 605, 180)
box(parts, 230, 158, 80, '∫'); box(parts, 410, 158, 80, '∫')
box(parts, 265, 270, 80, '−4'); box(parts, 265, 344, 80, '−2')
line(parts, 'M25 180H129', arrow=True); label(parts, 25, 164, 'x', 23)
line(parts, 'M161 180H230', arrow=True); label(parts, 191, 162, 'v′', 23)
line(parts, 'M310 180H410', arrow=True); label(parts, 352, 162, 'v', 23)
line(parts, 'M490 180H589', arrow=True); label(parts, 542, 162, 'w', 23)
line(parts, 'M621 180H695', arrow=True); label(parts, 690, 164, 'y', 23)
line(parts, 'M360 180V87H605V164', arrow=True)
line(parts, 'M360 180V292H345', arrow=True)
line(parts, 'M265 292H145V196', arrow=True)
line(parts, 'M520 180V366H345', arrow=True)
line(parts, 'M265 366H95V227H145', arrow=True)
line(parts, 'M145 227V207')
dot(parts, 360, 180); dot(parts, 520, 180); dot(parts, 145, 227)
label(parts, 360, 426, '两路负反馈汇入输入加法器；输出为 v+w', 21)
save(folder / 'a1-12-2.svg', parts)
print('教材补题图已生成：4幅原题裁图、8幅独立答案SVG。')

"""课程题库 05：原图裁剪、双极卷积及纠正输出系数后的直接型。"""
from pathlib import Path
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-05'
folder.mkdir(parents=True, exist_ok=True)
for page, no, box in [
    (20, '2-1', (420, 112, 975, 382)),
    (20, '2-3', (486, 1403, 808, 1479)),
    (21, '2-5', (504, 1330, 896, 1510)),
    (22, '3-2', (400, 1370, 991, 1590)),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/f'q{no}.png', optimize=True)

p = start(430, title='f(t)*h(t) 的双极三角波')
mx = lambda value: 140+160*value
my = lambda value: 219-63*value
label(p, 360, 30, '双极卷积：支撑 0..3，正负面积相消', 23)
line(p, 'M44 219H695', arrow=True)
line(p, 'M140 362V57', arrow=True)
for value, text in [(0, '0'), (1, '1'), (1.5, '3/2'), (2, '2'), (3, '3')]:
    line(p, f'M{mx(value)} 219V226')
    label(p, mx(value), 247, text, 19)
for value in [-2, 2]:
    label(p, 122, my(value)+6, str(value).replace('-', '−'), 20, 'end')
    line(p, f'M140 {my(value)}H{mx(1 if value > 0 else 2)}', dash=True)
polyline(p, [(mx(x), my(y)) for x, y in [(-0.5, 0), (0, 0), (1, 2), (2, -2), (3, 0), (3.4, 0)]])
line(p, f'M{mx(1)} 219V{my(2)}', dash=True)
line(p, f'M{mx(2)} 219V{my(-2)}', dash=True)
label(p, 684, 245, 't', 19)
label(p, 360, 394, '分段斜率：+2、−4、+2；过零点 t=3/2', 21)
label(p, 360, 421, '断点 0、1、2、3 的值依次为 0、2、−2、0', 18)
save(folder/'a2-1.svg', p)

p = start(590, title='H(z)=(z²−2z)/(z³+3z²+2z+1) 的条件直接型')
def block(x, y, value):
    p.append(f'<rect x="{x}" y="{y}" width="60" height="44" fill="white" stroke="#334155" stroke-width="1.8"/>')
    label(p, x+30, y+29, value, 22)
def dot(x, y):
    p.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="#334155"/>')
label(p, 360, 28, '直接型：以原题 2s→2z 为条件', 23)
label(p, 360, 55, '输出只有 x₃−2x₂，x₁ 不接输出', 21)
p.append('<circle cx="112" cy="222" r="20" fill="white" stroke="#334155" stroke-width="1.8"/>')
p.append('<circle cx="665" cy="105" r="20" fill="white" stroke="#334155" stroke-width="1.8"/>')
label(p, 112, 229, 'Σ', 20); label(p, 665, 112, 'Σ', 20)
label(p, 30, 206, 'f(k)', 20)
line(p, 'M48 222H92', arrow=True); label(p, 94, 210, '+', 18)
line(p, 'M132 222H164', arrow=True); label(p, 148, 200, 'w', 18)
block(164, 200, 'z⁻¹'); line(p, 'M224 222H324', arrow=True)
block(324, 200, 'z⁻¹'); line(p, 'M384 222H484', arrow=True)
block(484, 200, 'z⁻¹'); line(p, 'M544 222H593')
for x, text in [(275, 'x₃'), (434, 'x₂'), (589, 'x₁')]:
    dot(x, 222); label(p, x, 207, text, 21)
line(p, 'M275 222V105H645', arrow=True); label(p, 645, 94, '+', 18)
line(p, 'M434 222V176H485', arrow=True); block(485, 154, '2')
line(p, 'M545 176H665V125', arrow=True); label(p, 682, 134, '−', 20)
line(p, 'M685 105H708', arrow=True); label(p, 687, 82, 'y(k)', 20)

# 反馈分别经过 3、2、1 倍并取负；跨线不连接。
line(p, 'M275 222V314H224', arrow=True); block(164, 292, '3')
line(p, 'M164 314H112V242', arrow=True); label(p, 128, 254, '−', 19)
line(p, 'M434 222V395H224', arrow=True); block(164, 373, '2')
line(p, 'M164 395H74V258H97V236', arrow=True); label(p, 84, 252, '−', 19)
line(p, 'M589 222V476H224', arrow=True); block(164, 454, '1')
line(p, 'M164 476H33V156H112V202', arrow=True); label(p, 129, 194, '−', 19)
label(p, 360, 530, 'w=f−3w[k−1]−2w[k−2]−w[k−3]', 21)
label(p, 360, 557, 'x₁[k+1]=x₂[k]；x₂[k+1]=x₃[k]', 21)
label(p, 360, 584, '圆点是连接；跨线不连接；三阶延时链无直通', 18)
save(folder/'a2-3.svg', p)
print('课程题库 05：四幅原题图、一幅卷积波形、一幅直接型答案图。')

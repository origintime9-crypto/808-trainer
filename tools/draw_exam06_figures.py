"""课程题库 06 原图与独立求得的卷积、积分器状态、双线性形式幅相图。"""
from pathlib import Path
from math import tan, pi
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-06'
folder.mkdir(parents=True, exist_ok=True)
for page, no, box in [
    (23, '1-4', (503, 1122, 936, 1330)),
    (24, '2-1', (465, 576, 925, 817)),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/f'q{no}.png', optimize=True)

p = start(390, title='正负矩形与宽2单位矩形的卷积')
mx = lambda value: 270+118*value
my = lambda value: 198-103*value
label(p, 360, 30, '原图卷积：t=0 正峰值，t=2 负峰值', 23)
line(p, 'M47 198H690', arrow=True)
line(p, 'M270 330V63', arrow=True)
for value in [-1, 0, 1, 2, 3]:
    line(p, f'M{mx(value)} 198V205')
    label(p, mx(value), 229, str(value).replace('-', '−'), 19)
for value in [-1, 1]:
    label(p, 253, my(value)+7, str(value).replace('-', '−'), 20, 'end')
polyline(p, [(mx(x), my(y)) for x, y in [(-1.65, 0), (-1, 0), (0, 1), (2, -1), (3, 0), (3.45, 0)]])
line(p, f'M{mx(2)} 198V{my(-1)}', dash=True)
label(p, 680, 228, 't', 20)
label(p, 360, 362, '原点重叠正矩形；t=2 只重叠负矩形', 21)
label(p, 360, 385, '支撑 −1..3，过零点 t=1，正负面积相消', 18)
save(folder/'a2-1.svg', p)

def block(parts, x, y, value, width=60):
    parts.append(f'<rect x="{x}" y="{y}" width="{width}" height="44" fill="white" stroke="#334155" stroke-width="1.8"/>')
    label(parts, x+width/2, y+29, value, 22)
def dot(parts, x, y):
    parts.append(f'<circle cx="{x}" cy="{y}" r="3.5" fill="#334155"/>')
def summer(parts, x, y):
    parts.append(f'<circle cx="{x}" cy="{y}" r="20" fill="white" stroke="#334155" stroke-width="1.8"/>')
    label(parts, x, y+7, 'Σ', 20)

p = start(570, title='三积分器的状态方程：反馈1、3、2')
label(p, 360, 28, 'H(s)=(s²+1)/(s³+2s²+3s+1)', 23)
label(p, 360, 56, '状态从左到右为 x₃、x₂、x₁；y=x₁+x₃', 21)
summer(p, 112, 222); summer(p, 665, 105)
label(p, 30, 206, 'f(t)', 20)
line(p, 'M48 222H92', arrow=True); label(p, 94, 210, '+', 18)
line(p, 'M132 222H164', arrow=True); label(p, 148, 200, 'w‴', 18)
block(p, 164, 200, '1/s'); line(p, 'M224 222H324', arrow=True)
block(p, 324, 200, '1/s'); line(p, 'M384 222H484', arrow=True)
block(p, 484, 200, '1/s'); line(p, 'M544 222H593')
for x, text in [(275, 'x₃'), (434, 'x₂'), (589, 'x₁')]:
    dot(p, x, 222); label(p, x, 207, text, 21)
line(p, 'M275 222V105H645', arrow=True); label(p, 645, 94, '+', 18)
line(p, 'M589 222V176H665V125', arrow=True); label(p, 682, 134, '+', 19)
line(p, 'M685 105H708', arrow=True); label(p, 687, 82, 'y(t)', 20)
line(p, 'M275 222V314H224', arrow=True); block(p, 164, 292, '2')
line(p, 'M164 314H112V242', arrow=True); label(p, 128, 254, '−', 19)
line(p, 'M434 222V395H224', arrow=True); block(p, 164, 373, '3')
line(p, 'M164 395H74V258H97V236', arrow=True); label(p, 84, 252, '−', 19)
line(p, 'M589 222V476H224', arrow=True); block(p, 164, 454, '1')
line(p, 'M164 476H33V156H112V202', arrow=True); label(p, 129, 194, '−', 19)
label(p, 360, 528, 'x₁′=x₂；x₂′=x₃；x₃′=f−x₁−3x₂−2x₃', 21)
label(p, 360, 556, '圆点连接；反馈 2 接 x₃，反馈 3 接 x₂', 18)
save(folder/'a2-4.svg', p)

p = start(410, title='双线性微分器的单延时实现')
label(p, 360, 30, 'H_d(z)=(2/Tₛ)(1−z⁻¹)/(1+z⁻¹)', 23)
summer(p, 150, 145); summer(p, 420, 145)
label(p, 36, 126, 'f(k)', 21)
line(p, 'M57 145H130', arrow=True); label(p, 130, 131, '+', 18)
line(p, 'M170 145H400', arrow=True); label(p, 285, 126, 'w(k)', 21); dot(p, 285, 145)
line(p, 'M440 145H502', arrow=True); label(p, 462, 125, 'w−x', 18)
block(p, 502, 123, '2/Tₛ', 80); line(p, 'M582 145H690', arrow=True); label(p, 661, 126, 'y(k)', 20)
line(p, 'M285 145V250', arrow=True); block(p, 255, 250, 'z⁻¹')
line(p, 'M285 294V320'); dot(p, 285, 320); label(p, 321, 307, 'x(k)', 20)
line(p, 'M285 320H150V165', arrow=True); label(p, 170, 180, '−', 20)
line(p, 'M285 320H420V165', arrow=True); label(p, 438, 180, '−', 20); label(p, 400, 132, '+', 18)
label(p, 360, 371, 'x(k+1)=f(k)−x(k)；y(k)=(2/Tₛ)[f(k)−2x(k)]', 21)
label(p, 360, 400, '极点 −1 位于单位圆上，因果实现不稳定', 19)
save(folder/'a32-1.svg', p)

p = start(490, title='双线性微分器的单位圆形式幅相图，普通DTFT不存在')
label(p, 360, 30, '单位圆形式代数值：j(2/Tₛ)tan(Ω/2)', 23)
label(p, 194, 69, '|形式值|/(2/Tₛ)', 21)
label(p, 536, 69, '形式相位 φ(Ω)', 21)
magx = lambda value: 194+130*value
magy = lambda value: 357-68*value
phasex = lambda value: 536+130*value
phasey = lambda value: 270-125*value
line(p, 'M46 357H349', arrow=True)
line(p, 'M194 376V88', arrow=True)
line(p, 'M391 270H689', arrow=True)
line(p, 'M536 378V93', arrow=True)
for value, text in [(-1, '−1'), (-0.5, '−1/2'), (0, '0'), (0.5, '1/2'), (1, '1')]:
    label(p, magx(value), 382, text, 17)
    label(p, phasex(value), 295, text, 17)
label(p, 335, 407, 'Ω/π', 18); label(p, 677, 322, 'Ω/π', 18)
for value in [1, 2, 3]:
    label(p, 178, magy(value)+6, str(value), 17, 'end')
    line(p, f'M64 {magy(value)}H324', dash=True)
for value in [-1, 1]:
    line(p, f'M{magx(value)} 88V357', dash=True)
points = [(magx(value), magy(abs(tan(pi*value/2)))) for value in [j/100 for j in range(-85, 86)]]
polyline(p, points)
label(p, 88, 82, '↑∞', 20); label(p, 300, 82, '∞↑', 20)
polyline(p, [(phasex(-1), phasey(-0.5)), (phasex(0), phasey(-0.5))])
polyline(p, [(phasex(0), phasey(0.5)), (phasex(1), phasey(0.5))])
label(p, 519, phasey(0.5)-12, 'π/2', 18, 'end')
label(p, 519, phasey(-0.5)+25, '−π/2', 18, 'end')
for x, y in [(phasex(0), phasey(-0.5)), (phasex(0), phasey(0.5)), (phasex(-1), phasey(-0.5)), (phasex(1), phasey(0.5))]:
    p.append(f'<circle cx="{x}" cy="{y}" r="4" fill="white" stroke="#0f766e" stroke-width="2"/>')
label(p, 360, 446, '幅度非负且偶对称；负频率相位 −π/2，正频率 +π/2', 20)
label(p, 360, 475, 'Ω=0 相位未定义；±π 奇异；普通冲激响应 DTFT 不收敛', 18)
save(folder/'a32-2.svg', p)
print('课程题库 06：两幅原图，卷积、三积分器、双线性单延时和形式幅相四幅答案图。')

"""课程14：保留原Sa和离散框图；绘功率、幅相及持续振荡答案。"""
from pathlib import Path
from math import cos
from PIL import Image
from figure_svg import start, line, label, polyline, save, spectrum

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-14'
folder.mkdir(parents=True, exist_ok=True)
for page, box, name in [
    (61, (430, 992, 955, 1293), 'q2-2.png'),
    (62, (424, 378, 963, 612), 'q3-1.png'),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name, optimize=True)

p = start(365, title='初值0，两秒后持续振荡，无终值')
mx = lambda t: 58+49*t
my = lambda y: 177-155*y
label(p, 360, 29, '初值0；t>2后仍有非零振荡幅度，终值不存在', 22)
line(p, 'M38 177H690', arrow=True)
line(p, 'M58 281V61', arrow=True)
points = []
for i in range(601):
    tt = i/50
    value = (1-cos(2*tt))/4 if tt <= 2 else (cos(2*(tt-2))-cos(2*tt))/4
    points.append((mx(tt), my(value)))
polyline(p, points)
for tt in [0, 2, 4, 6, 8, 10, 12]:
    line(p, f'M{mx(tt)} 177V183')
    label(p, mx(tt), 207, str(tt), 18)
line(p, f'M{mx(2)} 72V279', width=1, dash=True)
label(p, 43, my(.5)+5, '1/2', 17, 'end')
label(p, 43, my(-.5)+5, '−1/2', 17, 'end')
label(p, 689, 207, 't', 19)
label(p, 360, 319, '尾部=(sin2/2)sin(2t−2)，虚轴极点未消去', 19)
label(p, 360, 347, 's→0的形式极限0不能替代不存在的时域终值', 18)
save(folder/'a1-4.svg', p)

p = start(510, title='单边实谐波幅度3、1、2，相位0、−π/3、π/3')
mx = lambda n: 68+62*n
label(p, 360, 29, '单边幅度与相位：ω₀=1 rad/s', 22)
line(p, 'M45 213H679', arrow=True)
line(p, 'M68 235V62', arrow=True)
label(p, 101, 73, '幅度Aₙ', 18)
for n, amp, phase in [(1, 3, '0'), (5, 1, '−π/3'), (8, 2, 'π/3')]:
    y = 213-40*amp
    line(p, f'M{mx(n)} 213V{y}', '#0f766e', 3, True)
    label(p, mx(n), y-12, str(amp), 19)
for n in [0, 1, 5, 8]:
    label(p, mx(n), 240, str(n), 18)
label(p, 692, 239, 'ω', 20)
line(p, 'M45 388H679', arrow=True)
line(p, 'M68 444V280', arrow=True)
label(p, 101, 294, '相位φₙ', 18)
for n, y, text in [(1, 388, '0'), (5, 427, '−π/3'), (8, 349, 'π/3')]:
    if y != 388: line(p, f'M{mx(n)} 388V{y}', '#0f766e', 3, True)
    else: p.append(f'<circle cx="{mx(n)}" cy="388" r="4" fill="#0f766e"/>')
    label(p, mx(n), y+23 if y>388 else y-12, text, 19)
    label(p, mx(n)+15, 382, str(n), 17)
label(p, 692, 414, 'ω', 20)
label(p, 360, 485, '其他谐波幅度为0，相位未定义；实幅度为2|Cₙ|', 18)
save(folder/'a2-1-1.svg', p)

p = start(350, title='单边谐波功率9/2、1/2、2，总平均功率7')
label(p, 360, 30, '单边谐波平均功率：Pₙ=Aₙ²/2', 22)
line(p, 'M45 245H681', arrow=True)
line(p, 'M68 268V59', arrow=True)
for n, power, text in [(1, 4.5, '9/2'), (5, .5, '1/2'), (8, 2, '2')]:
    y = 245-34*power
    line(p, f'M{mx(n)} 245V{y}', '#0f766e', 3, True)
    label(p, mx(n), y-14, text, 20)
    label(p, mx(n), 272, str(n), 18)
label(p, 692, 273, 'ω', 20)
label(p, 360, 308, '总功率7；此处是每个实谐波的单边平均功率', 19)
label(p, 360, 336, '双边PSD每侧冲激强度另为2π|Cₙ|²', 18)
save(folder/'a2-1-2.svg', p)

spectrum(folder/'a2-2.svg', 'F(jω)为单位高门频谱', 1.5, 1.3,
         [[(-1.5, 0), (-1, 0)], [(-1, 0), (-1, 1), (1, 1), (1, 0)], [(1, 0), (1.5, 0)]],
         [-1, 0, 1], [1], '边缘对称值1/2；单点不影响反演', axis_label='ω/ωc')

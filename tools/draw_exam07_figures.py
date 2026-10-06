"""第七套（原卷未编号）：保留五幅原图，绘制独立求解的阶梯及波形变换。"""
from pathlib import Path
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-07'
folder.mkdir(parents=True, exist_ok=True)
for page, no, box in [
    (30, '2-2', (516, 552, 926, 720)),
    (31, '2-3', (367, 375, 1045, 561)),
    (31, '2-4', (579, 1177, 867, 1377)),
    (33, '2-5', (376, 620, 1115, 787)),
    (34, '3-2', (400, 1380, 972, 1547)),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/f'q{no}.png', optimize=True)

p = start(380, title='每两秒累加一个阶跃的拉氏逆变换')
mx = lambda value: 117+53*value
my = lambda value: 282-39*value
label(p, 360, 29, 'f(t)=Σₙ≥₀ u(t−2n)：右连续画图', 24)
line(p, 'M42 282H689', arrow=True)
line(p, 'M117 301V63', arrow=True)
polyline(p, [(46, my(0)), (mx(0), my(0))])
for j in range(5):
    polyline(p, [(mx(2*j), my(j+1)), (mx(2*j+2), my(j+1))])
    line(p, f'M{mx(2*j)} {my(j)}V{my(j+1)}', '#0f766e', 2.6)
    label(p, mx(2*j), 312, str(2*j), 20)
    label(p, 98, my(j+1)+7, str(j+1), 20)
    p.append(f'<circle cx="{mx(2*j)}" cy="{my(j+1)}" r="4" fill="#0f766e"/>')
    p.append(f'<circle cx="{mx(2*j+2)}" cy="{my(j+1)}" r="4" fill="white" stroke="#0f766e" stroke-width="2"/>')
label(p, 669, 77, '…', 25)
label(p, 679, 312, 't/s', 20)
label(p, 360, 352, '跳点单点值不改变 LT；对称反演取左右平均', 20)
save(folder/'a2-1.svg', p)

p = start(380, title='x(1−2t)的反转压缩波形')
mx = lambda value: 153+404*value
my = lambda value: 264-86*value
label(p, 360, 29, 'f(t)=x(1−2t)：支撑 0..1，谷底 1/2', 24)
line(p, 'M44 264H688', arrow=True)
line(p, 'M153 284V55', arrow=True)
polyline(p, [(47, 264), (mx(0), 264)])
polyline(p, [(mx(0), my(2)), (mx(.5), my(1)), (mx(1), my(2))])
polyline(p, [(mx(1), 264), (685, 264)])
for value in [0, 1]:
    line(p, f'M{mx(value)} 264V{my(2)}', '#0f766e', 2.6)
    p.append(f'<circle cx="{mx(value)}" cy="{my(2)}" r="4" fill="white" stroke="#0f766e" stroke-width="2"/>')
line(p, f'M{mx(.5)} 264V{my(1)}', dash=True)
for value, text in [(0, '0'), (.5, '1/2'), (1, '1')]:
    label(p, mx(value), 298, text, 21)
for value in [1, 2]:
    label(p, 133, my(value)+7, str(value), 21)
label(p, 676, 298, 't', 21)
label(p, 360, 335, 't=0、1 处发生跳变；内部两端为 2，中心为 1', 20)
label(p, 360, 364, '原点对称反演值为 (0+2)/2=1', 20)
save(folder/'a2-4.svg', p)

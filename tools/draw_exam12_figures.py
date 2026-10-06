"""按课程12原式绘三种离散采样答案，不将序列画成连续曲线。"""
from pathlib import Path
from fractions import Fraction
from figure_svg import start, line, label, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-12'
folder.mkdir(parents=True, exist_ok=True)
for letter, step in [('a', Fraction(1, 4)), ('b', Fraction(1, 2)), ('c', Fraction(1, 1))]:
    p = start(350, title=f'连续三角信号以{float(step):g}秒采样，下标k=0为原点')
    label(p, 360, 30, f'Tₛ={float(step):g} s：x[k]=x(kTₛ)', 22)
    mx = lambda k: 360+48*k
    my = lambda y: 238-130*float(y)
    line(p, 'M45 238H686', arrow=True)
    line(p, 'M360 264V60', arrow=True)
    label(p, 694, 266, 'k', 20)
    for k in range(-6, 7):
        value = max(1-abs(k*step), 0)
        x, y = mx(k), my(value)
        if value:
            line(p, f'M{x} 238V{y}', '#0f766e', 2.6)
            label(p, x+7 if k == 0 else x, y-12, str(value), 17, 'start' if k == 0 else 'middle')
        p.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#0f766e"/>')
        line(p, f'M{x} 238V244')
        label(p, x, 269, str(k).replace('-', '−'), 17)
    label(p, 348, 72, 'x[k]', 18, 'end')
    label(p, 360, 306, '两端采到0；中间峰值1在k=0，带外样值为0', 19)
    label(p, 360, 331, '点和样值棒表示离散序列，不连接为连续波形', 17)
    save(folder/f'a2-3{letter}.svg', p)

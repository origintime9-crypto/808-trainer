"""课程11：保留原零极点图，画含提前负矩形的移位叠加答案。"""
from pathlib import Path
from math import exp
from PIL import Image
from figure_svg import start, line, label, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-11'
folder.mkdir(parents=True, exist_ok=True)
Image.open(root/'work'/'pages'/'tk-exams'/'p55.png').crop((518, 944, 894, 1205)).save(folder/'q2-2.png', optimize=True)

p = start(380, title='矩形输入的响应含0到1之间的提前负矩形')
mx = lambda x: 130+95*x
my = lambda y: 185-100*y
label(p, 360, 28, 'y=g(t−1)−g(t−2)：提前负矩形不能遗漏', 22)
line(p, 'M38 185H694', arrow=True)
line(p, 'M130 310V58', arrow=True)
polyline(p, [(40, my(0)), (mx(0), my(0))])
polyline(p, [(mx(0), my(-1)), (mx(1), my(-1))])
polyline(p, [(mx(1+i/100), my(exp(-i/100))) for i in range(101)])
polyline(p, [(mx(2+i/100), my(exp(-1-i/100)-exp(-i/100))) for i in range(351)])
for x, before, after in [(0, 0, -1), (1, -1, 1), (2, exp(-1), exp(-1)-1)]:
    line(p, f'M{mx(x)} {my(before)}V{my(after)}', width=1.1, dash=True)
for x in [0, 1, 2, 3, 4, 5]:
    line(p, f'M{mx(x)} 185V191')
    label(p, mx(x), 215, str(x), 18)
for y in [-1, 1]:
    line(p, f'M122 {my(y)}H136')
    label(p, 113, my(y)+5, str(y).replace('-', '−'), 18, 'end')
label(p, 686, 215, 't', 20)
label(p, 193, 310, '0<t<1：−1', 18)
label(p, 399, 55, '1<t<2：e⁻⁽ᵗ⁻¹⁾', 18)
label(p, 448, 286, 't>2：e⁻⁽ᵗ⁻¹⁾−e⁻⁽ᵗ⁻²⁾', 18)
label(p, 360, 359, '跳点单值按 u(0) 约定；此图只规定开区间', 18)
save(folder/'a1-10.svg', p)

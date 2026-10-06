"""课程10：保留三幅原条件图，独立绘制抽样前、抽样后与恢复谱。"""
from pathlib import Path
from PIL import Image
from figure_svg import spectrum

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-10'
folder.mkdir(parents=True, exist_ok=True)
for page, no, box in [
    (51, '2-3', (466, 324, 929, 567)),
    (52, '3-1', (520, 1008, 888, 1430)),
    (53, '3-2', (458, 1160, 991, 1547)),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page}.png').crop(box).save(folder/f'q{no}.png', optimize=True)

spectrum(folder/'a3-2-1.svg', 'Y₁：输入带内相乘，边缘高度仍为 1/2', 2, 1.1,
         [[(-1.85, 0), (-1, 0), (-1, .5), (0, 1), (1, .5), (1, 0), (1.85, 0)]],
         [-2, -1, 0, 1, 2], [(.5, '1/2'), (1, '1')],
         '±ω₁ 处截断；并非到 ±2ω₁ 才降为零', axis_label='ω/ω₁')

copies = []
for centre in [-4, 0, 4]:
    copies.append([(centre-1, 0), (centre-1, .5), (centre, 1), (centre+1, .5), (centre+1, 0)])
spectrum(folder/'a3-2-2.svg', 'Yₛ：每隔 ωₛ 复制，整体乘 1/T', 6, 1.1,
         copies, [-5, -4, -3, -1, 0, 1, 3, 4, 5], [(.5, '1/(2T)'), (1, '1/T')],
         '示例 ωₛ=4ω₁；每个复制谱宽 2ω₁，中间留间隔', axis_label='ω/ω₁')

curve = [(x/100, 1/(1-abs(x/100)/2)) for x in range(-100, 101)]
spectrum(folder/'a3-2-3.svg', 'H₂：输入带内倒数补偿，带外另设计', 3.6, 2.2,
         [[(-3.3, 0), (-2, 0), (-1, 2)]+curve[1:-1]+[(1, 2), (2, 0), (3.3, 0)]],
         [-3, -2, -1, 0, 1, 2, 3], [(1, 'T'), (2, '2T')],
         '示例 ωₛ=4ω₁、ωc=2ω₁；2T 在 ±ω₁，截止处降到 0', axis_label='ω/ω₁')

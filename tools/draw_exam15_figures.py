"""课程15：保留正反馈及调制题原图，画A/B/C广义线谱。"""
from pathlib import Path
from PIL import Image
from figure_svg import spectrum

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-15'
folder.mkdir(parents=True, exist_ok=True)
for page, box, name in [
    (63, (388, 1215, 1050, 1440), 'q2-3.png'),
    (64, (470, 108, 924, 285), 'q2-4.png'),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name, optimize=True)

for node, title, caption, ticks in [
    ('A', 'A点：所有整数ω处的冲激线强度2π', '所有整数线无限延续；f按周期分布理解', list(range(-3, 4))),
    ('B', 'B点：移位半强度谱合并后仍各为2π', 'G=F；每条谱线合并两份各π的贡献', list(range(-3, 4))),
    ('C', 'C点：仅ω=−1、0、1三条冲激线', '每条强度2π，其余全0；y=1+2cos t', [-1, 0, 1]),
]:
    spectrum(folder/f'a2-4-{node}.svg', title, 3.5, 1.3, [], list(range(-3, 4)), [], caption,
             impulses=[(value, '2π') for value in ticks], axis_label='ω (rad/s)')

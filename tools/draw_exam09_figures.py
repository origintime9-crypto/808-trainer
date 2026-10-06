"""未编号第9套：保留原零极点图，并补画单位圆以区分圆上/圆外。"""
from pathlib import Path
from PIL import Image
from figure_svg import start, label, line, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-09'
folder.mkdir(parents=True, exist_ok=True)
Image.open(root/'work'/'pages'/'tk-exams'/'p45.png').crop((494, 650, 894, 837)).save(folder/'q2-3.png', optimize=True)

p = start(460, title='零点0与-2、极点-1与-3的因果系统')
cx, cy, scale = 541, 225, 130
label(p, 360, 29, 'H(z)=4z(z+2)/[(z+1)(z+3)]', 23)
line(p, 'M44 225H691', arrow=True)
line(p, 'M541 391V58', arrow=True)
p.append(f'<circle cx="{cx}" cy="{cy}" r="{scale}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5 5"/>')
for value in [-3, -1]:
    px = cx+scale*value
    line(p, f'M{px-7} {cy-7}L{px+7} {cy+7}M{px-7} {cy+7}L{px+7} {cy-7}', '#b45309', 3)
for value in [-2, 0]:
    p.append(f'<circle cx="{cx+scale*value}" cy="{cy}" r="7" fill="white" stroke="#0f766e" stroke-width="3"/>')
for value in [-3, -2, -1, 0]:
    label(p, cx+scale*value, cy+32, str(value).replace('-', '−'), 21)
label(p, cx+scale, cy-14, '1', 20)
label(p, 677, 273, 'Re z', 19)
label(p, 560, 68, 'Im z', 19, 'start')
label(p, 370, 93, '虚线：单位圆', 19)
label(p, 360, 421, '−1 在单位圆上；−3 在圆外；因果 ROC |z|>3', 21)
label(p, 360, 450, '○ 零点；× 极点；因果核不趋零 ⇒ 不稳定', 20)
save(folder/'a2-3.svg', p)

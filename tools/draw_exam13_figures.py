"""课程13原题裁剪和条件答案图：波形负峰参数、ROC与p符号均显式标出。"""
from pathlib import Path
from math import cos, sqrt, pi
from PIL import Image
from figure_svg import start, line, label, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-13'
folder.mkdir(parents=True, exist_ok=True)
for page, box, name in [
    (59, (372, 96, 1008, 384), 'q1-3.png'),
    (59, (524, 1298, 863, 1560), 'q2-3.png'),
    (60, (450, 580, 962, 810), 'q3-1.png'),
    (60, (499, 963, 855, 1202), 'q3-2.png'),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name, optimize=True)

p = start(385, title='反向缩放后冲激权重为4，负峰条件A=1')
mx = lambda x: 282+104*x
my = lambda y: 188-88*y
label(p, 360, 28, 'f(t)=g[(1−t)/2]：此图普通负峰取A=1', 22)
line(p, 'M38 188H690', arrow=True)
line(p, 'M282 292V65', arrow=True)
line(p, f'M{mx(-1)} 188V73', '#0f766e', 3, arrow=True)
label(p, mx(-1)-2, 59, '4δ(t+1)', 20)
polyline(p, [(mx(0), my(0)), (mx(1), my(1))])
polyline(p, [(mx(1), my(-1)), (mx(2), my(0))])
line(p, f'M{mx(1)} {my(1)}V{my(-1)}', width=1.1, dash=True)
for x in [-2, -1, 0, 1, 2, 3]:
    line(p, f'M{mx(x)} 188V194')
    label(p, mx(x), 215, str(x).replace('-', '−'), 18)
label(p, 694, 215, 't', 20)
label(p, 267, my(1)+4, '1', 18, 'end')
label(p, 267, my(-1)+4, '−A', 18, 'end')
label(p, 460, 320, '一般负段为A(t−2)，1<t<2', 19)
label(p, 360, 354, '冲激位置−1，强度4；普通部分仅在0..2', 19)
label(p, 360, 377, '跳点单值未给；原图负峰未独立标高，图中A=1为条件', 16)
save(folder/'a2-3.svg', p)

p = start(345, title='H(z)=z/(z−1/2)的零点0和极点1/2')
label(p, 360, 28, '有限零点0，极点1/2；虚线为单位圆', 22)
cx, cy, rad = 340, 170, 100
p.append(f'<circle cx="{cx}" cy="{cy}" r="{rad}" fill="none" stroke="#94a3b8" stroke-dasharray="5 5"/>')
line(p, 'M165 170H531', arrow=True)
line(p, 'M340 285V54', arrow=True)
p.append('<circle cx="340" cy="170" r="7" fill="white" stroke="#0f766e" stroke-width="2.8"/>')
line(p, 'M384 164L396 176M384 176L396 164', '#0f766e', 2.8)
label(p, 340, 199, '0', 18)
label(p, 397, 200, '1/2', 18)
label(p, 532, 198, 'Re z', 17)
label(p, 382, 65, 'Im z', 17)
label(p, 360, 318, '有理式本身允许|z|>1/2或|z|<1/2，需另给ROC', 18)
save(folder/'a2-4-1.svg', p)

p = start(360, title='按右边ROC的普通频率响应：低通，直流2、π处2/3')
mx = lambda x: 360+91*x
my = lambda y: 253-86*y
label(p, 360, 28, '幅度图：采用右边ROC / 因果稳定实现', 22)
line(p, 'M35 253H690', arrow=True)
line(p, 'M360 276V55', arrow=True)
polyline(p, [(mx(-pi+2*pi*k/240), my(1/sqrt(1.25-cos(-pi+2*pi*k/240)))) for k in range(241)])
for x, text in [(-pi, '−π'), (-pi/2, '−π/2'), (0, '0'), (pi/2, 'π/2'), (pi, 'π')]:
    line(p, f'M{mx(x)} 253V259')
    label(p, mx(x), 283, text, 18)
label(p, 690, 283, 'Ω', 18)
label(p, 346, my(2)+5, '2', 18, 'end')
label(p, 346, my(2/3)+5, '2/3', 18, 'end')
label(p, 360, 323, '幅度偶对称、2π周期；0..π单调下降', 19)
label(p, 360, 348, '另一左边ROC不含单位圆，不能将图当作其普通DTFT', 17)
save(folder/'a2-4-2.svg', p)

p = start(300, title='p为正时实轴零点−p/4和极点p/3的方向示意')
label(p, 360, 30, 'p>0的方向示意：零点−p/4，极点p/3', 22)
line(p, 'M125 150H603', arrow=True)
line(p, 'M344 230V71', arrow=True)
p.append('<circle cx="254" cy="150" r="7" fill="white" stroke="#0f766e" stroke-width="2.8"/>')
line(p, 'M458 144L470 156M458 156L470 144', '#0f766e', 2.8)
label(p, 254, 184, '−p/4', 20)
label(p, 344, 184, '0', 19)
label(p, 465, 184, 'p/3', 20)
label(p, 622, 177, 'Re z', 18)
label(p, 383, 73, 'Im z', 18)
label(p, 360, 260, 'p<0时位置换向；p=0相消为H=1，无实际传输极点', 19)
label(p, 360, 286, '此图未固定p的值，不用示意距离推断稳定边界', 17)
save(folder/'a3-1-2.svg', p)

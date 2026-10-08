"""课程26原图及答案：未知输入只绘制明示反例，不替代原函数。"""
from pathlib import Path
from math import cos, pi
from PIL import Image
from figure_svg import start, label, line, polyline, save
root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-26'
folder.mkdir(parents=True, exist_ok=True)
for page, bounds, name in [
    (86, (388, 91, 992, 378), 'q2-1.png'),
    (86, (235, 563, 834, 785), 'q2-2.png'),
    (86, (896, 540, 1160, 785), 'q2-2b.png'),
    (87, (553, 98, 838, 373), 'q3-1.png'),
    (87, (466, 552, 949, 835), 'q3-2.png'),
]:
    Image.open(root/'work/pages/tk-exams'/f'p{page}.png').crop(bounds).save(folder/name, optimize=True)

p = start(height=367, title='课程26二1：两原矩形卷积成高2的梯形')
label(p, 360, 31, '卷积f(t)：2倍重叠长度', 23)
mx = lambda value: 572+116*value
my = lambda value: 269-76*value
line(p, 'M40 269H690', arrow=True)
line(p, 'M572 286V69', arrow=True)
polyline(p, [(mx(-4), my(0)), (mx(-3), my(0)), (mx(-2), my(2)), (mx(-1), my(2)), (mx(0), my(0)), (mx(.8), my(0))])
for value in [-3, -2, -1, 0]:
    line(p, f'M{mx(value)} 269V275')
    label(p, mx(value)-10 if value==0 else mx(value), 299, str(value).replace('-', '−'), 20)
label(p, 557, my(2)+6, '2', 20, 'end')
label(p, 600, 74, 'f(t)', 21)
label(p, 688, 299, 't', 21)
label(p, 360, 336, '支撑−3..0；平台−2..−1；总面积4', 21)
save(folder/'a2-1.svg', p)

p = start(height=364, title='课程26二2：因果阶跃响应上升至1后保持')
label(p, 360, 31, '由原输入输出确定阶跃响应s(t)', 23)
mx = lambda value: 176+139*value
my = lambda value: 261-138*value
line(p, 'M46 261H690', arrow=True)
line(p, 'M176 278V73', arrow=True)
polyline(p, [(mx(-.8), my(0)), (mx(0), my(0)), (mx(1), my(1)), (mx(3.5), my(1))])
for value in [0, 1, 2, 3]:
    line(p, f'M{mx(value)} 261V267')
    label(p, mx(value)-9 if value==0 else mx(value), 293, str(value), 20)
label(p, 159, my(1)+6, '1', 20, 'end')
label(p, 207, 76, 's(t)', 21)
label(p, 688, 294, 't', 21)
label(p, 360, 336, 'h(t)在0..1为1；s(t)在t≥1保持1', 21)
save(folder/'a2-2.svg', p)

p = start(height=435, title='课程26二2：正弦和抛物线两种合法例子输出不同，原图不唯一')
label(p, 360, 30, '两种明示输入示例：原图不能定唯一曲线', 22)
label(p, 360, 62, '仅示例，均在0..1非负、中心峰高1', 20)
mx = lambda value: 147+223*value
my = lambda value: 283-218*value
line(p, 'M52 283H690', arrow=True)
line(p, 'M147 300V82', arrow=True)
ys = lambda value: (1-cos(pi*value))/pi if value<=1 else (1+cos(pi*(value-1)))/pi
yp = lambda value: 2*value**2-4*value**3/3 if value<=1 else 2/3-2*(value-1)**2+4*(value-1)**3/3
polyline(p, [(mx(k/80), my(ys(k/80))) for k in range(161)], '#0f766e')
polyline(p, [(mx(k/80), my(yp(k/80))) for k in range(161)], '#b45309', 2.5)
for value in [0, 1, 2]:
    line(p, f'M{mx(value)} 283V289')
    label(p, mx(value)-9 if value==0 else mx(value), 315, str(value), 20)
label(p, 131, my(2/3)+6, '2/3', 18, 'end')
label(p, 204, 100, 'y₁(t)', 21)
label(p, 687, 315, 't', 21)
line(p, 'M73 346H126', '#0f766e', 3)
label(p, 137, 353, 'p(t)=sin(πt)：峰高2/π', 20, 'start')
line(p, 'M73 380H126', '#b45309', 2.5)
label(p, 137, 387, 'p(t)=4t(1−t)：峰高2/3', 20, 'start')
label(p, 360, 425, '只用原图时，保留∫p的关系与上升/下降区间', 20)
save(folder/'a2-2b.svg', p)

p = start(height=371, title='课程26三2：原前馈为1和1，反馈为3/4和负1/8的单位样值')
label(p, 360, 31, 'h[n]=6(1/2)ⁿ−5(1/4)ⁿ，n≥0', 23)
mx = lambda value: 111+53*value
my = lambda value: 273-98*value
line(p, 'M50 273H690', arrow=True)
line(p, 'M111 290V66', arrow=True)
for k in range(11):
    value = 6*.5**k-5*.25**k
    line(p, f'M{mx(k)} 273V{my(value)}', '#0f766e', 2.6)
    p.append(f'<circle cx="{mx(k)}" cy="{my(value)}" r="4" fill="#0f766e"/>')
    label(p, mx(k)-9 if k==0 else mx(k), 303, k, 19)
label(p, 94, my(1)+6, '1', 20, 'end')
label(p, mx(1), my(1.75)-13, '7/4', 20)
label(p, mx(2), my(19/16)-13, '19/16', 20)
label(p, 142, 73, 'h[n]', 21)
label(p, 685, 303, 'n', 21)
label(p, 360, 351, 'n=1仍有一拍输入前馈；核总和16/3', 21)
save(folder/'a3-2.svg', p)
print('课程26题图完成：五幅原图PNG、四幅独立答案SVG。')

"""课程8：保留七幅原题图，按独立求解重画七幅答案图。"""
from pathlib import Path
from math import acos, cos, pi, sqrt
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-08'
folder.mkdir(parents=True, exist_ok=True)
for page, no, box in [
    (36, '2-1', (512, 1548, 874, 1715)),
    (37, '2-2', (579, 1440, 818, 1650)),
    (38, '2-3', (126, 960, 815, 1159)),
    (39, '2-4', (508, 439, 892, 599)),
    (39, '2-5', (488, 1353, 899, 1547)),
    (40, '3-1', (538, 883, 844, 1058)),
    (42, '3-2', (506, 184, 914, 414)),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/f'q{no}.png', optimize=True)

p = start(360, title='正负矩形与高度2矩形的卷积')
mx = lambda value: 430+108*value
my = lambda value: 181-50*value
label(p, 360, 29, 'y=f*h：支撑 −2..1，正负峰分别为 ±2', 23)
line(p, 'M43 181H682', arrow=True)
line(p, 'M430 306V57', arrow=True)
polyline(p, [(46, my(0)), (mx(-2), my(0)), (mx(-1), my(2)), (mx(0), my(-2)), (mx(1), my(0)), (678, my(0))])
for value, text in [(-2, '−2'), (-1, '−1'), (-.5, '−1/2'), (0, '0'), (1, '1')]:
    line(p, f'M{mx(value)} 181V187')
    label(p, mx(value), 210, text, 19)
for value in [-2, 2]:
    line(p, f'M{mx(-1)} {my(value)}H{mx(0)}', dash=True)
    label(p, 445, my(value)+7, str(value).replace('-', '−'), 20, 'start')
label(p, 671, 210, 't', 20)
label(p, 455, 65, 'y(t)', 20, 'start')
label(p, 360, 334, '分段斜率 2、−4、2；过零点 −1/2', 21)
save(folder/'a2-1.svg', p)

p = start(390, title='波形导数含原点及右端两个冲激')
mx = lambda value: 210+75*value
my = lambda value: 116-45*value
label(p, 360, 29, 'f′=u(t+2)−u(t−4)−4δ(t)−2δ(t−4)', 22)
line(p, 'M39 116H682', arrow=True)
line(p, 'M210 320V50', arrow=True)
polyline(p, [(40, 116), (mx(-2), 116), (mx(-2), my(1)), (mx(4), my(1)), (mx(4), 116), (676, 116)])
line(p, f'M{mx(0)} 116V{my(-4)}', '#b45309', 3.4, True)
line(p, f'M{mx(4)} 116V{my(-2)}', '#b45309', 3.4, True)
label(p, mx(0)+22, 291, '权重 −4', 20, 'start')
label(p, mx(4)+16, 205, '权重 −2', 20, 'start')
label(p, 196, my(1)+6, '1', 20, 'end')
for value in [-2, 0, 4]:
    label(p, mx(value)+(-13 if value == 0 else 0), 145, str(value).replace('-', '−'), 20)
label(p, 672, 145, 't', 20)
label(p, 360, 349, '普通部分为高1矩形；箭头标权重，非函数高度', 20)
label(p, 360, 378, 't=−2 连续接零；t=4 的向下跳变不能漏掉', 20)
save(folder/'a22-1.svg', p)

p = start(380, title='反转展宽后左移2的波形')
mx = lambda value: 573+42*value
my = lambda value: 180-49*value
label(p, 360, 29, 'f(−0.5t−1)：支撑 −10..2，−2 处向上跳4', 22)
line(p, 'M43 180H687', arrow=True)
line(p, 'M573 302V52', arrow=True)
polyline(p, [(46, 180), (mx(-10), 180), (mx(-10), my(2)), (mx(-2), my(-2))])
polyline(p, [(mx(-2), my(2)), (mx(2), 180), (681, 180)])
line(p, f'M{mx(-2)} {my(-2)}V{my(2)}', '#0f766e', 2, dash=True)
for value in [-10, -6, -2, 0, 2]:
    label(p, mx(value)+(11 if value == 0 else 0), 210, str(value).replace('-', '−'), 20)
for value in [-2, 2]:
    label(p, 590, my(value)+6, str(value).replace('-', '−'), 20, 'start')
for value in [-2]:
    for level in [-2, 2]:
        p.append(f'<circle cx="{mx(value)}" cy="{my(level)}" r="4" fill="white" stroke="#0f766e" stroke-width="2"/>')
label(p, 677, 212, 't', 20)
label(p, 360, 336, '−10..−2：−t/2−3；−2..2：1−t/2', 21)
label(p, 360, 366, '两段斜率均 −1/2；跳点单点值不影响积分', 20)
save(folder/'a22-2.svg', p)

p = start(360, title='三角输入的输出：明确c为0的条件')
mx = lambda value: 111+90*value
my = lambda value: 260-71*value
label(p, 360, 29, 'z=r(t−1)−r(t−3)−2u(t−4)+c', 23)
label(p, 360, 60, '本图取 c=0：因果实现或 z(−∞)=0', 20)
line(p, 'M41 260H687', arrow=True)
line(p, 'M111 281V78', arrow=True)
polyline(p, [(44, 260), (mx(1), 260), (mx(3), my(2)), (mx(4), my(2))])
polyline(p, [(mx(4), 260), (682, 260)])
line(p, f'M{mx(4)} {my(2)}V260', '#0f766e', 2.5)
line(p, f'M111 {my(2)}H{mx(3)}', dash=True)
label(p, 93, my(2)+6, '2', 20)
for value in [0, 1, 3, 4]:
    label(p, mx(value), 290, str(value), 21)
label(p, 676, 289, 't', 20)
label(p, 360, 330, '未给边界条件时整条图仍可上下平移常数 c', 20)
save(folder/'a2-3.svg', p)

p = start(355, title='常数直通减三角低通谱的高通响应')
mx = lambda value: 359+77*value
my = lambda value: 259-153*value
label(p, 360, 29, 'H(jω)=|ω|/2（|ω|≤2π），带外为π', 23)
line(p, 'M38 259H687', arrow=True)
line(p, 'M359 280V61', arrow=True)
polyline(p, [(45, my(1)), (mx(-2), my(1)), (mx(0), my(0)), (mx(2), my(1)), (680, my(1))])
line(p, f'M{mx(-2)} {my(1)}V259', dash=True)
line(p, f'M{mx(2)} {my(1)}V259', dash=True)
label(p, 339, my(1)+7, 'π', 22, 'end')
label(p, 388, 68, 'H(jω)', 20, 'start')
for value, text in [(-2, '−2π'), (0, '0'), (2, '2π')]:
    label(p, mx(value), 290, text, 21)
label(p, 677, 290, 'ω', 21)
label(p, 360, 329, 'h₂ 支路加、h₁ 支路减；直流被滤除', 21)
save(folder/'a31-1.svg', p)

p = start(455, title='因果H的二重零点、两极点和单位圆')
cx, cy, scale = 367, 226, 142
label(p, 360, 29, 'H(z)=z²/[(z−1/2)(z+1/4)]', 23)
line(p, 'M95 226H681', arrow=True)
line(p, 'M367 396V54', arrow=True)
p.append(f'<circle cx="{cx}" cy="{cy}" r="{scale}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="6 5"/>')
for value in [-.25, .5]:
    px = cx+scale*value
    line(p, f'M{px-7} {cy-7}L{px+7} {cy+7}M{px-7} {cy+7}L{px+7} {cy-7}', '#b45309', 3)
    label(p, px, cy+32, '−1/4' if value < 0 else '1/2', 20)
p.append(f'<circle cx="{cx}" cy="{cy}" r="7" fill="white" stroke="#0f766e" stroke-width="3"/>')
label(p, cx+14, cy-20, '○ ×2', 20, 'start')
label(p, cx-scale, cy-14, '−1', 20)
label(p, cx+scale, cy-14, '1', 20)
label(p, 661, 255, 'Re z', 19)
label(p, 389, 66, 'Im z', 19, 'start')
label(p, 545, 93, '虚线：单位圆', 19)
label(p, 360, 423, '因果 ROC：|z|>1/2，包含单位圆 ⇒ 稳定', 21)
label(p, 360, 449, '○ 零点（原点二重）；× 极点', 19)
save(folder/'a32-4.svg', p)

p = start(465, title='周期幅频响应：内部谷底低于端点')
mx = lambda value: 357+292*value/pi
my = lambda value: 307-144*value
minimum_at = acos(-7/16)
minimum = 16*sqrt(2)/27
label(p, 360, 29, '|H(eʲΩ)|：最大 8/5，真实最小 16√2/27', 23)
line(p, 'M37 307H687', arrow=True)
line(p, 'M357 328V49', arrow=True)
values = [-pi+i*(2*pi)/600 for i in range(601)]
polyline(p, [(mx(value), my(((5/4-cos(value))*(17/16+.5*cos(value)))**(-.5))) for value in values])
for value in [-pi, pi]:
    line(p, f'M{mx(value)} 307V{my(8/9)}', dash=True)
    p.append(f'<circle cx="{mx(value)}" cy="{my(8/9)}" r="4" fill="#0f766e"/>')
    label(p, mx(value), my(8/9)-14, '8/9', 21)
for value in [-minimum_at, minimum_at]:
    p.append(f'<circle cx="{mx(value)}" cy="{my(minimum)}" r="4" fill="#b45309"/>')
    line(p, f'M{mx(value)} 307V{my(minimum)}', '#b45309', 1.5, dash=True)
    label(p, mx(value), 365, '−Ωₘ' if value < 0 else 'Ωₘ', 21)
label(p, 374, my(8/5)+7, '8/5', 20, 'start')
for value, text in [(-pi, '−π'), (0, '0'), (pi, 'π')]:
    label(p, mx(value), 337, text, 21)
label(p, 679, 337, 'Ω', 21)
label(p, 360, 396, 'Ωₘ=arccos(−7/16)≈2.024；谷底≈0.8381', 21)
label(p, 360, 425, '端点 8/9≈0.8889；整图以 2π 为周期延拓', 20)
label(p, 360, 453, 'Tₛ=1 s 时 Ω=ωTₛ，与 ω(rad/s) 数值相同', 19)
save(folder/'a32-5.svg', p)

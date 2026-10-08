"""第四章原题裁图；零极点和冲激响应按独立求解结果绘制，不使用错误答案图。"""
from pathlib import Path
from math import exp, cos, log, pi
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root / 'public' / 'figures' / 'wmq4'
folder.mkdir(parents=True, exist_ok=True)
for page, crops in [
    (108, [('q4-4-a', (360, 765, 655, 995)), ('q4-4-b', (740, 765, 1050, 995)),
           ('q4-4-c', (360, 1005, 655, 1275)), ('q4-4-d', (735, 1005, 1055, 1275)),
           ('q4-4-e', (350, 1290, 660, 1520)), ('q4-4-f', (735, 1280, 1055, 1520))]),
    (114, [('q4-7-a', (300, 210, 660, 505)), ('q4-7-b', (730, 210, 1080, 505)),
           ('q4-7-c', (300, 525, 670, 770)), ('q4-7-d', (730, 525, 1080, 770))]),
]:
    with Image.open(root / 'work' / 'pages' / 'textbook' / f'p{page}.png') as im:
        for name, box in crops:
            im.crop(box).save(folder / (name + '.png'), optimize=True)


def clean_label(parts, x, y, text, size=20, anchor='middle'):
    label(parts, x, y, text, size, anchor)
    parts[-1] = parts[-1].replace('fill="#334155"', 'fill="#334155" stroke="white" stroke-width="5" paint-order="stroke fill" stroke-linejoin="round"')


def pz(no, zeroes, poles, xr, xticks, caption):
    parts = start(390, 660, f'4.20({no}) 零极点图')
    label(parts, 330, 34, f'4.20({no}) 零点 ○、极点 ×', 23)
    mx = lambda x: 65 + (x - xr[0]) / (xr[1] - xr[0]) * 525
    my = lambda y: 211 - y * 78
    line(parts, 'M40 211H621', arrow=True)
    line(parts, f'M{mx(0)} 326V64', arrow=True)
    clean_label(parts, 632, 219, 'σ', 22)
    clean_label(parts, mx(0) + 21, 76, 'jω', 21)
    for x in xticks:
        line(parts, f'M{mx(x)} 211v6')
    for x, y in zeroes:
        parts.append(f'<circle cx="{mx(x):.2f}" cy="{my(y):.2f}" r="7" fill="white" stroke="#2563eb" stroke-width="3"/>')
    for x, y in poles:
        line(parts, f'M{mx(x)-7} {my(y)-7}l14 14M{mx(x)-7} {my(y)+7}l14 -14', '#dc2626', 3)
    for x in xticks:
        clean_label(parts, mx(x), 243, str(x).replace('-', '−'))
    for x, y in poles:
        if y:
            line(parts, f'M{mx(x)} {my(y)}H{mx(0)}', dash=True)
            clean_label(parts, mx(0) - 15, my(y) + 6, '+j' if y > 0 else '−j', 20, 'end')
    label(parts, 330, 365, caption, 21)
    save(folder / f'a4-20-{no}-pz.svg', parts)


def response(no, fn, ybounds, yticks, impulse=False, caption=''):
    parts = start(395, 660, f'4.20({no}) 因果冲激响应')
    label(parts, 330, 34, f'4.20({no}) h(t)；蓝线为普通部分', 23)
    mx = lambda t: 80 + t / 6 * 505
    my = lambda y: 70 + (ybounds[1] - y) / (ybounds[1] - ybounds[0]) * 220
    zero = my(0)
    line(parts, f'M40 {zero}H618', arrow=True)
    line(parts, 'M80 306V58', arrow=True)
    for tick in range(0, 7):
        line(parts, f'M{mx(tick)} {zero}v5')
        clean_label(parts, mx(tick), 326, str(tick), 19)
    for tick in yticks:
        line(parts, f'M75 {my(tick)}H80')
        clean_label(parts, 67, my(tick) + 6, str(tick).replace('-', '−'), 19, 'end')
    polyline(parts, [(mx(-0.45), zero), (mx(0), zero)], '#2563eb', 3)
    polyline(parts, [(mx(6*i/800), my(fn(6*i/800))) for i in range(801)], '#2563eb', 3)
    if impulse:
        line(parts, f'M80 {zero}V72', '#d97706', 3.5, True)
        clean_label(parts, 257, 73, '橙色冲激：面积1（示意）', 21)
        clean_label(parts, 199, 290, f'h普通(0⁺)={fn(0):g}'.replace('-', '−'), 20)
    else:
        clean_label(parts, 195, 85, f'h(0⁺)={fn(0):g}', 20)
    clean_label(parts, 632, zero + 6, 't', 21)
    label(parts, 330, 371, caption, 20)
    save(folder / f'a4-20-{no}-h.svg', parts)


pz(1, [(0, 0)], [(-2, 0)], (-3, 1), [-2, 0], '因果 ROC：σ>−2；BIBO 稳定')
pz(2, [(-1, 0)], [(-1, 1), (-1, -1)], (-2.5, .8), [-1, 0], '因果 ROC：σ>−1；BIBO 稳定')
pz(3, [(-3, 0), (1, 0)], [(-2, 0), (-5, 0)], (-6, 2), [-5, -3, -2, 0, 1], '零点−3、+1；极点−5、−2；BIBO 稳定')
pz(4, [(3, 0)], [(0, 0), (-1, 0), (-2, 0)], (-3, 4), [-2, -1, 0, 3], '因果 ROC：σ>0；虚轴极点使 BIBO 不稳定')
response(1, lambda t: -2*exp(-2*t), (-2.3, .9), [-2, -1, 0], True, 'δ(t) − 2e^(−2t)u(t)：普通尾部由−2趋0')
response(2, lambda t: exp(-t)*cos(t), (-.27, 1.2), [0, .5, 1], False, 'e^(−t)cos(t)u(t)；第一次过零在 t=π/2')
response(3, lambda t: -exp(-2*t)-4*exp(-5*t), (-5.6, 1.6), [-5, -3, 0], True, 'δ(t) − [e^(−2t)+4e^(−5t)]u(t)')

# 第四问最大值仅0.1；单独画启动局部，防止示意图把小正峰漏掉。
fn = lambda t: -1.5+4*exp(-t)-2.5*exp(-2*t)
parts = start(625, 660, '4.20(4) 冲激响应与启动局部')
label(parts, 330, 33, '4.20(4) h(t)；无δ直通', 23)
mx = lambda t: 80 + t/6*505
my = lambda y: 68 + (.25-y)/1.95*218
line(parts, f'M40 {my(0)}H620', arrow=True)
line(parts, 'M80 291V54', arrow=True)
for tick in range(7):
    line(parts, f'M{mx(tick)} {my(0)}v5')
    clean_label(parts, mx(tick), 317, str(tick), 19)
for tick in [0, -.5, -1, -1.5]:
    clean_label(parts, 65, my(tick)+6, str(tick).replace('-', '−'), 19, 'end')
line(parts, f'M80 {my(-1.5)}H585', dash=True)
polyline(parts, [(mx(-.4), my(0)), (mx(0), my(0))], '#2563eb', 3)
polyline(parts, [(mx(6*i/1000), my(fn(6*i/1000))) for i in range(1001)], '#2563eb', 3)
label(parts, 632, my(0)+6, 't', 21)
label(parts, 330, 347, '启动局部：先升至0.1，随后过零并趋−1.5', 21)
zx = lambda t: 100+t*485
zy = lambda y: 378+(.14-y)/.55*161
line(parts, f'M75 {zy(0)}H615', arrow=True)
line(parts, 'M100 552V363', arrow=True)
for tick, text in [(0, '0'), (.5, '0.5'), (1, '1')]:
    clean_label(parts, zx(tick), 576, text, 19)
for tick in [0, .1, -.2, -.4]:
    clean_label(parts, 83, zy(tick)+6, str(tick).replace('-', '−'), 19, 'end')
polyline(parts, [(zx(i/600), zy(fn(i/600))) for i in range(601)], '#2563eb', 3)
peak = log(5/4)
parts.append(f'<circle cx="{zx(peak):.2f}" cy="{zy(.1):.2f}" r="4" fill="#d97706"/>')
clean_label(parts, 430, 388, '峰值0.1；t=ln(5/4)', 21)
line(parts, f'M{zx(peak)} {zy(.1)}H342', '#d97706', 1.5, dash=True)
label(parts, 631, zy(0)+5, 't', 21)
label(parts, 330, 612, '阶跃输出含−1.5t而无界；BIBO不稳定', 21)
save(folder / 'a4-20-4-h.svg', parts)
print('教材第4章：10幅原题PNG、8幅独立零极点/响应SVG已生成。')

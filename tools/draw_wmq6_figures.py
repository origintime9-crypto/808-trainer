"""第6章原图裁剪及按整数样值/相关定义独立绘制答案图。"""
from pathlib import Path
from math import sin, cos, pi
from PIL import Image
from figure_svg import start, label, line, save

root = Path(__file__).resolve().parents[1]
folder = root / 'public' / 'figures' / 'wmq6'
folder.mkdir(parents=True, exist_ok=True)
for page, name, box in [
    (158, 'q6-9', (265, 809, 1129, 1081)),
    (158, 'q6-10', (144, 1384, 621, 1707)),
    (164, 'q6-20', (227, 1437, 1148, 1750)),
]:
    with Image.open(root / 'work' / 'pages' / 'textbook' / f'p{page:03}.png') as original:
        original.crop(box).save(folder / f'{name}.png', optimize=True)


def clean(parts, x, y, text, size=17, anchor='middle'):
    label(parts, x, y, text, size, anchor)
    parts[-1] = parts[-1].replace('fill="#334155"', 'fill="#334155" stroke="white" stroke-width="4" paint-order="stroke fill"')


def stems(name, title, lo, hi, fn, caption, exact=False):
    values = [fn(n) for n in range(lo, hi+1)]
    values = [0 if abs(value) < 1e-12 else value for value in values]
    low, high = min(0, min(values)), max(0, max(values))
    span = max(high-low, 1)
    lower, upper = low-.18*span, high+.2*span
    mx = lambda n: 70+(n-lo)/(hi-lo)*522
    my = lambda v: 307-(v-lower)/(upper-lower)*218
    zero = my(0)
    parts = start(425, 680, title)
    label(parts, 340, 30, title, 21)
    line(parts, f'M43 {zero:.2f}H628', arrow=True)
    line(parts, f'M{mx(0):.2f} 324V63', arrow=True)
    clean(parts, mx(0)+22, 65, '样值', 17)
    clean(parts, 618, 347, 'n', 18)
    stride = 1 if hi-lo <= 13 else 2
    for n, value in zip(range(lo, hi+1), values):
        line(parts, f'M{mx(n):.2f} {zero:.2f}V{my(value):.2f}', '#2563eb', 2.5)
        parts.append(f'<circle cx="{mx(n):.2f}" cy="{my(value):.2f}" r="4" fill="#2563eb"/>')
        if n % stride == 0 or n == 0:
            clean(parts, mx(n), 347, str(n).replace('-', '−'))
        if exact and value:
            clean(parts, mx(n), my(value)-11 if value > 0 else my(value)+23, str(value).replace('-', '−'))
    if not exact:
        for value in set([low, high]) - {0}:
            clean(parts, mx(0)-12, my(value)+5, f'{value:.3g}'.replace('-', '−'), 17, 'end')
    label(parts, 340, 385, caption, 17)
    label(parts, 340, 413, '实心点仅表示整数下标样值；点之间不连线。', 17)
    save(folder / f'{name}.svg', parts)


U = lambda n: int(n >= 0)
stems('a6-1-1', '6.1(1)：右边衰减指数，原点为1', -3, 7, lambda n: .5**n*U(n), 'n<0为0；x(0..3)={1, 1/2, 1/4, 1/8}。')
stems('a6-1-2', '6.1(2)：左边负指数，原点为−1/2', -4, 4, lambda n: -.5**(n+1)*U(-n), 'n>0为0；左侧样值−8, −4, −2, −1, −1/2。')
stems('a6-1-3', '6.1(3)：右移一拍的增长指数', -2, 5, lambda n: 2**(n-1)*U(n-1), '首样值位于n=1，高度1；此后2, 4, 8, 16。')
stems('a6-1-4', '6.1(4)：离散斜坡，原点样值0', -3, 6, lambda n: n*U(n), 'n<0为0，n≥0样值为n；不是连续斜线。', True)
stems('a6-1-5', '6.1(5)：相位为−π/10的余弦序列', -5, 14, lambda n: cos(n*pi/5-pi/10), '基本周期10；x(0)=x(1)=cos(π/10)≈0.9511。')
stems('a6-1-6', '6.1(6)：双边衰减正弦，无u(n)', -6, 14, lambda n: (5/6)**n*sin(n*pi/5), '正侧包络衰减、负侧增大；整体非周期。')
tail = {0: 1, 1: 2, 2: 3, 3: -2, 4: -4}
stems('a6-19', '6.19：h(n)−h(n−2)，尾部为负', -1, 6, lambda n: tail.get(n, 0), '样值{1, 2, 3, −2, −4}；其余为0。', True)
xx, yy = {1: 1, 2: 1, 3: 1}, {-1: 1, 0: -1, 1: 1, 2: -1}
corr = lambda a, b, n: sum(value*a.get(m+n, 0) for m, value in b.items())
stems('a6-20-xx', '6.20(1a)：x的自相关，零延时为3', -3, 3, lambda n: corr(xx, xx, n), 'Rxx(−2..2)={1, 2, 3, 2, 1}；偶对称。', True)
stems('a6-20-yy', '6.20(1b)：y的自相关，零延时为4', -4, 4, lambda n: corr(yy, yy, n), 'Ryy(−3..3)={−1, 2, −3, 4, −3, 2, −1}。', True)
stems('a6-20-xy', '6.20(2a)：Rxy(n)=Σx(m+n)y(m)', -2, 5, lambda n: corr(xx, yy, n), '非零下标−1, 1, 2, 4；样值−1, −1, 1, 1。', True)
stems('a6-20-yx', '6.20(2b)：Ryx(n)=Rxy(−n)', -5, 2, lambda n: corr(yy, xx, n), '非零下标−4, −2, −1, 1；样值1, 1, −1, −1。', True)

"""课程29：保留原题全时域/延迟/初态条件，按独立解绘双边系数谱和响应。"""
from pathlib import Path
from math import sin, cos, exp
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root / 'public/figures/tk-exam-29'
folder.mkdir(parents=True, exist_ok=True)
page = Image.open(root / 'work/pages/tk-exams/p92.png')
page.crop((124, 568, 1265, 679)).save(folder / 'q2-3.png', optimize=True)
page.crop((158, 689, 1183, 905)).save(folder / 'q2-4.png', optimize=True)
page.crop((123, 1102, 1270, 1419)).save(folder / 'q3-1.png', optimize=True)

# 以下为C_n的系数谱，非2πC_n的FT冲激强度。
amps = [.5, 1, 2, 1, 2, 1, .5]
phase_sixths = [-1, 1, -1, 0, 1, -1, 1]
mx = lambda n: 360 + 78 * n
p = start(height=386, title='三谐波信号复级数系数的双边幅度谱')
label(p, 360, 30, '双边幅度谱 |Cₙ|：第二谐波幅度1', 23)
line(p, 'M56 267H690', arrow=True)
line(p, 'M360 283V64', arrow=True)
for k, value in zip(range(-3, 4), amps):
    y = 267 - 84 * value
    line(p, f'M{mx(k)} 267V{y}', '#0f766e', 3)
    p.append(f'<circle cx="{mx(k)}" cy="{y}" r="4" fill="#0f766e"/>')
    label(p, mx(k) + (18 if k == 0 else 0), y - 12, str(value).removesuffix('.0'), 20)
    label(p, mx(k) - (10 if k == 0 else 0), 299, str(k).replace('-', '−'), 20)
label(p, 675, 321, 'ω/ω₀', 20)
label(p, 328, 77, '|Cₙ|', 20)
label(p, 360, 348, 'C₀=1；未列出的整数谐波系数为0', 20)
label(p, 360, 376, '若画广义FT，谱线强度另乘2π', 20)
save(folder / 'a2-3a.svg', p)

p = start(height=404, title='三谐波实信号的双边相位谱；零系数相位未定义')
label(p, 360, 30, '双边相位谱 arg Cₙ', 23)
line(p, 'M56 203H690', arrow=True)
line(p, 'M360 303V63', arrow=True)
for k, value in zip(range(-3, 4), phase_sixths):
    y = 203 - 75 * value
    if value:
        line(p, f'M{mx(k)} 203V{y}', '#0f766e', 3)
    p.append(f'<circle cx="{mx(k)}" cy="{y}" r="4" fill="#0f766e"/>')
    label(p, mx(k) - (12 if k == 0 else 0), 317, str(k).replace('-', '−'), 20)
label(p, 338, 131, 'π/6', 20, 'end')
label(p, 338, 286, '−π/6', 20, 'end')
label(p, 383, 192, '0', 20)
label(p, 675, 339, 'ω/ω₀', 20)
label(p, 360, 368, '正弦换为余弦：C₂相位π/3−π/2=−π/6', 20)
label(p, 360, 395, '仅画非零系数处相位，其他频点未定义', 20)
save(folder / 'a2-3b.svg', p)

# 仅画t≥0求出的响应，避免将显示范围外的原左初态改为零。
p = start(height=451, title='非零初态先衰减，输入延迟到1秒后叠加零状态响应')
label(p, 360, 30, '完全响应：初态1，输入延迟1秒', 23)
line(p, 'M72 68H108', '#b45309', 3)
label(p, 160, 75, '完全响应', 19)
line(p, 'M260 68H296', '#0f766e', 3)
label(p, 350, 75, '零状态', 19)
line(p, 'M463 68H499', '#64748b', 2, dash=True)
label(p, 554, 75, '零输入', 19)
mx = lambda value: 121 + 94 * value
my = lambda value: 308 - 173 * value
line(p, 'M68 308H690', arrow=True)
line(p, 'M121 365V103', arrow=True)
for value in [0, 1, 2, 3, 4, 5]:
    line(p, f'M{mx(value)} 308V314')
    label(p, mx(value) - (12 if value == 0 else 0), 340, str(value), 20)
for value, text in [(1, '1'), (.5, '1/2'), (-.25, '−1/4')]:
    line(p, f'M116 {my(value)}H121')
    label(p, 103, my(value) + 6, text, 19, 'end')
label(p, 683, 340, 't / s', 20)
line(p, f'M{mx(1)} 103V365', '#94a3b8', 1.5, dash=True)
zero_input, zero_state, total = [], [], []
for k in range(551):
    value = k / 100
    theta = value - 1
    zi = exp(-2 * value)
    zs = (sin(2 * theta) - cos(2 * theta) + exp(-2 * theta)) / 4 if theta >= 0 else 0
    zero_input.append((mx(value), my(zi)))
    zero_state.append((mx(value), my(zs)))
    total.append((mx(value), my(zi + zs)))
# 灰色虚线先画，完全响应覆盖开通前的重合部分。
for k in range(0, len(zero_input) - 3, 8):
    polyline(p, zero_input[k:k+4], '#64748b', 2)
polyline(p, zero_state, '#0f766e', 2.7)
polyline(p, total, '#b45309', 3)
p.append(f'<circle cx="{mx(0)}" cy="{my(1)}" r="4" fill="#b45309"/>')
label(p, 360, 391, '0≤t<1：完全响应=e⁻²ᵗ，零状态为0', 20)
label(p, 360, 424, 't=1处完全响应连续；仅画原题正时间部分', 20)
save(folder / 'a3-1.svg', p)
print('课程29：3幅原题PNG、3幅答案SVG已生成。')

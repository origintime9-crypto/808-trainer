"""课程27原图与独立答案图；未标折点示例明确以c=2为条件。"""
from pathlib import Path
from math import cos, pi
from PIL import Image
from figure_svg import start, label, line, polyline, save
root = Path(__file__).resolve().parents[1]
folder = root/'public/figures/tk-exam-27'
folder.mkdir(parents=True, exist_ok=True)
page = Image.open(root/'work/pages/tk-exams/p88.png')
page.crop((367, 350, 1015, 557)).save(folder/'q2-1.png', optimize=True)
page.crop((548, 1177, 834, 1370)).save(folder/'q2-5.png', optimize=True)

p = start(height=372, title='仅示例：额外取原图未标折点c=2时的y1，不代表题面已给c=2')
label(p, 360, 30, '条件示例：额外取原折点c=2', 23)
label(p, 360, 64, 'y₁(t)=f₁(t+1)u(−t)，右图f₂不参与', 20)
mx = lambda value: 570+145*value
my = lambda value: 275-145*value
line(p, 'M42 275H690', arrow=True)
line(p, 'M570 295V83', arrow=True)
polyline(p, [(mx(-3.5), my(0)), (mx(-3), my(0)), (mx(-2), my(1)), (mx(0), my(1)), (mx(0), my(0)), (mx(.7), my(0))])
for value in [-3, -2, -1, 0]:
    line(p, f'M{mx(value)} 275V282')
    label(p, mx(value)-10 if value == 0 else mx(value), 305, str(value).replace('-', '−'), 20)
label(p, 553, my(1)+7, '1', 20, 'end')
label(p, 681, 306, 't', 20)
label(p, 360, 347, '原题c未标数值；此图只展示c=2的条件解', 21)
save(folder/'a2-1a.svg', p)

p = start(height=363, title='f2(5−3t)=3δ(t−2)，冲激强度9经压缩变为3')
label(p, 360, 31, 'y₂(t)=3δ(t−2)', 23)
line(p, 'M62 270H690', arrow=True)
line(p, 'M165 288V88', arrow=True)
line(p, 'M456 270V123', '#0f766e', 3, arrow=True)
label(p, 484, 134, '(3)', 23)
label(p, 158, 300, '0', 20)
label(p, 456, 300, '2', 20)
label(p, 685, 301, 't', 20)
label(p, 360, 338, '箭头标冲激强度3，位置为2；反转不改符号', 21)
save(folder/'a2-1b.svg', p)

p = start(height=401, title='卷积输出原点为1，后续为负的二分之一幂尾')
label(p, 360, 31, 'y[n]=δ[n]−(1/2)ⁿu[n−1]', 23)
mx = lambda value: 195+64*value
my = lambda value: 243-129*value
line(p, 'M58 243H695', arrow=True)
line(p, 'M195 323V85', arrow=True)
for value in range(-2, 8):
    amp = 0 if value < 0 else (1 if value == 0 else -2**(-value))
    if amp:
        line(p, f'M{mx(value)} 243V{my(amp)}', '#0f766e', 2.5)
    p.append(f'<circle cx="{mx(value)}" cy="{my(amp)}" r="4" fill="#0f766e"/>')
    label(p, mx(value)-10 if value == 0 else mx(value), 342, str(value).replace('-', '−'), 19)
label(p, 176, my(1)+6, '1', 20, 'end')
label(p, mx(1)+10, my(-.5)+8, '−1/2', 18, 'start')
label(p, 685, 264, 'n', 20)
label(p, 360, 380, '首项1；之后−1/2、−1/4、−1/8⋯，全和0', 21)
save(folder/'a2-5.svg', p)

p = start(height=391, title='两点平均数字低通的幅度为余弦绝对值，按2π周期延拓')
label(p, 360, 31, '两点平均：|H(eʲΩ)|=|cos(Ω/2)|', 23)
mx = lambda value: 371+45*value
my = lambda value: 267-149*value
line(p, 'M51 267H690', arrow=True)
line(p, 'M371 286V76', arrow=True)
polyline(p, [(mx(-2*pi+4*pi*k/200), my(abs(cos((-2*pi+4*pi*k/200)/2)))) for k in range(201)])
for value, text in [(-2*pi, '−2π'), (-pi, '−π'), (0, '0'), (pi, 'π'), (2*pi, '2π')]:
    line(p, f'M{mx(value)} 267V275')
    label(p, mx(value)-10 if value == 0 else mx(value), 300, text, 20)
label(p, 353, my(1)+6, '1', 20, 'end')
label(p, 686, 300, 'Ω', 20)
label(p, 360, 342, '主周期：直流增益1、奈奎斯特点π增益0', 21)
label(p, 360, 373, '数字低通型；周期2π，并非理想低通', 21)
save(folder/'a3-1.svg', p)
print('课程27：2张原图与4张答案SVG已生成。')

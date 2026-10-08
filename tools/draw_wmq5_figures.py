"""第五章原题裁图及按独立公式绘制的谱、周期延拓、保持核图。"""
from pathlib import Path
from math import exp, sin, cos, sqrt, pi
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root / 'public' / 'figures' / 'wmq5'
folder.mkdir(parents=True, exist_ok=True)
with Image.open(root / 'work' / 'pages' / 'textbook' / 'p137.png') as source:
    source.crop((822, 1418, 1230, 1724)).save(folder / 'q5-5.png', optimize=True)


def clean(parts, x, y, text, size=18, anchor='middle'):
    label(parts, x, y, text, size, anchor)
    parts[-1] = parts[-1].replace('fill="#334155"', 'fill="#334155" stroke="white" stroke-width="5" paint-order="stroke fill"')


def axes(title, span, max_y, ticks, yticks, axis, height=415):
    parts = start(height, 680, title)
    label(parts, 340, 31, title, 22)
    mx = lambda x: 72 + (x + span) / (2 * span) * 530
    my = lambda y: 267 - y / max_y * 180
    line(parts, 'M45 267H630', arrow=True)
    line(parts, f'M{mx(0)} 283V63', arrow=True)
    for value in ticks:
        line(parts, f'M{mx(value)} 267v5')
        clean(parts, mx(value), 299, str(value).replace('-', '−'))
    for value, text in yticks:
        line(parts, f'M{mx(0)-5} {my(value)}h5')
        clean(parts, mx(0)-12, my(value)+6, text, 18, 'end')
    clean(parts, 597, 328, axis)
    return parts, mx, my


parts, mx, my = axes('5.4：抽样幅度谱（T=1 s，f(0)=1/2）', 2.4, 1.18, [-2,-1,0,1,2], [(0.231,'0.231'), (1.082,'1.082')], 'ωT/(2π)')
q = exp(-1)
amp = lambda x: sqrt((1+q*q+2*q*cos(2*pi*x))/(4*(1+q*q-2*q*cos(2*pi*x))))
polyline(parts, [(mx(-2.3+4.6*i/1200), my(amp(-2.3+4.6*i/1200))) for i in range(1201)], '#2563eb', 3)
clean(parts, 362, 69, '|Fₛ(ω)|', 20)
label(parts, 340, 362, '精确复谱求模；无限带宽，任意有限采样率均会混叠。', 18)
label(parts, 340, 391, '原点样值不同会改变谱；原题未给T，图仅示例。', 18)
save(folder / 'a5-4-spectrum.svg', parts)

parts, mx, my = axes('5.5：20 Hz频域抽样 → 50 ms周期延拓', 3.3, 1.22, [-3,-2,-1,0,1,2,3], [(1,'1')], 't/P；P=50 ms', 445)
for shift, color in [(-1,'#64748b'), (0,'#d97706'), (1,'#64748b')]:
    polyline(parts, [(mx(shift-1),my(0)),(mx(shift),my(1)),(mx(shift+1),my(0))], color, 2)
polyline(parts, [(mx(-3.2),my(1)),(mx(3.2),my(1))], '#2563eb', 3)
clean(parts, 365, 67, '延拓和/A', 20)
label(parts, 340, 358, '橙线为原三角，灰线为相邻副本；蓝线恒为1。', 18)
label(parts, 340, 390, '图按Δω加权梳归一化，周期P=1/20 s。', 18)
label(parts, 340, 422, '未加权的角频率冲激梳：实际常值为 A/(40π)。', 18)
save(folder / 'a5-5-periodize.svg', parts)

parts, mx, my = axes('5.6：双侧带状谱的临界复制支撑（条件解）', 4.5, 1.3, [-4,-3,-2,-1,0,1,2,3,4], [], 'ω/ω₁', 450)
for shift, color in [(-2,'#0f766e'),(0,'#2563eb'),(2,'#d97706')]:
    for lo, hi in [(-2+shift,-1+shift),(1+shift,2+shift)]:
        polyline(parts, [(mx(lo),my(0)),(mx(lo),my(1)),(mx(hi),my(1)),(mx(hi),my(0))], color, 3)
label(parts, 340, 354, '蓝：原谱；绿/橙：平移−2ω₁/+2ω₁的副本。', 18)
label(parts, 340, 386, '矩形仅示意支撑；普通双侧谱在临界处只碰边界。', 18)
label(parts, 340, 419, 'ω₂=2ω₁，ωₛ=ω₂；其他副本按2ω₁继续平移。', 18)
save(folder / 'a5-6-bandpass.svg', parts)

parts, mx, my = axes('5.7(2)：幅频特性（纵轴除以T）', 3.3, 1.15, [-3,-2,-1,0,1,2,3], [(1,'1')], 'x=ωT/(2π)')
fn = lambda x: abs(sin(pi*x)/(pi*x)) if x else 1
polyline(parts, [(mx(-3.2+6.4*i/1600),my(fn(-3.2+6.4*i/1600))) for i in range(1601)], '#2563eb', 3)
clean(parts, 365, 64, '|H|/T', 20)
label(parts, 340, 365, '|H|=T|Sa(πx)|；直流为T，非零整数x处为零。', 18)
label(parts, 340, 393, '相位只在H非零处定义；幅度不能保留负旁瓣。', 18)
save(folder / 'a5-7-mag.svg', parts)

parts = start(420, 680, '5.7(2)：相位主值，零点处无定义')
label(parts, 340, 31, '5.7(2)：相位主值（不同2π分支同样有效）', 22)
mx = lambda x: 75+(x+3.3)/6.6*530
my = lambda y: 178-y*88
line(parts,'M45 178H631',arrow=True)
line(parts,f'M{mx(0)} 287V62',arrow=True)
for x in range(-3,4):
    line(parts,f'M{mx(x)} 178v5')
    clean(parts,mx(x),308,str(x).replace('-','−'))
for y in [-1,0,1]:
    clean(parts,mx(0)-13,my(y)+6,str(y).replace('-','−'),18,'end')
for n in range(3):
    for side in [-1,1]:
        points=[(mx(side*(n+fraction)),my(-side*fraction)) for fraction in [i/300 for i in range(301)]]
        polyline(parts,points,'#2563eb',3)
        for fraction in [0,1]:
            x=side*(n+fraction)
            if x:
                parts.append(f'<circle cx="{mx(x):.2f}" cy="{my(-side*fraction):.2f}" r="4.5" fill="white" stroke="#2563eb" stroke-width="2"/>')
parts.append(f'<circle cx="{mx(0):.2f}" cy="{my(0):.2f}" r="3.5" fill="#2563eb"/>')
clean(parts,mx(0)+23,69,'φ/π',20)
label(parts,574,335,'x=ωT/(2π)',18)
label(parts,340,369,'空心点：H=0，相位无定义；φ(0)=0。',18)
label(parts,340,398,'正频段n<x<n+1上φ/π=−(x−n)，负频取反。',18)
save(folder / 'a5-7-phase.svg',parts)

# 单独使用非对称时间轴，完整保留0至2T支撑。
mx = lambda x: 105+(x+.4)/3.1*465
my = lambda y: 267-y/1.2*180
parts = start(415,680,'5.7(3)：三角零状态响应')
label(parts,340,31,'5.7(3)：三角零状态响应（纵轴除以T）',22)
line(parts,'M45 267H630',arrow=True)
line(parts,f'M{mx(0)} 283V63',arrow=True)
for x in [0,1,2]:
    line(parts,f'M{mx(x)} 267v5'); clean(parts,mx(x),302,str(x))
clean(parts,mx(0)-12,my(1)+6,'1',18,'end')
clean(parts,mx(0)+23,69,'y/T',20)
polyline(parts,[(mx(-.35),my(0)),(mx(0),my(0)),(mx(1),my(1)),(mx(2),my(0)),(mx(2.6),my(0))],'#2563eb',3)
label(parts,610,329,'t/T',18)
label(parts,340,365,'支撑[0,2T]，顶点(T,T)，上升和下降斜率±1。',18)
label(parts,340,393,'y=t·u(t)−2(t−T)u(t−T)+(t−2T)u(t−2T)。',18)
save(folder / 'a5-7-triangle.svg',parts)

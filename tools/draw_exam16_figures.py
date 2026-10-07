"""课程16：三幅原题图、卷积、振幅谱、零极点及含初态的单边电路。"""
from math import atan, pi, sqrt
from pathlib import Path
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root/'public'/'figures'/'tk-exam-16'
folder.mkdir(parents=True, exist_ok=True)
for page, box, name in [
    (65, (390, 402, 1030, 692), 'q1-3.png'),
    (65, (642, 1344, 811, 1558), 'q2-1.png'),
    (66, (507, 932, 936, 1144), 'q3-1.png'),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/name, optimize=True)

p = start(title='课程16二1：h=f(2−t)=−f的卷积')
label(p, 360, 30, 'y=h*f：连续折线，正负面积相抵', 22)
mx = lambda t: 105+120*t
my = lambda y: 232-70*y
line(p, 'M55 232H670', arrow=True)
line(p, 'M105 285V55', arrow=True)
label(p, 684, 240, 't')
label(p, 93, 54, 'y(t)')
for t in range(5):
    line(p, f'M{mx(t)} 232V238')
    label(p, mx(t), 260, t, 18)
for y in [-1, 1, 2]:
    line(p, f'M99 {my(y)}H111')
    label(p, 85, my(y)+6, str(y).replace('-', '−'), 18, 'end')
polyline(p, [(55, my(0))]+[(mx(t), my(y)) for t, y in [(0,0),(1,-1),(2,2),(3,-1),(4,0)]]+[(670,my(0))])
label(p, 360, 328, '0≤t≤4外为0；中心峰2，两侧谷−1；∫y(t)dt=0', 17)
save(folder/'a2-1.svg', p)

p = start(title='课程16二4：单边余弦振幅谱')
label(p, 360, 30, '单边振幅：第3次为2，第8次为1', 22)
line(p, 'M72 255H681', arrow=True)
line(p, 'M90 278V58', arrow=True)
label(p, 82, 50, 'Aₙ')
for n in [0, 3, 8]:
    x = 90+60*n
    line(p, f'M{x} 255V261')
    label(p, x, 283, n, 18)
for n, amplitude in [(3,2),(8,1)]:
    x, y = 90+60*n, 255-amplitude*83
    line(p, f'M{x} 255V{y}', '#0f766e', 3)
    p.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#0f766e"/>')
    label(p, x, y-12, amplitude, 20)
label(p, 650, 294, 'ω/Ω₀', 18)
label(p, 360, 328, 'Ω₀=π/6 rad/s；其余振幅0；线高不是FT冲激强度', 17)
save(folder/'a2-4.svg', p)

p = start(height=440, title='课程16二5：标准二阶有理变换的零极点和ROC')
label(p, 360, 30, '标准二阶解释：二重零点与一对共轭极点', 22)
p.append('<rect x="144" y="62" width="430" height="290" rx="10" fill="#ecfdf5"/>')
cx, cy, scale = 350, 207, 195
p.append(f'<circle cx="{cx}" cy="{cy}" r="{scale/2}" fill="white" stroke="#94a3b8" stroke-dasharray="5 5"/>')
line(p, f'M140 {cy}H610', arrow=True)
line(p, f'M{cx} 365V53', arrow=True)
label(p, 624, cy+6, 'Re z', 17)
label(p, cx+35, 56, 'Im z', 17)
p.append(f'<circle cx="{cx}" cy="{cy}" r="7" fill="white" stroke="#2563eb" stroke-width="2.5"/>')
label(p, cx-17, cy+31, '0 (×2)', 18, 'end')
for sign in [-1,1]:
    x, y = cx+scale/4, cy-sign*scale*sqrt(3)/4
    line(p, f'M{x-6} {y-6}L{x+6} {y+6}M{x-6} {y+6}L{x+6} {y-6}', '#b91c1c', 2.5)
    label(p, x+16, y+6, '(¼, '+('+' if sign==1 else '−')+'√3/4)', 18, 'start')
label(p, 530, 338, '|z|>½', 20)
label(p, 360, 399, '○：零点；×：极点；ROC在虚线圆外，不含极点', 18)
label(p, 360, 426, '按无无穷远极点的通常二阶有理解释；条件边界见解答', 16)
save(folder/'a2-5.svg', p)

p = start(height=500, width=900, title='课程16三1：保留两初态源的单边s域电路')
label(p, 450, 31, '单边s域模型：两个外源与两个初态源均保留', 24)
top, bottom = 135, 320
# 电压源Us连接地和左端，初态电感源右正左负，串联阻抗s。
line(p, f'M85 {bottom}H800M85 {top}H173M227 {top}H270M345 {top}H800')
line(p, 'M85 135V201M85 255V320')
p.append('<circle cx="85" cy="228" r="27" fill="white" stroke="#334155" stroke-width="1.8"/>')
label(p, 85, 223, '+', 22)
label(p, 85, 245, '−', 22)
label(p, 74, 277, 'Uₛ=1/s', 18, 'end')
p.append('<circle cx="200" cy="135" r="27" fill="white" stroke="#334155" stroke-width="1.8"/>')
label(p, 186, 142, '−', 23)
label(p, 212, 142, '+', 23)
label(p, 200, 190, 'L iL(0⁻)=1', 18)
p.append('<rect x="270" y="119" width="75" height="32" fill="white" stroke="#334155" stroke-width="1.8"/>')
label(p, 307, 112, 'sL=s', 19)
line(p, 'M270 78H348', arrow=True)
label(p, 307, 65, 'I_L', 18)
label(p, 575, 105, '上节点 V=U_C', 20)
# 电容等效阻抗和朝上的初态Norton源是两条并联支路。
line(p, 'M430 135V207M430 250V320')
p.append('<rect x="418" y="207" width="24" height="43" fill="white" stroke="#334155" stroke-width="1.8"/>')
label(p, 394, 234, '2/s', 20)
line(p, 'M545 135V201M545 255V320')
p.append('<circle cx="545" cy="228" r="27" fill="white" stroke="#334155" stroke-width="1.8"/>')
line(p, 'M545 245V211', arrow=True)
label(p, 545, 357, 'C uC(0⁻)=½', 18)
# 原外部电流源仍向下，电阻为1Ω。
line(p, 'M675 135V201M675 255V320')
p.append('<circle cx="675" cy="228" r="27" fill="white" stroke="#334155" stroke-width="1.8"/>')
line(p, 'M675 211V245', arrow=True)
label(p, 675, 277, 'Iₛ=1/s', 18)
line(p, 'M800 135V207M800 250V320')
p.append('<rect x="788" y="207" width="24" height="43" fill="white" stroke="#334155" stroke-width="1.8"/>')
label(p, 841, 234, '1Ω', 20)
line(p, 'M855 159V198', arrow=True)
label(p, 855, 148, 'I_R', 18)
label(p, 450, 397, 'KVL：s I_L−1 = 1/s−V', 21)
label(p, 450, 432, 'KCL：I_L = (s/2)V−½+V+1/s', 21)
label(p, 450, 475, '电容初态源向上；外部电流源向下；I_R=V/1Ω', 19)
save(folder/'a3-1-model.svg', p)

p = start(height=490, title='课程16三2：全通幅度及连续相位')
label(p, 360, 30, 'H(jω)=(a−jω)/(a+jω)，a>0', 22)
mx = lambda x: 80+(x+4)*70
line(p, 'M60 159H678', arrow=True)
line(p, 'M360 179V55', arrow=True)
polyline(p, [(mx(-4),86),(mx(4),86)])
label(p, 350, 81, '1', 18, 'end')
label(p, 680, 149, 'ω/a', 17)
label(p, 126, 64, '|H|', 19)
line(p, 'M60 326H678', arrow=True)
line(p, 'M360 442V209', arrow=True)
label(p, 677, 319, 'ω/a', 17)
label(p, 141, 223, 'arg H (rad)', 18)
for value in [-pi,0,pi]:
    y = 326-value*32
    if value:
        line(p, f'M65 {y}H660', '#94a3b8', 1.3, dash=True)
        label(p, 350, y-5, 'π' if value>0 else '−π', 17, 'end')
points = [(mx(-4+8*i/200),326+2*atan(-4+8*i/200)*32) for i in range(201)]
polyline(p, points)
for x in [-4,-2,0,2,4]:
    for y in [159,326]:
        line(p, f'M{mx(x)} {y}V{y+5}')
        label(p, mx(x), y+26, str(x).replace('-', '−'), 17)
label(p, 360, 470, '连续相位 −2atan(ω/a)：从+π渐近下降至−π', 18)
save(folder/'a3-2.svg', p)
print('课程16：3幅原题图与5幅答案图已生成。')

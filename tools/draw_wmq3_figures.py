"""教材第3章原图裁剪；谱线与卷积参考图由核对后的数学关系独立绘制。"""
from pathlib import Path
from math import pi, sin, cos, atan, sqrt
from PIL import Image
from figure_svg import start, label, line, polyline, save

root = Path(__file__).resolve().parents[1]
folder = root / 'public' / 'figures' / 'wmq3'
folder.mkdir(parents=True, exist_ok=True)
for page, crops in [
    (70, [('q3-3-5', (190, 1290, 635, 1455))]),
    (73, [('q3-4', (390, 215, 1000, 448)), ('q3-5-a', (385, 1125, 650, 1300)), ('q3-5-b', (725, 1125, 1030, 1300))]),
    (75, [('q3-9-a', (490, 1485, 685, 1660)), ('q3-9-b', (710, 1485, 910, 1660))]),
    (78, [('q3-12-a', (360, 1210, 635, 1500)), ('q3-12-b', (685, 1210, 1035, 1500))]),
    (83, [('q3-18', (360, 210, 1030, 450)), ('q3-19', (1015, 1360, 1215, 1570))]),
    (85, [('q3-22', (405, 1425, 1010, 1720))]),
    (86, [('q3-23', (350, 1000, 1045, 1260))]),
]:
    with Image.open(root / 'work' / 'pages' / 'textbook' / f'p{page}.png') as im:
        for name, box in crops:
            im.crop(box).save(folder / (name + '.png'), optimize=True)


def clean_label(parts, x, y, text, size=20, anchor='middle'):
    label(parts, x, y, text, size, anchor)
    parts[-1] = parts[-1].replace('fill="#334155"', 'fill="#334155" stroke="white" stroke-width="5" paint-order="stroke fill" stroke-linejoin="round"')


def stems(name, title, values, caption, scale_labels=None, phase=False):
    parts = start(350, 660, title)
    label(parts, 330, 33, title, 22)
    mx = lambda x: 65 + (x+5)/10*530
    bound = max(abs(y) for x,y in values) or 1
    zero = 185 if any(y<0 for x,y in values) else 260
    my = lambda y: zero-y/bound*(105 if zero==185 else 155)
    line(parts, f'M35 {zero}H620', arrow=True)
    line(parts, f'M{mx(0)} 294V59', arrow=True)
    clean_label(parts, 632, zero+7, 'n', 21)
    for n in range(-5,6):
        line(parts,f'M{mx(n)} {zero}v4')
    for x,y in values:
        if y != 0:
            line(parts,f'M{mx(x)} {zero}V{my(y)}',width=3,arrow=phase)
        if not phase or y == 0:
            parts.append(f'<circle cx="{mx(x):.2f}" cy="{my(y):.2f}" r="4" fill="#2563eb"/>')
    # 数字最后绘制，白底描边让向下谱线不会穿过横轴标签。
    for n in range(-5,6):
        clean_label(parts,mx(n),zero+24,str(n),18)
    if scale_labels:
        for x,y,text in scale_labels:
            label_y=my(y)-12 if y>=0 else max(my(y)+14,zero+60) if phase else my(y)+28
            clean_label(parts,mx(x),label_y,text,19)
    label(parts,330,329,caption,18)
    save(folder/(name+'.svg'),parts)


stems('a3-2-mag', '3.2(1) 双边级数幅度 |Cₙ|', [(-4,2.5),(-3,3.5),(-2,5),(2,5),(3,3.5),(4,2.5)],
      'ω₀=400π rad/s；FT 冲激权重为 2πCₙ', [(-2,5,'5'),(2,5,'5'),(-3,3.5,'3.5'),(3,3.5,'3.5'),(-4,2.5,'2.5'),(4,2.5,'2.5')])
stems('a3-2-phase', '3.2(1) 双边级数相位 ∠Cₙ', [(-4,pi),(-3,pi/3),(-2,-pi/4),(2,pi/4),(3,-pi/3),(4,pi)],
      '负实数谱线取 π；零系数处相位无定义', [(-4,pi,'π'),(4,pi,'π'),(-3,pi/3,'π/3'),(3,-pi/3,'−π/3'),(-2,-pi/4,'−π/4'),(2,pi/4,'π/4')],True)
vals=[(n,0.5 if n==0 else 0 if n%2==0 else sin(n*pi/2)/(n*pi)) for n in range(-5,6)]
stems('a3-5-a', '3.5(a) 实系数谱线 Cₙ', vals, 'ω₀=π/2；有正负谱线及直流 C₀=1/2',[(0,.5,'1/2'),(-1,1/pi,'1/π'),(1,1/pi,'1/π'),(-3,-1/(3*pi),'−1/(3π)'),(3,-1/(3*pi),'−1/(3π)')])
stems('a3-5-b-mag', '3.5(b) 双边幅度 |Cₙ| / E', [(n,.5 if n==0 else 1/(2*pi*abs(n))) for n in range(-5,6)],
      'ω₀=2π/T；直流为 E/2，与 T 无关', [(0,.5,'1/2'),(-1,1/(2*pi),'1/(2π)'),(1,1/(2*pi),'1/(2π)')])
stems('a3-5-b-phase', '3.5(b) 双边相位 ∠Cₙ（E>0）', [(n,pi/2 if n<0 else -pi/2 if n>0 else 0) for n in range(-5,6)],
      'n<0 为 π/2，n>0 为 −π/2，n=0 为 0', [(-3,pi/2,'π/2'),(3,-pi/2,'−π/2')],True)
stems('a3-22', '3.22 交替正负冲激列的级数谱 CₙT', [(n,2 if n%2 else 0) for n in range(-5,6)],
      '奇数谱线 Cₙ=2/T；FT 冲激权重 4π/T', [(-3,2,'2'),(-1,2,'2'),(1,2,'2'),(3,2,'2')])

parts=start(360,660,'3.18(1) 两个中心矩形的卷积')
label(parts,330,34,'3.18(1) 对称梯形（等宽时为三角形）',22)
mx=lambda x:330+x*100
my=lambda y:260-y*140
line(parts,'M40 260H620',arrow=True)
line(parts,'M330 292V70',arrow=True)
polyline(parts,[(mx(x),my(y)) for x,y in [(-2.6,0),(-2,0),(-.8,1),(.8,1),(2,0),(2.6,0)]],width=3)
for x,text in [(-2,'−a'),(-.8,'−b'),(0,'0'),(.8,'b'),(2,'a')]:clean_label(parts,mx(x),290,text)
clean_label(parts,330,105,'E₁E₂m',22)
label(parts,330,327,'a=(τ₁+τ₂)/2，b=|τ₁−τ₂|/2，m=min(τ₁,τ₂)',18)
save(folder/'a3-18-1.svg',parts)

parts=start(450,660,'3.28 全时间周期输入与输出')
label(parts,330,32,'3.28 同一纵轴比较输入与输出',22)
mx=lambda x:65+x/(2*pi)*530
my=lambda y:228-y*71
line(parts,'M40 228H620',arrow=True)
line(parts,'M65 378V58',arrow=True)
for x,text in [(0,'0'),(pi,'π'),(2*pi,'2π')]:clean_label(parts,mx(x),407,text)
for y in [-2,-1,1,2]:clean_label(parts,52,my(y)+6,str(y),18,anchor='end')
for func,color in [(lambda t:sin(t)+sin(3*t),'#2563eb'),(lambda t:(sin(t)-cos(t))/2+(sin(3*t)-3*cos(3*t))/10,'#d97706')]:
    polyline(parts,[(mx(i*2*pi/800),my(func(i*2*pi/800))) for i in range(801)],color=color,width=3)
label(parts,205,61,'蓝：x(t)',20)
label(parts,465,61,'橙：y(t)',20)
label(parts,330,438,'各频率衰减不同；第二分量相位为 −atan(3)',19)
save(folder/'a3-28.svg',parts)
print('教材第3章：12幅原题裁图、8幅独立参考SVG已生成。')

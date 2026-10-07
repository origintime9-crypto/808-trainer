"""三份外校精选：从原 PDF 提取题图，并绘制独立解答图。"""
from pathlib import Path
import math
import fitz

root = Path(__file__).resolve().parents[1]
source = Path('E:/BaiduNetdiskDownload/百所院校真题')
out = root / 'public' / 'figures' / 'external'
out.mkdir(parents=True, exist_ok=True)
for ident, page, name, box in [
    (14, 2, 'xaut-wave.png', (.29, .345, .74, .55)),
    (14, 3, 'xaut-block.png', (.21, .635, .80, .775)),
    (8, 1, 'sau-step.png', (.34, .438, .65, .602)),
    (8, 1, 'sau-wave.png', (.32, .706, .69, .90)),
    (8, 2, 'sau-discrete-block.png', (.21, .235, .80, .43)),
    (8, 3, 'sau-circuit.png', (.23, .612, .79, .81)),
    (30, 3, 'sxu-spectrum.png', (.30, .04, .70, .245)),
]:
    with fitz.open(next(source.glob(f'{ident}-*.pdf'))) as doc:
        p = doc[page-1]
        w, h = p.rect.width, p.rect.height
        rect = fitz.Rect(box[0]*w, box[1]*h, box[2]*w, box[3]*h)
        p.get_pixmap(matrix=fitz.Matrix(2.3, 2.3), clip=rect).save(str(out/name))

# 自绘答案用 SVG，保留原题定义的坐标与冲激强度。
def svg(name, title, body, caption=''):
    (out/name).write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="720" height="310" viewBox="0 0 720 310" role="img" aria-label="{title}"><rect width="720" height="310" fill="white"/><style>text{{font:17px 'Microsoft YaHei',sans-serif;fill:#20364c}}.axis{{stroke:#6b7785;stroke-width:1.5}}.curve{{fill:none;stroke:#1f4e79;stroke-width:3}}</style><text x="24" y="30">{title}</text>{body}<text x="24" y="289" font-size="14">{caption}</text></svg>''', encoding='utf8')

def lineplot(name, title, nodes, xmin, xmax, ymax, ticks, impulses=()):
    xx = lambda v: 58+(v-xmin)/(xmax-xmin)*600
    base = 167 if any(y < 0 for _, y in nodes) else 234
    yy = lambda v: base-v/ymax*145
    body = f'<path class="axis" d="M38 {base}H686 M{xx(0)} 255V58"/>'
    body += f'<text x="687" y="{base+19}">t</text>'
    body += '<polyline class="curve" points="'+' '.join(f'{xx(x)},{yy(y)}' for x,y in nodes)+'"/>'
    for k in ticks: body += f'<text x="{xx(k)-8}" y="{base+23}">{k}</text>'
    for k in sorted(set(y for _,y in nodes if y)):
        body += f'<text x="{xx(0)-27}" y="{yy(k)+5}">{k}</text>'
    for x, a in impulses:
        body += f'<path class="curve" d="M{xx(x)} {base}V{yy(a)} M{xx(x)-6} {yy(a)+10}L{xx(x)} {yy(a)}L{xx(x)+6} {yy(a)+10}"/><text x="{xx(x)+9}" y="{yy(a)+8}">{a}</text>'
    svg(name, title, body, '普通波形与冲激分开标注；边界单点不改变积分结果。')

lineplot('xaut-wave-answer.svg', 'f(2−t)：先下降，再保持高度2', [(-1,0),(0,0),(0,4),(2,2),(4,2),(4,0),(5,0)], -1,5,4, [0,2,4])
lineplot('sau-step-answer.svg', 'y₁(t)：节点 (−3,0), (−1,2), (1,−2), (3,0)', [(-4,0),(-3,0),(-1,2),(1,-2),(3,0),(4,0)], -4,4,4, [-3,-1,0,1,3])
lineplot('sau-wave-answer.svg', 'f(2t−2)：冲激强度2，位置1/2', [(0,0),(.5,0),(1,1),(2,1),(2,0),(3,0)], 0,3,2, [0,.5,1,2], [(0.5,2)])

svg('sau-ode-diagram.svg', 'q″ = x − 3q′ − 2q；y = q′ + 4q', '''<defs><marker id="a" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="#1f4e79"/></marker></defs><g stroke="#1f4e79" stroke-width="2" fill="none"><circle cx="130" cy="145" r="20"/><rect x="230" y="122" width="70" height="46"/><rect x="410" y="122" width="70" height="46"/><circle cx="610" cy="145" r="20"/><path marker-end="url(#a)" d="M40 145H110 M150 145H230 M300 145H410 M480 145H590 M630 145H685 M350 145V72H610V125 M530 145V220H610V165 M350 145V204H130V165 M530 145V245H130V165"/></g><text x="122" y="151">Σ</text><text x="602" y="151">Σ</text><text x="253" y="151">1/s</text><text x="433" y="151">1/s</text><text x="45" y="134">x</text><text x="170" y="134">q″</text><text x="335" y="134">q′</text><text x="510" y="134">q</text><text x="660" y="134">y</text><text x="425" y="62">1</text><text x="555" y="211">4</text><text x="230" y="197">−3</text><text x="360" y="238">−2</text>''', '两个积分器串联；负反馈 −3、−2，前馈 1、4。')

svg('sxu-differentiator.svg', '连续微分器 H(jω)=jω', '''<path class="axis" d="M40 220H320 M180 230V75 M390 157H685 M537 235V62"/><path class="curve" d="M65 98L180 220L295 98 M405 218H536 M538 96H670"/><text x="52" y="64">|H|=|ω|</text><text x="406" y="62">φ</text><text x="548" y="96">π/2</text><text x="548" y="216">−π/2</text><text x="176" y="250">0</text><text x="533" y="252">0</text><text x="319" y="240">ω</text><text x="682" y="180">ω</text>''', '原点增益为0，相位未定义；负频率与正频率相位符号相反。')
points = ' '.join(f'{40+280*i/100},{220-125*abs(math.sin((-math.pi+2*math.pi*i/100)/2))}' for i in range(101))
svg('sxu-discrete-differentiator.svg', '离散微分器：主频率区间 −π ≤ Ω ≤ π', f'''<path class="axis" d="M32 220H330 M180 235V70 M390 157H680 M535 235V65"/><polyline class="curve" points="{points}"/><path class="curve" d="M400 157L534 225 M536 89L670 157"/><text x="36" y="64">2|sin(Ω/2)|/Tₛ</text><text x="43" y="249">−π</text><text x="171" y="249">0</text><text x="307" y="249">π</text><text x="549" y="86">π/2</text><text x="549" y="225">−π/2</text><text x="390" y="250">−π</text><text x="530" y="250">0</text><text x="664" y="250">π</text>''', '频响周期2π；Ω=ωTₛ；原点的相位不取值。')
svg('sau-circuit-s-model.svg', '零状态复频域模型：保留电压、电流参考方向', '''<g class="axis" fill="none"><circle cx="95" cy="166" r="27"/><path d="M95 139V103H179 M95 193V249H635 M259 103H347 M347 103H433 M513 103H635V132 M347 103V146 M347 210V249 M635 196V249"/><rect x="179" y="83" width="80" height="40"/><rect x="433" y="83" width="80" height="40"/><rect x="331" y="146" width="32" height="64"/><rect x="619" y="132" width="32" height="64"/><path d="M670 129V175 M664 165L670 175L676 165"/></g><text x="43" y="175">E(s)</text><text x="104" y="137">+</text><text x="104" y="216">−</text><text x="198" y="109">1/s</text><text x="453" y="109">1/2</text><text x="372" y="184">1</text><text x="657" y="198">s/2</text><text x="667" y="120">I(s)</text><text x="354" y="88">V(s)</text><circle cx="347" cy="103" r="3" fill="#20364c"/><circle cx="347" cy="249" r="3" fill="#20364c"/>''', '各阻抗单位为Ω；零状态电容、电感不附加初始状态源。')

replicas = ''
for center, label in [(142, '−ωₛ'), (360, '0'), (578, 'ωₛ')]:
    replicas += f'<path class="curve" d="M{center-72} 227Q{center} -40 {center+72} 227"/><text x="{center-14}" y="251">{label}</text>'
svg('sxu-sampling-spectrum.svg', '抽样频谱：Fₛ(jω) = (1/T₀) Σ F(j(ω−kωₛ))', f'''<path class="axis" d="M35 227H690 M360 234V69"/>{replicas}<text x="687" y="248">ω</text><text x="369" y="96">1/T₀</text><text x="276" y="212">−ωₘ</text><text x="426" y="212">ωₘ</text>''', '示意：ωₛ>2ωₘ，原谱按ωₛ周期复制；T₀未给数值，非定量曲线。')
def polemap(name, title, zeros, poles, unit_circle=False):
    cx, cy, scale = 430, 165, 72
    body = '<path class="axis" d="M180 165H665 M430 262V49"/>'
    if unit_circle:
        body += '<circle cx="430" cy="165" r="72" fill="none" stroke="#8c99a8" stroke-dasharray="5 4"/><text x="500" y="96">|z|=1</text>'
    for a, b, label in zeros:
        x, y = cx+a*scale, cy-b*scale
        body += f'<circle cx="{x}" cy="{y}" r="6" fill="white" stroke="#1f4e79" stroke-width="2"/><text x="{x}" y="{y+49 if a else y+31}" text-anchor="middle">{label}</text>'
    for a, b, label in poles:
        x, y = cx+a*scale, cy-b*scale
        body += f'<path stroke="#c0392b" stroke-width="2.5" d="M{x-6} {y-6}L{x+6} {y+6} M{x-6} {y+6}L{x+6} {y-6}"/><text x="{x-87 if b else x-12}" y="{y-12 if b else y+31}">{label}</text>'
    body += '<text x="42" y="90">○ 零点</text><text x="42" y="121">× 极点</text>'
    body += '<text x="669" y="173">Re</text><text x="439" y="57">Im</text>'
    svg(name, title, body, '因果连续系统：极点在左半平面。' if not unit_circle else '因果离散系统：ROC为|z|>2；单位圆上有极点，系统不稳定。')

# 高度310的画布内使用稍小的纵轴比例，使两个复极点完整可见。
polemap('sau-circuit-poles.svg', '电路H(s)：零点0；极点−1±j√2', [(0,0,'0')], [(-1,math.sqrt(2),'−1+j√2'),(-1,-math.sqrt(2),'−1−j√2')])
polemap('sau-discrete-poles.svg', 'H(z)：零点0、−1/2；极点−1、−2', [(0,0,'0'),(-.5,0,'−1/2')], [(-1,0,'−1'),(-2,0,'−2')], True)
print('提取7幅原题图，生成10幅答案SVG。')

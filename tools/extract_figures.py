"""从已渲染的原卷提取题图，保留原始框图符号。"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
items = [
    ('zt2016', 2, 'q2-2', (300, 165, 965, 435)),
    ('zt2016', 2, 'q2-3', (190, 490, 790, 745)),
    ('zt2016', 2, 'q3', (220, 1080, 990, 1355)),
    ('zt2016', 3, 'q4', (365, 320, 925, 600)),
    ('zt2016', 3, 'q5', (180, 770, 975, 1200)),
    ('zt2017', 2, 'q2-2', (345, 190, 805, 480)),
    ('zt2017', 2, 'q3', (270, 1050, 950, 1360)),
    ('zt2017', 3, 'q5', (210, 315, 935, 700)),
]
for paper, page, name, box in items:
    out = root / 'public' / 'figures' / paper / f'{name}.png'
    out.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(root / 'work' / 'pages' / paper / f'p{page:02d}.png') as im:
        im.crop(box).save(out, optimize=True)
    print(out.relative_to(root))

"""两份复习题库的原题图；只裁题面，不把资料解答混入题干。"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
items = [
    ('tk-review', 2, 'q10', (480, 145, 850, 355)),
    ('tk-review', 2, 'q11', (480, 565, 850, 792)),
    ('tk-review', 2, 'q12', (485, 885, 830, 1110)),
    ('tk-review', 3, 'q13', (300, 305, 1010, 520)),
    ('tk-review', 4, 'q15', (380, 345, 930, 550)),
    ('tk-review', 8, 'q23', (315, 806, 990, 1100)),
    ('tk-total', 1, 'q1-2', (450, 306, 895, 643)),
    ('tk-total', 1, 'q1-5', (610, 1025, 977, 1252)),
    ('tk-total', 2, 'q1-9', (445, 128, 909, 327)),
    ('tk-total', 2, 'q2-1', (620, 649, 1070, 851)),
    # 题面两图排版重叠，采用同一文件解答区中分开的原条件图；不截解答。
    ('tk-total', 8, 'q2-2', (160, 775, 985, 1033)),
    ('tk-total', 2, 'q2-3', (75, 1285, 825, 1585)),
    ('tk-total', 3, 'q2-4', (197, 110, 922, 279)),
    ('tk-total', 4, 'q3-7', (662, 78, 1117, 259)),
]
for paper, page, name, box in items:
    out = root / 'public' / 'figures' / paper / f'{name}.png'
    out.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(root / 'work' / 'pages' / paper / f'p{page:02d}.png') as im:
        im.crop(box).save(out, optimize=True)
    print(out.relative_to(root))

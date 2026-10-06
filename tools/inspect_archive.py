"""把复试合集扫描页的页眉拼成索引，便于核对是否有缺失年份。"""
from io import BytesIO
from pathlib import Path
import fitz
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
doc = fitz.open('E:/BaiduNetdiskDownload/课件题库及重点/信号与系统复试真题.pdf')
out = root / 'work' / 'archive-headers'
out.mkdir(parents=True, exist_ok=True)
headers = []
for i, page in enumerate(doc):
    sources = page.get_images(full=True)
    if not sources:
        continue
    source = max(sources, key=lambda x: x[2]*x[3])
    original = Image.open(BytesIO(doc.extract_image(source[0])['image'])).convert('RGB')
    header = original.crop((0, 0, original.width, int(original.height*.23)))
    header.thumbnail((550, 190))
    headers.append((i+1, header))
for start in range(0, len(headers), 12):
    canvas = Image.new('RGB', (1120, 1320), 'white')
    draw = ImageDraw.Draw(canvas)
    for j, (page_no, header) in enumerate(headers[start:start+12]):
        x, y = (j%2)*560, (j//2)*220
        draw.text((x+4, y+3), f'PDF PAGE {page_no}', fill='black')
        canvas.paste(header, (x, y+25))
    canvas.save(out / f'sheet{start//12+1}.png')
print(f'已索引 {len(headers)} 页，页眉在 work/archive-headers。')

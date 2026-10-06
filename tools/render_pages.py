"""把 PDF 渲染成 PNG：python tools/render_pages.py <pdf> <输出目录> [dpi]"""
import pathlib
import sys

import fitz

src, out = sys.argv[1], pathlib.Path(sys.argv[2])
dpi = int(sys.argv[3]) if len(sys.argv) > 3 else 170
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(src)
for i, page in enumerate(doc, 1):
    page.get_pixmap(dpi=dpi).save(out / f"p{i:02d}.png")
print(len(doc), "pages ->", out)

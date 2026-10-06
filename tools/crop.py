"""裁剪题图：python tools/crop.py <页面png> x0,y0,x1,y1 <输出png>"""
import sys

from PIL import Image

src, box, dst = sys.argv[1], sys.argv[2], sys.argv[3]
Image.open(src).crop(tuple(int(v) for v in box.split(","))).save(dst, optimize=True)
print("saved", dst)

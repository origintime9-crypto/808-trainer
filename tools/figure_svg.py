"""数学题答案图的基础 SVG 元素；只绘制给定坐标，不求解或改写数据。"""
from html import escape

def start(height=340,width=720,title=''):
    return [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img">',
            '<title>'+escape(title)+'</title>',
            '<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0L8,4L0,8Z" fill="#334155"/></marker></defs>',
            f'<rect width="{width}" height="{height}" fill="white"/>']

def label(parts,x,y,value,size=19,anchor='middle'):
    parts.append(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}" font-family="Arial,Microsoft YaHei,sans-serif" fill="#334155">{escape(str(value))}</text>')

def line(parts,path,color='#334155',width=1.8,arrow=False,dash=False):
    parts.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="{width}"'+(' marker-end="url(#arrow)"' if arrow else '')+(' stroke-dasharray="4 4"' if dash else '')+'/>')

def polyline(parts,points,color='#0f766e',width=3):
    parts.append('<polyline points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in points)+f'" fill="none" stroke="{color}" stroke-width="{width}"/>')

def save(path,parts):
    path.write_text('\n'.join(parts+['</svg>']),encoding='utf-8')

def spectrum(path,title,span,max_y,segments,ticks,yticks,caption,impulses=(),axis_label='ω/π'):
    p=start(title=title)
    mx=lambda value:62+(value+span)/(2*span)*596
    my=lambda value:253-value/max_y*170
    label(p,360,30,title,22)
    line(p,'M38 253H690',arrow=True)
    line(p,f'M{mx(0)} 270V53',arrow=True)
    label(p,668,282 if axis_label=='ω/π' else 301,axis_label,18)
    for value in ticks:
        line(p,f'M{mx(value)} 253V259')
        label(p,mx(value),282,str(value).replace('-','−'),17)
    for tick in yticks:
        value,text=tick if isinstance(tick,tuple) else (tick,str(tick))
        label(p,mx(0)-16,my(value)+6,text,17,'end')
    for segment in segments:
        polyline(p,[(mx(x),my(y)) for x,y in segment])
    for value,weight in impulses:
        line(p,f'M{mx(value)} 253V95','#0f766e',2.8,True)
        label(p,mx(value),80,weight,18)
    label(p,26,240,'…',22)
    label(p,699,240,'…',22)
    label(p,360,321,caption,17)
    save(path,p)

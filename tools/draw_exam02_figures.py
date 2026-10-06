"""课程题库 02：按已核对题图裁剪，按独立解答绘制波形及五个节点频谱。"""
from pathlib import Path
from PIL import Image
from figure_svg import start,label,line,polyline,save,spectrum

root=Path(__file__).resolve().parents[1]
folder=root/'public'/'figures'/'tk-exam-02'
folder.mkdir(parents=True,exist_ok=True)
for page,no,box in [
    (6,'2-2',(536,1230,889,1510)),
    (7,'2-3',(609,461,817,677)),
    (8,'2-5',(355,117,1045,401)),
    (9,'3-2',(422,1264,990,1518)),
]:
    Image.open(root/'work'/'pages'/'tk-exams'/f'p{page:02}.png').crop(box).save(folder/f'q{no}.png',optimize=True)

p=start(380,title='f(4−2t)=g(1−t) 的波形')
mx=lambda value:75+(value+2)*112
my=lambda value:190-85*value
label(p,360,32,'f(4−2t)=g(1−t)',22)
line(p,'M35 190H690',arrow=True);line(p,f'M{mx(0)} 302V57',arrow=True)
for value in [-1,0,1,2,3]:label(p,mx(value),215,value,18)
label(p,mx(0)-23,my(1)+6,'1',18);label(p,mx(0)-27,my(-1)+6,'−1',18)
polyline(p,[(mx(x),my(y)) for x,y in [(-1,0),(-1,-1),(0,-1),(0,1),(1,1),(3,-1),(3,0)]])
label(p,672,215,'t',18)
label(p,360,343,'(−1,0) 为 −1；(0,1) 为 1；(1,3) 为 2−t',18)
label(p,360,368,'其余为 0，跳变端点按阶跃约定',17)
save(folder/'a2-2.svg',p)

spectrum(folder/'a3-2-b.svg','B 点：周期冲激谱',230,1,[],[-200,-100,0,100,200],[],
         '谱线间隔 100π，每根冲激强度 100π',
         [(k*100,'100π') for k in [-2,-1,0,1,2]])
spectrum(folder/'a3-2-c.svg','C 点：抽样频谱副本',230,5,
         [[(center-20,0),(center,5),(center+20,0)] for center in [-200,-100,0,100,200]],
         [-200,-100,0,100,200],[5],'每个三角副本半宽 20π，峰高 5')
spectrum(folder/'a3-2-d.svg','D 点：带通只保留两侧半谱',140,5,
         [[(-120,0),(-100,5),(-100,0)],[(100,0),(100,5),(120,0)]],
         [-120,-100,0,100,120],[5],'只保留 −120π..−100π 与 100π..120π')
spectrum(folder/'a3-2-e.svg','E 点：余弦移频后的频谱',235,2.5,
         [[(-220,0),(-200,2.5),(-200,0)],[(-20,0),(0,2.5),(20,0)],[(200,0),(200,2.5),(220,0)]],
         [-200,-20,0,20,200],[(2.5,'5/2')],'基带为完整三角，两侧高频仍是半三角')
spectrum(folder/'a3-2-f.svg','F 点：恢复后的基带频谱',35,2.5,
         [[(-20,0),(0,2.5),(20,0)]],[-20,0,20],[(2.5,'5/2')],'Y=25F_A，基带半宽 20π，峰高 5/2')
print('课程题库 02：四幅题图、一幅答案波形、五幅节点频谱。')

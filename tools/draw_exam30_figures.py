"""课程30新增零极点题的原图，保持±j零点、±1极点，无附加ROC。"""
from pathlib import Path
from PIL import Image

root=Path(__file__).resolve().parents[1]
folder=root/'public/figures/tk-exam-30'
folder.mkdir(parents=True,exist_ok=True)
page=Image.open(root/'work/pages/tk-exams/p94.png')
page.crop((560,790,819,998)).save(folder/'q2-2.png',optimize=True)
print('课程30：1幅新增原题零极点PNG，无原件PDF进入发布。')

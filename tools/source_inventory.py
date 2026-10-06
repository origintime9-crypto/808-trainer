"""资料登记与课件术语定位，不将原始讲义或扫描页部署到网站。"""
import json
from pathlib import Path
import fitz

project = Path(__file__).resolve().parent.parent
root = Path('E:/BaiduNetdiskDownload')
folders = ['中北', '课件题库及重点', '课后习题答案']
keywords = ['冲激', '周期', '卷积', '抽样定理', '时不变', '傅里叶变换', '对偶', '初值定理', '终值定理', '收敛域', '稳定', '因果', '劳斯', '零输入', '差分', '无失真']
inventory = []
course_index = {}
for folder in folders:
    for path in sorted((root / folder).rglob('*.pdf')):
        with fitz.open(path) as doc:
            inventory.append({'path': path.relative_to(root).as_posix(), 'pages': len(doc), 'bytes': path.stat().st_size})
            if path.parent.name == '课件PPT' and path.name != '信号与系统PPT总.pdf':
                texts = [page.get_text() for page in doc]
                course_index[path.name] = {key: [i+1 for i, text in enumerate(texts) if key in text][:8] for key in keywords if any(key in text for text in texts)}
out = project / 'work'
out.mkdir(exist_ok=True)
(out / 'source-inventory.json').write_text(json.dumps(inventory, ensure_ascii=False, indent=2), encoding='utf8')
(out / 'course-index.json').write_text(json.dumps(course_index, ensure_ascii=False, indent=2), encoding='utf8')
print(f'相关 PDF：{len(inventory)} 份；登记见 work/source-inventory.json。')
print(json.dumps(course_index, ensure_ascii=False, indent=2))

"""一次运行所有独立数学复核，任一失败立即退出。"""
from pathlib import Path
import os
import subprocess
import sys

root = Path(__file__).resolve().parent.parent
env = {**os.environ, 'PYTHONUTF8': '1', 'PYTHONUNBUFFERED': '1'}
scripts = sorted((root / 'tools' / 'verify').glob('zt*.py')) + sorted((root / 'tools' / 'verify').glob('tk_*.py')) + sorted((root / 'tools' / 'verify').glob('hw*.py')) + sorted((root / 'tools' / 'verify').glob('wmq*.py'))
for path in scripts:
    print(f'\n{path.stem} 数学复核', flush=True)
    subprocess.run([sys.executable, str(path)], cwd=root, env=env, check=True)
print('\n全部真题与已录入题库的符号检查完成。')

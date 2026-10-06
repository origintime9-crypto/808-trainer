import { randomBytes } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
const target = new URL('../同步口令.txt', import.meta.url);
if (existsSync(target)) console.log('已有同步口令文件，保留原口令。');
else {
  writeFileSync(target, randomBytes(32).toString('base64url') + '\n', { flag: 'wx', mode: 0o600 });
  console.log('已生成同步口令并保存到本机；内容未输出。');
}

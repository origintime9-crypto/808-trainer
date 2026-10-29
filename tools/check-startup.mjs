import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const html=await readFile('dist/index.html','utf8');
const files=[...html.matchAll(/(?:src|href)="\.\/(assets\/[^"\n]+\.(?:js|css))"/g)].map(m=>m[1]);
const manifest=JSON.parse(await readFile('dist/.vite/manifest.json','utf8'));
const entry=Object.entries(manifest).find(([,v])=>v.isEntry)?.[0];
assert(entry,'未找到构建入口');
const seen=new Set();
function visit(key){if(seen.has(key))return;seen.add(key);for(const next of manifest[key].imports??[])visit(next);}
visit(entry);
const initial=[...seen].map(key=>manifest[key].file);
assert(!initial.some(file=>/(?:katex|Markdown|ProblemPage|ReviewPage|SettingsPage|SignalLab|TransformSheet)-/.test(file)),'题库详情或公式/辅助功能进入首屏静态依赖');
let bytes=0,gzipBytes=0;
for(const file of files){const data=await readFile('dist/'+file);bytes+=data.length;gzipBytes+=gzipSync(data).length;}
const baseline={revision:'a6011e9',modulepreloads:10,bytes:1407789,gzipBytes:486342};
const current={modulepreloads:html.match(/rel="modulepreload"/g)?.length??0,bytes,gzipBytes,files};
assert(current.modulepreloads<baseline.modulepreloads,'入口预加载未减少');
assert(current.bytes<baseline.bytes*.65&&current.gzipBytes<baseline.gzipBytes*.5,'首屏文件预算超出本次约定');
const report={baseline,current,rawReduction:1-bytes/baseline.bytes,gzipReduction:1-gzipBytes/baseline.gzipBytes,formulaAndDetailDeferred:true};
await mkdir('work',{recursive:true});await writeFile('work/performance-after.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));

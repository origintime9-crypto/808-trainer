export interface InkPoint { x:number; y:number; pressure:number }
export interface InkStroke { points:InkPoint[]; erase:boolean }
export const INK_LIMIT = 100_000;
let database:Promise<IDBDatabase>|undefined;
function db() {
  return database ??= new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open('trainer808.scratch.v1',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('boards');
    request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();database=undefined;};resolve(request.result);};
    request.onerror=()=>{database=undefined;reject(request.error);};
    request.onblocked=()=>{database=undefined;reject(new Error('草稿存储被其他标签页占用'));};
  });
}
export function readInk(value:unknown):InkStroke[] {
  if(value===undefined)return [];
  if(!Array.isArray(value)||value.length>2000)throw new Error('草稿格式无效');
  let count=0;
  for(const s of value) {
    if(!s||typeof s.erase!=='boolean'||!Array.isArray(s.points)||!s.points.length)throw new Error('草稿格式无效');
    count+=s.points.length;
    if(count>INK_LIMIT||!s.points.every((p:InkPoint)=>p&&[p.x,p.y,p.pressure].every(v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1)))throw new Error('草稿超出范围');
  }
  return value as InkStroke[];
}
export async function loadInk(key:string):Promise<InkStroke[]> {
  const database=await db();
  return new Promise((resolve,reject)=>{
    const request=database.transaction('boards').objectStore('boards').get(key);
    request.onsuccess=()=>{try{resolve(readInk(request.result));}catch(e){reject(e);}};
    request.onerror=()=>reject(request.error);
  });
}
export async function saveInk(key:string,strokes:InkStroke[]) {
  readInk(strokes);
  const database=await db();
  return new Promise<void>((resolve,reject)=>{
    const tx=database.transaction('boards','readwrite');
    if(strokes.length)tx.objectStore('boards').put(strokes,key);else tx.objectStore('boards').delete(key);
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
}

import {test,expect,type BrowserContext,type Page} from '@playwright/test';
import {problemById} from '../../src/content';
import {compareDemand,reference808} from '../../src/content/difficulty808';
import {target808Units} from '../../src/content/target808';
import type {AttemptEvent} from '../../src/types';
const NOW=new Date('2026-10-08T10:00:00+08:00').getTime(),DAY=86400000;
const EVENT='trainer808.events.v1',SETTINGS='trainer808.settings.v1';
const attempt=(id:string,problemId:string,grade:0|3,t=NOW):AttemptEvent=>({id,problemId,kind:'attempt',grade,t,sec:300,tags:[]});
async function prepare(ctx:BrowserContext,events:AttemptEvent[]){
 await ctx.route('**/api/health',r=>r.fulfill({json:{ok:true,ai:false,sync:false,model:''}}));
 await ctx.addInitScript(({events,EVENT,SETTINGS})=>{
  localStorage.setItem(EVENT,JSON.stringify(events));
  localStorage.setItem(SETTINGS,JSON.stringify({examDate:'2026-12-20',newCardsPerDay:20,newProblemsPerDay:12,syncKey:'',aiEnabled:false}));
 },{events,EVENT,SETTINGS});
}
function observe(page:Page){
 const errors:string[]=[],writes:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.method()==='POST'&&/\/api\//.test(r.url()))writes.push(r.url());});
 return {errors,writes};
}
async function mobile(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(376);}
test('808难度筛选和模拟预览约束实际题目，375px不撑宽',async({page,context})=>{
 await prepare(context,[]);const proof=observe(page);
 await page.clock.install({time:new Date(NOW)});await page.setViewportSize({width:375,height:812});
 await page.goto('./#/readiness');
 const evidence=page.locator('[data-reference-808]');
 await expect(evidence).toContainText('已用相近题验证 0 个');
 await expect(evidence).toContainText('不能当作考试分数预测');
 await evidence.getByRole('link',{name:'练贴近808的题 →',exact:true}).click();
 await expect(page.getByLabel('808参考难度')).toHaveValue('near');
 const links=await page.locator('main ul.rows a').evaluateAll(rows=>rows.map(a=>a.getAttribute('href')!.split('/').at(-1)!));
 expect(links.length).toBeGreaterThan(17);
 expect(links.every(id=>reference808(id).category==='near')).toBe(true);
 await mobile(page);
 await page.goto('./#/mock');
 for(const name of ['A','B','C']){
  await page.getByRole('button',{name:'选择精选模拟卷 '+name,exact:true}).click();
  await expect(page.locator('.mock-preview>li')).toHaveCount(17);
  await expect(page.locator('main')).toContainText('综合程度与作答量接近');
 }
 await expect(page.locator('.mock-preview>li').first()).toContainText('参考用时');
 await page.getByRole('button',{name:'保存并开始模拟卷',exact:true}).click();
 const start=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)??'[]').find((e:{kind:string,action?:string})=>e.kind==='exam'&&e.action==='start'),EVENT);
 expect(start.items).toHaveLength(17);
 for(const i of start.items)if(i.match!=='original')expect(compareDemand(problemById.get(i.referenceId)!,problemById.get(i.problemId)!).comparable).toBe(true);
 await mobile(page);expect(proof.errors).toEqual([]);expect(proof.writes).toEqual([]);
});
test('真实日内改分不增加首次全对，次日复测更新一次且排除未来记录',async({browser})=>{
 const events=[attempt('first','zt2026-1-1',0),attempt('correction','zt2026-1-1',3,NOW+1000),attempt('future','zt2026-1-2',3,NOW+2*DAY)];
 for(const shift of [0,DAY]){
  const ctx=await browser.newContext({viewport:{width:375,height:812},timezoneId:'Asia/Shanghai'});
  try{
   await prepare(ctx,events);const page=await ctx.newPage(),proof=observe(page);
   await page.clock.install({time:new Date(NOW+shift+2000)});
   await page.goto('./#/readiness');
   const evidence=page.locator('[data-reference-808]');
   await expect(evidence).toContainText('已用相近题验证 1 个');
   await expect(evidence).toContainText('首次评分全对 0 个');
   await page.goto('./#/p/zt2026-1-1');
   await page.getByRole('button',{name:'我做完了，看答案',exact:true}).click();
   await page.getByRole('button',{name:'全对',exact:true}).click();
   await page.getByRole('button',{name:'记录',exact:true}).click();
   await page.goto('./#/readiness');
   await expect(evidence).toContainText('已用相近题验证 1 个');
   await expect(evidence).toContainText('首次评分全对 '+(shift?1:0)+' 个');
   await mobile(page);expect(proof.errors).toEqual([]);expect(proof.writes).toEqual([]);
  }finally{await ctx.close();}
 }
});
test('原卷17题正确归属自己的题位，难度验证守恒并显示参考限制',async({page,context})=>{
 await prepare(context,target808Units.map((p,i)=>attempt('all-'+i,p.id,3)));
 const proof=observe(page);
 await page.clock.install({time:new Date(NOW)});await page.setViewportSize({width:375,height:812});
 await page.goto('./#/readiness');
 const evidence=page.locator('[data-reference-808]');
 await expect(evidence).toContainText('已用相近题验证 17 个');
 await expect(evidence).toContainText('首次评分全对 17 个');
 await expect(evidence).toContainText('参考用时内全对 17 个');
 await expect(evidence).toContainText('题位验证覆盖 100%');
 await evidence.getByText('查看尚未验证的题位',{exact:true}).click();
 await expect(evidence).toContainText('所有题位都有相近题记录');
 await expect(evidence.locator('.rows a')).toHaveCount(0);
 await expect(evidence).toContainText('日内改分不增加验证');
 await mobile(page);expect(proof.errors).toEqual([]);expect(proof.writes).toEqual([]);
});

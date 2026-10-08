import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { problems } from '../../src/content';
import { fits808 } from '../../src/content/target808';
import type { AttemptEvent } from '../../src/types';

const NOW=new Date('2026-10-08T10:00:00+08:00').getTime();
const EVENT='trainer808.events.v1', SETTINGS='trainer808.settings.v1';
const single=problems.filter(p=>p.kps.length===1&&p.kps[0]==='1.8'&&fits808(p.id)).slice(0,4);
const events=(grade:0|3):AttemptEvent[]=>single.map((p,i)=>({kind:'attempt',id:'browser808-'+i,problemId:p.id,grade,t:NOW,tags:[],sec:300}));

async function prepare(ctx:BrowserContext, ev:AttemptEvent[]) {
  await ctx.route('**/api/health',r=>r.fulfill({json:{ok:true,ai:false,sync:false,model:''}}));
  await ctx.addInitScript(({ev,EVENT,SETTINGS})=>{
    localStorage.setItem(EVENT,JSON.stringify(ev));
    localStorage.setItem(SETTINGS,JSON.stringify({examDate:'2026-12-20',newCardsPerDay:20,newProblemsPerDay:12,syncKey:'',aiEnabled:false}));
  },{ev,EVENT,SETTINGS});
}
function observe(page:Page) {
  const errors:string[]=[], writes:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.method()==='POST'&&/\/api\//.test(r.url()))writes.push(r.url());});
  return {errors,writes};
}
const point=(p:Page)=>p.locator('.knowledge-node').filter({has:p.getByRole('link',{name:/^1\.8 /})});
async function fits(page:Page) {
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
}
async function recommendations(page:Page) {
  await page.goto('./#/today');
  const section=page.locator('section.card').filter({has:page.getByRole('heading',{name:'推荐新题',exact:true})});
  return section.locator('.rows a').evaluateAll(links=>links.map(a=>(a.getAttribute('href')??'').split('/').pop()!));
}

test('808水平未测不冒充50%，补强测评保留17题150分并保存固定卷面',async({page,context})=>{
  await prepare(context,[]);const proof=observe(page);
  await page.clock.install({time:new Date(NOW)});
  await page.setViewportSize({width:375,height:812});
  await page.goto('./#/readiness');
  await expect(page.getByRole('heading',{name:'我的 808 适配水平'})).toBeVisible();
  await expect(page.locator('.readiness-stats>div>b')).toHaveText(['0%','0%','待测']);
  await expect(page.locator('.card-head .badge').first()).toHaveText('仍需补测');
  await fits(page);
  await mkdir('work/screenshots',{recursive:true});
  await page.screenshot({path:'work/screenshots/adaptive808-readiness-mobile.png'});
  await page.getByRole('link',{name:'做一套 808 补强测评卷',exact:true}).click();
  await expect(page.getByLabel('组卷目标')).toHaveValue('adaptive');
  await expect(page.locator('.mock-preview>li')).toHaveCount(17);
  await expect(page.locator('main')).toContainText('150分');
  await page.getByLabel('真题模板').selectOption('zt2017');
  await expect(page.locator('.mock-preview>li')).toHaveCount(30);
  await page.getByLabel('真题模板').selectOption('zt2026');
  await page.getByRole('button',{name:'保存并开始模拟卷',exact:true}).click();
  const start=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)??'[]').find((e:{kind:string;action?:string})=>e.kind==='exam'&&e.action==='start'),EVENT);
  expect(start.title).toContain('808补强测评');expect(start.items).toHaveLength(17);
  expect(start.items.reduce((sum:number,i:{score:number})=>sum+i.score,0)).toBe(150);
  expect(new Set(start.items.map((i:{problemId:string})=>i.problemId)).size).toBe(17);
  await page.getByRole('button',{name:/我做完了，看答案|不确定，直接看答案/}).click();
  await page.getByRole('button',{name:'全对',exact:true}).click();
  await page.getByRole('button',{name:'记录',exact:true}).click();
  const href=page.url();
  await page.goto('./#/readiness');await page.goto(href);
  await expect(page.getByRole('button',{name:'重新评分',exact:true})).toBeVisible();
  const stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)??'[]').find((e:{kind:string;action?:string})=>e.kind==='exam'&&e.action==='start'),EVENT);
  expect(stored.items).toEqual(start.items);
  await fits(page);expect(proof.errors).toEqual([]);expect(proof.writes).toEqual([]);
});

test('真实弱项比熟练项多推题，重新作答即时改变知识点掌握估计',async({browser})=>{
  const weak=await browser.newContext({viewport:{width:375,height:812},timezoneId:'Asia/Shanghai'});
  const strong=await browser.newContext({viewport:{width:375,height:812},timezoneId:'Asia/Shanghai'});
  try {
    await prepare(weak,events(0));await prepare(strong,events(3));
    const w=await weak.newPage(),s=await strong.newPage(),wp=observe(w),sp=observe(s);
    await w.clock.install({time:new Date(NOW)});await s.clock.install({time:new Date(NOW)});
    await w.goto('./#/knowledge');await s.goto('./#/knowledge');
    await expect(point(w)).toContainText('掌握度 10%');await expect(point(w)).toContainText('需补强');
    await expect(point(s)).toContainText('掌握度 90%');await expect(point(s)).toContainText('较稳固');
    await expect(point(s)).toContainText('4 道不同题验证');
    const weakIds=await recommendations(w),strongIds=await recommendations(s);
    const count=(ids:string[])=>ids.filter(id=>problems.find(p=>p.id===id)?.kps.includes('1.8')).length;
    expect(count(weakIds)).toBeGreaterThanOrEqual(2);expect(count(weakIds)).toBeGreaterThan(count(strongIds));
    expect(new Set(weakIds).size).toBe(weakIds.length);expect(weakIds.every(fits808)).toBe(true);
    await w.goto('./#/p/'+single[0].id);
    await w.getByRole('button',{name:/我做完了，看答案|不确定，直接看答案/}).click();
    await w.getByRole('button',{name:'全对',exact:true}).click();
    await w.getByRole('button',{name:'记录',exact:true}).click();
    await w.goto('./#/knowledge');await expect(point(w)).toContainText('掌握度 30%');
    await expect(point(w)).toContainText('4 道不同题验证');
    await point(w).screenshot({path:'work/screenshots/adaptive808-updated-point-mobile.png'});
    await w.goto('./#/readiness');await expect(w.locator('.readiness-stats>div>b').nth(2)).not.toHaveText('待测');
    await expect(w.locator('.card-head .badge').first()).toHaveText('仍需补测');
    await fits(w);await fits(s);expect(wp.errors).toEqual([]);expect(sp.errors).toEqual([]);
    expect(wp.writes).toEqual([]);expect(sp.writes).toEqual([]);
  } finally {await weak.close();await strong.close();}
});

test('已过关题长期未复习重新进入到期队列，并显示808遗忘风险',async({page,context})=>{
  await prepare(context,events(3));const proof=observe(page);
  await page.clock.install({time:new Date(NOW+90*86_400_000)});
  await page.setViewportSize({width:375,height:812});
  await page.goto('./#/knowledge');
  await expect(point(page)).toContainText('需复习');
  await page.goto('./#/today');
  const due=page.locator('section.card').filter({has:page.getByRole('heading',{name:/^到期重做/})});
  for(const p of single)await expect(due.locator('a[href="#/p/'+p.id+'"]')).toBeVisible();
  await page.goto('./#/readiness');await fits(page);
  await page.screenshot({path:'work/screenshots/adaptive808-forgetting-mobile.png'});
  expect(proof.errors).toEqual([]);expect(proof.writes).toEqual([]);
});

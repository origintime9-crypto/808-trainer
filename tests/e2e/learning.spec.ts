import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { problems } from '../../src/content';
import { fits808 } from '../../src/content/target808';
import type { AttemptEvent } from '../../src/types';
const NOW = new Date('2026-10-08T10:00:00+08:00').getTime();
const EVENT = 'trainer808.events.v1', SETTINGS = 'trainer808.settings.v1';
const single = problems.filter(p => p.kps.length===1 && p.kps[0]==='1.8' && fits808(p.id)).slice(0,4);
async function prepare(ctx:BrowserContext, ev:AttemptEvent[]) {
  await ctx.route('**/api/health',r => r.fulfill({json:{ok:true,ai:false,sync:false,model:''}}));
  await ctx.addInitScript(({ev,EVENT,SETTINGS}) => {
    if (!localStorage.getItem(EVENT)) localStorage.setItem(EVENT,JSON.stringify(ev));
    if (!localStorage.getItem(SETTINGS)) localStorage.setItem(SETTINGS,JSON.stringify({examDate:'2026-12-20',newCardsPerDay:20,newProblemsPerDay:12,syncKey:'',aiEnabled:false}));
  },{ev,EVENT,SETTINGS});
}
function observe(page:Page) {
  const errors:string[]=[], writes:string[]=[];
  page.on('pageerror',e => errors.push(e.message));
  page.on('request',r => { if(r.method()==='POST' && /\/api\//.test(r.url())) writes.push(r.url()); });
  return {errors,writes};
}
const entry = (page:Page) => page.locator('.learning-plan[data-learning-kp="1.8"]');
async function mobile(page:Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1)).toBe(true);
}
test('复习建议跟随真实评分即时更新，展开步骤与重新进入后结果保持',async({page,context}) => {
  const ev:AttemptEvent={kind:'attempt',id:'learning-browser-before',problemId:single[0].id,t:NOW-60_000,grade:0,tags:['概念不清'],sec:300};
  await prepare(context,[ev]); const proof=observe(page);
  await page.clock.install({time:new Date(NOW)}); await page.setViewportSize({width:375,height:812});
  await page.goto('./#/readiness');
  await expect(entry(page)).toHaveAttribute('data-method','explanation');
  await entry(page).getByText('怎么练',{exact:true}).click();
  await expect(entry(page)).toContainText('一个不成立的反例');
  await mobile(page); await mkdir('work/screenshots',{recursive:true});
  await entry(page).screenshot({path:'work/screenshots/learning808-method-mobile.png'});
  await page.goto('./#/p/'+single[0].id);
  await page.getByRole('button',{name:/我做完了，看答案|不确定，直接看答案/}).click();
  await page.getByRole('button',{name:'全对',exact:true}).click();
  await page.getByRole('button',{name:'记录',exact:true}).click();
  await page.goto('./#/readiness');
  await expect(entry(page)).toHaveAttribute('data-method','verification');
  await expect(entry(page)).toContainText('换题');
  await page.reload(); await expect(entry(page)).toHaveAttribute('data-method','verification');
  await mobile(page); expect(proof.errors).toEqual([]); expect(proof.writes).toEqual([]);
});
test('单日多题继续延迟验证，跨日换题转混合，长期未练转回忆',async({browser}) => {
  for (const [mode,expected] of [['same-day','verification'],['spaced','interleaving'],['old','retrieval']] as const) {
    const ctx=await browser.newContext({viewport:{width:375,height:812},timezoneId:'Asia/Shanghai'});
    try {
      const ev:AttemptEvent[]=single.slice(0,mode==='old'?4:3).map((p,i) => ({
        kind:'attempt',id:'learning-browser-'+mode+'-'+i,problemId:p.id,grade:3,tags:[],sec:300,
        t:mode==='old'?NOW-90*86_400_000:mode==='spaced'?NOW-(2-i)*86_400_000:NOW-60_000,
      }));
      await prepare(ctx,ev);const page=await ctx.newPage(),proof=observe(page);
      await page.clock.install({time:new Date(NOW)});await page.goto('./#/readiness');
      await expect(entry(page)).toHaveAttribute('data-method',expected);
      await mobile(page);expect(proof.errors).toEqual([]);expect(proof.writes).toEqual([]);
    } finally {await ctx.close();}
  }
});

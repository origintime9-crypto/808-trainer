// 独立浏览器检查新录入的课后题图、答案和 375 像素布局。
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
await context.route('**/api/health', route => route.fulfill({ json: { ok: true, ai: false, sync: false, model: '' } }));
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await mkdir('work/screenshots', { recursive: true });
try {
  for (const [id, name] of [
    ['hw1-1-2-6', 'homework-sine'],
    ['hw3-3-20-5', 'homework-even'],
    ['hw4-4-22-3', 'homework-feedback'],
    ['hw6-6-4-2d', 'homework-discrete'],
    ['hw7-7-1-1', 'homework-z-combined'],
    ['hw7-7-1-10', 'homework-z-finite'],
    ['hw7-7-1-11', 'homework-z-phase'],
    ['hw7-7-14-2', 'homework-z-roc'],
    ['tk-key-16-2', 'key-sampling-spectrum'],
    ['tk-key-17-4', 'key-discrete-diagram'],
  ]) {
    await page.goto('http://127.0.0.1:8080/#/p/'+id);
    await page.getByRole('button', { name: '我做完了，看答案', exact: true }).click();
    await page.locator('section.answer').waitFor();
    await page.locator('img').evaluateAll(async imgs => { await Promise.all(imgs.map(img => img.decode().catch(() => {}))); });
    const bad = await page.evaluate(() => ({
      broken: [...document.querySelectorAll('img')].some(i => !i.complete || i.naturalWidth === 0),
      math: document.querySelectorAll('.katex-error').length,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    }));
    if (bad.broken || bad.math || bad.overflow) throw new Error(id+': '+JSON.stringify(bad));
    await page.screenshot({ path: 'work/screenshots/'+name+'.png', fullPage: true });
    console.log('通过 '+id);
  }
  await page.setViewportSize({ width: 690, height: 455 });
  for (const suffix of ['a1-1', 'a1-10', 'a1-11', 'a14']) {
    await page.goto('http://127.0.0.1:8080/figures/hw7/'+suffix+'.svg');
    await page.screenshot({ path: 'work/screenshots/zplot-'+suffix+'.png' });
  }
  if (errors.length) throw new Error(errors.join('\n'));
} finally { await browser.close(); }

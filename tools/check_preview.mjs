// 在隔离浏览器中检查真正的本机预览，不改用户浏览器的进度。
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
const report = JSON.parse(await readFile('work/content-report.json', 'utf8'));
const cardCount = report.knowledgeCards + report.patternCards;
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Shanghai' });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://127.0.0.1:8080/#/today');
  await page.waitForSelector('.today .hero');
  assert.equal(await page.title(), '808 信号与系统刷题');
  assert.equal(await page.locator('#root').getAttribute('data-app'), '808-trainer');
  await page.getByRole('link', { name: '设置', exact: true }).click();
  await page.getByRole('heading', { name: '题库概况' }).waitFor();
  assert.ok((await page.locator('main').innerText()).includes('题目 ' + report.problems + ' 道'));
  assert.ok((await page.locator('main').innerText()).includes('卡片 ' + cardCount + ' 张'));
  assert.match(await page.getByRole('status').innerText(), /本地模式/);
  await page.getByRole('link', { name: '今日', exact: true }).click();
  await page.waitForSelector('.today .hero');
  await mkdir('work/screenshots', { recursive: true });
  await page.screenshot({ path: 'work/screenshots/live-preview.png' });
  assert.deepEqual(errors, []);
  console.log('本机真实预览通过：8080 端口、' + report.problems + ' 题、' + cardCount + ' 卡片、本地模式、无页面错误。');
} finally { await browser.close(); }

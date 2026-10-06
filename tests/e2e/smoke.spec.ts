import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { problems } from '../../src/content';

const KEY = 'trainer808.events.v1';
const SET = 'trainer808.settings.v1';
const base = 'http://127.0.0.1:18080';
const health = { ok: true, ai: false, sync: false, model: '' };
const records = (page: Page) => page.evaluate(k => JSON.parse(localStorage.getItem(k) ?? '[]'), KEY);
const mockHealth = (context: BrowserContext, data = health) => context.route('**/api/health', route => route.fulfill({ json: data }));
const chooseGrade = async (page: Page, label: string) => {
  await page.getByRole('button', { name: '我做完了，看答案', exact: true }).click();
  await page.getByRole('button', { name: label, exact: true }).click();
  await page.getByRole('button', { name: '记录', exact: true }).click();
};

test('2026 十题 → 错题与薄弱点 → 三张卡片 → 导出清空导入', async ({ page, context }) => {
  await mockHealth(context);
  await page.goto('/#/p/zt2026-10');
  await expect(page).toHaveTitle('808 信号与系统刷题');
  await page.getByRole('button', { name: '我做完了，看答案' }).click();
  await page.getByRole('button', { name: '部分对', exact: true }).click();
  await page.locator('label.tag').filter({ hasText: '计算失误' }).click();
  await page.getByRole('button', { name: '记录', exact: true }).click();
  await expect(page.locator('.result')).toContainText('明天');
  await page.goto('/#/mistakes');
  await expect(page.locator('.rows')).toContainText('十');
  await expect(page.locator('.rows')).toContainText('计算失误');
  await page.goto('/#/analysis');
  await expect(page.locator('tr').filter({ hasText: '4.6 系统函数' })).toContainText('42%');
  await page.goto('/#/review');
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: '显示答案', exact: true }).click();
    await page.getByRole('button', { name: '记得', exact: true }).click();
  }
  expect((await records(page)).filter((e: { kind: string }) => e.kind === 'review')).toHaveLength(3);
  await page.goto('/#/settings');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出进度', exact: true }).click();
  const file = await (await download).path();
  expect(file).toBeTruthy();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: '清空本机记录', exact: true }).click();
  expect(await records(page)).toHaveLength(0);
  await page.locator('input[type=file]').setInputFiles(file!);
  await expect(page.getByText('导入完成，新增 4 条记录（重复的已自动跳过）。')).toBeVisible();
  expect(await records(page)).toHaveLength(4);
  await page.locator('input[type=file]').setInputFiles(file!);
  await expect(page.getByText('导入完成，新增 0 条记录（重复的已自动跳过）。')).toBeVisible();
  await page.goto('/#/mistakes');
  await expect(page.locator('.rows')).toContainText('计算失误');
});

test('选择题自动预填，连续两次全对移出错题本', async ({ page, context }) => {
  await mockHealth(context);
  await page.goto('/#/p/zt2023-2-1');
  await page.locator('.option').nth(0).click();
  await expect(page.locator('.grade.g0')).toHaveClass(/on/);
  await page.getByRole('button', { name: '记录', exact: true }).click();
  for (let i = 0; i < 2; i++) {
    await page.reload();
    await page.locator('.option').nth(2).click();
    await expect(page.locator('.grade.g3')).toHaveClass(/on/);
    await page.getByRole('button', { name: '记录', exact: true }).click();
    await expect(page.locator('.result')).toContainText(i === 0 ? '再全对一次' : '连续两次全对');
  }
  await page.goto('/#/mistakes');
  await expect(page.getByText('错题本是空的。')).toBeVisible();
  await expect(page.getByText(/已移出 1 题/)).toBeVisible();
});

test('整卷按题序，本次成绩不包含历史作答', async ({ page, context }) => {
  await mockHealth(context);
  await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify([{ kind: 'attempt', problemId: 'zt2026-10', id: 'history-before-exam', t: 1760000000000, grade: 3, tags: [], sec: 40 }])), { key: KEY });
  await page.goto('/#/exam/zt2026');
  await page.getByRole('button', { name: '开始整卷练习' }).click();
  await expect(page.getByText('已做 0 / 17 个单元 · 本次估分 0')).toBeVisible();
  await expect(page.locator('.meta .source')).toContainText('一(1)');
  await chooseGrade(page, '全对');
  await expect(page.getByText(/已做 1 \/ 17 个单元/)).toBeVisible();
  await page.getByRole('button', { name: '结束并估分' }).click();
  await expect(page.getByRole('heading', { name: '本次整卷结果' })).toBeVisible();
  await expect(page.getByText('自评估分')).toContainText('5 / 150');
});

test('照片压缩与 AI 预填，确认前不记分，保存不含照片或口令', async ({ page, context }) => {
  await mockHealth(context, { ok: true, ai: true, sync: false, model: 'vision-mock' });
  await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({ examDate: '2026-12-20', newCardsPerDay: 20, newProblemsPerDay: 3, syncKey: 'test-sync-only', aiEnabled: true })), { key: SET });
  let sent = false;
  await context.route('**/api/grade', async route => {
    const body = route.request().postDataJSON();
    expect(route.request().headers().authorization).toBe('Bearer test-sync-only');
    expect(body.model).toBe('vision-mock');
    const photos = body.messages[1].content.filter((c: { type: string }) => c.type === 'image_url');
    expect(photos).toHaveLength(3);
    expect(photos.every((c: { image_url: { url: string } }) => c.image_url.url.startsWith('data:image/jpeg;base64,'))).toBeTruthy();
    sent = true;
    await route.fulfill({ json: { choices: [{ message: { content: '```json\n' + JSON.stringify({ transcript: '学生计算过程', steps: [{ step: '代入极点', ok: true, comment: '方法正确' }], grade: 1, score: 4.5, tags: ['计算失误'], feedback: '请检查幅度系数。' }) + '\n```' } }] } });
  });
  await page.goto('/#/p/zt2026-10');
  await page.getByLabel('作答照片').setInputFiles(Array(3).fill(resolve('tests/fixtures/blank.png')));
  await expect(page.locator('.photo-previews img')).toHaveCount(3);
  const size = await page.locator('.photo-previews img').first().evaluate((el: HTMLImageElement) => [el.naturalWidth, el.naturalHeight]);
  expect(size).toEqual([1600, 600]);
  expect(sent).toBeFalsy();
  await page.getByRole('button', { name: '开始 AI 批改' }).click();
  await expect(page.getByText('AI 建议：部分对')).toBeVisible();
  await expect(page.locator('.grade.g1')).toHaveClass(/on/);
  await expect(page.locator('label.tag').filter({ hasText: '计算失误' })).toHaveClass(/on/);
  expect(await records(page)).toHaveLength(0);
  await expect(page.locator('.photo-previews img')).toHaveCount(0);
  await page.getByRole('button', { name: '记录', exact: true }).click();
  const saved = await records(page);
  expect(saved).toHaveLength(1);
  expect(saved[0].ai.model).toBe('vision-mock');
  const text = JSON.stringify(saved);
  expect(text).not.toContain('data:image');
  expect(text).not.toContain('test-sync-only');
});

test('AI 非 JSON 返回可读原文并支持手动作答', async ({ page, context }) => {
  await mockHealth(context, { ok: true, ai: true, sync: false, model: 'vision-mock' });
  await page.addInitScript(({ key }) => localStorage.setItem(key, JSON.stringify({ syncKey: 'test-sync-only', aiEnabled: true })), { key: SET });
  await context.route('**/api/grade', route => route.fulfill({ json: { choices: [{ message: { content: '字迹看不清，请重新拍摄。' } }] } }));
  await page.goto('/#/p/zt2026-10');
  await page.getByLabel('作答照片').setInputFiles(resolve('tests/fixtures/blank.png'));
  await page.getByRole('button', { name: '开始 AI 批改' }).click();
  await expect(page.locator('.ai-raw')).toContainText('字迹看不清');
  expect(await records(page)).toHaveLength(0);
  await chooseGrade(page, '不会');
  expect(await records(page)).toHaveLength(1);
});

test('两台设备同步合并，失败保留本机记录，重试不重复', async ({ browser }) => {
  const cloud: { id: string; kind: string; [key: string]: unknown }[] = [];
  let fail = false;
  const a = await browser.newContext({ timezoneId: 'Asia/Shanghai' });
  const b = await browser.newContext({ timezoneId: 'Asia/Shanghai' });
  for (const context of [a, b]) {
    await mockHealth(context, { ...health, sync: true });
    await context.addInitScript(({ key }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ syncKey: 'test-sync-only' })); }, { key: SET });
    await context.route('**/api/sync', async route => {
      if (fail) { await route.fulfill({ status: 503, json: { error: '测试断网' } }); return; }
      const input = route.request().postDataJSON();
      for (const e of input.events) if (!cloud.some(x => x.id === e.id)) cloud.push(e);
      await route.fulfill({ json: { seq: cloud.length, events: cloud.slice(input.since), accepted: input.events.map((e: { id: string }) => e.id), hasMore: false } });
    });
  }
  try {
    const pa = await a.newPage(), pb = await b.newPage();
    await pa.goto(`${base}/#/p/zt2026-10`);
    await chooseGrade(pa, '部分对');
    fail = true;
    await pa.goto(`${base}/#/settings`);
    await pa.getByRole('button', { name: '立即同步' }).click();
    await expect(pa.getByRole('status')).toContainText('本机进度仍已保存');
    expect(await records(pa)).toHaveLength(1);
    fail = false;
    await pa.getByRole('button', { name: '立即同步' }).click();
    await expect(pa.getByRole('status')).toContainText('两端进度已同步');
    await pb.goto(`${base}/#/mistakes`);
    await expect(pb.locator('.rows')).toContainText('十');
    expect(await records(pb)).toHaveLength(1);
    await pb.goto(`${base}/#/p/zt2026-10`);
    await pb.getByPlaceholder('记下这道题的关键点、易错点……（离开输入框自动保存）').fill('手机补充：检查初值');
    await pb.getByRole('heading', { name: '我的笔记' }).click();
    await pb.goto(`${base}/#/settings`);
    await pb.getByRole('button', { name: '立即同步' }).click();
    await expect(pb.getByRole('status')).toContainText('两端进度已同步');
    await pa.getByRole('button', { name: '立即同步' }).click();
    await expect.poll(async () => (await records(pa)).length).toBe(2);
    await pa.goto(`${base}/#/p/zt2026-10`);
    await expect(pa.locator('textarea.note')).toHaveValue('手机补充：检查初值');
    expect(cloud).toHaveLength(2);
  } finally { await a.close(); await b.close(); }
});

test('损坏记录不会被新作答覆盖，可下载原始数据', async ({ page, context }) => {
  await mockHealth(context);
  await page.addInitScript(({ key }) => localStorage.setItem(key, '{broken-old-log'), { key: KEY });
  await page.goto('/#/p/zt2026-10');
  await chooseGrade(page, '全对');
  await expect(page.getByRole('alert').first()).toContainText('无法读取');
  expect(await page.evaluate(k => localStorage.getItem(k), KEY)).toBe('{broken-old-log');
  await page.goto('/#/settings');
  await expect(page.getByRole('button', { name: '导出进度', exact: true })).toBeDisabled();
  const file = page.waitForEvent('download');
  await page.getByRole('button', { name: '下载原始记录' }).click();
  expect((await file).suggestedFilename()).toBe('808原始记录_待恢复.json');
});

test('375×812 手机布局：页面、长公式和原题图不撑宽', async ({ page, context }) => {
  test.setTimeout(90_000);
  await mockHealth(context);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 375, height: 812 });
  await mkdir('work/screenshots', { recursive: true });
  for (const route of ['today', 'practice', 'review', 'mistakes', 'analysis', 'settings']) {
    await page.goto(`/#/${route}`);
    await expect(page.locator('main')).toBeVisible();
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, route).toBeLessThanOrEqual(376);
    if (['today', 'analysis', 'practice'].includes(route)) await page.screenshot({ path: `work/screenshots/mobile-${route}.png`, fullPage: route !== 'practice' });
  }
  const ftProperty = problems.find(p => p.sources.some(s => s.paper === 'zt2018' && s.no === '三(3)-2'))!.id;
  const long = ['zt2026-10', 'zt2025-1-6', 'zt2024-1-8', ftProperty, 'zt2017-5-1', 'zt2016-5-1', 'zt2023-4-3'];
  const withFigures = problems.filter(p => p.figures?.length || p.answer.includes('](figures/')).map(p => p.id);
  for (const id of [...new Set([...long, ...withFigures])]) {
    await page.goto(`/#/p/${id}`);
    await page.getByRole('button', { name: '我做完了，看答案', exact: true }).click();
    await expect(page.locator('.answer')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth), id).toBeLessThanOrEqual(376);
    await expect(page.locator('.katex-error')).toHaveCount(0);
    for (const img of await page.locator('img.figure, .answer img').all()) await expect.poll(() => img.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBeTruthy();
    if (id === 'tk-review-24-2') {
      const opened = page.waitForEvent('popup');
      await page.getByRole('link', { name: '打开大图：更正后的零极点图' }).click();
      const popup = await opened;
      await popup.waitForLoadState();
      expect(popup.url()).toContain('/figures/tk-review/a24.svg');
      await popup.close();
    }
    if (['tk-review-21-3', 'tk-review-24-2', 'tk-total-2-2'].includes(id)) await page.screenshot({ path: 'work/screenshots/mobile-' + id + '.png', fullPage: true });
    if (id === 'zt2026-10') await page.screenshot({ path: 'work/screenshots/mobile-answer.png', fullPage: true });
    if (id === 'zt2017-5-1') await page.screenshot({ path: 'work/screenshots/mobile-diagram.png', fullPage: true });
  }
  expect(errors).toEqual([]);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/#/today');
  await page.screenshot({ path: 'work/screenshots/desktop-today.png' });
});

# 808 信号与系统刷题

已发布可使用的 [刷题网页](https://origintime9-crypto.github.io/808-trainer/)。工作目录为 `E:/claude work/808-trainer`，沿用原项目的题目、卡片和进度编号。

双击 **启动刷题.cmd**，打开 <http://127.0.0.1:8080/#/today>。**关闭本地预览.cmd** 可停止这个项目的服务。本机预览供电脑使用；手机跨设备访问需要完成云端部署。

## 可以开始使用

- 七套真题：2016、2017、2018、2023、2024、2025、2026；157 道合并后的题目，对应 175 个来源作答单元。
- 两份复习题库：26+22 道原题拆成 58 个单元；老师圈出的 31 道课后原题拆成 155 个单元；8 张手写重点图新增 29 个来源单元；课程题库 01、02 新增 46 个来源单元。合计 427 题、463 个来源。
- 100 张知识卡、26 张题型卡，覆盖系统性质、卷积、FT/LT/ZT、抽样、框图和稳定性；新增状态方程扩展题型。
- 单题计时、自评、自动判断选择题、笔记、同题型练习、整卷估分。
- FSRS 卡片复习和错题重做；错题连续两次全对才移出。
- 知识点和题型的掌握度、优先级与错因分布。
- 本机保存、JSON 备份及去重恢复、进度自动上传、跨设备主动获取和拍照 AI 批改面板。

可直接使用已登录的 ChatGPT 批改：在题目中点「复制批改提示词」，到 ChatGPT 粘贴并附上作答照片，再回网页确认自评和错因。这个流程不需要配置 API Key。

网页内自动拍照批改当前使用服务端模型配置。OpenAI 也提供 [Sign in with ChatGPT](https://developers.openai.com/siwc/quickstart)，允许符合条件的 Plus、Pro 用户在已接入的应用中使用订阅额度；[云端托管应用需要申请接入](https://developers.openai.com/siwc/token-sharing-open-source)。本站尚未实现这项登录授权，不能仅凭在另一个标签页登录 ChatGPT 就自动调用。AI 建议只会预填自评，点击「记录」才保存。照片不进入进度日志或备份。

## 学习与备份

建议从「今日」的到期卡片、错题和推荐新题开始；也可以在「刷题」按卷、章节、知识点、题型或状态筛选。做完在纸上的作答后显示答案，自评并选择错因。

进度属于当前浏览器和网址。更换浏览器、从本机网址转到云端网址或清理浏览器前，先在设置里导出 JSON，再在新的网址导入。导出文件不含同步口令。记录损坏时会暂停写入，可在设置中先下载原始记录，避免覆盖旧数据。

整卷成绩按自评系数 0、0.3、0.7、1 估算，只统计本次开始后的作答。回忆卷缺少分值的题只统计练习进度。2016 卷的小题分值合计 149，而卷面标注 150，程序保留题面分值并提示差异。课程题库 01、02 的综合题只给整道题分值，拆成小问后不擅自分配分数；这两套卷各自可核对的估分部分合计 80 分。

## 开发和检查

在 PowerShell 中进入项目目录：

```powershell
Set-Location -LiteralPath 'E:\claude work\808-trainer'
npm ci
npm test
npm run verify:math
npm run build
npm run test:e2e
```

`npm run dev -- --port 8081 --strictPort` 用于修改代码时的预览。普通使用运行启动文件即可。浏览器测试使用独立端口 18080，不复用其他项目的服务。

Python 复核需要 SymPy；处理原题图还需 PyMuPDF、Pillow。本机已具备这些依赖。Playwright 浏览器如果缺失，可执行 `npx playwright install chromium`。

`npm run content:report` 生成实际题库统计；`python tools/source_inventory.py` 登记指定资料目录中的相关 PDF，并定位课件术语。原始 PDF、临时扫描页、测试截图均留在 `work/`，不随网站部署。

## 本地验证后端

```powershell
npm run db:init:local
npm run local:api -- --binding SYNC_KEY=808-local-test-only --ip 127.0.0.1
```

另开 PowerShell 运行 `node tools/check_local_api.mjs`。它只访问本机地址，以测试口令验证真实 Cloudflare 本地运行时和 D1。结束服务后，用 `npx wrangler d1 execute 808-trainer --local --file work/clean-local-test.sql` 清理这次检查产生的测试行。此口令仅供测试，正式服务应另设口令。

## GitHub Pages 发布与 Cloudflare 后端

用户已确认云端设置，并选择沿用“心理史学”的 GitHub 发布方式。仓库为 [808-trainer](https://github.com/origintime9-crypto/808-trainer)，网页入口为 [GitHub Pages](https://origintime9-crypto.github.io/808-trainer/)。向 main 推送后，Actions 安装锁定依赖、检查内容与功能、独立复核数学解答，再构建和发布网页。

进度同步和 AI 代理运行在 [Cloudflare 后端](https://808-trainer.pages.dev/)。远程 D1 已建表，服务端 SYNC_KEY 已设置；真实上传、拉取、重复去重、游标和 CORS 已验证。GitHub 仓库的 Actions 变量 VITE_API_BASE_URL 指向此后端，前端构建仅包含公开的网址。

打开本机的 **同步口令.txt**，把同一口令填入电脑和手机网页的“设置 → 同步口令”，首次点击“立即同步”检查连接。之后作答和卡片复习记录自动上传，笔记停顿 1 秒或离开输入框后自动保存并上传；网页在前台时每 5 秒获取其他设备的新进度。页顶显示本机保存、待上传、离线或云端已保存。断网先保留本机记录，网络恢复或服务恢复后自动重试，无需反复点击。从本机网页迁移时，先导出原进度，再在云端网址导入。口令文件留在本机，不属于公开仓库。

AI 尚未配置真实模型。保留兼容 Chat Completions 的 AI_BASE_URL、AI_MODEL、AI_API_KEY 接口；可使用 Gemini 官方兼容地址。具体步骤见 [Gemini 接入说明](GEMINI_SETUP.md)。Key 通过 Cloudflare Secret 输入或控制台保存，配置后重新部署后端，再检查 /api/health，验证全对、计算错误、空白三种照片。兼容协议的模拟测试通过，真实 Gemini 识别和评分仍需实际 Key 与照片验收。

后端更新执行 npm run build 和 npx wrangler pages deploy dist --project-name 808-trainer --branch main。前端源码更新由 GitHub Actions 发布。电脑和手机流量的实际网络可访问性仍需用户在各自设备确认。

配置参照 [GitHub Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Cloudflare Pages 配置](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) 与 [D1 绑定](https://developers.cloudflare.com/pages/functions/bindings/)。

## 内容范围与交付记录

本机 CONTENT_COVERAGE.md 登记原题覆盖、重复题合并、勘误、存疑和后续资料批次；DELIVERY.md 记录验证与待验收事项。这些实施记录不随公开仓库发布。两份复习题、老师圈题、手写重点及 115 页考试题库中的课程编号 1、2 已录入；其余课程卷和教材其余题目仍按计划继续整理。

# 解题交互与每日训练升级验收

2026-10-29。沿用已有1171题、1466来源和131张卡片，未更换原题/卡片编号，也未修改原题答案。

## 需求与实现

| 建议 | 已实现行为 | 核对位置 |
|---|---|---|
| 首屏分包 | 首页只用调度目录；57份详情按需载入，全部非今日页面异步打开；KaTeX及样式只随公式页面加载。同组题加载后同步命中，连练不反复等待 | content/catalog、details、prepare-content，App、main |
| 公式与宏 | 块公式局部横向滚动，限制最大宽度；共用变换对、算子、卷积、冲激、阶跃、Sa宏。每次渲染复制宏字典，保留现有公式源码 | mathMacros、Markdown、styles |
| 快捷键 | Space逐级提示，1–4评级，Enter记录，S收藏，→切题；输入框、输入法组合、快捷键修饰键和模态抽屉不触发；未记录的评分不被切题丢弃 | useStudyShortcuts、ProblemPage、ReviewPage |
| 草稿 | Pointer Events鼠标/触屏/触控笔、笔压、仅笔模式防手掌误触、橡皮、撤销重做、清空、下载；IndexedDB按题目/考试隔离保存 | Scratchpad、engine/scratchpad |
| 备份与同步 | 沿用已有JSON去重导入导出、服务端鉴权与自动同步，新增独立bookmark事件。草稿只本机保存，在草稿和备份页明确说明 | bookmarks、events、SettingsPage |
| 变换对照 | 以同一性质并列CTFT/DTFT/双边LT/双边ZT，覆盖时移、频移、尺度/离散抽取、卷积、微分/差分及ROC，单列单边初态说明 | TransformSheet、transformSheet |
| 分步提示 | 思路→中间式/通用检查点→完整解析；10道2026题另做逐题两级提示，其余使用已核对的题型和技能检查点，明确标为通用提示。用户已完成纸稿时仍可直接对照答案 | ProgressiveHints、learningSupport |
| 易错提示 | 数据具有hints、pitfalls、prerequisites字段；按题型补充ROC、区间、初态、单位等红线，打开解析后单独显示。不是声称1171题已逐题编写专用提示 | types、learningSupport、prepare-content |
| 交互示例 | 单位矩形卷积翻转/平移/相乘/积分、共轭极点与真实幅频增益、抽样谱副本/幅度/混叠；均用SVG和滑块，无外部图表库 | SignalLab、signalLab |
| 双轨任务 | 热身额度与完整推导分开，合计受每日总分钟约束，日内已用时间扣减；每题保留计时，基础阶段不强塞长综合题 | dailyPlan、Today、Review |
| 错因调度 | 概念次日基础卡；计算不额外缩短FSRS、下次验算提醒；方法母题第三天换家族独立验证，原题做对不能代替；保留卷排除 | remediation、queue、scheduler、Mistakes |
| 前置回溯 | ROC、部分分式、初态、支撑区间等请求指向既有卡片，加入次日优先队列；只在真实review后解除，不造学习证据 | learningSupport、remediation、Review |
| 冲刺混排 | 今日一键切换，隐藏题目所属方法和补弱标签，已选题尽量交错；严格模考保留全站路由锁定、截止交卷和固定快照 | Today、dailyPlan、ExamSession |

## 数学及工程依据

四种变换默认约定已写在抽屉中。CTFT使用角频率，DTFT使用rad/sample，LT/ZT采用双边；单边初态项不直接套双边性质。ROC含虚轴/单位圆是这里的通常频率响应口径，广义傅里叶变换另论。临界采样显示边缘谱线与相位限制；无失真传输不误写“所有实信号的相位图必须过原点”，保留负实增益对应的π相位。

性质对照参照 [MIT 6.003公开讲义](https://ocw.mit.edu/courses/6-003-signals-and-systems-fall-2011/pages/lecture-notes/)，并用新增SymPy脚本独立复核角频率约定、尺度、z移位/反褶、DTFT抽取、卷积面积、极点幅频式和逐题中间式。它是学习辅助，不改写中北考试范围。

按需导入和异步CSS采用 [Vite官方分包机制](https://vite.dev/guide/features#build-optimizations)，宏采用 [KaTeX官方配置](https://katex.org/docs/options.html)，笔压与触屏区分采用 [MDN Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)。没有新增运行依赖。

## 验证方式

- `npm test -- --maxWorkers=1`：136项，含完整题库目录/异步详情一致性、新队列、收藏、草稿边界和宏渲染。
- `npm run build`：TypeScript和发布构建。
- `npm run verify:math`：原有56份复核及新增学习工具脚本；新增36项符号检查。
- `npm run test:e2e`：现有27项完整回归，手机逐页检查400道带图题；同步测试先等实际见题事件到达云端，再模拟中断。
- Playwright CLI：实际界面的三级提示、键盘输入保护、收藏取消、草稿刷新恢复、笔压及手掌事件模拟、撤销重做、375px性质抽屉横向滚动、三个实验滑块、冲刺隐藏标签、错因补课、严格模考无辅助。
- 断网注入：阻断2026整卷题面分组下载，页面显示本题加载失败，整卷计时继续；推进浏览器测试时钟后，仍在原截止时刻固定17行答卷。题面与打印的局部错误边界避免卸载整卷计时。
- 编译Pages Worker与临时SQLite：8条新旧事件往返、bookmark、授权与CORS、重复上传去重、备份还原、原始考试快照。测试不向远端写学习记录。

## 使用与维护边界

`src/content/index.ts`仍是原始题库去重入口，`npm run content:prepare`从其生成被忽略的目录和详情；`predev/pretest/prebuild`自动运行，避免人工维护两套答案。禁止手改generated文件。目录和原题的全部对应关系由测试核对。

手写笔压和防误触通过浏览器PointerEvent模拟验证；具体平板的物理笔体验仍随硬件和浏览器而异。草稿不跨设备同步，也不在进度JSON中，重要纸稿可下载PNG；拍照批改照片仍不保存。页面更新后电脑和手机均应刷新，旧标签页需要新版本才能识别收藏事件。

本地发布构建入口从10个预加载降为4个，静态JS/CSS合计从1,407,789字节降为619,613字节（约减少56%），本地gzip估计从486,342降为144,648字节（约减少70%）。`npm run verify:startup`同时检查公式引擎和题库详情没有进入入口同步依赖，并已接入发布流水线。

性能比较采用相同口径的HTML入口静态JS/CSS依赖及本地gzip估计，不将文件减少比例当作TTI或真实移动网络提速。公开站点仍采用CSR与Hash路由，可通过真实浏览器检查渲染内容。

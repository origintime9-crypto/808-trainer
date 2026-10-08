# Gemini 拍照批改接入

网站已经保留兼容 Chat Completions 的批改接口。Google 官方提供同一协议并支持 Base64 照片输入，当前照片压缩、发送和评分解析流程可以沿用：[Gemini 官方兼容说明](https://ai.google.dev/gemini-api/docs/openai)。

线上已配置 Gemini Key，当前模型为 gemini-3.8-flash。模型 ID 来自 [Gemini 3.8 Flash 官方说明](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)，已在当前 Key 返回的可用模型列表中核对。Key 仅存于 Cloudflare Secret，网页仍使用原有同步口令鉴权。

## 服务端配置

| 配置名 | 内容 |
|---|---|
| AI_BASE_URL | https://generativelanguage.googleapis.com/v1beta/openai |
| AI_MODEL | 当前为 gemini-3.8-flash；可改为项目中可用且支持图片的模型 ID |
| AI_API_KEY | 你的 Gemini API Key，保存为 Cloudflare Secret |

AI_BASE_URL 只填到 openai，不追加 chat/completions。2026-10-06 的探测中，gemini-3.8-flash 和 gemini-3.7-flash 曾返回高需求 503，因而暂用 gemini-3.5-flash-lite；这属于当时的请求结果。2026-10-08 按用户要求切换到 gemini-3.8-flash，并移除该模型已弃用的 temperature 参数，保留照片输入、JSON Schema 和评分解析。实际可用性以当前网页的批改结果为准；模型忙碌或超时时仍可重试或复制批改提示词。

依据 [Google 临时故障处理说明](https://ai.google.dev/gemini-api/docs/troubleshooting)，服务端对及时返回的 503 做 1–1.5 秒退避，最多重试一次。两次共用原有 55 秒总期限；首次已耗时 35 秒时不重发，其他错误和跳转不自动重试。请求原字节、模型和推理档位保持相同。此措施不能保证高需求期间批改成功。

在 E:/claude work/808-trainer 打开 PowerShell，以下命令分别提示输入对应值，不把真实 Key 写在命令中：

    npx wrangler pages secret put AI_API_KEY --project-name 808-trainer
    npx wrangler pages secret put AI_BASE_URL --project-name 808-trainer
    npx wrangler pages secret put AI_MODEL --project-name 808-trainer

也可在 Cloudflare 的 808-trainer 项目服务端配置中保存这些值。AI_API_KEY 必须设为 Secret。照片通过服务端发送给 Google；本程序不将照片写入学习进度或备份。

保存配置后重新部署：

    npm run build
    npx wrangler pages deploy dist --project-name 808-trainer --branch main

打开 https://808-trainer.pages.dev/api/health，ai 应为 true，model 应为配置的模型。回到刷题网页「设置 → 拍照批改」，开启拍照 AI 批改；同步口令沿用原有配置，Gemini Key 不填在网页里。

## 验收

分别用正确作答、含计算错误的作答和空白照片检查识别与点评。AI 结果预填评分和错因，核对后点击「记录」才计入学习进度并自动上传。

前一模型 gemini-3.5-flash-lite 已通过真实 Key 调用：正确答案判为全对、关键计算错误判为方法对但结果错、空白图片判为空白或方法错误；一张资料中的手写 Z 变换解答判为全对。更换模型后继续从发布网页检查图片识别、返回模型、375 像素手机排版、公式显示、照片清除、无分值题不虚造估分，以及确认前没有新增进度记录。

2026-10-08 的 3.8 检查中，打印的正确、错误和空白样例分别返回 3、1、0 档，真实手写图曾收到上游 503；同图的 low 推理实验也返回 503，生产继续使用默认档位。有限重试发布后，正式网页的一张真实手写参考图在 16.4 秒返回 200、评分全对，随后打印样例仍在 55 秒超时。接口间歇可用，三类真实手写照片的完整验收仍未完成。

## Gemini 网页备用流程

API 高需求或超时时，可使用自己登录的 Gemini 或 ChatGPT 网页批改：

1. 在题目页复制批改提示词，点击“打开 Gemini”，在模型网页粘贴提示词并自行附上作答照片；题目引用图时也附题图。
2. 将模型返回的完整 JSON 粘贴到题目页“粘贴 Gemini / ChatGPT 批改结果”，选择来源并点击“读取批改结果”。程序要求 problemId 与当前题一致，拒绝无效评分与错因；未知字段不保存，照片字符串不导入。
3. 核对公式、符号和下标，在“转写复核”中选择正确、有误或照片看不清。有误时可修改转写；修改或标注看不清会清除预填评分，按纸上实际作答重新选择评分与错因。点击“记录”才保存和同步，保留原 AI 建议及修正文字。也可忽略 AI 建议后直接自评。

没有题面分值或超过题位满分的数字估分会丢弃，评分档仍可核对使用。设置页按已保存作答分别统计人工改分、转写修正及照片看不清，旧记录未标注复核的情况单列。掌握度使用最终确认的评分，复核计数不是识别准确率。接口失败、格式错误或取消不产生作答记录；失败时备用入口自动展开。

2026-10-09（北京时间）的连接复测：当前 Key 查询 `gemini-3.8-flash` 的原生模型信息返回 200；同模型原生 `generateContent` 的短文本请求返回 503 `UNAVAILABLE`，发布网页的手写参考图请求超时。没有更换生产模型或推理档位，也未把这次连接测试计为用户三类实拍验收。

这条备用流程由用户在模型网页提交照片，本站读取粘贴的文字结果。Google OAuth 需要单独配置客户端和授权，不能仅凭另一个标签页登录 Gemini 就取得本站 API 调用凭证；见 [Google 官方 API 认证说明](https://ai.google.dev/gemini-api/docs/oauth)。Gemini CLI 可在本机用 Google 账号登录，若要供手机网页调用还需配置持续运行的服务桥接，见 [CLI 官方认证说明](https://geminicli.com/docs/get-started/authentication/)；本站当前继续使用服务端 API Key。

Gemini 请求使用 JSON Schema 约束批改字段；其他兼容接口保留普通 Chat Completions 流程。模型少转义一次的常用 LaTeX 命令可恢复，仍无法排版的原式会显示“请核对”，程序不猜写其中的符号。实际使用时继续核对文字转写与评分，特别是模糊照片。

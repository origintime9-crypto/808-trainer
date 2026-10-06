# Gemini 拍照批改接入

网站已经保留兼容 Chat Completions 的批改接口。Google 官方提供同一协议并支持 Base64 照片输入，当前照片压缩、发送和评分解析流程可以沿用：[Gemini 官方兼容说明](https://ai.google.dev/gemini-api/docs/openai)。

当前线上没有配置模型 Key，拍照批改暂未启用；进度自动保存与云同步可以独立使用。

## 服务端配置

| 配置名 | 内容 |
|---|---|
| AI_BASE_URL | https://generativelanguage.googleapis.com/v1beta/openai |
| AI_MODEL | 在你的 Google AI Studio 项目中可用、支持图片输入的 Gemini 模型 ID |
| AI_API_KEY | 你的 Gemini API Key，保存为 Cloudflare Secret |

官方示例目前使用 gemini-3.8-flash；实际模型以你的项目可用列表为准。AI_BASE_URL 只填到 openai，不追加 chat/completions。

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

已验证 Gemini 官方兼容地址、服务端 Bearer 鉴权、Base64 照片请求和评分解析的模拟流程。实际 Key、模型权限、额度及真实手写识别质量须在配置后验证。

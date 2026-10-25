---
title: 安全与权限
createTime: 2026/10/19 20:00:00
---

> 鉴权、授权、敏感数据处理、日志脱敏与依赖安全

## 鉴权与授权

| 层 | 机制 |
| --- | --- |
| 网页端 | 无账号体系；所有功能对访客开放 |
| 后端公共接口 | 无用户鉴权；按设备指纹、IP 与每日配额限流 |
| 后端管理接口 | 需请求头 `X-Purge-Token` 与环境变量 `PURGE_TOKEN` 一致，否则 401 |
| GitHub 仓库 | 公开仓库；写权限由维护者持有，通过 Secrets 注入凭据 |
| Issue 操作 | 体检 Issue 由机器人创建，只有拥有写权限的用户才能编辑其正文；`/ignore` 命令三重门控：必须是那个 Issue + 评论者需有写权限 + 正文必须以 `/ignore` 或 `/unignore` 开头 |
| 桌面端 | 普通权限运行；仅卸载残留清理、系统修复、「所有用户」级启动项走提权助手 |
| AI 密钥 | 桌面端使用 Windows DPAPI 加密保存，仅本机当前用户可解 |

## 敏感数据处理

1. **凭据绝不入仓**：仓库是公开的，写入即公开，且进入 git 历史后无法撤回，只能更换凭据。所有凭据走仓库 Secrets（`FTP_*`、`WEBDAV_*`）。`ShellConfig.UpdateToken` 注释明确「永远不要写死在公开仓库里」（`src/Core/ShellConfig.cs`）。
2. **联系方式加密**：「提交软件」与「反馈中心」的联系方式在浏览器 / 客户端本地用 age 公钥加密后再提交，公开的提交记录与复制出的文本中均为密文，仅维护者可用私钥解密。后端函数拒绝明文 `contact`（400，检查 `-----BEGIN AGE ENCRYPTED FILE-----` 前缀）——该值会被原文发布在公开 Issue 中，明文泄露无法撤回（`functions/api/[[default]].js:1224`）。
3. **age 实现只加密不解密**：`src/Services/AgeEncryption.cs` 完全复刻 age v1（X25519）规范，产出标准 ASCII armor 密文，可被标准 age 工具用私钥解密。私钥仅开发者本地持有，绝不进入任何客户端代码或版本库；该类只持有接收方公钥、只做加密（`src/Services/AgeEncryption.cs:8-13`）。
4. **OSS 私有桶 + 票据闸门**：桶是私有的，OSS 直链谁打开都是 403；下载需经约 15 分钟票据，且每设备每日默认 25 次。票据由后端校验对象前缀与登记状态后签发。
5. **OSS AccessKey 只在服务端**：浏览器与桌面端拿到的都是短时 PUT 签名，签名把对象键、Content-Type 与有效期锁死；AccessKey 不进入任何客户端产物。
6. **加速链接短时有效**：自建加速链接约 15 分钟过期，并校验 Referer 白名单；签名接口按 IP 与全局双重限额，防止被当作免费 CDN 刷流量。
7. **审核字段隔离**：草稿中 `_` 前缀键为审核专用，合并时按前缀（而非按名称）全部剥除，因此新增提交专用字段不可能泄露到发布数据中。
8. **提交路径防目录穿越**：`review-submission.yml` 只处理 `submissions/` 下的路径（Issue 正文部分是提交者可控制的，其他内容——包括 `..`——一律拒绝）；回声洞的目标目录硬编码，不来自草稿。
9. **AI 密钥本地加密**：Hub AI 的 API Key 使用 DPAPI 写入 `hubai-key.bin`，不进入 `settings.json`、不上传、不写日志。

## 后端安全边界

| 风险 | 处置 |
| --- | --- |
| 管理接口被匿名调用 | `PURGE_TOKEN` 非空且请求头完全匹配才放行；未配置令牌时所有管理路由 401 |
| 投稿刷屏 | 每设备每日 6 次、最多 3 条待审核；`SUBMIT_REQUIRE_SOURCE` 可要求来源 |
| 下载盗链 | 私有桶 + 短时票据 + 设备每日限额；对象前缀白名单 |
| 加速被滥用 | 签名有效期、Referer 白名单、IP / 全局每日限额 |
| 签名接口 SSRF | `/api/mirror-sign` 只接受 GitHub 主机与允许的路径形状，不代理任意 URL |
| 跨站调用 | `ALLOWED_ORIGIN` 控制 CORS，默认 `*`；生产可按需收紧 |
| 密钥泄露 | 只从环境变量读取；不返回客户端；不写日志；不进入 git |
| 对象残留 | 惰性 GC 清理孤儿文件与失效登记，管理接口可预览后手动执行 |

::: danger 密钥纪律
`GITHUB_TOKEN`、`OSS_ACCESS_KEY_SECRET`、`SIGN_API_KEY`、`DL_SIGN_SECRET`、`RELAY_TOKEN`、`PURGE_TOKEN` 只配置在 EdgeOne 环境变量中。任何密钥一旦进入公开仓库或日志，视为已泄露，必须立即轮换。
:::

## 日志脱敏

| 措施 | 说明 |
| --- | --- |
| 不含凭据 | 代码中无任何将令牌 / 密码写入日志的路径；`GITHUB_TOKEN` 仅作为环境变量在 CI 中使用 |
| 联系方式加密后才可能进入日志链路 | 日志记录的是提交结果（成功 / 失败 / 错误码），不含明文联系方式 |
| 崩溃日志独立 | `crash.log` 与主日志分离，用户出问题时只需提供这一个文件，降低无关信息暴露面（`src/Core/AppLog.cs:29-31`） |
| 遥测默认关闭且为空实现 | `TelemetryEnabled` 默认 `false`；当前实现 `NoopTelemetryService` 不联网、不上报（`src/Services/Telemetry.cs:6-8`、`src/Services/SettingsStore.cs:39`） |
| WebView2 语言 | `Language = "zh-CN"`，不加载本地回退页面（`src/Services/WebViewRuntimeService.cs:51-52`） |

## 依赖安全

| 措施 | 说明 |
| --- | --- |
| 锁定文件 | 网页端 `package-lock.json`（CI 使用 `npm ci`）；Windows 7 版 NuGet 包版本显式锁定 |
| 升级禁令 | Windows 7 版的 .NET / Avalonia / FluentAvaloniaUI / WebView2 SDK 版本为兼容性硬约束，不得升级（`README.md:54-62`） |
| 镜像通道审查 | 加速下载使用的第三方镜像必须逐一审查后才可加入，**绝不在网上复制镜像列表**。域名过期会被抢注并跳转到广告页（`gh-proxy.net` 曾于 2026-09-19 因此被移除）。审查顺序：`HEAD` 小文件应返回 200 + `application/octet-stream`；带 `Range: bytes=0-1023` 应返回 206（支持续传）；完整下载一个小文件并比对 sha256。任何返回 `30x` 或 `text/html` 的都是死域名或被劫持域名，一律移除 |
| 上游组件补丁可追溯 | WinUIonWeb 保持目录结构不变，便于与上游 diff；`WinNavigationView` 的图片图标补丁需在上游升级后重新应用 |
| DOM 净化 | 使用 `dompurify` 处理 Markdown / HTML 渲染（`package.json:19`） |

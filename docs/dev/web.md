---
title: 网页端开发说明
createTime: 2026/10/19 20:00:00
---

> 路由、页面、组件、状态管理、API 调用、鉴权、错误处理、日志、测试与部署

## 代码组织原则

1. **改文案只改 `文字设置.ts`**，只改引号内的值，不改左侧键名（`AGENTS.md:109-111`）。
2. **改数据只改 `软件数据/apps/*.json`**，不改 `src/gallery/data/index.ts`（加载器）（`AGENTS.md:112-113`）。
3. **`src/components`、`src/styles`、`src/utils`、`src/assets` 是 WinUIonWeb 上游源码**，保持目录结构不变以便与上游 diff。唯一偏离是 `WinNavigationView` 打了「图片图标」补丁（导航项 `icon` 支持 `http(s)://`、`data:image/…`、站点相对路径 `/ ./ ../`）（`AGENTS.md:114-121`）。
4. **页面专属样式写成组件内的 scoped 规则**，不要加到全局。
5. **不得提交 `dist/` 与 `.workbuddy/`**（已在 `.gitignore`）。
6. **不得擅自 commit / push**：维护者审查后才推送（`AGENTS.md:127-129`）。
7. **注意行结尾**：仓库无 `.gitattributes`，行结尾混合——`src/gallery/pages/SubmitPage.vue` 为 CRLF，多数 `.ts` / `.md` / `.json` 为 LF。编辑前读取文件实际字节并保持原样，否则小改动会显示为整文件 diff（`AGENTS.md:132-136`）。

## 数据加载与容错

数据加载器为 `src/gallery/data/index.ts`，采用逐文件容错解析：

- 单个软件 JSON 格式错误时跳过该文件，其余软件正常渲染；
- 页面顶部显示红色提示条，列出失败文件数、文件名、大致行号与原因；
- 问题清单通过 `dataLoadIssues` 暴露（`AGENTS.md:177-178`）。

**新增工具**只需两步：创建工具页面（用 `ToolShell.vue` 包裹），在 `src/gallery/tools/index.ts` 的 `TOOLS` 数组中加一条。导航卡片与路由会自动生成（`AGENTS.md:57-58`、`src/gallery/tools/index.ts:3-8`）。

## 图标解析

`src/gallery/appIcons.ts` 提供两级解析：`appIconUrl()` 优先本地 64px 副本，回退 `icon` URL；`appIconUrlSafe()` 额外剔除本会话已失败过的图标。首页、详情页与左侧导航窗格均通过 `appIconUrl()` 渲染，并配合 `<img loading="lazy" referrerpolicy="no-referrer" @error="markIconBroken(app.id)">` 回退为首字母占位（`AGENTS.md:202-207`）。

本地图标副本要求：正方形、≤ 4096 字节（Vite 默认 `assetsInlineLimit`，超过则变为额外请求而非内联 `data:` URL）（`AGENTS.md:189-192`）。

## 状态管理

项目**未引入 Vuex / Pinia**。跨组件状态通过以下方式管理：

| 机制 | 用途 |
| --- | --- |
| 模块级单例 | 数据加载器、搜索索引等 |
| `localStorage` | 端点记忆、草稿保存、镜像通道选择等 |
| 组件内响应式状态 | 页面局部状态 |
| `provide` / `inject` | 主题与外壳级配置 |

关键 `localStorage` 键：

| 键 | 用途 |
| --- | --- |
| `csh-gh-api-base` | 上次成功的 GitHub API 入口 |
| `csh-gh-mirror-channel` | 上次使用的加速下载镜像通道 |
| `csh-submit-endpoint` | 上次成功的提交入口 |
| `csh-submit-draft` | 提交失败时保存的草稿 |
| `csh-feedback-draft` | 反馈表单草稿 |

## API 调用与回退链

网页端无服务端鉴权。所有外部请求均按「国内可达性优先」原则设计，并配备回退链：

| 场景 | 回退链 |
| --- | --- |
| GitHub API | 站点代理 → `api.github.com` → `gh-proxy.com` → `ghfast.top`；成功的入口记忆在 `localStorage['csh-gh-api-base']` |
| 提交 | 多入口按序尝试，每入口超时 10 秒；成功的入口记忆在 `localStorage['csh-submit-endpoint']`；失败保存到 `localStorage['csh-submit-draft']` |
| 反馈 | 先 POST，网络失败后才出现「改用 GitHub 提交」；「复制反馈内容」始终可用 |
| 内容获取 | `import.meta.glob('回声洞/messages/*.json')` 构建期收集 |

`api.github.com` 未登录限流 60 次/小时/IP，一次「一键读取」消耗 2 次。**新增任何外部请求前必须确认：国内是否可达？不可达时会发生什么？**（`AGENTS.md:265-267`）

## 鉴权与错误处理

- 无账号体系，无登录态。
- 提交类操作的校验全部在 JS 中完成（提交按钮不是原生 submit 控件，HTML `required` 属性不会触发）。
- 校验值规范化：`normalizeHash()` 剥离 `MD5:` / `SHA-256` 前缀、`0x` 与字节分隔符，详情页按十六进制长度自动识别算法（32 / 40 / 56 / 64 / 96 / 128 → MD5 / SHA-1 / SHA-224 / SHA-256 / SHA-384 / SHA-512）。
- `HASH_LENGTHS`（`SubmitPage.vue`）必须与 `HASH_ALGORITHMS`（`DownloadDetailPage.vue`）保持同步。
- 反馈 URL 长度上限 7000（仅回退路径），溢出时用二分查找最长可容纳前缀。

## 日志与可观测性

- 访问统计：`src/gallery/visitor.ts`，根挂载与 `router.afterEach` 时按稳定页面键去重上报；`localhost` 走只读 `/api/stats`，不污染生产计数。
- 百度统计：`index.html` 异步注入，SPA 路由变化由 `visitor.ts` 回放。

## 测试与部署

网页端无单元测试框架，质量门禁为 `npm run type-check` 与 `npm run check`。部署由 `deploy.yml` 在推送 `main` 或手动触发时执行，详见 [CI/CD 与发布](./cicd.md)。

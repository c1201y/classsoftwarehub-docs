---
title: 接口与数据模型
createTime: 2026/10/19 20:00:00
---

> API 清单、请求响应示例、错误码、数据模型与迁移方式

## API 清单

### 提交服务

提交服务为自建 Cloudflare Worker（代号 `classhub`），源码不在仓库内（`AGENTS.md:77-79`）。

| 路由 | 方法 | 请求 | 响应 | 说明 |
| --- | --- | --- | --- | --- |
| `/api/submit` | POST | 应用字段 JSON + `_` 前缀审核字段 | `{ success: true, message }` 或 `{ error }` | 提交软件草稿，Worker 写入 `submissions/<id>.json` |
| `/api/echocave` | POST | `{ "text": "…" }`（≤ 200 字符） | 同上 | 回声洞投稿，写入 `submissions/echo-<时间戳>-<随机>.json` |
| `/api/feedback` | POST | 反馈表单 + age 密文联系方式 | 同上，可能带回 `url`（议题地址） | 反馈中心；Worker 拒绝明文 `contact`（400，检查 `-----BEGIN AGE ENCRYPTED FILE-----` 前缀） |
| `/api/oss-sign` | POST | `{ name, size, contentType, purpose, fp }` | 预签名 PUT 地址 | 换取「只能写这一个对象、约一小时后过期」的预签名地址 |
| `/api/dl-ticket` | POST | `{ key, 设备指纹 }` | 15 分钟票据 | 每台设备每天默认 80 次额度 |
| `/api/dl` | GET | 票据 | 流式文件 | 服务端带中继令牌取流后原样转发 |
| `/api/icon` | GET | 对象键 | 图片 | 公开只读 |
| `/api/hit` | POST | 页面键 | — | 访问统计上报（网页端） |
| `/api/stats` | GET | — | 统计数据 | 只读，本地开发用 |

### 请求示例（提交软件，节选）

```json
{
  "id": "7-zip",
  "name": "7-Zip",
  "icon": "https://...",
  "category": "system",
  "tagline": "开源压缩软件",
  "description": "…",
  "version": "26.03",
  "size": "2.1 MB",
  "system": "Windows（x86 / x64 / ARM64）",
  "downloads": [
    {
      "platform": "Windows x64 安装版",
      "kind": "file",
      "url": "https://github.com/ip7z/7zip/releases/download/26.03/7z2603-x64.msi"
    }
  ],
  "_联系方式": "<age 密文>",
  "_提交时间": "2026-10-19T12:00:00Z"
}
```

## OSS 直传协议

网页端 `src/gallery/ossUpload.ts` 与桌面端 `src/Services/OssUpload.cs` 实现**完全同一套协议**：

1. 客户端把 `{ name, size, contentType, purpose, fp }` 发给 `/api/oss-sign`，换回预签名 PUT 地址。
2. 客户端自己 PUT 到 OSS。
3. 回填的是**对象键**而非公开直链（桶是私有的，直链谁打开都是 403）。

两种 `purpose` 落两个前缀、走两条读取路径：

| purpose | 前缀 | 读取路径 |
| --- | --- | --- |
| `File` | `upload/…` | 私有，下载要过 `/api/dl` 的短时票据闸门 |
| `Icon` | `icon/…` | 小图，走 `/api/icon` 公开只读 |

::: warning Content-Type 必须一致
`Content-Type` 必须原样照抄签名接口回传的值：预签名地址把「请求形状」锁死了，`Content-Type` 是签名的一部分，发的值和签的值对不上会被 OSS 打回 403 `SignatureDoesNotMatch`。
:::

单文件上限 2.5 GB（与网页端一致；天花板是 OSS 单次 PUT 的 5 GB，再大必须分片）。改 `OssUpload.MaxBytes` 要同时改 Worker 的 `OSS_MAX_BYTES`，不能反着来（`src/Services/OssUpload.cs:74-80`）。

## OSS 下载协议

`src/gallery/ossDownload.ts`：

1. 前端把 `{ key, 设备指纹 }` 发给 `/api/dl-ticket`。
2. 服务端查该设备今日剩余额度（默认 80 次/天），发一张 15 分钟票据。
3. 前端用票据请求 `/api/dl`，服务端带中继令牌取流后原样转发。

数据中用 `oss://对象键` 伪协议表示本站对象。该设计的原因是：地址直接写死进数据等于给每个软件配一条永久有效直链，被人挂到别处就是持续的流量账单；票据 15 分钟过期，转发出去基本来不及用（`src/gallery/ossDownload.ts:3-14`）。

## 错误码

### OSS 下载错误码

| 码 | 含义 |
| --- | --- |
| `unreachable` | 所有提交入口都连不上 |
| `quota` | 今日下载额度用尽 |
| `refused` | 服务端明确拒绝（key 非法 / 服务未配置） |
| `invalid` | 响应形状不对 |

### OSS 上传错误码

| 码 | 含义 |
| --- | --- |
| `TooLarge` | 本地预检：超过 `MaxBytes` |
| `SignFailed` | 签名接口明确拒绝（服务未配置 / 该用途被关掉） |
| `Unreachable` | 签名接口连不上，或回的不是提交服务的响应 |
| `Network` | 传输中断 |
| `Aborted` | 用户取消 |
| `Http` | OSS 拒绝（403 / 400 等） |

### 更新异常

| 异常 | 触发条件 |
| --- | --- |
| `ChecksumMismatchException` | 下载包校验不通过；携带算法、期望值、实际值、处置建议 |
| `MissingChecksumException` | 发布未提供任何可用校验值；中止更新，绝不执行未校验的安装包 |

### 提交服务响应约定

成功回 `success: true`，校验失败回 `error`。回源还没生效时 nginx 会吐 HTML 错误页，那不是接口响应，客户端据此换下一个入口，并记「信息」不记「警告」（这是期望内的回退）（`src/Services/SubmitClient.cs:58-64`）。

## 数据模型

### 软件数据模型

`软件数据/apps/*.json`，完整参考 `软件数据/README-维护手册.md` 与 `_模板.json`：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 唯一 ASCII 标识，英文小写、数字、短横线；URL 为 `#/download/<id>` |
| `name` | string | 是 | 软件名称 |
| `icon` | string | 否 | 图标图片 URL，正方形 256×256 建议 |
| `category` | string | 是 | `system` / `schedule` / `teaching` / `other` |
| `tagline` | string | 是 | 一句话简介 |
| `description` | string | 是 | 详细介绍 |
| `version` | string | 否 | 版本号 |
| `size` | string | 否 | 体积 |
| `system` | string | 是 | 系统限制 |
| `website` | string | 否 | 官方网站 |
| `github` | string | 否 | GitHub 仓库地址（只填仓库地址） |
| `notice` | string | 否 | 详情页下载区上方蓝色提示条 |
| `store` | string | 否 | 商店链接 |
| `downloads` | array | 是 | 下载项数组 |
| `sort` | number | 否 | 显示顺序，越小越靠前 |
| `维护备注` | string | 否 | 维护者备注，网页不显示 |

### 下载项模型

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `platform` | string | 是 | 平台标签，如 `Windows x64 安装版` |
| `url` | string | 是 | 文件直链、官网下载页、网盘页或 `oss://对象键` |
| `kind` | string | 否 | `file` / `page` / `netdisk` / `store`；不写按网址自动判断 |
| `note` | string | 否 | 说明文字（**不要**写入完整校验值） |
| `size` | string | 否 | 体积；无直链时可写 `网页` |
| `hash` | string | 否 | 十六进制校验值，算法按长度自动识别 |

### 分类模型

`软件数据/categories.json`：

| 字段 | 说明 |
| --- | --- |
| key | `system` / `schedule` / `teaching` / `other` |
| `name` | 分类显示名 |
| `icon` | 字体符号代码（形如 `\uE90F`） |

### 回声洞消息模型

`回声洞/messages/message<N>.json`：

```json
{
  "text": "…"
}
```

`N` 为当前最大 `message(\d+)` + 1，2 空格缩进。不匹配 `message<数字>.json` 的文件仍会被渲染但排序靠后（`AGENTS.md:350-356`）。

### 桌面端数据模型

`src/Data/` 下：`SoftwareApp`、`DownloadCategory`、`DataIssue`、`MirrorInfo`、`UiText`、`ToolDef`、`SidebarModule`、`DownloadLinkKind`、`NameRoster`、`PickNumberConfig`、`MessageConfig`、`AutoShutdown`、`ExperimentalFeature`、`Feedback`、`EasiNoteGuard`、`ProcessGuard`、`LegalDocs`、`SearchIndex`、`ClockPresets`、`ClockSettings`。

桌面端 `ContentStore` 的解析逻辑与网页端 `src/gallery/data/index.ts` 保持一致：逐文件容错解析 → 坏文件跳过并记 `DataIssue` → 必填 `id`/`name` 校验 → `id` 重复跳过 → 按 `sort` 排序 → 分类读取（坏了就从软件里现推）（`src/Core/ContentStore.cs:8-19`）。

## 数据库与迁移

本项目**无数据库**。全部数据为 JSON 文件，随 git 版本控制。「迁移」通过编辑 JSON 文件并提交完成。桌面端的「数据同步」是从 GitHub 仓库拉取 JSON 到本地缓存目录，不涉及 schema 迁移。

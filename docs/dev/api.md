---
title: 接口与数据模型
createTime: 2026/10/19 20:00:00
---

> 后端路由、请求响应示例、错误码、下载协议、数据模型与迁移方式

## API 清单

后端仓库为 `c1201y/csh-api`，部署于腾讯 EdgeOne Pages，基址 `https://api.classsoftwarehub.cn`，主入口 `functions/api/[[default]].js`。完整路由表见[接口清单](../doc/appendix/api.md)。

### 公共路由

| 路由 | 方法 | 请求 | 响应 | 说明 |
| --- | --- | --- | --- | --- |
| `/api/status` | GET | — | 健康检查 JSON | 存储、OSS、GitHub API、加速签名配置、中继、下载模式 |
| `/api/submit` | POST | 应用字段 + `_` 前缀审核字段 | `{ success: true, message }` 或 `{ error }` | 写入 `submissions/<id>.json` |
| `/api/echocave` | POST | `{ "text": "…" }` | 同上 | 写入 `submissions/echo-<时间戳>-<随机>.json` |
| `/api/feedback` | POST | 反馈表单 + age 密文联系方式 | 同上，可能带回 `url` | 拒绝明文 `contact` |
| `/api/oss-sign` | POST | `{ name, size, contentType, purpose, fp }` | 预签名 PUT 地址 | 只能写指定对象，短时有效 |
| `/api/mirror-sign` | GET | `u=<GitHub URL>` | `{ url }` 短时签名链接 | 自建加速 |
| `/api/dl-ticket` | POST | `{ key, 设备指纹 }` | 15 分钟票据 | 每设备每日默认 25 次 |
| `/api/dl` | GET / HEAD | 票据 | 文件流（支持 Range） | 按模式走中继 / 直连 |
| `/api/icon` | GET / HEAD | 对象键 | 图片 | 公开只读 |
| `/api/announce/send` | POST | `{ pairCode, text, from, duration, targets? }` | `{ ok, id, devices }` | 配对码 6 位 |
| `/api/announce/poll` | GET | `deviceId` + `pairCode` | 公告或 204 | 设备轮询 |
| `/api/announce/list` | GET | `pairCode` | 设备列表 | 管理端查看 |

### 管理路由（`X-Purge-Token`）

`/api/purge`、`/api/files`、`/api/dl-stats`、`/api/link`、`/api/promote`、`/api/gc`、`/api/registry-sync`、`/api/dl-mode`、`/api/oss-check`。无令牌一律 401。

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

网页端 `src/gallery/ossUpload.ts` 与两个桌面端实现**同一套协议**：

1. 客户端把 `{ name, size, contentType, purpose, fp }` 发给 `/api/oss-sign`，换回预签名 PUT 地址。
2. 客户端自己 PUT 到 OSS。
3. 回填的是**对象键**而非公开直链（桶是私有的，直链谁打开都是 403）。

| purpose | 前缀 | 读取路径 |
| --- | --- | --- |
| `icon` | `icon/…` | 小图，上传签名上限 1 MB，走 `/api/icon` 公开只读（读取上限 5 MB） |
| 其他或缺省 | `upload/…`（由 `OSS_PREFIX` 决定） | 私有，下载要过 `/api/dl` 的短时票据闸门 |

::: warning Content-Type 必须一致
`Content-Type` 是签名的一部分。发的值必须与签名接口回传的值一致，否则 OSS 返回 403 `SignatureDoesNotMatch`。
:::

单文件上限 2.5 GB（`OSS_MAX_BYTES`）。修改客户端上限时必须同时修改后端常量。

## OSS 下载协议

1. 客户端把 `{ key, 设备指纹 }` 发给 `/api/dl-ticket`。
2. 后端检查对象前缀（`upload/`、`soft/`、`releases/`）、登记状态与设备今日额度（默认 25 次/天），发一张约 15 分钟票据。
3. 客户端用票据请求 `/api/dl`，后端按下载模式取流：

| 模式 | 路径 |
| --- | --- |
| `auto` | 优先 ECS 中继，失败回退后端直连 OSS |
| `relay` | 固定 ECS 中继 |
| `backend` | EdgeOne 函数直连 OSS |
| `direct` | 票据直接指向 OSS 公网签名地址 |

数据中用 `oss://对象键` 伪协议表示本站对象。票据短时有效，避免永久直链被转发后产生持续流量账单。

## 加速签名协议

1. 客户端带 GitHub 原始地址请求 `/api/mirror-sign`。
2. 后端校验主机与路径，调用签名节点，返回 `https://download.classsoftwarehub.cn/d?u=&e=&s=`。
3. nginx 校验签名、有效期与 Referer 白名单后反代 GitHub。
4. 签名失败时客户端按公共镜像列表回退。

限额：每 IP 每日 20 次（`SIGN_PER_IP_PER_DAY`）、全局每日 3000 次（`SIGN_GLOBAL_PER_DAY`）、全局每日 20 GiB 流量（`SIGN_GLOBAL_BYTES_PER_DAY`）。

## 错误码

### 下载 / 票据

| 码 | 含义 |
| --- | --- |
| `unreachable` | 后端或中继不可达 |
| `quota` | 今日下载额度用尽 |
| `refused` | 后端明确拒绝（key 非法 / 服务未配置 / 未登记） |
| `invalid` | 响应形状不对 |
| `expired` | 票据过期 |

### OSS 上传

| 码 | 含义 |
| --- | --- |
| `TooLarge` | 本地预检：超过 2.5 GB |
| `SignFailed` | 签名接口拒绝（服务未配置 / 用途关闭） |
| `Unreachable` | 签名接口不可达 |
| `Network` | 传输中断 |
| `Aborted` | 用户取消 |
| `Http` | OSS 拒绝（403 / 400 等） |

### 更新异常

| 异常 | 触发条件 |
| --- | --- |
| `ChecksumMismatchException` | 下载包校验不通过；携带算法、期望值、实际值与处置建议 |
| `MissingChecksumException` | Win7 版专用：发布未提供任何可用校验值（`.md5` 与 SHA256 都没有）时中止更新，绝不执行未校验的安装包。Win10 版当前只记警告并继续，不发该异常 |

### 后端响应约定

成功回 `success: true` 或 `{ ok: true }`，失败回 `{ error }` 并附合适的 HTTP 状态码。管理接口未授权返回 401；额度超限返回 429；明确拒绝返回 403。客户端据此展示可读提示，不暴露堆栈。

## 数据模型

### 软件数据模型

`软件数据/apps/*.json`，完整参考 `软件数据/README-维护手册.md` 与 `_模板.json`：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 唯一 ASCII 标识，英文小写、数字、短横线；URL 为 `#/download/<id>` |
| `name` | string | 是 | 软件名称 |
| `icon` | string | 否 | 图标图片 URL，正方形 256×256 建议 |
| `category` | string | 是 | `classroom` / `office` / `system` / `media` / `network` / `utility` |
| `tagline` | string | 是 | 一句话简介 |
| `description` | string | 是 | 详细介绍 |
| `version` | string | 否 | 版本号 |
| `size` | string | 否 | 体积 |
| `system` | string | 是 | 系统限制（给人看的说明） |
| `platforms` | string[] | 否 | 平台筛选键（`windows` / `macos` / `linux` / `android` / `ios` / `web`）；只用于筛选，展示文案仍取 `system` |
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

### 分类与平台

分类 key：`classroom` / `office` / `system` / `media` / `network` / `utility`。平台 key：`windows` / `macos` / `linux` / `android` / `ios` / `web`，每个平台可带 `versionRange` 与 `versions[]`。

### 回声洞消息模型

`回声洞/messages/message<N>.json`：

```json
{
  "text": "…"
}
```

`N` 为当前最大 `message(\d+)` + 1，2 空格缩进。不匹配 `message<数字>.json` 的文件仍会被渲染但排序靠后。

### 后端状态模型

| 模型 | 关键字段 |
| --- | --- |
| 下载票据 | 对象键、设备指纹、签发时间、过期时间、使用次数 |
| 文件登记 | 对象键、大小、来源（投稿 / 发布 / 图标）、创建时间 |
| 公告 | 配对码、消息 ID、正文、发送者、时长、目标设备、时间戳 |
| 设备 | 设备 ID、配对码、名称、最近轮询时间 |
| 配置覆盖 | 下载模式、GC 阈值、投稿限额、更新时间 |

### 桌面端数据模型

**Win10**：`Data/` 下 `SoftwareApp`、`DownloadLinkKind`、`SearchIndex`、`ToolDef`、`SidebarModule`、`NameRoster`、`PickNumberConfig`、`AutoShutdown`、`ExperimentalFeature`、`Feedback`、`EasiNoteGuard`、`ProcessGuard`、`UiText` 等。

**Win7**：`src/Data/` 下同名模型，另有 `DownloadCategory`、`DataIssue`、`MirrorInfo`、`MessageConfig`、`LegalDocs`、`ClockPresets`、`ClockSettings`。

两个桌面端 `ContentStore` 的解析逻辑与网页端 `src/gallery/data/index.ts` 一致：逐文件容错解析 → 坏文件跳过并记 `DataIssue` → 必填 `id`/`name` 校验 → `id` 重复跳过 → 按 `sort` 排序 → 分类读取（坏了就从软件里现推）。

## 数据库与迁移

项目**无关系型数据库**。软件数据为 JSON 文件并随 git 版本控制；后端票据、登记、公告与配置覆盖写入 EdgeOne 状态存储；文件写入 OSS。桌面端「数据同步」只是把 JSON 拉到本地缓存目录，不涉及 schema 迁移。

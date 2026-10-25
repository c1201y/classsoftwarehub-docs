---
title: 数据模型清单
createTime: 2026/10/19 20:00:00
---

> 软件数据、下载项、分类、回声洞消息、提交草稿与桌面端模型

## 模型总览

| 模型 | 位置 | 载体 |
| --- | --- | --- |
| 软件数据 | `软件数据/apps/*.json` | JSON 文件 |
| 下载项 | `downloads[]` | JSON 数组元素 |
| 分类 | `软件数据/categories.json` | JSON |
| 平台 | `软件数据/platforms.json` | JSON |
| 回声洞消息 | `回声洞/messages/message<N>.json` | JSON |
| 提交草稿 | `submissions/*.json` | JSON（含 `_` 前缀审核字段） |
| 忽略记录 | `软件数据/update-ignore.json` | JSON |
| 下载票据 | 后端状态存储 | 键值记录，15 分钟有效 |
| 文件登记 | 后端状态存储 / OSS 对象 | 键值记录 + 对象元数据 |
| 公告 | 后端状态存储 | 配对码 + 消息队列 |
| 桌面端 `SoftwareApp` | `Data/SoftwareApp.cs` | C# 记录 |
| 桌面端 `DownloadLinkKind` | `Data/DownloadLinkKind.cs` | C# 枚举 |
| 桌面端 `DataIssue` | `Data/*.cs` | C# 记录 |
| 桌面端 `ToolDef` | `Data/ToolDef.cs` | C# |
| 桌面端 `SidebarModule` | `Data/SidebarModule.cs` | C# |
| 桌面端 `AppSettings` | `Services/SettingsStore.cs` | C#，序列化为 `settings.json` |
| 更新模型 | `Services/Updating/UpdateModels.cs` | C# 记录 |
| 内容同步结果 | `Services/ContentUpdater.cs`、`GithubContentSync.cs` | C# 记录 |

项目**无关系型数据库**。后端使用 EdgeOne 提供的键值 / Blob 状态存储保存票据、登记与公告；软件数据仍以仓库 JSON 为唯一权威源。桌面端本地缓存为文件，无 schema 迁移机制。

## 软件数据模型

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
| `system` | string | 是 | 系统限制 |
| `website` | string | 否 | 官方网站 |
| `github` | string | 否 | GitHub 仓库地址（只填仓库地址） |
| `notice` | string | 否 | 详情页下载区上方蓝色提示条 |
| `store` | string | 否 | 商店链接 |
| `platforms` | string[] | 否 | 平台筛选键数组（取 `platforms.json` 的 key）；仅用于筛选，页面展示仍用 `system` 原文 |
| `downloads` | array | 是 | 下载项数组 |
| `sort` | number | 否 | 显示顺序，越小越靠前 |
| `维护备注` | string | 否 | 维护者备注，网页不显示 |

## 下载项模型

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `platform` | string | 是 | 平台标签，如 `Windows x64 安装版` |
| `url` | string | 是 | 文件直链、官网下载页、网盘页或 `oss://对象键` |
| `kind` | string | 否 | `file` / `page` / `netdisk` / `store`；不写按网址自动判断 |
| `note` | string | 否 | 说明文字（**不要**写入完整校验值） |
| `size` | string | 否 | 体积；无直链时可写 `网页` |
| `hash` | string | 否 | 十六进制校验值，算法按长度自动识别 |

## 分类模型

| 字段 | 说明 |
| --- | --- |
| `key` | `classroom` / `office` / `system` / `media` / `network` / `utility` |
| `name` | 分类显示名（教学课堂 / 办公通讯 / 系统工具 / 影音图像 / 网络工具 / 其他工具） |
| `icon` | 字体符号代码（形如 `\uE954`） |

## 平台模型

| 字段 | 说明 |
| --- | --- |
| `key` | `windows` / `macos` / `linux` / `android` / `ios` / `web` |
| `name` | 平台显示名 |
| `versionRange` | 是否按版本范围筛选 |
| `versions[]` | 版本项数组，每项含 `key` 与 `name` |

## 回声洞消息模型

```json
{
  "text": "…"
}
```

`N` 为当前最大 `message(\d+)` + 1，2 空格缩进。不匹配 `message<数字>.json` 的文件仍会被渲染但排序靠后。

## 提交草稿模型

草稿文件位于 `submissions/`，包含应用字段**加上审核专用元数据**，后者键名以 `_` 开头：

| 键 | 说明 |
| --- | --- |
| `_提交时间` | 由服务端写入 |
| `_原始ID冲突` | 由服务端写入 |
| `_联系方式` | age 密文 |
| `_类型` | 草稿类型标记；仅回声洞（`回声洞`）与反馈（`反馈`）草稿带此键，软件草稿不带 |

**约定：`_` 前缀键 = 仅审核用。** 合并时全部剥除。

## 桌面端模型清单

**Win10（`ClassSoftwareHub-Desktop`）** `Data/` 下：`SoftwareApp`、`DownloadLinkKind`、`SearchIndex`、`ToolDef`、`SidebarModule`、`NameRoster`、`PickNumberConfig`、`AutoShutdown`、`ExperimentalFeature`、`Feedback`、`EasiNoteGuard`、`ProcessGuard`、`UiText`，以及 `Core/` 中的 `ClockSettings`、`ClockPresets`、`StableRank` 等。

**Windows 7（`ClassSoftwareHub-windows7`）** `src/Data/` 下：`SoftwareApp`、`DownloadCategory`、`DataIssue`、`MirrorInfo`、`UiText`、`ToolDef`、`SidebarModule`、`DownloadLinkKind`、`NameRoster`、`PickNumberConfig`、`MessageConfig`、`AutoShutdown`、`ExperimentalFeature`、`Feedback`、`EasiNoteGuard`、`ProcessGuard`、`LegalDocs`、`SearchIndex`、`ClockPresets`、`ClockSettings`。

两个桌面端 `ContentStore` 的解析逻辑与网页端 `src/gallery/data/index.ts` 保持一致：逐文件容错解析 → 坏文件跳过并记 `DataIssue` → 必填 `id`/`name` 校验 → `id` 重复跳过 → 按 `sort` 排序 → 分类读取（坏了就从软件里现推）。1.1.1 起上游删除的文件会同步删除本地缓存；仅当目录列表疑似被截断时保留，避免误删。

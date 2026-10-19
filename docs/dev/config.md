---
title: 配置说明
createTime: 2026/10/19 20:00:00
---

> 环境变量、配置文件、默认值、必填项、敏感项与示例

## 网页端

网页端**无环境变量与运行时配置文件**，全部配置以源码常量形式存在：

| 配置项 | 位置 | 说明 |
| --- | --- | --- |
| 站点全部中文文案 | `文字设置.ts` | 唯一修改点；键名不可改 |
| 英文站文案 | `src/gallery/Strings/en-US/Resources.ts` | 与中文站同步 |
| 致谢列表 | `鸣谢文本.ts` | 独立于 `文字设置.ts` |
| AI 导航站点 | `AI导航文本.ts` | 名称 / 简介 / 网址 |
| 软件数据 | `软件数据/apps/*.json` | 一软件一文件 |
| 分类 | `软件数据/categories.json` | 4 个分类 |
| 版本号 | `文字设置.ts` 的 `app.version`（3 处）、英文站 `Resources.ts` 的 `app.version`、`package.json` 的 `version` | 需同步修改 |
| 加速下载镜像通道 | `src/gallery/githubMirror.ts` 的 `MIRROR_CHANNELS` | 增删镜像只改此处 |
| 提交入口 | `src/gallery/submitEndpoints.ts` | 与桌面端 `ShellConfig.SubmitEndpoints` 对应 |
| 忽略名单 | `软件数据/update-ignore.json` | 由 `scripts/update-ignore.mjs` 维护 |

### 构建期环境变量

| 变量 | 取值 | 作用 |
| --- | --- | --- |
| `SINGLEFILE` | `1` | 单文件打包（`npm run build:single` 即 `cross-env SINGLEFILE=1 vite build`） |

### CI Secrets

| Secret | 用途 |
| --- | --- |
| `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD` | FTP 镜像部署 |
| `WEBDAV_USERNAME` / `WEBDAV_PASSWORD` | OpenList WebDAV 部署 |
| `GITHUB_TOKEN` | 工作流内置，自动注入 |

::: danger 凭据绝不入仓
仓库是公开的，写入即公开，且进入 git 历史后无法撤回，只能更换凭据。所有凭据必须通过仓库 Secrets 注入，**不得明文写入仓库任何文件（含注释）**。
:::

### 本地开发用令牌

| 变量 | 说明 |
| --- | --- |
| `GITHUB_TOKEN` | 可选。不配置时走匿名接口，限流 60 次/小时 |

## Windows 7 兼容版

外壳常量集中在 `src/Core/ShellConfig.cs`，无外部配置文件，无环境变量（除 `CSH_SIMULATE_WIN7` 排障开关外）。用户设置持久化于 `%LOCALAPPDATA%\ClassSoftwareHub\settings.json`。

### 核心常量

| 常量 | 当前值 | 说明 |
| --- | --- | --- |
| `SiteUrl` | `https://classsoftwarehub.us.ci` | 站点地址；正式发版只改这一行 |
| `ShellVersion` | `1.2.0-insider1.0` | 版本号唯一来源 |
| `VersionPrefix` | `dv` | 版本号前缀 |
| `UpdateRepoOwner` / `UpdateRepoName` | `c1201y` / `ClassSoftwareHub-windows7` | 更新仓库；Win7 版独立成库 |
| `UpdateTagPrefix` | `""`（空串） | 独立仓库后留空；合库时填上前缀 |
| `UpdateToken` | `""`（空） | 留空走匿名（60 次/小时）；⚠️ 永远不要写死在公开仓库里 |
| `SiteRepoOwner` / `SiteRepoName` / `SiteRepoBranch` | `c1201y` / `ClassSoftwareHub` / `main` | 软件数据来源仓库 |
| `SiteRepoDataDir` | `软件数据` | 仓库中软件数据目录 |
| `SubmitEndpoints` | `https://cshapi.132614.xyz`、`https://submit.132614.xyz` | 提交服务入口，按顺序尝试 |
| `SubmitTimeoutMs` | `10000` | 提交请求超时 |
| `ContentManifestUrl` | `https://classsoftwarehub.us.ci/content/manifest.json` | 备用内容来源 |
| `ContentManifestUrlFallback` | `https://pan.132614.xyz/dav/%E7%BD%91%E7%AB%99/content/manifest.json` | 网盘备用来源 |
| `SiteVersionTarget` / `SiteVersionDisplay` | `v2.3.4` / `v2.3.4 - Tangram (20260927PR01)` | 与站点对齐的版本号 |
| `LoadTimeoutSeconds` | `25` | 导航超时 |
| `TitleBarHeight` | `48` | 标题栏高度 |
| `MutexName` | `ClassSoftwareHub.Desktop.SingleInstance` | 单实例互斥名 |
| `ActivateEventName` | `ClassSoftwareHub.Desktop.ActivateMainWindow` | 唤醒主窗口的命名事件 |
| `WebView2DownloadUrl` | WebView2 官方下载页 | 运行时缺失时的引导地址 |
| `DevContentDir` | 开发机站点工程产物目录 | 仅本机存在，正式用户机器自动跳过 |

### 用户设置

`src/Services/SettingsStore.cs` 的 `AppSettings`，节选关键项：

| 设置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `Backdrop` | string | `acrylic` | `acrylic` / `mica` / `solid` |
| `Theme` | string | `system` | `system` / `light` / `dark` |
| `SplitTheme` | bool | `false` | 外部组件使用单独外观 |
| `ExternalTheme` | string | `system` | 外部组件外观，仅 `SplitTheme` 开启时生效 |
| `CloseToTray` | bool | `true` | 点关闭收进托盘而非退出 |
| `AlwaysOnTop` | bool | `false` | 主窗口置顶 |
| `AutoStart` | bool | `false` | 开机启动 |
| `MinimizeOnStart` | bool | `false` | 开机启动时最小化 |
| `TelemetryEnabled` | bool | `false` | 遥测上报，**默认关闭**；当前实现为空操作 |
| `PaletteOnTop` | bool | `true` | 工具浮窗置顶 |
| `SidebarEnabled` | bool | `true` | 屏幕右侧工具侧边栏 |
| `SidebarMode` | string | `dock` | `dock`（贴靠，仅左右两边）/ `free`（自由，四条边） |
| `SidebarEdge` | string | `right` | 贴靠模式的边 |
| `SidebarFreeEdge` | string | `right` | 自由模式的边 |
| `SidebarModuleIds` | string[] | `{ "pick-number", "timer", "stopwatch", "clock" }` | 侧边栏模块与顺序 |

## 提交服务（外部）

提交服务为自建 Cloudflare Worker（代号 `classhub`），源码不在仓库内。客户端可见的路由与协议见[接口与数据模型](./api.md)。

Worker 侧配置项（如 `OSS_MAX_BYTES`）待确认。

## 安装脚本

| 配置 | 位置 | 值 |
| --- | --- | --- |
| 版本号 | `#define DesktopVersion` | 与 `ShellVersion` 一字不差（不带 `dv`） |
| AppId | `[Setup] AppId` | `{{C4E7B2A1-6D38-4F5C-9A17-0E8B3D5C7F42}` |
| 默认安装目录 | `DefaultDirName` | `{localappdata}\Programs\ClassSoftwareHub-Win7` |
| 权限要求 | `PrivilegesRequired` | `lowest` |
| 最低系统版本 | `MinVersion` | `6.1sp1` |
| 允许架构 | `ArchitecturesAllowed` | `x64compatible` |
| 压缩 | `Compression` | `lzma2/max` + `SolidCompression` |

---
title: 配置说明
createTime: 2026/10/19 20:00:00
---

> 环境变量、配置文件、默认值、必填项与敏感项

## 网页端

网页端**无运行时配置文件**，全部配置以源码常量形式存在：

| 配置项 | 位置 | 说明 |
| --- | --- | --- |
| 站点全部中文文案 | `文字设置.ts` | 主要修改点；键名不可改 |
| 条款 / 法律文本 | `法律文本.ts` | 用户协议、隐私政策、免责声明 |
| 英文站文案 | `src/gallery/Strings/en-US/Resources.ts` | 与中文站同步 |
| 致谢列表 | `鸣谢文本.ts` | 独立于 `文字设置.ts` |
| AI 导航站点 | `AI导航文本.ts` | 名称 / 简介 / 网址 |
| 软件数据 | `软件数据/apps/*.json` | 一软件一文件 |
| 分类 | `软件数据/categories.json` | 6 个分类 |
| 平台 | `软件数据/platforms.json` | 6 个平台 |
| 版本号 | `文字设置.ts` 中的版本字符串（首页副标题、欢迎语、`app.version` 共 3 处）、英文站 `Resources.ts`、`package.json` | 需同步修改 |
| 加速下载镜像通道 | `src/gallery/githubMirror.ts` 的 `MIRROR_CHANNELS` | 增删镜像只改此处 |
| 加速签名入口 | `src/gallery/githubMirror.ts` 的 `SIGN_ENDPOINTS` | 首选 `https://api.classsoftwarehub.cn/api/mirror-sign` |
| 后端入口 | `src/gallery/submitEndpoints.ts` | 当前仅 `https://api.classsoftwarehub.cn` |
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
仓库是公开的，写入即公开，且进入 git 历史后无法撤回，只能更换凭据。所有凭据必须通过仓库 Secrets 或平台环境变量注入，**不得明文写入仓库任何文件（含注释）**。
:::

## 后端（csh-api）

后端所有配置都来自 EdgeOne 环境变量，代码中的 `ENV_DEFAULTS` 只提供非敏感默认值。完整清单见[配置项清单](../doc/appendix/config.md#后端（csh-api-edgeone-pages）)。

### 必填项

| 变量 | 缺失后果 |
| --- | --- |
| `GITHUB_TOKEN` | 回声洞、反馈、提交草稿写入不可用 |
| `OSS_ACCESS_KEY_ID` / `OSS_ACCESS_KEY_SECRET` / `OSS_BUCKET` | 直传签名、下载票据不可用 |
| `SIGN_API_KEY` | 自建 GitHub 加速签名不可用（`/api/mirror-sign` 返回未配置） |
| `DL_SIGN_SECRET` | 下载票据使用空密钥签名，生产环境必须配置 |
| `PURGE_TOKEN` | 所有管理接口返回 401 |
| `RELAY_HOST` / `RELAY_TOKEN` | 下载中继不可用，只能走 backend / direct 模式 |

### 敏感项

`GITHUB_TOKEN`、`OSS_ACCESS_KEY_SECRET`、`SIGN_API_KEY`、`DL_SIGN_SECRET`、`RELAY_TOKEN`、`PURGE_TOKEN` 只能配置在平台环境变量中，不写入日志、不返回给客户端、不进入 git。

### 运行时可调项

下载模式、GC 阈值、投稿限额可通过 `POST /api/dl-mode` 写入状态存储，优先级高于环境变量；`GET /api/dl-mode` 会返回 `modeSource`（`runtime` / `env`）以便确认当前生效来源。

## 桌面端（Win10）

外壳常量集中在 `Core/ShellConfig.cs`，用户设置持久化于 `%LOCALAPPDATA%\ClassSoftwareHub\settings.json`，AI 密钥单独存于 `hubai-key.bin`（DPAPI 加密）。

### 核心常量

| 常量 | 当前值 | 说明 |
| --- | --- | --- |
| `SiteUrl` | `https://classsoftwarehub.us.ci` | 站点地址（代码当前值；站点主域已切到 `classsoftwarehub.cn`，桌面端常量尚未跟进） |
| `ShellVersion` | `1.2.0-insider1.4` | 版本号唯一来源 |
| `VersionPrefix` | `dv` | 版本号前缀 |
| `UpdateRepoOwner` / `UpdateRepoName` | `c1201y` / `ClassSoftwareHub-Desktop` | 更新仓库 |
| `SiteRepoOwner` / `SiteRepoName` / `SiteRepoBranch` | `c1201y` / `ClassSoftwareHub` / `main` | 软件数据来源仓库 |
| `SiteRepoDataDir` | `软件数据` | 仓库中软件数据目录 |
| `ContentManifestUrl` | 主站 `/content/manifest.json` | 备用内容来源 |
| `BundledContentDir` | 无 | 1.1.1 起取消内置内容 |
| `SiteVersionTarget` / `SiteVersionDisplay` | `v2.3.4` / `v2.3.4 - Tangram (20260927PR01)` | 代码中的站点对齐值；网页端实际已是 `v2.3.5` |
| `MutexName` | `ClassSoftwareHub.Desktop.SingleInstance` | 单实例互斥名 |
| `ActivateEventName` | `ClassSoftwareHub.Desktop.ActivateMainWindow` | 唤醒主窗口的命名事件 |

### 用户设置（节选）

| 设置项 | 默认值 | 说明 |
| --- | --- | --- |
| `Backdrop` | `mica` | `mica` / `acrylic` / `solid`，不可用时自动降级 |
| `Theme` | `system` | `system` / `light` / `dark` |
| `CloseToTray` | `true` | 点关闭收进托盘 |
| `PaletteOnTop` | `true` | 工具浮窗置顶 |
| `SidebarEnabled` | `true` | 启用工具侧边栏 |
| `SidebarEdge` | `right` | 贴靠边 |
| `SidebarMode` | `dock` | `dock` / `free` |
| `SidebarModuleIds` | 抽号、计时、秒表、时钟 | 侧边栏模块与顺序 |
| `HubAiEnabled` | `true` | 启用 Hub AI |
| `HubAiProvider` | `deepseek` | AI 服务商 |
| `HubAiBaseUrl` | `https://api.deepseek.com/v1` | 接口地址 |
| `HubAiModel` | `deepseek-v4-flash` | 模型 |
| `AutoCheckUpdate` | `true` | 启动时检查更新 |
| `LogKeepDays` | `7` | 日志保留天数 |
| `TelemetryEnabled` | `false` | 遥测，默认关闭；当前为空操作 |

## 桌面端（Windows 7）

外壳常量集中在 `src/Core/ShellConfig.cs`，用户设置同样写入 `%LOCALAPPDATA%\ClassSoftwareHub\settings.json`。

| 常量 | 当前值 | 说明 |
| --- | --- | --- |
| `SiteUrl` | `https://classsoftwarehub.us.ci` | 站点地址（代码当前值；站点主域已切到 `classsoftwarehub.cn`，桌面端常量尚未跟进） |
| `ShellVersion` | `1.2.0-insider1.2` | 版本号唯一来源 |
| `VersionPrefix` | `dv` | 版本号前缀 |
| `UpdateRepoOwner` / `UpdateRepoName` | `c1201y` / `ClassSoftwareHub-windows7` | 更新仓库 |
| `SiteRepoOwner` / `SiteRepoName` / `SiteRepoBranch` | `c1201y` / `ClassSoftwareHub` / `main` | 软件数据来源仓库 |
| `SiteRepoDataDir` | `软件数据` | 仓库中软件数据目录 |
| `SubmitEndpoints` | `https://cshapi.132614.xyz`、`https://submit.132614.xyz` | 历史入口；待切换到 `api.classsoftwarehub.cn` |
| `SubmitTimeoutMs` | `10000` | 提交请求超时 |
| `ContentManifestUrl` / `ContentManifestUrlFallback` | 主站 / 网盘 | 备用内容来源 |
| `MutexName` | `ClassSoftwareHub.Desktop.SingleInstance` | 单实例互斥名 |
| `ActivateEventName` | `ClassSoftwareHub.Desktop.ActivateMainWindow` | 唤醒主窗口的命名事件 |
| `DevContentDir` | 开发机站点工程产物目录 | 仅本机存在 |

## 安装脚本

| 配置 | Win10 | Windows 7 |
| --- | --- | --- |
| 版本号 | `#define DesktopVersion` | `#define DesktopVersion` |
| AppId | `{{7A2C4D18-9F31-4C6B-8E5A-2D0B7F4A1C93}` | `{{C4E7B2A1-6D38-4F5C-9A17-0E8B3D5C7F42}` |
| 默认安装目录 | `{localappdata}\Programs\ClassSoftwareHub` | `{localappdata}\Programs\ClassSoftwareHub-Win7` |
| 权限要求 | `lowest` | `lowest` |
| 最低系统版本 | `6.1sp1` + `[Code]` 检查 17763 | `6.1sp1` |
| 允许架构 | `x64compatible` | `x64compatible` |
| 输出文件名 | `ClassSoftwareHub-Setup-dv<版本>.exe` | `ClassSoftwareHub-Setup-win7-dv<版本>.exe` |

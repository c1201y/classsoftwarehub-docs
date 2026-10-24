---
title: 配置项清单
createTime: 2026/10/19 20:00:00
---

> 网页端源码常量、后端环境变量、两个桌面端外壳常量与安装脚本配置

## 网页端

| 配置 | 位置 | 类型 |
| --- | --- | --- |
| 中文 UI 文案 | `文字设置.ts` | 源码常量 |
| 英文 UI 文案 | `src/gallery/Strings/en-US/Resources.ts` | 源码常量 |
| 致谢列表 | `鸣谢文本.ts` | 源码常量 |
| AI 导航站点 | `AI导航文本.ts` | 源码常量 |
| 软件数据 | `软件数据/apps/*.json` | 数据文件 |
| 分类 | `软件数据/categories.json` | 数据文件 |
| 平台 | `软件数据/platforms.json` | 数据文件 |
| 忽略 / 跳过记录 | `软件数据/update-ignore.json` | 数据文件 |
| 回声洞消息 | `回声洞/messages/message<N>.json` | 数据文件 |
| 镜像通道 | `src/gallery/githubMirror.ts` 的 `MIRROR_CHANNELS` | 源码常量 |
| 提交入口 | `src/gallery/submitEndpoints.ts` | 源码常量 |
| 下载票据入口 | `src/gallery/ossDownload.ts` | 源码常量 |
| 构建 base | `vite.config.ts` 的 `base: './'` | 构建配置 |
| 单文件开关 | 环境变量 `SINGLEFILE=1` | 构建环境变量 |
| 开发服务器 | `vite.config.ts`：host `0.0.0.0`、port 5173、`usePolling: true`、interval 400 | 构建配置 |
| CI Secrets | `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD` / `WEBDAV_USERNAME` / `WEBDAV_PASSWORD` | 仓库 Secret |
| 本地令牌 | `GITHUB_TOKEN` | 环境变量 |

## 后端（csh-api / EdgeOne Pages）

代码默认值见 `functions/api/[[default]].js` 的 `ENV_DEFAULTS`；部署时通过 EdgeOne 环境变量覆盖。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `GITHUB_OWNER` | `c1201y` | 数据仓库所有者 |
| `GITHUB_REPO` | `classsoftwarehub` | 数据仓库名 |
| `GITHUB_BRANCH` | `main` | 数据仓库分支 |
| `GITHUB_TOKEN` | 无 | 读写仓库、创建 Issue |
| `OSS_BUCKET` | `classsoftwarehub` | OSS 桶名（私有） |
| `OSS_REGION` | `cn-shanghai` | OSS 区域 |
| `OSS_ENDPOINT` | `oss-cn-shanghai.aliyuncs.com` | OSS 端点 |
| `OSS_PUBLIC_BASE` | `https://classsoftwarehub.oss-cn-shanghai.aliyuncs.com` | 公网基址 |
| `OSS_PREFIX` | `upload` | 直传前缀 |
| `OSS_ACCESS_KEY_ID` | 无 | OSS V4 签名凭据 |
| `OSS_ACCESS_KEY_SECRET` | 无 | OSS V4 签名凭据 |
| `SIGN_API_KEY` | 无 | 加速签名节点密钥 |
| `DL_SIGN_SECRET` | 无 | 下载票据 HMAC 密钥；未设置时签名为空密钥，生产必须配置 |
| `DL_MODE` | `auto` | `auto` / `relay` / `backend` / `direct` |
| `DL_DAILY_LIMIT` | `25` | 每设备每日下载票据上限 |
| `DL_RELAY_MONTHLY_GB` | `0` | 中继月度流量上限（GB，0 = 不限） |
| `DL_DIRECT_MONTHLY_GB` | `0` | 直连月度流量上限（GB，0 = 不限） |
| `RELAY_HOST` | 无 | ECS 中转主机 |
| `RELAY_PORT` | `8091` | ECS 中转端口 |
| `RELAY_SCHEME` | `http` | ECS 中转协议 |
| `RELAY_TOKEN` | 无 | ECS 中转令牌 |
| `GC_ORPHAN_MINUTES` | `15` | 孤儿文件阈值 |
| `GC_STALE_RECORD_HOURS` | `24` | 失效登记阈值 |
| `SUBMIT_MAX_PER_DAY` | `6` | 每设备每日投稿上限 |
| `SUBMIT_MAX_PENDING` | `3` | 每设备待审核上限 |
| `SUBMIT_REQUIRE_SOURCE` | `true` | 是否要求提供来源 |
| `SIGN_PER_IP_PER_DAY` | `20` | 每 IP 每日签名限额 |
| `SIGN_GLOBAL_PER_DAY` | `3000` | 全局每日签名限额 |
| `SIGN_GLOBAL_BYTES_PER_DAY` | 未设置 | 全局每日签名流量上限（字节） |
| `PURGE_TOKEN` | 无 | 管理接口令牌 |
| `ALLOWED_ORIGIN` | `*` | CORS 允许来源 |

## 桌面端（Win10）

| 配置 | 位置 | 默认值 |
| --- | --- | --- |
| 站点地址 | `ShellConfig.SiteUrl` | `https://classsoftwarehub.us.ci` |
| 版本号 | `ShellConfig.ShellVersion` | `1.2.0-insider1.4` |
| 版本前缀 | `ShellConfig.VersionPrefix` | `dv` |
| 更新仓库 | `ShellConfig.UpdateRepoOwner` / `UpdateRepoName` | `c1201y` / `ClassSoftwareHub-Desktop` |
| 数据仓库 | `ShellConfig.SiteRepoOwner` / `SiteRepoName` / `SiteRepoBranch` | `c1201y` / `ClassSoftwareHub` / `main` |
| 数据目录 | `ShellConfig.SiteRepoDataDir` | `软件数据` |
| 内容清单 | `ShellConfig.ContentManifestUrl` | 主站 `/content/manifest.json` |
| 内置内容目录 | `ShellConfig.BundledContentDir` | 无（1.2.0 起取消） |
| 站点版本对齐 | `ShellConfig.SiteVersionTarget` / `SiteVersionDisplay` | `v2.3.4` / `v2.3.4 - Tangram (20260927PR01)` |
| 单实例互斥名 | `ShellConfig.MutexName` | `ClassSoftwareHub.Desktop.SingleInstance` |
| 唤醒事件名 | `ShellConfig.ActivateEventName` | `ClassSoftwareHub.Desktop.ActivateMainWindow` |
| 数据目录 | `AppPaths.DataDir` | `%LOCALAPPDATA%\ClassSoftwareHub` |
| 用户设置 | `settings.json` | 见「用户设置默认值」 |
| AI 密钥 | `hubai-key.bin` | DPAPI 加密 |

### 用户设置默认值（节选）

| 键 | 默认值 | 说明 |
| --- | --- | --- |
| `Backdrop` | `mica` | `mica` / `acrylic` / `solid`，不可用时自动降级 |
| `Theme` | `system` | 浅色 / 深色 / 跟随系统 |
| `CloseToTray` | `true` | 关闭窗口收进托盘 |
| `SidebarEnabled` | `true` | 启用工具侧边栏 |
| `SidebarEdge` | `right` | 侧边栏贴边位置 |
| `SidebarMode` | `dock` | `dock` 贴靠 / `free` 自由 |
| `SidebarModuleIds` | 抽号、计时、秒表、时钟 | 侧边栏模块与顺序 |
| `HubAiEnabled` | `true` | 启用 Hub AI |
| `HubAi.provider` | `deepseek` | AI 服务商 |
| `HubAi.baseUrl` | `https://api.deepseek.com/v1` | 接口地址 |
| `HubAi.model` | `deepseek-v4-flash` | 模型 |
| `UpdateChannel` | 由版本号推导 | `stable` / `insider` |
| `AutoCheckUpdate` | `true` | 启动时自动检查更新 |
| `LogRetentionDays` | `7` | 日志保留天数 |

## 桌面端（Windows 7）

| 配置 | 位置 | 默认值 |
| --- | --- | --- |
| 版本号 | `ShellConfig.ShellVersion` | `1.2.0-insider1.2` |
| 更新仓库 | `ShellConfig.UpdateRepoOwner` / `UpdateRepoName` | `c1201y` / `ClassSoftwareHub-windows7` |
| 数据仓库 | `ShellConfig.SiteRepoOwner` / `SiteRepoName` / `SiteRepoBranch` | `c1201y` / `ClassSoftwareHub` / `main` |
| 数据目录 | `ShellConfig.SiteRepoDataDir` | `软件数据` |
| 提交入口 | `ShellConfig.SubmitEndpoints`（历史值） | `https://cshapi.132614.xyz`、`https://submit.132614.xyz` |
| 提交超时 | `ShellConfig.SubmitTimeoutMs` | `10000` ms |
| 内容清单 | `ShellConfig.ContentManifestUrl` / `ContentManifestUrlFallback` | 主站 / 网盘 |
| 站点版本对齐 | `ShellConfig.SiteVersionTarget` / `SiteVersionDisplay` | `v2.3.4` / `v2.3.4 - Tangram (20260927PR01)` |
| 导航超时 | `ShellConfig.LoadTimeoutSeconds` | `25` s |
| 标题栏高度 | `ShellConfig.TitleBarHeight` | `48` |
| 单实例互斥名 | `ShellConfig.MutexName` | `ClassSoftwareHub.Desktop.SingleInstance` |
| 唤醒事件名 | `ShellConfig.ActivateEventName` | `ClassSoftwareHub.Desktop.ActivateMainWindow` |
| 数据目录 | `AppPaths.DataDir` | `%LOCALAPPDATA%\ClassSoftwareHub` |
| 排障开关 | 环境变量 `CSH_SIMULATE_WIN7=1` | 未设置 |

## 安装脚本

### Win10（`installer/ClassSoftwareHub.iss`）

| 配置 | 值 |
| --- | --- |
| 版本号 | `#define DesktopVersion`，与 `ShellVersion` 一字不差（不带 `dv`） |
| AppId | `{{7A2C4D18-9F31-4C6B-8E5A-2D0B7F4A1C93}` |
| 默认安装目录 | `{localappdata}\Programs\ClassSoftwareHub` |
| 权限要求 | `PrivilegesRequired=lowest` |
| 最低系统版本 | `MinVersion=6.1sp1`，实际 Windows 10 1809 检查由 `[Code]` 完成 |
| 允许架构 | `ArchitecturesAllowed=x64compatible` |
| 输出文件名 | `ClassSoftwareHub-Setup-dv{#DesktopVersion}.exe` |
| WebView2 | 可选，缺失时引导安装 |
| 进程处理 | 不设 `AppMutex`，由 `PrepareToInstall` 先礼貌结束再强杀 |

### Windows 7（`installer/ClassSoftwareHub-Win7.iss`）

| 配置 | 值 |
| --- | --- |
| 版本号 | `#define DesktopVersion` |
| AppId | `{{C4E7B2A1-6D38-4F5C-9A17-0E8B3D5C7F42}` |
| 默认安装目录 | `{localappdata}\Programs\ClassSoftwareHub-Win7` |
| 权限要求 | `PrivilegesRequired=lowest` |
| 最低系统版本 | `MinVersion=6.1sp1` |
| 允许架构 | `ArchitecturesAllowed=x64compatible` |
| 压缩 | `lzma2/max` + `SolidCompression` |
| 输出文件名 | `ClassSoftwareHub-Setup-win7-dv{#DesktopVersion}.exe` |

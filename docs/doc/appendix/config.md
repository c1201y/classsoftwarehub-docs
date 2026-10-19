---
title: 配置项清单
createTime: 2026/10/19 20:00:00
---

> 网页端源码常量、构建配置与 Windows 7 兼容版外壳常量

## 网页端

| 配置 | 位置 | 类型 |
| --- | --- | --- |
| 中文 UI 文案 | `文字设置.ts` | 源码常量 |
| 英文 UI 文案 | `src/gallery/Strings/en-US/Resources.ts` | 源码常量 |
| 致谢列表 | `鸣谢文本.ts` | 源码常量 |
| AI 导航站点 | `AI导航文本.ts` | 源码常量 |
| 软件数据 | `软件数据/apps/*.json` | 数据文件 |
| 分类 | `软件数据/categories.json` | 数据文件 |
| 忽略 / 跳过记录 | `软件数据/update-ignore.json` | 数据文件 |
| 回声洞消息 | `回声洞/messages/message<N>.json` | 数据文件 |
| 镜像通道 | `src/gallery/githubMirror.ts` 的 `MIRROR_CHANNELS` | 源码常量 |
| 提交入口 | `src/gallery/submitEndpoints.ts` | 源码常量 |
| 构建 base | `vite.config.ts` 的 `base: './'` | 构建配置 |
| 单文件开关 | 环境变量 `SINGLEFILE=1` | 构建环境变量 |
| 开发服务器 | `vite.config.ts`：host `0.0.0.0`、port 5173、`usePolling: true`、interval 400 | 构建配置 |
| CI Secrets | `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD` / `WEBDAV_USERNAME` / `WEBDAV_PASSWORD` | 仓库 Secret |
| 本地令牌 | `GITHUB_TOKEN` | 环境变量 |

## Windows 7 兼容版

| 配置 | 位置 | 默认值 |
| --- | --- | --- |
| 站点地址 | `ShellConfig.SiteUrl` | `https://classsoftwarehub.us.ci` |
| 版本号 | `ShellConfig.ShellVersion` | `1.2.0-insider1.0` |
| 版本前缀 | `ShellConfig.VersionPrefix` | `dv` |
| 更新仓库 | `ShellConfig.UpdateRepoOwner` / `UpdateRepoName` | `c1201y` / `ClassSoftwareHub-windows7` |
| tag 前缀 | `ShellConfig.UpdateTagPrefix` | `""` |
| 更新令牌 | `ShellConfig.UpdateToken` | `""` |
| 默认更新通道 | `ShellConfig.DefaultUpdateChannel` | 由 `IsInsider` 推导 |
| 数据仓库 | `ShellConfig.SiteRepoOwner` / `SiteRepoName` / `SiteRepoBranch` | `c1201y` / `ClassSoftwareHub` / `main` |
| 数据目录 | `ShellConfig.SiteRepoDataDir` | `软件数据` |
| 提交入口 | `ShellConfig.SubmitEndpoints` | `https://cshapi.132614.xyz`、`https://submit.132614.xyz` |
| 提交超时 | `ShellConfig.SubmitTimeoutMs` | `10000` ms |
| 内容清单 | `ShellConfig.ContentManifestUrl` / `ContentManifestUrlFallback` | 主站 / 网盘 |
| 站点版本对齐 | `ShellConfig.SiteVersionTarget` / `SiteVersionDisplay` | `v2.3.4` / `v2.3.4 - Tangram (20260927PR01)` |
| 导航超时 | `ShellConfig.LoadTimeoutSeconds` | `25` s |
| 标题栏高度 | `ShellConfig.TitleBarHeight` | `48` |
| 单实例互斥名 | `ShellConfig.MutexName` | `ClassSoftwareHub.Desktop.SingleInstance` |
| 唤醒事件名 | `ShellConfig.ActivateEventName` | `ClassSoftwareHub.Desktop.ActivateMainWindow` |
| WebView2 下载页 | `ShellConfig.WebView2DownloadUrl` | 官方下载页 |
| 数据目录 | `AppPaths.DataDir` | `%LOCALAPPDATA%\ClassSoftwareHub` |
| 用户设置 | `%LOCALAPPDATA%\ClassSoftwareHub\settings.json` | 见开发文档「配置说明」 |
| 排障开关 | 环境变量 `CSH_SIMULATE_WIN7=1` | 未设置 |

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

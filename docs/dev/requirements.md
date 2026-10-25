---
title: 环境要求
createTime: 2026/10/19 20:00:00
---

> Node.js、.NET SDK、Windows 平台组件、打包工具与后端运行环境

## 网页端

| 项目 | 要求 | 依据 |
| --- | --- | --- |
| Node.js | `^20.19.0` 或 `>=22.12.0` | `package.json:36-38` |
| 包管理器 | npm（CI 使用 `npm ci`） | `.github/workflows/deploy.yml:40` |
| 构建工具 | Vite 8 | `package.json:33` |
| 类型检查 | vue-tsc 3.2.6 + TypeScript ~6.0 | `package.json:31,34` |
| Python | 运行 `scripts/icon-sync.py` 与 `scripts/upload-webdav.py` 需要 Python 3 + Pillow | 脚本源码 |
| 后端 | 无需自建；开发时调用线上 `https://api.classsoftwarehub.cn` | `src/gallery/submitEndpoints.ts` |

## 桌面端（Win10）

| 项目 | 要求 | 依据 |
| --- | --- | --- |
| 系统 | Windows 10 1809 及以上（x64） | `installer/ClassSoftwareHub.iss` |
| IDE | Visual Studio 2022 或更新，安装 .NET 桌面开发与 Windows App SDK 组件 | `BUILDING.md:7` |
| .NET SDK | 10.0 | `ClassSoftwareHub.Desktop.csproj` |
| 目标框架 | `net10.0-windows10.0.26100.0`，RID `win-x64` | `ClassSoftwareHub.Desktop.csproj` |
| Windows App SDK | 2.5.1 | `ClassSoftwareHub.Desktop.csproj` |
| 安装包 | Inno Setup 6（默认装在 `%LOCALAPPDATA%\Programs\Inno Setup 6\`） | `BUILDING.md:24-25` |
| 发版脚本 | Node.js（运行 `tools/publish-release.mjs`） | `BUILDING.md:63-70` |
| 目标机 .NET 运行时 | **不需要**。应用为自包含发布 | `BUILDING.md:21-22` |
| 目标机 WebView2 运行时 | 可选；缺失时安装程序会引导安装 | `installer/ClassSoftwareHub.iss` |

## Windows 7 兼容版

| 项目 | 要求 | 依据 |
| --- | --- | --- |
| .NET SDK | 6.0（`dotnet --version` 应为 6.x） | `BUILDING.md:7` |
| 目标框架 | `net6.0-windows7.0`，RID `win-x64` | `src/ClassSoftwareHub.Win7.csproj:20,27` |
| 构建平台 | Windows x64 | `BUILDING.md:8` |
| 安装包 | Inno Setup 6 | `BUILDING.md:9` |
| C# 语言版本 | 10（.NET 6 SDK 上限） | `src/ClassSoftwareHub.Win7.csproj:31` |
| 发版脚本 | Node.js（运行 `tools/publish-release-win7.mjs`） | `BUILDING.md:89` |
| 目标机 .NET 运行时 | **不需要**。应用为自包含发布 | `installer/ClassSoftwareHub-Win7.iss:107` |
| 目标机 WebView2 运行时 | 可选，最高 109.0.1518.x | `src/PORTING.md:198-200` |
| 目标机系统 | Windows 7 SP1 及以上（x64） | `installer/ClassSoftwareHub-Win7.iss:190-193` |

### 不得升级的依赖

| 组件 | 锁定版本 | 原因 |
| --- | --- | --- |
| .NET | 6.0 | 最后一个官方支持 Windows 7 的 .NET 版本 |
| Avalonia | 11.2.8 | 支持 `net6.0`；12.x baseline 更高，Win7 / D3D11 上跑不了 |
| FluentAvaloniaUI | 2.4.1 | 支持 `net6.0`；2.5+ 依赖 `net10` |
| WebView2 SDK | ≤ 1.0.1587 | Win7 上 WebView2 运行时止于 109.0.1518.x |

依据：`README.md:54-62`、`src/ClassSoftwareHub.Win7.csproj:3-15`。

## 后端（csh-api）

| 项目 | 要求 |
| --- | --- |
| 运行环境 | 腾讯 EdgeOne Pages（Functions，V8 隔离环境） |
| 语言 | JavaScript（ES Modules）；平台不提供 Node.js 完整 API |
| 状态存储 | EdgeOne Blob / KV（由平台注入） |
| 对象存储 | 阿里云 OSS，私有桶；需 AccessKey 与 V4 签名权限 |
| 下载中继 | 自建 ECS，Node 服务监听 `8091`，能访问 OSS 内网 |
| 本地开发 | Node.js 22+（仅用于 `smoke.mjs` / `smoke-blob.mjs` 冒烟与静态检查） |
| 部署 | EdgeOne Pages 控制台或关联仓库自动部署；无本地构建产物 |
| 环境变量 | 见[配置项清单](../doc/appendix/config.md) |

## 数据库

项目**无关系型数据库**。软件数据为 JSON 文件并随 git 版本控制；后端票据、登记与公告写入 EdgeOne 状态存储；文件写入 OSS。桌面端「数据同步」只是把 JSON 拉到本地缓存目录，不涉及 schema 迁移。

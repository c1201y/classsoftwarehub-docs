---
title: 环境要求
createTime: 2026/10/19 20:00:00
---

> Node.js、包管理器、运行时、数据库、系统依赖与 Windows 7 特殊依赖

## 网页端

| 项目 | 要求 | 依据 |
| --- | --- | --- |
| Node.js | `^20.19.0` 或 `>=22.12.0` | `package.json:36-38` |
| 包管理器 | npm（CI 使用 `npm ci`） | `.github/workflows/deploy.yml:40` |
| 构建工具 | Vite 8 | `package.json:33` |
| 类型检查 | vue-tsc 3.2.6 + TypeScript ~6.0 | `package.json:31,34` |
| Python | 运行 `scripts/icon-sync.py` 与 `scripts/upload-webdav.py` 需要 Python 3 + Pillow | `AGENTS.md:211-218` |
| 后端 | 无 | `AGENTS.md:18` |

## Windows 7 兼容版

| 项目 | 要求 | 依据 |
| --- | --- | --- |
| .NET SDK | 6.0（`dotnet --version` 应为 6.x） | `BUILDING.md:7` |
| 目标框架 | `net6.0-windows7.0`，RID `win-x64` | `src/ClassSoftwareHub.Win7.csproj:19,26` |
| 构建平台 | Windows x64 | `BUILDING.md:8` |
| 安装包 | Inno Setup 6 | `BUILDING.md:9` |
| C# 语言版本 | 10（.NET 6 SDK 上限） | `src/ClassSoftwareHub.Win7.csproj:30` |
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

## 桌面端（WinUI 3 原版）

| 项目 | 要求 | 依据 |
| --- | --- | --- |
| 系统 | Windows 10 1809 及以上 | `installer/ClassSoftwareHub-Win7.iss:16-17`、`src/PORTING.md:12` |
| 技术栈 | .NET 10 + Windows App SDK 2.5 | `src/PORTING.md:12` |

其余环境要求待确认（需 `ClassSoftwareHub-Desktop` 仓库）。

## 数据库

本项目**无数据库**。全部数据为 JSON 文件，随 git 版本控制。「迁移」通过编辑 JSON 文件并提交完成。桌面端的「数据同步」是从 GitHub 仓库拉取 JSON 到本地缓存目录，不涉及 schema 迁移。

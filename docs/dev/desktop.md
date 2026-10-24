---
title: 桌面端（Win10）开发说明
createTime: 2026/10/24 10:00:00
---

> WinUI 3 单进程架构、页面与服务、内容同步、下载、更新、Hub AI 与系统集成

## 技术栈与运行形态

| 项目 | 值 |
| --- | --- |
| 框架 | WinUI 3 + Windows App SDK 2.5.1 |
| 运行时 | .NET 10（`net10.0-windows10.0.26100.0`） |
| 发布 | 自包含、`win-x64`、不裁剪 |
| 进程模型 | **单进程**：主窗口、工具浮窗、侧边栏、截屏编辑器都在同一进程内 |
| 安装 | Inno Setup 6，当前用户安装到 `%LOCALAPPDATA%\Programs\ClassSoftwareHub` |
| 系统底线 | Windows 10 1809（build 17763） |

与 Electron 不同，本应用没有主进程 / 渲染进程之分，也没有 IPC 通道。所有 UI 都是 XAML，网页内容通过 WebView2 以控件形式嵌入。

## 后端入口

新后端为 `https://api.classsoftwarehub.cn`（`c1201y/csh-api`，EdgeOne Pages Functions）。当前本版 `Core/ShellConfig.cs` 的 `SubmitEndpoints` 仍是 `cshapi.132614.xyz` / `submit.132614.xyz` 两个旧域常量，属于迁移遗留，做切换时只需把端点列表改为新域；`Services/MirrorSign.cs` 的首选自建节点已是 `download.classsoftwarehub.cn`，旧域仅留在降级列表里。

## 启动与单实例

`App.xaml.cs` 负责：

1. **单实例判定**：构造阶段抢占命名互斥体 `ClassSoftwareHub.Desktop.SingleInstance`。
2. **唤醒已有实例**：第二个实例打开命名事件 `ClassSoftwareHub.Desktop.ActivateMainWindow`，让第一个实例显示主窗口，然后自行退出。
3. **命令行**：`--minimized` 启动时不显示主窗口；`--palette` 以工具浮窗形态启动。
4. **加载设置与内容**：读取 `settings.json`，触发内容同步。
5. **托盘与退出**：默认关闭窗口收进托盘；「应用正在退出」标记确保浮窗不会拦截退出流程。

::: warning 互斥名不可随意改
互斥体与唤醒事件名属于跨进程契约，改动会导致旧版本无法被新版本唤醒，也会影响安装器识别运行中实例。
:::

## 页面与导航

主窗口使用 `NavigationView` 承载 `ShellPage`，页面位于 `Pages/`：

| 分组 | 页面 |
| --- | --- |
| 软件 | `SoftwarePage`（列表 / 分类）、`DetailPage`、`DownloadsPage` |
| 工具 | `ToolsPage`、工具页共 10 个（`Pages/Tools/*` 8 个，另有根目录的 `FunctionPlotPage`、`AutoShutdownPage`） |
| AI | `HubAiPage`、`HubAiSettingsPage` |
| 系统 | `StartupPage`、`SystemRepairPage`、`UninstallPage`、`AppDataPage`、`AutoShutdownPage`、`ProcessGuardPage`、`EasiNoteGuardPage`、`MachineCheckPage`、`ExperimentalPage` |
| 其他 | `SettingsPage`、`ChangelogPage`、`LogViewerPage`、`SubmitPage`、`FeedbackPage` |

`Views/` 存放独立窗口：工具浮窗、工具侧边栏、截屏编辑器等。侧边栏支持贴靠（左右）与自由（四边）、双栏、模块勾选与排序。

## 服务层

| 领域 | 主要文件 | 说明 |
| --- | --- | --- |
| 内容同步 | `GithubContentSync.cs`、`ContentUpdater.cs` | GitHub 仓库直读，sha 未变则跳过 |
| 数据加载 | `Core/ContentStore.cs` | 容错解析，坏文件跳过并记 `DataIssue` |
| 下载选路 | `GithubRoute.cs`、`MirrorSign.cs` | 自建加速 / GitHub 直连探测与缓存 |
| 下载 | `DownloadService.cs`、`DownloadManager.cs` | 分片、并发、重试、进度 |
| 更新 | `Services/Updating/*` | 双通道、校验、静默安装、历史回滚 |
| 设置 | `SettingsStore.cs` | `settings.json`，即时落盘 |
| AI | `Services/HubAi/*` | 多提供方、会话、工具调用、DPAPI 密钥 |
| 日志 | `Core/AppLog.cs`、`LogHome.cs`、`LogReader.cs` | 每次启动一个目录 |
| 系统集成 | `StartupItems.cs`、`SystemRepair.cs`、`AppUninstaller.cs`、`AppDataScan.cs`、`AutoShutdown.cs` | 启动项、修复、卸载残留、应用数据、定时关机 |
| 截屏 | `ScreenCapture.cs`、`Views/*` | `Windows.Graphics.Capture` + 编辑器 |
| 托盘 | `TrayIcon.cs` | 托盘菜单与显示 / 退出 |

## 内容同步

算法与 Win7 版一致：

1. 请求分支头 commit sha（1 次 API 调用）。
2. sha 未变 → 直接结束。
3. sha 变化 → 列出 `软件数据/` 下的 JSON，逐个从 raw / jsDelivr / gh-proxy 拉取。
4. 落地到 `%LOCALAPPDATA%\ClassSoftwareHub\content\`。
5. 上游已删除的文件同步删除；若目录列表疑似被截断（`truncated`），跳过删除以免误伤。
6. 成功入口记入 `content-base.txt`，下次优先使用。

Debug 构建读开发目录优先，Release 读缓存优先；**没有「安装包自带」这一档**。

## 下载与加速

`GithubRoute` 维护候选入口（`auto` / `selfhosted` / `github`），对候选做 Range 探测并缓存 8 分钟。`DownloadService` 对 ≥ 8 MB 的文件分片下载：目标分片 16 MB、最多 8 路、每路 3 次重试、每主机 16 连接；不支持跨重启续传。加速签名失败有 5 分钟冷却，期间直接走直连或公共镜像。

## 更新

`UpdateService` 编排「查 → 下 → 校验 → 装」：

- 更新源抽象为 `IUpdateSource`，默认 `GitHubReleaseSource`。
- 正式版只读非预发布 Release；预览版读预发布 + 非预发布。
- 校验值必须存在：发布方既无 `.md5` 资产、接口也无 SHA256 时抛 `MissingChecksumException`；不匹配抛 `ChecksumMismatchException`。
- 安装为静默安装；历史版本列表按当前通道过滤，回滚不校验版本高低。

## Hub AI

| 组件 | 职责 |
| --- | --- |
| `AiProvider.cs` | 提供方定义、默认 Base URL、模型与思考样式 |
| `AiClient.cs` | OpenAI 兼容 HTTP 调用与流式解析 |
| `AiChatService.cs` | 会话编排，最多 5 轮工具调用、20 条历史消息 |
| `SecretStore.cs` | DPAPI 加密读写 `hubai-key.bin` |
| `BuiltinTools.cs` / `ToolRunner.cs` | 内置工具与受控执行 |
| `WebTools.cs` | 联网检索类工具 |
| `ToolPack.cs` / `ToolPackInstaller.cs` | 工具包与安装 |

支持的提供方：DeepSeek（默认）、通义千问、Kimi、智谱、MiniMax、OpenAI、本地（Ollama / LM Studio）、自定义 OpenAI 兼容接口。密钥只存本机，不进入设置同步、不写日志。

## 系统集成与权限

- 常规功能为普通用户权限。
- 「所有用户」级启动项、系统修复命令、卸载残留清理需要管理员权限，通过 `runas` 启动提权助手执行，结果写回文件后助手退出。
- 应用数据页只读扫描 `%APPDATA%` / `%LOCALAPPDATA%`，删除前二次确认。
- 机器体检为实验性功能，采集硬件与系统信息，不上传。

## 数据目录

| 内容 | 位置 |
| --- | --- |
| 设置 | `%LOCALAPPDATA%\ClassSoftwareHub\settings.json` |
| 内容缓存 | `%LOCALAPPDATA%\ClassSoftwareHub\content\` |
| 日志 | `%LOCALAPPDATA%\ClassSoftwareHub\logs\{启动时间}\` |
| AI 密钥 | `%LOCALAPPDATA%\ClassSoftwareHub\hubai-key.bin` |
| WebView2 | `%LOCALAPPDATA%\ClassSoftwareHub\WebView2\` |
| 内容源记忆 | `%LOCALAPPDATA%\ClassSoftwareHub\content-base.txt` |

## 构建与发版

见[构建、运行与测试](./build.md#桌面端-win10)。发版时 `ShellVersion`、`.csproj` 版本、`.iss` 的 `DesktopVersion` 与 git tag 四处一致；安装包文件名必须含 `Setup`，否则更新器不识别。

## 与 Windows 7 兼容版的关系

Win7 版以本版为功能基准，在 Avalonia 上做「语义等价、UI 1:1」移植。改动共享行为（内容同步、下载、更新协议、数据模型）时应同时检查 Win7 仓库；平台差异见 [Windows 7 兼容开发说明](./win7.md)。

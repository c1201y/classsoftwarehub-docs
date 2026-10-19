---
title: 桌面端开发说明
createTime: 2026/10/19 20:00:00
---

> 主进程 / 渲染进程、IPC、预加载脚本、本地存储、权限、打包、签名、安装器与自动更新

::: info 本章范围
本章以 Windows 7 兼容版的实际代码为依据，该实现为**单进程桌面应用**（Avalonia 无主进程 / 渲染进程之分）。WinUI 3 原版采用不同的架构，其具体实现待确认。
:::

## 应用结构

| 层 | 组成 | 职责 |
| --- | --- | --- |
| 入口 | `src/Program.cs` | 命令行开关解析、Win7 渲染决策 |
| 应用对象 | `src/App.axaml.cs` | 单实例判定（构造函数中）、生命周期、设置与内容加载、提权助手模式接管 |
| 主窗口 | `src/MainWindow.axaml.cs` | 主界面外壳、导航 |
| 平台抽象 | `src/Platform/` | 版本判定、P/Invoke、背景降级、主题兼容、页面基类 |
| 服务层 | `src/Services/` | 更新、内容同步、设置、日志、提交、下载、截屏、托盘及各项业务服务 |
| 页面与窗口 | `src/Pages/`、`src/Views/` | 各页面与独立窗口 |

## 单实例与唤醒机制

单实例判定放在 `App` 构造函数中（与 WinUI 原版同刻，能立刻抢互斥体；放到 `Main` 会导致 Avalonia 未起来就抢互斥体，托盘恢复路径拿不到主窗口）（`src/App.axaml.cs:18-26`）。

互斥体名 `ClassSoftwareHub.Desktop.SingleInstance` 与唤醒事件名 `ClassSoftwareHub.Desktop.ActivateMainWindow` **必须与安装包 `AppMutex` 一字不差**，否则升级时会提示「程序正在运行」（`src/App.axaml.cs:26`、`src/Core/ShellConfig.cs:137,148`）。

唤醒机制的存在原因：默认关闭窗口是收进托盘（`CloseToTray` 默认 true），进程并未退出。此时用户再点桌面图标，第二个实例被互斥体拦下。2026-09-30 之前的实现是直接 `Environment.Exit(0)`，用户完全无感知；现在第二个实例先敲命名事件让第一个实例亮出主窗口，然后自己才退（`src/Core/ShellConfig.cs:139-148`）。

## 提权助手模式

「应用卸载」清残留、「系统修复」执行命令、「所有用户」级开机启动项均需管理员权限。做法是普通权限先跑一遍，仅提权部分用 `runas` 起一个本程序的助手进程，助手按传入清单干完活、写结果文件、立刻退出。该逻辑必须放在**最前面**（在 `InitializeComponent` / 单实例 / 主窗口之前），否则助手进程会因单实例判定去唤醒非提权实例或弹出主窗口（`src/App.axaml.cs:69-110`）。

## 本地存储

| 路径 | 内容 | 管理类 |
| --- | --- | --- |
| `%LOCALAPPDATA%\ClassSoftwareHub\settings.json` | 用户设置 | `SettingsStore` |
| `%LOCALAPPDATA%\ClassSoftwareHub\content\` | 同步下来的软件数据 | `ContentStore`（优先读）、`GithubContentSync` / `ContentUpdater`（写入） |
| `%LOCALAPPDATA%\ClassSoftwareHub\logs\{启动时间}\` | 会话日志（`app.log` + `crash.log`） | `LogHome` |
| `%LOCALAPPDATA%\ClassSoftwareHub\WebView2\` | WebView2 用户数据 | `WebViewRuntimeService` |
| `%LOCALAPPDATA%\ClassSoftwareHub\submit-endpoint.txt` | 上次可用的提交入口 | `ShellConfig.RememberSubmitEndpoint` |
| `%LOCALAPPDATA%\ClassSoftwareHub\content-base.txt` | 上次成功的 GitHub 内容入口 | `GithubContentSync` |

内容缓存与日志的关键差别：**日志不复用目录**（每次启动必须是新目录，复用等于两次运行混在一起）；缓存则是同一版本反复启动复用一个目录（`src/Services/LogHome.cs:35-37`）。

## 权限模型

| 操作 | 权限 |
| --- | --- |
| 常规浏览、下载、工具使用 | 普通用户权限（安装版 `PrivilegesRequired=lowest`，装入 `%LOCALAPPDATA%`） |
| 卸载残留清理 | 提权助手（`runas`） |
| 系统修复执行命令 | 提权助手（`runas`） |
| 「所有用户」级开机启动项 | 提权助手（状态位在 HKLM） |
| 注册表读写 | `Microsoft.Win32.Registry` 在 `net6.0-windows` 上可用，可直译（`src/PORTING.md:206`） |

日志与缓存的删除操作有严格安全边界：只认匹配命名格式的目录、只在自家目录内动手、删除前再次校验路径、当前会话目录任何情况下不删、每步异常都落日志且禁止空 catch（`src/Services/LogHome.cs:39-43`）。

## 日志规范

统一入口为 `Core.AppLog`，提供 `Debug` / `Info` / `Warning` / `Error` 四级，以及「操作链路」记账 `Begin` / `Step` / `Done` / `Fail` 与统一的异常出口 `AppLog.Exception(module, ex, context)`。

行格式：`[时间] [级别] [模块] 消息`。模块名从「文件名」挪到「行内标签」。

级别分工：主干步骤用「信息」（默认可见）；高频读数（如内存回收）用「调试」；真正的岔子用「警告」/「错误」，**全量记、不节流**（`src/Core/AppLog.cs:76-81`）。

模块名必须实事求是：缓存、日志、旧结构清理各自写自己的模块名，不要图省事走 `ScreenCapture.Log`（那会把模块名标成 `snip`）（`src/Core/AppLog.cs:37-41`）。

该规范的建立背景：审计发现 17 个会话中警告 0 条、错误 0 条；全仓库 724 个 catch 中 269 个是空 `catch {}`，而记日志的调用点只有 15 个，约 98% 的异常路径是静默的（`src/Core/AppLog.cs:64-76`）。

## 打包

产物为「启动器 + `app\` 子目录」两层结构：

```
ClassSoftwareHub.exe      ← 启动器（src/Launcher，自包含 + 裁剪 + 单文件，约 9 MB）
app\                      ← 应用本体（publish 产物，含 content\ 与 ContentIcons\）
使用说明.txt              ← 便携版才有
```

好处：以后更新只换 `app\` 子目录，启动器不动，桌面快捷方式路径永远有效（`BUILDING.md:22-32`）。

启动器职责单一：把 `app\ClassSoftwareHub.exe` 拉起并原样转发命令行参数，不常驻、不做单实例判断、不等待子进程退出。单文件发布时 `AppContext.BaseDirectory` 给出的是 exe 所在目录（非解压临时目录），正是「启动器在哪儿，`app\` 就在哪儿找」的依据。若有人把应用本体平铺在启动器旁（无 `app\` 子目录），启动器也会照常启动（`src/Launcher/Program.cs:9-13,35-52`）。

使用说明.txt 写成**带 BOM 的 UTF-8**：Windows 7 记事本对无 BOM 的 UTF-8 按 ANSI 解，中文会变乱码（`tools/pack-win7-portable.ps1:105-107`）。

## 签名

安装包**未配置代码签名**。Inno Setup 脚本 `[Setup]` 段无 `SignTool` 项（`installer/ClassSoftwareHub-Win7.iss:32-57`）。完整性保障通过每个安装包附带同名 `.md5` 实现（`README.md:52`），由发版脚本 `tools/publish-release-win7.mjs` 生成上传。是否需要引入 Authenticode 签名待确认。

## 安装器

安装脚本 `installer/ClassSoftwareHub-Win7.iss` 的关键设计：

| 项 | 值 / 行为 |
| --- | --- |
| `AppId` | `{{C4E7B2A1-6D38-4F5C-9A17-0E8B3D5C7F42}`，**刻意与 WinUI 版不同**（两版是不同产品线，不能互认） |
| `DefaultDirName` | `{localappdata}\Programs\ClassSoftwareHub-Win7` |
| `PrivilegesRequired` | `lowest` |
| `MinVersion` | `6.1sp1`（故意留 6.1，系统版本由 `[Code]` 自己判，以便不够格时提供「打开网页版」按钮） |
| `ArchitecturesAllowed` | `x64compatible` |
| `Compression` | `lzma2/max` + `SolidCompression` |
| 许可文件 | `Legal.rtf`（RTF 而非 txt：Inno 纯文本许可不自动换行，中文按字符算宽度更糟） |
| 语言 | 中文 + 英文 |
| 桌面图标任务 | 首次安装默认勾选；升级时按现状保留 |
| `[Run]` | 装完自动拉起应用 |

**关闭运行中实例的策略**：故意不设 `AppMutex`（Inno 一启动就查 Mutex，查到应用在跑就直接拒装，而那个框会被 `/SUPPRESSMSGBOXES` 自动按「取消」，静默更新变成「什么都没发生」）；也不能指望 `/CLOSEAPPLICATIONS`（它走 Restart Manager 发 `WM_CLOSE`，而本应用把 `WM_CLOSE` 吞去收托盘了）。因此改由 `[Code]` 的 `PrepareToInstall` 自己 `taskkill`：先不带 `/F` 礼貌请一次，还不退就强杀（`installer/ClassSoftwareHub-Win7.iss:71-73,126-166`）。

**静默安装与许可页**：静默安装（`/SP- /SILENT`）会跳过许可页并视为已接受，升级流程不被打断（`installer/ClassSoftwareHub-Win7.iss:68-69`）。

**条款同步**：安装页展示的三份条款（用户协议 / 隐私政策 / 免责声明）由 `tools/sync-legal.mjs` 从站点仓库根目录 `法律文本.ts` 生成，与桌面端设置页「条款与声明」同源。**要改条款：改站点那份 TS，再跑 `node tools/sync-legal.mjs`；不要手改 `Legal.rtf`**（`installer/ClassSoftwareHub-Win7.iss:59-63`）。

## 自动更新

更新流程为「查 → 下 → 校验 → 装」，由 `Services.Updating.UpdateService` 编排，「从哪儿拿」由 `IUpdateSource` 抽象（默认实现 `GitHubReleaseSource`）。

**双通道**：

| 通道 | 版本号特征 | Release 范围 |
| --- | --- | --- |
| 正式版（stable） | 不含 `insider` | 只看非预发布（Latest） |
| 预览版（insider） | 含 `insider` | 预发布 + 非预发布 |

通道由 `ShellVersion` 是否含 `insider` 决定默认值（`ShellConfig.DefaultUpdateChannel`），用户可在设置页修改，改后按 `settings.json` 存储的值。

**发版命名约定**（`src/Core/ShellConfig.cs:62-71`）：

| 项 | 正式版 | 预览版 |
| --- | --- | --- |
| tag | `dv1.0.0` | `dv1.0.0-insider1.4`（发布时勾 Pre-release） |
| 资产 | `ClassSoftwareHub-Setup-<tag>.exe` + 同名 `.md5` | 同 |
| 正文 | 原样显示在更新对话框 | 同 |

**校验强制**：界面承诺「校验通过后方可安装」。发布方未提供任何可用校验值（既无 `.md5` 资产，接口也未返回 SHA256）时抛出 `MissingChecksumException` 并中止更新，**绝不允许执行未校验的安装包**。校验不通过抛 `ChecksumMismatchException`，附带算法、期望值、实际值与处置建议（`src/Services/Updating/UpdateService.cs:16-49`）。

**回滚**：`GetHistoryAsync` 按用户所在通道过滤，回滚不校验版本高低，用户点哪个装哪个（`src/Services/Updating/UpdateService.cs:128-148`）。

**安装包识别**：更新器按「文件名里含 `setup`」认安装包。便携包 zip 名字必须含 `portable`，否则会被误当成安装包去静默安装（`tools/pack-win7-portable.ps1:19-21`）。

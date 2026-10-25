---
title: 技术栈与目录结构
createTime: 2026/10/19 20:00:00
---

> 逐仓库说明目录职责、核心模块、入口文件与关键配置

## 网页端（ClassSoftwareHub）

**技术栈**：Vue 3.5 + Vue Router 4（hash 路由）+ Vite 8 + TypeScript ~6.0；UI 组件库 WinUIonWeb（上游源码内置于 `src/components`、`src/styles`、`src/utils`）；静态部署，动态能力调用 `csh-api`（`package.json`）。

**Node 版本要求**：`^20.19.0 || >=22.12.0`（`package.json:36-38`）。

```
ClassSoftwareHub/
├── 文字设置.ts                ★ 中文 UI 文案的主要修改点
├── 法律文本.ts                 用户协议 / 隐私政策 / 免责声明
├── 鸣谢文本.ts                 设置页致谢列表
├── AI导航文本.ts               AI 导航站点配置
├── index.html                 入口 HTML（异步注入百度统计）
├── vite.config.ts             base:'./'、ASCII chunk 名、dev 轮询
├── package.json               脚本与依赖
├── 软件数据/
│   ├── apps/*.json            一软件一文件（另含 `_模板.json`）
│   ├── categories.json        6 个分类
│   ├── platforms.json         6 个平台与版本范围
│   ├── update-ignore.json     更新检查的忽略与跳过记录
│   └── README-维护手册.md      ★ 数据维护手册
├── 回声洞/messages/*.json     构建期 import.meta.glob 收集
├── submissions/               访客提交草稿（勿手工编辑）
├── public/                    robots.txt · sitemap.xml · favicon.ico 等
├── scripts/                   维护脚本（见附录脚本清单）
├── src/
│   ├── main.ts                挂载入口
│   ├── gallery/               ★ 本站应用代码（唯一应改动代码的位置）
│   │   ├── App.vue           外壳：导航窗格 / 主题 / 节日皮肤 / 欢迎弹窗 / 数据错误条
│   │   ├── router.ts         12 条路由记录（10 条命名路由 + 2 条重定向）
│   │   ├── pages/            HomePage / DownloadDetailPage / SettingsPage /
│   │   │                     SubmitPage / FeedbackPage / AiNavPage / EchoCavePage / AgreementPage
│   │   ├── tools/            ★ 内置工具：index.ts 注册表 + ToolShell.vue + 一工具一 .vue
│   │   ├── data/index.ts     数据加载器（容错解析，勿改）
│   │   ├── appIcons.ts       图标解析：优先本地 64px，回退 icon URL
│   │   ├── searchIndex.ts    全站搜索索引
│   │   ├── GlobalSearch.vue  Ctrl+K 搜索面板
│   │   ├── feedback.ts       反馈中心纯逻辑（无 Vue 依赖）
│   │   ├── githubImport.ts   从 GitHub 一键读取
│   │   ├── githubMirror.ts   加速下载镜像通道与签名
│   │   ├── ossUpload.ts      OSS 直传
│   │   ├── ossDownload.ts    票据换下载
│   │   ├── desktopDownload.ts 桌面端 Release 查询
│   │   ├── deviceFingerprint.ts  设备指纹
│   │   ├── submitEndpoints.ts    后端入口
│   │   ├── visitor.ts        自建访问统计 + 百度统计 SPA 回放
│   │   ├── holidayTheme.ts   节日皮肤
│   │   ├── Strings/en-US/    英文站文案
│   │   └── styles/           首页 / 详情页样式
│   ├── components/ styles/ utils/ assets/   ⛔ WinUIonWeb 上游源码
│   └── assets/               站点自有资源（icons/ · holiday/ · Fonts/ · AppIcon-* · feedback/）
├── dist/                     构建产物（勿提交）
└── .github/workflows/         6 个工作流
```

**入口链**：`index.html` → `src/main.ts` → `src/gallery/App.vue`（外壳）→ `src/gallery/router.ts`（路由）。

**路由表**（`src/gallery/router.ts`）：

| 路径 | 名称 | 组件 |
| --- | --- | --- |
| `/` | — | 重定向 `/home` |
| `/home` | `home` | `pages/HomePage.vue` |
| `/download/:id` | `download-detail` | `pages/DownloadDetailPage.vue` |
| `/settings` | `settings` | `pages/SettingsPage.vue` |
| `/agreement` | `agreement` | `pages/AgreementPage.vue` |
| `/echo-cave` | `echo-cave` | `pages/EchoCavePage.vue` |
| `/submit` | `submit` | `pages/SubmitPage.vue` |
| `/feedback` | `feedback` | `pages/FeedbackPage.vue` |
| `/ai` | `ai` | `pages/AiNavPage.vue` |
| `/tools` | `tools` | `tools/ToolsPage.vue` |
| `/tools/<id>` | `tool-<id>` | 由 `tools/index.ts` 注册表自动生成 |
| `/:pathMatch(.*)*` | — | 重定向 `/home` |

**内置工具（12 个）**：教室喊话、图片取色、颜色转换、随机抽号、课堂计时器、全屏时钟、文本处理、编码 / 哈希工具、Markdown 预览、二维码、时间戳转换、系统镜像下载。

## 后端（csh-api）

**技术栈**：JavaScript（ES Modules），运行于腾讯 EdgeOne Pages Functions（V8 隔离环境）；状态存储使用平台 Blob / KV；对象存储为阿里云 OSS，签名算法 V4；下载中继为自建 ECS（默认 `http://<RELAY_HOST>:8091`，走 OSS 内网）。

```
csh-api/
├── functions/
│   ├── api/[[default]].js   ★ 全部 API 路由与业务逻辑
│   ├── index.js             根路径入口
│   └── status.js            状态面板（HTML）
├── docs/后端使用文档.md       ★ 架构、接口、运维
├── edgeone.json              EdgeOne 项目配置
├── smoke.mjs / smoke-blob.mjs 线上冒烟脚本
├── package.json              仅开发依赖与脚本
└── README-deploy.md          部署说明
```

**路由**：`/api/status`、`/api/submit`、`/api/echocave`、`/api/feedback`、`/api/oss-sign`、`/api/mirror-sign`、`/api/icon`、`/api/dl-ticket`、`/api/dl`、`/api/announce/*`，以及管理路由 `/api/purge`、`/api/files`、`/api/dl-stats`、`/api/link`、`/api/promote`、`/api/gc`、`/api/registry-sync`、`/api/dl-mode`、`/api/oss-check`。详见[接口清单](../doc/appendix/api.md)。

**核心常量**（`functions/api/[[default]].js`）：

| 常量 | 值 |
| --- | --- |
| 分类 | `classroom` / `office` / `system` / `media` / `network` / `utility` |
| 下载类型 | `file` / `store` / `netdisk` / `page` |
| 票据有效期 | 900 秒 |
| 每设备每日下载 | 25 次 |
| 默认下载模式 | `auto` |
| GC 孤儿阈值 | 15 分钟 |
| GC 失效登记阈值 | 24 小时 |
| 每设备每日投稿 | 6 次 |
| 每设备待审核投稿 | 3 条 |
| OSS 单对象上限 | 2.5 GB |
| 加速签名限额 | 20 次/IP/日，3000 次/全局/日，20 GiB/全局/日 |

## 桌面端（Win10，ClassSoftwareHub-Desktop）

**技术栈**：.NET 10（`net10.0-windows10.0.26100.0`）+ WinUI 3 + Windows App SDK 2.5.1；自包含发布；安装器 Inno Setup 6。

```
ClassSoftwareHub-Desktop/
├── ClassSoftwareHub-Desktop.sln
├── ClassSoftwareHub.Desktop.csproj   应用本体工程
├── App.xaml(.cs)                     应用入口、单实例、激活、托盘、生命周期
├── MainWindow.xaml(.cs)              主窗口与导航壳
├── BUILDING.md                       ★ 构建 / 打包 / 发版说明
├── Core/                             常量与基础设施
│   ├── ShellConfig.cs                ★ 站点、版本、仓库、互斥名等常量
│   ├── AppLog.cs                     统一日志入口
│   ├── ContentStore.cs               软件数据加载器
│   ├── GithubMirror.cs               GitHub 加速路由
│   ├── ModernWindow.cs / WindowChrome.cs  自绘窗口与标题栏
│   └── ...
├── Data/                             数据模型（SoftwareApp / ToolDef / SidebarModule 等）
├── Services/                         服务层
│   ├── Updating/                     更新：UpdateService / GitHubReleaseSource / UpdateFlow
│   ├── HubAi/                        AI：提供方、会话、工具调用、DPAPI 密钥
│   ├── Diagnostics/                  机器体检
│   ├── GithubContentSync.cs          内容同步（首选数据源）
│   ├── ContentUpdater.cs             同步入口
│   ├── GithubRoute.cs                下载加速选路
│   ├── MirrorSign.cs                 加速签名
│   ├── DownloadService.cs            多线程下载
│   ├── ScreenCapture.cs              截屏
│   ├── TrayIcon.cs                   托盘
│   └── ...
├── Pages/                            页面
│   ├── ShellPage / SoftwarePage / DetailPage / DownloadsPage / SettingsPage
│   ├── HubAiPage / HubAiSettingsPage / ChangelogPage / LogViewerPage
│   ├── StartupPage / SystemRepairPage / UninstallPage / AppDataPage / AutoShutdownPage
│   ├── ProcessGuardPage / EasiNoteGuardPage / ExperimentalPage / MachineCheckPage
│   ├── FunctionPlotPage                  函数图像（工具之一，页面放在 Pages 根）
│   └── Tools/                            其余工具页（图片取色 / 抽号 / 计时 / 时钟 / 编码 /
│                                         方程求解 / 化学方程式配平 / 磁盘空间）
├── Views/                            独立窗口（工具浮窗、侧边栏、截屏编辑器等）
├── Controls/                         自定义控件
├── Web/                              内嵌网页注入脚本
├── Assets/                           图标与图片资源
├── installer/
│   └── ClassSoftwareHub.iss          ★ Inno Setup 6 安装脚本
└── tools/
    ├── publish-release.mjs           发版脚本
    ├── sync-legal.mjs                条款同步
    └── package-tests/                打包测试
```

**入口文件**：

| 入口 | 文件 | 职责 |
| --- | --- | --- |
| 应用入口 | `App.xaml.cs` | 单实例判定、激活事件、设置与内容加载、托盘、退出 |
| 主窗口 | `MainWindow.xaml.cs` | 导航壳与页面宿主 |
| 安装器 | `installer/ClassSoftwareHub.iss` | 安装、升级、卸载、WebView2 引导 |

**命名空间**：统一 `ClassSoftwareHub.Desktop.*`，程序集名 `ClassSoftwareHub`。

## Windows 7 兼容版（ClassSoftwareHub-windows7）

**技术栈**：.NET 6（`net6.0-windows7.0`）+ Avalonia 11.2.8 + Avalonia.Themes.Fluent + FluentAvaloniaUI 2.4.1 + Microsoft.Web.WebView2 1.0.1587.40 + System.Management 8.0.0 + System.Drawing.Common 6.0.0（`src/ClassSoftwareHub.Win7.csproj:83-99`）。

```
ClassSoftwareHub-windows7/
├── README.md                  项目说明、功能、技术选型
├── BUILDING.md                ★ 本地构建 / 打包 / 发版完整说明
├── LICENSE                    GPL-3.0
├── Assets/                    图片 / 图标资源
├── Web/shell-shim.js          站点外壳脚本（内嵌资源）
├── installer/
│   ├── ClassSoftwareHub-Win7.iss   ★ Inno Setup 6 安装脚本
│   ├── ChineseSimplified.isl       中文安装界面语言
│   └── Legal.rtf                  条款文本（随仓库维护）
├── tools/
│   ├── pack-win7-portable.ps1     便携版组装脚本
│   ├── publish-release-win7.mjs   发版脚本
│   └── package-tests/             打包相关测试工程
├── src/
│   ├── ClassSoftwareHub.Win7.csproj   应用本体工程
│   ├── Program.cs                    入口（命令行开关、Win7 渲染决策）
│   ├── App.axaml(.cs)                应用对象（单实例、生命周期、设置、内容）
│   ├── MainWindow.axaml(.cs)         主窗口
│   ├── app.manifest                  应用程序清单
│   ├── Platform/                     ★ 平台抽象层（勿改已有文件）
│   │   ├── NativeMethods*.cs         P/Invoke 集中处
│   │   ├── OsInfo.cs                 版本判定（RtlGetVersion）
│   │   ├── Backdrop.cs               背景材质分级降级
│   │   ├── ThemeCompat.cs            主题兼容
│   │   ├── PageBase.cs               页面基类
│   │   └── DiagConsole.cs            诊断控制台
│   ├── Core/                         外壳常量与基础设施
│   │   ├── ShellConfig.cs            ★ 常量集中处
│   │   ├── AppLog.cs                 统一日志入口
│   │   ├── ContentStore.cs           软件数据加载器
│   │   └── SettingsStore.cs          用户设置
│   ├── Services/                     服务层（80+ 个文件）
│   │   ├── Updating/                 更新：UpdateService / GitHubReleaseSource / UpdateFlow
│   │   ├── HubAi/                    AI 助手
│   │   ├── GithubContentSync.cs      GitHub 仓库直读内容（首选数据源）
│   │   ├── ContentUpdater.cs         内容同步入口
│   │   ├── MirrorSign.cs             加速签名
│   │   ├── DownloadManager.cs        下载管理
│   │   ├── ScreenCapture.cs          GDI 截屏
│   │   ├── TrayIcon.cs               托盘图标
│   │   └── ...（数学 / 化学 / 系统工具等业务服务）
│   ├── Pages/                        各页面（含 Hub AI、启动项、系统修复、卸载残留等）
│   ├── Views/                        各窗口
│   ├── Controls/                     自定义控件
│   ├── Data/                         数据模型
│   ├── Launcher/                     ★ 便携版启动器独立工程
│   └── PORTING.md                    ★ 移植契约（WinUI → Avalonia API 替换表）
└── .github/workflows/win7-release.yml  构建与发布工作流
```

**入口文件**：

| 入口 | 文件 | 职责 |
| --- | --- | --- |
| 应用本体 | `src/Program.cs` | `Main`：解析命令行开关、Win7 渲染决策 |
| 应用对象 | `src/App.axaml.cs` | 构造函数中做单实例判定；`OnFrameworkInitializationCompleted` 中加载设置并创建主窗口 |
| 启动器 | `src/Launcher/Program.cs` | 仅把 `app\ClassSoftwareHub.exe` 拉起并转发命令行参数 |

**命名空间约定**：统一使用 `ClassSoftwareHub.Desktop.*`（与 WinUI 原版一致），程序集名为 `ClassSoftwareHub`（`src/PORTING.md:51-53`、`src/ClassSoftwareHub.Win7.csproj:21-22`）。

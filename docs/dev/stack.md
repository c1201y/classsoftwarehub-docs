---
title: 技术栈与目录结构
createTime: 2026/10/19 20:00:00
---

> 逐仓库说明目录职责、核心模块、入口文件与关键配置

## 网页端（ClassSoftwareHub）

**技术栈**：Vue 3.5 + Vue Router 4（hash 路由）+ Vite 8 + TypeScript ~6.0；UI 组件库 WinUIonWeb（上游源码内置于 `src/components`、`src/styles`、`src/utils`）；无后端（`package.json:17-35`、`AGENTS.md:18`）。

**Node 版本要求**：`^20.19.0 || >=22.12.0`（`package.json:36-38`）。

```
ClassSoftwareHub/
├── 文字设置.ts                ★ 中文 UI 文案唯一修改点
├── 鸣谢文本.ts                 设置页致谢列表
├── AI导航文本.ts               AI 导航站点配置
├── index.html                 入口 HTML（异步注入百度统计）
├── vite.config.ts             base:'./'、ASCII chunk 名、dev 轮询
├── package.json               脚本与依赖
├── 软件数据/
│   ├── apps/*.json            一软件一文件（当前 71 款 + _模板.json）
│   ├── categories.json        4 个分类
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
│   │   ├── router.ts         8 条路由
│   │   ├── pages/            HomePage / DownloadDetailPage / SettingsPage /
│   │   │                     SubmitPage / FeedbackPage / AiNavPage / EchoCavePage
│   │   ├── tools/            ★ 内置工具：index.ts 注册表 + ToolShell.vue + 一工具一 .vue
│   │   ├── data/index.ts     数据加载器（容错解析，勿改）
│   │   ├── appIcons.ts       图标解析：优先本地 64px，回退 icon URL
│   │   ├── searchIndex.ts    全站搜索索引
│   │   ├── GlobalSearch.vue  Ctrl+K 搜索面板
│   │   ├── feedback.ts       反馈中心纯逻辑（无 Vue 依赖）
│   │   ├── githubImport.ts   从 GitHub 一键读取
│   │   ├── githubMirror.ts   加速下载镜像通道
│   │   ├── ossUpload.ts      OSS 直传
│   │   ├── ossDownload.ts    票据换下载
│   │   ├── deviceFingerprint.ts  设备指纹
│   │   ├── submitEndpoints.ts    提交入口排序与记忆
│   │   ├── visitor.ts        自建访问统计 + 百度统计 SPA 回放
│   │   ├── holidayTheme.ts   节日皮肤
│   │   ├── Strings/en-US/    英文站文案
│   │   └── styles/           首页 / 详情页样式
│   ├── components/ styles/ utils/ assets/   ⛔ WinUIonWeb 上游源码
│   └── assets/               站点自有资源（icons/ · holiday/ · Fonts/ · AppIcon-* · feedback/）
├── dist/                     构建产物（勿提交）
└── .github/workflows/         5 个工作流
```

**入口链**：`index.html` → `src/main.ts` → `src/gallery/App.vue`（外壳）→ `src/gallery/router.ts`（路由）。

**路由表**（`src/gallery/router.ts`）：

| 路径 | 名称 | 组件 |
| --- | --- | --- |
| `/` | — | 重定向 `/home` |
| `/home` | `home` | `pages/HomePage.vue` |
| `/download/:id` | `download-detail` | `pages/DownloadDetailPage.vue` |
| `/settings` | `settings` | `pages/SettingsPage.vue` |
| `/echo-cave` | `echo-cave` | `pages/EchoCavePage.vue` |
| `/submit` | `submit` | `pages/SubmitPage.vue` |
| `/feedback` | `feedback` | `pages/FeedbackPage.vue` |
| `/ai` | `ai` | `pages/AiNavPage.vue` |
| `/tools` | `tools` | `tools/ToolsPage.vue` |
| `/tools/<id>` | `tool-<id>` | 由 `tools/index.ts` 注册表自动生成 |
| `/:pathMatch(.*)*` | — | 重定向 `/home` |

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
│   └── Legal.rtf                  条款（由 tools/sync-legal.mjs 生成，勿手改）
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
│   │   ├── DiagConsole.cs            诊断控制台
│   │   └── ...
│   ├── Core/                         外壳常量与基础设施
│   │   ├── ShellConfig.cs            ★ 常量集中处
│   │   ├── AppLog.cs                 统一日志入口
│   │   ├── ContentStore.cs           软件数据加载器
│   │   ├── SettingsStore.cs          用户设置
│   │   └── ...
│   ├── Services/                     服务层（80+ 个文件）
│   │   ├── Updating/                 更新：UpdateService / GitHubReleaseSource / UpdateFlow 等
│   │   ├── GithubContentSync.cs      GitHub 仓库直读内容（首选数据源）
│   │   ├── ContentUpdater.cs         内容同步入口
│   │   ├── LogHome.cs / LogReader.cs 日志目录与读取
│   │   ├── WebViewRuntimeService.cs  WebView2 运行时探测
│   │   ├── SubmitClient.cs           提交服务通用调用层
│   │   ├── OssUpload.cs              OSS 直传
│   │   ├── AgeEncryption.cs          age v1 客户端加密
│   │   ├── DownloadManager.cs        下载管理
│   │   ├── ScreenCapture.cs          GDI 截屏
│   │   ├── TrayIcon.cs               托盘图标
│   │   └── ...（数学 / 化学 / 系统工具等业务服务）
│   ├── Pages/                        各页面
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

## 桌面端（WinUI 3 原版）

待确认。本地未定位到 `ClassSoftwareHub-Desktop` 仓库。已知信息：基于 .NET 10 + Windows App SDK 2.5，工程文件为 `ClassSoftwareHub.Desktop.csproj`，根目录含 `App.xaml`、`MainWindow.xaml` 与 `Core/ Data/ Services/ Pages/ Views/ Web/ Assets/` 目录（`src/PORTING.md:30-43`）。

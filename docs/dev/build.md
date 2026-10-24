---
title: 构建、运行与测试
createTime: 2026/10/19 20:00:00
---

> 安装依赖、开发模式、构建、测试、打包与发布命令，均注明来源文件

## 网页端

```bash
npm install           # 首次安装依赖
npm run dev           # 开发预览，默认 http://localhost:5173（--host=0.0.0.0）
npm run build         # 常规打包 → dist/（CI 部署使用此产物）
npm run build:single  # 单文件打包 → dist/index.html（约 2MB，离线双击）
npm run type-check    # TypeScript 类型检查（vue-tsc --build）
npm run check         # type-check + build
```

脚本定义见 `package.json:8-16`。开发服务器配置（host `0.0.0.0`、port 5173、轮询监视）见 `vite.config.ts:19-30`；Windows 上改用轮询是为规避 node fs watcher 在文件被原子替换时抛 EBUSY 导致 dev server 崩溃的问题。

## 桌面端（Win10）

### 调试构建

```powershell
dotnet build ClassSoftwareHub.Desktop.csproj -c Debug
.\bin\Debug\net10.0-windows10.0.26100.0\win-x64\ClassSoftwareHub.exe
```

### 打安装包

```powershell
# 1. 自包含发布到 dist\app
dotnet publish ClassSoftwareHub.Desktop.csproj -c Release -r win-x64 -p:Platform=x64 `
  --self-contained true -p:PublishTrimmed=false -o dist\app

# 2. 编译安装脚本
& "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe" installer\ClassSoftwareHub.iss
```

产物为 `dist\installer\ClassSoftwareHub-Setup-dv<DesktopVersion>.exe`。版本号默认取 `.iss` 中的 `DesktopVersion`，可临时用 `/DDesktopVersion=...` 覆盖。

::: danger 版本号四处一致
发版前 `Core/ShellConfig.cs` 的 `ShellVersion`、`.csproj` 的 `Version` / `InformationalVersion`、`.iss` 的 `DesktopVersion`、git tag 必须一致（tag 带 `dv` 前缀，`.iss` 不带）。任何一处不一致，更新器都认不出新版本。
:::

::: warning 不要带内置内容
`dotnet publish -o dist\app` 是覆盖式写入、不清理目录。发布前请确认 `dist\app\content` 不存在；工程里的 `VerifyNoBundledContent` 会在检测到内容包时直接让 publish 失败。
:::

## 后端（csh-api）

后端无本地构建产物，修改 `functions/` 后部署到 EdgeOne Pages：

```bash
# 本地冒烟（需要 Node.js；会请求线上接口）
node smoke.mjs
node smoke-blob.mjs
```

部署后先访问 `https://api.classsoftwarehub.cn/` 或 `GET /api/status`，确认状态存储、OSS、GitHub API、中继与下载模式的检查项均为通过。环境变量在 EdgeOne 控制台配置，**不要写进仓库**。

## Windows 7 兼容版

### 调试构建

```powershell
dotnet build src\ClassSoftwareHub.Win7.csproj -c Release
```

产物位于 `src\bin\Release\net6.0-windows7.0\win-x64\ClassSoftwareHub.exe`（`BUILDING.md:13-17`）。

开发机上可加 `--simulate-win7` 参数强制走 Win7 判定分支，无需真装一台 Windows 7 即可复现教室机的代码路径（`BUILDING.md:19-20`、`src/Platform/OsInfo.cs:16-27`）。

### 打便携版

```powershell
# 1. 应用本体（WinExe：不带 CshConsoleBuild，双击不出黑窗）
dotnet publish src\ClassSoftwareHub.Win7.csproj -c Release -r win-x64 `
  --self-contained true -p:PublishTrimmed=false -p:PublishReadyToRun=true -o dist\win7\app

# 2. 启动器
dotnet publish src\Launcher\ClassSoftwareHub.Launcher.csproj -c Release -r win-x64 -o dist\win7

# 3. 组装 + 打 zip
.\tools\pack-win7-portable.ps1 -AppDir dist\win7\app -LauncherDir dist\win7 `
  -Version 1.0.0 -OutRoot dist -Zip
```

产物为 `dist\ClassSoftwareHub-Win7-Portable\`（目录）与 `dist\ClassSoftwareHub-Portable-win7-dv<版本>.zip`（`BUILDING.md:36-49`）。

::: warning 不要加 CshConsoleBuild
`-p:CshConsoleBuild=true` 会把子系统从 Windows 换成控制台，双击多弹一个黑窗。该开关只用于现场排障（见 `src/Platform/DiagConsole.cs`），产物不进发布包。
:::

::: warning 便携包命名
便携包 zip 的名字里**必须含 `portable`**：客户端的更新器会跳过含这个词的资产，免得把整个便携包当成安装包去静默安装（`BUILDING.md:54-56`、`tools/pack-win7-portable.ps1:19-21`）。
:::

### 打安装版

```powershell
& "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe" `
  installer\ClassSoftwareHub-Win7.iss /DDesktopVersion=1.0.0
```

产物为 `dist\installer\ClassSoftwareHub-Setup-win7-dv<版本>.exe`。安装脚本的 `[Files]` 段读取 `..\dist\win7\ClassSoftwareHub.exe` 与 `..\dist\win7\app\*`，因此**必须先执行便携版构建的第 1、2 步**（`BUILDING.md:59-67`）。

### 命令行开关

| 开关 | 作用 |
| --- | --- |
| `--software-render` | 强制软件渲染。老显卡 D3D11 与 OpenGL 均不可用时应急使用 |
| `--gpu-render` | 放行 GPU 渲染降级链（ANGLE → WGL → 软件），用于在 Win7 上对比验证 |
| `--takeover` | 单实例冲突时跳过敲门等待，直接结束拿不出可见主窗口的现有实例 |
| `--simulate-win7` | 强制按 Win7 分支运行（开发机复现教室机代码路径） |

上述开关见 `src/Program.cs`，正式版同样识别。另支持环境变量 `CSH_SIMULATE_WIN7=1`，与 `--simulate-win7` 等效（`src/Program.cs:66-68`）。

## 测试

```powershell
dotnet test tools\package-tests\package-tests.csproj
```

测试工程位于 `tools/package-tests/`，针对打包相关逻辑（`tools/package-tests/Program.cs`、`tools/package-tests/Stubs.cs`）。

网页端仓库**未配置自动化测试框架**，质量保障依赖 `npm run type-check` 与 `npm run check`。

### 手工验收项

1. 网页端：首页卡片渲染、详情页下载项按钮文案与行为、搜索面板结果、来源切换与签名刷新、单文件构建可离线打开。
2. 桌面端（Win10）：首次启动联网同步、软件列表从空到有的刷新、各工具页与侧边栏、截屏贴图全流程、Hub AI 配置与工具调用。
3. 桌面端（Win10）：安装、覆盖升级、回滚、卸载残留清理；WebView2 缺失时的降级路径。
4. 后端：`/api/status` 全绿；投稿、直传签名、下载票据、加速签名、公告各走通一次；管理接口在无令牌时返回 401。
5. Windows 7 版：`--simulate-win7` 分支下的渲染与背景降级、WebView2 缺失时的降级路径、静默更新全链路。
6. 打包产物：Win7 便携版 zip 名含 `portable`；两个安装版文件名含 `Setup`；`.md5` 已生成；Win7 两层结构完整。

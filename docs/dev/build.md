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

1. 网页端：首页卡片渲染、详情页下载项按钮文案与行为、搜索面板三类结果、单文件构建可离线打开。
2. 桌面端：首次启动联网同步、软件列表从空到有的刷新、各工具浮窗与侧边栏、截屏贴图全流程。
3. Windows 7 版：`--simulate-win7` 分支下的渲染与背景降级、WebView2 缺失时的降级路径、静默更新全链路。
4. 打包产物：便携版 zip 名含 `portable`；安装版文件名含 `Setup`；两层结构完整；`.md5` 已生成。

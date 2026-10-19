---
title: Windows 7 兼容开发说明
createTime: 2026/10/19 20:00:00
---

> 兼容性策略、运行时依赖、构建差异、功能限制、测试要点与发布注意事项

## 兼容性策略

Windows 7 兼容版的核心策略是**逐文件等价移植**，而非重新设计。移植契约 `src/PORTING.md` 规定两条铁律：

1. **语义等价，不是重新设计**：是在「翻译」已有代码，不是重写功能。原文件的方法、字段、注释（中文长注释尤其）、边界处理、时序、容错分支尽量原样保留；「为什么这么写」的注释不要删、不要精简，只把 WinUI/WinRT 专有名词改成对应的 Avalonia 说法。
2. **UI 一模一样**：布局结构、控件层级、间距、尺寸、圆角、颜色、图标码位、文案全部照搬。见到 `Glyph="&#xE719;"` 原样抄（图标字体已把 MDL2 码位重映射好）。

**允许的偏离**：只有当 WinUI API 在 Avalonia 里确实不存在时才按替代方案改写（`src/PORTING.md:15-24`）。

## 平台抽象层

所有「Win10 才有 / Win7 没有」的判定集中在 `src/Platform/`，**禁止在业务代码里另写 `DllImport`**：

| 类型 | 用途 |
| --- | --- |
| `OsInfo` | 版本判定。`IsWindows7` / `IsWindows10OrLater` / `IsWindows11` / `SupportsMica` / `SupportsAcrylicBlur` / `SupportsDarkTitleBar` / `SupportsWindowRounding` / `IsDwmCompositionEnabled` / `Describe()` |
| `NativeMethods`（含 `NativeMethodsDisplay` / `NativeMethodsIcons` / `NativeMethodsMemory` / `NativeMethodsWindow` / `NativeMethodsShell` / `NativeMethodsEx` / `NativeMethodsUtil`） | 全部 P/Invoke |
| `Backdrop` | `Backdrop.Apply(win, root, prefer)` → 返回实际生效的 `"mica"/"acrylic"/"blur"/"solid"` |
| `ThemeCompat` | `ThemeCompat.Apply(root)` / `ThemeCompat.Notify()` / `ThemeCompat.Map(str)` |
| `PageBase` / `Navigation` | 页面基类与导航附加；`Navigation.Attach(frame)` 必须在首次 `Navigate` 前调用 |

**为什么不用 `Environment.OSVersion`**：.NET 读了 exe 清单里的 `supportedOS` 之后会把版本统一「兼容性上报」成 6.2（Win8），在 Win7 上直接误判。必须走 `RtlGetVersion`（`src/Platform/OsInfo.cs:9-11`）。

## WinUI → Avalonia API 替换要点

### 命名空间与根类型

| WinUI 原版 | Avalonia 移植版 |
| --- | --- |
| `Microsoft.UI.Xaml.Controls.Page` | `Platform.PageBase`（继承 `Avalonia.Controls.UserControl`，重写 `OnNavigatedTo(object?)` / `OnNavigatedFrom()`） |
| `Microsoft.UI.Xaml.Window` | `Avalonia.Controls.Window` |
| `Microsoft.UI.Xaml.Controls.Frame` | `FluentAvalonia.UI.Controls.Frame`（同签名） |
| `Microsoft.UI.Xaml.Application` | `Avalonia.Application` |
| `Microsoft.UI.Xaml.Controls.ContentDialog` | `FluentAvalonia.UI.Controls.ContentDialog`（`await dialog.ShowAsync()`） |

### 控件

| WinUI | Avalonia / FluentAvalonia | 备注 |
| --- | --- | --- |
| `NavigationView` / `NavigationViewItem` | `FluentAvalonia.UI.Controls.*` | 属性同名；⚠️ 图标属性叫 `IconSource` 不叫 `Icon` |
| `SettingsCard` | ⚠️ FA 没有 | 自建 `src/Views/SettingsCard.axaml(.cs)`，全体共用同一个 |
| `VariableSizedWrapGrid` / `ItemsWrapGrid` | `Avalonia.Controls.WrapPanel` | Avalonia 无 VariableSizedWrapGrid |
| `RelativePanel` | `Avalonia.Controls.Grid` | Avalonia 无 RelativePanel |
| `ItemsRepeater` | `Avalonia.Controls.ItemsControl` + `ItemsPanel` | — |
| `GridView` / `ListView` | `Avalonia.Controls.ListBox` | 配 `ItemsPanel` 改横向 / 换行 |
| `Window.SystemBackdrop` | `Platform.Backdrop.Apply(win, root, prefer)` | — |
| `ExtendsContentIntoTitleBar` + `SetTitleBar` | `ExtendClientAreaToDecorationsHint` + 相关 hint | Win7 上更稳的做法是保留系统边框 |

### 类型 / 基础设施

| WinUI / WinRT | Avalonia 移植版 |
| --- | --- |
| `DispatcherQueue` | `Avalonia.Threading.Dispatcher.UIThread` |
| `Windows.Storage.ApplicationData.Current.LocalFolder` | `Core.AppPaths.DataDir` |
| 文件选择器 | `Avalonia.Platform.Storage.IStorageProvider` |
| 剪贴板 | `TopLevel.GetTopLevel(control).Clipboard`（`IClipboard`） |
| `Launcher.LaunchUriAsync` | `TopLevel.GetTopLevel(control).Launcher.LaunchUriAsync(uri)` |
| `ElementTheme` | `Avalonia.Styling.ThemeVariant` |
| `ThemeResource`（XAML） | `{DynamicResource ...}` |
| `x:Bind` | `{Binding}`（本项目未启用编译期绑定） |
| `Grid.ColumnSpacing` / `RowSpacing` | ⛔ Avalonia 的 Grid 没有这两个属性 → 用子元素 `Margin` 模拟 |

## 运行时依赖差异

| 依赖 | WinUI 3 原版 | Windows 7 兼容版 | 处理方式 |
| --- | --- | --- | --- |
| 背景材质 | 云母 / 亚克力 | Aero 毛玻璃 / 纯色 | `Platform.Backdrop` 自动分级降级；DWM 合成关闭时一律纯色 |
| 图标字体 | Segoe MDL2 Assets / Segoe Fluent Icons | 无 | 内嵌字体 `Assets/Fonts/CshSymbols.ttf`（族名 `CshSymbols`，挂在 `SymbolThemeFontFamily`），91 个 MDL2 码位重映射 |
| 截屏 | `Windows.Graphics.Capture` | 无 | GDI `BitBlt`（`NativeMethods` 已备好 `CreateCompatibleDC` / `CreateCompatibleBitmap` / `BitBlt`） |
| WebView2 | 运行时不受限 | 运行时止于 109.0.1518.x | SDK 锁 `1.0.1587.40`；探不到运行时时走「用浏览器打开」降级路径 |
| 渲染 | GPU | 默认软件渲染 | 见下 |

## 渲染策略

Windows 7（含 `--simulate-win7`）**默认直接走软件渲染**，帧缓冲在进程内存里，保帧由进程自己保证。

决策依据（2026-10-08/09 抽号页随机灰矩形问题，真机两轮复核）：

- **现象**：Win7 抽号页出现位置随机的浅灰矩形残影，每帧形状不同。
- **根因**：Avalonia 组合渲染默认按脏矩形局部重绘，其余像素依赖渲染表面「保住上一帧」。Win7 老显卡（WGL / 老 Intel ICD）的表面保帧不可靠，未重绘区域会露出上一帧残留或随机垃圾像素。
- **中间方案无效**：`CompositionOptions.UseSaveLayerRootClip`（脏区先画进中间表面再合成）只解决 saveLayer 裁剪一类问题，不改变对表面保帧的依赖，2026-10-09 真机复核确认单独启用无效。
- **处置**：Win7 默认软件渲染，随机灰矩形从机制上不可能出现；需要验证 GPU 路径时加 `--gpu-render` 临时放行降级链（此时仍带 `UseSaveLayerRootClip`）。软件渲染对「大部分时间静止」的界面开销可接受；WebView2 独立进程渲染，不受影响（`src/Program.cs:70-82`）。

注册 `UseSaveLayerRootClip` 需走反射：`AvaloniaLocator.CurrentMutable` 在 NuGet 的 ref 程序集里被裁掉（编译期不可见，运行时仍全量公开）。注册结果记录到 `RenderFixVerified`，排障时必须能分辨「没注册上」和「注册了但对该机器不够」两种情况（`src/Program.cs:84-100`）。

## 启动加速

`PublishReadyToRun=true` 把 IL 预编译成原生码，省掉目标机上的 JIT。本机实测（2026-10-02）：进程启动 → 主窗口露脸 = 6.4s，其中约 4.4s 花在「进程启动 → 第一条业务日志」之间（.NET 运行时加载 + Avalonia 一堆程序集的 JIT），真正属于应用的初始化只占 1.9s，所以这一段只能在构建期解决。代价是产物体积约 +30%（`src/ClassSoftwareHub.Win7.csproj:50-61`）。

不能开 `PublishTrimmed`（Avalonia 反射绑定 + WebView2 不兼容），也不要开 `PublishReadyToRunComposite`（体积暴涨且收益有限）。

## 构建差异

| 差异点 | 说明 |
| --- | --- |
| 目标框架 | `net6.0-windows7.0`，`SupportedOSPlatformVersion=7.0` |
| 诊断控制台版 | `-p:CshConsoleBuild=true` 时 `OutputType=Exe` 并定义 `CSH_CONSOLE`，把 `Platform/DiagConsole.cs` 编入；正式产物一个字节都不变 |
| 平台兼容性噪音 | `NoWarn` 加 `CA1416`（明确知道哪些 API 只在更高系统存在，均已在代码里做版本判定） |
| 排除 Launcher | SDK 默认通配 `**\*.cs` 会把 Launcher 工程一起编进来导致两个 `Main`，故显式 `Compile Remove="Launcher\**"` 等 |
| 内嵌资源 LogicalName | QuickLinks 的 SVG 必须显式写成 `ClassSoftwareHub.Desktop.Assets.QuickLinks.*`，因为 `QuickLinkIconLoader` 按这个名字找资源，默认生成的名字对不上 |

## 功能限制

1. **C# 语言版本锁 10**：不能用 `required`、原始字符串、列表模式、集合表达式、主构造函数（`src/PORTING.md:202-203`）。
2. **WebView2 特性受限**：SDK 锁在 `1.0.1587.40`，没有 `AreBrowserExtensionsEnabled` 属性（该属性是 SDK 1.0.1722+ 才有）；该版本本来就不加载浏览器扩展，语义等价，故省略（`src/Services/WebViewRuntimeService.cs:53-55`）。
3. **WebView2 入口差异**：旧 SDK 的入口是 `CreateAsync`（新 SDK 才叫 `CreateWithOptionsAsync`），参数一致（`src/Services/WebViewRuntimeService.cs:61-62`）。
4. **3 个低置信度图标映射**：`U+E840`、`U+EEA1`、`U+EEA3` 可能渲染为空白 / 方块，列出但不自行更换码位（`src/PORTING.md:159-160`）。
5. **模拟模式的局限**：`--simulate-win7` 只是分支模拟，机器真实内核仍是 Win10/11，个别 API 的实际行为会有差异；但「走哪条代码路径」是准的（`src/Platform/OsInfo.cs:25-26`）。

## 测试要点

1. **分支覆盖**：所有按系统版本分叉的判定（扩展客户区、Aero 毛玻璃、深色标题栏、窗口圆角）在 Win7 分支上均需覆盖；开发机用 `--simulate-win7` 复现。
2. **渲染路径**：默认软件渲染与 `--gpu-render` 放行的 GPU 降级链均需验证；重点关注抽号页等动画密集页面是否出现残影。
3. **DWM 合成关闭场景**：经典 / 基本主题下 `IsDwmCompositionEnabled` 为 false，背景必须退回纯色，不能留透明。
4. **WebView2 缺失场景**：未安装运行时与安装了 109.x 运行时两种情况；缺失时必须走「用浏览器打开」降级路径。
5. **静默更新全链路**：`/SP- /SILENT` 下许可页被跳过、`PrepareToInstall` 的 taskkill 逻辑、`AppMutex` 移除后的行为。
6. **打包产物形态**：便携版 zip 名含 `portable`；安装版文件名含 `Setup`；两层结构完整；`.md5` 已生成。
7. **行结尾**：本仓库无 `.gitattributes` 规定，改动文件前确认实际行结尾。

## 发布注意事项

1. **版本号唯一来源**是 `src/Core/ShellConfig.cs` 的 `ShellVersion`，安装脚本的 `DesktopVersion` 必须与它一字不差（不带 `dv` 前缀）（`installer/ClassSoftwareHub-Win7.iss:23-26`）。
2. **tag 命名**：正式版 `dv1.0.0`，预览版 `dv1.0.0-insider1.1`（带 `insider` 自动勾 Pre-release）。tag **不带任何前缀**（本仓库是 Win7 版自己的独立仓库，Release 列表天然隔离）。
3. **资产命名**：安装包名必须含 `Setup`（更新器据此认包）；便携包名必须含 `portable`（更新器据此跳过）。
4. **`.md5` 必须上传**：否则客户端会因 `MissingChecksumException` 中止更新。
5. **发版脚本与 tag 前缀联动**：`UpdateTagPrefix` 当前为空串，机制保留；若将来合库需填上前缀，**发版脚本里的 `TAG_PREFIX` 要同步改**（`BUILDING.md:106-107`）。

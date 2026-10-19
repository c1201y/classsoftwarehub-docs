---
title: 术语表
createTime: 2026/10/19 20:00:00
---

> 术语首次出现时给出定义，全文档统一使用

## 项目与形态

| 术语 | 定义 |
| --- | --- |
| 网页端 | `ClassSoftwareHub` 仓库，Vue 3 + Vite + TypeScript 实现的纯静态站点，部署于 `https://classsoftwarehub.us.ci` |
| 桌面端（WinUI 3 原版） | `ClassSoftwareHub-Desktop` 仓库，基于 WinUI 3 + .NET 10 + Windows App SDK 2.5 的桌面客户端，系统底线为 Windows 10 1809 |
| Windows 7 兼容版 | `ClassSoftwareHub-windows7` 仓库（代号 `csh-win7`），以 Avalonia 11.2.8 + .NET 6 重写 UI 层的桌面客户端，系统底线为 Windows 7 SP1 |
| 软件数据 | 网页端 `软件数据/apps/*.json` 中逐软件维护的结构化记录，是网页端与桌面端共用的唯一数据源 |
| 提交服务 | 自建 Cloudflare Worker（代号 `classhub`），提供 `/api/submit`、`/api/echocave`、`/api/feedback`、`/api/oss-sign`、`/api/dl-ticket`、`/api/dl` 等路由 |
| 体检 Issue | 「软件信息体检 · 待人工确认」Issue，汇总脚本无法自动处理的软件条目 |
| 回声洞 | 设置页中逐条显示群友投稿并逐字打出的互动组件 |
| 覆盖已存在 | 审核标签之一，表示用本次提交整份替换站内已存在的同名软件数据 |

## 发行形态

| 术语 | 定义 |
| --- | --- |
| 安装版 | 通过安装程序部署、带开始菜单 / 桌面快捷方式与卸载项的发行形态 |
| 便携版 | 解压即用、不写注册表的发行形态 |
| 单文件构建 | 将整站打包为一个 HTML 文件的构建模式，可离线双击打开 |
| 自包含发布 | 将 .NET 运行时一并打包的发布方式，目标机无需单独安装运行时 |
| 提权助手模式 | 桌面端以 `runas` 启动自身的一个无界面实例执行需管理员权限操作的机制 |
| 静默安装 | 带 `/SP- /SILENT` 参数的安装方式，跳过许可页并视为已接受 |

## 技术组件

| 术语 | 定义 |
| --- | --- |
| age | 一种基于 X25519 + ChaCha20-Poly1305 的现代文件加密工具与格式；本项目仅使用其 v1 规范的客户端加密部分 |
| Avalonia | 跨平台 .NET UI 框架，本项目中作为 Windows 7 兼容版的 UI 层 |
| Bech32 | age 公钥使用的编码格式，公钥以 `age1` 开头 |
| CshSymbols | Windows 7 兼容版内嵌的图标字体，将 Segoe MDL2 Assets 码位重映射，族名为 `CshSymbols` |
| DWM | Desktop Window Manager，Windows 桌面合成器；Win7 上「毛玻璃」效果依赖其合成开关 |
| FluentAvaloniaUI | Avalonia 的 Fluent 风格控件库，提供 NavigationView、InfoBar、NumberBox 等控件 |
| GDI | Windows 图形设备接口；Win7 无 `Windows.Graphics.Capture`，截屏改走 GDI `BitBlt` |
| hash 路由 | 使用 URL fragment（`#`）表示路由的 SPA 路由方式；文档路径不变，便于同一份产物部署在不同深度 |
| Inno Setup | Windows 安装包制作工具，本项目用于编译安装版 |
| MDL2 Assets | Segoe MDL2 Assets 图标字体，WinUI 应用常用的图标码位来源 |
| OpenList | 一个支持 WebDAV 的文件列表程序，本项目用作站点镜像 |
| P/Invoke | 平台调用，.NET 调用非托管 DLL 导出的机制 |
| ReadyToRun（R2R） | 构建期将 IL 预编译为原生码的技术，可省去目标机 JIT 开销 |
| RID | Runtime Identifier，.NET 的运行时标识，本项目为 `win-x64` |
| runas | Windows 以其他用户身份（通常为管理员）启动进程的机制，本项目用于提权助手 |
| SHA-256 / SHA-512 | 安全哈希算法，用于校验文件完整性 |
| 遥测 | 匿名使用数据上报；本项目接口已预留但当前实现为空操作，默认关闭 |
| 映像（镜像）下载 | 操作系统安装镜像的下载入口；站点不存储镜像，仅提供跳转 |
| WinUIonWeb | 上游开源的 WinUI 风格 Vue 组件库，网页端 UI 的基础 |

## 数据与流程

| 术语 | 定义 |
| --- | --- |
| 数据容错 | 单个软件 JSON 格式错误时跳过该文件，其余软件正常渲染，页面顶部显示提示的机制 |
| 全有或全无 | 版本号与下载直链视为一个整体的判定原则；只要有一处无法处理就不做任何修改 |
| 版本只许前进 | 写回的版本必须来自实际分发的产物，且只在比站内更新时才覆盖；上游比站内旧就整条跳过 |
| 本次跳过 | 仅压制当前这一版问题的处理方式；上游发布新版或直链更换后自动恢复提醒 |
| 不用跟进 | 永久静音某个软件条目的处理方式 |
| 加速下载 | 对 GitHub 文件链接提供的镜像通道跳转，官方链接与非 GitHub 主机不显示该按钮 |
| 票据闸门 | OSS 私有桶的下载保护机制；凭 15 分钟短时票据取流，避免永久有效直链被转发滥用 |
| 审核字段 | 草稿中 `_` 前缀的键，仅用于审核，合并时全部剥除，不会发布到网站 |

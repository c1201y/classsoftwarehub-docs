---
title: 下载
pageLayout: Download
createTime: 2026/10/19 20:00:00
---

> 获取网页端与桌面端产物

## 网页端

网页端为在线站点，无需下载：

| 入口 | 地址 |
| --- | --- |
| 主站 | `https://classsoftwarehub.cn` |
| 备用站点 | `https://classsoftwarehub.132614.xyz`、`https://classsoftwarehub.xfane.com` |

网页端不随 Release 发布离线包。确实需要离线使用时，可在源码仓库执行 `npm run build:single`，自行生成单文件 HTML（约 2 MB，双击即可在浏览器打开）；线上部署使用的是普通多文件构建 `npm run build`。

## 桌面端

两个桌面版本各自独立发版，从各自的 GitHub Releases 获取：

| 版本 | 包 | 文件 | 说明 |
| --- | --- | --- | --- |
| 桌面版（Win10 / 11） | 安装版 | `ClassSoftwareHub-Setup-dv<版本>.exe` | 当前用户安装到 `%LOCALAPPDATA%\Programs\ClassSoftwareHub`，带开始菜单 / 桌面快捷方式与卸载项 |
| Windows 7 兼容版 | 安装版 | `ClassSoftwareHub-Setup-win7-dv<版本>.exe` | 默认装入 `%LOCALAPPDATA%\Programs\ClassSoftwareHub-Win7` |
| Windows 7 兼容版 | 便携版 | `ClassSoftwareHub-Portable-win7-dv<版本>.zip` | 解压即用，双击根目录的启动器运行，不写卸载注册项 |

桌面版（Win10 / 11）只提供安装版；两个版本的安装目录与安装标识不同，可共存。每个安装包都附带同名 `.md5`，下载后请校验完整性。

## 版本通道

| 通道 | tag 形态 | 说明 |
| --- | --- | --- |
| 正式版（stable） | `dv1.0.0` | 经过完整测试，推荐日常使用 |
| 预览版（insider） | `dv1.0.0-insider1.1` | 提前体验新功能；发布时勾选 Pre-release |

客户端可在设置页切换更新通道。正式版通道只接收非预发布版本，预览版通道同时接收预发布与非预发布版本。

## 系统要求

| 版本 | 系统要求 |
| --- | --- |
| Windows 7 兼容版 | Windows 7 SP1 及以上（x64） |
| WinUI 3 桌面版（Win10 / 11） | Windows 10 1809（build 17763）及以上（x64） |

两版安装目录与安装标识不同，可在同一台机器上共存。

## 相关链接

- 网页端 Releases：[github.com/c1201y/ClassSoftwareHub/releases](https://github.com/c1201y/ClassSoftwareHub/releases)
- 桌面版（Win10 / 11）Releases：[github.com/c1201y/ClassSoftwareHub-Desktop/releases](https://github.com/c1201y/ClassSoftwareHub-Desktop/releases)
- Windows 7 版 Releases：[github.com/c1201y/ClassSoftwareHub-windows7/releases](https://github.com/c1201y/ClassSoftwareHub-windows7/releases)
- 问题反馈：[github.com/c1201y/ClassSoftwareHub/issues](https://github.com/c1201y/ClassSoftwareHub/issues)

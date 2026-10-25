---
title: Download
pageLayout: Download
createTime: 2026/10/19 20:00:00
---

> Get the web site and desktop builds

## Web

The web site is online, no download needed:

| Entry | Address |
| --- | --- |
| Main site | `https://classsoftwarehub.cn` |
| Mirrors | `https://classsoftwarehub.132614.xyz`, `https://classsoftwarehub.xfane.com` |

The web site does not publish an offline bundle with its releases. To use it offline, run `npm run build:single` in the source repository to generate a single-file HTML (~2 MB) that opens directly in a browser; the live deployment uses the regular multi-file build (`npm run build`).

## Desktop

The two desktop editions release independently. Get them from their own GitHub Releases:

| Edition | Package | File | Notes |
| --- | --- | --- | --- |
| Desktop (Win10 / 11) | Installer | `ClassSoftwareHub-Setup-dv<version>.exe` | Per-user install to `%LOCALAPPDATA%\Programs\ClassSoftwareHub`, with Start-menu / desktop shortcuts and an uninstall entry |
| Windows 7 edition | Installer | `ClassSoftwareHub-Setup-win7-dv<version>.exe` | Installs to `%LOCALAPPDATA%\Programs\ClassSoftwareHub-Win7` by default |
| Windows 7 edition | Portable | `ClassSoftwareHub-Portable-win7-dv<version>.zip` | Unzip and run; does not write an uninstall registry entry (settings and cache still live under `%LOCALAPPDATA%\ClassSoftwareHub`) |

The Desktop (Win10 / 11) edition ships an installer only. The two editions use different install directories and identities, so they can coexist. Each package ships a matching `.md5`; verify integrity after downloading.

## Channels

| Channel | Tag form | Notes |
| --- | --- | --- |
| Stable | `dv1.0.0` | Fully tested, recommended for daily use |
| Insider | `dv1.0.0-insider1.1` | Early access to new features; published as a Pre-release |

The channel can be switched in the client settings. The stable channel receives non-prerelease versions only; the insider channel receives both prerelease and non-prerelease versions.

## System requirements

| Build | Requirement |
| --- | --- |
| Windows 7 build | Windows 7 SP1 or later (x64) |
| WinUI 3 desktop build | Windows 10 1809 (build 17763) or later (x64) |

The two builds use different install directories and install identities, so they can coexist on the same machine.

## Links

- Web releases: [github.com/c1201y/ClassSoftwareHub/releases](https://github.com/c1201y/ClassSoftwareHub/releases)
- Desktop (Win10 / 11) releases: [github.com/c1201y/ClassSoftwareHub-Desktop/releases](https://github.com/c1201y/ClassSoftwareHub-Desktop/releases)
- Windows 7 build releases: [github.com/c1201y/ClassSoftwareHub-windows7/releases](https://github.com/c1201y/ClassSoftwareHub-windows7/releases)
- Issues: [github.com/c1201y/ClassSoftwareHub/issues](https://github.com/c1201y/ClassSoftwareHub/issues)

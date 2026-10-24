---
title: Overview
createTime: 2026/10/19 20:00:00
---

# Welcome to ClassSoftwareHub!

> **A software download hub for classroom-PC administrators**
> No ads, no bundled junk, open source first.

<span id="sys_cpb_tip" style="display: block; padding-top: 80px; margin-top: -80px;"></span>
::: warning System compatibility
The Windows 7 build requires **Windows 7 SP1 or later (x64)**. Below that version the installer refuses to install and redirects you to the web site.
The WinUI 3 desktop build requires **Windows 10 1809 (build 17763) or later (x64)**. Both use different install directories and install identities, so they can coexist on the same machine.
:::

::: tip No runtime required
Desktop builds are **self-contained**, so no separate .NET runtime is needed. The WebView2 runtime is optional; without it only the in-app web overlay is unavailable.
:::

::: info License
This project is open source under **GNU GPL-3.0**. You may use, modify and distribute it freely, but modified versions must be released under GPL-3.0 as well.
:::

# What is it?

**ClassSoftwareHub** is a software download site and classroom toolbox for AV-equipment administrators. It curates system tools, teaching software, teaching aids and utilities, publishing version numbers, sizes, OS limits and checksums alongside direct download links. It also ships local-only tools such as random name drawing, classroom timers, a full-screen clock, encoding and hashing, image colour picking, text processing, Markdown preview, QR code generation, timestamp conversion and OS mirror links.

The project consists of four repositories forming four parts of the same product:

| Form | Repository | Tech | OS |
| --- | --- | --- | --- |
| Web | `ClassSoftwareHub` | Vue 3 + Vite + TypeScript static site | Any modern browser |
| Desktop (Win10) | `ClassSoftwareHub-Desktop` | WinUI 3 + .NET 10 + Windows App SDK 2.5 | Windows 10 1809+ (x64) |
| Windows 7 build | `ClassSoftwareHub-windows7` | Avalonia 11.2.8 + .NET 6 | Windows 7 SP1+ (x64) |
| Backend | `csh-api` | Tencent EdgeOne Pages Functions + Aliyun OSS | Deployed by maintainers; users install nothing |

## Core strengths

- **Clean catalogue**: no ads, no bundled junk, open source first
- **One file per app**: software data lives in individual JSON files, so a single malformed entry never takes the site down
- **Automatic version tracking**: weekly checks against GitHub Releases and vendor download sources
- **Transparent checksums**: MD5 / SHA families detected by length, one click to copy
- **Consistent across forms**: both desktop builds share the same software data as the web site
- **Fallback download routes**: self-hosted GitHub acceleration, several public mirrors, then the original URL
- **Runs on old machines**: the Windows 7 build lowers the floor to SP1

## Use cases

- **Bulk provisioning**: pick clean software for classroom PCs and download in batches
- **Old machines**: use the desktop client where the OS cannot be upgraded past Windows 7
- **Classroom tools**: random drawing, timers, full-screen clock, screen capture and pin-up
- **OS mirror navigation**: trusted download entry points for system images; the site stores no images

## How data flows

```mermaid
graph LR
    A["Web repo<br/>软件数据/apps/*.json"] -->|"public GitHub read"| B["Desktop (Win10)"]
    A -->|"public GitHub read"| C["Windows 7 build"]
    W["Web app"] -->|"reads / writes / download tickets"| API["EdgeOne Pages backend<br/>api.classsoftwarehub.cn"]
    B -->|"submit / feedback / accelerated signing"| API
    C -->|"submit / feedback / accelerated signing"| API
    API -->|"writes submissions/*.json"| A
    API -->|"presigned upload / ticketed download"| OSS["Aliyun OSS<br/>private bucket"]
    API -->|"intranet relay"| ECS["ECS relay<br/>8.159.148.101:8091"]
    ECS --> OSS
```

Software data still has a single authoritative source: `软件数据/apps/*.json` in the web repository. The backend only provides dynamic capabilities — submission inbox, feedback, echo cave, OSS upload signing, download tickets and GitHub acceleration signing. It stores no catalogue content.

::: info No bundled content
Neither desktop build ships a content pack (the Win10 build dropped its built-in copy in 1.2.0). The first launch must be online and reads `软件数据/apps/*.json` straight from the public GitHub repository. If upstream removes a title, the local cache is deleted too, so delisted software cannot come back.
:::

## Downloads and acceleration

- For GitHub files, the web app tries **self-hosted acceleration** first (`download.classsoftwarehub.cn`, short-lived signed links), then falls back to public mirrors such as `ghfast.top`, `gh-proxy.com`, `ghproxy.net` and `gh.ddlc.top`, and finally to the original GitHub URL.
- Signing is handled by the backend's `/api/mirror-sign`; links live for about 15 minutes and are bound to a Referer allowlist and daily quotas.
- Site-owned files (icons, submitted attachments) live in a private Aliyun OSS bucket and are streamed through `/api/dl` with a short-lived ticket.

## Versioning and release

- **Web**: public `X.Y.Z` plus a codename suffix, plus an internal `AAAABBCCPRDD` number
- **Desktop (Win10)**: `dv` + `major.feature.patch`, with `-insider<arch>.<iteration>` for prereleases
- **Windows 7 build**: same version rule, separate repository and release line
- **Release isolation**: the two desktop builds release and update independently and never accept each other's versions

## Getting help

- Site: [classsoftwarehub.us.ci](https://classsoftwarehub.us.ci)
- Mirror: [classsoftwarehub.132614.xyz](https://classsoftwarehub.132614.xyz)
- Issues: [GitHub Issues](https://github.com/c1201y/ClassSoftwareHub/issues)
- QQ group: 487903798

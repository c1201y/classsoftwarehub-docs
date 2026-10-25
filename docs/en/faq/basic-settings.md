---
title: Basic Settings
createTime: 2026/10/19 20:00:00
---

> High-frequency basics

## The web site will not open

Try the main site, then the mirror. If neither works, check your local network or DNS; if a mirror is unreachable, use the main site.

## Does the web site require a login

No. The web site has no account system. Browsing, searching, downloading and all built-in tools are open to visitors. Submitting software, posting to the echo cave and filing feedback also require no account.

## Why is the desktop list empty on first launch

Installer packages ship no software data. On first launch the app must go online and sync from the GitHub repository. If it cannot, the UI shows "content not yet available" with a retry entry. Connect to the network and retry. The Windows 7 build bundles only the mirror-site list and icons, not the software catalogue.

## Where does the desktop app store data

| Content | Location |
| --- | --- |
| Data root | `%LOCALAPPDATA%\ClassSoftwareHub\` |
| Synced software data | `%LOCALAPPDATA%\ClassSoftwareHub\content\` |
| Logs | `%LOCALAPPDATA%\ClassSoftwareHub\logs\{launch time}\` |
| WebView2 user data | `%LOCALAPPDATA%\ClassSoftwareHub\WebView2\` |

## How do I switch to dark mode

Switch it in Settings → Appearance; `system` / `light` / `dark` are supported. Enabling "split appearance" lets the sidebar, tool palette and screenshot editor use their own appearance settings.

## Is the app still running after I close the window

By default, yes. Closing the window sends the app to the tray rather than exiting, so clicking the desktop icon again wakes the running instance and shows the main window. To exit on close instead, turn off "close to tray" in settings.

## Portable vs installer

| Aspect | Installer | Portable |
| --- | --- | --- |
| Install | Run the installer | Unzip and run |
| Shortcuts | Start menu / desktop | None; double-click the root exe |
| Uninstall entry | Yes | No; delete the folder |
| Registry | Uninstall entry written | Uninstall entry not written |
| Auto-update | Supported | Cannot replace itself; replace the `app\` folder manually |
| Structure | Launcher + `app\` | Launcher + `app\` (same shape) |

## Can both desktop builds be installed at once

Yes. The Windows 7 build and the WinUI 3 build use different install directories (`...\Programs\ClassSoftwareHub-Win7`) and different install identities, so they do not overwrite each other and do not receive each other's updates. Both share the same data root (`%LOCALAPPDATA%\ClassSoftwareHub`), so settings, content cache and logs are shared.

## Updates keep failing

1. Confirm the update channel is correct (the stable channel cannot receive insider builds).
2. Confirm the network can reach `github.com`.
3. On a checksum failure, download again; on a missing-checksum error, the release has neither a same-named `.md5` asset nor a SHA256 digest from the GitHub API. The Windows 7 build aborts the update and will not run an unverified installer; the Windows 10 build currently logs a warning and proceeds, so prefer releases that publish checksums.
4. Check the `update` module in the logs.

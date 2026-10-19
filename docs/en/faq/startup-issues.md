---
title: Startup & Installation Issues
createTime: 2026/10/19 20:00:00
---

> Diagnosing launch failures, installation problems and rendering issues

## Double-clicking the desktop icon does nothing

**Symptom**: no window appears, and repeated clicks still show nothing.

**Cause**: closing the window sends the app to the tray, so the process is still alive; a second instance is blocked by the single-instance mutex while the first cannot raise its main window.

**Resolution**: look for the app icon in the tray (including the overflow area) and click it. If that fails, launch once with `--takeover`, which ends the existing instance that cannot present a visible main window.

## The installer says the system is not supported

**Symptom**: the installer reports the OS version is too low and aborts.

**Cause**: below Windows 7 SP1. .NET 6 requires SP1 on Windows 7, a hard floor.

**Resolution**: install Windows 7 Service Pack 1 and retry; or use the web site, which has the same features and no OS constraint.

## The installer says the app is running

**Symptom**: a dialog reports the application is running during installation.

**Cause**: the previous version's process is still alive (closing the window sends it to the tray).

**Resolution**: confirm the prompt. The installer first closes it politely (`taskkill`), then force-kills if needed. The app holds no unsaved state and saves settings immediately, so a kill loses nothing; it is relaunched after installation.

## No desktop shortcut after installing

**Symptom**: no app icon on the desktop after installation.

**Cause**: the "create desktop shortcut" task was unchecked during installation; or during an upgrade the user had previously removed the icon, so the installer preserves the current state rather than recreating it.

**Resolution**: rerun the installer and check "create desktop shortcut"; or create one from the Start menu.

## Garbled or missing UI after launch

**Symptom**: the main UI is garbled, shows colour blocks, or does not appear.

**Cause**: the graphics driver is incompatible with D3D11 / OpenGL and the automatic fallback chain cannot recover.

**Resolution**: launch with `--software-render` to force software rendering. It is slower, but the UI appears. The parameter is recognised by release builds too.

## Random grey rectangles on screen

**Symptom**: animation-heavy pages such as the drawing page show randomly positioned pale grey rectangles whose shape changes every frame.

**Cause**: old Windows 7 graphics drivers cannot reliably preserve the previous frame on the render surface, so unredrawn areas expose stale pixels.

**Resolution**: on Windows 7 the app defaults to software rendering, which makes this impossible by construction. If it still occurs, pass `--software-render` explicitly.

## Startup is slow

**Symptom**: several seconds pass before the main window appears.

**Cause**: .NET runtime loading and assembly JIT dominate. Measured: ~6.4s from process start to the main window, ~4.4s of which is runtime loading and JIT.

**Resolution**: expected. Release builds enable ReadyToRun to shorten this. On old machines, disabling unnecessary startup items helps further.

## Command-line switches for diagnosis

| Switch | Effect |
| --- | --- |
| `--software-render` | Force software rendering |
| `--gpu-render` | Allow the GPU fallback chain |
| `--takeover` | On single-instance conflict, end the instance that cannot present a visible main window |
| `--simulate-win7` | Force the Windows 7 code path (development machines) |

---
title: 脚本清单
createTime: 2026/10/19 20:00:00
---

> 网页端维护脚本、Windows 7 兼容版工具脚本与 package.json 脚本

## 网页端 `scripts/`

| 脚本 | 语言 | 用途 |
| --- | --- | --- |
| `check-updates.mjs` | Node.js | GitHub Releases 版本核对；`--apply` 写回，`--only=` 指定软件，`--no-link` 跳过直链存活检查 |
| `resolve-direct-links.mjs` | Node.js | 无 GitHub 仓库软件的直链与版本号解析；`RESOLVERS` 为登记表；`--apply` 写回，`--only=` 指定软件 |
| `untracked-buckets.mjs` | Node.js | 「为什么这个软件无法跟踪」登记表；`import` `RESOLVERS` 以保持单一事实源 |
| `update-ignore.mjs` | Node.js | 维护忽略 / 跳过记录；`--list` 查看已永久忽略的软件 |
| `icon-sync.py` | Python | 图标本地化；`--apply` 下载转换，`--all` 全部远程图标，`--only a,b` 指定软件 |
| `upload-webdav.py` | Python | OpenList WebDAV 上传；建目录 → PUT → 校验 → 清理 |
| `gen-age-key.mjs` | Node.js | 生成 age 密钥对 |

## Windows 7 兼容版 `tools/`

| 脚本 | 语言 | 用途 |
| --- | --- | --- |
| `pack-win7-portable.ps1` | PowerShell | 组装便携版；参数 `-AppDir` `-LauncherDir` `-Version` `-OutRoot` `-Zip` |
| `publish-release-win7.mjs` | Node.js | 发版；参数 `--version` `--channel` `--installer` `--portable` `--notes` `--dry-run` |
| `sync-legal.mjs` | Node.js | 从站点 `法律文本.ts` 生成安装器 `Legal.rtf` 与桌面端条款 |
| `package-tests/` | C# | 打包相关测试工程 |

## package.json 脚本（网页端）

| 脚本 | 命令 |
| --- | --- |
| `dev` | `vite --host=0.0.0.0` |
| `build-only` | `vite build` |
| `build` | `npm run build-only` |
| `build:single` | `cross-env SINGLEFILE=1 vite build` |
| `preview` | `vite preview` |
| `type-check` | `vue-tsc --build` |
| `check` | `npm run type-check && npm run build-only` |

## 常用维护命令速查

```bash
# 软件版本核对（只读）
node scripts/check-updates.mjs --report=报告.md --pending=待审.md
# 软件版本核对（写回）
node scripts/check-updates.mjs --apply --report=报告.md --pending=待审.md
# 非 GitHub 应用直链解析（只读）
node scripts/resolve-direct-links.mjs --report=解析报告.md
# 图标本地化
python scripts/icon-sync.py --apply --only 7-zip
# 查看已永久忽略的软件
node scripts/update-ignore.mjs --list
```

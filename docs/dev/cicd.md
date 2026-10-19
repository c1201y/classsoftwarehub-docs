---
title: CI/CD 与发布
createTime: 2026/10/19 20:00:00
---

> 流水线、产物、版本号规则、发布流程与回滚方案

## 网页端工作流

| 工作流 | 触发 | 职责 |
| --- | --- | --- |
| `deploy.yml` | push `main`、手动 | 构建一次 → GitHub Pages + FTP + OpenList WebDAV 三路发布 |
| `check-updates.yml` | 每周五、手动 | 运行 `check-updates.mjs` 与 `resolve-direct-links.mjs`，可确定的自动写回并触发部署，不可确定的汇总为体检 Issue |
| `create-review-issue.yml` | push（`submissions/` 有变化） | 把提交草稿转为带标签的 Issue；反馈类草稿在建完 Issue 后删除 |
| `review-submission.yml` | Issue 打标签 | 合并草稿到 `软件数据/apps/` 或 `回声洞/messages/`，或删除草稿；结束主动派发 `deploy.yml` |
| `update-ignore-command.yml` | Issue 编辑、评论 | 处理体检 Issue 的复选框与 `/ignore` `/unignore` 命令 |

### 关键约束

1. **`GITHUB_TOKEN` 推送不触发其他工作流**（GitHub 防递归规则），因此 `review-submission.yml` 与 `check-updates.yml` 写回后必须**主动派发** `deploy.yml`（`AGENTS.md:332-335`、`605-606`）。
2. **`review-submission.yml` 必须用 `concurrency: { group: review-submission, queue: max }`**：不要换成 `cancel-in-progress: false`（那只保留「1 running + 1 pending」，新 pending 会顶掉旧的，批量评审会静默丢失条目）（`AGENTS.md:468-472`）。
3. **`create-review-issue.yml` 必须用事件自带的 `before` / `after` SHA 计算 diff 范围**：不要回到 `git diff HEAD~1 HEAD`（checkout 落在那一刻拉到的 tip，两次相近的推送会重复建票或一个都不建），因此 `fetch-depth: 0` 必需（`AGENTS.md:473-476`）。
4. **幂等键必须基于草稿文件路径，不能基于 Issue 标题**：历史上向日葵远程的第二次提交因标题与已关闭的旧 Issue 相同而被静默跳过，草稿永远留在 `submissions/` 而提交者收到「提交成功」（`AGENTS.md:312-318`）。
5. **`deploy.yml` 的 `concurrency.cancel-in-progress` 必须为 `false`**：一次部署要往三个目标发布，中途取消会留下「Pages 是新的、网盘还是旧的」半成品镜像且无任何报错（`.github/workflows/deploy.yml:13-22`）。
6. **`index.html` 必须用相对路径引用资源**（`vite.config.ts` 的 `base: './'`），以适配根目录与子目录两种形态（`AGENTS.md:496-501`）。
7. **行结尾必须保持原样**：`check-updates.mjs` 逐个重写 JSON 文件以保留原始行结尾（`AGENTS.md:607`）。

## Windows 7 兼容版工作流

`.github/workflows/win7-release.yml`：

| 触发 | 说明 |
| --- | --- |
| push tag `dv*` | 自动构建并创建 Release |
| `workflow_dispatch` | 手动运行，可填版本号、更新说明，勾 `publish` 则一并发 Release |

### 流程

1. 检出源码（`fetch-depth: 0`，读 tag / 生成变更说明需完整历史）。
2. 安装 .NET `6.0.x`。
3. 确定版本号：优先 tag（`dv1.0.0` → `1.0.0`，兼容历史 `win7-` 前缀）→ 其次 `inputs.version` → 最后读 `src/Core/ShellConfig.cs` 的 `ShellVersion`。版本号含 `insider` 则通道为 `insider`，否则 `stable`。
4. `dotnet publish` 应用本体（WinExe，不带 `CshConsoleBuild`）。
5. `dotnet publish` 启动器。
6. `tools/pack-win7-portable.ps1` 组装便携版并打 zip。
7. Inno Setup 6 编译安装包。
8. 上传构建产物（artifact 留档 30 天）。
9. 生成更新说明（手动未提供时，取上个 `dv*` tag 至 HEAD 的提交列表）。
10. 创建 GitHub Release（tag 触发或勾选 `publish` 时）。

### 产物

| 形态 | 文件 |
| --- | --- |
| 便携版 | `ClassSoftwareHub-Portable-win7-dv<版本>.zip` |
| 安装版 | `ClassSoftwareHub-Setup-win7-dv<版本>.exe` |

### 本地手动发版

```powershell
$env:GITHUB_TOKEN = "..."     # 需要仓库写权限，不要写进任何文件
node tools\publish-release-win7.mjs `
  --version 1.0.0 --channel stable `
  --installer "dist\installer\ClassSoftwareHub-Setup-win7-dv1.0.0.exe" `
  --portable  "dist\ClassSoftwareHub-Portable-win7-dv1.0.0.zip" `
  --notes "dist\release\notes.md"
```

加 `--dry-run` 可先看摘要（只算哈希、写 `.md5`，不碰 GitHub）（`BUILDING.md:85-96`）。

## 版本号规则

### 网页端

- 对外版本号 `X.Y.Z` + 代号后缀（保留，如 `- Autumn`）：X = 大版本（底层架构 / UI 大改动），Y = 功能更新，Z = 小修小补。
- 内部版本号 `AAAABBCCPRDD`（年 / 月 / 日 / 文件版次），例 `20260915PR01`。
- 需同步修改：`文字设置.ts` 的 `app.version`、`home.subtitle`、`welcome.intro`（3 处）；`src/gallery/Strings/en-US/Resources.ts` 的 `app.version`；`package.json` 的 `version`（裸 `2.3.4`，无代号 / 内部号）与 `package-lock.json` 顶部两个 `version` 字段。
- Release tag 命名 `vX.Y.Z-<codename>`。

### Windows 7 兼容版

`dv` + `主.功能.补丁` + `-insider架构.迭代`，唯一来源是 `ShellConfig.ShellVersion`：

| 位 | 含义 |
| --- | --- |
| 第一位「架构」 | 只有整个应用的技术路线发生重大变动才动 |
| 第二位「功能」 | 每叠加一块新功能涨一次 |
| 第三位「补丁」 | 小功能 / 小更新 / 小修复 |
| `insider` 第一位 | 预览线自己的架构 / 思路基线 |
| `insider` 第二位 | 这条预览线上的具体更改次数 |

流程：做出一个能用的版本 → 发 `1.0.0-insider1.0` → 用户反馈还有问题 → 继续改成 `1.0.0-insider1.1` → 一直改到没问题 → 删掉 `-insider` 后缀 → 上线正式版 `1.0.0`。

::: warning 基数不随便抬
否则旧包会被强制顶掉。
:::

## 回滚方案

| 对象 | 回滚方式 |
| --- | --- |
| 网页端数据 | git 提交历史回溯；`git show <父提交>:软件数据/apps/<id>.json` 找回任一历史版本 |
| 网页端部署 | 重新推送历史提交触发 `deploy.yml`；或手动 `workflow_dispatch` |
| 桌面端版本 | 客户端内置回滚：设置页查看历史版本列表，选择任意版本安装（不校验版本高低） |
| 安装版覆盖安装 | 启动器 + `app\` 两层结构，安装旧版时替换 `app\` 子目录即可 |

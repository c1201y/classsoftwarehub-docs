---
title: 管理员指南
createTime: 2026/10/19 20:00:00
---

> **面向站点维护者与机房管理员** - 账号权限、数据维护、版本核对、日志与备份

## 账号与权限

| 系统 | 权限模型 |
| --- | --- |
| GitHub 仓库 | 公开仓库；写权限由维护者持有。所有凭据通过仓库 Secrets（`FTP_*`、`WEBDAV_*`、`GITHUB_TOKEN`）注入，**任何凭据不得明文写入仓库任何文件（含注释）** —— 公开仓库中写入即公开，且进入 git 历史后无法撤回，只能更换凭据 |
| 提交服务 | 客户端只发内容，GitHub 令牌在服务端；三条提交路径均无需登录 GitHub |
| 反馈标签 | 六个标签 `用户反馈`、`报告问题`、`提出建议`、`逻辑交互`、`链接失效`、`其他问题` 为**一次性手工创建**；细粒度 PAT 无法通过 API 创建，故无法自动化 |
| Issue 操作授权 | 体检 Issue 由机器人创建，因此只有拥有写权限的用户才能编辑其正文，无需额外鉴权门；`/ignore` 命令三重门控：必须是那个 Issue + 评论者需有写权限 + 正文必须以 `/ignore` 或 `/unignore` 开头 |

## 配置管理

**站点文字**：中文站唯一需要修改的文件是仓库根目录 `文字设置.ts`，只改引号内的值，**不得改左侧键名**（键名是页面查找文案的依据，改错会导致文字消失）。英文站同步修改 `src/gallery/Strings/en-US/Resources.ts`。

**AI 导航**：根目录 `AI导航文本.ts`，每个网站一段配置。

**软件数据**：只修改 `软件数据/apps/*.json`，**不得修改** `src/gallery/data/index.ts`（那是加载器）。

**分类**：`软件数据/categories.json` 含 4 个分类（`system` / `schedule` / `teaching` / `other`）。

**桌面端常量**：Windows 7 兼容版的外壳常量集中在 `src/Core/ShellConfig.cs`，包括站点地址、版本号、更新仓库、提交入口、内容清单地址等。发版时主要修改 `ShellVersion` 与 `SiteVersionTarget` / `SiteVersionDisplay`。

## 数据维护

### 软件数据字段

| 字段 | 含义 | 约束 |
| --- | --- | --- |
| `id` | 唯一英文标识，网址为 `#/download/<id>` | 仅允许英文小写、数字与短横线；不得包含 `?` `&` `=` |
| `name` | 软件名称 | 无限制 |
| `icon` | 图标图片链接 | 建议正方形 256×256；留空显示占位 |
| `category` | 所属分类 | 必须是 `categories.json` 中的 key |
| `tagline` | 一句话简介 | 首页卡片 |
| `description` | 详细介绍 | 详情页 |
| `version` `size` `system` | 版本号 / 体积 / 系统限制 | — |
| `website` `github` | 官方网站 / 仓库 | `github` 必须是真仓库地址，非 GitHub 分发软件不填 |
| `notice` | 更新提示 | 可选；详情页下载区上方蓝色提示条 |
| `store` | 商店链接 | 可选；`downloads` 中任一 `url` 指向 `apps.microsoft.com` 也会自动识别为商店卡片 |
| `downloads` | 下载项数组 | 见下 |
| `sort` | 显示顺序 | 数值越小越靠前，省略表示最后 |
| `维护备注` | 维护者备注 | 网页不显示 |

### 下载项格式

```json
{
  "platform": "Windows x64 安装版",
  "note": "官方安装包，GitHub 链接有时不稳定",
  "size": "373 KB",
  "kind": "file",
  "hash": "3F7A9C1D…",
  "url": "https://github.com/xxx/xxx/releases/download/xxx.exe"
}
```

`kind` 决定按钮文案与行为：

| 取值 | 含义 | 详情页表现 |
| --- | --- | --- |
| `file` | 文件直链 | 按钮写「下载」，本页直接开始下载 |
| `page` | 官网下载页 | 按钮写「前往官网」，新标签页打开 |
| `netdisk` | 第三方网盘 | 按钮写「前往网盘」，新标签页打开 |
| `store` | 应用商店 | 自动并入商店卡片 |

`hash` 只填十六进制串，算法按长度自动识别（32 = MD5、40 = SHA-1、56 = SHA-224、64 = SHA-256、96 = SHA-384、128 = SHA-512）。不得将校验值整串写入 `note`（128 位无可断行处，会导致文字溢出卡片）。

### 新增软件登记位置

决定软件以后如何跟随上游更新：

| 软件情况 | 操作 | 由谁跟踪 |
| --- | --- | --- |
| 有 GitHub 仓库 | JSON 填 `github` 字段 | `scripts/check-updates.mjs`，每周读 Releases |
| 无仓库，官网有固定直链 | `scripts/resolve-direct-links.mjs` 的 `RESOLVERS` 加一条 | `resolve-direct-links.mjs`，每周刷新直链与版本号 |
| 无仓库，直链带版本号或藏在页面里 | 同上，用 `probe` 或 `rewrite` | 同上 |
| 确实拿不到 | `scripts/untracked-buckets.mjs` 的 `BUCKETS` 加一条并写明理由 | 无人跟踪，但报告会如实标注原因 |

### 处理他人提交的草稿

草稿工单标题带 `[待审核]`，在 Issue 上打标签处理：

| 标签 | 效果 |
| --- | --- |
| `approved` | 合并为 `apps/<id>.json`。**若站内已有同 id 文件，直接拒绝并说明**，防止误覆盖 |
| `覆盖已存在` | 整份替换站内文件。机器人将「改前 → 改后」差异与旧版完整内容贴进 Issue；旧版可从提交历史中找回 |
| `rejected` | 删除草稿并关闭工单 |

草稿中 `_` 开头的键（如 `_联系方式`、`_提交时间`）为审核专用字段，合并时全部剥除，不会发布到网站。

### 图标本地化

图标挂在 GitHub / jsDelivr 等国内不稳定域名、或体积偏大时，执行 `python scripts/icon-sync.py --apply --only <软件id>`，生成 64×64、≤ 4 KB 的 `src/assets/icons/<id>.webp`，会被构建工具内联进产物。

## 版本自动核对

站点**每周五上午**自动核对每个软件的版本号、下载直链与体积，来源有两条：GitHub Releases（`scripts/check-updates.mjs`）与官方下载源（`scripts/resolve-direct-links.mjs`，覆盖微信、QQ、WPS、腾讯会议、Chrome、火狐、火绒、VLC、希沃系列等 21 款）。

判定原则为**全有或全无**：版本号与下载直链是一个整体，只要有一处无法处理就不做任何修改，否则会出现「版本号已更新、直链仍指向旧文件」的矛盾数据。

脚本无法确定的条目汇总为「软件信息体检 · 待人工确认」Issue，每条提供三个复选框：

| 处理意图 | 操作 | 效果 |
| --- | --- | --- |
| 已在别处改完，需重新检测 | 修改并**提交**后勾选「已改好 → 重新检测」 | 重新执行完整检查，正确则该项消失 |
| 本次暂不处理 | 勾选「本次跳过」 | 仅压制当前这一版问题；上游发布新版或直链更换后自动恢复提醒 |
| 今后不再提醒 | 勾选「不用跟进」 | 永久静音；评论 `/ignore 软件id` 等效 |

::: warning 必须先提交再点重新检测
否则系统读到的仍是旧数据。三个复选框均为一次性操作，不是待办项。
:::

### 命令行用法

```bash
# 仅检查，不修改任何文件
node scripts/check-updates.mjs --report=报告.md --pending=待审.md
# 检查并写回可确定的信息
node scripts/check-updates.mjs --apply --report=报告.md --pending=待审.md
# 非 GitHub 应用的直链解析（只读）
node scripts/resolve-direct-links.mjs --report=解析报告.md
# 查看已永久忽略的软件
node scripts/update-ignore.mjs --list
```

建议配置 GitHub 令牌（匿名接口限流 60 次/小时）：

```bash
export GITHUB_TOKEN=xxx        # Linux / macOS
set GITHUB_TOKEN=xxx           # Windows CMD
```

## 日志查看

**站点**：静态站点无服务端日志。站点自身的访问统计由自建 Cloudflare Worker 提供（`/api/hit` 上报、`/api/stats` 只读查询），其源码不在仓库内。

**桌面端**：

1. 打开设置页的「日志」区。
2. 日志按「启动一次一个目录」组织，目录名即启动时间（形如 `logs\2026-10-11_00-13-41\`）。
3. 每个目录含两个文件：`app.log`（日常全部日志）与 `crash.log`（崩溃与页面加载失败）。
4. 行格式为 `[时间] [级别] [模块] 消息`，支持按级别与模块筛选。
5. 用户反馈问题时，通常只需提供 `crash.log`。

日志目录也可直接在文件管理器中打开：`%LOCALAPPDATA%\ClassSoftwareHub\logs\`。

## 备份与恢复

| 对象 | 备份方式 | 恢复方式 |
| --- | --- | --- |
| 软件数据 | 已在 git 版本控制中，通过提交历史回溯 | `git show <父提交>:软件数据/apps/<id>.json` 可找回任一历史版本 |
| 站点文字 | 同上 | 同上 |
| 桌面端用户设置 | 复制 `%LOCALAPPDATA%\ClassSoftwareHub\` 目录 | 粘贴回原路径 |
| 桌面端内容缓存 | 删除后重启可重新同步，无需专门备份 | — |
| 桌面端日志 | 复制 `%LOCALAPPDATA%\ClassSoftwareHub\logs\` | — |

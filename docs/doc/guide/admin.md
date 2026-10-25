---
title: 管理员指南
createTime: 2026/10/19 20:00:00
---

> **面向站点维护者与机房管理员** - 权限、数据维护、后端运维、版本核对与备份

## 系统组成

| 系统 | 仓库 / 位置 | 权限模型 |
| --- | --- | --- |
| 网站（含软件数据） | `c1201y/ClassSoftwareHub` | 公开仓库；写权限由维护者持有。凭据通过仓库 Secrets（`FTP_*`、`WEBDAV_*`、`GITHUB_TOKEN`）注入 |
| 后端服务 | `c1201y/csh-api` → `api.classsoftwarehub.cn` | 腾讯 EdgeOne Pages Functions；密钥只放环境变量 |
| 对象存储 | 阿里云 OSS 私有桶 `classsoftwarehub`（cn-shanghai） | 仅后端持有 AccessKey；浏览器通过短时签名直传 / 票据下载 |
| 两个桌面端 | `ClassSoftwareHub-Desktop`、`ClassSoftwareHub-windows7` | 各自独立发布与更新 |

::: danger 凭据
**任何凭据不得明文写入仓库任何文件（含注释）**。公开仓库中写入即公开，且进入 git 历史后无法撤回，只能更换凭据。后端密钥统一通过 EdgeOne 环境变量配置。
:::

## 配置管理

**站点文字**：中文站的界面文案主要在仓库根目录 `文字设置.ts`，只改引号内的值，**不得改左侧键名**。条款与法律文本在 `法律文本.ts`，鸣谢名单在 `鸣谢文本.ts`，AI 导航文案在 `AI导航文本.ts`；英文界面文案在 `src/gallery/Strings/en-US/Resources.ts`。

**AI 导航**：根目录 `AI导航文本.ts`，每个网站一段配置。

**软件数据**：只修改 `软件数据/apps/*.json`，**不得修改** `src/gallery/data/index.ts`（加载器）。

**分类**：`软件数据/categories.json` 含 6 个分类：

| key | 名称 |
| --- | --- |
| `classroom` | 教学课堂 |
| `office` | 办公通讯 |
| `system` | 系统工具 |
| `media` | 影音图像 |
| `network` | 网络工具 |
| `utility` | 其他工具 |

**平台**：`软件数据/platforms.json` 定义 Windows / macOS / Linux / Android / iOS / Web 六个平台及版本范围。

**桌面端常量**：两个桌面端的外壳常量各自集中在 `Core/ShellConfig.cs`，包括站点地址、版本号、更新仓库、内容清单地址等。发版时主要修改 `ShellVersion` 与 `SiteVersionTarget` / `SiteVersionDisplay`：

| 项目 | Win10 桌面端 | Windows 7 兼容版 |
| --- | --- | --- |
| 更新仓库 | `ClassSoftwareHub-Desktop` | `ClassSoftwareHub-windows7` |
| 安装标识 | `{7A2C4D18-9F31-4C6B-8E5A-2D0B7F4A1C93}` | `{C4E7B2A1-6D38-4F5C-9A17-0E8B3D5C7F42}` |
| 默认目录 | `%LOCALAPPDATA%\Programs\ClassSoftwareHub` | `%LOCALAPPDATA%\Programs\ClassSoftwareHub-Win7` |
| 安装包 | `ClassSoftwareHub-Setup-dv<版本>.exe` | `ClassSoftwareHub-Setup-win7-dv<版本>.exe` |

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
| `downloads` | 下载项数组 | 可按平台分组 |
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

`hash` 只填十六进制串，算法按长度自动识别（32 = MD5、40 = SHA-1、56 = SHA-224、64 = SHA-256、96 = SHA-384、128 = SHA-512）。不得将校验值整串写入 `note`。

### 处理他人提交的草稿

草稿工单标题带 `[待审核]`，在 Issue 上打标签处理：

| 标签 | 效果 |
| --- | --- |
| `approved` | 合并为 `apps/<id>.json`。**若站内已有同 id 文件，直接拒绝并说明** |
| `覆盖已存在` | 整份替换站内文件；机器人把差异与旧版完整内容贴进 Issue |
| `rejected` | 删除草稿并关闭工单 |

草稿中 `_` 开头的键（如 `_联系方式`、`_提交时间`）为审核专用字段，合并时全部剥除。

### 图标本地化

图标挂在 GitHub / jsDelivr 等国内不稳定域名、或体积偏大时，执行：

```bash
python scripts/icon-sync.py --apply --only <软件id>
```

生成 64×64、≤ 4 KB 的 `src/assets/icons/<id>.webp`，构建时内联进产物。

## 后端运维

### 源码与部署

后端源码在 `c1201y/csh-api`，主入口为 `functions/api/[[default]].js`，部署在腾讯 EdgeOne Pages，对外域名 `https://api.classsoftwarehub.cn`。根路径 `/` 提供状态面板（`functions/status.js`），`/api/status` 提供 JSON 健康检查。

状态面板会逐项显示：状态存储（Blob/KV）、OSS 对象存储、GitHub API、加速签名配置、ECS 中继（方法一）、后端直连 OSS（方法二）、当前下载模式，以及公告 / 投稿 / 直传 / 回声洞 / 反馈 / 下载闸门六项功能的可用性。

### 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `GITHUB_OWNER` / `GITHUB_REPO` / `GITHUB_BRANCH` | `c1201y` / `classsoftwarehub` / `main` | 软件数据与提交草稿所在仓库 |
| `GITHUB_TOKEN` | 无 | 读写仓库、创建 Issue；未配置时回声洞 / 反馈不可用 |
| `OSS_BUCKET` | `classsoftwarehub` | OSS 桶名（私有） |
| `OSS_REGION` / `OSS_ENDPOINT` | `cn-shanghai` / `oss-cn-shanghai.aliyuncs.com` | OSS 区域与端点 |
| `OSS_PUBLIC_BASE` | `https://classsoftwarehub.oss-cn-shanghai.aliyuncs.com` | 公网访问基址（探测用） |
| `OSS_PREFIX` | `upload` | 直传对象前缀 |
| `OSS_ACCESS_KEY_ID` / `OSS_ACCESS_KEY_SECRET` | 无 | OSS V4 签名凭据 |
| `SIGN_API_KEY` | 无 | 调用 GitHub 加速签名节点的密钥 |
| `DL_SIGN_SECRET` | 无 | 下载票据 HMAC 密钥；未配置时使用空密钥，生产环境必须设置 |
| `DL_MODE` | `auto` | 下载模式：`auto` / `relay` / `backend` / `direct` |
| `DL_DAILY_LIMIT` | `25` | 每设备每日下载票据上限 |
| `DL_RELAY_MONTHLY_GB` / `DL_DIRECT_MONTHLY_GB` | `0` | 中继 / 直连月度流量上限，0 = 不限制 |
| `RELAY_HOST` / `RELAY_PORT` / `RELAY_SCHEME` / `RELAY_TOKEN` | 无 / `8091` / `http` / 无 | ECS 中转（OSS 内网） |
| `GC_ORPHAN_MINUTES` | `15` | 无登记对象的孤儿文件清理阈值 |
| `GC_STALE_RECORD_HOURS` | `24` | 失效登记记录的清理阈值 |
| `SUBMIT_MAX_PER_DAY` | `6` | 每设备每日投稿上限 |
| `SUBMIT_MAX_PENDING` | `3` | 每设备待审核投稿上限 |
| `SUBMIT_REQUIRE_SOURCE` | `true` | 是否要求投稿提供来源 |
| `SIGN_PER_IP_PER_DAY` / `SIGN_GLOBAL_PER_DAY` | `20` / `3000` | 加速签名次数限额 |
| `SIGN_GLOBAL_BYTES_PER_DAY` | `21474836480`（20 GiB） | 加速签名每日流量上限 |
| `PURGE_TOKEN` | 无 | 管理接口令牌（请求头 `X-Purge-Token`） |
| `ALLOWED_ORIGIN` | `*` | CORS 允许来源 |

未配置 `OSS_*` 时，投稿直传与下载闸门不可用；未配置 `GITHUB_TOKEN` 时，回声洞与反馈不可用；未配置 `SIGN_API_KEY` 时，自建加速签名不可用；未配置 `DL_SIGN_SECRET` 时下载票据改用空密钥签名。状态页会明确列出缺失项。

### 下载模式

| 模式 | 行为 |
| --- | --- |
| `auto` | 优先 ECS 中继（OSS 内网），不可用时回退后端直连 OSS |
| `relay` | 固定走 ECS 中继 |
| `backend` | 固定由 EdgeOne 函数直连 OSS |
| `direct` | 票据直接指向 OSS 公网签名地址 |

运行时可经 `POST /api/dl-mode` 覆盖（写入状态存储），无需重新部署；`GET /api/dl-mode` 查看当前值与来源。

### 管理接口

以下接口需在请求头携带 `X-Purge-Token`：

| 接口 | 方法 | 用途 |
| --- | --- | --- |
| `/api/purge` | POST | 删除指定对象；传 `requireRegistry: true` 时拒绝删除不在登记表中的对象 |
| `/api/files` | GET | 列出登记的文件 |
| `/api/dl-stats` | GET | 下载统计、模式、限额与上次 GC |
| `/api/link` | POST | 生成对象访问链接 |
| `/api/promote` | POST | 将临时对象转为正式对象 |
| `/api/gc` | POST | 手动触发垃圾回收；默认 `dry` 预览，传 `{"dry": false}` 才真正删除 |
| `/api/registry-sync` | POST | 同步 OSS 与本地登记表；默认 `dry` 预览，传 `{"dry": false}` 才写入 |
| `/api/dl-mode` | GET / POST | 查看 / 修改下载模式与限额 |
| `/api/oss-check` | GET | 探测对象是否可通过公网访问 |

公告接口（`/api/announce/send|poll|list`）用于「教室喊话」工具：发送方需 6 位配对码，接收端以设备 ID + 配对码轮询。

### 垃圾回收

下载票据约 15 分钟有效。后端在签发票据时**惰性触发** GC（距上次超过 20 分钟才真正执行），清理：

- 超过 `GC_ORPHAN_MINUTES` 仍无登记对象的孤儿文件
- 超过 `GC_STALE_RECORD_HOURS` 的失效登记记录

手动排查时 `POST /api/gc` 默认就是预览（`dry` 不为 `false` 即只报告不删除）；确认无误后再带 `{"dry": false}` 正式执行。

## 版本自动核对

站点**每周五上午**自动核对每个软件的版本号、下载直链与体积，来源有两条：GitHub Releases（`scripts/check-updates.mjs`）与官方下载源（`scripts/resolve-direct-links.mjs`）。

判定原则为**全有或全无**：版本号与下载直链是一个整体，只要有一处无法处理就不做任何修改。

脚本无法确定的条目汇总为「软件信息体检报告 · 待人工处理」Issue，每条提供三个复选框：`已改好 → 重新检测`、`本次跳过`、`不用跟进`（也可评论 `/ignore 软件id` 永久忽略）。

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

建议配置 `GITHUB_TOKEN`（匿名接口限流 60 次/小时）。

## 日志查看

**后端**：在 EdgeOne Pages 控制台查看函数日志。函数内的 `console.error`（如中继异常）会出现在日志中；敏感值不得写入日志。

**站点**：静态站点无服务端日志。前端访问统计由独立统计服务提供。

**桌面端**：

1. 打开设置页的「日志」区。
2. 日志按「启动一次一个目录」组织，目录名即启动时间（形如 `logs\2026-10-11_00-13-41\`）。
3. 每个目录含两个文件：`app.log`（日常全部日志）与 `crash.log`（崩溃与页面加载失败）。
4. 行格式为 `[时间] [级别] [模块] 消息`，支持按级别与模块筛选。
5. 用户反馈问题时，通常只需提供 `crash.log`。

日志目录也可直接在文件管理器中打开：`%LOCALAPPDATA%\ClassSoftwareHub\logs\`。两个桌面端共用该目录。

## 备份与恢复

| 对象 | 备份方式 | 恢复方式 |
| --- | --- | --- |
| 软件数据 | 已在 git 版本控制中，通过提交历史回溯 | `git show <父提交>:软件数据/apps/<id>.json` |
| 站点文字 | 同上 | 同上 |
| 后端配置 | 记录 EdgeOne 环境变量清单（密钥另存密码库） | 在控制台重新配置 |
| 后端状态 | 状态存储由 EdgeOne Blob 托管；对象在 OSS | 先 `POST /api/registry-sync` 预览，确认后带 `{"dry": false}` 重建登记表 |
| 桌面端用户设置 | 复制 `%LOCALAPPDATA%\ClassSoftwareHub\` 目录 | 粘贴回原路径 |
| 桌面端内容缓存 | 删除后重启可重新同步，无需专门备份 | — |
| 桌面端日志 | 复制 `%LOCALAPPDATA%\ClassSoftwareHub\logs\` | — |

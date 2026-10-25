---
title: 接口清单
createTime: 2026/10/19 20:00:00
---

> 后端路由、GitHub API、自建加速与站点内容清单

## 后端（EdgeOne Pages Functions）

后端仓库为 `c1201y/csh-api`，对外基址 `https://api.classsoftwarehub.cn`，主入口 `functions/api/[[default]].js`。根路径 `/` 为状态面板，所有业务路由以 `/api/` 开头。

### 公共路由

| 路由 | 方法 | 用途 | 主要调用方 |
| --- | --- | --- | --- |
| `/api/status` | GET | 健康检查：存储、OSS、GitHub API、加速签名、中继、下载模式 | 状态页、运维 |
| `/api/submit` | POST | 提交软件草稿（写仓库 `submissions/`） | 网页端 `SubmitPage.vue`、两个桌面端 |
| `/api/echocave` | POST | 回声洞投稿 | 网页端、两个桌面端 |
| `/api/feedback` | POST | 反馈中心 | 网页端、两个桌面端 |
| `/api/oss-sign` | POST | 投稿附件 OSS 直传签名 | 网页端 `ossUpload.ts`、桌面端 `OssUpload.cs` |
| `/api/mirror-sign` | GET | 为 GitHub 文件签发自建加速链接 | 网页端 `githubMirror.ts`、桌面端 `MirrorSign.cs` |
| `/api/icon` | GET / HEAD | 图标只读代理（对象键 `k`，带缓存） | 审核工单、网页端 |
| `/api/dl-ticket` | POST | 申请 OSS 文件下载票据 | 网页端 `ossDownload.ts`、桌面端 |
| `/api/dl` | GET / HEAD | 凭票据流式下载（支持 Range / 206） | 同上 |
| `/api/announce/send` | POST | 发送班级公告（6 位配对码） | 网页端「教室喊话」 |
| `/api/announce/poll` | GET | 设备轮询公告 | 桌面端 |
| `/api/announce/list` | GET | 列出某配对码下的设备 | 网页端 |

### 管理路由

以下路由需请求头 `X-Purge-Token: <PURGE_TOKEN>`：

| 路由 | 方法 | 用途 |
| --- | --- | --- |
| `/api/purge` | POST | 删除对象；传 `requireRegistry: true` 时只允许删除登记表内的对象 |
| `/api/files` | GET | 列出登记文件 |
| `/api/dl-stats` | GET | 下载统计、模式、限额、上次 GC |
| `/api/link` | POST | 生成对象访问链接 |
| `/api/promote` | POST | 临时对象转正式对象 |
| `/api/gc` | POST | 手动垃圾回收；默认 `dry` 预览，传 `{"dry": false}` 才删除 |
| `/api/registry-sync` | POST | OSS 与登记表同步；默认 `dry` 预览，传 `{"dry": false}` 才写入 |
| `/api/dl-mode` | GET / POST | 查看 / 修改下载模式、下载限额与 GC 阈值 |
| `/api/oss-check` | GET | 探测对象公网可达性 |

### 下载协议

1. 客户端 `POST /api/dl-ticket`，提交对象键、设备指纹。
2. 后端校验对象前缀（`upload/`、`soft/`、`releases/`）、设备每日限额（默认 25 次）与登记状态，返回短时票据。
3. 客户端带票据请求 `GET /api/dl`，后端按当前模式（`auto` / `relay` / `backend` / `direct`）取流，支持 `Range`。

::: warning 票据有效期
票据约 15 分钟有效，过期需重新申请。设备每日次数由 `DL_DAILY_LIMIT` 控制（默认 25）。
:::

### 加速签名协议

1. 客户端带 GitHub 原始地址请求 `GET /api/mirror-sign?u=<url>`。
2. 后端校验主机与路径，调用自建签名节点，返回短时链接。
3. 链接指向 `https://download.classsoftwarehub.cn/d?u=&e=&s=`，由 nginx 校验签名、有效期与 Referer 白名单。
4. 签名失败时客户端回退公共镜像与 GitHub 原始地址。

签名限额：每 IP 每日 20 次、全局每日 3000 次、全局每日流量 20 GiB（均可配置）。

## GitHub API（客户端直接调用）

| 用途 | 端点 |
| --- | --- |
| 检查更新 / 获取 Release 列表 | `api.github.com/repos/{owner}/{repo}/releases` |
| 软件数据分支头 sha | `api.github.com/repos/{owner}/{repo}/commits/{branch}` |
| 软件数据目录列表 | `api.github.com/repos/{owner}/{repo}/contents/{dir}` |
| 文件内容 | `raw.githubusercontent.com` 及其镜像 |
| 从 GitHub 一键读取 | `api.github.com/repos/{owner}/{repo}/releases` 等 |

### 回退链

| 类型 | 入口（按序） |
| --- | --- |
| API | `https://service.132614.xyz/api/gh`（本站代理）→ `https://api.github.com` → `https://gh-proxy.com/https://api.github.com` → `https://ghfast.top/https://api.github.com` |
| Raw | `https://raw.githubusercontent.com/...` → `https://cdn.jsdelivr.net/gh/...` → `https://fastly.jsdelivr.net/gh/...` → `https://gh-proxy.com/https://raw.githubusercontent.com/...` |
| Release 资产 | 自建加速 → `ghfast.top` → `gh-proxy.com` → `ghproxy.net` → `gh.ddlc.top` → GitHub 原始地址 |

## 站点内容清单（预留，尚未发布）

桌面端的内容同步顺序是：**先直读 GitHub 仓库**（`软件数据/`），失败后才尝试站点清单，最后才尝试网盘副本。

| 地址 | 说明 |
| --- | --- |
| `https://classsoftwarehub.us.ci/content/manifest.json` | 桌面端常量里的主站清单地址，含每文件 path + sha256；**站点当前没有发布该文件，请求会 404** |
| `https://pan.132614.xyz/dav/%E7%BD%91%E7%AB%99/content/manifest.json` | 网盘备用清单，同样可能不存在 |

::: warning 不要把它当成可用的数据源
站点和网盘都没有发布 `content/manifest.json` 时，客户端会回退到本机缓存；首次使用且 GitHub 不可达时，界面会显示「尚未获取到内容」。
:::

## 站点与外部地址

| 用途 | 地址 |
| --- | --- |
| 主站 | `https://classsoftwarehub.cn` |
| 备用站点 | `https://classsoftwarehub.132614.xyz`、`https://classsoftwarehub.xfane.com` |
| 后端 | `https://api.classsoftwarehub.cn` |
| 后端状态面板 | `https://api.classsoftwarehub.cn/` |
| 自建 GitHub 加速 | `https://download.classsoftwarehub.cn` |
| WebView2 下载页 | `https://developer.microsoft.com/microsoft-edge/webview2/` |

::: info 历史域名
`cshapi.132614.xyz`、`submit.132614.xyz` 是迁移前的 Cloudflare Worker 入口。网页端源码已切换至 `api.classsoftwarehub.cn`；两个桌面端仍保留旧域常量，按实际代码为准，升级后统一切换到新域。
:::

---
title: 接口清单
createTime: 2026/10/19 20:00:00
---

> 提交服务路由、GitHub API 与站点内容清单

## 提交服务路由

| 路由 | 方法 | 用途 | 客户端调用方 |
| --- | --- | --- | --- |
| `/api/submit` | POST | 提交软件草稿 | 网页端 `SubmitPage.vue`、桌面端 `Pages/SubmitPage.axaml.cs` |
| `/api/echocave` | POST | 回声洞投稿 | 网页端 `EchoCaveCard.vue`、桌面端 `Services/EchoCaveService.cs` |
| `/api/feedback` | POST | 反馈中心 | 网页端 `FeedbackPage.vue`、桌面端 `Services/FeedbackSubmit.cs` |
| `/api/oss-sign` | POST | OSS 预签名 | 网页端 `ossUpload.ts`、桌面端 `Services/OssUpload.cs` |
| `/api/dl-ticket` | POST | 下载票据 | 网页端 `ossDownload.ts`、桌面端下载管理 |
| `/api/dl` | GET | 凭票据取流 | 同上 |
| `/api/icon` | GET | 图标只读 | 审核工单内查看 |
| `/api/hit` | POST | 访问统计上报 | 网页端 `visitor.ts` |
| `/api/stats` | GET | 访问统计查询 | 本地开发 |

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
| API | `https://api.github.com` → `https://gh-proxy.com/https://api.github.com` → `https://ghfast.top/https://api.github.com` |
| Raw | `https://raw.githubusercontent.com/...` → `https://cdn.jsdelivr.net/gh/...` → `https://fastly.jsdelivr.net/gh/...` → `https://gh-proxy.com/https://raw.githubusercontent.com/...` |

## 站点内容清单（备用来源）

| 地址 | 说明 |
| --- | --- |
| `https://classsoftwarehub.us.ci/content/manifest.json` | 主站内容清单（含每文件 path + sha256） |
| `https://pan.132614.xyz/dav/%E7%BD%91%E7%AB%99/content/manifest.json` | 网盘备用清单 |

## 站点地址

| 用途 | 地址 |
| --- | --- |
| 主站 | `https://classsoftwarehub.us.ci` |
| 备用站点 | `https://classsoftwarehub.132614.xyz` |
| 提交服务入口 | `https://cshapi.132614.xyz`、`https://submit.132614.xyz` |
| 访问统计服务 | `https://service.132614.xyz` |
| WebView2 下载页 | `https://developer.microsoft.com/microsoft-edge/webview2/` |

# ClassSoftwareHub 文档站

ClassSoftwareHub 项目的中英文文档站，覆盖网页端、桌面端（WinUI 3 原版）与 Windows 7 兼容版。

站点使用 **VuePress 2 + vuepress-theme-plume** 搭建，架构参考 [SECTL/SecRandom-docs](https://github.com/SECTL/SecRandom-docs)，文档内容由本项目独立撰写。

## 快速开始

### 环境要求

- Node.js 20+（推荐 22 LTS）
- pnpm

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm run docs:dev
```

开发服务器将运行在 [http://localhost:5173](http://localhost:5173)。

### 构建生产版本

```bash
pnpm run docs:build
```

构建结果输出到 `docs/.vuepress/dist` 目录。

### 预览生产版本

```bash
pnpm run docs:preview
```

## 目录结构

```
docs/
├── index.md                  首页（hero + 特性分区）
├── download.md               下载页
├── team.md                   团队页
├── friends.md                致谢与许可
├── doc/                      使用文档
│   ├── overview.md           概览
│   ├── guide/                网页端 / 桌面端 / Windows 7 / 管理员 / FAQ / 故障排查
│   └── appendix/             接口 / 配置项 / 数据模型 / 脚本 / 术语表
├── dev/                      开发文档
│   ├── index.md              阅读顺序
│   ├── architecture.md       总体架构与仓库关系
│   ├── stack.md              技术栈与目录结构
│   ├── requirements.md       环境要求
│   ├── build.md              构建、运行与测试
│   ├── config.md             配置说明
│   ├── web.md                网页端开发
│   ├── desktop.md            桌面端开发
│   ├── win7.md               Windows 7 兼容开发
│   ├── api.md                接口与数据模型
│   ├── cicd.md               CI/CD 与发布
│   ├── security.md           安全与权限
│   └── contribute.md         贡献指南
├── faq/                      常见问题（文章集合）
└── .vuepress/
    ├── config.ts             站点配置
    ├── plume.config.ts       主题配置
    ├── navbar.ts             顶部导航（中英对齐）
    ├── collections.ts        侧边栏集合（中英对齐）
    ├── client.ts             客户端配置
    ├── public/logo.png       站点图标
    └── theme/                主题覆盖
        ├── components/       Layout / TeamCard / AsideNav
        └── styles/custom.css 品牌色与布局微调
```

## 内容编写指南

- 所有文档使用 Markdown 格式编写。
- 在 `docs/` 下创建新的 `.md` 文件即可自动生成对应页面。
- 使用 Frontmatter 配置页面元数据（`title`、`createTime` 等）。
- 侧边栏在 `docs/.vuepress/collections.ts` 中配置，顶部导航在 `docs/.vuepress/navbar.ts` 中配置。
- 新增内置工具或页面后，需同步更新 `collections.ts` 与 `navbar.ts`，并保持中英文两项逐项对齐。

## 品牌色

站点品牌色为青色系（`#2f8f83` / `#238076` / `#0f7a6c`），定义在 `docs/.vuepress/theme/styles/custom.css` 的 `:root` 中。深色模式变量已预留，可按需取消注释。

## 贡献指南

1. Fork 本项目
2. 修改并提交 commit
3. 推送到 `main` 分支或新建 `dev` 分支
4. 创建 Pull Request
5. 等待审核后合并

## 许可证

文档内容与 ClassSoftwareHub 项目一致，采用 **GPL-3.0**。站点架构参考 [SECTL/SecRandom-docs](https://github.com/SECTL/SecRandom-docs)。

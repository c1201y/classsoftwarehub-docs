---
title: 贡献指南
createTime: 2026/10/19 20:00:00
---

> 分支规范、提交规范、代码风格与评审流程

## 分支规范

- 主分支为 `main`。
- 不得擅自 commit / push：维护者审查后才推送。无明确指示时保持在工作区。
- 后端源码在独立仓库 `csh-api`；旧提交服务的源码备份在网站仓库的 `submit-worker` 分支（**不是** `main`，不要在工作区找该文件夹），那是迁移前备份，不再作为部署源。
- 后端改动不要直接把密钥写进代码；新增配置项必须同时补 `ENV_DEFAULTS`（非敏感默认值）与文档。

## 提交规范

提交信息使用简短中文短语，遵循既有历史风格：

```text
chore(version): ...
review: approved #12
fix: ...
```

提交信息沿用仓库既有历史风格即可。

## 代码风格

| 项 | 要求 |
| --- | --- |
| 网页端文案 | 只改 `文字设置.ts` 引号内的值，不改键名 |
| 网页端数据 | 只改 `软件数据/apps/*.json`，不改加载器 |
| 网页端上游目录 | `src/components`、`src/styles`、`src/utils` 保持结构与上游一致，便于 diff |
| 网页端样式 | 页面专属样式写成组件内 scoped 规则 |
| 网页端行结尾 | 无 `.gitattributes`，行结尾混合；编辑前读实际字节并保持原样 |
| 桌面端命名空间 | 统一 `ClassSoftwareHub.Desktop.*` |
| Win10 桌面端 | 单进程；页面放 `Pages/`，窗口放 `Views/`，业务放 `Services/`，常量放 `Core/ShellConfig.cs`；平台 API 直接调用，不做额外抽象层 |
| Windows 7 平台抽象 | 所有 P/Invoke 集中在 `src/Platform/NativeMethods*.cs`，禁止在业务代码另写 `DllImport` |
| Windows 7 版本判定 | 一律走 `Platform.OsInfo`，不得使用 `Environment.OSVersion` |
| Windows 7 移植原则 | 语义等价 + UI 1:1；原注释（尤其「为什么这么写」）不删不精简；只在 WinUI API 确实不存在时才偏离 |
| Windows 7 平台目录 | 不得修改 `src/Platform/` 下已有文件；缺什么在该目录下新增文件并说明 |
| Windows 7 C# 版本 | 锁 10，不引入 C# 11/12 特性 |
| 后端 | 只改 `functions/`；路由按现有风格集中注册；错误返回 `{ error }`；管理接口必须走 `adminOk` |
| 通用 | 仓库是公开的：不写「已知问题 / TODO」段落、不写过往配置失误记录、不写沙箱或工具绕法、不写临时文件路径 |

## 评审流程

1. **提交前自检**：网页端触碰 `.ts` / `.vue` 后运行 `npm run type-check`；Win10 版运行 `dotnet build ClassSoftwareHub.Desktop.csproj -c Debug`；Windows 7 版运行 `dotnet build src\ClassSoftwareHub.Win7.csproj -c Release`；后端部署前跑 `node smoke.mjs` 并检查 `/api/status`。
2. **提交 Pull Request 或 Issue**。
3. **维护者评审**。
4. **访客提交的软件**：进入 `submissions/` → `create-review-issue.yml` 建 `[待审核]` Issue → 维护者打 `approved` / `覆盖已存在` / `rejected` → `review-submission.yml` 执行合并或删除 → 主动派发 `deploy.yml`。
5. **反馈类提交**：建 Issue 后草稿即删除（反馈的终点就是 Issue，无合并步骤）。

## 提交前必读

| 仓库 | 必读文件 |
| --- | --- |
| 网页端 | `README.md`、`软件数据/README-维护手册.md` |
| Windows 7 版 | `README.md`、`BUILDING.md`、`src/PORTING.md` |

## 移植工作交付要求

参与 Windows 7 移植时，每个交付须用中文总结，并包含：

1. 移植了哪些文件（原路径 → 新路径），各多少行。
2. 编译结果（自己文件的错误是否清零）。
3. 所有偏离原版的地方，逐条说明「原写法 → 新写法 → 为什么」。
4. 没做完 / 不敢确定 / 需要主控决策的事项，直说，不要粉饰。
5. 依赖了哪些他人负责的文件（如果它们还没就绪）。

依据：`src/PORTING.md:208-216`。

import { defineCollection, defineCollections } from "vuepress-theme-plume";

/**
 * 侧边栏约定（中英必须逐项对齐，只有文字不同）：
 * - doc 集合：`概览` → `使用文档` → `附录`
 * - 使用文档分组顺序：项目概述 → 网页端 → 桌面端（跨版本）→ Windows 10 版 → Windows 7 版 → 管理 → 排障
 * - 每个分组都带同名 icon，组内条目全部是二级，不再出现「半截分组」。
 */
const SETTINGS_GROUPS = {
  intro: { zh: '项目概述', en: 'Overview', icon: 'material-symbols:info-outline-rounded' },
  web: { zh: '网页端', en: 'Web', icon: 'material-symbols:language-rounded' },
  desktop: { zh: '桌面端', en: 'Desktop', icon: 'material-symbols:desktop-windows-rounded' },
  win10: { zh: 'Windows 10 版', en: 'Windows 10', icon: 'material-symbols:desktop-mac-rounded' },
  win7: { zh: 'Windows 7 版', en: 'Windows 7', icon: 'material-symbols:window-rounded' },
  admin: { zh: '管理员指南', en: 'Administration', icon: 'material-symbols:admin-panel-settings-rounded' },
  trouble: { zh: '故障排查', en: 'Troubleshooting', icon: 'material-symbols:troubleshoot-rounded' },
} as const;

// 中文
const Doc = defineCollection({
  type: "doc",
  dir: "doc",
  linkPrefix: "/doc",
  title: "文档",
  meta: { createTime: "long" },
  sidebar: [
    { text: '概览', icon: 'material-symbols:overview-outline-rounded', link: 'overview' },
    { text: '使用文档', icon: 'ep:guide', prefix: 'guide', items: [
      { text: '网页端使用说明', link: 'web' },
      { text: '桌面端使用说明', link: 'desktop' },
      { text: 'Windows 10 版本使用说明', link: 'win10' },
      { text: 'Windows 7 版本使用说明', link: 'win7' },
      { text: '管理员指南', link: 'admin' },
      { text: '常见问题', link: 'faq' },
      { text: '故障排查', link: 'troubleshooting' },
    ] },
    { text: '附录', icon: 'material-symbols:list-alt-rounded', prefix: 'appendix', items: [
      { text: '接口清单', link: 'api' },
      { text: '配置项清单', link: 'config' },
      { text: '数据模型清单', link: 'models' },
      { text: '脚本清单', link: 'scripts' },
      { text: '术语表', link: 'glossary' },
    ] },
  ],
});

const Dev = defineCollection({
  type: "doc",
  dir: "dev",
  linkPrefix: "/dev",
  title: "开发",
  meta: { createTime: "long" },
  sidebar: [
    { text: '开发文档', icon: 'material-symbols:code-blocks-rounded', link: 'index' },
    { text: '架构与栈', icon: 'material-symbols:architecture-rounded', items: [
      { text: '总体架构与仓库关系', link: 'architecture' },
      { text: '技术栈与目录结构', link: 'stack' },
      { text: '环境要求', link: 'requirements' },
    ] },
    { text: '构建与配置', icon: 'lucide:hammer', items: [
      { text: '构建、运行与测试', link: 'build' },
      { text: '配置说明', link: 'config' },
    ] },
    { text: '各端开发', icon: 'lucide:layout-panel-left', items: [
      { text: '网页端开发说明', link: 'web' },
      { text: 'Windows 10 桌面端开发说明', link: 'desktop' },
      { text: 'Windows 7 兼容开发说明', link: 'win7' },
    ] },
    { text: '接口与数据', icon: 'lucide:database', items: [
      { text: '接口与数据模型', link: 'api' },
    ] },
    { text: '工程与协作', icon: 'lucide:hand-heart', items: [
      { text: 'CI/CD 与发布', link: 'cicd' },
      { text: '安全与权限', link: 'security' },
      { text: '贡献指南', link: 'contribute' },
    ] },
  ],
});

const Faq = defineCollection({
  type: "post",
  dir: "faq",
  title: "常见问题",
  link: "/faq/",
  tags: false,
  archives: false,
  categories: false,
  meta: { createTime: "long" },
});

// English（英文站目前只维护概览与网页端说明，侧边栏只列真实存在的页面）
const EnDoc = defineCollection({
  type: "doc",
  dir: "doc",
  linkPrefix: "/doc",
  title: "Documentation",
  meta: { createTime: "long" },
  sidebar: [
    { text: 'Overview', icon: 'material-symbols:overview-outline-rounded', link: 'overview' },
    { text: 'User Guide', icon: 'ep:guide', prefix: 'guide', items: [
      { text: 'Web Client', link: 'web' },
    ] },
  ],
});

const EnFaq = defineCollection({
  type: "post",
  dir: "faq",
  title: "FAQ",
  link: "/faq/",
  tags: false,
  archives: false,
  categories: false,
  meta: { createTime: "long" },
});

export const zhcollections = defineCollections([Doc, Dev, Faq]);
export const encollections = defineCollections([EnDoc, EnFaq]);

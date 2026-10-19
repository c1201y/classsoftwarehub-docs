import { viteBundler } from '@vuepress/bundler-vite'
import { defineUserConfig } from 'vuepress'
import { plumeTheme } from 'vuepress-theme-plume'
import { zhNavbar, enNavbar } from './navbar'
import { zhcollections, encollections } from './collections'

export default defineUserConfig({
  base: '/',
  lang: 'zh-CN',
  title: 'ClassSoftwareHub',
  description: '电教委员常用软件下载站 —— 网页端、桌面端与 Windows 7 兼容版的项目文档',

  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
  ],

  bundler: viteBundler(),
  shouldPrefetch: false,

  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'ClassSoftwareHub',
      description: '',
    },
    '/en/': {
      lang: 'en-US',
      title: 'ClassSoftwareHub',
      description: '',
    },
  },

  theme: plumeTheme({
    /* 添加您的部署域名, 有助于 SEO, 生成 sitemap */
    hostname: 'https://classsoftwarehub.us.ci/',

    /* 文档仓库配置，用于 editLink */
    docsRepo: 'https://github.com/c1201y/ClassSoftwareHub',
    docsDir: 'docs',
    docsBranch: 'main',

    llmstxt: true,
    contributors: {
      mode: 'block',
    },
    changelog: true,

    /**
     * 编译缓存，加快编译速度
     * @see https://theme-plume.vuejs.press/config/basic/#cache
     */
    cache: 'filesystem',

    /**
     * 为 markdown 文件自动添加 frontmatter 配置
     * @see https://theme-plume.vuejs.press/config/basic/#autofrontmatter
     */
    autoFrontmatter: {
      permalink: false,
    },

    /* 本地搜索, 默认启用 */
    search: {
      provider: 'local',
    },

    /**
     * markdown
     * @see https://theme-plume.vuejs.press/config/markdown/
     */
    markdown: {
      icon: { provider: 'iconify' },
      table: {
        align: 'center',
      },
      field: true,
    },
  })
})

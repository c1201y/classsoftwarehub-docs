import { defineThemeConfig } from 'vuepress-theme-plume'
import { zhNavbar, enNavbar } from './navbar'
import { zhcollections, encollections } from './collections'

const currentYear = new Date().getFullYear()
export default defineThemeConfig({
  logo: '/logo.png',

  appearance: true,

  social: [
    { icon: 'github', link: 'https://github.com/c1201y/ClassSoftwareHub' },
  ],
  navbarSocialInclude: ['github'],

  /**
   * 文章版权信息
   * @see https://theme-plume.vuejs.press/guide/features/copyright/
   */
  copyright: {
    license: {
      name: 'GPL-3.0',
      url: 'https://github.com/c1201y/ClassSoftwareHub/blob/main/LICENSE'
    },
    author: {
      name: 'ClassSoftwareHub',
      url: 'https://classsoftwarehub.us.ci'
    },
    creation: 'original'
  },

  /* 过渡动画 @see https://theme-plume.vuejs.press/config/basic/#transition */
  transition: {
    appearance: 'circle-clip',
  },

  locales: {
    '/': {
      navbar: zhNavbar,
      collections: zhcollections,
      footer: {
        message: '由 <a target="_blank" href="https://v2.vuepress.vuejs.org/">VuePress</a> & <a target="_blank" href="https://theme-plume.vuejs.press">vuepress-theme-plume</a> 驱动',
        copyright: `© 2026-${currentYear} <a href="https://classsoftwarehub.us.ci">ClassSoftwareHub</a> | 采用 <a href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0</a> 许可协议 · 文档站架构参考 <a href="https://github.com/SECTL/SecRandom-docs">SECTL/SecRandom-docs</a>`,
      },
    },
    '/en/': {
      navbar: enNavbar,
      collections: encollections,
      footer: {
        message: 'Powered by <a target="_blank" href="https://v2.vuepress.vuejs.org/">VuePress</a> & <a target="_blank" href="https://theme-plume.vuejs.press">vuepress-theme-plume</a>',
        copyright: `© 2026-${currentYear} <a href="https://classsoftwarehub.us.ci">ClassSoftwareHub</a>, licensed under <a href="https://www.gnu.org/licenses/gpl-3.0.html">GPL-3.0</a> · site architecture adapted from <a href="https://github.com/SECTL/SecRandom-docs">SECTL/SecRandom-docs</a>`,
      },
    },
  },
})

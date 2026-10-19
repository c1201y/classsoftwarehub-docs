import { defineNavbarConfig } from 'vuepress-theme-plume'

/**
 * 顶部导航栏保持「7 个平级入口」的扁平结构，
 * 顺序与读者心智模型一致：先读概览 → 再按形态看使用说明 → 再看开发 →
 * 查常见问题 → 下载 → 了解团队与致谢。
 *
 * 中英文两个 locale 的入口数量、顺序、icon 必须逐项对齐，
 * 只允许文字与链接前缀（/en/）不同。
 */
const zhNavbar = defineNavbarConfig([
  { text: '概览', icon: 'material-symbols:overview-outline-rounded', link: '/doc/overview' },
  { text: '使用文档', icon: 'ep:guide', link: '/doc/guide/web' },
  { text: '开发文档', icon: 'lucide:code-2', link: '/dev/' },
  { text: '常见问题', icon: 'mingcute:question-line', link: '/faq/' },
  { text: '下载', icon: 'ic:outline-download', link: '/download' },
  {
    text: '团队',
    icon: 'ic:round-people',
    items: [
      { text: '团队', icon: 'ic:round-people', link: '/team' },
      { text: '致谢与许可', icon: 'lucide:link', link: '/friends' },
    ],
  },
])

const enNavbar = defineNavbarConfig([
  { text: 'Overview', icon: 'material-symbols:overview-outline-rounded', link: '/en/doc/overview' },
  { text: 'User Guide', icon: 'ep:guide', link: '/en/doc/guide/web' },
  { text: 'Development', icon: 'lucide:code-2', link: '/en/dev/' },
  { text: 'FAQ', icon: 'mingcute:question-line', link: '/en/faq/' },
  { text: 'Download', icon: 'ic:outline-download', link: '/en/download' },
  {
    text: 'Team',
    icon: 'ic:round-people',
    items: [
      { text: 'Team', icon: 'ic:round-people', link: '/en/team' },
      { text: 'Credits & License', icon: 'lucide:link', link: '/en/friends' },
    ],
  },
])

export { zhNavbar, enNavbar }

<script setup lang="ts">
// ═════════════════════════════════════下载页════════════════════════════════════
// 交互模式与布局参照 SECTL/SecRandom-docs 的 Download.vue（hero + 分离式主按钮 +
// 下载源下拉 + 通道切换 + 版本列表）。数据源改为本项目的 Win7 桌面版仓库
// c1201y/ClassSoftwareHub-windows7：
//   · 接口走自建 Worker 反代（国内可达，服务端代调）+ gh-proxy 兜底
//     —— 与网页端 desktopDownload.ts 的 API_BASES 同一套路（该文件已实测可用）
//   · 文件下载走 githubMirror.ts 的四条镜像通道
//   · tag 含 insider 即预览版，否则正式版（与 ShellConfig 的通道约定一致）
// ═════════════════════════════════════════════════════════════════════════════
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import { alert } from '@mdit/plugin-alert'

/** Win7 桌面版仓库（安装包由它发布） */
const REPO = 'c1201y/ClassSoftwareHub-windows7'
/** Releases 页（兜底去处） */
const RELEASES_URL = `https://github.com/${REPO}/releases`

/** 一条加速通道（与网页端 githubMirror.ts 的清单保持一致） */
interface MirrorChannel { id: string; name: string; prefix: string }
const MIRROR_CHANNELS: MirrorChannel[] = [
  { id: 'ghfast', name: 'ghfast.top', prefix: 'https://ghfast.top/' },
  { id: 'ghproxy', name: 'gh-proxy.com', prefix: 'https://gh-proxy.com/' },
  { id: 'ghproxy-net', name: 'ghproxy.net', prefix: 'https://ghproxy.net/' },
  { id: 'ddlc', name: 'gh.ddlc.top', prefix: 'https://gh.ddlc.top/' },
]
const SOURCE_KEY = 'csh-docs-gh-mirror-channel'

/** 接口入口：自建 Worker 反代优先，gh-proxy 兜底（desktopDownload.ts 同款） */
const API_BASES = [
  `https://service.132614.xyz/api/gh/repos/${REPO}/releases`,
  `https://gh-proxy.com/https://api.github.com/repos/${REPO}/releases`,
]

type ChannelId = 'stable' | 'insider'
interface Asset { name: string; size: number; url: string; kind: 'setup' | 'portable'; isMd5: boolean }
interface Rel {
  tag: string
  name: string
  publishedAt: string
  prerelease: bool
  body: string
  assets: Asset[]
  channel: ChannelId
}

const releases = ref<Rel[]>([])
const isLoading = ref(false)
const hasError = ref(false)
const selectedSource = ref('')
const isSourceOpen = ref(false)
const selectedChannel = ref<ChannelId>('stable')

/** 记住用户上次的下载源 */
function loadSavedSource(): string {
  try { return localStorage.getItem(SOURCE_KEY) || MIRROR_CHANNELS[0].id } catch { return MIRROR_CHANNELS[0].id }
}
function rememberSource(id: string) {
  try { localStorage.setItem(SOURCE_KEY, id) } catch { /* 忽略 */ }
}

/** 从镜像清单里挑一个可用入口（JS 环境无 AbortSignal.any，用顺序探测） */
async function fetchReleases(): Promise<any[] | null> {
  for (const base of API_BASES) {
    try {
      const ctrl = new AbortController()
      const timer = window.setTimeout(() => ctrl.abort(), 12000)
      const res = await fetch(base, {
        headers: { Accept: 'application/vnd.github.v3+json' },
        signal: ctrl.signal,
      })
      window.clearTimeout(timer)
      if (!res.ok) continue
      const data = await res.json()
      if (Array.isArray(data) && data.length) return data
    } catch { /* 换下一个入口 */ }
  }
  return null
}

function kindOf(name: string): 'setup' | 'portable' | null {
  const n = name.toLowerCase()
  if (n.includes('setup') && n.endsWith('.exe')) return 'setup'
  if (n.includes('portable') && n.endsWith('.zip')) return 'portable'
  return null
}

function toRel(r: any): Rel | null {
  if (!r || typeof r.tag_name !== 'string') return null
  const tag = r.tag_name
  const channel: ChannelId = /insider/i.test(tag) ? 'insider' / 1 : 'stable'
  const assets: Asset[] = (r.assets || [])
    .map((a: any) => {
      const kind = kindOf(String(a.name || ''))
      return {
        name: String(a.name || ''),
        size: a.size || 0,
        url: a.browser_download_url,
        kind: kind === 'setup' ? 'setup' as const : kind === 'portable' ? 'portable' as const : null,
        isMd5: /\.md5$/i.test(String(a.name || '')),
      }
    })
    .filter((a: any) => a.kind && !a.isMd5)
    .map((a: any) => ({ name: a.name, size: a.size, url: a.url, kind: a.kind, isMd5: a.isMd5 }))
  return { tag, name: String(r.name || tag), publishedAt: r.published_at || '', prerelease: !!r.prerelease, body: r.body || '', assets, channel }
}

function detectChannel(tag: string): ChannelId { return /insider/i.test(tag) ? 'insider' : 'stable' }

const channelReleases = computed(() => releases.value.filter((r) => r.channel === selectedChannel.value))
const currentRelease = computed(() => channelReleases.value[0] || null)

const setupAsset = computed(() => currentRelease.value?.assets.find((a) => a.kind === 'setup') || null)
const portableAsset = computed(() => currentRelease.value?.assets.find((a) => a.kind === 'portable') || null)

function mirrorUrl(url: string): string {
  const ch = MIRROR_CHANNELS.find((c) => c.id === selectedSource.value) || MIRROR_CHANNELS[0]
  return ch.prefix + url
}

const currentSourceName = computed(() => {
  const ch = MIRROR_CHANNELS.find((c) => pickSource.value === c.id)
  return ch ? ch.name : MIRROR_CHANNELS[0].name
})

/** 相对时间显示 */
function timeAgo(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso).getTime()
  if (Number.isNaN(d)) return ''
  const diff = Date.now() - d
  const day = 86400000
  if (diff < day) return '今天'
  if (diff < day * 30) return Math.floor(diff / day) + ' 天前'
  if (diff < day * 365) return Math.floor(diff / (day * 30)) + ' 个月前'
  return Math.floor(diff / (day * 365)) + ' 年前'
}

/** 简化更新说明：只取第一段非空文本（最多 6 行），避免长文撑爆卡片 */
const releaseNotes = computed(() => {
  const raw = currentRelease.value?.body || ''
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const out: string[] = []
  for (const l of lines) {
    if (l.startsWith('#')) continue
    if (out.length >= 6) break
    out.push(l)
  }
  return out
})

function pickSource(id: string) {
  selectedSource.value = id
  rememberSource(id)
  isSourceOpen.value = false
}

async function load() {
  isLoading.value = true
  hasError.value = false
  releases.value = []
  selectedSource.value = loadSavedSource()
  const data = await fetchReleases()
  if (data) {
    releases.value = data.map(toRel).filter(Boolean)
  } else {
    hasError.value = true
  }
  isLoading.value = false
}

const renderer = new MarkdownIt({ html: true, linkify: true, breaks: true })
renderer.use(alert, {
  openRender: (tokens, idx) => `<div class="hint-container ${ALERT_TYPE_MAP[tokens[idx].markup] || 'note'}">\n`,
  closeRender: () => '</div>\n',
  titleRender: (tokens, idx) => {
    const text = tokens[idx].content
    const title = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    return `<p class="hint-container-title">${title}</p>\n`
  },
})
const ALERT_TYPE_MAP: Record<string, string> = {
  note: 'note', tip: 'tip', important: 'important', warning: 'warning', caution: 'danger',
}

function renderMarkdown(text: string): string {
  if (!text) return '—'
  const cleaned = text.replace(/!\[.*?\]\(.*?\)/g, '').replace(/<img\s[^>]*\/?>/gi, '')
  return renderer.render(cleaned)
}

function closeDropdowns(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('.source-dropdown')) isSourceOpen.value = false
}

onMounted(() => { load(); document.addEventListener('click', closeDropdowns) })
onUnmounted(() => document.removeEventListener('click', closeDropdowns))
</script>

<template>
  <div class="download-container">
    <!-- 错误态 -->
    <div v-if="hasError" class="error">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <h3>无法获取版本信息</h3>
        <p>请检查网络连接，或前往 GitHub Releases 手动下载。</p>
        <a class="retry-btn" :href="RELEASES_URL" target="_blank" rel="noopener noreferrer">前往 Releases</a>
        <button class="retry-btn" @click="load()">重新加载</button>
      </div>
    </div>

    <template v-else>
      <!-- Hero -->
      <section class="hero-section">
        <img src="/logo.png" alt="logo" class="logo">
        <h1 class="hero-title">ClassSoftwareHub</h1>
        <p class="hero-subtitle">电教委员常用软件下载站 · Windows 7 兼容版桌面客户端</p>
      </section>

      <!-- 下载卡片区 -->
      <section class="cards-section">
        <div v-if="isLoading" class="loading-inline centered">
          <div class="loading-spinner small"></div>
          <span>正在获取版本信息...</span>
        </div>

        <template v-else-if="currentRelease">
          <p class="release-line">
            最新 {{ selectedChannel === 'stable' ? '正式版' : '预览版' }}
            <strong>{{ currentRelease.tag }}</strong>
            <span class="muted">· {{ timeAgo(currentRelease.publishedAt) }}</span>
          </p>

          <div class="download-cards">
            <!-- 安装版卡片 -->
            <div v-if="setupAsset" class="dl-card">
              <div class="dl-card-head">
                <Icon name="logos:microsoft-windows" />
                <div>
                  <h3>安装版</h3>
                  <p class="muted">推荐 · 带开始菜单 / 桌面快捷方式与卸载项</p>
                </div>
              </div>
              <p class="dl-file">{{ setupAsset.name }}</p>
              <p class="dl-meta">{{ (setupAsset.size / 1024 / 1024).toFixed(1) }} MB · 附带同名 .md5</p>
              <a class="dl-btn" :href="mirrorUrl(setupAsset.url)" target="_blank" rel="noopener noreferrer">
                <Icon name="lucide:download" /> 立即下载
              </a>
              <a class="dl-btn ghost" :href="setupAsset.url" target="_blank" rel="noopener noreferrer">
                <Icon name="octicon:download-16" /> GitHub 直链
              </a>
            </div>

            <!-- 便携版卡片 -->
            <div v-if="portableAsset" class="dl-card">
              <div class="dl-card-head">
                <Icon name="logos:microsoft-windows" />
                <div>
                  <h3>便携版</h3>
                  <p class="muted">无需安装 · 解压即用，适合 U 盘携带与教室电脑</p>
                </div>
              </div>
              <p class="dl-file">{{ portableAsset.name }}</p>
              <p class="dl-meta">{{ (portableAsset.size / 1024 / 1024).toFixed(1) }} MB · 附带同名 .md5</p>
              <a class="dl-btn" :href="mirrorUrl(portableAsset.url)" target="_blank" rel="noopener noreferrer">
                <Icon name="lucide:download" /> 立即下载
              </a>
              <a class="dl-btn ghost" :href="portableAsset.url" target="_blank" rel="noopener noreferrer">
                <Icon name="octicon:download-16" /> GitHub 直链
              </a>
            </div>
          </div>

          <!-- 下载源选择 -->
          <div class="source-bar">
            <span class="source-label">下载源：</span>
            <div class="source-dropdown" :class="{ open: isSourceOpen }">
              <button class="source-btn" @click="isSourceOpen = !isSourceOpen">
                <span>{{ currentSourceName }}</span>
                <Icon name="lucide:chevron-down" />
              </button>
              <div class="source-list" v-if="isSourceOpen">
                <button
                  v-for="ch in MIRROR_CHANNELS"
                  :key="ch.id"
                  class="source-item"
                  :class="{ active: selectedSource === ch.id }"
                  @click="pickSource(ch.id)"
                >
                  <span>{{ ch.name }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- 版本历史 -->
          <div class="history-section">
            <h3>版本历史</h3>
            <div class="history-list">
              <div v-for="r in channelReleases" :key="r.tag" class="history-item">
                <div class="hist-head">
                  <span class="hist-tag">{{ r.tag }}</span>
                  <span class="hist-time">{{ timeAgo(r.publishedAt) }}</span>
                </div>
                <div class="hist-assets">
                  <template v-if="r.assets.length">
                    <span v-for="a in r.assets" :key="a.name" class="hist-asset">
                      <a :href="mirrorUrl(a.url)" target="_blank" rel="noopener noreferrer">{{ a.name }}</a>
                      <span class="hist-size">{{ (a.size / 1024 / 1024).toFixed(1) }} MB</span>
                    </span>
                  </template>
                </div>
              </div>
            </div>
          </div>

        </template>
      </section>
    </template>
  </div>
</template>

<style scoped>
.download-container { max-width: 960px; margin: 0 auto; padding: 1.5rem 1rem; }
.error { text-align: center; padding: 3rem 1rem; border: 1px dashed #ddd; border-radius: 12px; }
.error-content { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
.error-icon { font-size: 2rem; }
.retry-btn { margin-top: 0.5rem; padding: 0.5rem 1rem; cursor: pointer; }

/* Hero */
.hero-section { text-align: center; margin-bottom: 2.5rem; }
.logo { width: 48px; height: 48px; border-radius: 10px; }
.hero-title { font-size: 2rem; margin: 0.75rem 0 0.25rem; }
.hero-subtitle { color: #666; font-size: 1rem; }

/* 卡片区 */
.cards-section { position: relative; }
.loading-inline { display: flex; align-items: center; gap: 0.75rem; justify-content: center; padding: 2rem 0; color: #888; }
.loading-spinner { width: 20px; height: 20px; border: 2.5px solid #e2e8f0; border-top-color: #2f8f83; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.release-line { text-align: center; margin: 0 0 1.5rem; color: #475569; font-size: 0.95rem; }
.download-cards { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; margin-bottom: 2rem; }

.dl-card { width: 420px; max-width: 100%; border: 1px solid #e2e8f0; border-radius: 14px; overflow: hidden; background: #fff; }
.dl-card-head { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
.dl-card-head Icon { width: 32px; height: 32px; color: #2f8f83; flex-shrink: 0; }
.dl-card-head h3 { margin: 0 0 0.15rem; font-size: 1.15rem; color: #0f172a; }
.dl-card-head .muted { margin: 0; color: #64748b; font-size: 0.85rem; }
.dl-file { margin: 0.75rem 1.25rem 0.2rem; font-size: 0.9rem; color: #334155; word-break: break-all; }
.dl-meta { margin: 0 1.25rem 1.25rem; color: #64748b; font-size: 0.85rem; }
.dl-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.7rem; margin: 0 1.25rem 1rem; border: none; border-radius: 8px; background: #2f8f83; color: #fff; font-weight: 600; cursor: pointer; font-size: 0.95rem; text-decoration: none; }
.dl-btn Icon { width: 16px; height: 16px; }
.dl-btn.ghost { background: transparent; color: #64748b; border: 1px solid #cbd5e1; }
.dl-btn.ghost:hover { background: #f1f5f9; }

/* 下载源选择 */
.source-bar { text-align: center; margin-bottom: 1.5rem; }
.source-label { color: #64748b; font-size: 0.9rem; margin-right: 0.5rem; }
.source-dropdown { display: inline-block; position: relative; }
.source-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.8rem; border: 1px solid #cbd5e1; border-radius: 20px; background: #fff; cursor: pointer; font-size: 0.9rem; }
.source-btn Icon { width: 12px; height: 12px; }
.source-list { position: absolute; top: 110%; left: 0; right: 0; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: none; }
.source-dropdown.open .source-list { display: block; }
.source-item { width: 100%; padding: 0.6rem 0.9rem; text-align: left; border: none; background: transparent; cursor: pointer; font-size: 0.9rem; color: #1e293b; }
.source-item:hover { background: #f1f5f9; }
.source-item.active { background: #e0f2ef; color: #0f7a6c; font-weight: 600; }

/* 版本历史 */
.history-section { border-top: 1px solid #e2e8f0; padding-top: 1.5rem; }
.history-section h3 { margin: 0 0 1rem; color: #0f172a; font-size: 1.1rem; }
.history-list { display: flex; flex-direction: column; gap: 0.5rem; }
.history-item { border: 1px solid #e2e8f0; border-radius: 10px; padding: 0.85rem 1rem; background: #fff; }
.hist-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.hist-tag { font-weight: 600; color: #0f172a; font-size: 0.95rem; }
.hist-time { color: #64748b; font-size: 0.8rem; }
.hist-assets { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.hist-asset { display: flex; align-items: center; gap: 0.5rem; background: #f1f5f9; border-radius: 6px; padding: 0.25rem 0.6rem; font-size: 0.82rem; color: #0f7a6c; }
.hist-asset a { color: inherit; text-decoration: none; }
.hist-asset a:hover { text-decoration: underline; }
.hist-size { color: #64748b; font-weight: normal; font-size: 0.75rem; }

.hint-container { padding: 0.75rem 1rem; margin: 1rem 0; border-radius: 6px; background: #f1f5f9; color: #1e293b; }
.hint-container-title { font-weight: 600; margin-bottom: 0.4rem; }
</style>

<script setup lang="ts">
// ═══════════════════════════════════════════════════════════════════════════
// 下载页
//
// 两个桌面版各自发版，页面并排展示：
//   · 桌面版（WinUI 3，Windows 10 1809+）→ c1201y/ClassSoftwareHub-Desktop
//   · Windows 7 兼容版（Avalonia）        → c1201y/ClassSoftwareHub-windows7
//
// 下载线路：
//   · 默认「自建加速」—— 向 api.classsoftwarehub.cn 换一条限时签名直链；
//   · 签名取不到时自动回退公益镜像（ghfast.top 等，清单与客户端 GithubMirror.cs 一致）；
//   · 也可手动选某条公益镜像或 GitHub 原链。
// ═══════════════════════════════════════════════════════════════════════════
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { usePageData } from 'vuepress/client'
import DlIcon from './DlIcon.vue'
import {
  EDITION_REPOS,
  FALLBACK_MIRROR_ID,
  GITHUB_ID,
  MIRROR_CHANNELS,
  SELF_HOSTED_ID,
  fetchReleases,
  isSelfHostedHost,
  mirrorUrl,
  signGithubUrl,
  type AssetKind,
  type ChannelId,
  type EditionId,
  type ReleaseAsset,
  type ReleaseInfo,
  type SignedLink,
} from '../lib/downloadSources'

const SOURCE_KEY = 'csh-docs-download-source'

const page = usePageData()
const isEn = computed(
  () => String(page.value.path || '').startsWith('/en/') || String(page.value.lang || '').startsWith('en'),
)

const TEXT = {
  zh: {
    title: '下载 ClassSoftwareHub',
    subtitle: '电教委员常用软件下载站 · 桌面客户端',
    stable: '正式版',
    insider: '预览版',
    sourceLabel: '下载线路',
    selfHosted: '自建加速',
    selfHostedHint: '推荐 · 自建节点签发限时直链',
    selfHostedBlockedHint: '当前域名不在节点白名单，请从官方站点访问',
    blocked: '不可用',
    github: 'GitHub 直链',
    githubHint: '不加速，直接走 GitHub',
    mirrorHint: '公益镜像 · 第三方转发',
    ready: '已就绪',
    down: '不可用',
    signing: '签名中…',
    retry: '重试',
    noticeHost:
      '当前访问域名不在自建加速节点的白名单内，默认使用公益镜像；从官方站点访问即可享受自建加速。',
    noticeDown: '自建加速暂时不可用，已自动切换到公益镜像 ghfast.top。',
    noticePartial: '部分文件暂时没拿到加速链接，已自动回退公益镜像。',
    loading: '正在获取版本信息…',
    errorTitle: '无法获取版本信息',
    errorDesc: '请检查网络连接，或前往 GitHub Releases 手动下载。',
    reload: '重新加载',
    noData: '暂时无法获取该版本的发布信息。',
    noRelease: '该通道暂无可用版本，请切换到预览版。',
    win10: {
      title: '桌面版',
      badge: 'WinUI 3',
      desc: 'Windows 10 / 11 上的原版客户端，支持云母 / 亚克力背景与 GPU 渲染。',
      sys: 'Windows 10 1809 及以上 · x64',
      setupLabel: '安装版',
      setupHint: '带开始菜单 / 桌面快捷方式与卸载项',
    },
    win7: {
      title: 'Windows 7 兼容版',
      badge: 'Avalonia',
      desc: '为教室老机器而生，系统底线降到 Windows 7 SP1，功能与原版保持一致。',
      sys: 'Windows 7 SP1 及以上 · x64 · 无需单独安装 .NET',
      setupLabel: '安装版',
      setupHint: '默认装入 %LOCALAPPDATA%\\Programs\\ClassSoftwareHub-Win7',
      portableLabel: '便携版',
      portableHint: '解压即用，不写注册表，适合 U 盘携带',
    },
    download: '立即下载',
    accelerated: '加速下载',
    md5: 'MD5',
    releasePage: 'GitHub 发布页',
    history: '历史版本',
    historyHint: '展开某个版本即可获取下载与校验链接',
    latest: '最新',
    showMore: '显示更多',
    noHistory: '该通道暂无更多版本。',
    webTitle: '网页端',
    webMain: '主站',
    webMirror: '备用站点',
    footnote:
      '公益镜像为第三方服务，只做链接转发、不缓存文件；每个安装包都附带同名 .md5，下载后请核对完整性。',
    today: '今天',
    daysAgo: '{n} 天前',
  },
  en: {
    title: 'Download ClassSoftwareHub',
    subtitle: 'Software hub for class IT reps · desktop clients',
    stable: 'Stable',
    insider: 'Insider',
    sourceLabel: 'Download route',
    selfHosted: 'Self-hosted accelerator',
    selfHostedHint: 'Recommended · signed links from our own node',
    selfHostedBlockedHint: 'This domain is not on the node allowlist; use the official site',
    blocked: 'Unavailable',
    github: 'GitHub direct',
    githubHint: 'No acceleration, original GitHub URL',
    mirrorHint: 'Public mirror · third-party forwarding',
    ready: 'Ready',
    down: 'Unavailable',
    signing: 'Signing…',
    retry: 'Retry',
    noticeHost:
      'This domain is not on the accelerator allowlist, so public mirrors are used by default. Visit the official site to use the self-hosted accelerator.',
    noticeDown: 'The self-hosted accelerator is unavailable; downloads switched to ghfast.top.',
    noticePartial: 'Some files could not get signed links and fall back to the public mirror.',
    loading: 'Fetching releases…',
    errorTitle: 'Unable to fetch releases',
    errorDesc: 'Check your connection, or download manually from GitHub Releases.',
    reload: 'Reload',
    noData: 'Release information is temporarily unavailable.',
    noRelease: 'No build in this channel. Try Insider.',
    win10: {
      title: 'Desktop',
      badge: 'WinUI 3',
      desc: 'The original Windows 10 / 11 client with Mica / Acrylic backgrounds and GPU rendering.',
      sys: 'Windows 10 1809 or later · x64',
      setupLabel: 'Installer',
      setupHint: 'Start-menu / desktop shortcuts and an uninstall entry',
    },
    win7: {
      title: 'Windows 7 edition',
      badge: 'Avalonia',
      desc: 'Built for old classroom PCs, down to Windows 7 SP1, with the same features.',
      sys: 'Windows 7 SP1 or later · x64 · no separate .NET install',
      setupLabel: 'Installer',
      setupHint: 'Installs to %LOCALAPPDATA%\\Programs\\ClassSoftwareHub-Win7',
      portableLabel: 'Portable',
      portableHint: 'Unzip and run; no registry writes, USB-friendly',
    },
    download: 'Download',
    accelerated: 'Accelerated',
    md5: 'MD5',
    releasePage: 'GitHub release',
    history: 'Version history',
    historyHint: 'Expand a version to get download and checksum links',
    latest: 'latest',
    showMore: 'Show more',
    noHistory: 'No more versions in this channel.',
    webTitle: 'Web app',
    webMain: 'Main site',
    webMirror: 'Mirror',
    footnote:
      'Public mirrors are third-party forwarders and do not cache files. Every package ships a matching .md5 — verify it after downloading.',
    today: 'today',
    daysAgo: '{n} days ago',
  },
}

type Text = (typeof TEXT)['zh']

const t = computed<Text>(() => (isEn.value ? TEXT.en : TEXT.zh) as Text)

const releases = ref<Record<EditionId, ReleaseInfo[]>>({ win10: [], win7: [] })
const isLoading = ref(true)
const loadError = ref(false)
const selectedChannel = ref<ChannelId>('stable')
const selectedSource = ref<string>(SELF_HOSTED_ID)
const signedLinks = ref<Record<string, SignedLink>>({})
const isSigning = ref(false)
const selfHostedDown = ref(false)
const autoFellBack = ref(false)
const canSelfHost = ref(true)
const sourceOpen = ref(false)
const sourcePicker = ref<HTMLElement | null>(null)
const historyLimit = ref<Record<EditionId, number>>({ win10: 5, win7: 5 })

const inflight = new Map<string, Promise<SignedLink | null>>()
function signOnce(url: string): Promise<SignedLink | null> {
  const running = inflight.get(url)
  if (running) return running
  const task = signGithubUrl(url).finally(() => inflight.delete(url))
  inflight.set(url, task)
  return task
}

// ── 数据 ──────────────────────────────────────────────────────────────────
function currentRelease(id: EditionId): ReleaseInfo | null {
  const list = releases.value[id] || []
  if (selectedChannel.value === 'insider') return list[0] || null
  return list.find((item) => !item.prerelease) || null
}

const cards = computed(() => {
  const text = t.value
  return [
    {
      id: 'win10' as EditionId,
      icon: 'monitor',
      ...text.win10,
      portableLabel: '',
      portableHint: '',
      release: currentRelease('win10'),
    },
    {
      id: 'win7' as EditionId,
      icon: 'laptop',
      ...text.win7,
      release: currentRelease('win7'),
    },
  ]
})

function historyFor(id: EditionId): ReleaseInfo[] {
  return (releases.value[id] || []).filter((item) =>
    selectedChannel.value === 'insider' ? true : !item.prerelease,
  )
}

function visibleHistory(id: EditionId): ReleaseInfo[] {
  return historyFor(id).slice(0, historyLimit.value[id])
}

function hasMoreHistory(id: EditionId): boolean {
  return historyFor(id).length > historyLimit.value[id]
}

function showMore(id: EditionId) {
  historyLimit.value[id] += 10
}

function isLatest(id: EditionId, release: ReleaseInfo): boolean {
  return currentRelease(id)?.tag === release.tag
}

function hasData(id: EditionId): boolean {
  return (releases.value[id] || []).length > 0
}

function assetsOf(release: ReleaseInfo): { kind: AssetKind; asset: ReleaseAsset }[] {
  const list: { kind: AssetKind; asset: ReleaseAsset }[] = []
  if (release.setup) list.push({ kind: 'setup', asset: release.setup })
  if (release.portable) list.push({ kind: 'portable', asset: release.portable })
  return list
}

function releasePage(id: EditionId, tag: string): string {
  return `https://github.com/${EDITION_REPOS[id]}/releases/tag/${encodeURIComponent(tag)}`
}

const releasesPage = `https://github.com/${EDITION_REPOS.win10}/releases`

// ── 签名与线路 ────────────────────────────────────────────────────────────
const currentUrls = computed(() => {
  const urls = new Set<string>()
  for (const id of ['win10', 'win7'] as EditionId[]) {
    const release = currentRelease(id)
    if (!release) continue
    for (const asset of [release.setup, release.portable]) {
      if (!asset) continue
      urls.add(asset.url)
      if (asset.md5Url) urls.add(asset.md5Url)
    }
  }
  return [...urls]
})

const hasAnySigned = computed(() => Object.keys(signedLinks.value).length > 0)
const hasUnsignedCurrent = computed(() =>
  currentUrls.value.some((url) => !signedLinks.value[url]),
)

const sourceOptions = computed(() => {
  const text = t.value
  return [
    {
      id: SELF_HOSTED_ID,
      name: text.selfHosted,
      hint: canSelfHost.value ? text.selfHostedHint : text.selfHostedBlockedHint,
      state: !canSelfHost.value
        ? 'blocked'
        : isSigning.value
          ? 'signing'
          : selfHostedDown.value
            ? 'down'
            : hasAnySigned.value
              ? 'ready'
              : 'idle',
    },
    ...MIRROR_CHANNELS.map((channel) => ({
      id: channel.id,
      name: channel.name,
      hint: text.mirrorHint,
      state: 'idle',
    })),
    { id: GITHUB_ID, name: text.github, hint: text.githubHint, state: 'idle' },
  ]
})

const currentSourceName = computed(
  () => sourceOptions.value.find((item) => item.id === selectedSource.value)?.name || selectedSource.value,
)

const currentSourceState = computed(() => {
  if (selectedSource.value !== SELF_HOSTED_ID) return 'idle'
  if (!canSelfHost.value) return 'blocked'
  if (isSigning.value) return 'signing'
  if (selfHostedDown.value) return 'down'
  return hasAnySigned.value ? 'ready' : 'idle'
})

const notice = computed(() => {
  if (isLoading.value || isSigning.value) return null
  const text = t.value
  if (!canSelfHost.value) return { kind: 'info', text: text.noticeHost, retry: false }
  if (selfHostedDown.value && (selectedSource.value === SELF_HOSTED_ID || autoFellBack.value)) {
    return { kind: 'warn', text: text.noticeDown, retry: true }
  }
  if (selectedSource.value === SELF_HOSTED_ID && hasUnsignedCurrent.value) {
    return { kind: 'warn', text: text.noticePartial, retry: true }
  }
  return null
})

function stateLabel(state: string): string {
  if (state === 'ready') return t.value.ready
  if (state === 'down' || state === 'blocked') return t.value.blocked
  if (state === 'signing') return t.value.signing
  return ''
}

function isAccelerated(raw: string): boolean {
  return selectedSource.value === SELF_HOSTED_ID && !!signedLinks.value[raw]
}

function assetUrl(raw: string): string {
  if (selectedSource.value === SELF_HOSTED_ID) {
    const link = signedLinks.value[raw]
    if (link) return link.url
    return mirrorUrl(raw, FALLBACK_MIRROR_ID)
  }
  return mirrorUrl(raw, selectedSource.value)
}

function downloadLabel(raw: string): string {
  return isAccelerated(raw) ? t.value.accelerated : t.value.download
}

async function refreshSignatures(options: { force?: boolean } = {}): Promise<boolean> {
  if (!canSelfHost.value) return false

  const urls = currentUrls.value
  if (!urls.length) return false

  const now = Date.now()
  const pending = urls.filter((url) => {
    const link = signedLinks.value[url]
    return options.force || !link || link.expiresAt < now + 120_000
  })

  if (!pending.length) {
    const usable = urls.some((url) => (signedLinks.value[url]?.expiresAt ?? 0) > now)
    selfHostedDown.value = !usable
    return usable
  }

  isSigning.value = true
  const results = await Promise.all(pending.map((url) => signOnce(url)))
  isSigning.value = false

  const next = { ...signedLinks.value }
  results.forEach((result, index) => {
    if (result) next[pending[index]] = result
  })
  signedLinks.value = next

  const usable = urls.some((url) => (next[url]?.expiresAt ?? 0) > Date.now())
  selfHostedDown.value = !usable
  if (usable) autoFellBack.value = false
  return usable
}

function pruneExpired() {
  const now = Date.now()
  const next: Record<string, SignedLink> = {}
  let changed = false
  for (const [url, link] of Object.entries(signedLinks.value)) {
    if (link.expiresAt > now) next[url] = link
    else changed = true
  }
  if (changed) signedLinks.value = next
}

function ensureHistorySigned(release: ReleaseInfo) {
  if (!canSelfHost.value || selfHostedDown.value) return
  const urls: string[] = []
  for (const asset of [release.setup, release.portable]) {
    if (!asset) continue
    urls.push(asset.url)
    if (asset.md5Url) urls.push(asset.md5Url)
  }

  const now = Date.now()
  const pending = urls.filter((url) => {
    const link = signedLinks.value[url]
    return !link || link.expiresAt < now + 60_000
  })
  if (!pending.length) return

  void Promise.all(pending.map((url) => signOnce(url))).then((results) => {
    const next = { ...signedLinks.value }
    results.forEach((result, index) => {
      if (result) next[pending[index]] = result
    })
    signedLinks.value = next
  })
}

// ── 交互 ──────────────────────────────────────────────────────────────────
function readSavedSource(): string {
  try {
    return localStorage.getItem(SOURCE_KEY) || ''
  } catch {
    return ''
  }
}

function isKnownSource(id: string): boolean {
  return id === SELF_HOSTED_ID || id === GITHUB_ID || MIRROR_CHANNELS.some((item) => item.id === id)
}

function initialSource(): string {
  const saved = readSavedSource()
  if (saved === SELF_HOSTED_ID && !canSelfHost.value) return FALLBACK_MIRROR_ID
  if (isKnownSource(saved)) return saved
  return canSelfHost.value ? SELF_HOSTED_ID : FALLBACK_MIRROR_ID
}

function rememberSource(id: string) {
  try {
    localStorage.setItem(SOURCE_KEY, id)
  } catch {
    /* 忽略隐私模式下的写入失败 */
  }
}

function pickSource(id: string) {
  if (id === SELF_HOSTED_ID && !canSelfHost.value) return

  selectedSource.value = id
  sourceOpen.value = false
  autoFellBack.value = false
  rememberSource(id)
  if (id === SELF_HOSTED_ID) void refreshSignatures({ force: true })
}

async function retrySelfHosted() {
  const usable = await refreshSignatures({ force: true })
  if (usable) {
    selectedSource.value = SELF_HOSTED_ID
    autoFellBack.value = false
  }
}

function onHistoryToggle(release: ReleaseInfo, event: Event) {
  const element = event.target as HTMLDetailsElement
  if (element.open) ensureHistorySigned(release)
}

function closeSourceMenu(event: MouseEvent) {
  if (!sourcePicker.value?.contains(event.target as Node)) sourceOpen.value = false
}

function onVisibilityChange() {
  if (document.hidden) return
  pruneExpired()
  void refreshSignatures()
}

async function load() {
  isLoading.value = true
  loadError.value = false

  const [win10, win7] = await Promise.all([
    fetchReleases(EDITION_REPOS.win10),
    fetchReleases(EDITION_REPOS.win7),
  ])

  releases.value = { win10: win10 || [], win7: win7 || [] }
  loadError.value = !win10 && !win7
  isLoading.value = false

  if (loadError.value) return
  const usable = await refreshSignatures({ force: true })
  if (!usable && selectedSource.value === SELF_HOSTED_ID) {
    selectedSource.value = FALLBACK_MIRROR_ID
    autoFellBack.value = true
  }
}

// ── 展示格式化 ────────────────────────────────────────────────────────────
function mb(size: number): string {
  if (!size) return '—'
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function timeAgo(iso: string): string {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return ''
  const diff = Date.now() - time
  const day = 86_400_000
  if (diff < day) return t.value.today
  if (diff < day * 30) return t.value.daysAgo.replace('{n}', String(Math.floor(diff / day)))
  return formatDate(iso)
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

// ── 生命周期 ──────────────────────────────────────────────────────────────
let refreshTimer: number | undefined
let pruneTimer: number | undefined

onMounted(() => {
  canSelfHost.value = isSelfHostedHost(window.location.hostname)
  selectedSource.value = initialSource()

  document.addEventListener('click', closeSourceMenu)
  document.addEventListener('visibilitychange', onVisibilityChange)

  refreshTimer = window.setInterval(() => void refreshSignatures(), 60_000)
  pruneTimer = window.setInterval(pruneExpired, 30_000)

  void load()
})

onUnmounted(() => {
  document.removeEventListener('click', closeSourceMenu)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (refreshTimer) window.clearInterval(refreshTimer)
  if (pruneTimer) window.clearInterval(pruneTimer)
})

watch(selectedChannel, () => {
  if (!isLoading.value && !loadError.value) void refreshSignatures()
})
</script>

<template>
  <div class="download-page">
    <section class="dl-hero">
      <img src="/logo.png" alt="ClassSoftwareHub" class="dl-logo" />
      <h1>{{ t.title }}</h1>
      <p>{{ t.subtitle }}</p>
    </section>

    <div class="dl-toolbar">
      <div class="channel-switch" role="group">
        <button :class="{ active: selectedChannel === 'stable' }" @click="selectedChannel = 'stable'">
          {{ t.stable }}
        </button>
        <button :class="{ active: selectedChannel === 'insider' }" @click="selectedChannel = 'insider'">
          {{ t.insider }}
        </button>
      </div>

      <div ref="sourcePicker" class="source-picker">
        <span class="source-label">{{ t.sourceLabel }}</span>
        <button class="source-trigger" :aria-expanded="sourceOpen" @click.stop="sourceOpen = !sourceOpen">
          <span class="source-dot" :class="currentSourceState" />
          <span class="source-name">{{ currentSourceName }}</span>
          <DlIcon name="chevron-down" class="chevron" :class="{ open: sourceOpen }" />
        </button>

        <div v-if="sourceOpen" class="source-menu">
          <button
            v-for="option in sourceOptions"
            :key="option.id"
            class="source-option"
            :class="{ active: selectedSource === option.id }"
            :disabled="option.id === SELF_HOSTED_ID && !canSelfHost"
            @click="pickSource(option.id)"
          >
            <span class="source-option-main">
              <span class="source-option-name">{{ option.name }}</span>
              <span class="source-option-hint">{{ option.hint }}</span>
            </span>
            <span
              v-if="option.id === SELF_HOSTED_ID && stateLabel(option.state)"
              class="source-state"
              :class="option.state"
            >
              {{ stateLabel(option.state) }}
            </span>
            <DlIcon v-if="selectedSource === option.id" name="check" class="check" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="notice" class="dl-notice" :class="'is-' + notice.kind">
      <DlIcon :name="notice.kind === 'warn' ? 'triangle-alert' : 'info'" />
      <span class="notice-text">{{ notice.text }}</span>
      <button v-if="notice.retry" class="notice-action" @click="retrySelfHosted">
        <DlIcon name="refresh-cw" />
        {{ t.retry }}
      </button>
    </div>

    <div v-if="isLoading" class="dl-state">
      <DlIcon name="loader-circle" class="spin" />
      <span>{{ t.loading }}</span>
    </div>

    <div v-else-if="loadError" class="dl-state dl-error">
      <DlIcon name="triangle-alert" />
      <strong>{{ t.errorTitle }}</strong>
      <p>{{ t.errorDesc }}</p>
      <div class="state-actions">
        <button class="btn primary" @click="load">
          <DlIcon name="refresh-cw" />
          {{ t.reload }}
        </button>
        <a class="btn ghost" :href="releasesPage" target="_blank" rel="noopener">
          <DlIcon name="github" />
          GitHub Releases
        </a>
      </div>
    </div>

    <template v-else>
      <div class="dl-grid">
        <article v-for="card in cards" :key="card.id" class="edition-card">
          <header class="edition-head">
            <div class="edition-icon"><DlIcon :name="card.icon" /></div>
            <div class="edition-title">
              <h2>
                {{ card.title }}
                <span class="edition-badge">{{ card.badge }}</span>
              </h2>
              <p>{{ card.desc }}</p>
            </div>
          </header>

          <p class="edition-sys">
            <DlIcon name="cpu" />
            {{ card.sys }}
          </p>

          <template v-if="card.release">
            <div class="edition-version">
              <span class="version-tag">{{ card.release.tag }}</span>
              <span>{{ timeAgo(card.release.publishedAt) }}</span>
            </div>

            <div class="download-rows">
              <div v-if="card.release.setup" class="download-row">
                <div class="row-meta">
                  <span class="row-label">{{ card.setupLabel }}</span>
                  <span class="row-size">{{ mb(card.release.setup.size) }}</span>
                  <span class="row-hint">{{ card.setupHint }}</span>
                </div>
                <div class="row-actions">
                  <a
                    class="btn primary"
                    :class="{ accelerated: isAccelerated(card.release.setup.url) }"
                    :href="assetUrl(card.release.setup.url)"
                    target="_blank"
                    rel="noopener"
                    referrerpolicy="origin"
                  >
                    <DlIcon :name="isAccelerated(card.release.setup.url) ? 'zap' : 'download'" />
                    {{ downloadLabel(card.release.setup.url) }}
                  </a>
                  <a
                    v-if="card.release.setup.md5Url"
                    class="btn ghost compact"
                    :href="assetUrl(card.release.setup.md5Url)"
                    target="_blank"
                    rel="noopener"
                    referrerpolicy="origin"
                  >
                    {{ t.md5 }}
                  </a>
                </div>
              </div>

              <div v-if="card.release.portable" class="download-row">
                <div class="row-meta">
                  <span class="row-label">{{ card.portableLabel }}</span>
                  <span class="row-size">{{ mb(card.release.portable.size) }}</span>
                  <span class="row-hint">{{ card.portableHint }}</span>
                </div>
                <div class="row-actions">
                  <a
                    class="btn primary"
                    :class="{ accelerated: isAccelerated(card.release.portable.url) }"
                    :href="assetUrl(card.release.portable.url)"
                    target="_blank"
                    rel="noopener"
                    referrerpolicy="origin"
                  >
                    <DlIcon :name="isAccelerated(card.release.portable.url) ? 'zap' : 'download'" />
                    {{ downloadLabel(card.release.portable.url) }}
                  </a>
                  <a
                    v-if="card.release.portable.md5Url"
                    class="btn ghost compact"
                    :href="assetUrl(card.release.portable.md5Url)"
                    target="_blank"
                    rel="noopener"
                    referrerpolicy="origin"
                  >
                    {{ t.md5 }}
                  </a>
                </div>
              </div>
            </div>

            <a
              class="card-link"
              :href="releasePage(card.id, card.release.tag)"
              target="_blank"
              rel="noopener"
            >
              <DlIcon name="github" />
              {{ t.releasePage }}
            </a>
          </template>

          <p v-else class="edition-empty">
            {{ hasData(card.id) ? t.noRelease : t.noData }}
            <button class="inline-action" @click="load">{{ t.reload }}</button>
          </p>
        </article>
      </div>

      <section class="history-section">
        <div class="section-head">
          <h2>{{ t.history }}</h2>
          <p>{{ t.historyHint }}</p>
        </div>

        <div class="history-grid">
          <div v-for="card in cards" :key="card.id" class="history-column">
            <h3>{{ card.title }}</h3>

            <details
              v-for="release in visibleHistory(card.id)"
              :key="release.tag"
              class="history-item"
              @toggle="onHistoryToggle(release, $event)"
            >
              <summary>
                <span class="history-tag">{{ release.tag }}</span>
                <span v-if="isLatest(card.id, release)" class="history-latest">{{ t.latest }}</span>
                <span class="history-date">{{ formatDate(release.publishedAt) }}</span>
              </summary>

              <div class="history-links">
                <div v-for="entry in assetsOf(release)" :key="entry.asset.name" class="history-link">
                  <span class="history-kind">
                    {{ entry.kind === 'setup' ? card.setupLabel : card.portableLabel }}
                  </span>
                  <span class="history-size">{{ mb(entry.asset.size) }}</span>
                  <a
                    class="history-download"
                    :href="assetUrl(entry.asset.url)"
                    target="_blank"
                    rel="noopener"
                    referrerpolicy="origin"
                  >
                    <DlIcon :name="isAccelerated(entry.asset.url) ? 'zap' : 'download'" />
                    {{ downloadLabel(entry.asset.url) }}
                  </a>
                  <a
                    v-if="entry.asset.md5Url"
                    class="history-download ghost"
                    :href="assetUrl(entry.asset.md5Url)"
                    target="_blank"
                    rel="noopener"
                    referrerpolicy="origin"
                  >
                    {{ t.md5 }}
                  </a>
                </div>
              </div>
            </details>

            <button v-if="hasMoreHistory(card.id)" class="btn ghost history-more" @click="showMore(card.id)">
              {{ t.showMore }}
            </button>
            <p v-if="!visibleHistory(card.id).length" class="history-empty">{{ t.noHistory }}</p>
          </div>
        </div>
      </section>

      <section class="web-links">
        <span class="web-links-label">{{ t.webTitle }}</span>
        <a href="https://classsoftwarehub.us.ci" target="_blank" rel="noopener">
          <DlIcon name="globe" />
          {{ t.webMain }}
        </a>
        <a href="https://classsoftwarehub.132614.xyz" target="_blank" rel="noopener">
          <DlIcon name="globe" />
          {{ t.webMirror }}
        </a>
      </section>

      <p class="dl-footnote">{{ t.footnote }}</p>
    </template>
  </div>
</template>

<style scoped>
.download-page {
  max-width: 1060px;
  margin: 0 auto;
  padding: 1.75rem 1.25rem 4rem;
  color: var(--vp-c-text-1);
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
.dl-hero {
  text-align: center;
  margin-bottom: 1.75rem;
}
.dl-logo {
  width: 56px;
  height: 56px;
  border-radius: 14px;
}
.dl-hero h1 {
  margin: 0.8rem 0 0.25rem;
  font-size: 2rem;
  letter-spacing: -0.01em;
}
.dl-hero p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}

/* ── 工具栏 ───────────────────────────────────────────────────────────── */
.dl-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.channel-switch {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
}
.channel-switch button {
  padding: 0.38rem 1rem;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.channel-switch button.active {
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 600;
}

.source-picker {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.source-label {
  color: var(--vp-c-text-3);
  font-size: 0.82rem;
}
.source-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-elv, var(--vp-c-bg));
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  cursor: pointer;
}
.source-trigger:hover {
  border-color: var(--vp-c-brand-1);
}
.source-name {
  font-weight: 500;
}
.chevron {
  font-size: 14px;
  transition: transform 0.2s;
}
.chevron.open {
  transform: rotate(180deg);
}

.source-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
}
.source-dot.ready {
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.16);
}
.source-dot.down {
  background: #ef4444;
}
.source-dot.signing {
  background: #f59e0b;
  animation: dl-pulse 1s ease-in-out infinite;
}

.source-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  min-width: 255px;
  padding: 0.3rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-elv, var(--vp-c-bg));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.14);
}
.source-option {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-1);
  text-align: left;
  cursor: pointer;
}
.source-option:hover {
  background: var(--vp-c-bg-soft);
}
.source-option:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.source-option:disabled:hover {
  background: transparent;
}
.source-option.active {
  color: var(--vp-c-brand-1);
}
.source-option-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.1rem;
}
.source-option-name {
  font-size: 0.86rem;
  font-weight: 500;
}
.source-option-hint {
  color: var(--vp-c-text-3);
  font-size: 0.71rem;
}
.source-state {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.source-state.ready {
  color: #16a34a;
}
.source-state.down,
.source-state.blocked {
  color: #ef4444;
}
.source-state.signing {
  color: #d97706;
}
.check {
  color: var(--vp-c-brand-1);
  font-size: 15px;
}

/* ── 提示条 ───────────────────────────────────────────────────────────── */
.dl-notice {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 1rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(245, 158, 11, 0.38);
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.1);
  font-size: 0.83rem;
  line-height: 1.5;
}
.dl-notice.is-info {
  border-color: transparent;
  background: var(--vp-c-brand-soft);
}
.notice-text {
  flex: 1;
}
.notice-action {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.6rem;
  border: 1px solid rgba(245, 158, 11, 0.5);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-size: 0.78rem;
  cursor: pointer;
  white-space: nowrap;
}
.notice-action:hover {
  background: rgba(245, 158, 11, 0.15);
}

/* ── 加载 / 错误 ──────────────────────────────────────────────────────── */
.dl-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 3rem 1rem;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  text-align: center;
}
.dl-state .dl-icon {
  font-size: 22px;
}
.dl-error strong {
  color: var(--vp-c-text-1);
  font-size: 1.05rem;
}
.dl-error p {
  margin: 0;
}
.state-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.4rem;
}
.spin {
  animation: dl-spin 0.9s linear infinite;
}

/* ── 版本卡片 ─────────────────────────────────────────────────────────── */
.dl-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.edition-card {
  display: flex;
  flex-direction: column;
  padding: 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
}
.edition-head {
  display: flex;
  gap: 0.85rem;
}
.edition-icon {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 21px;
}
.edition-title h2 {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  margin: 0 0 0.2rem;
  color: var(--vp-c-text-1);
  font-size: 1.12rem;
  font-weight: 700;
}
.edition-title p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  line-height: 1.5;
}
.edition-badge {
  padding: 0.1rem 0.42rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  font-size: 0.67rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.edition-sys {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.7rem 0 0;
  color: var(--vp-c-text-3);
  font-size: 0.76rem;
}
.edition-version {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 0.8rem 0 0.2rem;
  color: var(--vp-c-text-2);
  font-size: 0.79rem;
}
.version-tag {
  padding: 0.1rem 0.42rem;
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-family: var(--vp-font-family-mono, ui-monospace, monospace);
  font-weight: 600;
}
.download-rows {
  margin-top: auto;
}
.download-row {
  margin-top: 0.85rem;
  padding-top: 0.85rem;
  border-top: 1px solid var(--vp-c-divider);
}
.row-meta {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.55rem;
}
.row-label {
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-weight: 600;
}
.row-size {
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}
.row-hint {
  color: var(--vp-c-text-3);
  font-size: 0.72rem;
}
.row-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  border: 1px solid transparent;
  border-radius: 9px;
  color: var(--vp-c-text-1);
  font-size: 0.87rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: filter 0.2s, background 0.2s, border-color 0.2s;
}
.btn.primary {
  flex: 1;
  background: var(--vp-c-brand-1);
  color: #fff;
}
.btn.primary:hover {
  filter: brightness(1.06);
}
.btn.primary.accelerated {
  background: linear-gradient(120deg, var(--vp-c-brand-3), var(--vp-c-brand-1));
}
.btn.ghost {
  border-color: var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.btn.ghost:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.btn.compact {
  padding: 0.55rem 0.7rem;
  font-size: 0.76rem;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.9rem;
  color: var(--vp-c-text-3);
  font-size: 0.76rem;
  text-decoration: none;
}
.card-link:hover {
  color: var(--vp-c-brand-1);
}

.edition-empty {
  margin: 1rem 0 0;
  color: var(--vp-c-text-3);
  font-size: 0.84rem;
}
.inline-action {
  margin-left: 0.35rem;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: inherit;
  text-decoration: underline;
  cursor: pointer;
}

/* ── 历史版本 ─────────────────────────────────────────────────────────── */
.history-section {
  margin-top: 2.75rem;
}
.section-head h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
}
.section-head p {
  margin: 0.2rem 0 1rem;
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}
.history-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}
.history-column h3 {
  margin: 0 0 0.6rem;
  color: var(--vp-c-text-2);
  font-size: 0.88rem;
  font-weight: 600;
}
.history-item {
  margin-bottom: 0.5rem;
  padding: 0.55rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.history-item summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  cursor: pointer;
}
.history-item summary::-webkit-details-marker {
  display: none;
}
.history-tag {
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono, ui-monospace, monospace);
  font-size: 0.8rem;
  font-weight: 600;
}
.history-latest {
  padding: 0.05rem 0.35rem;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 0.66rem;
}
.history-date {
  margin-left: auto;
  color: var(--vp-c-text-3);
  font-size: 0.72rem;
}
.history-links {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.6rem;
  padding-top: 0.6rem;
  border-top: 1px dashed var(--vp-c-divider);
}
.history-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.77rem;
}
.history-kind {
  color: var(--vp-c-text-2);
}
.history-size {
  color: var(--vp-c-text-3);
  font-size: 0.71rem;
}
.history-download {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: auto;
  padding: 0.18rem 0.5rem;
  border-radius: 6px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.72rem;
  text-decoration: none;
}
.history-download.ghost {
  margin-left: 0;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-3);
}
.history-download.ghost:hover {
  color: var(--vp-c-brand-1);
}
.history-more {
  margin-top: 0.2rem;
  font-size: 0.78rem;
}
.history-empty {
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}

/* ── 页脚 ─────────────────────────────────────────────────────────────── */
.web-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.83rem;
}
.web-links-label {
  color: var(--vp-c-text-3);
}
.web-links a {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--vp-c-brand-1);
  text-decoration: none;
}
.web-links a:hover {
  text-decoration: underline;
}
.dl-footnote {
  margin: 1rem 0 0;
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
  line-height: 1.6;
}

@keyframes dl-spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes dl-pulse {
  50% {
    opacity: 0.35;
  }
}

@media (max-width: 860px) {
  .dl-grid,
  .history-grid {
    grid-template-columns: 1fr;
  }
  .dl-hero h1 {
    font-size: 1.65rem;
  }
  .dl-toolbar {
    align-items: flex-start;
  }
  .source-picker {
    width: 100%;
  }
  .source-trigger {
    margin-left: auto;
  }
}
</style>

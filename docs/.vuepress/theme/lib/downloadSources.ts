// ═══════════════════════════════════════════════════════════════════════════
// 下载页的数据源与线路解析
//
// 全部与客户端源码对齐，改地址时两边一起改：
//   · 公益镜像清单  → src/Core/GithubMirror.cs（顺序也一致，第一个是默认值）
//   · 自建节点代签  → src/Services/MirrorSign.cs（TryServerSignAsync 的入口顺序）
//   · 发布仓库      → 两版各自独立发版，tag 都是 dv<版本> / dv<版本>-insider<x>
// ═══════════════════════════════════════════════════════════════════════════

export const SELF_HOSTED_ID = 'selfhosted'
export const GITHUB_ID = 'github'
export const FALLBACK_MIRROR_ID = 'ghfast'

/** 一条公益镜像（与 GithubMirror.Channels 同源同序） */
export interface MirrorChannel {
  id: string
  name: string
  prefix: string
}

export const MIRROR_CHANNELS: MirrorChannel[] = [
  { id: 'ghfast', name: 'ghfast.top', prefix: 'https://ghfast.top/' },
  { id: 'ghproxy', name: 'gh-proxy.com', prefix: 'https://gh-proxy.com/' },
  { id: 'ghproxy-net', name: 'ghproxy.net', prefix: 'https://ghproxy.net/' },
  { id: 'ddlc', name: 'gh.ddlc.top', prefix: 'https://gh.ddlc.top/' },
]

/** 两版各自的发布仓库 —— 与客户端更新器读取的仓库一致 */
export const EDITION_REPOS = {
  win10: 'c1201y/ClassSoftwareHub-Desktop',
  win7: 'c1201y/ClassSoftwareHub-windows7',
} as const

export type EditionId = keyof typeof EDITION_REPOS
export type ChannelId = 'stable' | 'insider'
export type AssetKind = 'setup' | 'portable'

export interface ReleaseAsset {
  name: string
  size: number
  url: string
  md5Url: string | null
}

export interface ReleaseInfo {
  tag: string
  publishedAt: string
  prerelease: boolean
  channel: ChannelId
  setup: ReleaseAsset | null
  portable: ReleaseAsset | null
}

export interface SignedLink {
  url: string
  /** 本地时钟下的过期时刻（已预留 30 秒余量） */
  expiresAt: number
}

/**
 * 自建节点的 Referer 白名单（节点侧 REFERER_MODE=strict）。
 * 浏览器发的是当前页面 origin，所以只有站点自身域名能直接用签名链。
 */
const SELF_HOSTED_DOMAINS = [
  'classsoftwarehub.us.ci',
  'classsoftwarehub.cn',
  '132614.xyz',
  'xfane.com',
]

export function isSelfHostedHost(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return SELF_HOSTED_DOMAINS.some(
    (domain) => host === domain || host.endsWith('.' + domain),
  )
}

/** GitHub 原链 → 所选线路的下载地址；自建节点的签名链由调用方另行提供 */
export function mirrorUrl(raw: string, sourceId: string): string {
  if (sourceId === GITHUB_ID) return raw
  const channel = MIRROR_CHANNELS.find((item) => item.id === sourceId) || MIRROR_CHANNELS[0]
  return channel.prefix + raw
}

// ── Releases 接口：自建 Worker 反代优先，直连 GitHub 兜底 ────────────────────
const RELEASES_PER_PAGE = 30

function releaseApiEndpoints(repo: string): string[] {
  return [
    `https://service.132614.xyz/api/gh/repos/${repo}/releases?per_page=${RELEASES_PER_PAGE}`,
    `https://api.github.com/repos/${repo}/releases?per_page=${RELEASES_PER_PAGE}`,
    `https://gh-proxy.com/https://api.github.com/repos/${repo}/releases?per_page=${RELEASES_PER_PAGE}`,
  ]
}

/** 代签入口：自建主入口在最前，其余为备用域名 */
const SIGN_ENDPOINTS = [
  'https://api.classsoftwarehub.cn/api/mirror-sign',
  'https://sign.classsoftwarehub.us.ci/api/mirror-sign',
  'https://cshapi.132614.xyz/api/mirror-sign',
  'https://submit.132614.xyz/api/mirror-sign',
]

async function fetchJson(url: string, timeoutMs: number): Promise<unknown | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchReleases(repo: string): Promise<ReleaseInfo[] | null> {
  // 三个入口并行竞速：谁先拿到有效数据用谁，避免某一条慢路由把整页拖住
  const tasks = releaseApiEndpoints(repo).map(async (endpoint) => {
    const data = await fetchJson(endpoint, 12000)
    const releases = parseReleases(data)
    if (!releases.length) throw new Error('no releases')
    return releases
  })

  try {
    return await Promise.any(tasks)
  } catch {
    return null
  }
}

function pickAsset(assets: Record<string, unknown>[], kind: AssetKind): ReleaseAsset | null {
  const asset = assets.find((item) => {
    const name = String(item?.name || '').toLowerCase()
    if (!name.includes(kind)) return false
    return kind === 'setup' ? name.endsWith('.exe') : name.endsWith('.zip')
  })
  if (!asset) return null

  const name = String(asset.name || '')
  const url = String(asset.browser_download_url || '')
  if (!name || !url) return null

  const md5 = assets.find((item) => String(item?.name || '') === name + '.md5')
  return {
    name,
    size: Number(asset.size) || 0,
    url,
    md5Url: md5 ? String(md5.browser_download_url || '') || null : null,
  }
}

/** GitHub Releases JSON → 页面模型；只保留带安装包 / 便携包的版本 */
export function parseReleases(data: unknown): ReleaseInfo[] {
  if (!Array.isArray(data)) return []

  const releases: ReleaseInfo[] = []
  for (const raw of data as Record<string, any>[]) {
    if (!raw || typeof raw.tag_name !== 'string' || raw.draft) continue

    const assets = Array.isArray(raw.assets) ? raw.assets : []
    const setup = pickAsset(assets, 'setup')
    const portable = pickAsset(assets, 'portable')
    if (!setup && !portable) continue

    releases.push({
      tag: raw.tag_name,
      publishedAt: typeof raw.published_at === 'string' ? raw.published_at : '',
      prerelease: !!raw.prerelease,
      channel: /insider/i.test(raw.tag_name) ? 'insider' : 'stable',
      setup,
      portable,
    })
  }

  return releases.sort(
    (a, b) => Date.parse(b.publishedAt || '') - Date.parse(a.publishedAt || ''),
  )
}

/**
 * GitHub 发布直链 → 自建节点的限时签名链接。
 * 任一入口成功即返回；全部失败返回 null，由调用方回退公益镜像。
 */
export async function signGithubUrl(rawUrl: string): Promise<SignedLink | null> {
  if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\//i.test(rawUrl)) return null

  const query = '?url=' + encodeURIComponent(rawUrl)
  for (const endpoint of SIGN_ENDPOINTS) {
    const data = (await fetchJson(endpoint + query, 6000)) as Record<string, unknown> | null
    if (!data || typeof data !== 'object') continue
    if (data.success === false) continue

    const url = typeof data.url === 'string' ? data.url : ''
    if (!/^https:\/\//i.test(url)) continue

    const ttl = Number(data.ttl)
    const lifetimeMs = (Number.isFinite(ttl) && ttl > 60 ? ttl : 300) * 1000
    return { url, expiresAt: Date.now() + lifetimeMs - 30_000 }
  }
  return null
}

<script setup lang="ts">
import { computed } from 'vue'
import { VPIcon, VPLink } from 'vuepress-theme-plume/client'
import { useData } from 'vuepress/client'

interface Locale {
  star: string
  issue: string
  web: string
}

const locales: Record<string, Locale> = {
  '/': { star: '在 GitHub 上 Star', issue: '遇到问题？', web: '访问站点' },
  '/en/': { star: 'Star on GitHub', issue: 'Create Issues', web: 'Visit Site' },
}

// ⚠️ 用 useData().lang 而不是 useRouteLocale()：
//    后者在 SSR 阶段（Plume 的 SearchBox / PageContextMenu 组件树中）会抛
//    "useClientData() is called without provider"，导致构建退出码非零。
//    useData() 的 lang 在同一上下文中始终可用，取值等价。
const { lang } = useData()
const locale = computed(() => locales[lang.value] ?? locales['/'])
</script>

<template>
  <div class="aside-nav-wrapper">
    <VPLink class="link" no-icon href="https://github.com/c1201y/ClassSoftwareHub">
      <VPIcon name="octicon:star-16" />
      <span class="link-text">{{ locale.star }}</span>
      <span class="vpi-arrow-right" />
    </VPLink>
    <VPLink class="link" no-icon href="https://github.com/c1201y/ClassSoftwareHub/issues/new/choose">
      <VPIcon name="octicon:issue-opened-16" />
      <span class="link-text">{{ locale.issue }}</span>
      <span class="vpi-arrow-right" />
    </VPLink>
    <VPLink class="link" no-icon href="https://classsoftwarehub.cn">
      <VPIcon name="octicon:globe-16" />
      <span class="link-text">{{ locale.web }}</span>
      <span class="vpi-arrow-right" />
    </VPLink>
  </div>
</template>

<style scoped>
.aside-nav-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
  margin: 8px 16px 0;
  border-top: solid 1px var(--vp-c-divider);
}

.aside-nav-wrapper .link {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 14px;
  color: var(--vp-c-text-2);
  transition: color var(--vp-t-color);
}

.aside-nav-wrapper .link:hover {
  color: var(--vp-c-brand-1);
}

.aside-nav-wrapper .link .link-text {
  flex: 1 2;
  font-size: 14px;
}

.aside-nav-wrapper :deep([class*=" vpi-"]) {
  margin: 0;
}
</style>

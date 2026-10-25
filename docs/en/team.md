---
title: Team
pageLayout: page
---

<TeamCard lang="en" />

## Development team

<CardGrid :cols="{ sm: 1, md: 2, lg: 2 }" class="container">
    <LinkCard title="椰汁" href="https://github.com/c1201y">
        <p class="role">Web build & maintenance<br>Windows 7 build<br>Documentation & releases</p>
    </LinkCard>
    <LinkCard title="Tiny-Nick" href="https://space.bilibili.com/1274920807">
        <p class="role">Early web build<br>Windows desktop<br>development</p>
    </LinkCard>
    <VPCard title="凭舟吟">
        <p class="role">GitHub acceleration nodes<br>OSS bucket & servers<br>cn domain</p>
    </VPCard>
    <LinkCard title="HelloCHLdev" href="https://github.com/HelloCHLdev">
        <p class="role">Linux (cross-platform)<br>desktop development</p>
    </LinkCard>
</CardGrid>

## Credits

The following teachers and students support the project beyond development. See [Credits & License](./friends.md) for upstream components and licensing.

| Name | Contribution |
| --- | --- |
| 开心的阿罗娜 (QQ community member) | Sponsored desktop development and website hosting |
| Xr080606 | Sponsored desktop development and website hosting |

Team roles and credits stay in sync with the "Credits" card below "About" in the web app's settings. To contribute or report an issue, read the [contribution guide](/dev/contribute).

<VPComment class="comment" />

<script setup>
import VPComment from '@theme/VPComment.vue'
</script>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
  justify-content: center;
  padding: 10px 0 0;
}

.role {
  font-size: 0.95em;
  font-weight: 500;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0;
}

.comment {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 0;
}

@media (max-width: 768px) {
  .container, .comment {
    margin: 0 15px;
  }
}
</style>

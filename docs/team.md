---
title: 团队
pageLayout: page
---

<TeamCard lang="zh-CN" />

## 开发团队

<CardGrid :cols="{ sm: 1, md: 2, lg: 2 }" class="container">
    <LinkCard title="椰汁" href="https://github.com/c1201y">
        <p class="role">网站搭建与维护<br>Windows 7 兼容版<br>文档与发布</p>
    </LinkCard>
    <LinkCard title="Tiny-Nick" href="https://space.bilibili.com/1274920807">
        <p class="role">前期网站制作<br>Windows 桌面端<br>开发</p>
    </LinkCard>
    <VPCard title="凭舟吟">
        <p class="role">GitHub 加速节点<br>OSS 存储桶与服务器<br>cn 域名</p>
    </VPCard>
    <LinkCard title="HelloCHLdev" href="https://github.com/HelloCHLdev">
        <p class="role">Linux（跨平台）<br>桌面端开发</p>
    </LinkCard>
</CardGrid>

## 鸣谢

以下老师与同学为项目提供了开发之外的支持。软件与上游组件的完整致谢见 [致谢与许可](./friends.md)。

| 致谢对象 | 贡献 |
| --- | --- |
| 开心的阿罗娜（热心 QQ 群友） | 赞助桌面端开发与网站服务器搭建 |
| Xr080606 | 赞助桌面端开发与网站服务器搭建 |

本页分工与鸣谢信息与网页端设置页「关于」下方的「鸣谢」卡片保持一致。想参与开发或反馈问题，请阅读 [贡献指南](./dev/contribute.md)。

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

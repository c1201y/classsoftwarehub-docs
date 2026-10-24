---
pageLayout: home
config:
  - type: doc-hero
    background: tint-plate
    hero:
      name: ClassSoftwareHub
      text: 电教委员常用软件下载站
      tagline: "面向教室电脑与电教设备管理场景：无广告、无捆绑、开源优先的软件收录与课堂工具集，覆盖网页端、Windows 10 桌面端与 Windows 7 兼容版。"
      image: /logo.png
      actions:
        - theme: brand
          text: 立即开始
          icon: lucide:rocket
          link: /doc/guide/web
        - theme: alt
          text: 概览
          icon: lucide:book-open
          link: /doc/overview
        - theme: alt
          text: 下载
          icon: lucide:download
          link: /download
        - theme: alt
          text: GitHub
          icon: fa-brands:github
          link: https://github.com/c1201y/ClassSoftwareHub

  - type: features
    title: 三种形态，一套数据
    features:
      - title: 网页端
        icon: lucide:globe
        details: Vue 3 + Vite 构建的纯静态站点，任意现代浏览器可直接访问，也是全部软件数据的权威源。
      - title: 桌面端
        icon: lucide:monitor
        details: WinUI 3 桌面客户端，系统底线 Windows 10 1809，提供截屏贴图与工具侧边栏等原生能力。
      - title: Windows 7 兼容版
        icon: lucide:cpu
        details: 以 Avalonia 11 + .NET 6 重写 UI 层，把系统底线降到 Windows 7 SP1，让教室老机器继续服役。

  - type: features
    title: 收录原则
    features:
      - title: 无广告无捆绑
        icon: lucide:shield-check
        details: 刻意保持干净的收录倾向，避免装机时被附加组件与推广内容污染。
      - title: 开源优先
        icon: lucide:git-branch
        details: 同功能场景下优先收录开源软件，并提供 GitHub 仓库入口。
      - title: 直链可校验
        icon: lucide:link
        details: 提供文件直链与 MD5 / SHA 系列校验值，下载结果可自行核对。
      - title: 系统限制明示
        icon: lucide:info
        details: 逐条标注版本号、体积与系统限制，避免下载后无法安装。

  - type: features
    title: 课堂工具箱
    features:
      - title: 随机抽号
        icon: lucide:dices
        details: 输入号码范围即可抽号，支持一次抽多个、抽过不重复与随机分组。
      - title: 计时与时钟
        icon: lucide:timer
        details: 倒计时、秒表与全屏时钟，大字号方便投影，到点响铃。
      - title: 截屏贴图
        icon: lucide:scissors
        details: 框选屏幕区域后编辑标注，支持撤销重做、复制、存盘与钉图。
      - title: 编码与哈希
        icon: lucide:hash
        details: Base64 / URL 编解码与 MD5 / SHA 系列哈希，全部在本地计算。

  - type: features
    title: 3 分钟开始使用
    features:
      - title: 第一步：访问或安装
        icon: lucide:download
        details: 直接打开网页端，或下载桌面端安装版（Windows 7 版另有便携包）。路径：/doc/guide/web
      - title: 第二步：完成引导
        icon: lucide:map
        details: 首次启动联网同步软件清单，随后即可浏览与下载。路径：/doc/guide/desktop
      - title: 第三步：按需配置
        icon: lucide:settings
        details: 老机器请阅读 Windows 7 专章，管理员请阅读维护手册。路径：/doc/guide/admin

  - type: features
    title: 面向维护者
    features:
      - title: 数据驱动
        icon: lucide:database
        details: 软件数据为一软件一 JSON，单条格式错误不影响整站，页面顶部给出明确提示。
      - title: 自动版本核对
        icon: lucide:refresh-cw
        details: 每周自动核对 GitHub Releases 与官方下载源，可确定的更新自动写回。
      - title: 提交审核流水线
        icon: lucide:git-pull-request
        details: 访客提交的软件经 Issue 审核后合并，避免误覆盖已发布数据。
      - title: 三路部署
        icon: lucide:cloud
        details: 同一份构建产物同时发布到 GitHub Pages、FTP 与 OpenList 网盘。
---

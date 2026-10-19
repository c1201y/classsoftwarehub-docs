---
pageLayout: home
config:
  - type: doc-hero
    background: tint-plate
    hero:
      name: ClassSoftwareHub
      text: Software hub for classroom admins
      tagline: "A clean catalogue and classroom toolbox for managing classroom PCs and AV equipment: no ads, no bundled junk, open source first — across web, desktop and Windows 7 builds."
      image: /logo.png
      actions:
        - theme: brand
          text: Get started
          icon: lucide:rocket
          link: /en/doc/guide/web
        - theme: alt
          text: Overview
          icon: lucide:book-open
          link: /en/doc/overview
        - theme: alt
          text: Download
          icon: lucide:download
          link: /en/download
        - theme: alt
          text: GitHub
          icon: fa-brands:github
          link: https://github.com/c1201y/ClassSoftwareHub

  - type: features
    title: Three forms, one dataset
    features:
      - title: Web
        icon: lucide:globe
        details: A Vue 3 + Vite static site reachable from any modern browser, and the authoritative source of all software data.
      - title: Desktop
        icon: lucide:monitor
        details: A WinUI 3 desktop client for Windows 10 1809+, adding native screen capture and a tool sidebar.
      - title: Windows 7 build
        icon: lucide:cpu
        details: Rewrites the UI layer with Avalonia 11 + .NET 6, lowering the floor to Windows 7 SP1 so old classroom machines keep working.

  - type: features
    title: Catalogue principles
    features:
      - title: No ads, no bundling
        icon: lucide:shield-check
        details: A deliberately clean catalogue that keeps installers free of add-ons and promotions.
      - title: Open source first
        icon: lucide:git-branch
        details: Prefers open-source software for the same job, and links each GitHub repository.
      - title: Direct links + checksums
        icon: lucide:link
        details: Provides direct file links with MD5 / SHA checksums you can verify yourself.
      - title: OS limits stated
        icon: lucide:info
        details: Version, size and OS limits are listed per entry, so nothing downloads only to fail installing.

  - type: features
    title: Classroom toolbox
    features:
      - title: Random draw
        icon: lucide:dices
        details: Draw from a number range, with multi-draw, no-repeat and random grouping.
      - title: Timers and clock
        icon: lucide:timer
        details: Countdown, stopwatch and full-screen clock in large type for projection, with an end-of-timer chime.
      - title: Screen capture and pin-up
        icon: lucide:scissors
        details: Select a screen region and annotate it, with undo/redo, copy, save and pin-up.
      - title: Encoding and hashing
        icon: lucide:hash
        details: Base64 / URL coding plus MD5 / SHA hashing, all computed locally.

  - type: features
    title: 3 minutes to start
    features:
      - title: "Step 1: open or install"
        icon: lucide:download
        details: "Use the web site directly, or download the desktop installer / portable build. Path: /en/doc/guide/web"
      - title: "Step 2: finish onboarding"
        icon: lucide:map
        details: "First launch syncs the software catalogue over the network, then you can browse and download. Path: /en/doc/guide/desktop"
      - title: "Step 3: configure as needed"
        icon: lucide:settings
        details: "Read the Windows 7 chapter for old machines, and the administration guide for maintainers. Path: /en/doc/guide/admin"

  - type: features
    title: For maintainers
    features:
      - title: Data-driven
        icon: lucide:database
        details: One JSON file per app, so a single malformed entry never takes the site down and the page shows a clear notice.
      - title: Automatic version checks
        icon: lucide:refresh-cw
        details: Weekly checks against GitHub Releases and vendor sources, with proven updates written back automatically.
      - title: Submission review pipeline
        icon: lucide:git-pull-request
        details: Visitor submissions are reviewed as Issues before merging, preventing accidental overwrites.
      - title: Three-way deploy
        icon: lucide:cloud
        details: One build is published to GitHub Pages, FTP and an OpenList netdisk at once.
---

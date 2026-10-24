---
title: Web Client
createTime: 2026/10/19 20:00:00
---

> **Quick start** - no install, no login, just open a browser

## Access

| Entry | Address |
| --- | --- |
| Main site | `https://classsoftwarehub.us.ci` |
| Mirror | `https://classsoftwarehub.132614.xyz` |

The mirror is usually faster, but users in northern and western Fujian may find it unreachable. The site is also mirrored to GitHub Pages and FTP, plus a netdisk copy.

The web site is a pure static site. **No account is required** to browse or download. A single-file build (~2 MB) can be opened offline by double-clicking, with the same features as the online version.

## Accounts

The web site has **no account system** and no sign-in. Identity-related features work as follows:

1. **Submit software, echo cave posts, feedback**: fill in and submit directly, no GitHub account needed. Submissions enter the repository review queue and are handled by maintainers via GitHub Issues.
2. **Contact encryption**: the contact field in "submit software" and the feedback centre is encrypted locally in the browser with an age public key before submission, so public records contain ciphertext only; only maintainers can decrypt it with the private key.

## Backend

Dynamic features are served by a self-hosted backend at `https://api.classsoftwarehub.cn` (Tencent EdgeOne Pages Functions, source in `c1201y/csh-api`). It is responsible for:

- Receiving software submissions, echo-cave posts and feedback, writing repository drafts and opening review issues
- Signing short-lived OSS upload credentials and download tickets for files in the private bucket
- Signing self-hosted acceleration links for GitHub files
- Serving site status, announcements, download statistics and maintenance endpoints

Browsing and downloading need no account. If the backend is unavailable, the static pages still open and dynamic features report a clear error.

## Features

| Feature | Description |
| --- | --- |
| Browse | Home page groups software by category (classroom / office / system / media / network / utility) |
| Platform filter | Filter by Windows / macOS / Linux / Android / iOS / Web |
| Detail page | Full description, version, size, OS limits, official site and repository, plus per-platform download entries and checksums |
| Download | File links start downloading in-page; vendor pages open in a new tab; netdisk links open the share page |
| Checksums | First and last characters shown; hover for the full value, click to copy |
| Accelerated download | GitHub files try self-hosted acceleration first, falling back to public mirrors and the original URL |
| Global search | `Ctrl + K` or `Ctrl + F` opens the panel, searching software, built-in tools, AI nav sites and pages at once |
| Built-in tools | 12 local-only or lightly server-assisted tools, listed below |
| AI navigation | Full-width clickable rows for Chinese AI sites |
| Classroom shout | Enter the classroom PC's 6-digit pairing code and the text appears full-screen on that screen |
| Welcome dialog | Shown once when you first land on the home page |
| Echo cave | Group members' posts are displayed and typed out one by one |
| Terms page | Terms of service, privacy policy and disclaimer are collected at `/agreement` |

### Built-in tools

| Group | Tools |
| --- | --- |
| Images & colours | Image colour picker, colour conversion / palette |
| Classroom | Random draw, classroom timer, full-screen clock, classroom shout |
| Text & encoding | Text processing, encoding / hashing, Markdown preview |
| Utilities | QR code generator, timestamp conversion, OS mirror download |

## Typical workflows

### Download a piece of software

1. Open the site, browse by category on the home page, or type a name in the search panel.
2. Click a card to open the detail page (URL like `#/download/7-zip`).
3. Check the version, OS limits and size.
4. Pick an entry in the download area:
   - Button labelled "下载" (Download) → starts in-page;
   - Button labelled "前往官网" (Official site) → opens the vendor page in a new tab;
   - Button labelled "前往网盘" (Netdisk) → opens the share page in a new tab.
5. To verify integrity, click the checksum to copy the full hash and compare it yourself.

### Use the classroom random draw tool

1. Enter "Built-in tools" via the search panel or bottom navigation, then choose "Random draw".
2. Enter a number range (for example student IDs 1–50).
3. Optionally set how many to draw at once, whether to avoid repeats, and whether to group randomly.
4. Start drawing.

### Submit a piece of software

1. Go to the "Submit software" page (`#/submit`).
2. Fill it in directly, or use "Import from GitHub" to auto-fill repository information.
3. Fill in the required fields: `id`, `name`, `category`, `tagline`, `description`, `system`, a contact, and at least one direct file link.
4. Optionally add a checksum; `MD5:` prefixes and byte-separated forms are accepted.
5. After submitting, it enters the review queue; a maintainer labels the issue `approved` to merge and publish.

Each device may submit at most 6 times per day with at most 3 pending reviews; contacts can be age-encrypted.

## Permissions

| Role | Allowed actions |
| --- | --- |
| Visitor | Browse, search, download, use all built-in tools, submit software, post to the echo cave, file feedback |
| Maintainer | Merge or reject submissions, edit software data and site copy, change CI configuration |

The web site has no user-level server authorization; submissions are validated by the backend and written as public repository drafts or issues. Cleanup, file-registry and download-stats endpoints require `X-Purge-Token`; status and announcement endpoints are public.

## FAQ

| Symptom | Cause | Resolution |
| --- | --- | --- |
| Red bar at the top of the page | A software JSON file is malformed | That file is skipped and the rest render normally. Report the file name and line number to a maintainer |
| Detail page says "software not found" | 5 historical `id` values contained `?` `&` `=` | Already fixed; report the exact URL if it still happens |
| Clicking "Download" does nothing | The entry is a vendor page or netdisk link; the button reads "前往官网" or "前往网盘" | Check the button label and description |
| Icon shows a first-letter placeholder | The `icon` field is empty or the image failed to load | Does not affect downloads; report it so a maintainer can add an icon |
| Accelerated link has expired | Self-hosted signed links live for about 15 minutes | Reload the page to get new links, or pick another source |
| Submission says the quota is used up | 6 per device per day, at most 3 pending | Try again the next day, or raise it in a GitHub issue |
| Mirror site unreachable | Regional network issue | Use the main site |
| Store link loops back to the Store | Microsoft Store is not installed (LTSC / slim builds / removed) | Press `Win + R`, run `wsreset -i`; fallback `winget install 9WZDNCRFJBMP` |

Backend status is available at `https://api.classsoftwarehub.cn/`.

---
title: Submissions & Feedback
createTime: 2026/10/19 20:00:00
---

> Common questions about submitting software, echo cave posts and feedback

## What must I fill in to submit software

Required: `id`, `name`, `category`, `tagline`, `description`, `system`, a contact, and **at least one download item**. A download item can be a direct file link or an official/download page or netdisk page (`kind` set to `page` / `netdisk`). The submit page validates these client-side.

`id` allows lowercase letters, digits and hyphens only, and must not contain `?` `&` `=` — malformed historical `id` values once caused "software not found" on the detail page, and are now fixed.

## What is "Import from GitHub"

A helper on the submit page: enter a GitHub repository URL and it reads that repository's Releases and assets, filling in the version, size and direct download links. The unauthenticated GitHub API is limited to 60 requests/hour/IP, and one import costs about 2.

## How do I enter a checksum

Enter the hex string only; the algorithm is detected by length:

| Length | Algorithm |
| --- | --- |
| 32 | MD5 |
| 40 | SHA-1 |
| 56 | SHA-224 |
| 64 | SHA-256 |
| 96 | SHA-384 |
| 128 | SHA-512 |

`MD5:` prefixes and byte-separated (colon / space) forms are accepted and normalised on submit.

::: warning Do not put checksums in note
A 128-bit hash has no natural line break, so the full string in `note` overflows the card.
:::

## Why is my contact encrypted

The contact field in "submit software" and the feedback centre is encrypted locally in the browser with an age public key before submission. Public records and copied text contain ciphertext only, and only maintainers can decrypt it with the private key. This is intentional — the field is published verbatim in a public Issue, and a plaintext leak cannot be undone.

## How long until my submission is processed

Submissions land in the repository's `submissions/` directory and a workflow creates a `[待审核]` Issue. A maintainer then labels the issue to merge or reject. Timing depends on maintainer availability.

## It said submitted, but nothing was published

Likely the draft was created but not yet reviewed. Check progress via the entry given on the submit page or the QQ group. Repeated submissions of the same software may each wait independently, because idempotency is keyed on the draft file path.

## Feedback submission failed

1. After a network failure the page shows a "use GitHub instead" button that opens a pre-filled Issue form.
2. The "copy feedback content" button is always available.
3. Form drafts are stored in the browser and restored when you return; they are cleared automatically on a successful submit.

## Is there a limit on echo cave posts

Yes. Each post is limited to 200 characters. Posts land as drafts and enter the review queue; only approved posts appear on the page.

## What is the upload size limit

2.5 GB per file (the ceiling for a single OSS PUT is 5 GB; anything larger needs multipart). For larger files, use an official or GitHub Releases link instead.

## Download says quota exhausted

Site-hosted OSS objects use a ticket gate: each device gets 25 downloads per day by default (backend `DL_DAILY_LIMIT`), using a short-lived ticket valid for about 15 minutes. Once exhausted, try again the next day or use the software's official direct link.

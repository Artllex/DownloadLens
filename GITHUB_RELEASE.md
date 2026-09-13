# DownloadLens 1.3.2

Organize downloads by filename and website, with conversation folders for ChatGPT.

## What's new

- DownloadLens branding and the Lens icon.
- Simple Polish/English settings with automatic language selection.
- Combined filename/website rules, shared priorities, and folder variables: `{domain}`, `{year}`, `{month}`.
- Settings import/export with review before applying; consent and download activity are excluded.
- “Save to…” context menu for ordinary HTTP(S) links and media.
- No automatic cancel/re-download. Generated blob/data downloads remain eligible for local routing without forwarding their opaque URL payload through extension native messages.
- Removed the confusing rule-preview form; added a direct support-installer link.

## Downloads and installation

1. **DownloadLens-Support-Setup-1.2.3.exe** — required Windows companion. Close Firefox before installing. Existing working support installations do not require reinstallation for the new rule features.
2. **DownloadLens-1.3.2.xpi** — currently **unsigned**. Load temporarily through `about:debugging` for testing. A permanent public Firefox Add-ons release requires Mozilla review/signing, which is a separate process. Do not uninstall an existing extension merely to update it, as Firefox removes its settings on uninstall.
3. **DownloadLens-1.3.2-review-source.zip** — readable extension and companion source for review.

## Important

Windows only. Support installs both a Native Messaging host and privileged Firefox AutoConfig integration (with a separate UAC prompt). It synchronizes moved-file locations and adds ZIP extraction and confirmed deletion in the Downloads panel and Library. The integration operates independently of extension consent/removal and may need updates after Firefox changes. See [Privacy](https://github.com/Artllex/download-router/blob/main/PRIVACY.md) for metadata scope and retention. The installer is not signed or approved by Mozilla.

Automated routing, UI, privacy, native-host and fixture integration tests are available. Browser/native integration across all Firefox versions is not guaranteed. AMO lint reports no errors and two documented minimum-version compatibility warnings.

MIT license. Arkadiusz Pajda · Artllex · 2026.

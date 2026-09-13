# DownloadLens 1.3.2

- Removes the rule-preview form entirely; routing rules and automated tests remain unchanged.
- Includes DownloadLens Support 1.2.3 and a direct installer link in PL/EN settings. Keeps existing application IDs and installed settings. The Firefox XPI is unsigned pending the separate Mozilla review/signing process.

## Previous UI revision (1.3.1)

- Moves filename/domain preview inputs into the collapsed “Check rules” section. Explains explicitly that it previews form settings without downloading or saving anything (PL/EN).

## Features introduced in 1.3.0

- Keeps the existing filename, website and ChatGPT settings visible. Optional controls live under Advanced.
- Adds reviewed JSON import/export of settings, excluding consent, activity and pending operations. Imports are staged in the form until Save.
- Adds an optional website condition to filename rules, a shared rule priority list, and `{domain}`, `{year}`, `{month}` destination variables.
- Existing settings retain filename → ChatGPT → website precedence until the user explicitly changes the order.
- Adds “DownloadLens — Save to…” for HTTP(S) links and media through the existing support component. This is a new user-requested download, not an automatic retry. Container/private tabs are excluded from this command; use the site's normal download there.
- Manual downloading rejects opaque and unsafe schemes. Automatically completed blob/data downloads can still be moved by filename or verified source context; their URL payloads are not sent by the extension to the native host. Other schemes are left alone.
- Preserves native-host identity and existing support integration. No support installer change is required for these extension features.
- Automated component and settings UI tests are provided; real Firefox/native-host acceptance of this build is still required. No AMO/GitHub publication performed.

## Previous candidate

# Download Pilot 1.2.9 — signing candidate (not published)

By Arkadiusz Pajda (Artllex), 2026.

## Highlights
- Renames the product to Download Pilot and the companion to Download Pilot Support. Existing extension/native-host IDs, installation identity, settings and AutoConfig ownership markers are retained for upgrade compatibility.
- Adds Firefox data-type declarations and an explicit PL/EN local-transfer consent page for new installs and upgrades without a current decision.
- Blocks all extension native messaging until consent, with revocation and an uninstall option.
- Stops recording unrelated click context in diagnostics; excludes private downloads from extension routing.
- Includes a privacy notice and candid reviewer documentation for the separate privileged AutoConfig component.
- Settings load immediately without waiting for the native support component. Folder suggestions update in the background without overwriting saved values or ongoing edits.
- Defensive handling of incomplete native responses, with regression tests for delayed responses and newly added rules.
- Fresh support installations use the current user's Windows Downloads known folder, including redirected locations, for ChatGPT conversation folders.
- Settings suggest real local paths rather than hard-coded examples. Missing or older support leaves suggestions empty.
- Existing folder settings and routing rules remain unchanged.
- New flat folder-and-download-arrow icon in all Firefox icon sizes.
- Configurable ChatGPT download location with conversation subfolders.
- Optional built-in ChatGPT routing rule.
- Ordered filename rules take priority over website rules, with enable switches and a live matching preview.
- Compact Polish and English settings, automatic Firefox language selection, and author links to GitHub and LinkedIn.

## Included downloads
- **Download-Pilot-1.2.9.xpi**: unsigned Firefox signing candidate.
- **Download-Pilot-Support-Setup-1.2.2.exe**: Windows support installer with native path synchronization, ZIP extraction and confirmed file deletion in the downloads panel and Library.

## Installation
Close Firefox and install the support component. Its Firefox integration requires UAC approval. Load the XPI separately using about:debugging.

The XPI is **unsigned** and loads temporarily; it must be reloaded after Firefox restarts. Permanent installation requires Mozilla signing. No signing checks are bypassed.

Keep the legacy Firefox Enhancements AutoConfig loader disabled. The support installer refuses to overwrite another active AutoConfig. Existing rules and configured folders are preserved. New downloads use the updated integration; older history entries are not repaired retroactively.

## Validation and limitations
Automated routing, filename matching, settings UI and integration install/update/removal tests passed. Isolated Firefox tests verified native path persistence and Library action order/visibility. Internal Firefox APIs may change in future versions. The installer and XPI are separate components; neither is an official Mozilla product.

MIT license.

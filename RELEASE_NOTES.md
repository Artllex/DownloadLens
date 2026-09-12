# Download Router 1.2.5

By Arkadiusz Pajda (Artllex), 2026.

## Highlights
- New flat folder-and-download-arrow icon in all Firefox icon sizes.
- Configurable ChatGPT download location with conversation subfolders.
- Optional built-in ChatGPT routing rule.
- Ordered filename rules take priority over website rules, with enable switches and a live matching preview.
- Compact Polish and English settings, automatic Firefox language selection, and author links to GitHub and LinkedIn.

## Included downloads
- **Download-Router-1.2.5.xpi**: Firefox extension.
- **Download-Router-Support-Setup-1.2.0.exe**: Windows support installer with native path synchronization, ZIP extraction and confirmed file deletion in the downloads panel and Library.

## Installation
Close Firefox and install the support component. Its Firefox integration requires UAC approval. Load the XPI separately using about:debugging.

The XPI is **unsigned** and loads temporarily; it must be reloaded after Firefox restarts. Permanent installation requires Mozilla signing. No signing checks are bypassed.

Keep the legacy Firefox Enhancements AutoConfig loader disabled. The support installer refuses to overwrite another active AutoConfig. Existing rules and configured folders are preserved. New downloads use the updated integration; older history entries are not repaired retroactively.

## Validation and limitations
Automated routing, filename matching, settings UI and integration install/update/removal tests passed. Isolated Firefox tests verified native path persistence and Library action order/visibility. Internal Firefox APIs may change in future versions. The installer and XPI are separate components; neither is an official Mozilla product.

MIT license.

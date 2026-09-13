# DownloadLens — Privacy notice

Updated 2026-09-13 for extension 1.3.2 and Windows Support 1.2.3.
Author: Arkadiusz Pajda (Artllex). Contact: https://github.com/Artllex/download-router/issues

## Extension

DownloadLens processes download names and paths, URLs, start times, matching rules, website domains and page titles. ChatGPT conversation titles become folder names. Local paths can contain a Windows account name or other personal information. It does not read chat message bodies, passwords or cookies for routing.

The context-menu permission enables a user-requested “Save to” command for HTTP(S) links and media. This starts a normal browser download (using the browser's regular session), then uses local support to move it. It rejects blob/data and other non-HTTP(S) addresses rather than attempting to fetch them again. Normal completed blob/data downloads remain eligible for local routing; the extension does not include their opaque URL payload in native messages. The separate integration's metadata collection described below is unchanged.

Settings export creates a local JSON file containing rules, configured folder paths, language and priority order. It does not include consent, download history or pending commands. Import requires review and Save and does not grant consent. Exported paths may contain personal information; share backup files carefully. No cloud synchronization is implemented.

With explicit consent, necessary download metadata and local folder commands are sent via Firefox Native Messaging to `com.artllex.download_router`, a separate local Windows program. The program moves/copies files locally and can reveal them in Explorer. File contents are not uploaded by this product. The extension sends no analytics, advertising or crash telemetry and makes no remote service requests for routing. Normal browser downloads, Firefox updates, and user-opened external links remain separate network activities.

Before consent, the extension does not initiate native messages or route downloads. Installation/update introduces a focused consent tab when no current decision exists. The Privacy page offers allow, decline/pause and uninstall. Declining or revoking clears temporary routing state and the latest result in extension storage while retaining user rules. A native operation already dispatched cannot be recalled. Private downloads are excluded from extension routing. Saved settings remain local to the Firefox profile; uninstalling the extension removes its storage through Firefox.

## Separate Windows Support / AutoConfig integration

This is NOT a pure Native Messaging installer. It installs privileged Firefox AutoConfig code, including `general.config.sandbox_enabled=false` for the AutoConfig sandbox (not the web-content sandbox). It changes the native download panel and Library, adding ZIP extraction and confirmed deletion, and synchronizes moved-file history paths.

This separately installed integration runs independently of extension consent, extension disablement and extension removal. It captures metadata for public downloads (including downloads not routed by the extension): original name, path, source URL and start time. The in-memory list is bounded to 512 records per browser session; its most recent snapshot is written to disk. Original-name metadata can remain until replaced by a later session's write or manually removed. Queue requests and the last synchronization result may also remain on disk. Requests older than 24 hours are ignored, not automatically erased. Private-download metadata is excluded from these disk records.

Storage locations:
- `%LOCALAPPDATA%\Programs\DownloadRouterSupport\folders.xml` — existing/imported base-folder setting, if present.
- `%LOCALAPPDATA%\Programs\ChatGPTFolderLauncher\sync-requests` — legacy shared metadata location: `original-names.json`, GUID-named relocation requests and `last-result.json`. This path does not require ChatGPT Workspace Setup to be installed.
- Downloaded/extracted files live in user-selected folders; Firefox maintains its own history.
- Installation backup/state files reside in the Firefox installation directory.

Uninstall DownloadLens Support from Windows to remove its owned, unchanged integration files. Modified files are preserved for safety. Uninstallation/consent withdrawal does not automatically erase downloaded files, history, backup files or the shared metadata directory. Do not delete shared metadata while another legacy integration is using it. ZIP extraction can overwrite an existing extraction destination after confirmation; deletion is permanent after confirmation. The helper opens the output folder and copies its path to the Windows clipboard.

## Submission disclosure

The manifest declares browsing activity, website content, website activity and personally identifying information because download URLs, titles, activity timestamps and local paths are passed to the local application. It does not declare `none`. No optional telemetry is implemented. This notice does not assert Mozilla approval; the privileged integration and local metadata lifecycle require reviewer evaluation.

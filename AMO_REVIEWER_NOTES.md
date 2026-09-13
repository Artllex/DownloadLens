# Mozilla reviewer notes — DownloadLens 1.3.3

Requested channel: public AMO listing. Windows desktop only. Extension ID: `download-router@artllex`. License: MIT. Author: Arkadiusz Pajda (Artllex).

## Important architecture disclosure

The extension requires the separately installed Windows support component. DownloadLens Support 1.2.4 is included in https://github.com/Artllex/download-router/releases/tag/v1.3.3 . Direct installer: https://github.com/Artllex/download-router/releases/download/v1.3.3/DownloadLens-Support-Setup-1.2.4.exe . The installer is not contained in the XPI and is not signed by Mozilla.

Support includes BOTH a Native Messaging host AND privileged AutoConfig integration installed in Firefox's application directory through a UAC-approved helper. It disables the AutoConfig sandbox with `general.config.sandbox_enabled=false`; it does not disable extension signature checks or the web-content sandbox. AutoConfig accesses internal Downloads/DownloadHistory APIs, records original public-download names, updates moved-file paths and adds ZIP extraction/deletion controls to the browser panel and Library.

AutoConfig operates independently of extension consent/removal. See PRIVACY.md for the separate component's data scope and persistence. Please evaluate this architecture explicitly; we do not present Native Messaging as the complete implementation. Existing active AutoConfig from another product causes installation to stop rather than overwrite it. Use a disposable Windows VM / Firefox installation for review.

## Consent and permissions

The manifest declares data types using Firefox's built-in data consent system. A versioned custom consent page additionally blocks all extension-to-native messages until the user accepts, including on Firefox 109–139. Installation or an upgrade without a current decision opens an active tab. Decline pauses routing; settings remain editable. Users can revoke through Settings → Privacy and uninstall with Firefox confirmation. No telemetry exists. Private downloads are not routed. No external service account is required to test website/filename rules; ChatGPT-specific tests may use a reviewer-owned account, but no credentials are bundled.

Permissions: contextMenus for the explicit Save to command; downloads to observe completed downloads; tabs and all-URL content scripts to capture page/domain/title context across arbitrary user-configured sites (no chat bodies); storage for local settings, consent and temporary state; nativeMessaging for the Windows helper. No remote code, minification, obfuscation or bundled third-party runtime libraries in the extension.

## Build

The included `firefox-extension` files are the XPI's readable source without preprocessing. On Windows PowerShell run `./Build.ps1` to archive them into `dist/DownloadLens-1.3.3.xpi`.

Support source is included separately under `support`. Build using Windows .NET Framework C# compiler and Inno Setup: `./Build-Support.ps1 -Compiler <path-to-ISCC.exe>`. This compiles the native host and builds the installer. Icons are already supplied; no image generation step is required. `Render-Icons.cjs` is an optional development asset tool, not required for rebuilding the XPI.

## Functional checks

1. Install support in a clean test environment with Firefox closed; accept its separate UAC prompt. Load the submitted XPI temporarily in about:debugging for review.
2. Before consent, download a benign text file: the extension should not move it. Open settings: manual rule editing works, native folder actions are blocked.
3. Accept local data transfer. Add a filename rule `*.txt` pointing to an empty test folder, save, download a text file. It should move there; a second same-name download must not overwrite the first.
4. Add a website rule for a benign download page; disable the filename rule to test website routing. Unmatched downloads stay in Firefox's chosen location.
5. Optional ChatGPT test: enable ChatGPT routing and download a generated text file; it should enter a conversation-named subfolder of the selected base.
6. Open the native Downloads panel/Library; verify the relocated path, reveal action and ZIP controls using a harmless archive. Deletion and extraction overwrite require confirmation.
7. Revoke on Privacy. Download again: extension routing must stop; rules remain. The separately installed AutoConfig integration remains active as disclosed.
8. Test PL/EN and install/update consent. The same decision version does not repeatedly prompt after refusal.

## Validation boundaries

Automated tests use mocked extension APIs and Edge for HTML UI. They do not prove Mozilla signing, installation consent prompts in release Firefox, or AMO policy acceptance. AutoConfig has prior isolated-Firefox integration tests, but submission is not a guarantee of compatibility with every Firefox version.

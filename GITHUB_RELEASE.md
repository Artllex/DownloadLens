# DownloadLens 1.3.4

Includes DownloadLens Support 1.2.5 with cooperative AutoConfig for Firefox Enhancements 0.1.16.

## Install
1. Close Firefox and install DownloadLens-Support-Setup-1.2.5.exe.
2. Install the Firefox extension from Mozilla Add-ons when approved. The XPI here is unsigned pending review; use about:debugging only for temporary testing.
3. Optional: install Firefox Enhancements 0.1.16. Do not reactivate old disabled loaders.

Existing settings and extension/native-host identifiers are preserved. The extension change updates the installer link; routing rules and permissions are unchanged.

## Validation and limitations
Install, update and uninstall passed in both orders. An isolated Firefox 155.0.1 started both configurations. Full acceptance of hotkeys, ZIP and download routing in the user's real profile remains unverified.

Windows Support uses privileged AutoConfig and Native Messaging, disables the AutoConfig sandbox (not web-content sandboxing), and operates independently of extension consent/removal. It is not signed or approved by Mozilla. See [Privacy](https://github.com/Artllex/DownloadLens/blob/main/PRIVACY.md). Unknown AutoConfig remains blocked.

## Assets and SHA256
The release includes the unsigned XPI, required Windows installer, readable reviewer source and SHA256SUMS.txt. Mozilla signing changes the XPI checksum; the signed artifact is not yet available here.

MIT. Arkadiusz Pajda · Artllex · 2026.

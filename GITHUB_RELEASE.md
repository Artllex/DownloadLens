# DownloadLens 1.3.6

Adds a dedicated configuration backup section. Export rules and preferences to a JSON file, then import them into DownloadLens on another computer. Consent and download history are deliberately excluded.

Includes DownloadLens Support 1.2.6 with shared AutoConfig v2 for Firefox Enhancements 0.1.18.

## Install
1. Close Firefox and install DownloadLens-Support-Setup-1.2.6.exe.
2. Install the Firefox extension from Mozilla Add-ons when approved. The XPI here is unsigned pending review; use about:debugging only for temporary testing.
3. Optional: install Firefox Enhancements 0.1.18. Do not reactivate old disabled loaders.

Existing settings and extension/native-host identifiers are preserved. The extension change updates the installer link; routing rules and permissions are unchanged.

## Validation and limitations
Automated standalone, both-order installation/removal, dispatcher and rollback tests passed. Full acceptance of hotkeys, ZIP and download routing in the user's real profile remains unverified.

Windows Support uses privileged AutoConfig and Native Messaging, disables the AutoConfig sandbox (not web-content sandboxing), and operates independently of extension consent/removal. It is not signed or approved by Mozilla. See [Privacy](https://github.com/Artllex/DownloadLens/blob/main/PRIVACY.md). Unknown AutoConfig remains blocked.

## Assets and SHA256
The release includes the unsigned XPI, required Windows installer, readable reviewer source and SHA256SUMS.txt. Mozilla signing changes the XPI checksum; the signed artifact is not yet available here.

MIT. Arkadiusz Pajda · Artllex · 2026.



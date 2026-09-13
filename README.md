# DownloadLens

Firefox extension by **Arkadiusz Pajda (Artllex), 2026**.

Route downloads by filename or website, with optional ChatGPT conversation folders.
Filename rules take priority by default; Advanced offers a shared priority order.
Includes PL/EN settings, combined filename/website conditions,
and a switch for the built-in ChatGPT rule. Existing settings retain their precedence.

## DownloadLens 1.3.2

`dist/DownloadLens-1.3.2.xpi` is unsigned; Mozilla public-listing submission is a separate process. Load temporarily through
Firefox `about:debugging` → This Firefox → Load Temporary Add-on, or reload the
existing development extension. Do not uninstall the extension just to update it:
uninstallation removes its stored settings. Existing native support is still required.

Advanced contains a shared rule order and JSON import/export. Import stages changes
in the form; review destinations and Save to apply. Consent and activity are excluded.
Folder paths accept `{domain}`, `{year}` and `{month}`. A filename rule's Advanced
section can restrict the match to one website (including subdomains).

The context menu's “DownloadLens — Save to…” starts a user-requested HTTP(S)
download and moves it with existing native support. Use the website's normal button
for generated blob/data URLs, container tabs, or downloads requiring special requests.
Automatic routing never cancels/re-downloads files. Completed blob/data files can
still match filename rules or a verified source context, without passing their opaque
URL payload to the native host. Other URL schemes are left untouched.

Automated logic/UI checks passed; real Firefox + native-host acceptance is pending.

This repository owns the extension **and its Windows native host / AutoConfig integration**.
Install DownloadLens Support, then the separate XPI. Firefox Enhancements is
not required for routing or the extension's Explorer reveal button.

Support 1.2.3 includes ZIP extraction and confirmed file deletion in the native
panel and Library, as well as its own Firefox AutoConfig module for native
download-path synchronization and pre-collision filename capture. It adds no
unrelated browser features and does not require Firefox Enhancements. Close Firefox
before installation; UAC is required only for integration in its program directory.
Another active AutoConfig is rejected without overwriting it. Keep the old
Firefox Enhancements loader disabled; do not enable both loaders together.
Build the support installer with
`Build-Support.ps1 -Compiler <path-to-ISCC.exe>`. See `support/README.txt`.

## Build and test

Run `Build.ps1` in PowerShell to create `dist/DownloadLens-1.3.2.xpi`.
Run `node tests/firefox-extension.test.js` and `node tests/filename-rules.test.js`.
The optional UI test requires Playwright and Microsoft Edge.

The XPI is currently **unsigned**. Load it temporarily in `about:debugging`;
normal permanent installation requires Mozilla signing. Signature checks are not bypassed.
The separate AutoConfig integration disables the AutoConfig sandbox, not the web-content sandbox.
The extension ID remains `download-router@artllex`.
Updating this extension does not require reinstalling Firefox Enhancements unless
the native protocol changes. Existing settings remain in Firefox extension storage.

## Project split

Extracted from the extension in ChatGPT-Workspace-Setup. Historical source:
https://github.com/Artllex/ChatGPT-Workspace-Setup/commit/97229e4d53ab217d5fe5031e18450e7c79c349c1
New changes and extension releases belong here. The original repository and its
published history are not deleted or rewritten.

MIT license. [GitHub](https://github.com/Artllex) · [LinkedIn](https://www.linkedin.com/in/arkadiusz-pajda)

# Download Router

Firefox extension by **Arkadiusz Pajda (Artllex)**.

Route downloads by filename or website, with optional ChatGPT conversation folders.
Filename rules take priority; the first enabled match wins. Includes PL/EN settings,
rule ordering, a matching preview and a switch for the built-in ChatGPT rule.

This repository owns **only the extension**, its UI, assets, tests and XPI build.
The Windows native host, Firefox Library/panel actions and their installer belong to
[Firefox Enhancements](https://github.com/Artllex/firefox-zip-quick-extract).
Install that companion to enable arbitrary local destination folders.

## Build and test

Run `Build.ps1` in PowerShell to create `dist/Download-Router-1.2.2.xpi`.
Run `node tests/firefox-extension.test.js` and `node tests/filename-rules.test.js`.
The optional UI test requires Playwright and Microsoft Edge.

The XPI is currently **unsigned**. Load it temporarily in `about:debugging`;
normal permanent installation requires Mozilla signing. No signatures or Firefox
security settings are bypassed. The extension ID remains `download-router@artllex`.
Updating this extension does not require reinstalling Firefox Enhancements unless
the native protocol changes. Existing settings remain in Firefox extension storage.

## Project split

Extracted from the extension in ChatGPT-Workspace-Setup. Historical source:
https://github.com/Artllex/ChatGPT-Workspace-Setup/commit/97229e4d53ab217d5fe5031e18450e7c79c349c1
New changes and extension releases belong here. The original repository and its
published history are not deleted or rewritten.

MIT license. [GitHub](https://github.com/Artllex) · [LinkedIn](https://www.linkedin.com/in/arkadiusz-pajda)

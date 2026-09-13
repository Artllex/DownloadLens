# DownloadLens icon

Original PNG copied without modification from the owner's private repository:
https://github.com/Artllex/lens-icon-system/blob/main/DownloadLens.png

Git blob: `e800f137cf7843eb9676d0fc1d4b8522bcbe87ab`.

Run `Render-Icons.cjs` to produce the extension's 16, 32, 48, 96 and 128 pixel PNG assets. The original is preserved; only the packaged derivatives are resized, with aspect ratio and transparency retained.

Run `node Build-Windows-Icon.cjs` to package the existing PNG sizes into `DownloadLens.ico`. This ICO is embedded in the installer and native host. It does not redraw or recolor the artwork.

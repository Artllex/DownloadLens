"use strict";

function reportDownloadContext() {
  browser.runtime.sendMessage({
    type: "download-context",
    hostname: location.hostname,
    title: document.title
  }).catch(() => {});
}

document.addEventListener("pointerdown", reportDownloadContext, true);
document.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") reportDownloadContext();
}, true);

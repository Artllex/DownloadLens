"use strict";

const RouterPrivacy = {
  version: 1,
  async allowed() {
    const values = await browser.storage.local.get({ localDataConsent: null });
    return values.localDataConsent?.version === this.version && values.localDataConsent.accepted === true;
  },
  async send(host, message) {
    if (!await this.allowed()) throw new Error("DownloadLens: review Privacy / Prywatność in Settings before enabling local data transfer.");
    return browser.runtime.sendNativeMessage(host, message);
  }
};

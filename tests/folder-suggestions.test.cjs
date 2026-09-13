const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const path = require('path');
const assert = require('assert');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage();
    await page.addInitScript(() => {
      window.browser = {
        i18n: { getUILanguage: () => 'en' },
        storage: { local: { get: async defaults => ({ ...defaults, localDataConsent:{version:1,accepted:true}, language: 'en', chatgptFolder: 'D:\\Saved', routes: [{ domain: 'example.com', folder: 'D:\\Existing' }] }) } },
        runtime: { sendNativeMessage: () => new Promise(resolve => { window.resolveFolders = resolve; }) }
      };
    });
    await page.goto(pathToFileURL(path.resolve(__dirname, '../firefox-extension/options.html')).href);
    await page.waitForFunction(() => typeof window.resolveFolders === 'function');
    assert.equal(await page.locator('#chatgptFolder').inputValue(), 'D:\\Saved');
    assert.equal(await page.locator('#namesTitle').innerText(), 'Filename rules');
    await page.locator('#chatgptFolder').fill('D:\\Editing');
    await page.evaluate(() => resolveFolders({ ok: true, downloads: 'E:\\Downloads', chatgpt: 'D:\\Legacy' }));
    await page.waitForFunction(() => document.querySelector('#chatgptFolder').placeholder === 'D:\\Legacy');
    assert.equal(await page.locator('#chatgptFolder').inputValue(), 'D:\\Editing');
    assert.equal(await page.locator('#routes .folder').inputValue(), 'D:\\Existing');
    assert.equal(await page.locator('#routes .folder').getAttribute('placeholder'), 'E:\\Downloads');
    await page.locator('#addName').click();
    assert.equal(await page.locator('.name-rule .folder').getAttribute('placeholder'), 'E:\\Downloads');
    await page.evaluate(async () => {
      browser.runtime.sendNativeMessage = async () => ({ ok: true });
      await refreshFolderSuggestions();
    });
    assert.equal(await page.locator('#chatgptFolder').getAttribute('placeholder'), 'D:\\Legacy');
    console.log('Folder suggestions: delayed host, saved values, edits, new rules and malformed response PASS');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });

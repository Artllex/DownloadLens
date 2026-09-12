const { chromium } = require('playwright');
const path = require('path');
const {pathToFileURL} = require('url');
const assert = require('assert');
(async () => {
  const browser = await chromium.launch({headless:true,channel:'msedge'});
  const page = await browser.newPage({viewport:{width:1100,height:1000}});
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  await page.addInitScript(() => {
    window.saved = {routes:[{domain:'example.com',folder:'D:\\Portal'}],filenameRules:[],language:'en'};
    window.browser = {
      i18n:{getUILanguage:()=> 'pl-PL'},
      storage:{local:{get:async defaults=>({...defaults,...window.saved}),set:async values=>Object.assign(window.saved,values)}},
      runtime:{getManifest:()=>({version:'1.2.0'}),sendNativeMessage:async()=>({ok:true,folder:'D:\\Chosen'})}
    };
  });
  await page.goto(pathToFileURL(path.resolve(__dirname,'../firefox-extension/options.html')).href);
  await page.getByRole('button',{name:'+ Add pattern'}).click();
  let rows = page.locator('.name-rule');
  await rows.nth(0).locator('.domain').fill('*.zip');
  await rows.nth(0).locator('.folder').fill('D:\\Archives');
  await page.getByRole('button',{name:'+ Add pattern'}).click();
  await rows.nth(1).locator('.domain').fill('report*');
  await rows.nth(1).locator('.folder').fill('D:\\Games');
  await page.locator('#previewName').fill('report-2026.ZIP');
  assert.match(await page.locator('#previewResult').innerText(),/Archives/);
  await rows.nth(1).locator('.up').click();
  assert.match(await page.locator('#previewResult').innerText(),/Games/);
  await rows.nth(0).locator('.enabled').uncheck();
  assert.match(await page.locator('#previewResult').innerText(),/Archives/);
  await rows.nth(0).locator('.enabled').check();
  await page.locator('#save').click();
  await page.locator('#chatgptFolder').fill('D:\\Chat files');
  await page.locator('#save').click();
  assert.equal(await page.evaluate(()=>saved.chatgptFolder),'D:\\Chat files');
  assert.equal((await page.evaluate(()=>saved.filenameRules))[0].pattern,'report*');
  assert.equal(await page.locator('#chatgptEnabled').isChecked(),true);
  await page.locator('#chatgptEnabled').uncheck();
  await page.locator('#save').click();
  assert.equal(await page.evaluate(()=>saved.chatgptEnabled),false);
  await page.evaluate(()=>restore());
  assert.equal(await page.locator('#chatgptEnabled').isChecked(),false);
  assert.equal((await page.evaluate(()=>saved.routes))[0].folder,'D:\\Portal');
  await page.locator('#language').selectOption('auto');
  assert.equal(await page.locator('#namesTitle').innerText(),'Reguły nazw plików');
  await page.screenshot({path:path.resolve(__dirname,'options-filename-rules.png'),fullPage:true});
  await page.setViewportSize({width:480,height:900});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('Options UI: add, reorder, enable, preview, save, preserve portals, PL/EN, narrow layout PASS');
})().catch(e=>{console.error(e);process.exit(1)});

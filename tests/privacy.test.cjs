const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { chromium } = require('playwright');
const { pathToFileURL } = require('url');
const root = path.resolve(__dirname, '../firefox-extension');
const event = () => ({ addListener(fn) { this.listener = fn; } });
(async () => {
  const values = {}, calls = [], opened = [];
  const api = {
    storage: { onChanged: event(), local: {
      get: async key => key === null ? {...values} : typeof key === 'string' ? {[key]:values[key]} : {...key,...values},
      set: async data => Object.assign(values,data),
      remove: async keys => { for (const key of [].concat(keys)) delete values[key]; }
    } },
    runtime: { onMessage:event(), onInstalled:event(), getURL:p=>p, sendNativeMessage:async(h,m)=>{calls.push(m);return {ok:true};} },
    tabs: { create:async tab=>opened.push(tab), query:async()=>[] },
    downloads: { onCreated:event(), onChanged:event(), search:async()=>[{incognito:true,filename:'C:\\private.txt'}] },
    browserAction: {setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{}}
  };
  const context=vm.createContext({browser:api,URL,console});
  for (const file of ['privacy.js','filename-rules.js','background.js']) vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);
  await api.runtime.onInstalled.listener({reason:'update'});
  assert.equal(opened.length,1); assert.equal(opened[0].active,true);
  await api.downloads.onCreated.listener({id:1});
  await api.downloads.onChanged.listener({id:1,state:{current:'complete'}});
  await api.runtime.onMessage.listener({type:'download-context',title:'secret',hostname:'example.org'},{tab:{}});
  await assert.rejects(vm.runInContext('RouterPrivacy.send("host", {action:"chooseFolder"})',context));
  assert.deepEqual(calls,[]); assert.deepEqual(values,{});
  values.localDataConsent={version:1,accepted:true};
  await vm.runInContext('RouterPrivacy.send("host", {action:"defaultFolders"})',context);
  assert.equal(calls.length,1);
  await api.downloads.onChanged.listener({id:2,state:{current:'complete'}});
  assert.equal(calls.length,1,'Private downloads must not reach native host');
  values.lastDestination='secret'; values['download-1']={}; values.routes=[{domain:'example.org'}];
  values.localDataConsent={version:1,accepted:false};
  await api.storage.onChanged.listener({localDataConsent:{}},'local');
  assert.equal(values.lastDestination,undefined); assert.equal(values['download-1'],undefined); assert.equal(values.routes.length,1);
  await assert.rejects(vm.runInContext('RouterPrivacy.send("host", {action:"reveal"})',context));
  await api.runtime.onInstalled.listener({reason:'update'});
  assert.equal(opened.length,1,'A saved refusal must not be nagged on every update');

  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const preview=await browser.newPage();
    const previewErrors=[];
    preview.on('pageerror',error=>previewErrors.push(String(error)));
    await preview.goto(pathToFileURL(path.join(root,'privacy.html')).href);
    await preview.waitForFunction(()=>document.querySelector('#heading').textContent.length>0);
    assert.ok((await preview.locator('#data').innerText()).length>100);
    assert.equal(await preview.locator('#accept').isDisabled(),true);
    await preview.locator('#language').selectOption('pl');
    assert.match(await preview.locator('#status').innerText(),/Otwórz tę stronę/);
    assert.deepEqual(previewErrors,[]);
    await preview.close();
    const page=await browser.newPage({viewport:{width:1100,height:1100}});
    await page.addInitScript(()=>{
      window.saved={};
      window.browser={i18n:{getUILanguage:()=> 'pl-PL'},storage:{local:{get:async defaults=>({...defaults,...saved}),set:async data=>Object.assign(saved,data)}},management:{uninstallSelf:async()=>{window.uninstallRequested=true;}}};
    });
    await page.goto(pathToFileURL(path.join(root,'privacy.html')).href);
    await page.waitForFunction(()=>document.documentElement.lang==='pl');
    assert.equal(await page.locator('#language').inputValue(),'auto');
    assert.ok(await page.evaluate(()=>document.querySelector('.privacy-actions').getBoundingClientRect().top-document.querySelector('#declineInfo').getBoundingClientRect().bottom>=24));
    assert.ok(await page.evaluate(()=>document.querySelector('#uninstall').getBoundingClientRect().top-document.querySelector('#status').getBoundingClientRect().bottom>=20));
    await page.locator('#accept').click();
    await page.waitForFunction(()=>saved.localDataConsent?.accepted===true);
    await page.locator('#decline').click();
    await page.waitForFunction(()=>saved.localDataConsent?.accepted===false);
    await page.locator('#language').selectOption('en');
    assert.equal(await page.locator('#heading').innerText(),'Local data transfer — your choice');
    assert.equal(await page.evaluate(()=>saved.language),'en');
    await page.locator('#language').selectOption('auto');
    await page.waitForFunction(()=>document.documentElement.lang==='pl');
    assert.equal(await page.evaluate(()=>saved.language),'auto');
    await page.screenshot({path:path.join(__dirname,'privacy-preview.png'),fullPage:true});
    await page.setViewportSize({width:480,height:900});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.locator('#uninstall').click();
    assert.equal(await page.evaluate(()=>uninstallRequested),true);
  } finally {await browser.close();}
  console.log('Privacy: first install/update, deny-by-default, consent, revoke, private downloads, preserved rules, PL/EN and narrow UI PASS');
})().catch(error=>{console.error(error);process.exit(1)});

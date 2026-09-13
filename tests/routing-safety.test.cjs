const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const event=()=>({listeners:[],addListener(fn){this.listeners.push(fn)},async fire(...args){for(const fn of this.listeners) await fn(...args)}});
(async()=>{
  const settings={localDataConsent:{version:1,accepted:true},filenameRules:[{pattern:'*.pdf',folder:'D:\\PDF'}]};
  const native=[], downloads=[], items=new Map();
  let id=0;
  const browser={
    i18n:{getUILanguage:()=> 'en'},
    browserAction:{setBadgeText:async()=>{},setBadgeBackgroundColor:async()=>{}},
    storage:{onChanged:event(),local:{get:async key=>typeof key==='string'?{[key]:settings[key]}:{...key,...settings},set:async v=>Object.assign(settings,v),remove:async keys=>[].concat(keys).forEach(k=>delete settings[k])}},
    runtime:{id:'lens@test',onMessage:event(),onInstalled:event(),sendNativeMessage:async(h,m)=>{native.push(m);return {ok:true,folder:'D:\\Manual',name:'report.pdf',destination:'D:\\PDF\\report.pdf'}}},
    contextMenus:{onClicked:event(),removeAll:async()=>{},create:()=>{}},
    tabs:{query:async()=>[{url:'https://chatgpt.com/c/unrelated',title:'Wrong conversation'}]},
    downloads:{onCreated:event(),onChanged:event(),search:async q=>[items.get(q.id)],download:async options=>{
      downloads.push(options); const item={id:++id,url:options.url,byExtensionId:'lens@test',filename:'C:\\Downloads\\report.pdf'};
      items.set(id,item); await browser.downloads.onCreated.fire(item); return id;
    }}
  };
  const ctx=vm.createContext({browser,URL,console});
  for(const name of ['privacy.js','filename-rules.js','background.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../firefox-extension',name),'utf8'),ctx);
  for(const url of ['data:text/plain,private-payload','blob:https://site.example/id','javascript:alert(1)','file:///C:/secret']) {
    await browser.contextMenus.onClicked.fire({menuItemId:'lens-save-to',linkUrl:url},{});
  }
  assert.equal(downloads.length,0); assert.equal(native.length,0);
  await browser.contextMenus.onClicked.fire({menuItemId:'lens-save-to',linkUrl:'https://site.example/report.pdf'},{});
  assert.equal(downloads.length,1);
  await browser.downloads.onChanged.fire({id,state:{current:'complete'}});
  assert.equal(native.at(-1).action,'move'); assert.equal(native.at(-1).folder,'D:\\Manual','Explicit destination overrides automatic rules');
  for(const url of ['data:text/plain,private-payload','blob:https://site.example/id']) {
    const item={id:++id,url,filename:'C:\\Downloads\\report.pdf'};items.set(id,item);
    await browser.downloads.onCreated.fire(item);
    await browser.downloads.onChanged.fire({id,state:{current:'complete'}});
    assert.equal(native.at(-1).folder,'D:\\PDF'); assert.equal(native.at(-1).sourceUrl,'');
  }
  assert.equal(downloads.length,1,'Opaque downloads must never be fetched again');
  settings.filenameRules=[];
  const before=native.length;
  const opaque={id:++id,url:'data:text/plain,hello',filename:'C:\\Downloads\\report.pdf'}; items.set(id,opaque);
  await browser.downloads.onCreated.fire(opaque); await browser.downloads.onChanged.fire({id,state:{current:'complete'}});
  assert.equal(native.length,before,'Do not infer ChatGPT from unrelated active tab');
  settings.localDataConsent.accepted=false;
  await browser.contextMenus.onClicked.fire({menuItemId:'lens-save-to',linkUrl:'https://site.example/report.pdf'},{});
  assert.equal(downloads.length,1);
  assert.ok(!JSON.stringify(native).includes('private-payload'));
  console.log('Routing safety: manual override, consent, blocked schemes, completed blob/data routing and no URL payload leakage PASS');
})().catch(error=>{console.error(error);process.exitCode=1});

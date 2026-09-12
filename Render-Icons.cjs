// Optional asset build: requires Playwright and installed Microsoft Edge.
const {chromium}=require('playwright');
const fs=require('fs'),path=require('path');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const page=await browser.newPage({deviceScaleFactor:1});
    const icons=path.join(__dirname,'firefox-extension','icons');
    const svg=fs.readFileSync(path.join(icons,'download-router.svg'),'utf8');
    for(const size of [16,32,48,96,128]) {
      await page.setViewportSize({width:size,height:size});
      await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
      await page.screenshot({path:path.join(icons,`icon-${size}.png`),omitBackground:true});
    }
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});

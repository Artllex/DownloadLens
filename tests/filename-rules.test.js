const fs = require('fs'), vm = require('vm'), assert = require('assert');
const scope = {};
vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../firefox-extension/filename-rules.js'),'utf8'), scope);
for (const [pattern, name, expected] of [
  ['*.zip','GAME.ZIP',true], ['Super Mario*','Super Mario 64.zip',true],
  ['*invoice*.pdf','2026-invoice-01.PDF',true], ['a?.txt','ab.txt',true],
  ['a?.txt','abc.txt',false], ['file(1).zip','file(1).zip',true],
  ['file(1).zip','file1.zip',false], ['a+b[2].zip','a+b[2].zip',true],
  ['*.zip','a.zip.exe',false], ['', 'a',false], ['C:\\*','C:\\a',false],
  ['*a*b','aaacb',true], ['*a*b','aaac',false]
]) assert.equal(scope.filenameMatches(pattern,name),expected,`${pattern}: ${name}`);
assert.equal(scope.matchingFilenameRule('x.zip',[
  {pattern:'*',folder:'disabled',enabled:false},{pattern:'*.zip',folder:'first'},{pattern:'*',folder:'second'}
]).folder,'first');
console.log('Filename glob and rule precedence: PASS');

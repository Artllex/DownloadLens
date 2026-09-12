"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function event() {
  return {
    listener: null,
    addListener(listener) { this.listener = listener; }
  };
}

async function run() {
  const created = event();
  const changed = event();
  const runtimeMessage = event();
  const values = {};
  const nativeMessages = [];
  let searchedDownloadId = 41;
  let tabQueryDelay = null;
  let currentTab = { url: "https://chatgpt.com/c/123", title: "Quarterly review — ChatGPT" };

  const browser = {
    browserAction: {
      async setBadgeText() {},
      async setBadgeBackgroundColor() {}
    },
    downloads: {
      onCreated: created,
      onChanged: changed,
      async search(query) {
        assert.strictEqual(query.id, searchedDownloadId);
        return [{ id: query.id, filename: "C:\\Users\\Test\\Downloads\\analysis.xlsx" }];
      }
    },
    tabs: {
      async query(query) {
        assert.strictEqual(query.active, true);
        assert.strictEqual(query.currentWindow, true);
        if (tabQueryDelay) await tabQueryDelay;
        return [currentTab];
      }
    },
    storage: {
      local: {
        async set(update) { Object.assign(values, update); },
        async get(key) {
          if (typeof key === "object") return Object.assign({}, key, values);
          return { [key]: values[key] };
        },
        async remove(key) { delete values[key]; }
      }
    },
    runtime: {
      onMessage: runtimeMessage,
      async sendNativeMessage(host, message) { nativeMessages.push({ host, message }); return { ok: true, name: "Original(1).xlsx" }; },
      async openOptionsPage() {}
    }
  };

  const source = fs.readFileSync(path.join(__dirname, "..", "firefox-extension", "background.js"), "utf8");
  const patterns = fs.readFileSync(path.join(__dirname, "..", "firefox-extension", "filename-rules.js"), "utf8");
  vm.runInNewContext(patterns + "\n" + source, { browser, URL, console });

  assert.ok(created.listener, "downloads.onCreated listener was not registered");
  assert.ok(changed.listener, "downloads.onChanged listener was not registered");
  assert.ok(runtimeMessage.listener, "runtime message listener was not registered");

  values.lastDestination = "C:\\CODE\\temp\\Quarterly review\\analysis.xlsx";
  const revealResponse = await runtimeMessage.listener({ type: "reveal-latest" }, {});
  assert.strictEqual(revealResponse.ok, true);
  assert.strictEqual(nativeMessages[0].message.action, "reveal");
  assert.strictEqual(nativeMessages[0].message.path, values.lastDestination);

  created.listener({ id: 41 });
  await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(values["download-41"].mode, "chatgpt");
  assert.strictEqual(values["download-41"].conversation, "Quarterly review");

  await changed.listener({ id: 41, state: { current: "complete" } });
  assert.strictEqual(nativeMessages.length, 2);
  assert.strictEqual(nativeMessages[1].host, "com.artllex.download_router");
  assert.strictEqual(nativeMessages[1].message.action, "move");
  assert.strictEqual(nativeMessages[1].message.source, "C:\\Users\\Test\\Downloads\\analysis.xlsx");
  assert.strictEqual(nativeMessages[1].message.mode, "chatgpt");
  assert.strictEqual(nativeMessages[1].message.conversation, "Quarterly review");
  assert.strictEqual(values["download-41"], undefined);

  currentTab = { url: "https://example.com/", title: "Unrelated page" };
  created.listener({ id: 42 });
  await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(values["download-42"], undefined);

  values.routes = [{ domain: "example.org", folder: "D:\\Portal files" }];
  currentTab = { url: "https://files.example.org/report", title: "Example report" };
  created.listener({ id: 43 });
  await new Promise(resolve => setImmediate(resolve));
  assert.strictEqual(values["download-43"].mode, "folder");
  assert.strictEqual(values["download-43"].folder, "D:\\Portal files");
  assert.strictEqual(values["download-43"].portal, "example.org");
  searchedDownloadId = 43;
  await changed.listener({ id: 43, state: { current: "complete" } });
  assert.strictEqual(nativeMessages[2].message.mode, "folder");
  assert.strictEqual(nativeMessages[2].message.folder, "D:\\Portal files");

  currentTab = { url: "https://chatgpt.com/c/fast", title: "Fast download — ChatGPT" };
  searchedDownloadId = 44;
  let releaseQuery;
  tabQueryDelay = new Promise(resolve => { releaseQuery = resolve; });
  created.listener({ id: 44 });
  const fastCompletion = changed.listener({ id: 44, state: { current: "complete" } });
  releaseQuery();
  await fastCompletion;
  tabQueryDelay = null;
  assert.strictEqual(nativeMessages[3].message.mode, "chatgpt");
  assert.strictEqual(nativeMessages[3].message.conversation, "Fast download");

  currentTab = { url: "https://example.com/", title: "Different active tab" };
  runtimeMessage.listener({
    type: "download-context",
    hostname: "chatgpt.com",
    title: "Captured before download — ChatGPT"
  }, { tab: { id: 7 } });
  searchedDownloadId = 45;
  created.listener({ id: 45 });
  await changed.listener({ id: 45, state: { current: "complete" } });
  assert.strictEqual(nativeMessages[4].message.mode, "chatgpt");
  assert.strictEqual(nativeMessages[4].message.conversation, "Captured before download");

  await changed.listener({ id: 99, state: { current: "interrupted" } });
  assert.strictEqual(nativeMessages.length, 5);

  values.filenameRules = [
    {pattern: "*", folder: "D:\\Disabled", enabled: false},
    {pattern: "Original(1).*", folder: "D:\\Names"},
    {pattern: "*.xlsx", folder: "D:\\Later"}
  ];
  // Name rule works with no portal, then overrides ChatGPT and a website.
  for (const url of ["https://unknown.example/", "https://chatgpt.com/c/name", "https://example.org/"]) {
    currentTab = {url, title: "Test"};
    searchedDownloadId++;
    created.listener({id: searchedDownloadId});
    await changed.listener({id: searchedDownloadId, state: {current: "complete"}});
    assert.strictEqual(nativeMessages.at(-1).message.folder, "D:\\Names");
  }
  values.filenameRules = [{pattern: "*.pdf", folder: "D:\\PDF"}];
  searchedDownloadId++;
  created.listener({id: searchedDownloadId});
  await changed.listener({id: searchedDownloadId, state: {current: "complete"}});
  assert.strictEqual(nativeMessages.at(-1).message.folder, "D:\\Portal files");
  currentTab = {url: "https://unknown.example/", title: "Unknown"};
  searchedDownloadId++;
  created.listener({id: searchedDownloadId});
  const before = nativeMessages.length;
  await changed.listener({id: searchedDownloadId, state: {current: "complete"}});
  assert.strictEqual(nativeMessages.length, before + 1); // Name query only, no move.

  console.log("Firefox extension logic: PASS");
  values.filenameRules = [];
  values.chatgptEnabled = false;
  currentTab = {url: 'https://chatgpt.com/c/off', title: 'Off'};
  searchedDownloadId++;
  created.listener({id: searchedDownloadId});
  const offCount = nativeMessages.length;
  await changed.listener({id: searchedDownloadId,state:{current:'complete'}});
  assert.equal(nativeMessages.length,offCount);
  values.filenameRules = [{pattern:'*.xlsx',folder:'D:\\Name override'}];
  searchedDownloadId++;
  created.listener({id: searchedDownloadId});
  await changed.listener({id: searchedDownloadId,state:{current:'complete'}});
  assert.equal(nativeMessages.at(-1).message.folder,'D:\\Name override');
  values.filenameRules = []; values.chatgptEnabled = true;
  searchedDownloadId++;
  created.listener({id: searchedDownloadId});
  await changed.listener({id: searchedDownloadId,state:{current:'complete'}});
  assert.equal(nativeMessages.at(-1).message.mode,'chatgpt');
  console.log('ChatGPT toggle and independent filename rules: PASS');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

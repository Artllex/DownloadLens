"use strict";

const HOST = "com.artllex.download_router";
const KEY_PREFIX = "download-";
const pendingRoutes = new Map();
let recentContext = null;
const manualIntents = new Map();

function recordActivity(stage, details = "") {
  browser.storage.local.set({ lastActivity: { stage, details, at: new Date().toISOString() } }).catch(() => {});
  const badges = {
    context: ["C", "#64748b"],
    matched: ["→", "#2563eb"],
    moved: ["✓", "#10a37f"],
    error: ["!", "#dc2626"]
  };
  if (badges[stage]) {
    browser.browserAction.setBadgeText({ text: badges[stage][0] });
    browser.browserAction.setBadgeBackgroundColor({ color: badges[stage][1] });
  }
}

function conversationName(title) {
  let value = (title || "ChatGPT conversation")
    .replace(/\s*[|\-–—]\s*ChatGPT\s*$/i, "")
    .trim();
  return value || "ChatGPT conversation";
}

function normalizeDomain(value) {
  let input = (value || "").trim().toLowerCase();
  if (!input) return "";
  try {
    const url = new URL(input.includes("://") ? input : "https://" + input);
    return url.hostname.replace(/^www\./, "");
  } catch (_) {
    return "";
  }
}

function matchingRoute(hostname, routes) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return (routes || []).find(route => {
    const domain = normalizeDomain(route.domain);
    return domain && route.folder && (host === domain || host.endsWith("." + domain));
  });
}

browser.runtime.onMessage.addListener(async (message, sender) => {
  if (!await RouterPrivacy.allowed() || sender.tab?.incognito) return { ok: false, error: "Review Privacy / Prywatność in DownloadLens Settings." };
  if (message && message.type === "reveal-latest") {
    return browser.storage.local.get({ lastDestination: "", lastActivity: null }).then(async values => {
      const fallback = values.lastActivity && values.lastActivity.stage === "moved" ? values.lastActivity.details : "";
      const destination = values.lastDestination || fallback;
      if (!destination) return { ok: false, error: "No routed download is available." };
      const response = await RouterPrivacy.send(HOST, { action: "reveal", path: destination });
      if (!response || !response.ok) return { ok: false, error: response && response.error ? response.error : "The native host rejected the request." };
      return { ok: true, path: destination };
    }).catch(error => ({ ok: false, error: error && error.message ? error.message : String(error) }));
  }
  if (!message || message.type !== "download-context" || !sender.tab) return;
  recentContext = {
    hostname: (() => { try { return new URL(sender.tab.url || "").hostname; } catch { return ""; } })(),
    title: message.title || "",
    capturedAt: Date.now()
  };
});

async function routeFor(hostname, title) {
  const context = { hostname, conversation: conversationName(title) };
  const settings = await browser.storage.local.get({ routes: [], chatgptEnabled: true });
  if (normalizeDomain(hostname) === "chatgpt.com" && settings.chatgptEnabled) {
    return { mode: "chatgpt", conversation: conversationName(title), context };
  }
  const configured = matchingRoute(hostname, settings.routes);
  if (!configured) return { context };
  return { mode: "folder", folder: configured.folder, portal: normalizeDomain(configured.domain), context };
}

async function resolveRoute(download) {
  try {
    const referrer = LensRules.httpURL(download.referrer);
    const source = LensRules.httpURL(download.url);
    const blobOrigin = String(download.url || "").startsWith("blob:") ? LensRules.httpURL(download.url.slice(5)) : "";
    if (recentContext && Date.now() - recentContext.capturedAt < 15000 &&
        (!download.url || [referrer, source, blobOrigin].some(url => url && new URL(url).hostname === recentContext.hostname))) {
      const capturedRoute = await routeFor(recentContext.hostname, recentContext.title);
      recentContext = null;
      if (capturedRoute) return capturedRoute;
    }
    let sourceHostname = "";
    for (const candidate of [download.referrer, download.url]) {
      try {
        const hostname = new URL(candidate || "").hostname;
        if (hostname) { sourceHostname = hostname; break; }
      } catch (_) {}
    }
    const normalizedSource = normalizeDomain(sourceHostname);
    if (normalizedSource === "chatgpt.com" || normalizedSource === "chat.openai.com" || normalizedSource === "files.oaiusercontent.com") {
      const chatTabs = await browser.tabs.query({ url: ["*://chatgpt.com/*", "*://chat.openai.com/*"] });
      const publicTabs = chatTabs.filter(tab => !tab.incognito);
      const chatTab = publicTabs.find(tab => tab.active) || publicTabs[0];
      return await routeFor("chatgpt.com", chatTab && chatTab.title);
    }
    if (referrer || source) return await routeFor(new URL(referrer || source).hostname, "");
    // Opaque URLs must not inherit an unrelated active tab's website rule.
    if (download.url) return null;
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab || tab.incognito) return null;
    const url = new URL(tab.url || "");
    return await routeFor(url.hostname, tab.title);
  } catch (_) {
    // Downloads without a readable, configured source tab are left untouched.
    return null;
  }
}

browser.downloads.onCreated.addListener(async download => {
  if (download.incognito || !LensRules.eligibleURL(download.url) || !await RouterPrivacy.allowed()) return;
  if (download.byExtensionId && download.byExtensionId === browser.runtime.id) {
    const intent = manualIntents.get(download.url);
    if (intent) {
      intent.assignedId = download.id;
      pendingRoutes.set(download.id, Promise.resolve(intent));
      await browser.storage.local.set({ [KEY_PREFIX + download.id]: intent });
    }
    return;
  }
  const routePromise = resolveRoute(download);
  pendingRoutes.set(download.id, routePromise);
  routePromise.then(async route => {
    if (!await RouterPrivacy.allowed()) return;
    if (route) {
      if (route.mode) recordActivity("matched", route.mode === "chatgpt" ? route.conversation : route.portal);
      await browser.storage.local.set({ [KEY_PREFIX + download.id]: route });
    }
  }).catch(error => console.error("DownloadLens:", error));
});

browser.downloads.onChanged.addListener(async delta => {
  if (delta.state?.current === "interrupted") {
    pendingRoutes.delete(delta.id);
    await browser.storage.local.remove(KEY_PREFIX + delta.id);
    return;
  }
  if (!delta.state || delta.state.current !== "complete") return;
  if (!await RouterPrivacy.allowed()) return;
  const key = KEY_PREFIX + delta.id;
  try {
    let route = pendingRoutes.has(delta.id) ? await pendingRoutes.get(delta.id) : null;
    if (!route) {
      const saved = await browser.storage.local.get(key);
      route = saved[key];
    }
    const matches = await browser.downloads.search({ id: delta.id });
    if (matches[0]?.incognito || !LensRules.eligibleURL(matches[0]?.url)) return;
    if (matches.length && matches[0].filename) {
      const settings = await browser.storage.local.get(LensRules.defaults);
      let filename = matches[0].filename.split(/[\\/]/).pop();
      if (!route?.manual && settings.filenameRules.some(rule => rule.enabled !== false)) {
        const original = await RouterPrivacy.send(HOST, {
          action: "originalName", source: matches[0].filename,
          startTime: Date.parse(matches[0].startTime), sourceUrl: LensRules.httpURL(matches[0].url),
          isPrivate: matches[0].incognito === true
        });
        if (!original || !original.ok || !original.name) throw new Error("Update the DownloadLens native host to use filename rules.");
        filename = original.name;
      }
      route = route?.manual ? { mode: "folder", folder: route.folder } : LensRules.match(settings, filename, route?.context || {});
      if (!route) return;
      const response = await RouterPrivacy.send(HOST, {
        action: "move",
        startTime: Date.parse(matches[0].startTime),
        sourceUrl: LensRules.httpURL(matches[0].url),
        isPrivate: matches[0].incognito === true,
        source: matches[0].filename,
        ...route
      });
      if (!response || !response.ok) throw new Error(response && response.error ? response.error : "The native host rejected the download.");
      if (!await RouterPrivacy.allowed()) return;
      await browser.storage.local.set({ lastDestination: response.destination || matches[0].filename });
      recordActivity("moved", response.destination || matches[0].filename);
    }
  } catch (error) {
    if (!await RouterPrivacy.allowed()) return;
    recordActivity("error", error && error.message ? error.message : String(error));
    console.error("DownloadLens:", error);
  } finally {
    pendingRoutes.delete(delta.id);
    await browser.storage.local.remove(key);
  }
});

browser.runtime.onInstalled.addListener(async () => {
  const values = await browser.storage.local.get({ localDataConsent: null });
  if (values.localDataConsent?.version !== RouterPrivacy.version) {
    await browser.tabs.create({ url: browser.runtime.getURL("privacy.html"), active: true });
  }
});

browser.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "local" || !changes.localDataConsent) return;
  if (!await RouterPrivacy.allowed()) {
    recentContext = null;
    pendingRoutes.clear();
    const values = await browser.storage.local.get(null);
    await browser.storage.local.remove(Object.keys(values).filter(key => key.startsWith(KEY_PREFIX) || ["lastDestination", "lastActivity"].includes(key)));
    await browser.browserAction.setBadgeText({ text: "" });
  }
});

// Manual download is an explicit user action, never automatic cancel/re-download.
if (browser.contextMenus) {
  const label = async () => {
    const { language } = await browser.storage.local.get({ language: "auto" });
    return (language === "auto" ? browser.i18n.getUILanguage() : language).startsWith("pl");
  };
  async function refreshMenu() {
    await browser.contextMenus.removeAll();
    browser.contextMenus.create({ id: "lens-save-to", title: await label() ? "DownloadLens — Zapisz do…" : "DownloadLens — Save to…", contexts: ["link", "image", "audio", "video"] });
  }
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== "lens-save-to" || tab?.incognito) return;
    let url = "";
    try {
      if (!await RouterPrivacy.allowed()) throw new Error(await label() ? "Sprawdź zgodę w sekcji Prywatność." : "Review consent in Privacy.");
      url = LensRules.httpURL(info.srcUrl || info.linkUrl);
      if (!url) throw new Error(await label() ? "Ten adres wymaga zwykłego przycisku pobierania na stronie. Nie pobrano pliku ponownie." : "Use the website's regular download button for this URL. No re-download was attempted.");
      if (tab?.cookieStoreId && tab.cookieStoreId !== "firefox-default") throw new Error(await label() ? "W karcie kontenera użyj zwykłego pobierania na stronie." : "Use the website's regular download in a container tab.");
      if (manualIntents.has(url)) return;
      const result = await RouterPrivacy.send(HOST, { action: "chooseFolder", initialFolder: "" });
      if (!result?.ok) throw new Error(result?.error || "DownloadLens Support unavailable");
      if (!result.folder) return;
      if (!LensRules.validFolder(result.folder)) throw new Error("Invalid destination folder");
      if (!await RouterPrivacy.allowed()) return;
      manualIntents.set(url, { manual: true, mode: "folder", folder: result.folder });
      const id = await browser.downloads.download({ url, saveAs: false });
      const intent = manualIntents.get(url);
      if (intent && intent.assignedId !== id && await RouterPrivacy.allowed()) {
        pendingRoutes.set(id, Promise.resolve(intent));
        await browser.storage.local.set({ [KEY_PREFIX + id]: intent });
      }
    } catch (error) { recordActivity("error", error.message); }
    finally { manualIntents.delete(url); }
  });
  browser.storage.onChanged.addListener((changes, area) => { if (area === "local" && changes.language) void refreshMenu(); });
  void refreshMenu();
}

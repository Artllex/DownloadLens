"use strict";

const HOST = "com.artllex.download_router";
const KEY_PREFIX = "download-";
const pendingRoutes = new Map();
let recentContext = null;

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

browser.runtime.onMessage.addListener((message, sender) => {
  if (message && message.type === "reveal-latest") {
    return browser.storage.local.get({ lastDestination: "", lastActivity: null }).then(async values => {
      const fallback = values.lastActivity && values.lastActivity.stage === "moved" ? values.lastActivity.details : "";
      const destination = values.lastDestination || fallback;
      if (!destination) return { ok: false, error: "No routed download is available." };
      const response = await browser.runtime.sendNativeMessage(HOST, { action: "reveal", path: destination });
      if (!response || !response.ok) return { ok: false, error: response && response.error ? response.error : "The native host rejected the request." };
      return { ok: true, path: destination };
    }).catch(error => ({ ok: false, error: error && error.message ? error.message : String(error) }));
  }
  if (!message || message.type !== "download-context" || !sender.tab) return;
  recentContext = {
    hostname: message.hostname || "",
    title: message.title || "",
    capturedAt: Date.now()
  };
  recordActivity("context", recentContext.hostname + " | " + recentContext.title);
});

async function routeFor(hostname, title) {
  const settings = await browser.storage.local.get({ routes: [], chatgptEnabled: true });
  if (normalizeDomain(hostname) === "chatgpt.com" && settings.chatgptEnabled) {
    return { mode: "chatgpt", conversation: conversationName(title) };
  }
  const configured = matchingRoute(hostname, settings.routes);
  if (!configured) return null;
  return { mode: "folder", folder: configured.folder, portal: normalizeDomain(configured.domain) };
}

async function resolveRoute(download) {
  try {
    if (recentContext && Date.now() - recentContext.capturedAt < 15000) {
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
      const chatTab = chatTabs.find(tab => tab.active) || chatTabs[0];
      return await routeFor("chatgpt.com", chatTab && chatTab.title);
    }
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab) return null;
    const url = new URL(tab.url || "");
    return await routeFor(url.hostname, tab.title);
  } catch (_) {
    // Downloads without a readable, configured source tab are left untouched.
    return null;
  }
}

browser.downloads.onCreated.addListener(download => {
  const routePromise = resolveRoute(download);
  pendingRoutes.set(download.id, routePromise);
  routePromise.then(async route => {
    if (route) {
      recordActivity("matched", route.mode === "chatgpt" ? route.conversation : route.portal);
      await browser.storage.local.set({ [KEY_PREFIX + download.id]: route });
    } else recordActivity("unmatched", (download.referrer || download.url || "unknown source"));
  }).catch(error => console.error("Download Router:", error));
});

browser.downloads.onChanged.addListener(async delta => {
  if (!delta.state || delta.state.current !== "complete") return;
  const key = KEY_PREFIX + delta.id;
  try {
    let route = pendingRoutes.has(delta.id) ? await pendingRoutes.get(delta.id) : null;
    if (!route) {
      const saved = await browser.storage.local.get(key);
      route = saved[key];
    }
    const matches = await browser.downloads.search({ id: delta.id });
    if (matches.length && matches[0].filename) {
      const settings = await browser.storage.local.get({ filenameRules: [], chatgptEnabled: true, chatgptFolder: "" });
      if (route && route.mode === "chatgpt" && !settings.chatgptEnabled) route = null;
      if (route && route.mode === "chatgpt" && settings.chatgptFolder) {
        // Keep compatibility with existing native hosts: folder mode plus the
        // same sanitized conversation name used by the native ChatGPT route.
        let name = route.conversation.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim().replace(/\.+$/, "").slice(0,100).trim();
        if (!name) name = "ChatGPT conversation";
        if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(name)) name = "_" + name;
        route = { mode:"folder", folder:settings.chatgptFolder.replace(/[\\/]+$/, "") + "\\" + name };
      }
      if (settings.filenameRules.some(rule => rule.enabled !== false)) {
        const original = await browser.runtime.sendNativeMessage(HOST, {
          action: "originalName", source: matches[0].filename,
          startTime: Date.parse(matches[0].startTime), sourceUrl: matches[0].url,
          isPrivate: matches[0].incognito === true
        });
        if (!original || !original.ok || !original.name) throw new Error("Update the Download Router native host to use filename rules.");
        const named = matchingFilenameRule(original.name, settings.filenameRules);
        if (named) route = { mode: "folder", folder: named.folder, pattern: named.pattern };
      }
      if (!route) return;
      const response = await browser.runtime.sendNativeMessage(HOST, {
        action: "move",
        startTime: Date.parse(matches[0].startTime),
        sourceUrl: matches[0].url,
        isPrivate: matches[0].incognito === true,
        source: matches[0].filename,
        ...route
      });
      if (!response || !response.ok) throw new Error(response && response.error ? response.error : "The native host rejected the download.");
      await browser.storage.local.set({ lastDestination: response.destination || matches[0].filename });
      recordActivity("moved", response.destination || matches[0].filename);
    }
  } catch (error) {
    recordActivity("error", error && error.message ? error.message : String(error));
    console.error("Download Router:", error);
  } finally {
    pendingRoutes.delete(delta.id);
    await browser.storage.local.remove(key);
  }
});

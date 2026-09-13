"use strict";
// Simple whole-filename glob, not a regular expression. Linear-space matching.
function filenameMatches(pattern, filename) {
  pattern = String(pattern || "").toLowerCase();
  filename = String(filename || "").toLowerCase();
  if (!pattern || pattern.length > 255 || /[\\/:]/.test(pattern)) return false;
  let p = 0, n = 0, star = -1, checkpoint = 0;
  while (n < filename.length) {
    if (pattern[p] === "?" || pattern[p] === filename[n]) { p++; n++; }
    else if (pattern[p] === "*") { star = p++; checkpoint = n; }
    else if (star !== -1) { p = star + 1; n = ++checkpoint; }
    else return false;
  }
  while (pattern[p] === "*") p++;
  return p === pattern.length;
}
function matchingFilenameRule(filename, rules) {
  return (rules || []).find(rule => rule.enabled !== false && rule.folder && filenameMatches(rule.pattern, filename));
}

// Pure shared configuration/routing helpers. No filesystem or network access.
const LensRules = (() => {
  const defaults = { routes: [], filenameRules: [], chatgptEnabled: true, chatgptFolder: "", language: "auto", ruleOrder: [] };
  function normalize(value = {}) {
    const s = { ...defaults, ...value };
    s.filenameRules = s.filenameRules.map((r, i) => ({ ...r, id: r.id || `name-${i}` }));
    s.routes = s.routes.map((r, i) => ({ ...r, id: r.id || `site-${i}` }));
    return s;
  }
  function entries(value) {
    const s = normalize(value);
    const all = [...s.filenameRules.map(r => ({ ...r, kind: "name" })),
      { id: "chatgpt", kind: "chatgpt", enabled: s.chatgptEnabled },
      ...s.routes.map(r => ({ ...r, kind: "site" }))];
    const ordered = s.ruleOrder.map(id => all.find(r => r.id === id)).filter(Boolean);
    return [...ordered, ...all.filter(r => !s.ruleOrder.includes(r.id))];
  }
  function domainMatches(host, domain) {
    host = String(host || "").toLowerCase().replace(/^www\./, "");
    domain = String(domain || "").toLowerCase().replace(/^www\./, "");
    return !!domain && (host === domain || host.endsWith("." + domain));
  }
  function httpURL(value) {
    try { const u = new URL(value); return /^https?:$/.test(u.protocol) && !u.username && !u.password ? u.href : ""; } catch { return ""; }
  }
  function eligibleURL(value) {
    if (!value) return true; // Older download records may not include a URL.
    try { return /^(https?:|blob:|data:)$/.test(new URL(value).protocol); } catch { return false; }
  }
  function segment(value) {
    let s = String(value).replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").trim().replace(/[. ]+$/, "").slice(0, 100);
    if (!s || s === "." || s === "..") s = "unknown";
    if (/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(s)) s = "_" + s;
    return s;
  }
  function validFolder(value, optional = false) {
    if (!value) return optional;
    const expanded = value.replace(/\{(domain|year|month)\}/g, "sample");
    return /^[a-z]:\\/i.test(expanded) && !/[{}<>"|?*\x00-\x1f]/.test(expanded) && !expanded.slice(2).includes(":") &&
      !expanded.split(/[\\/]/).some(p => p === "." || p === "..");
  }
  function expand(folder, context = {}) {
    const date = context.date || new Date();
    const vars = { domain: segment(context.hostname || "unknown"), year: String(date.getFullYear()), month: String(date.getMonth() + 1).padStart(2, "0") };
    if (!validFolder(folder)) throw new Error("Invalid destination folder");
    return folder.replace(/\{(domain|year|month)\}/g, (_, key) => vars[key]);
  }
  function match(value, filename, context = {}) {
    const s = normalize(value);
    for (const r of entries(s)) {
      if (r.enabled === false) continue;
      if (r.kind === "chatgpt") {
        if (!domainMatches(context.hostname, "chatgpt.com")) continue;
        return s.chatgptFolder ? { mode: "folder", folder: expand(s.chatgptFolder, context).replace(/[\\/]+$/, "") + "\\" + segment(context.conversation || "ChatGPT conversation") } :
          { mode: "chatgpt", conversation: context.conversation || "ChatGPT conversation" };
      }
      if (r.kind === "name" && (!filenameMatches(r.pattern, filename) || (r.domain && !domainMatches(context.hostname, r.domain)))) continue;
      if (r.kind === "site" && !domainMatches(context.hostname, r.domain)) continue;
      return { mode: "folder", folder: expand(r.folder, context) };
    }
    return null;
  }
  function validate(value) {
    if (!value || typeof value !== "object" || !Array.isArray(value.routes) || !Array.isArray(value.filenameRules)) throw new Error("Invalid configuration");
    if (value.routes.length + value.filenameRules.length > 500) throw new Error("Too many rules");
    const s = normalize(value);
    if (!["auto", "en", "pl"].includes(s.language) || typeof s.chatgptEnabled !== "boolean" || typeof s.chatgptFolder !== "string" || !validFolder(s.chatgptFolder, true)) throw new Error("Invalid settings");
    const ids = new Set(["chatgpt"]);
    for (const r of [...s.filenameRules, ...s.routes]) {
      if (typeof r.id !== "string" || r.id.length > 100 || ids.has(r.id) || typeof r.folder !== "string" || !validFolder(r.folder)) throw new Error("Invalid rule");
      ids.add(r.id);
      if (r.enabled !== undefined && typeof r.enabled !== "boolean") throw new Error("Invalid enabled flag");
      if (r.domain !== undefined && (typeof r.domain !== "string" || !/^(?:[a-z0-9-]+\.)*[a-z0-9-]+$/i.test(r.domain) && r.domain !== "")) throw new Error("Invalid domain");
    }
    for (const r of s.filenameRules) if (typeof r.pattern !== "string" || !r.pattern || r.pattern.length > 255 || /[\\/:]/.test(r.pattern)) throw new Error("Invalid pattern");
    for (const r of s.routes) if (!r.domain) throw new Error("Missing domain");
    if (!Array.isArray(s.ruleOrder) || new Set(s.ruleOrder).size !== s.ruleOrder.length || s.ruleOrder.some(id => !ids.has(id))) throw new Error("Invalid priority order");
    // Allowlist: never restore consent, activity, or pending/native commands.
    const clean = r => Object.fromEntries(["id", "domain", "pattern", "folder", "enabled"].filter(k => r[k] !== undefined).map(k => [k, r[k]]));
    return { routes: s.routes.map(clean), filenameRules: s.filenameRules.map(clean), chatgptEnabled: s.chatgptEnabled, chatgptFolder: s.chatgptFolder, language: s.language, ruleOrder: s.ruleOrder };
  }
  return { defaults, normalize, entries, domainMatches, httpURL, eligibleURL, segment, validFolder, expand, match, validate };
})();

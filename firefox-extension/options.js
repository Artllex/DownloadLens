"use strict";

const HOST = "com.artllex.download_router";
const api = typeof browser !== "undefined" ? browser : {
  i18n: { getUILanguage: () => navigator.language },
  storage: { local: { get: async defaults => defaults, set: async () => {} } },
  runtime: { sendNativeMessage: async () => { throw new Error("Native host unavailable"); } }
};
const translations = {
pl: {
  supportTitle: "Komponent wsparcia — Windows", supportDescription: "Jest wymagany do przekierowywania plików do wybranych folderów. Dodaje też obsługę ZIP i aktualizację lokalizacji w panelu pobierania Firefoxa.", supportDownload: "Pobierz instalator Windows", supportNote: "Instalator pobierzesz z GitHuba. Jeśli komponent już działa, nie musisz go ponownie instalować. Szczegóły integracji znajdziesz w sekcji Prywatność.",
  advancedTitle: "Zaawansowane", priorityTitle: "Kolejność reguł", priorityHint: "Pierwsza pasująca reguła wygrywa. Zmiana kolejności jest opcjonalna.",
  templateHint: "W folderach możesz używać: {domain}, {year}, {month}.", resetPriority: "Przywróć standardową kolejność",
  backupTitle: "Kopia konfiguracji", backupDescription: "Zapisz reguły i preferencje do pliku JSON albo wczytaj je na innym komputerze.", exportSettings: "Zapisz do pliku…", importSettings: "Importuj z pliku…", confirmImport: "Wczytaj do formularza", cancelImport: "Anuluj",
  importReady: "Reguły do wczytania: ", importWarning: ". Zastąpią formularz. Sprawdź foldery i kliknij Zapisz ustawienia. Zgoda i historia nie są importowane.",
  backupError: "Nieprawidłowy plik ustawień lub folder. Nic nie zmieniono.", imported: "Wczytano do formularza. Sprawdź ustawienia przed zapisaniem.",
  conditionLabel: "Tylko z tej strony (opcjonalnie)",
  aboutTitle: "O rozszerzeniu",
  privacyLink: "Prywatność",
  chatgptFolderLabel: "Folder plików ChatGPT", chatgptFolderHint: "Puste pole: zapisany folder lub systemowe Pobrane. Rozmowy otrzymują osobne podfoldery.",
  chatgptFolderInvalid: "Wybierz folder ChatGPT lub pozostaw pole puste.",
  namesTitle: "Reguły nazw plików",
  chatgptToggleLabel: "Reguła ChatGPT",
  addName: "+ Dodaj wzorzec", namesEmpty: "Nie dodano reguł nazw.",
  pattern: "Wzorzec nazwy", enabled: "Włączona", up: "Przenieś wyżej", down: "Przenieś niżej",
  invalidName: "Podaj wzorzec (do 255 znaków, bez ścieżki) i pełną ścieżkę folderu dla każdej reguły nazwy.",
  subtitle: "Zapisuj pliki z wybranych portali dokładnie tam, gdzie chcesz.",
  languageLabel: "Język",
  languageAuto: "Automatycznie (Firefox)",
  chatgptTitle: "Wbudowana reguła rozmów",
  chatgptDescription: "Zapisuj pliki w folderach nazwanych jak rozmowy.",
  routesTitle: "Pozostałe portale",
  routesDescription: "Dodaj domenę i folder docelowy. Reguła obejmie również jej subdomeny.",
  diagnosticsTitle: "Stan rozszerzenia",
  versionLabel: "Wersja",
  activityLabel: "Ostatnia aktywność",
  activityNone: "brak",
  activity_context: "wykryto kliknięcie",
  activity_matched: "dopasowano regułę",
  activity_unmatched: "brak pasującej reguły",
  activity_moved: "plik przeniesiony",
  activity_error: "błąd",
  addRoute: "+ Dodaj portal",
  emptyState: "Nie dodano jeszcze żadnych portali.",
  domain: "Portal / domena",
  folder: "Folder docelowy",
  browse: "Wybierz…",
  remove: "Usuń regułę",
  save: "Zapisz ustawienia",
  saved: "Ustawienia zapisane.",
  invalid: "Uzupełnij poprawną domenę i pełną ścieżkę folderu dla każdej pozycji.",
  hostError: "Sprawdź zgodę w sekcji Prywatność i zainstaluj DownloadLens Support."
},
en: {
  supportTitle: "Support component — Windows", supportDescription: "Required to route files to your chosen folders. It also adds ZIP actions and updates file locations in Firefox’s download panel.", supportDownload: "Download Windows installer", supportNote: "The installer is hosted on GitHub. If support already works, you do not need to reinstall it. See Privacy for integration details.",
  advancedTitle: "Advanced", priorityTitle: "Rule order", priorityHint: "The first matching rule wins. Changing this order is optional.",
  templateHint: "Folder variables: {domain}, {year}, {month}.", resetPriority: "Restore default order",
  backupTitle: "Configuration backup", backupDescription: "Save rules and preferences to a JSON file, or import them on another computer.", exportSettings: "Save to file…", importSettings: "Import from file…", confirmImport: "Load into form", cancelImport: "Cancel",
  importReady: "Rules to load: ", importWarning: ". They replace the form. Check folders, then Save settings. Consent and history are not imported.",
  backupError: "Invalid settings file or folder. Nothing was changed.", imported: "Loaded into the form. Review settings before saving.",
  conditionLabel: "Only from this website (optional)",
  aboutTitle: "About the extension",
  privacyLink: "Privacy",
  chatgptFolderLabel: "ChatGPT downloads folder", chatgptFolderHint: "Leave blank to use the saved folder or Windows Downloads. Each conversation gets its own subfolder.",
  chatgptFolderInvalid: "Choose a ChatGPT folder or leave it blank.",
  namesTitle: "Filename rules",
  chatgptToggleLabel: "ChatGPT rule",
  addName: "+ Add pattern", namesEmpty: "No filename rules yet.",
  pattern: "Filename pattern", enabled: "Enabled", up: "Move up", down: "Move down",
  invalidName: "Enter a pattern (up to 255 characters, no path) and a full folder path for every filename rule.",
  subtitle: "Save files from selected websites exactly where you want them.",
  languageLabel: "Language",
  languageAuto: "Automatic (Firefox)",
  chatgptTitle: "Built-in conversation rule",
  chatgptDescription: "Save files in folders named after conversations.",
  routesTitle: "Other websites",
  routesDescription: "Add a domain and destination folder. Its subdomains are included automatically.",
  diagnosticsTitle: "Extension status",
  versionLabel: "Version",
  activityLabel: "Last activity",
  activityNone: "none",
  activity_context: "click detected",
  activity_matched: "route matched",
  activity_unmatched: "no matching route",
  activity_moved: "file moved",
  activity_error: "error",
  addRoute: "+ Add website",
  emptyState: "No website routes have been added yet.",
  domain: "Website / domain",
  folder: "Destination folder",
  browse: "Browse…",
  remove: "Remove route",
  save: "Save settings",
  saved: "Settings saved.",
  invalid: "Enter a valid domain and a full folder path for every route.",
  hostError: "Review your consent in Privacy and install DownloadLens Support."
}
};

let text = translations.en;

const routesElement = document.querySelector("#routes");
const emptyElement = document.querySelector("#emptyState");
const statusElement = document.querySelector("#status");

function applyText() {
  for (const id of ["supportTitle", "supportDescription", "supportDownload", "supportNote"]) document.getElementById(id).textContent = text[id];
  for (const id of ["advancedTitle", "priorityTitle", "priorityHint", "templateHint", "resetPriority", "backupTitle", "backupDescription", "exportSettings", "importSettings", "confirmImport", "cancelImport"]) document.getElementById(id).textContent = text[id];
  document.getElementById("aboutTitle").textContent = text.aboutTitle;
  document.querySelector(".about-links").setAttribute("aria-label", text.aboutTitle);
  document.getElementById("privacyLink").textContent = text.privacyLink;
  for (const id of ["chatgptFolderLabel", "chatgptFolderHint"]) document.getElementById(id).textContent = text[id];
  document.getElementById("chatgptBrowse").textContent = text.browse;
  for (const id of ["namesTitle", "chatgptToggleLabel", "addName", "namesEmpty"]) document.getElementById(id).textContent = text[id];
  for (const row of document.querySelectorAll(".name-rule")) translateNameRow(row);
  refreshRuleControls();
  for (const id of ["subtitle", "languageLabel", "chatgptTitle", "chatgptDescription", "routesTitle", "routesDescription", "diagnosticsTitle", "versionLabel", "activityLabel", "addRoute", "emptyState", "save"]) {
    document.querySelector("#" + id).textContent = text[id];
  }
  document.querySelector('#language option[value="auto"]').textContent = text.languageAuto;
  for (const row of routesElement.querySelectorAll(".route")) {
    row.querySelector(".domainLabel").textContent = text.domain;
    row.querySelector(".folderLabel").textContent = text.folder;
    row.querySelector(".browse").textContent = text.browse;
    row.querySelector(".remove").setAttribute("aria-label", text.remove);
    row.querySelector(".remove").title = text.remove;
  }
  renderActivity();
  renderPriorities();
}

let currentActivity = null;

function renderActivity() {
  const activity = currentActivity;
  document.querySelector("#lastActivity").textContent = activity ? (text["activity_" + activity.stage] || activity.stage) : text.activityNone;
  document.querySelector("#activityDetails").textContent = activity && activity.details ? activity.details : "";
}

function firefoxLanguage() {
  const locale = api.i18n && api.i18n.getUILanguage ? api.i18n.getUILanguage() : navigator.language;
  return locale.toLowerCase().startsWith("pl") ? "pl" : "en";
}

function selectTranslation(value) {
  text = translations[value === "auto" ? firefoxLanguage() : value] || translations.en;
  applyText();
  statusElement.textContent = "";
}

function normalizeDomain(value) {
  const input = value.trim().toLowerCase();
  if (!input) return "";
  try {
    const url = new URL(input.includes("://") ? input : "https://" + input);
    return url.hostname.replace(/^www\./, "");
  } catch (_) {
    return "";
  }
}

function refreshEmptyState() {
  emptyElement.hidden = routesElement.children.length > 0;
}

function addRoute(route = {}) {
  const row = document.querySelector("#routeTemplate").content.firstElementChild.cloneNode(true);
  row.dataset.id = route.id || crypto.randomUUID();
  row.querySelector(".domainLabel").textContent = text.domain;
  row.querySelector(".folderLabel").textContent = text.folder;
  row.querySelector(".domain").value = route.domain || "";
  row.querySelector(".folder").value = route.folder || "";
  const browse = row.querySelector(".browse");
  browse.textContent = text.browse;
  browse.addEventListener("click", async () => {
    statusElement.textContent = "";
    try {
      const response = await RouterPrivacy.send(HOST, {
        action: "chooseFolder",
        initialFolder: row.querySelector(".folder").value
      });
      if (response.ok && response.folder) row.querySelector(".folder").value = response.folder;
    } catch (_) {
      statusElement.textContent = text.hostError;
    }
  });
  const remove = row.querySelector(".remove");
  remove.setAttribute("aria-label", text.remove);
  remove.title = text.remove;
  remove.addEventListener("click", () => { row.remove(); refreshEmptyState(); renderPriorities(); });
  row.addEventListener("input", renderPriorities);
  routesElement.append(row);
  refreshEmptyState();
  renderPriorities();
}

async function save() {
  const chatgptFolder = document.querySelector("#chatgptFolder").value.trim();
  if (!LensRules.validFolder(chatgptFolder, true)) { statusElement.textContent = text.chatgptFolderInvalid; return; }
  const filenameRules = readNameRules();
  if (!filenameRules.every(rule => rule.pattern && rule.pattern.length <= 255 && !/[\\/:]/.test(rule.pattern) && LensRules.validFolder(rule.folder))) {
    statusElement.textContent = text.invalidName;
    return;
  }
  const routes = [...routesElement.querySelectorAll(".route")].map(row => ({
    id: row.dataset.id,
    domain: normalizeDomain(row.querySelector(".domain").value),
    folder: row.querySelector(".folder").value.trim()
  }));
  const valid = routes.every(route => route.domain && LensRules.validFolder(route.folder));
  if (!valid) {
    statusElement.textContent = text.invalid;
    return;
  }
  try {
    await api.storage.local.set(LensRules.validate({ routes, filenameRules, chatgptFolder, chatgptEnabled: document.querySelector("#chatgptEnabled").checked, language: document.querySelector("#language").value, ruleOrder: currentOrder() }));
  } catch (_) { statusElement.textContent = text.backupError; return; }
  statusElement.textContent = text.saved;
}

async function refreshFolderSuggestions() {
  try {
    const defaults = await RouterPrivacy.send(HOST, {action: "defaultFolders"});
    if (defaults && defaults.ok) {
      if (typeof defaults.chatgpt === "string" && defaults.chatgpt) {
        document.querySelector("#chatgptFolder").placeholder = defaults.chatgpt;
      }
      if (typeof defaults.downloads === "string" && defaults.downloads) {
        document.querySelector("#routeTemplate").content.querySelector(".folder").placeholder = defaults.downloads;
        document.querySelectorAll(".folder").forEach(field => { field.placeholder = defaults.downloads; });
      }
    }
  } catch (_) { /* Older or missing support: no invented filesystem paths. */ }
}

async function restore() {
  const settings = LensRules.normalize(await api.storage.local.get({ ...LensRules.defaults, lastActivity: null }));
  fillSettings(settings);
  void refreshFolderSuggestions();
}
function fillSettings(settings) {
  priorityOrder = settings.ruleOrder || [];
  document.querySelector("#chatgptFolder").value = settings.chatgptFolder;
  routesElement.replaceChildren();
  document.querySelector("#nameRules").replaceChildren();
  document.querySelector("#chatgptEnabled").checked = settings.chatgptEnabled;
  currentActivity = settings.lastActivity;
  document.querySelector("#extensionVersion").textContent = api.runtime.getManifest ? api.runtime.getManifest().version : "preview";
  document.querySelector("#language").value = settings.language;
  selectTranslation(settings.language);
  settings.routes.forEach(addRoute);
  settings.filenameRules.forEach(addNameRule);
  refreshEmptyState();
  renderPriorities();
}

function readNameRules() {
  return [...document.querySelectorAll(".name-rule")].map(row => ({
    id: row.dataset.id,
    domain: normalizeDomain(row.querySelector(".condition-domain").value),
    pattern: row.querySelector(".domain").value.trim(),
    folder: row.querySelector(".folder").value.trim(),
    enabled: row.querySelector(".enabled").checked
  }));
}
function refreshRuleControls() {
  const rules = readNameRules();
  document.querySelector("#namesEmpty").hidden = rules.length > 0;
  const rows = [...document.querySelectorAll(".name-rule")];
  rows.forEach((row, i) => {
    row.querySelector(".up").disabled = i === 0;
    row.querySelector(".down").disabled = i === rows.length - 1;
  });
  renderPriorities();
}
function translateNameRow(row) {
  row.querySelector(".rule-advanced summary").textContent = text.advancedTitle;
  row.querySelector(".condition-label").textContent = text.conditionLabel;
  row.querySelector(".domainLabel").textContent = text.pattern;
  row.querySelector(".folderLabel").textContent = text.folder;
  row.querySelector(".browse").textContent = text.browse;
  row.querySelector(".enabled-label").textContent = text.enabled;
  for (const key of ["up", "down", "remove"]) {
    row.querySelector("." + key).title = text[key];
    row.querySelector("." + key).setAttribute("aria-label", text[key]);
  }
}
function addNameRule(rule = {}) {
  const row = document.querySelector("#routeTemplate").content.firstElementChild.cloneNode(true);
  row.classList.add("name-rule");
  row.dataset.id = rule.id || crypto.randomUUID();
  const advanced = document.createElement("details"); advanced.className = "rule-advanced";
  const summary = document.createElement("summary");
  const condition = document.createElement("label");
  const conditionLabel = document.createElement("span"); conditionLabel.className = "condition-label";
  const domainInput = document.createElement("input"); domainInput.className = "condition-domain"; domainInput.placeholder = "example.com"; domainInput.value = rule.domain || "";
  condition.append(conditionLabel, domainInput); advanced.append(summary, condition); row.append(advanced);
  row.querySelector(".domain").value = rule.pattern || "";
  row.querySelector(".domain").placeholder = "*.zip";
  row.querySelector(".domain").maxLength = 255;
  row.querySelector(".folder").value = rule.folder || "";
  const controls = document.createElement("div");
  controls.className = "name-controls";
  const label = document.createElement("label");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox"; checkbox.className = "enabled"; checkbox.checked = rule.enabled !== false;
  const span = document.createElement("span"); span.className = "enabled-label";
  label.append(checkbox, span); controls.append(label);
  for (const [key, symbol] of [["up", "↑"], ["down", "↓"]]) {
    const button = document.createElement("button"); button.type = "button"; button.className = key + " secondary"; button.textContent = symbol;
    button.addEventListener("click", () => {
      const neighbor = key === "up" ? row.previousElementSibling : row.nextElementSibling;
      if (neighbor && priorityOrder.length) {
        const ids = LensRules.entries(draftSettings()).map(r => r.id);
        const a = ids.indexOf(row.dataset.id), b = ids.indexOf(neighbor.dataset.id);
        [ids[a], ids[b]] = [ids[b], ids[a]]; priorityOrder = ids;
      }
      if (key === "up" && row.previousElementSibling) row.previousElementSibling.before(row);
      if (key === "down" && row.nextElementSibling) row.nextElementSibling.after(row);
      refreshRuleControls();
    });
    controls.append(button);
  }
  row.append(controls);
  row.querySelector(".remove").addEventListener("click", () => { row.remove(); refreshRuleControls(); });
  row.querySelector(".browse").addEventListener("click", async () => {
    try {
      const result = await RouterPrivacy.send(HOST, {action: "chooseFolder", initialFolder: row.querySelector(".folder").value});
      if (!result || !result.ok) throw new Error();
      if (result.folder) row.querySelector(".folder").value = result.folder;
      refreshRuleControls();
    } catch (_) { statusElement.textContent = text.hostError; }
  });
  row.addEventListener("input", refreshRuleControls);
  translateNameRow(row);
  document.querySelector("#nameRules").append(row);
  refreshRuleControls();
}
document.querySelector("#addName").addEventListener("click", () => addNameRule());
document.querySelector("#addRoute").addEventListener("click", () => addRoute());
document.querySelector("#chatgptBrowse").addEventListener("click", async () => {
  try {
    const field = document.querySelector("#chatgptFolder");
    const result = await RouterPrivacy.send(HOST, {action:"chooseFolder", initialFolder:field.value});
    if (!result || !result.ok) throw new Error();
    if (result.folder) field.value = result.folder;
  } catch (_) { statusElement.textContent = text.hostError; }
});
document.querySelector("#save").addEventListener("click", save);
document.querySelector("#language").addEventListener("change", event => selectTranslation(event.target.value));
if (api.storage.onChanged) api.storage.onChanged.addListener(changes => {
  if (changes.lastActivity) { currentActivity = changes.lastActivity.newValue; renderActivity(); }
});
let priorityOrder = [];
let pendingImport = null;
function draftSettings() {
  return { filenameRules: readNameRules(), routes: [...routesElement.children].map(row => ({ id: row.dataset.id, domain: normalizeDomain(row.querySelector(".domain").value), folder: row.querySelector(".folder").value.trim() })),
    chatgptEnabled: document.querySelector("#chatgptEnabled").checked, chatgptFolder: document.querySelector("#chatgptFolder").value.trim(), language: document.querySelector("#language").value || "auto", ruleOrder: priorityOrder };
}
function currentOrder() {
  const ids = LensRules.entries({ ...draftSettings(), ruleOrder: [] }).map(r => r.id);
  return priorityOrder.filter(id => ids.includes(id));
}
function renderPriorities() {
  const target = document.querySelector("#priorityRules");
  target.replaceChildren();
  const entries = LensRules.entries(draftSettings());
  entries.forEach((rule, index) => {
    const row = document.createElement("div"); row.className = "priority-row";
    const name = document.createElement("span"); name.textContent = `${index + 1}. ${rule.kind === "chatgpt" ? "ChatGPT" : rule.pattern || rule.domain || "…"}${rule.kind === "name" && rule.domain ? " · " + rule.domain : ""}${rule.enabled === false ? " (–)" : ""}`;
    row.append(name);
    for (const [key, step, symbol] of [["up", -1, "↑"], ["down", 1, "↓"]]) {
      const button = document.createElement("button"); button.type = "button"; button.className = "secondary"; button.textContent = symbol; button.title = text[key]; button.setAttribute("aria-label", text[key]);
      button.disabled = index + step < 0 || index + step >= entries.length;
      button.addEventListener("click", () => {
        priorityOrder = entries.map(r => r.id);
        [priorityOrder[index], priorityOrder[index + step]] = [priorityOrder[index + step], priorityOrder[index]];
        refreshRuleControls();
      });
      row.append(button);
    }
    target.append(row);
  });
}
document.querySelector("#resetPriority").addEventListener("click", () => { priorityOrder = []; refreshRuleControls(); });
document.querySelector("#chatgptEnabled").addEventListener("change", refreshRuleControls);
document.querySelector("#chatgptFolder").addEventListener("input", refreshRuleControls);
document.querySelector("#exportSettings").addEventListener("click", () => {
  const status = document.querySelector("#backupStatus");
  try {
    const settings = LensRules.validate({ ...draftSettings(), ruleOrder: currentOrder() });
    const blob = new Blob([JSON.stringify({ format: "DownloadLens", version: 1, settings }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "DownloadLens-settings.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    status.textContent = "";
  } catch (_) { status.textContent = text.backupError; }
});
document.querySelector("#importSettings").addEventListener("click", () => document.querySelector("#importFile").click());
document.querySelector("#importFile").addEventListener("change", async event => {
  const file = event.target.files[0];
  event.target.value = "";
  pendingImport = null; document.querySelector("#importReview").hidden = true;
  if (!file) return;
  try {
    if (file.size > 1024 * 1024) throw new Error();
    const data = JSON.parse(await file.text());
    if (data.format !== "DownloadLens" || data.version !== 1) throw new Error();
    pendingImport = LensRules.validate(data.settings);
    document.querySelector("#importSummary").textContent = text.importReady + (pendingImport.routes.length + pendingImport.filenameRules.length) + text.importWarning;
    document.querySelector("#importReview").hidden = false;
    document.querySelector("#backupStatus").textContent = "";
  } catch (_) { document.querySelector("#backupStatus").textContent = text.backupError; }
});
document.querySelector("#confirmImport").addEventListener("click", () => {
  if (!pendingImport) return;
  fillSettings(pendingImport); pendingImport = null;
  document.querySelector("#importReview").hidden = true;
  document.querySelector("#backupStatus").textContent = text.imported;
});
document.querySelector("#cancelImport").addEventListener("click", () => { pendingImport = null; document.querySelector("#importReview").hidden = true; });
restore();

"use strict";

const HOST = "com.artllex.download_router";
const api = typeof browser !== "undefined" ? browser : {
  i18n: { getUILanguage: () => navigator.language },
  storage: { local: { get: async defaults => defaults, set: async () => {} } },
  runtime: { sendNativeMessage: async () => { throw new Error("Native host unavailable"); } }
};
const translations = {
pl: {
  chatgptFolderLabel: "Folder plików ChatGPT", chatgptFolderHint: "Puste pole: zapisany folder lub systemowe Pobrane. Rozmowy otrzymują osobne podfoldery.",
  chatgptFolderInvalid: "Wybierz folder ChatGPT lub pozostaw pole puste.",
  namesTitle: "Reguły nazw plików",
  chatgptToggleLabel: "Reguła ChatGPT",
  addName: "+ Dodaj wzorzec", namesEmpty: "Nie dodano reguł nazw.",
  pattern: "Wzorzec nazwy", enabled: "Włączona", up: "Przenieś wyżej", down: "Przenieś niżej",
  previewLabel: "Sprawdź nazwę pliku",
  previewNone: "Brak dopasowania",
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
  hostError: "Najpierw zainstaluj ChatGPT Workspace Setup 1.2.3, aby wybierać foldery."
},
en: {
  chatgptFolderLabel: "ChatGPT downloads folder", chatgptFolderHint: "Leave blank to use the saved folder or Windows Downloads. Each conversation gets its own subfolder.",
  chatgptFolderInvalid: "Choose a ChatGPT folder or leave it blank.",
  namesTitle: "Filename rules",
  chatgptToggleLabel: "ChatGPT rule",
  addName: "+ Add pattern", namesEmpty: "No filename rules yet.",
  pattern: "Filename pattern", enabled: "Enabled", up: "Move up", down: "Move down",
  previewLabel: "Test a filename",
  previewNone: "No match",
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
  hostError: "Install ChatGPT Workspace Setup 1.2.3 before choosing folders."
}
};

let text = translations.en;

const routesElement = document.querySelector("#routes");
const emptyElement = document.querySelector("#emptyState");
const statusElement = document.querySelector("#status");

function applyText() {
  for (const id of ["chatgptFolderLabel", "chatgptFolderHint"]) document.getElementById(id).textContent = text[id];
  document.getElementById("chatgptBrowse").textContent = text.browse;
  for (const id of ["namesTitle", "chatgptToggleLabel", "addName", "namesEmpty", "previewLabel"]) document.getElementById(id).textContent = text[id];
  for (const row of document.querySelectorAll(".name-rule")) translateNameRow(row);
  updatePreview();
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
  row.querySelector(".domainLabel").textContent = text.domain;
  row.querySelector(".folderLabel").textContent = text.folder;
  row.querySelector(".domain").value = route.domain || "";
  row.querySelector(".folder").value = route.folder || "";
  const browse = row.querySelector(".browse");
  browse.textContent = text.browse;
  browse.addEventListener("click", async () => {
    statusElement.textContent = "";
    try {
      const response = await api.runtime.sendNativeMessage(HOST, {
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
  remove.addEventListener("click", () => { row.remove(); refreshEmptyState(); });
  routesElement.append(row);
  refreshEmptyState();
}

async function save() {
  const chatgptFolder = document.querySelector("#chatgptFolder").value.trim();
  if (chatgptFolder && !/^[a-z]:\\/i.test(chatgptFolder)) { statusElement.textContent = text.chatgptFolderInvalid; return; }
  const filenameRules = readNameRules();
  if (!filenameRules.every(rule => rule.pattern && rule.pattern.length <= 255 && !/[\\/:]/.test(rule.pattern) && /^[a-z]:\\/i.test(rule.folder))) {
    statusElement.textContent = text.invalidName;
    return;
  }
  const routes = [...routesElement.querySelectorAll(".route")].map(row => ({
    domain: normalizeDomain(row.querySelector(".domain").value),
    folder: row.querySelector(".folder").value.trim().replace(/[\\/]+$/, "")
  }));
  const valid = routes.every(route => route.domain && /^[a-z]:\\/i.test(route.folder));
  if (!valid) {
    statusElement.textContent = text.invalid;
    return;
  }
  await api.storage.local.set({ routes, filenameRules, chatgptFolder, chatgptEnabled: document.querySelector("#chatgptEnabled").checked, language: document.querySelector("#language").value });
  statusElement.textContent = text.saved;
}

async function refreshFolderSuggestions() {
  try {
    const defaults = await api.runtime.sendNativeMessage(HOST, {action: "defaultFolders"});
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
  const settings = await api.storage.local.get({ routes: [], filenameRules: [], chatgptFolder: "", chatgptEnabled: true, language: "auto", lastActivity: null });
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
  // Optional native hints must never delay loading saved settings or language.
  void refreshFolderSuggestions();
}

function readNameRules() {
  return [...document.querySelectorAll(".name-rule")].map(row => ({
    pattern: row.querySelector(".domain").value.trim(),
    folder: row.querySelector(".folder").value.trim(),
    enabled: row.querySelector(".enabled").checked
  }));
}
function updatePreview() {
  const rules = readNameRules();
  document.querySelector("#namesEmpty").hidden = rules.length > 0;
  const filename = document.querySelector("#previewName").value;
  const match = filename && matchingFilenameRule(filename, rules);
  document.querySelector("#previewResult").textContent = !filename ? "" : match ? `${match.pattern} → ${match.folder}` : text.previewNone;
  const rows = [...document.querySelectorAll(".name-rule")];
  rows.forEach((row, i) => {
    row.querySelector(".up").disabled = i === 0;
    row.querySelector(".down").disabled = i === rows.length - 1;
  });
}
function translateNameRow(row) {
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
      if (key === "up" && row.previousElementSibling) row.previousElementSibling.before(row);
      if (key === "down" && row.nextElementSibling) row.nextElementSibling.after(row);
      updatePreview();
    });
    controls.append(button);
  }
  row.append(controls);
  row.querySelector(".remove").addEventListener("click", () => { row.remove(); updatePreview(); });
  row.querySelector(".browse").addEventListener("click", async () => {
    try {
      const result = await api.runtime.sendNativeMessage(HOST, {action: "chooseFolder", initialFolder: row.querySelector(".folder").value});
      if (!result || !result.ok) throw new Error();
      if (result.folder) row.querySelector(".folder").value = result.folder;
      updatePreview();
    } catch (_) { statusElement.textContent = text.hostError; }
  });
  row.addEventListener("input", updatePreview);
  translateNameRow(row);
  document.querySelector("#nameRules").append(row);
  updatePreview();
}
document.querySelector("#addName").addEventListener("click", () => addNameRule());
document.querySelector("#previewName").addEventListener("input", updatePreview);
document.querySelector("#addRoute").addEventListener("click", () => addRoute());
document.querySelector("#chatgptBrowse").addEventListener("click", async () => {
  try {
    const field = document.querySelector("#chatgptFolder");
    const result = await api.runtime.sendNativeMessage(HOST, {action:"chooseFolder", initialFolder:field.value});
    if (!result || !result.ok) throw new Error();
    if (result.folder) field.value = result.folder;
  } catch (_) { statusElement.textContent = text.hostError; }
});
document.querySelector("#save").addEventListener("click", save);
document.querySelector("#language").addEventListener("change", event => selectTranslation(event.target.value));
if (api.storage.onChanged) api.storage.onChanged.addListener(changes => {
  if (changes.lastActivity) { currentActivity = changes.lastActivity.newValue; renderActivity(); }
});
restore();

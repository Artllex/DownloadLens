"use strict";
const copy = {
  en: {
    languageLabel: "Language", languageAuto: "Automatic (Firefox)",
    heading: "Local data transfer — your choice",
    intro: "DownloadLens requires the separately installed Windows program DownloadLens Support. The extension does not send data to the developer, analytics providers or cloud services.",
    dataHeading: "What is shared with the local program?",
    data: "File names and full source/destination paths (possibly including your Windows user name), download URLs and start times, matched rules and ChatGPT conversation titles used as folder names. Folder commands also pass local paths. Files are moved or copied locally, not uploaded. This extension does not route private downloads.",
    purposeHeading: "Purpose and storage",
    purpose: "Data enable routing, collision-safe naming and opening folders. Rules, consent and the latest result are stored locally in Firefox. Temporary route state is removed after processing. Declining clears route state and the latest result, but preserves your rules. No telemetry or advertising data is sent.",
    supportHeading: "Separate integration — important",
    support: "The installer adds privileged AutoConfig code and disables the AutoConfig sandbox, not the web-content sandbox. It records metadata for up to 512 public downloads per browser session in original-names.json and adds history synchronization, ZIP extraction and deletion. This operates independently of the extension and this choice. Uninstall DownloadLens Support to remove that integration. Declining does not erase downloaded files, Firefox history or native metadata. Metadata can persist after restart/uninstallation in %LOCALAPPDATA%\\Programs\\ChatGPTFolderLauncher\\sync-requests. Already queued operations may finish.",
    declineInfo: "Allow enables local routing and folder commands. Decline pauses them; normal Firefox downloads and rule editing remain available. Change your choice here at any time.",
    accept: "Allow local data transfer", decline: "Decline / pause routing", uninstall: "Uninstall extension…", settings: "Back to settings", enabled: "Local data transfer is enabled.", disabled: "Local data transfer is paused."
  },
  pl: {
    languageLabel: "Język", languageAuto: "Automatycznie (Firefox)",
    heading: "Lokalne przekazywanie danych — Twój wybór",
    intro: "DownloadLens wymaga osobno instalowanego programu Windows DownloadLens Support. Rozszerzenie nie wysyła danych autorowi, usługom analitycznym ani do chmury.",
    dataHeading: "Co trafia do lokalnego programu?",
    data: "Nazwy plików i pełne ścieżki źródłowe/docelowe (mogą zawierać nazwę użytkownika Windows), adresy URL i czas rozpoczęcia pobrań, dopasowane reguły i tytuły rozmów ChatGPT jako nazwy folderów. Polecenia folderów również przekazują lokalne ścieżki. Pliki są przenoszone lub kopiowane lokalnie, nie są wysyłane. Rozszerzenie nie przekierowuje pobrań prywatnych.",
    purposeHeading: "Cel i przechowywanie",
    purpose: "Dane służą przekierowaniu plików, unikaniu kolizji nazw i otwieraniu folderów. Reguły, zgoda i ostatni wynik są zapisane lokalnie w Firefoxie. Stan obsłużonego pobrania jest usuwany. Odmowa usuwa stan przekierowań i ostatni wynik, zachowując reguły. Brak telemetrii i danych reklamowych.",
    supportHeading: "Osobna integracja — ważne",
    support: "Instalator dodaje uprzywilejowany kod AutoConfig i wyłącza sandbox AutoConfig, nie sandbox stron. Zapisuje metadane do 512 publicznych pobrań na sesję w original-names.json i dodaje aktualizację historii, rozpakowanie ZIP i usuwanie. Działa niezależnie od rozszerzenia i tej zgody. Aby usunąć integrację, odinstaluj DownloadLens Support. Odmowa nie usuwa plików, historii Firefoxa ani metadanych komponentu. Metadane mogą pozostać po restarcie i odinstalowaniu w %LOCALAPPDATA%\\Programs\\ChatGPTFolderLauncher\\sync-requests. Już zlecone operacje mogą się zakończyć.",
    declineInfo: "Zgoda włącza przekierowanie i polecenia folderów. Odmowa je wstrzymuje; zwykłe pobieranie i edycja reguł nadal działają. Wybór możesz zmienić tutaj w dowolnej chwili.",
    accept: "Zezwól na lokalne przekazywanie", decline: "Odmów / wstrzymaj przekierowanie", uninstall: "Odinstaluj rozszerzenie…", settings: "Wróć do ustawień", enabled: "Lokalne przekazywanie danych jest włączone.", disabled: "Lokalne przekazywanie danych jest wstrzymane."
  }
};
let language = "en";
const extensionAvailable = typeof browser !== "undefined" && !!browser.storage?.local;
function showError() {
  document.getElementById("status").textContent = language === "pl"
    ? "Nie można odczytać lub zapisać ustawień rozszerzenia. Otwórz tę stronę przez ustawienia dodatku w Firefoxie."
    : "Extension settings cannot be read or saved. Open this page from the add-on settings in Firefox.";
}
function selectLanguage(value) {
  const choice = ["auto", "en", "pl"].includes(value) ? value : "auto";
  document.getElementById("language").value = choice;
  language = (choice === "auto" ? (extensionAvailable ? browser.i18n.getUILanguage() : navigator.language) : choice).toLowerCase().startsWith("pl") ? "pl" : "en";
}
async function render() {
  document.documentElement.lang = language;
  for (const [id, value] of Object.entries(copy[language])) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }
  if (!extensionAvailable) { showError(); return; }
  try {
    document.getElementById("status").textContent = copy[language][await RouterPrivacy.allowed() ? "enabled" : "disabled"];
  } catch { showError(); }
}
async function choose(accepted) {
  await browser.storage.local.set({ localDataConsent: { version: RouterPrivacy.version, accepted, at: new Date().toISOString() } });
  await render();
}
document.getElementById("accept").addEventListener("click", () => choose(true).catch(showError));
document.getElementById("decline").addEventListener("click", () => choose(false).catch(showError));
document.getElementById("uninstall").addEventListener("click", () => browser.management.uninstallSelf({showConfirmDialog:true}).catch(error => { document.getElementById("status").textContent = error.message; }));
document.getElementById("language").addEventListener("change", async event => {
  selectLanguage(event.target.value);
  await render();
  if (extensionAvailable) {
    try { await browser.storage.local.set({ language: event.target.value }); }
    catch { showError(); }
  }
});
(async () => {
  selectLanguage("auto");
  for (const id of ["accept", "decline", "uninstall"]) document.getElementById(id).disabled = !extensionAvailable;
  await render();
  if (extensionAvailable) {
    try {
      const settings = await browser.storage.local.get({ language: "auto" });
      selectLanguage(settings.language);
      await render();
    } catch { showError(); }
  }
})();

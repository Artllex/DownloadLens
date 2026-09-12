"use strict";

const HOST = "com.artllex.download_router";
const language = (browser.i18n.getUILanguage() || "en").toLowerCase().startsWith("pl") ? "pl" : "en";
const labels = language === "pl"
  ? { empty: "Nie przeniesiono jeszcze żadnego pliku.", reveal: "Pokaż ostatni plik w folderze", settings: "Ustawienia", error: "Nie udało się otworzyć folderu." }
  : { empty: "No file has been moved yet.", reveal: "Show latest file in folder", settings: "Settings", error: "The folder could not be opened." };

const pathElement = document.querySelector("#path");
const revealButton = document.querySelector("#reveal");
const settingsButton = document.querySelector("#settings");
const statusElement = document.querySelector("#status");
let destination = "";

revealButton.textContent = labels.reveal;
settingsButton.textContent = labels.settings;

browser.storage.local.get({ lastDestination: "", lastActivity: null }).then(values => {
  const fallback = values.lastActivity && values.lastActivity.stage === "moved" ? values.lastActivity.details : "";
  destination = values.lastDestination || fallback;
  pathElement.textContent = destination || labels.empty;
  revealButton.disabled = !destination;
});

revealButton.addEventListener("click", async () => {
  statusElement.textContent = "";
  try {
    const response = await browser.runtime.sendMessage({ type: "reveal-latest" });
    if (!response || !response.ok) throw new Error(response && response.error);
    window.close();
  } catch (error) {
    statusElement.textContent = (error && error.message) || labels.error;
  }
});

settingsButton.addEventListener("click", () => browser.runtime.openOptionsPage());

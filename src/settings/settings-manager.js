const KEY = "celest-settings-v2";
const DEFAULTS = Object.freeze({ searchEngine: "duckduckgo", engine: "native-frame", backendUrl: "" });

export class SettingsManager {
  constructor() { this.value = this.load(); }

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {
        searchEngine: saved.searchEngine === "google" ? "google" : "duckduckgo",
        engine: saved.engine === "same-origin-lab" ? "same-origin-lab" : DEFAULTS.engine,
        backendUrl: typeof saved.backendUrl === "string" ? saved.backendUrl : ""
      };
    } catch { return { ...DEFAULTS }; }
  }

  get(key) { return this.value[key]; }
  all() { return { ...this.value }; }
  set(key, value) {
    if (!(key in DEFAULTS)) throw new Error("Unknown setting: " + key);
    this.value[key] = value;
    try { localStorage.setItem(KEY, JSON.stringify(this.value)); } catch {}
    return this.value[key];
  }
}

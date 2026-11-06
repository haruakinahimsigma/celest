const KEY = "celest-settings-v2";
const DEFAULTS = Object.freeze({ searchEngine: "duckduckgo", engine: "native-frame", backendUrl: "" });

function readStorage() {
  try { return globalThis.localStorage?.getItem(KEY) || "{}"; }
  catch { return "{}"; }
}

export class SettingsManager {
  constructor() { this.value = this.load(); }

  load() {
    try {
      const saved = JSON.parse(readStorage());
      return {
        searchEngine: saved.searchEngine === "google" ? "google" : DEFAULTS.searchEngine,
        engine: saved.engine === "same-origin-lab" ? "same-origin-lab" : DEFAULTS.engine,
        backendUrl: typeof saved.backendUrl === "string" ? saved.backendUrl : DEFAULTS.backendUrl
      };
    } catch { return { ...DEFAULTS }; }
  }

  get(key) { return this.value[key]; }
  all() { return { ...this.value }; }

  set(key, value) {
    if (!(key in DEFAULTS)) throw new Error("Unknown setting: " + key);
    if (key === "searchEngine" && !["duckduckgo", "google"].includes(value)) {
      throw new Error("Unsupported search provider.");
    }
    if (key === "engine" && !["native-frame", "same-origin-lab"].includes(value)) {
      throw new Error("Unsupported browsing mode.");
    }
    if (key === "backendUrl" && typeof value !== "string") {
      throw new TypeError("Backend URL must be text.");
    }
    this.value[key] = value;
    try { globalThis.localStorage?.setItem(KEY, JSON.stringify(this.value)); } catch {}
    return this.value[key];
  }
}

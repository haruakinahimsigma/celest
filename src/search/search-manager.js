const PROVIDERS = Object.freeze({
  duckduckgo: { id: "duckduckgo", name: "DuckDuckGo", mode: "results" },
  google: { id: "google", name: "Google", mode: "navigate" }
});

export class SearchManager {
  constructor(provider = "duckduckgo") {
    this.setProvider(provider);
  }

  setProvider(provider) {
    this.provider = PROVIDERS[provider] ? provider : "duckduckgo";
  }

  getProvider() { return PROVIDERS[this.provider]; }
  listProviders() { return Object.values(PROVIDERS); }

  createSearch(query) {
    const value = String(query || "").trim();
    if (!value || value.length > 200) throw new Error("Search must be between 1 and 200 characters.");
    if (this.provider === "google") {
      return { mode: "navigate", url: "https://www.google.com/search?q=" + encodeURIComponent(value), query: value };
    }
    return { mode: "results", url: "celest-search://results?q=" + encodeURIComponent(value), query: value };
  }
}

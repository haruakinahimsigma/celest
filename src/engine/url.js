const SEARCH_ENGINES = {
  google: "https://www.google.com/search?q=",
  duckduckgo: "https://duckduckgo.com/?q="
};

/**
 * Normalize user-entered addresses.
 * This module deliberately does not tunnel traffic or rewrite requests.
 */
export function resolveAddress(input, searchEngine = "google") {
  const value = String(input ?? "").trim();
  if (!value) return null;

  if (/^(https?):\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol)) return null;
      return url.href;
    } catch {
      return null;
    }
  }

  const looksLikeHost = /^(localhost|[\w-]+\.[a-z]{2,})(:\d+)?([/?#].*)?$/i.test(value);
  if (looksLikeHost) return `https://${value}`;

  const base = SEARCH_ENGINES[searchEngine] ?? SEARCH_ENGINES.google;
  return base + encodeURIComponent(value);
}

export function isAllowedWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}
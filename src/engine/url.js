const SEARCH_ENGINES = {
  google: "https://www.google.com/search?q=",
  duckduckgo: "https://duckduckgo.com/?q="
};

/**
 * Match the familiar address-bar decision:
 * explicit URLs and bare hostnames navigate; everything else is a search.
 * Search-result retrieval is handled by Celest's own results view.
 */
export function isLikelyUrl(input) {
  const value = String(input ?? "").trim();
  if (!value || /\s/.test(value)) return false;
  if (/^https?:\/\//i.test(value)) return true;
  return /^(localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})(:\d+)?([/?#].*)?$/i.test(value);
}

export function resolveAddress(input) {
  const value = String(input ?? "").trim();
  if (!value || !isLikelyUrl(value)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.href;
  } catch {
    return null;
  }
}

export function isAllowedWebUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

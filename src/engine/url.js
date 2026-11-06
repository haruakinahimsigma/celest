/**
 * Address-bar parsing for Celest's native browser workspace.
 * Only ordinary HTTP(S) navigation is supported; search terms stay in Celest's
 * results view rather than being mistaken for hostnames.
 */
export function isLikelyUrl(input) {
  const value = String(input ?? "").trim();
  if (!value || /\s/.test(value)) return false;
  if (/^https?:\/\//i.test(value)) return true;

  // Accept localhost, DNS names, IPv4 literals, optional ports and paths.
  const hostname = value.split(/[/?#]/, 1)[0].replace(/:\d+$/, "");
  const isLocalhost = /^localhost$/i.test(hostname);
  const isDomain = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(hostname);
  const isIPv4 = /^(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(hostname);
  return (isLocalhost || isDomain || isIPv4) && !/\s/.test(value);
}

export function resolveAddress(input) {
  const value = String(input ?? "").trim();
  if (!value || !isLikelyUrl(value)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : "https://" + value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function isAllowedWebUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function normalizeBackendUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Use an HTTP or HTTPS endpoint without embedded credentials.");
  }
  return url.href.replace(/\/$/, "");
}

export async function checkBackend(value) {
  const base = normalizeBackendUrl(value);
  if (!base) throw new Error("Enter a backend URL first.");
  const healthUrl = new URL("/health", base);
  const response = await fetch(healthUrl, { method: "GET", headers: { accept: "application/json" }, signal: AbortSignal.timeout(6000), mode: "cors" });
  if (!response.ok) throw new Error("Health check returned HTTP " + response.status + ".");
  const payload = await response.json();
  return { url: healthUrl.href, payload };
}

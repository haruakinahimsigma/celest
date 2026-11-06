export function normalizeBackendUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let url;
  try { url = new URL(raw); }
  catch { throw new Error("Enter a complete URL, including https://."); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Use an HTTP or HTTPS endpoint without embedded credentials.");
  }
  if (url.search || url.hash) throw new Error("Backend URL must not contain a query string or fragment.");
  return url.href.replace(/\/$/, "");
}

export async function checkBackend(value, { timeoutMs = 6000, fetchImpl = fetch } = {}) {
  const base = normalizeBackendUrl(value);
  if (!base) throw new Error("Enter a backend URL first.");
  const healthUrl = new URL("/health", base);
  let response;
  try {
    response = await fetchImpl(healthUrl, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
      mode: "cors"
    });
  } catch (error) {
    if (error?.name === "TimeoutError" || error?.name === "AbortError") {
      throw new Error("Health check timed out.");
    }
    throw new Error("Could not reach the endpoint. Check its URL and CORS settings.");
  }
  if (!response.ok) throw new Error("Health check returned HTTP " + response.status + ".");
  let payload;
  try { payload = await response.json(); }
  catch { throw new Error("The /health endpoint did not return valid JSON."); }
  return { url: healthUrl.href, payload };
}

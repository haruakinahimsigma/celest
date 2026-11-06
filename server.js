import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const port = Number(process.env.PORT || 3000);
const types = {
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".ico":"image/x-icon",
  ".webp":"image/webp",
  ".woff2":"font/woff2"
};

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, "http://localhost");
  if (requestUrl.pathname === "/__celest_lab__/" || requestUrl.pathname === "/__celest_lab__") {
    const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#090b12"><title>Celest Core Lab</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;padding:40px 22px;background:#090b12;color:#eef0f8;font:15px system-ui,sans-serif;display:grid;place-items:center}main{width:min(680px,100%);padding:32px;border:1px solid #ffffff20;border-radius:20px;background:#141827}.eyebrow{color:#a99bff;letter-spacing:3px;font-size:10px;font-weight:700}h1{font-size:clamp(30px,6vw,48px);letter-spacing:-2px;margin:12px 0}p{color:#aab0c3;line-height:1.7}.panel{margin-top:22px;padding:16px;border-radius:12px;background:#090d18;border:1px solid #ffffff14}.status{font-weight:700;color:#c3baff}.muted{font-size:12px;color:#858da4}</style></head>
<body><main><p class="eyebrow">CELEST · CORE EXPERIMENT</p><h1>Service Worker Lab</h1><p>A same-origin test page for Celest's own Service Worker. It checks whether this page is controlled and whether the worker can annotate a local fixture response.</p><section class="panel"><div class="status" id="control">Checking controller…</div><p id="probe" class="muted">Running local request test…</p><p class="muted">No third-party traffic is routed, rewritten, or intercepted by this experiment.</p></section></main>
<script>document.querySelector("#control").textContent=navigator.serviceWorker?.controller?"Service Worker controls this page":"Page is not controlled yet";fetch("/__celest_lab__/probe.txt",{cache:"no-store"}).then(async r=>{document.querySelector("#probe").textContent=r.headers.get("X-Celest-Service-Worker")==="controlled-lab"?"PASS · local response annotated by Celest Service Worker":"Response received; worker marker not present. Reload after the worker activates."}).catch(()=>{document.querySelector("#probe").textContent="Local request test failed."});</script></body></html>`;
    res.writeHead(200, {"content-type":"text/html; charset=utf-8", "cache-control":"no-store"});
    res.end(page);
    return;
  }
  if (requestUrl.pathname === "/__celest_lab__/probe.txt") {
    res.writeHead(200, {"content-type":"text/plain; charset=utf-8", "cache-control":"no-store"});
    res.end("Celest same-origin Service Worker fixture.");
    return;
  }


  if (requestUrl.pathname === "/api/search") {
    const query = (requestUrl.searchParams.get("q") || "").trim();
    if (!query || query.length > 200) {
      res.writeHead(400, {"content-type":"application/json; charset=utf-8"});
      res.end(JSON.stringify({error:"Enter a search between 1 and 200 characters."}));
      return;
    }
    try {
      const upstream = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: {"user-agent":"Mozilla/5.0 (compatible; CelestSearch/1.0)","accept":"text/html"},
        signal: AbortSignal.timeout(9000)
      });
      if (!upstream.ok) throw new Error(`Search provider returned HTTP ${upstream.status}`);
      const html = await upstream.text();
      const decode = value => value
        .replace(/<[^>]*>/g, " ")
        .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
        .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
        .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
        .replace(/\s+/g, " ").trim();
      const anchors = [...html.matchAll(/<a\b([^>]*class=["'][^"']*result__a[^"']*["'][^>]*)>([\s\S]*?)<\/a>/gi)];
      const snippets = [...html.matchAll(/<(?:a|td)\b([^>]*class=["'][^"']*result__snippet[^"']*["'][^>]*)>([\s\S]*?)<\/(?:a|td)>/gi)];
      const results = anchors.map((match, index) => {
        const href = match[1].match(/href=["']([^"']+)["']/i)?.[1];
        if (!href) return null;
        try {
          const parsed = new URL(href, "https://duckduckgo.com");
          const target = parsed.searchParams.get("uddg") || parsed.href;
          const safe = new URL(target);
          if (!["http:", "https:"].includes(safe.protocol)) return null;
          return {url:safe.href,title:decode(match[2]),snippet:decode(snippets[index]?.[2] || "")};
        } catch { return null; }
      }).filter(Boolean).slice(0, 12);
      res.writeHead(200, {"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=180"});
      res.end(JSON.stringify({query,results}));
    } catch (error) {
      res.writeHead(502, {"content-type":"application/json; charset=utf-8","cache-control":"no-store"});
      res.end(JSON.stringify({error:error.message || "Search provider unavailable"}));
    }
    return;
  }

  if (requestUrl.pathname === "/health") {
    res.writeHead(200, {"content-type":"application/json"});
    res.end(JSON.stringify({ok:true,app:"celest",version:"0.3.0"}));
    return;
  }

  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const filePath = path.resolve(root, `.${pathname}`);
    const relativePath = path.relative(root, filePath);
    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) throw new Error("Invalid path");
    let resolvedFile = filePath;

    try {
      const info = await stat(resolvedFile);
      if (info.isDirectory()) resolvedFile = path.join(resolvedFile, "index.html");
    } catch {
      resolvedFile = path.join(root, "index.html");
    }

    const body = await readFile(resolvedFile);
    res.writeHead(200, {
      "content-type": types[path.extname(resolvedFile)] || "application/octet-stream",
      "x-content-type-options":"nosniff",
      "referrer-policy":"strict-origin-when-cross-origin"
    });
    res.end(body);
  } catch {
    res.writeHead(404, {"content-type":"text/plain; charset=utf-8"});
    res.end("Not found");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Celest listening on 0.0.0.0:${port}`);
});
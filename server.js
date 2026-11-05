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
  if (req.url === "/health") {
    res.writeHead(200, {"content-type":"application/json"});
    res.end(JSON.stringify({ok:true,app:"celest",version:"0.1.2"}));
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
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist/site");
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
  const known = new Map([
    ["/", "index.html"], ["/demo", "demo/index.html"], ["/demo/", "demo/index.html"],
    ["/privacy", "privacy/index.html"], ["/privacy/", "privacy/index.html"],
    ["/terms", "terms/index.html"], ["/terms/", "terms/index.html"],
    ["/404", "404/index.html"], ["/404/", "404/index.html"],
  ]);
  let relative = known.get(pathname) ?? normalize(pathname).replace(/^[/\\]+/, "");
  let status = pathname === "/404" || pathname === "/404/" ? 404 : 200;
  try {
    if (!relative || !statSync(join(root, relative)).isFile()) throw new Error("missing");
  } catch {
    relative = "404/index.html";
    status = 404;
  }
  const path = join(root, relative);
  response.writeHead(status, {
    "content-type": types[extname(path)] ?? "application/octet-stream",
    "cache-control": "no-cache",
    "x-content-type-options": "nosniff",
  });
  if (request.method === "HEAD") return response.end();
  createReadStream(path).pipe(response);
}).listen(4173, "127.0.0.1");

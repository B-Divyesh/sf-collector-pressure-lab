import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve, relative } from "node:path";
import { defineConfig, type Plugin } from "vite";

const outDir = resolve(import.meta.dirname, "dist/site");
// Azure Static Web Apps consumes this file at deploy time but does not publish it.
// Keep it in the build output for the host while excluding it from browser precache.
const deploymentControlFiles = new Set(["staticwebapp.config.json"]);
const routePaths = new Set(["/", "/demo", "/demo/", "/privacy", "/privacy/", "/terms", "/terms/", "/404", "/404/"]);

function routePages(): Plugin {
  const rewrite = (url: string, production: boolean) => {
    const path = new URL(url, "http://local").pathname;
    if (path === "/demo" || path === "/demo/") return production ? "/demo/index.html" : "/index.html";
    if (path === "/privacy") return "/privacy/index.html";
    if (path === "/terms") return "/terms/index.html";
    if (path === "/404" || path === "/404/") return "/404/index.html";
    if (!routePaths.has(path) && !path.split("/").pop()?.includes(".")) return "/404/index.html";
    return url;
  };
  const middleware = (production: boolean) => (request: { url?: string }, response: { statusCode: number }, next: () => void) => {
    if (!request.url) return next();
    const rewritten = rewrite(request.url, production);
    if (rewritten === "/404/index.html" && !request.url.startsWith("/404")) response.statusCode = 404;
    request.url = rewritten;
    next();
  };
  return {
    name: "pressure-lab-route-pages",
    configureServer(server) { server.middlewares.use(middleware(false)); },
    configurePreviewServer(server) { server.middlewares.use(middleware(true)); },
    closeBundle() {
      const home = readFileSync(resolve(outDir, "index.html"), "utf8");
      const demo = home
        .replaceAll("Collector Pressure Lab — test Collector backpressure", "Demo — Collector Pressure Lab")
        .replace('href="https://collector-pressure-lab.sociobot.in/"', 'href="https://collector-pressure-lab.sociobot.in/demo"')
        .replace('content="https://collector-pressure-lab.sociobot.in/"', 'content="https://collector-pressure-lab.sociobot.in/demo"');
      mkdirSync(resolve(outDir, "demo"), { recursive: true });
      writeFileSync(resolve(outDir, "demo/index.html"), demo);
    },
  };
}

function offlineShell(): Plugin {
  return {
    name: "pressure-lab-offline-shell",
    closeBundle() {
      const files: string[] = [];
      const walk = (directory: string) => {
        for (const name of readdirSync(directory)) {
          const file = resolve(directory, name);
          if (statSync(file).isDirectory()) walk(file);
          else if (name !== "sw.js" && name !== "_headers" && !deploymentControlFiles.has(name)) {
            files.push(`/${relative(outDir, file).replaceAll("\\", "/")}`);
          }
        }
      };
      walk(outDir);
      files.sort();
      const signature = createHash("sha256")
        .update(files.map((file) => readFileSync(resolve(outDir, file.slice(1)))).join(""))
        .digest("hex")
        .slice(0, 12);
      const script = `const CACHE="cplab-${signature}";const ASSETS=${JSON.stringify(files)};const pageFor=p=>p==="/"?"/index.html":p.startsWith("/demo")?"/demo/index.html":p.startsWith("/privacy")?"/privacy/index.html":p.startsWith("/terms")?"/terms/index.html":"/404/index.html";self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return response}).catch(()=>e.request.mode==="navigate"?caches.match(pageFor(new URL(e.request.url).pathname)):undefined)))})`;
      writeFileSync(resolve(outDir, "sw.js"), script);
    },
  };
}

export default defineConfig({
  root: "site",
  publicDir: "public",
  build: {
    outDir,
    emptyOutDir: true,
    target: "es2022",
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "site/index.html"),
        privacy: resolve(import.meta.dirname, "site/privacy/index.html"),
        terms: resolve(import.meta.dirname, "site/terms/index.html"),
        notFound: resolve(import.meta.dirname, "site/404/index.html"),
      },
    },
  },
  plugins: [routePages(), offlineShell()],
});

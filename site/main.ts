import "./style.css";
import { modelPressure, type ModelInput, type ModelResult } from "./model";

const byId = <T extends HTMLElement>(id: string): T | null => document.getElementById(id) as T | null;
const DEMO_KEY = "demo:cplab:pressure-input";
const DEMO_INPUT: ModelInput = { arrivalRate: 900, exportCapacity: 420, queueCapacity: 1200, burstSeconds: 10 };

function isDemoMode() {
  return location.pathname.replace(/\/$/, "").startsWith("/demo") || new URLSearchParams(location.search).get("demo") === "1";
}

function updateNetworkState() {
  const banner = byId<HTMLElement>("network-state");
  if (!banner) return;
  banner.hidden = navigator.onLine;
}

function setupCopy() {
  const button = byId<HTMLButtonElement>("copy-command");
  const command = byId<HTMLElement>("install-command");
  const feedback = byId<HTMLElement>("copy-feedback");
  if (!button || !command || !feedback) return;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(command.textContent?.trim() ?? "");
      button.textContent = "Copied";
      feedback.textContent = "Install command copied to clipboard.";
    } catch {
      feedback.textContent = "Clipboard access was blocked. Select and copy the command manually.";
    }
    window.setTimeout(() => (button.textContent = "Copy command"), 1800);
  });
}

function value(id: string): number {
  const control = byId<HTMLInputElement>(id);
  if (!control) throw new Error(`Missing ${id} control`);
  return Number(control.value);
}

function paintResult(result: ModelResult) {
  const output = byId<HTMLElement>("model-output");
  const summary = byId<HTMLElement>("model-summary");
  if (!output || !summary) return;
  output.dataset.state = result.classification.toLowerCase();
  byId<HTMLElement>("classification")!.textContent = result.classification;
  byId<HTMLElement>("offered-result")!.textContent = result.offered.toLocaleString();
  byId<HTMLElement>("queue-result")!.textContent = result.queuePeak.toLocaleString();
  byId<HTMLElement>("drop-result")!.textContent = result.dropped.toLocaleString();
  byId<HTMLElement>("recovery-result")!.textContent = `${result.recoverySeconds}s`;
  const fill = byId<HTMLElement>("queue-fill")!;
  const queueCapacity = value("queue-capacity");
  fill.style.setProperty("--queue-fill", `${Math.min(100, (result.queuePeak / Math.max(1, queueCapacity)) * 100)}%`);
  fill.closest<HTMLElement>(".queue-gauge")?.setAttribute("aria-label", `Modeled queue peak: ${result.queuePeak.toLocaleString()} of ${queueCapacity.toLocaleString()} items.`);
  summary.textContent = result.classification === "Stable"
    ? `Arrival stays below modeled export capacity at ${result.utilization}% utilization.`
    : result.classification === "Backpressure"
      ? `The queue holds the extra items. It needs about ${result.recoverySeconds} seconds to drain after arrivals fall.`
      : `${result.dropped.toLocaleString()} items exceed the queue. Reduce arrival pressure or fix exporter capacity before raising limits.`;
}

function setupLab() {
  const form = byId<HTMLFormElement>("pressure-form");
  const status = byId<HTMLElement>("model-status");
  if (!form || !status) return;
  for (const control of form.querySelectorAll<HTMLInputElement>("input[type=range]")) {
    const readout = byId<HTMLOutputElement>(`${control.id}-value`);
    const update = () => {
      if (readout) readout.value = Number(control.value).toLocaleString();
      if (isDemoMode()) saveDemoInput();
    };
    control.addEventListener("input", update);
    update();
  }
  const runModel = () => {
    status.textContent = "Model running…";
    const input: ModelInput = {
      arrivalRate: value("arrival-rate"),
      exportCapacity: value("export-capacity"),
      queueCapacity: value("queue-capacity"),
      burstSeconds: value("burst-seconds"),
    };
    const delay = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;
    window.setTimeout(() => {
      try {
        const result = modelPressure(input);
        paintResult(result);
        status.textContent = `Model complete: ${result.classification}.`;
      } catch (error) {
        status.textContent = error instanceof Error ? `Could not run model: ${error.message}` : "Could not run model. Check the inputs.";
      }
    }, delay);
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runModel();
  });
  return runModel;
}

function currentInput(): ModelInput {
  return {
    arrivalRate: value("arrival-rate"),
    exportCapacity: value("export-capacity"),
    queueCapacity: value("queue-capacity"),
    burstSeconds: value("burst-seconds"),
  };
}

function saveDemoInput() {
  localStorage.setItem(DEMO_KEY, JSON.stringify(currentInput()));
}

function applyInput(input: ModelInput) {
  for (const [id, value] of Object.entries({
    "arrival-rate": input.arrivalRate,
    "export-capacity": input.exportCapacity,
    "queue-capacity": input.queueCapacity,
    "burst-seconds": input.burstSeconds,
  })) {
    const control = byId<HTMLInputElement>(id);
    if (!control) continue;
    control.value = String(value);
    control.dispatchEvent(new Event("input", { bubbles: true }));
  }
}

function setupDemo(runModel: (() => void) | undefined) {
  if (!isDemoMode() || !runModel) return;
  const banner = byId<HTMLElement>("demo-banner");
  if (banner) banner.hidden = false;
  document.body.classList.add("demo-mode");
  document.title = "Demo — Collector Pressure Lab";
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", "https://collector-pressure-lab.sociobot.in/demo");
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
    document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", "Demo — Collector Pressure Lab");
  }
  let input = DEMO_INPUT;
  try {
    const saved = localStorage.getItem(DEMO_KEY);
    if (saved) input = { ...DEMO_INPUT, ...JSON.parse(saved) } as ModelInput;
  } catch {
    localStorage.removeItem(DEMO_KEY);
  }
  applyInput(input);
  saveDemoInput();
  runModel();
  byId<HTMLButtonElement>("reset-demo")?.addEventListener("click", () => {
    localStorage.removeItem(DEMO_KEY);
    applyInput(DEMO_INPUT);
    saveDemoInput();
    runModel();
    byId<HTMLElement>("model-status")!.textContent = "Demo reset to the bundled sample.";
  });
  byId<HTMLAnchorElement>("exit-demo")?.addEventListener("click", () => localStorage.removeItem(DEMO_KEY));
}

function focusRouteTarget() {
  const hashTarget = location.hash ? document.querySelector<HTMLElement>(location.hash) : null;
  const target = hashTarget?.querySelector<HTMLElement>("h2, h1") ?? hashTarget;
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const cameFromThisSite = document.referrer.startsWith(location.origin);
  const shouldFocusHeading = isDemoMode() || location.pathname !== "/" || cameFromThisSite || navigation?.type === "back_forward";
  const focusTarget = target ?? (shouldFocusHeading ? document.querySelector<HTMLElement>("h1") : null);
  if (!focusTarget) return;
  focusTarget.tabIndex = -1;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const scrollTarget = hashTarget ?? (isDemoMode() ? byId<HTMLElement>("lab") : null);
    const bannerOffset = isDemoMode() ? (byId<HTMLElement>("demo-banner")?.offsetHeight ?? 0) + 16 : 0;
    if (scrollTarget) window.scrollTo({ top: Math.max(0, scrollTarget.offsetTop - bannerOffset), behavior: "instant" });
    focusTarget.focus({ preventScroll: true });
    byId<HTMLElement>("route-announcer")!.textContent = focusTarget.textContent?.trim() ?? document.title;
  }));
}

updateNetworkState();
window.addEventListener("online", updateNetworkState);
window.addEventListener("offline", updateNetworkState);
setupCopy();
const runModel = setupLab();
setupDemo(runModel);
window.addEventListener("load", focusRouteTarget);
window.addEventListener("pageshow", (event) => { if (event.persisted) focusRouteTarget(); });
window.addEventListener("hashchange", focusRouteTarget);

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
}

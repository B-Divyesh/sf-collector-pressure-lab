import "./style.css";
import { modelPressure, type ModelInput, type ModelResult } from "./model";

const byId = <T extends HTMLElement>(id: string): T | null => document.getElementById(id) as T | null;

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
      ? `The queue absorbs the burst and needs about ${result.recoverySeconds} seconds to drain after arrivals fall.`
      : `${result.dropped.toLocaleString()} items exceed the queue. Reduce arrival pressure or fix exporter capacity before raising limits.`;
}

function setupLab() {
  const form = byId<HTMLFormElement>("pressure-form");
  const status = byId<HTMLElement>("model-status");
  if (!form || !status) return;
  for (const control of form.querySelectorAll<HTMLInputElement>("input[type=range]")) {
    const readout = byId<HTMLOutputElement>(`${control.id}-value`);
    const update = () => { if (readout) readout.value = Number(control.value).toLocaleString(); };
    control.addEventListener("input", update);
    update();
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
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
  });
}

updateNetworkState();
window.addEventListener("online", updateNetworkState);
window.addEventListener("offline", updateNetworkState);
setupCopy();
setupLab();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
}

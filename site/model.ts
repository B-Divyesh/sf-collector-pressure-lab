export type PressureClass = "Stable" | "Backpressure" | "Drops";

export interface ModelInput {
  arrivalRate: number;
  exportCapacity: number;
  queueCapacity: number;
  burstSeconds: number;
}

export interface ModelResult {
  classification: PressureClass;
  offered: number;
  exported: number;
  queuePeak: number;
  dropped: number;
  recoverySeconds: number;
  utilization: number;
}

export function modelPressure(input: ModelInput): ModelResult {
  for (const [name, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be a non-negative number`);
  }
  if (input.exportCapacity <= 0) throw new Error("Exporter capacity must be above zero");

  const offered = Math.round(input.arrivalRate * input.burstSeconds);
  const directExport = Math.min(input.arrivalRate, input.exportCapacity) * input.burstSeconds;
  const excess = Math.max(0, offered - directExport);
  const queuePeak = Math.min(input.queueCapacity, excess);
  const dropped = Math.max(0, Math.round(excess - input.queueCapacity));
  const classification: PressureClass = dropped > 0 ? "Drops" : queuePeak > 0 ? "Backpressure" : "Stable";

  return {
    classification,
    offered,
    exported: Math.round(offered - dropped),
    queuePeak: Math.round(queuePeak),
    dropped,
    recoverySeconds: Number((queuePeak / input.exportCapacity).toFixed(1)),
    utilization: Math.round((input.arrivalRate / input.exportCapacity) * 100),
  };
}

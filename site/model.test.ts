import { describe, expect, it } from "vitest";
import { modelPressure } from "./model";

describe("offline pressure model", () => {
  it("classifies capacity headroom as stable", () => {
    expect(modelPressure({ arrivalRate: 400, exportCapacity: 500, queueCapacity: 1000, burstSeconds: 5 }).classification).toBe("Stable");
  });

  it("classifies a recoverable queue as backpressure", () => {
    const result = modelPressure({ arrivalRate: 600, exportCapacity: 400, queueCapacity: 1200, burstSeconds: 5 });
    expect(result.classification).toBe("Backpressure");
    expect(result.queuePeak).toBe(1000);
    expect(result.dropped).toBe(0);
  });

  it("classifies overflow as drops", () => {
    const result = modelPressure({ arrivalRate: 900, exportCapacity: 300, queueCapacity: 600, burstSeconds: 4 });
    expect(result.classification).toBe("Drops");
    expect(result.dropped).toBe(1800);
  });
});

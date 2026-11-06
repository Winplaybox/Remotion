import { ENGINE_REGISTRY, resolveEngine } from "../packages/core/src/engine-registry";
describe("engine registry", () => {
  it("registers all three engines with unique compositions and output paths", () => {
    const engines = Object.values(ENGINE_REGISTRY);
    expect(engines).toHaveLength(3);
    expect(new Set(engines.map((engine) => engine.compositionId)).size).toBe(3);
    expect(new Set(engines.map((engine) => engine.outputFile)).size).toBe(3);
    expect(engines.every((engine) => engine.durationFrames > 0)).toBe(true);
  });
  it("rejects unknown engine IDs", () => { expect(() => resolveEngine("unknown")).toThrow("Unknown engine"); });
});

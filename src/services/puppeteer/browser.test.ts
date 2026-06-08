import { describe, it, expect, vi, afterEach } from "vitest";

describe("browser", () => {
  afterEach(async () => {
    try {
      const mod = await import("./browser");
      await mod.closeBrowser();
    } catch {
      // ignore
    }
  });

  it("should have exported functions", async () => {
    const mod = await import("./browser");
    expect(typeof mod.getBrowser).toBe("function");
    expect(typeof mod.closeBrowser).toBe("function");
  });
});

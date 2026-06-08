import { describe, it, expect, vi } from "vitest";

// Mock turkishFetch
vi.mock("@/lib/turkishFetch", () => ({
  getMunicipality: vi.fn((key: string) => {
    if (key.toLocaleLowerCase("tr") === "eyupsultan") {
      return {
        key: "eyupsultan",
        name: "Eyüpsultan Belediyesi",
        baseUrl: "https://keos.eyupsultan.bel.tr",
        serviceUrl: "https://keos.eyupsultan.bel.tr/api",
        detailUrl: "https://keos.eyupsultan.bel.tr/detail",
        refererUrl: "https://keos.eyupsultan.bel.tr",
      };
    }
    return undefined;
  }),
}));

// Mock browser - always reject in tests
vi.mock("@/services/puppeteer/browser", () => ({
  getBrowser: vi.fn().mockRejectedValue(new Error("Browser not available in test")),
  closeBrowser: vi.fn(),
}));

describe("mahallelerScraper", () => {
  it("should throw when browser fails", async () => {
    const { getMahallelerViaPuppeteer } = await import("./mahallelerScraper");
    await expect(getMahallelerViaPuppeteer("eyupsultan")).rejects.toThrow(
      "Browser not available in test"
    );
  });

  it("should handle municipality key normalization before failing", async () => {
    const { getMahallelerViaPuppeteer } = await import("./mahallelerScraper");
    // Should pass municipality check, then fail on browser
    await expect(getMahallelerViaPuppeteer("EYUPSULTAN")).rejects.toThrow(
      "Browser not available in test"
    );
  });

  it("should throw for unknown municipality", async () => {
    const { getMahallelerViaPuppeteer } = await import("./mahallelerScraper");
    await expect(getMahallelerViaPuppeteer("unknown")).rejects.toThrow(
      "Belediye bulunamadı"
    );
  });
});

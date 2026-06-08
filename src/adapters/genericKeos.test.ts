import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GenericKeosScraper } from "./genericKeos";

// Mock turkishFetch
vi.mock("@/lib/turkishFetch", () => ({
  getMunicipality: vi.fn((key: string) => {
    if (key === "pendik") {
      return {
        key: "pendik",
        name: "Pendik Belediyesi",
        baseUrl: "https://keos.pendik.bel.tr",
        serviceUrl: "https://keos.pendik.bel.tr/api",
        detailUrl: "https://keos.pendik.bel.tr/detail",
        refererUrl: "https://keos.pendik.bel.tr",
      };
    }
    return undefined;
  }),
  searchParcelFor: vi.fn(),
  getMahallelerFor: vi.fn(),
}));

describe("GenericKeosScraper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create scraper with correct municipality", () => {
    const scraper = new GenericKeosScraper("pendik");
    expect(scraper.municipality).toBe("pendik");
  });

  it("should handle Turkish locale in constructor", () => {
    const scraper = new GenericKeosScraper("PENDIK");
    // In Turkish locale, "I" -> "ı" not "i", so "PENDIK" -> "pendık"
    expect(scraper.municipality).toBe("pendık");
  });

  it("should return searchUrl from config", () => {
    const scraper = new GenericKeosScraper("pendik");
    expect(scraper.searchUrl).toBe("https://keos.pendik.bel.tr");
  });

  it("should handle unsupported query types", async () => {
    const scraper = new GenericKeosScraper("pendik");
    const result = await scraper.scrape({
      municipality: "pendik",
      query: "test",
      queryType: "neighborhood",
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Desteklenmeyen sorgu tipi");
  });
});

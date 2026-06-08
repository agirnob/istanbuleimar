import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { registerScraper, getScraper, getAvailableMunicipalities, resetRegistry } from "./registry";
import { BaseScraper } from "./base";
import { ScrapeQuery, ScrapeResult } from "@/types/parcel";

class MockScraper extends BaseScraper {
  municipality = "mock";
  searchUrl = "https://mock.com";
  protected async buildRequest(_query: ScrapeQuery): Promise<ScrapeResult> {
    return { success: true, parcels: [] };
  }
}

describe("Scraper Registry", () => {
  beforeEach(() => {
    resetRegistry();
  });

  afterEach(() => {
    resetRegistry();
  });

  it("should register and retrieve a scraper", () => {
    const scraper = new MockScraper();
    registerScraper(scraper);
    expect(getScraper("mock")).toBe(scraper);
  });

  it("should handle Turkish locale case insensitivity", () => {
    const scraper = new MockScraper();
    scraper.municipality = "İstanbul";
    registerScraper(scraper);
    expect(getScraper("İstanbul")).toBe(scraper);
    expect(getScraper("istanbul")).toBe(scraper);
    expect(getScraper("İSTANBUL")).toBe(scraper);
  });

  it("should return undefined for unknown municipality", () => {
    expect(getScraper("unknown")).toBeUndefined();
  });

  it("should list available municipalities", () => {
    const scraper1 = new MockScraper();
    scraper1.municipality = "test1";
    registerScraper(scraper1);

    const scraper2 = new MockScraper();
    scraper2.municipality = "test2";
    registerScraper(scraper2);

    const available = getAvailableMunicipalities();
    expect(available).toContain("test1");
    expect(available).toContain("test2");
    expect(available.length).toBe(2);
  });

  it("should allow registry reset for test isolation", () => {
    const scraper = new MockScraper();
    registerScraper(scraper);
    expect(getAvailableMunicipalities().length).toBe(1);

    resetRegistry();
    expect(getAvailableMunicipalities().length).toBe(0);
    expect(getScraper("mock")).toBeUndefined();
  });

  it("should handle Turkish I/i distinction correctly", () => {
    const scraper = new MockScraper();
    scraper.municipality = "Istanbul";
    registerScraper(scraper);

    // In Turkish locale, "I".toLocaleLowerCase("tr") = "ı" not "i"
    // So "Istanbul" becomes "ıstanbul" in Turkish locale
    expect(getScraper("Istanbul")).toBe(scraper);
    expect(getScraper("ıstanbul")).toBe(scraper);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { registerScraper, getScraper, getAvailableMunicipalities } from "./registry";
import { BaseScraper } from "./base";

class DummyScraper extends BaseScraper {
  municipality = "dummy";
  searchUrl = "https://dummy.com";
  protected async buildRequest() {
    return { success: true, parcels: [] };
  }
}

describe("ScraperRegistry", () => {
  beforeEach(() => {
    (globalThis as any).__registryReset = true;
  });

  it("should register and retrieve a scraper", () => {
    const scraper = new DummyScraper();
    registerScraper(scraper);
    const found = getScraper("dummy");
    expect(found).toBe(scraper);
  });

  it("should be case-insensitive", () => {
    const scraper = new DummyScraper();
    registerScraper(scraper);
    expect(getScraper("DUMMY")).toBe(scraper);
    expect(getScraper("Dummy")).toBe(scraper);
  });

  it("should return undefined for non-existent municipality", () => {
    expect(getScraper("nonexistent")).toBeUndefined();
  });

  it("should list available municipalities", () => {
    const scraper = new DummyScraper();
    registerScraper(scraper);
    const list = getAvailableMunicipalities();
    expect(list).toContain("dummy");
  });
});

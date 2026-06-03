import { describe, it, expect, vi, beforeEach } from "vitest";
import { EyupsultanScraper } from "./eyupsultan";

vi.setConfig({ testTimeout: 15000 });

describe("EyupsultanScraper", () => {
  let scraper: EyupsultanScraper;

  beforeEach(() => {
    scraper = new EyupsultanScraper();
  });

  it("should have correct municipality name", () => {
    expect(scraper.municipality).toBe("eyupsultan");
  });

  it("should have correct search URL", () => {
    expect(scraper.searchUrl).toContain("keos.eyupsultan.bel.tr");
    expect(scraper.searchUrl).toContain("imardurumu");
  });

  it("should return valid detail URL", () => {
    const url = scraper.getDetailUrl(8125);
    expect(url).toBe("https://keos.eyupsultan.bel.tr/imardurumu/imar.aspx?parselid=8125");
  });

  it("should search for parcel with ada/parsel format", async () => {
    const result = await scraper.scrape({
      municipality: "eyupsultan",
      query: "1/1",
      queryType: "parcel",
    });

    expect(result.success).toBe(true);
    expect(result.parcels.length).toBeGreaterThan(0);
    expect(result.parcels[0]).toHaveProperty("parcelNo");
    expect(result.parcels[0]).toHaveProperty("municipality", "eyupsultan");
    expect(result.parcels[0]).toHaveProperty("sourceUrl");
  });

  it("should return empty array for non-existent parcel", async () => {
    const result = await scraper.scrape({
      municipality: "eyupsultan",
      query: "99999/99999",
      queryType: "parcel",
    });

    expect(result.success).toBe(true);
    expect(result.parcels).toEqual([]);
  });

  it("should parse ada and parsel from ADAPARSEL field", async () => {
    const result = await scraper.scrape({
      municipality: "eyupsultan",
      query: "1/1",
      queryType: "parcel",
    });

    if (result.parcels.length > 0) {
      const parcel = result.parcels[0];
      expect(parcel.block).toBeDefined();
      expect(parcel.plotNo).toBeDefined();
    }
  });

  it("should include neighborhood info", async () => {
    const result = await scraper.scrape({
      municipality: "eyupsultan",
      query: "1/1",
      queryType: "parcel",
    });

    if (result.parcels.length > 0) {
      expect(result.parcels[0].neighborhood).toBeDefined();
    }
  });

  it("should handle multiple results for same ada/parsel across neighborhoods", async () => {
    const result = await scraper.scrape({
      municipality: "eyupsultan",
      query: "100/1",
      queryType: "parcel",
    });

    expect(result.success).toBe(true);
    expect(result.parcels.length).toBeGreaterThan(0);
  });

  it("should get neighborhoods list", async () => {
    const neighborhoods = await scraper.getNeighborhoods();
    expect(Array.isArray(neighborhoods)).toBe(true);
    expect(neighborhoods.length).toBeGreaterThan(0);
    expect(neighborhoods).toContain("AKPINAR");
  });

  it("should get tapu mahalleleri with KEMERBURGAZ", async () => {
    const tapuMahalleleri = await scraper.getTapuMahalleleri();
    expect(tapuMahalleleri).toContain("KEMERBURGAZ");
  });

  it("should get tapu mahalleleri list", async () => {
    const tapuMahalleleri = await scraper.getTapuMahalleleri();
    expect(Array.isArray(tapuMahalleleri)).toBe(true);
    expect(tapuMahalleleri.length).toBeGreaterThan(0);
  });

  it("should handle network errors gracefully", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await scraper.scrape({
      municipality: "eyupsultan",
      query: "1/1",
      queryType: "parcel",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Network error");

    global.fetch = originalFetch;
  });

  it("should handle HTTP errors", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const result = await scraper.scrape({
      municipality: "eyupsultan",
      query: "1/1",
      queryType: "parcel",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("500");

    global.fetch = originalFetch;
  });

  it("should get parcel detail", async () => {
    const detail = await scraper.getParcelDetail(8125);
    expect(detail.success).toBe(true);
    expect(detail.data).toBeDefined();
    expect(detail.data?.basic).toHaveProperty("parcelNo");
  });

  it("should return error for non-existent parcel detail", async () => {
    const detail = await scraper.getParcelDetail(99999999);
    expect(detail.success).toBe(false);
    expect(detail.error).toBeDefined();
  });
});

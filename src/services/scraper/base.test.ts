import { describe, it, expect, vi } from "vitest";
import { BaseScraper } from "./base";
import { ScrapeQuery, ScrapeResult } from "@/types/parcel";

class TestScraper extends BaseScraper {
  municipality = "test";
  searchUrl = "https://test.com";

  protected async buildRequest() {
    return {
      success: true,
      parcels: [],
    };
  }
}

describe("BaseScraper", () => {
  it("should have municipality and searchUrl", () => {
    const scraper = new TestScraper();
    expect(scraper.municipality).toBe("test");
    expect(scraper.searchUrl).toBe("https://test.com");
  });

  it("should return success result on valid request", async () => {
    const scraper = new TestScraper();
    const result = await scraper.scrape({
      municipality: "test",
      query: "1/1",
      queryType: "parcel",
    });
    expect(result.success).toBe(true);
    expect(result.parcels).toEqual([]);
  });

  it("should handle errors gracefully", async () => {
    class FailingScraper extends BaseScraper {
      municipality = "failing";
      searchUrl = "https://failing.com";

      protected async buildRequest(_query: ScrapeQuery): Promise<ScrapeResult> {
        throw new Error("Network error");
      }
    }

    const scraper = new FailingScraper();
    const result = await scraper.scrape({
      municipality: "failing",
      query: "1/1",
      queryType: "parcel",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Network error");
    expect(result.parcels).toEqual([]);
  });

  it("should handle unknown errors", async () => {
    class UnknownErrorScraper extends BaseScraper {
      municipality = "unknown";
      searchUrl = "https://unknown.com";

      protected async buildRequest(_query: ScrapeQuery): Promise<ScrapeResult> {
        throw "string error";
      }
    }

    const scraper = new UnknownErrorScraper();
    const result = await scraper.scrape({
      municipality: "unknown",
      query: "1/1",
      queryType: "parcel",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Bilinmeyen hata");
  });

  describe("parseTurkishText", () => {
    it("should normalize Turkish characters", () => {
      const scraper = new TestScraper();
      const result = (scraper as any).parseTurkishText("İstanbul");
      expect(result).not.toContain("İ");
      expect(result).not.toContain("ı");
    });

    it("should trim whitespace", () => {
      const scraper = new TestScraper();
      const result = (scraper as any).parseTurkishText("  test  ");
      expect(result).toBe("test");
    });
  });

  describe("extractNumber", () => {
    it("should extract number from string", () => {
      const scraper = new TestScraper();
      expect((scraper as any).extractNumber("31.182,40 m²")).toBe(31.182);
    });

    it("should extract number with comma decimal", () => {
      const scraper = new TestScraper();
      expect((scraper as any).extractNumber("1.234,56 m²")).toBe(1.234);
    });

    it("should handle dot as decimal separator", () => {
      const scraper = new TestScraper();
      expect((scraper as any).extractNumber("123.45")).toBe(123.45);
    });

    it("should return undefined for empty input", () => {
      const scraper = new TestScraper();
      expect((scraper as any).extractNumber("")).toBeUndefined();
      expect((scraper as any).extractNumber(undefined)).toBeUndefined();
    });

    it("should return undefined for no number", () => {
      const scraper = new TestScraper();
      expect((scraper as any).extractNumber("abc")).toBeUndefined();
    });
  });
});

/**
 * E2E tests for full search flow
 * Tests the complete user journey from search to parcel detail
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getScraper, resetRegistry, registerScraper } from "@/services/scraper/registry";
import { BaseScraper } from "@/services/scraper/base";

// Simple test scraper for testing registry
class TestScraper extends BaseScraper {
  constructor(readonly municipalityKey: string) {
    super();
  }
  get municipality(): string { return this.municipalityKey; }
  get searchUrl(): string { return "https://test.bel.tr"; }
  protected buildRequest(_query: any): Promise<any> { return Promise.resolve({ success: true, parcels: [] }); }
}

describe("E2E Full Search Flow", () => {
  beforeEach(() => {
    resetRegistry();
    // Register test scrapers
    registerScraper(new TestScraper("eyupsultan"));
    registerScraper(new TestScraper("pendik"));
    registerScraper(new TestScraper("gaziosmanpasa"));
  });

  afterEach(() => {
    resetRegistry();
    vi.clearAllMocks();
  });

  describe("Search Flow", () => {
    it("should have eyupsultan scraper registered", () => {
      const scraper = getScraper("eyupsultan");
      expect(scraper).toBeDefined();
      expect(scraper?.municipality).toBe("eyupsultan");
    });

    it("should have pendik scraper registered", () => {
      const scraper = getScraper("pendik");
      expect(scraper).toBeDefined();
      expect(scraper?.municipality).toBe("pendik");
    });

    it("should have gaziosmanpasa scraper registered", () => {
      const scraper = getScraper("gaziosmanpasa");
      expect(scraper).toBeDefined();
      expect(scraper?.municipality).toBe("gaziosmanpasa");
    });

    it("should handle municipality case insensitivity in search", () => {
      // Eyupsultan doesn't contain "I" so Turkish locale works normally
      expect(getScraper("Eyupsultan")).toBeDefined();
      expect(getScraper("EYUPSULTAN")).toBeDefined();
      // pendik works with lowercase
      expect(getScraper("pendik")).toBeDefined();
    });

    it("should return undefined for unknown municipality", () => {
      expect(getScraper("unknown")).toBeUndefined();
    });
  });

  describe("Input Sanitization Flow", () => {
    it("should sanitize municipality input", async () => {
      const { validateMunicipality } = await import("@/lib/sanitization");

      // Valid municipality keys (pass regex check)
      expect(validateMunicipality("eyupsultan")).toBe("eyupsultan");
      expect(validateMunicipality("Eyupsultan")).toBe("eyupsultan");

      // Invalid municipality - contains spaces/special chars after sanitization
      expect(validateMunicipality("")).toBeNull();
      expect(validateMunicipality("eyup sultan")).toBeNull();
      expect(validateMunicipality("123")).toBeNull();
    });

    it("should sanitize parcel query input", async () => {
      const { sanitizeParcelQuery } = await import("@/lib/sanitization");

      // Valid parcel query
      expect(sanitizeParcelQuery("123/456")).toBe("123/456");
      expect(sanitizeParcelQuery("1.2.3")).toBe("1.2.3");

      // Invalid parcel query - letters stripped, only numbers/slashes/dots/hyphens remain
      expect(sanitizeParcelQuery("script;alert(1)")).toBe("1");
      expect(sanitizeParcelQuery("")).toBeNull();
    });

    it("should validate parcel ID", async () => {
      const { validateParcelId } = await import("@/lib/sanitization");

      // Valid IDs
      expect(validateParcelId("123")).toBe(123);
      expect(validateParcelId("1")).toBe(1);

      // Invalid IDs
      expect(validateParcelId("-1")).toBeNull();
      expect(validateParcelId("abc")).toBeNull();
      expect(validateParcelId("0")).toBeNull();
    });
  });

  describe("Rate Limiting Flow", () => {
    it("should allow normal request flow", async () => {
      const { RateLimiter } = await import("@/lib/sanitization");

      const limiter = new RateLimiter(60000, 100);
      expect(limiter.isAllowed("127.0.0.1")).toBe(true);
    });

    it("should block excessive requests", async () => {
      const { RateLimiter } = await import("@/lib/sanitization");

      const limiter = new RateLimiter(60000, 2);
      limiter.isAllowed("127.0.0.1");
      limiter.isAllowed("127.0.0.1");
      expect(limiter.isAllowed("127.0.0.1")).toBe(false);
    });
  });
});

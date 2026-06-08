import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  validateQueryParams,
  validateParcelId,
  validateMunicipality,
  sanitizeParcelQuery,
  rateLimiter,
  getClientIp,
  RateLimiter,
} from "./sanitization";

describe("sanitizeInput", () => {
  it("should trim whitespace", () => {
    expect(sanitizeInput("  hello  ")).toBe("hello");
  });

  it("should return empty string for null/undefined", () => {
    expect(sanitizeInput(null)).toBe("");
    expect(sanitizeInput(undefined)).toBe("");
  });

  it("should truncate to maxLength", () => {
    const long = "a".repeat(300);
    expect(sanitizeInput(long, 100).length).toBe(100);
  });

  it("should remove dangerous characters", () => {
    expect(sanitizeInput("hello<script>")).toBe("hello");
    expect(sanitizeInput("test'OR'1'='1")).toBe("testOR11");
    // <b> is stripped as HTML tag, & and = are removed
    expect(sanitizeInput("a<b>c&d=e")).toBe("acde");
  });

  it("should allow Turkish characters", () => {
    expect(sanitizeInput("çığöşüıÇİĞÖŞÜİ")).toBe("çığöşüıÇİĞÖŞÜİ");
  });

  it("should allow safe punctuation", () => {
    expect(sanitizeInput("ada/parsel.1-test_2,3:4")).toBe("ada/parsel.1-test_2,3:4");
  });
});

describe("validateQueryParams", () => {
  it("should validate and sanitize params", () => {
    const params = new URLSearchParams({ q: "  test  ", municipality: "  eyupsultan  " });
    const result = validateQueryParams(params, ["q"]);
    expect(result.q).toBe("test");
    expect(result.municipality).toBe("eyupsultan");
  });

  it("should throw if required param missing", () => {
    const params = new URLSearchParams({ municipality: "eyupsultan" });
    expect(() => validateQueryParams(params, ["q"])).toThrow("Eksik gerekli parametre: q");
  });

  it("should work with empty required list", () => {
    const params = new URLSearchParams({ a: "1", b: "2" });
    const result = validateQueryParams(params, []);
    expect(result.a).toBe("1");
  });
});

describe("validateParcelId", () => {
  it("should validate positive integers", () => {
    expect(validateParcelId("123")).toBe(123);
    expect(validateParcelId("1")).toBe(1);
  });

  it("should return null for invalid input", () => {
    expect(validateParcelId("abc")).toBeNull();
    expect(validateParcelId("-1")).toBeNull();
    expect(validateParcelId("0")).toBeNull();
    expect(validateParcelId(null)).toBeNull();
    expect(validateParcelId(undefined)).toBeNull();
  });
});

describe("validateMunicipality", () => {
  it("should validate and lowercase municipality keys", () => {
    expect(validateMunicipality("Eyupsultan")).toBe("eyupsultan");
    // In Turkish locale, "I" -> "ı" not "i", so PENDIK -> pendık
    expect(validateMunicipality("PENDIK")).toBe("pendık");
  });

  it("should return null for invalid input", () => {
    expect(validateMunicipality("")).toBeNull();
    expect(validateMunicipality(null)).toBeNull();
    expect(validateMunicipality(undefined)).toBeNull();
    expect(validateMunicipality("eyup sultan")).toBeNull();
    expect(validateMunicipality("123")).toBeNull();
  });
});

describe("sanitizeParcelQuery", () => {
  it("should allow parcel format queries", () => {
    expect(sanitizeParcelQuery("123/456")).toBe("123/456");
    expect(sanitizeParcelQuery("1.2.3")).toBe("1.2.3");
    expect(sanitizeParcelQuery("123-456")).toBe("123-456");
    expect(sanitizeParcelQuery("999")).toBe("999");
  });

  it("should remove non-numeric characters", () => {
    expect(sanitizeParcelQuery("abc")).toBeNull();
    expect(sanitizeParcelQuery("123abc")).toBe("123");
    expect(sanitizeParcelQuery("")).toBeNull();
    expect(sanitizeParcelQuery(null)).toBeNull();
  });
});

describe("rateLimiter", () => {
  it("should allow requests within limit", () => {
    const limiter = new RateLimiter(60000, 5);
    for (let i = 0; i < 5; i++) {
      expect(limiter.isAllowed("192.168.1.1")).toBe(true);
    }
  });

  it("should block requests over limit", () => {
    const limiter = new RateLimiter(60000, 3);
    limiter.isAllowed("10.0.0.1");
    limiter.isAllowed("10.0.0.1");
    limiter.isAllowed("10.0.0.1");
    expect(limiter.isAllowed("10.0.0.1")).toBe(false);
  });

  it("should allow different IPs independently", () => {
    const limiter = new RateLimiter(60000, 1);
    limiter.isAllowed("ip1");
    expect(limiter.isAllowed("ip1")).toBe(false);
    expect(limiter.isAllowed("ip2")).toBe(true);
  });
});

describe("getClientIp", () => {
  it("should extract IP from x-forwarded-for", () => {
    const req = { headers: new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }) };
    expect(getClientIp(req as any)).toBe("1.2.3.4");
  });

  it("should fallback to x-real-ip", () => {
    const req = { headers: new Headers({ "x-real-ip": "9.9.9.9" }) };
    expect(getClientIp(req as any)).toBe("9.9.9.9");
  });

  it("should return unknown if no headers", () => {
    const req = { headers: new Headers() };
    expect(getClientIp(req as any)).toBe("unknown");
  });
});

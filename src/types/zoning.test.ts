import { describe, it, expect } from "vitest";
import { parseDMSToDecimal } from "@/types/zoning";

describe("parseDMSToDecimal", () => {
  it("should parse N/E coordinates", () => {
    const result = parseDMSToDecimal(
      '41°6\'23.241" N  28°55\'16.425" E'
    );
    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(41.106456, 4);
    expect(result!.lng).toBeCloseTo(28.921229, 4);
  });

  it("should parse S/W coordinates", () => {
    const result = parseDMSToDecimal(
      '34°0\'0.0" S  18°0\'0.0" W'
    );
    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(-34.0, 4);
    expect(result!.lng).toBeCloseTo(-18.0, 4);
  });

  it("should return null for invalid input", () => {
    expect(parseDMSToDecimal("")).toBeNull();
    expect(parseDMSToDecimal("invalid")).toBeNull();
    expect(parseDMSToDecimal("41.123, 28.456")).toBeNull();
  });

  it("should handle zero minutes/seconds", () => {
    const result = parseDMSToDecimal(
      '41°0\'0.0" N  28°0\'0.0" E'
    );
    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(41.0, 4);
    expect(result!.lng).toBeCloseTo(28.0, 4);
  });

  it("should handle real Eyupsultan coordinates", () => {
    const result = parseDMSToDecimal(
      '41°5\'27.536" N  28°55\'16.895" E'
    );
    expect(result).not.toBeNull();
    expect(result!.lat).toBeGreaterThan(41.0);
    expect(result!.lat).toBeLessThan(42.0);
    expect(result!.lng).toBeGreaterThan(28.0);
    expect(result!.lng).toBeLessThan(29.0);
  });
});
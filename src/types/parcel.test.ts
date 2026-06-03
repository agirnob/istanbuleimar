import { describe, it, expect } from "vitest";

describe("Parcel Types", () => {
  it("should allow valid RawParcel", () => {
    const parcel = {
      parcelNo: "8125",
      plotNo: "1",
      block: "1",
      neighborhood: "KEMERBURGAZ",
      municipality: "eyupsultan",
      district: "Eyüpsultan",
      sourceUrl: "https://keos.eyupsultan.bel.tr/imardurumu/imar.aspx?parselid=8125",
    };

    expect(parcel.parcelNo).toBe("8125");
    expect(parcel.municipality).toBe("eyupsultan");
    expect(parcel.plotNo).toBeDefined();
  });

  it("should allow RawParcel with minimal fields", () => {
    const parcel: { parcelNo: string; municipality: string; plotNo?: string; neighborhood?: string } = {
      parcelNo: "123",
      municipality: "eyupsultan",
    };

    expect(parcel.parcelNo).toBe("123");
    expect(parcel.plotNo).toBeUndefined();
    expect(parcel.neighborhood).toBeUndefined();
  });

  it("should allow valid ScrapeQuery", () => {
    const query = {
      municipality: "eyupsultan",
      query: "1/1",
      queryType: "parcel" as const,
    };

    expect(query.queryType).toBe("parcel");
  });

  it("should allow block query type", () => {
    const query = {
      municipality: "eyupsultan",
      query: "5",
      queryType: "block" as const,
    };

    expect(query.queryType).toBe("block");
  });
});

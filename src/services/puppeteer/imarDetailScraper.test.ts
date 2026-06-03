import { describe, it, expect } from "vitest";
import { scrapeImarDetail } from "./imarDetailScraper";

describe("imarDetailScraper", () => {
  it("should scrape detail data for eyupsultan parcel 8125", async () => {
    const result = await scrapeImarDetail(8125, "eyupsultan");

    expect(result.error).toBeUndefined();
    expect(result.planInfo).toBeDefined();
    expect(result.planInfo?.mahalle).toBe("KEMERBURGAZ");
    expect(result.planInfo?.ilce).toBe("EYÜPSULTAN");
    expect(result.planInfo?.olcek).toBeDefined();
  }, 30000);

  it("should scrape detail data for eyupsultan parcel 14953", async () => {
    const result = await scrapeImarDetail(14953, "eyupsultan");

    expect(result.error).toBeUndefined();
    expect(result.planInfo).toBeDefined();
    expect(result.planInfo?.fonksiyon).toBeDefined();
    expect(result.planInfo?.tasdikTarihi).toBeDefined();
  }, 30000);

  it("should handle non-existent parcel gracefully", async () => {
    const result = await scrapeImarDetail(99999999, "eyupsultan");

    expect(result).toBeDefined();
  }, 30000);

  it("should parse GPS coordinates from kadastro info", async () => {
    const result = await scrapeImarDetail(8125, "eyupsultan");

    expect(result.kadastroInfo).toBeDefined();
    expect(result.kadastroInfo?.kartezyenKoordinat).toBeDefined();
    expect(result.kadastroInfo?.cografiKoordinat).toBeDefined();
    expect(result.kadastroInfo?.lat).toBeDefined();
    expect(result.kadastroInfo?.lng).toBeDefined();
    expect(result.kadastroInfo?.lat).toBeGreaterThan(41.0);
    expect(result.kadastroInfo?.lat).toBeLessThan(42.0);
    expect(result.kadastroInfo?.lng).toBeGreaterThan(28.0);
    expect(result.kadastroInfo?.lng).toBeLessThan(29.0);
  }, 30000);

  it("should capture map canvas screenshot", async () => {
    const result = await scrapeImarDetail(8125, "eyupsultan");

    expect(result.mapImage).toBeDefined();
    expect(typeof result.mapImage).toBe("string");
    expect(result.mapImage).toMatch(/^data:image\/png;base64,/);
  }, 30000);

  it("should scrape pendik parcel 12450", async () => {
    const result = await scrapeImarDetail(12450, "pendik");

    expect(result.error).toBeUndefined();
    expect(result.planInfo).toBeDefined();
    expect(result.planInfo?.mahalle).toBeDefined();
  }, 30000);

  it("should scrape gaziosmanpasa parcel 4819", async () => {
    const result = await scrapeImarDetail(4819, "gaziosmanpasa");

    expect(result.error).toBeUndefined();
    expect(result.planInfo).toBeDefined();
    expect(result.planInfo?.mahalle).toBeDefined();
  }, 30000);
});
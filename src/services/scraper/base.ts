import { RawParcel, ScrapeQuery, ScrapeResult } from "@/types/parcel";

export abstract class BaseScraper {
  abstract municipality: string;
  abstract searchUrl: string;

  protected abstract buildRequest(query: ScrapeQuery): Promise<ScrapeResult>;

  public async scrape(query: ScrapeQuery): Promise<ScrapeResult> {
    try {
      const result = await this.buildRequest(query);
      return result;
    } catch (error) {
      return {
        success: false,
        parcels: [],
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      };
    }
  }

  protected parseTurkishText(text: string): string {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  protected extractNumber(text: string): number | undefined {
    if (!text) return undefined;
    const match = text.match(/(\d+([.,]\d+)?)/);
    return match ? parseFloat(match[1].replace(",", ".")) : undefined;
  }
}

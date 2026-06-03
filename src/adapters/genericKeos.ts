import { BaseScraper } from "@/services/scraper/base";
import { ScrapeQuery, ScrapeResult, RawParcel } from "@/types/parcel";
import { getMunicipality, searchParcelFor, getParcelInfoFor } from "@/lib/turkishFetch";

export class GenericKeosScraper extends BaseScraper {
  readonly municipalityKey: string;
  readonly config: NonNullable<ReturnType<typeof getMunicipality>>;

  constructor(municipalityKey: string) {
    super();
    this.municipalityKey = municipalityKey.toLowerCase();
    this.config = getMunicipality(this.municipalityKey)!;
  }

  get municipality(): string {
    return this.municipalityKey;
  }

  get searchUrl(): string {
    return this.config.baseUrl;
  }

  protected async buildRequest(query: ScrapeQuery): Promise<ScrapeResult> {
    if (query.queryType === "parcel" || query.queryType === "block") {
      return this.searchParcel(query.query);
    }
    return { success: false, parcels: [], error: "Desteklenmeyen sorgu tipi" };
  }

  private async searchParcel(query: string): Promise<ScrapeResult> {
    console.log(`[GenericKeosScraper:${this.municipalityKey}] Searching: "${query}"`);
    try {
      const data = await searchParcelFor(this.config, query);
      console.log(`[GenericKeosScraper:${this.municipalityKey}] Found ${data.length} results`);

      const parcels: RawParcel[] = data.map((item) => {
        const [ada, parsel] = item.ADAPARSEL.split("/").map((s) => s.trim());
        return {
          parcelNo: String(item.OBJECTID),
          plotNo: parsel || undefined,
          block: ada || undefined,
          neighborhood: item.TAPU_MAH_ADI || undefined,
          municipality: this.municipalityKey,
          district: this.config.name,
          sourceUrl: `${this.config.detailUrl}?parselid=${item.OBJECTID}`,
        };
      });

      return { success: true, parcels, sourceUrl: this.config.baseUrl };
    } catch (error) {
      return {
        success: false,
        parcels: [],
        error: error instanceof Error ? error.message : "Parsel sorgu hatası",
      };
    }
  }

  async getParcelDetail(parcelId: number): Promise<{
    success: boolean;
    data?: { basic: RawParcel };
    error?: string;
  }> {
    console.log(`[GenericKeosScraper:${this.municipalityKey}] Detail for ${parcelId}`);
    try {
      const data = await getParcelInfoFor(this.config, parcelId);
      if (!data.length) {
        return { success: false, error: "Parsel bulunamadı" };
      }
      const item = data[0];
      const [ada, parsel] = item.ADAPARSEL.split("/").map((s) => s.trim());
      return {
        success: true,
        data: {
          basic: {
            parcelNo: String(item.OBJECTID),
            plotNo: parsel || undefined,
            block: ada || undefined,
            neighborhood: item.TAPU_MAH_ADI || undefined,
            municipality: this.municipalityKey,
            district: this.config.name,
            sourceUrl: `${this.config.detailUrl}?parselid=${item.OBJECTID}`,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Detay alınamadı",
      };
    }
  }

  getDetailUrl(parcelId: number): string {
    return `${this.config.detailUrl}?parselid=${parcelId}`;
  }
}

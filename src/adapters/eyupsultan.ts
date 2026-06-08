import { BaseScraper } from "@/services/scraper/base";
import { ScrapeQuery, ScrapeResult, RawParcel } from "@/types/parcel";
import { searchParcelFor, getParcelInfoFor, getMahallelerFor, getMunicipality, getTapuMahalleleriFor } from "@/lib/turkishFetch";

const IMAR_BASE = "https://keos.eyupsultan.bel.tr/imardurumu";
const SERVICE_URL = `${IMAR_BASE}/service/imarsvc.aspx`;

interface ImarSearchResult {
  ADAPARSEL: string;
  TAPU_MAH_ADI: string;
  ADA: string;
  OBJECTID: number;
}

interface ImarDetailPlan {
  planAdi: string;
  fonksiyon: string;
  tasdikTarihi: string;
  olcek: string;
  ilce: string;
  mahalle: string;
  pafta: string;
  parsel: string;
  hesapAlani: string;
  binaYuksekligi: string;
  onBahce: string;
  yanBahce: string;
  arkaBahce: string;
  binaDerinligi: string;
  katAdedi: string;
  inaatNizami: string;
  taks: string;
  kaks: string;
  kotAlinacakNokta: string;
  aciklama: string;
  kisitlama: string;
  tadilatAciklama: string;
}

interface ImarDetailKadastro {
  projeksiyon: string;
  kartezyenKoordinat: string;
  coğrafiKoordinat: string;
}

export class EyupsultanScraper extends BaseScraper {
  municipality = "eyupsultan";
  searchUrl = `${IMAR_BASE}/index.aspx`;

  protected async buildRequest(query: ScrapeQuery): Promise<ScrapeResult> {
    if (query.queryType === "parcel" || query.queryType === "block") {
      return this.searchParcel(query.query);
    }

    return {
      success: false,
      parcels: [],
      error: "Desteklenmeyen sorgu tipi",
    };
  }

  private async searchParcel(query: string): Promise<ScrapeResult> {
    console.log(`[EyupsultanScraper] Searching parcel: "${query}"`);
    try {
      const config = getMunicipality("eyupsultan");
      if (!config) throw new Error("Eyüpsultan belediyesi yapılandırması bulunamadı");

      const data = await searchParcelFor(config, query);

      if (!Array.isArray(data)) {
        throw new Error("Beklenmeyen API yanıt formatı");
      }

      console.log(`[EyupsultanScraper] Received ${data.length} results`);
      const parcels: RawParcel[] = data.map(item => {
        const [ada, parsel] = item.ADAPARSEL.split("/").map(s => s.trim());
        console.log(`[EyupsultanScraper] Parcel: ada=${ada}, parsel=${parsel}, mahalle=${item.TAPU_MAH_ADI}, id=${item.OBJECTID}`);
        return {
          parcelNo: String(item.OBJECTID),
          plotNo: parsel || undefined,
          block: ada || undefined,
          neighborhood: item.TAPU_MAH_ADI || undefined,
          municipality: "eyupsultan",
          district: "Eyüpsultan",
          sourceUrl: `${IMAR_BASE}/imar.aspx?parselid=${item.OBJECTID}`,
        };
      });

      return {
        success: true,
        parcels,
        sourceUrl: this.searchUrl,
      };
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
    data?: {
      basic: RawParcel;
      plan?: ImarDetailPlan;
      kadastro?: ImarDetailKadastro;
    };
    error?: string;
  }> {
    try {
      const config = getMunicipality("eyupsultan");
      if (!config) throw new Error("Eyüpsultan belediyesi yapılandırması bulunamadı");

      const data = await getParcelInfoFor(config, parcelId);

      if (!Array.isArray(data) || data.length === 0) {
        return {
          success: false,
          error: "Parsel bilgisi bulunamadı",
        };
      }

      const item = data[0];
      const [ada, parsel] = item.ADAPARSEL.split("/").map(s => s.trim());

      return {
        success: true,
        data: {
          basic: {
            parcelNo: String(item.OBJECTID),
            plotNo: parsel || undefined,
            block: ada || undefined,
            neighborhood: item.TAPU_MAH_ADI || undefined,
            municipality: "eyupsultan",
            district: "Eyüpsultan",
            sourceUrl: `${IMAR_BASE}/imar.aspx?parselid=${item.OBJECTID}`,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Detay bilgisi alınamadı",
      };
    }
  }

  async getNeighborhoods(): Promise<string[]> {
    try {
      const config = getMunicipality("eyupsultan");
      if (!config) return [];
      const data = await getMahallelerFor(config);
      return data.map(item => item.ADI_NUMARASI);
    } catch {
      return [];
    }
  }

  async getTapuMahalleleri(): Promise<string[]> {
    try {
      const config = getMunicipality("eyupsultan");
      if (!config) return [];
      const data = await getTapuMahalleleriFor(config);
      return data.map(item => item.TAPU_MAH_ADI);
    } catch {
      return [];
    }
  }

  getDetailUrl(parcelId: number): string {
    return `${IMAR_BASE}/imar.aspx?parselid=${parcelId}`;
  }
}

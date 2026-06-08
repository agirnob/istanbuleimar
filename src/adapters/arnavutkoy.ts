import { BaseScraper } from "@/services/scraper/base";
import { ScrapeQuery, ScrapeResult, RawParcel } from "@/types/parcel";
import { getMunicipality } from "@/lib/turkishFetch";
import { getBrowser, type PuppeteerBrowser } from "@/services/puppeteer/browser";

type ImarPage = Awaited<ReturnType<PuppeteerBrowser["newPage"]>>;

interface ArnavutkoyParcelItem {
  ADAPARSEL: string;
  TAPU_MAH_ADI: string;
  OBJECTID: number;
}

/**
 * Scraper for Arnavutkoy custom maps platform.
 * Uses Puppeteer to interact with the custom web GIS interface.
 */
export class ArnavutkoyScraper extends BaseScraper {
  readonly municipalityKey: string;
  readonly config: NonNullable<ReturnType<typeof getMunicipality>>;

  constructor(municipalityKey: string) {
    super();
    this.municipalityKey = municipalityKey.toLocaleLowerCase("tr");
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
    console.log(
      `[ArnavutkoyScraper:${this.municipalityKey}] Searching: "${query}"`
    );

    let browser;
    let page: ImarPage | undefined;
    try {
      browser = await getBrowser();
      page = await browser.newPage();

      // Navigate to get session
      console.log(
        `[ArnavutkoyScraper:${this.municipalityKey}] Navigating to ${this.config.baseUrl}`
      );
      await page.goto(this.config.baseUrl, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      // Wait for page to be ready
      await new Promise((r) => setTimeout(r, 5000));

      // Parse the query
      let ada: string | undefined;
      let parsel: string;

      if (query.includes("/")) {
        const parts = query.split("/").map((s) => s.trim());
        ada = parts[0] || undefined;
        parsel = parts[1] || "";
      } else {
        parsel = query.trim();
      }

      // Try to find and fill the search form
      // Arnavutkoy platform uses a custom interface
      const results: ArnavutkoyParcelItem[] = await page.evaluate(
        (ada: string, parsel: string) => {
          const items: ArnavutkoyParcelItem[] = [];

          // Try to find search results in tables
          const rows = document.querySelectorAll("tr");
          for (const row of rows) {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
              const adaparsel = cells[0]?.textContent?.trim();
              const mahalle = cells[1]?.textContent?.trim();
              if (adaparsel && adaparsel.includes("/")) {
                items.push({
                  ADAPARSEL: adaparsel,
                  TAPU_MAH_ADI: mahalle || "",
                  OBJECTID: 0,
                });
              }
            }
          }

          return items;
        },
        ada || "",
        parsel
      );

      if (results.length > 0) {
        const parcels: RawParcel[] = results.map((item: ArnavutkoyParcelItem) => ({
          parcelNo: String(item.OBJECTID),
          plotNo: item.ADAPARSEL?.split("/")[1],
          block: item.ADAPARSEL?.split("/")[0],
          neighborhood: item.TAPU_MAH_ADI,
          municipality: this.municipalityKey,
          district: this.config.name,
        }));
        return { success: true, parcels, sourceUrl: this.config.baseUrl };
      }

      // Fallback: try direct API call
      return this.searchViaApi(page, ada || "", parsel);
    } catch (error) {
      console.error(
        `[ArnavutkoyScraper:${this.municipalityKey}] Error: ${error instanceof Error ? error.message : String(error)}`
      );
      return {
        success: false,
        parcels: [],
        error: error instanceof Error ? error.message : "Parsel sorgu hatası",
      };
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  /**
   * Fallback: search via API call
   */
  private async searchViaApi(
    page: ImarPage,
    ada: string,
    parsel: string
  ): Promise<ScrapeResult> {
    console.log(
      `[ArnavutkoyScraper:${this.municipalityKey}] Falling back to API search`
    );

    try {
      const apiUrl = `${this.config.serviceUrl}/api/Imar/ParselSorgula`;
      console.log(
        `[ArnavutkoyScraper:${this.municipalityKey}] API call: ${apiUrl}`
      );

      const result = await page.evaluate(
        async (url: string, ada: string, parsel: string) => {
          try {
            const resp = await fetch(url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ada, parsel }),
            });
            if (!resp.ok) {
              return { error: `HTTP ${resp.status}`, data: null };
            }
            const data = await resp.json();
            return { error: null, data };
          } catch (e: unknown) {
            return {
              error: e instanceof Error ? e.message : String(e),
              data: null,
            };
          }
        },
        apiUrl,
        ada,
        parsel
      );

      if (result.error) {
        console.error(
          `[ArnavutkoyScraper:${this.municipalityKey}] API error: ${result.error}`
        );
        return {
          success: false,
          parcels: [],
          error: `API sorgu hatası: ${result.error}`,
        };
      }

      // Parse results
      const parcels: RawParcel[] = [];
      if (result.data && Array.isArray(result.data)) {
        for (const item of result.data) {
          const [block, plot] = (item.ADAPARSEL || "").split("/").map((s: string) => s.trim());
          parcels.push({
            parcelNo: String(item.OBJECTID || 0),
            plotNo: plot,
            block,
            neighborhood: item.TAPU_MAH_ADI,
            municipality: this.municipalityKey,
            district: this.config.name,
          });
        }
      }

      return { success: parcels.length > 0, parcels, sourceUrl: this.config.baseUrl };
    } catch (error) {
      return {
        success: false,
        parcels: [],
        error: `API arama hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
      };
    }
  }

  getDetailUrl(parcelId: number): string {
    return `${this.config.detailUrl}?parselid=${parcelId}`;
  }
}

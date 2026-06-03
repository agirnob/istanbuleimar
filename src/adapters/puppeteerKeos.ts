import { BaseScraper } from "@/services/scraper/base";
import { ScrapeQuery, ScrapeResult, RawParcel } from "@/types/parcel";
import { getMunicipality } from "@/lib/turkishFetch";
import { getBrowser } from "@/services/puppeteer/browser";

/**
 * Puppeteer-based scraper for KEOS/webgis municipalities that return 403
 * from direct fetch. Uses Puppeteer's page context to make API requests
 * with proper browser headers and cookies.
 */
export class PuppeteerKeosScraper extends BaseScraper {
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
    console.log(
      `[PuppeteerKeosScraper:${this.municipalityKey}] Searching: "${query}"`
    );

    let browser;
    let page;
    try {
      browser = await getBrowser();
      page = await browser.newPage();

      // First, navigate to the base URL to get cookies/session
      console.log(
        `[PuppeteerKeosScraper:${this.municipalityKey}] Getting session from ${this.config.baseUrl}`
      );
      await page.goto(this.config.baseUrl, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      // Now make the API request from the page context (has cookies/headers)
      const apiUrl = `${this.config.serviceUrl}?type=adaparsel&adaparsel=${encodeURIComponent(query)}`;
      console.log(
        `[PuppeteerKeosScraper:${this.municipalityKey}] Fetching ${apiUrl} from page context`
      );

      const fetchData = await page.evaluate(async (url, referer) => {
        try {
          const resp = await fetch(url, {
            headers: {
              Accept: "application/json",
              Referer: referer,
            },
          });
          if (!resp.ok) {
            return { error: `HTTP ${resp.status}`, data: null };
          }
          const text = await resp.text();
          try {
            const data = JSON.parse(text);
            return { error: null, data };
          } catch {
            return { error: `JSON parse failed: ${text.substring(0, 200)}`, data: null };
          }
        } catch (e: any) {
          return { error: e.message, data: null };
        }
      }, apiUrl, this.config.refererUrl);

      if (fetchData.error) {
        console.error(
          `[PuppeteerKeosScraper:${this.municipalityKey}] Fetch error: ${fetchData.error}`
        );

        // Fallback: try direct form interaction
        return this.searchViaForm(page, query);
      }

      const data = fetchData.data;
      if (!Array.isArray(data)) {
        return {
          success: false,
          parcels: [],
          error: "Beklenmeyen API yanıt formatı",
        };
      }

      console.log(
        `[PuppeteerKeosScraper:${this.municipalityKey}] Found ${data.length} results`
      );

      const parcels: RawParcel[] = data.map((item: any) => {
        const [ada, parsel] = (item.ADAPARSEL || "").split("/").map((s: string) => s.trim());
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
      console.error(
        `[PuppeteerKeosScraper:${this.municipalityKey}] Error: ${error instanceof Error ? error.message : String(error)}`
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
   * Fallback: search by interacting with the form on the page
   */
  private async searchViaForm(
    page: any,
    query: string
  ): Promise<ScrapeResult> {
    console.log(
      `[PuppeteerKeosScraper:${this.municipalityKey}] Falling back to form interaction`
    );

    try {
      // Find and fill the ada/parsel input
      const inputSelectors = [
        'input[name="txtAdaParsel"]',
        'input[id*="AdaParsel"]',
        'input[type="text"]',
      ];

      for (const selector of inputSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.click(selector);
          await page.type(selector, query);

          // Click search or press Enter
          await page.keyboard.press("Enter");
          await new Promise((r) => setTimeout(r, 3000));

          // Try to extract results from the page
          const results = await page.evaluate(() => {
            const items: any[] = [];
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
                    OBJECTID: 0, // Would need to extract from hidden fields
                  });
                }
              }
            }
            return items;
          });

          if (results.length > 0) {
            const parcels: RawParcel[] = results.map((item: any) => ({
              parcelNo: String(item.OBJECTID),
              plotNo: item.ADAPARSEL?.split("/")[1],
              block: item.ADAPARSEL?.split("/")[0],
              neighborhood: item.TAPU_MAH_ADI,
              municipality: this.municipalityKey,
              district: this.config.name,
            }));
            return { success: true, parcels, sourceUrl: this.config.baseUrl };
          }
        } catch {
          // Try next selector
        }
      }

      return {
        success: false,
        parcels: [],
        error: "Form arama ile sonuç bulunamadı",
      };
    } catch (error) {
      return {
        success: false,
        parcels: [],
        error: `Form arama hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
      };
    }
  }

  getDetailUrl(parcelId: number): string {
    return `${this.config.detailUrl}?parselid=${parcelId}`;
  }
}

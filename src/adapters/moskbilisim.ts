import { BaseScraper } from "@/services/scraper/base";
import { ScrapeQuery, ScrapeResult, RawParcel } from "@/types/parcel";
import { getMunicipality } from "@/lib/turkishFetch";
import { getBrowser, type PuppeteerBrowser } from "@/services/puppeteer/browser";
import fs from "fs";
import path from "path";

type ImarPage = Awaited<ReturnType<PuppeteerBrowser["newPage"]>>;

interface MoskbilisimMahalle {
  id: string;
  text: string;
}

interface MoskbilisimYol {
  id: string;
  text: string;
}

interface MoskbilisimKapi {
  id: string;
  text: string;
}

// Cache path
const CACHE_PATH = path.join(process.cwd(), "src", "data", "cache", "districts.json");

interface DistrictCache {
  neighborhoods: Array<{ id: string; name: string }>;
  streets: Record<string, Array<{ id: string; name: string }>>;
  doors: Record<string, Array<{ id: string; number: string }>>;
}

function loadCache(): Record<string, DistrictCache> {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    }
  } catch (e) {
    console.warn(`[Cache] Failed to load cache: ${e}`);
  }
  return {};
}

/**
 * Scraper for Moskbilisim e-imar platforms (e.g., esenyurt).
 * These platforms use ASP.NET MVC with jQuery AJAX and embed mahalle lists in HTML.
 * API endpoints:
 * - Mahalle: hardcoded in HTML
 * - Streets: /Home/GetYollarByMahalle?mahalleKimlikNo={id}
 * - Doors: /Home/GetKapilarByYol?mahalleKimlikNo={id}&yolKimlikNo={id}
 */
export class MoskbilisimScraper extends BaseScraper {
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
    // Try cache first
    const cache = loadCache();
    const districtCache = cache[this.municipalityKey];

    if (query.queryType === "neighborhoods" && districtCache?.neighborhoods) {
      console.log(`[MoskbilisimScraper:${this.municipalityKey}] Using cached neighborhoods`);
      const parcels: RawParcel[] = districtCache.neighborhoods.map((item) => ({
        parcelNo: item.id,
        neighborhood: item.name,
        municipality: this.municipalityKey,
        district: this.config.name,
      }));
      return { success: true, parcels, sourceUrl: this.config.baseUrl };
    }

    if (query.queryType === "streets" && query.mahalleId && districtCache?.streets?.[query.mahalleId]) {
      console.log(`[MoskbilisimScraper:${this.municipalityKey}] Using cached streets for ${query.mahalleId}`);
      const parcels: RawParcel[] = districtCache.streets[query.mahalleId].map((item) => ({
        parcelNo: item.id,
        neighborhood: item.name,
        municipality: this.municipalityKey,
        district: this.config.name,
      }));
      return { success: true, parcels, sourceUrl: this.config.baseUrl };
    }

    if (query.queryType === "doors" && query.mahalleId && query.yolId && districtCache?.doors?.[`${query.mahalleId}_${query.yolId}`]) {
      console.log(`[MoskbilisimScraper:${this.municipalityKey}] Using cached doors for ${query.mahalleId}/${query.yolId}`);
      const parcels: RawParcel[] = districtCache.doors[`${query.mahalleId}_${query.yolId}`].map((item) => ({
        parcelNo: item.id,
        neighborhood: item.number,
        municipality: this.municipalityKey,
        district: this.config.name,
      }));
      return { success: true, parcels, sourceUrl: this.config.baseUrl };
    }

    // Fallback to live API
    if (query.queryType === "neighborhoods") {
      return this.getNeighborhoods();
    }
    if (query.queryType === "streets" && query.mahalleId) {
      return this.getStreets(query.mahalleId);
    }
    if (query.queryType === "doors" && query.mahalleId && query.yolId) {
      return this.getDoors(query.mahalleId, query.yolId);
    }
    if (query.queryType === "parcel" || query.queryType === "block") {
      return this.searchParcel(query.query);
    }
    return { success: false, parcels: [], error: "Desteklenmeyen sorgu tipi" };
  }

  /**
   * Get all neighborhoods by extracting from HTML
   */
  private async getNeighborhoods(): Promise<ScrapeResult> {
    console.log(
      `[MoskbilisimScraper:${this.municipalityKey}] Getting neighborhoods`
    );

    let browser;
    let page: ImarPage | undefined;
    try {
      browser = await getBrowser();
      page = await browser.newPage();

      await page.goto(this.config.baseUrl, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      await new Promise((r) => setTimeout(r, 2000));

      // Extract mahalle data from select element
      const neighborhoods: MoskbilisimMahalle[] = await page.evaluate(() => {
        const items: MoskbilisimMahalle[] = [];
        const select = document.querySelector("select#adres_mahalleid");
        if (select) {
          const options = select.querySelectorAll("option");
          for (const option of options) {
            const value = option.getAttribute("value");
            const text = option.textContent?.trim();
            if (value && text && value !== "") {
              items.push({ id: value, text });
            }
          }
        }
        return items;
      });

      console.log(
        `[MoskbilisimScraper:${this.municipalityKey}] Found ${neighborhoods.length} neighborhoods`
      );

      const parcels: RawParcel[] = neighborhoods.map((item) => ({
        parcelNo: item.id,
        neighborhood: item.text,
        municipality: this.municipalityKey,
        district: this.config.name,
      }));

      return { success: true, parcels, sourceUrl: this.config.baseUrl };
    } catch (error) {
      console.error(
        `[MoskbilisimScraper:${this.municipalityKey}] Error: ${error instanceof Error ? error.message : String(error)}`
      );
      return {
        success: false,
        parcels: [],
        error: error instanceof Error ? error.message : "Mahalle listesi alınamadı",
      };
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  /**
   * Get streets for a specific mahalle
   */
  private async getStreets(mahalleId: string): Promise<ScrapeResult> {
    console.log(
      `[MoskbilisimScraper:${this.municipalityKey}] Getting streets for mahalle ${mahalleId}`
    );

    try {
      const apiUrl = `${this.config.baseUrl}/Home/GetYollarByMahalle?mahalleKimlikNo=${mahalleId}`;
      console.log(
        `[MoskbilisimScraper:${this.municipalityKey}] Fetching ${apiUrl}`
      );

      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
          Referer: this.config.baseUrl,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          parcels: [],
          error: `HTTP ${response.status}`,
        };
      }

      const streets: MoskbilisimYol[] = await response.json();
      console.log(
        `[MoskbilisimScraper:${this.municipalityKey}] Found ${streets.length} streets`
      );

      const parcels: RawParcel[] = streets.map((item) => ({
        parcelNo: item.id,
        neighborhood: item.text,
        municipality: this.municipalityKey,
        district: this.config.name,
      }));

      return { success: true, parcels, sourceUrl: this.config.baseUrl };
    } catch (error) {
      console.error(
        `[MoskbilisimScraper:${this.municipalityKey}] Error: ${error instanceof Error ? error.message : String(error)}`
      );
      return {
        success: false,
        parcels: [],
        error: error instanceof Error ? error.message : "Sokak listesi alınamadı",
      };
    }
  }

  /**
   * Get doors for a specific mahalle and street
   */
  private async getDoors(
    mahalleId: string,
    yolId: string
  ): Promise<ScrapeResult> {
    console.log(
      `[MoskbilisimScraper:${this.municipalityKey}] Getting doors for mahalle ${mahalleId}, yol ${yolId}`
    );

    try {
      const apiUrl = `${this.config.baseUrl}/Home/GetKapilarByYol?mahalleKimlikNo=${mahalleId}&yolKimlikNo=${yolId}`;
      console.log(
        `[MoskbilisimScraper:${this.municipalityKey}] Fetching ${apiUrl}`
      );

      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
          Referer: this.config.baseUrl,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          parcels: [],
          error: `HTTP ${response.status}`,
        };
      }

      const doors: MoskbilisimKapi[] = await response.json();
      console.log(
        `[MoskbilisimScraper:${this.municipalityKey}] Found ${doors.length} doors`
      );

      const parcels: RawParcel[] = doors.map((item) => ({
        parcelNo: item.id,
        neighborhood: item.text,
        municipality: this.municipalityKey,
        district: this.config.name,
      }));

      return { success: true, parcels, sourceUrl: this.config.baseUrl };
    } catch (error) {
      console.error(
        `[MoskbilisimScraper:${this.municipalityKey}] Error: ${error instanceof Error ? error.message : String(error)}`
      );
      return {
        success: false,
        parcels: [],
        error: error instanceof Error ? error.message : "Kapı listesi alınamadı",
      };
    }
  }

  private async searchParcel(query: string): Promise<ScrapeResult> {
    console.log(
      `[MoskbilisimScraper:${this.municipalityKey}] Searching: "${query}"`
    );

    let browser;
    let page: ImarPage | undefined;
    try {
      browser = await getBrowser();
      page = await browser.newPage();

      await page.goto(this.config.baseUrl, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });

      await new Promise((r) => setTimeout(r, 3000));

      // Parse the query - could be "ADA/PARSEL" or just "PARSEL"
      let ada: string | undefined;
      let parsel: string;

      if (query.includes("/")) {
        const parts = query.split("/").map((s) => s.trim());
        ada = parts[0] || undefined;
        parsel = parts[1] || "";
      } else {
        parsel = query.trim();
      }

      // Fill the form
      const adaInput = page.locator('input#txtAda, input[name="txtAda"]');
      const parselInput = page.locator('input#txtParsel, input[name="txtParsel"]');

      if (ada) {
        await adaInput.fill(ada);
      }
      await parselInput.fill(parsel);

      // Click search button
      const searchBtn = page.locator('button#btnSorgula, button:has-text("SORGULA")');
      await searchBtn.click();

      // Wait for results
      await new Promise((r) => setTimeout(r, 5000));

      // Try to extract results from modal or table
      const results: RawParcel[] = await page.evaluate(
        (municipality: string, district: string) => {
          const items: RawParcel[] = [];
          const rows = document.querySelectorAll("tr");
          for (const row of rows) {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 2) {
              const adaparsel = cells[0]?.textContent?.trim();
              const mahalle = cells[1]?.textContent?.trim();
              if (adaparsel && adaparsel.includes("/")) {
                const [block, plot] = adaparsel.split("/").map((s) => s.trim());
                items.push({
                  parcelNo: "0",
                  plotNo: plot,
                  block,
                  neighborhood: mahalle || "",
                  municipality,
                  district,
                });
              }
            }
          }
          return items;
        },
        this.municipalityKey,
        this.config.name
      );

      if (results.length > 0) {
        return { success: true, parcels: results, sourceUrl: this.config.baseUrl };
      }

      // Fallback: try AJAX call directly
      return this.searchViaAjax(page, ada || "", parsel);
    } catch (error) {
      console.error(
        `[MoskbilisimScraper:${this.municipalityKey}] Error: ${error instanceof Error ? error.message : String(error)}`
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
   * Fallback: search via AJAX call
   */
  private async searchViaAjax(
    page: ImarPage,
    ada: string,
    parsel: string
  ): Promise<ScrapeResult> {
    console.log(
      `[MoskbilisimScraper:${this.municipalityKey}] Falling back to AJAX search`
    );

    try {
      const apiUrl = `${this.config.baseUrl}/Home/ParselleriGetir`;
      console.log(
        `[MoskbilisimScraper:${this.municipalityKey}] Fetching ${apiUrl}`
      );

      const result = await page.evaluate(
        async (url: string, ada: string, parsel: string) => {
          try {
            const formData = new FormData();
            formData.append("mahalleid", "0");
            formData.append("ada", ada);
            formData.append("parsel", parsel);

            const resp = await fetch(url, {
              method: "POST",
              body: formData,
              credentials: "include",
            });
            if (!resp.ok) {
              return { error: `HTTP ${resp.status}`, data: null };
            }
            const text = await resp.text();
            return { error: null, data: text };
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
          `[MoskbilisimScraper:${this.municipalityKey}] AJAX error: ${result.error}`
        );
        return {
          success: false,
          parcels: [],
          error: `AJAX sorgu hatası: ${result.error}`,
        };
      }

      // Parse the HTML response
      const parcels: RawParcel[] = [];
      if (result.data) {
        // The response is HTML partial - parse it to extract parcel info
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.data, "text/html");
        const rows = doc.querySelectorAll("tr");
        for (const row of rows) {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 2) {
            const adaparsel = cells[0]?.textContent?.trim();
            const mahalle = cells[1]?.textContent?.trim();
            if (adaparsel && adaparsel.includes("/")) {
              const [block, plot] = adaparsel.split("/").map((s) => s.trim());
              parcels.push({
                parcelNo: "0",
                plotNo: plot,
                block,
                neighborhood: mahalle,
                municipality: this.municipalityKey,
                district: this.config.name,
              });
            }
          }
        }
      }

      return { success: parcels.length > 0, parcels, sourceUrl: this.config.baseUrl };
    } catch (error) {
      return {
        success: false,
        parcels: [],
        error: `AJAX arama hatası: ${error instanceof Error ? error.message : "Bilinmeyen hata"}`,
      };
    }
  }

  getDetailUrl(parcelId: number): string {
    return `${this.config.detailUrl}?parselid=${parcelId}`;
  }
}

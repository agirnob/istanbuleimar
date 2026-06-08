import { BaseScraper } from "@/services/scraper/base";
import { ScrapeQuery, ScrapeResult, RawParcel } from "@/types/parcel";
import { getMunicipality } from "@/lib/turkishFetch";
import { getBrowser, type PuppeteerBrowser } from "@/services/puppeteer/browser";

type ImarPage = Awaited<ReturnType<PuppeteerBrowser["newPage"]>>;

export class GiSoftCbsScraper extends BaseScraper {
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

  protected async getNeighborhoods(): Promise<ScrapeResult> {
    // First try: fetch HTML and parse mahalle data (works for fatih)
    let neighborhoods = await this.getNeighborhoodsFromHtml();
    if (neighborhoods && neighborhoods.length > 0) {
      return { success: true, parcels: neighborhoods };
    }

    // Second try: use Puppeteer to load page and extract mahalle data
    neighborhoods = await this.getNeighborhoodsFromPuppeteer();
    if (neighborhoods && neighborhoods.length > 0) {
      return { success: true, parcels: neighborhoods };
    }

    return {
      success: false,
      parcels: [],
      error: "Could not find mahalle data",
    };
  }

  private async getNeighborhoodsFromHtml(): Promise<RawParcel[] | null> {
    try {
      const response = await fetch(this.config.baseUrl, {
        headers: {
          Accept: "text/html",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();

      // Parse mahalle options from AccbMahalle select
      const mahalleRegex = /id="AccbMahalle"[^>]*>([\s\S]*?)<\/select>/;
      const match = html.match(mahalleRegex);

      if (!match) {
        return null;
      }

      const optionsRegex = /<option[^>]*value="([^"]*)">([^<]*)<\/option>/g;
      const neighborhoods: RawParcel[] = [];
      let optionMatch;

      while ((optionMatch = optionsRegex.exec(match[1])) !== null) {
        const id = optionMatch[1];
        const name = optionMatch[2].trim();
        if (id && name && name !== "") {
          neighborhoods.push({
            parcelNo: id,
            neighborhood: name,
            municipality: this.municipalityKey,
          });
        }
      }

      return neighborhoods.length > 0 ? neighborhoods : null;
    } catch {
      return null;
    }
  }

  private async getNeighborhoodsFromPuppeteer(): Promise<RawParcel[] | null> {
    let page: ImarPage | undefined;
    try {
      const browser = await getBrowser();
      page = await browser.newPage();

      await page.goto(this.config.baseUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for AngularJS to load
      await new Promise((r) => setTimeout(r, 8000));

      // Try to find mahalle select element
      const neighborhoodData: { id: string; text: string }[] = await page.evaluate(() => {
        const items: { id: string; text: string }[] = [];

        // Try different select element IDs and patterns
        const selectors = [
          "#AccbMahalle",
          "#MahalleSelect",
          "#mahalleSelect",
          "#Mahalle",
          "#mahalle",
          'select[name="AccbMahalle"]',
          'select[name="Mahalle"]',
          'select[name="mahalle"]',
        ];

        for (const selector of selectors) {
          const select = document.querySelector(selector);
          if (select) {
            const options = select.querySelectorAll("option");
            for (const option of options) {
              const value = option.getAttribute("value");
              const text = option.textContent?.trim();
              if (value && text && value !== "" && text !== "-- Seçiniz --") {
                items.push({ id: value, text });
              }
            }
            break;
          }
        }

        return items;
      });

      await page.close();

      if (neighborhoodData.length > 0) {
        return neighborhoodData.map((item) => ({
          parcelNo: item.id,
          neighborhood: item.text,
          municipality: this.municipalityKey,
        }));
      }

      return null;
    } catch {
      return null;
    } finally {
      if (page) {
        await page.close().catch(() => {});
      }
    }
  }

  protected async getStreets(_mahalleId: string): Promise<ScrapeResult> {
    return {
      success: true,
      parcels: [],
    };
  }

  protected async getDoors(_mahalleId: string, _yolId: string): Promise<ScrapeResult> {
    return {
      success: true,
      parcels: [],
    };
  }

  protected async buildRequest(query: ScrapeQuery): Promise<ScrapeResult> {
    if (query.queryType === "neighborhoods") {
      return this.getNeighborhoods();
    }
    if (query.queryType === "streets" && query.mahalleId) {
      return this.getStreets(query.mahalleId);
    }
    if (query.queryType === "doors" && query.mahalleId && query.yolId) {
      return this.getDoors(query.mahalleId, query.yolId);
    }
    return { success: false, parcels: [], error: "Invalid query type or missing required fields" };
  }
}

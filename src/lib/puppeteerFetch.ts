import puppeteerCore from "puppeteer-core";
import { MunicipalityConfig } from "./turkishFetch";

interface FetchResult {
  error: string | null;
  text: string | null;
}

/**
 * Fetch KEOS API data through Puppeteer browser context.
 * Uses jQuery AJAX (same as the page itself) to avoid detection.
 */
export async function puppeteerFetch<T>(municipality: MunicipalityConfig, params: string): Promise<T[]> {
  console.log(`[puppeteerFetch] Fetching ${municipality.serviceUrl}?${params} for ${municipality.key}`);

  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  try {
    const page = await browser.newPage();

    // Set realistic viewport
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Navigate to referer URL to establish session/cookies
    await page.goto(municipality.refererUrl, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Wait for jQuery and page to fully load
    await new Promise((r) => setTimeout(r, 5000));

    // Use jQuery AJAX - exactly how the page makes its own requests
    const result: FetchResult = await page.evaluate(
      (serviceUrl: string, params: string) => {
        return new Promise<FetchResult>((resolve) => {
          // Hide webdriver flag
          Object.defineProperty(navigator, "webdriver", { get: () => false });

          const $ = (window as any).$;

          if (!$ || typeof $.ajax !== "function") {
            resolve({ error: "jQuery not available on page", text: null });
            return;
          }

          $.ajax({
            url: serviceUrl,
            data: params,
            method: "GET",
            dataType: "json",
            timeout: 15000,
            success: function (data: unknown) {
              if (Array.isArray(data)) {
                resolve({ error: null, text: JSON.stringify(data) });
              } else {
                resolve({ error: "Response is not an array", text: null });
              }
            },
            error: function (jqXHR: unknown, status: string, errorMsg: string) {
              resolve({ error: `AJAX failed: ${status} - ${errorMsg}`, text: null });
            },
          });
        });
      },
      municipality.serviceUrl,
      params
    );

    if (result.error) {
      console.log(`[puppeteerFetch] ${result.error} for ${municipality.key}`);
      return [];
    }

    const data = JSON.parse(result.text!) as T[];
    console.log(`[puppeteerFetch] Captured ${data.length} items for ${municipality.key}`);
    return data;
  } catch (error) {
    console.error(`[puppeteerFetch] Error for ${municipality.key}: ${error}`);
    return [];
  } finally {
    await browser.close();
  }
}

import { getBrowser } from "@/services/puppeteer/browser";
import { getMunicipality } from "@/lib/turkishFetch";

/**
 * Fetch neighborhoods (mahalleler) via Puppeteer for 403-protected municipalities.
 */
export async function getMahallelerViaPuppeteer(
  municipalityKey: string
): Promise<{ ADI_NUMARASI: string; OBJECTID: number }[]> {
  const config = getMunicipality(municipalityKey);
  if (!config) {
    throw new Error(`Belediye bulunamadı: ${municipalityKey}`);
  }

  console.log(
    `[PuppeteerMahalleler] Fetching neighborhoods for ${municipalityKey}`
  );

  let browser;
  let page;
  try {
    browser = await getBrowser();
    console.log(`[PuppeteerMahalleler] Browser ready for ${municipalityKey}`);
    page = await browser.newPage();

    // Set up response interception BEFORE navigation
    const capturedData: { ADI_NUMARASI: string; OBJECTID: number }[] = [];
    let resolveCapture: () => void;
    const captureReady = new Promise<void>((r) => {
      resolveCapture = r;
    });

    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("imarsvc.aspx") && url.includes("type=mahalle")) {
        console.log(`[PuppeteerMahalleler] Intercepted mahalle response`);
        try {
          const data = await response.json();
          if (Array.isArray(data)) {
            capturedData.push(...data);
          }
        } catch (e) {
          console.log(`[PuppeteerMahalleler] Parse error: ${e}`);
        }
        resolveCapture();
      }
    });

    // Navigate
    console.log(`[PuppeteerMahalleler] Navigating to ${config.baseUrl}`);
    await page.goto(config.baseUrl, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for capture with timeout
    await Promise.race([
      captureReady,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout waiting for mahalle data")), 20000)
      ),
    ]).catch((e) => {
      console.log(`[PuppeteerMahalleler] Capture wait: ${e.message}`);
    });

    console.log(
      `[PuppeteerMahalleler] Captured ${capturedData.length} mahalleler for ${municipalityKey}`
    );
    return capturedData;
  } catch (error) {
    console.error(
      `[PuppeteerMahalleler] ERROR for ${municipalityKey}: ${error instanceof Error ? error.message : String(error)}`
    );
    throw error;
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

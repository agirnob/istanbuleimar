/**
 * URL verification script - tests each district's baseUrl and API endpoint
 * to find which ones are reachable and what the correct paths are.
 */
import { MUNICIPALITIES } from "@/lib/turkishFetch";
import { getBrowser } from "@/services/puppeteer/browser";

async function testUrl(muni: (typeof MUNICIPALITIES)[0]) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  
  // Suppress console noise
  page.on("console", () => {});
  page.on("pageerror", () => {});

  let baseUrlStatus = "unknown";
  let baseUrlTitle = "";
  let apiStatus = "unknown";
  let apiResponse = "";

  try {
    // Test base URL
    const resp = await page.goto(muni.baseUrl, {
      waitUntil: "domcontentloaded",
      timeout: 10000,
    });
    baseUrlStatus = resp?.status().toString() || "no-response";
    baseUrlTitle = await page.title();
  } catch (e: unknown) {
    baseUrlStatus = e instanceof Error ? e.message.substring(0, 50) : String(e);
  }

  try {
    // Test API endpoint
    const apiUrl = `${muni.serviceUrl}?type=mahalle`;
    const result = await page.evaluate(async (url, referer) => {
      try {
        const resp = await fetch(url, {
          headers: { Accept: "application/json", Referer: referer },
        });
        const text = await resp.text();
        return { status: resp.status, text: text.substring(0, 300) };
      } catch (e: unknown) {
        return { status: 0, text: String(e) };
      }
    }, apiUrl, muni.refererUrl);
    
    apiStatus = result.status.toString();
    apiResponse = result.text;
  } catch (e: unknown) {
    apiStatus = "error";
    apiResponse = String(e);
  }

  await page.close();

  return {
    key: muni.key,
    name: muni.name,
    baseUrl: muni.baseUrl,
    serviceUrl: muni.serviceUrl,
    usePuppeteer: muni.usePuppeteer,
    baseUrlStatus,
    baseUrlTitle,
    apiStatus,
    apiResponse,
  };
}

async function main() {
  console.log("Testing all district URLs...\n");
  console.log("=".repeat(120));

  for (const muni of MUNICIPALITIES) {
    const result = await testUrl(muni);
    const statusIcon = result.apiStatus === "200" ? "✅" : 
                       result.apiStatus === "0" ? "❌" :
                       result.apiStatus === "403" ? "🚫" :
                       result.apiStatus === "500" ? "💥" : "⚠️";
    console.log(`${statusIcon} ${result.name.padEnd(16)} | baseUrl: ${result.baseUrlStatus.padEnd(6)} | API: ${result.apiStatus.padEnd(4)} | Title: ${result.baseUrlTitle.substring(0, 50).padEnd(50)} | API resp: ${result.apiResponse.substring(0, 60)}`);
  }

  console.log("=".repeat(120));
}

main().catch(console.error);

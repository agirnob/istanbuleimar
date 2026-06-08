import puppeteerCore from "puppeteer-core";

async function testDistrict(baseUrl: string, serviceUrl: string, name: string) {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  
  // Intercept requests to see API calls
  const apiCalls: string[] = [];
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("imarsvc") || url.includes("mahalle") || url.includes("type=")) {
      apiCalls.push(`${response.status()} ${url}`);
    }
  });

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 20000 });
    console.log(`\n[${name}] Page loaded`);
    console.log(`  API calls: ${apiCalls.length}`);
    for (const call of apiCalls) console.log(`    ${call}`);
    
    // Try the API call
    const apiUrl = `${serviceUrl}?type=mahalle`;
    const result = await page.evaluate(async (url: string) => {
      try {
        const r = await fetch(url, { credentials: 'include' });
        const text = await r.text();
        return { status: r.status, len: text.length, preview: text.substring(0, 150) };
      } catch (e) { return { status: 0, len: 0, preview: String(e) }; }
    }, apiUrl);
    console.log(`  fetch(${apiUrl}) -> status=${result.status} len=${result.len}`);
    console.log(`  preview: ${result.preview}`);
    
  } catch (e: unknown) {
    console.error(`[${name}] Error: ${e}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  await testDistrict(
    "https://keos.avcilar.bel.tr/imardurumu/index.aspx",
    "https://keos.avcilar.bel.tr/imardurumu/service/imarsvc.aspx",
    "Avcilar"
  );
  await testDistrict(
    "https://keos.bakirkoy.bel.tr/imardurumu/index.aspx",
    "https://keos.bakirkoy.bel.tr/imardurumu/service/imarsvc.aspx",
    "Bakirkoy"  
  );
  await testDistrict(
    "https://webgis.kadikoy.bel.tr/imardurumu/index.aspx",
    "https://webgis.kadikoy.bel.tr/imardurumu/service/imarsvc.aspx",
    "Kadikoy"
  );
})();

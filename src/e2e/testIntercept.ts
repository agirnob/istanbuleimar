import puppeteerCore from "puppeteer-core";

async function testIntercept(baseUrl: string, name: string) {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  
  const capturedData: Array<{ url: string; data: unknown }> = [];

  // Intercept responses
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("type=mahalle") && !url.includes("tapuMahalle")) {
      try {
        const text = await response.text();
        capturedData.push({ url, data: text.substring(0, 500) });
      } catch {}
    }
  });

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise(r => setTimeout(r, 3000));
    
    console.log(`\n[${name}] Intercepted ${capturedData.length} mahalle API responses`);
    for (const capture of capturedData) {
      console.log(`  URL: ${capture.url}`);
      console.log(`  Data: ${capture.data}`);
    }
    
  } catch (e: unknown) {
    console.error(`[${name}] Error: ${e}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  await testIntercept("https://keos.avcilar.bel.tr/imardurumu/index.aspx", "Avcilar");
  await testIntercept("https://keos.bakirkoy.bel.tr/imardurumu/index.aspx", "Bakirkoy");
  await testIntercept("https://webgis.kadikoy.bel.tr/imardurumu/index.aspx", "Kadikoy");
})();

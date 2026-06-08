import puppeteerCore from "puppeteer-core";

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  
  // Log ALL responses
  const allResponses: Array<{ url: string; status: number; contentType: string }> = [];
  
  page.on("response", async (response) => {
    const url = response.url();
    const status = response.status();
    const headers = await response.headers();
    const contentType = headers["content-type"] || "";
    allResponses.push({ url, status, contentType });
    
    if (url.includes("imarsvc") || url.includes("mahalle") || url.includes("type=")) {
      console.log(`RESPONSE: ${status} ${url}`);
      console.log(`  content-type: ${contentType}`);
      try {
        const text = await response.text();
        console.log(`  body length: ${text.length}`);
        console.log(`  preview: ${text.substring(0, 200)}`);
      } catch (e) {
        console.log(`  body error: ${e}`);
      }
    }
  });

  try {
    console.log("Navigating to Avcilar...");
    await page.goto("https://keos.avcilar.bel.tr/imardurumu/index.aspx", {
      waitUntil: "networkidle2",
      timeout: 20000,
    });
    console.log(`\nPage loaded. Total responses: ${allResponses.length}`);
    console.log("\nAll imarsvc-related responses:");
    for (const r of allResponses.filter(r => r.url.includes("imarsvc"))) {
      console.log(`  ${r.status} ${r.contentType} ${r.url}`);
    }
  } catch (e: unknown) {
    console.error(`Error: ${e}`);
  } finally {
    await browser.close();
  }
})();

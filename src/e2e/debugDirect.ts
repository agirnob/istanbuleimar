import puppeteerCore from "puppeteer-core";

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  // First visit the page to get session cookies
  console.log("Getting session cookies...");
  await page.goto("https://keos.avcilar.bel.tr/imardurumu/index.aspx", {
    waitUntil: "domcontentloaded",
    timeout: 15000,
  });
  await new Promise(r => setTimeout(r, 2000));
  
  // Get cookies
  const cookies = await page.context().getCookies("https://keos.avcilar.bel.tr");
  console.log("Cookies:", cookies.length);
  
  // Now try fetching the API with cookies
  const result = await page.evaluate(async (apiUrl: string, referer: string) => {
    try {
      const resp = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Referer': referer,
          'X-Requested-With': 'XMLHttpRequest',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
        }
      });
      const text = await resp.text();
      return { ok: resp.ok, status: resp.status, length: text.length, preview: text.substring(0, 200) };
    } catch (e: unknown) {
      return { error: e instanceof Error ? e.message : String(e) };
    }
  }, "https://keos.avcilar.bel.tr/imardurumu/service/imarsvc.aspx?type=mahalle",
     "https://keos.avcilar.bel.tr/imardurumu/index.aspx");
  
  console.log("\nAPI result:", JSON.stringify(result, null, 2).substring(0, 500));
  
  // Try parsing the response
  if (result.ok && result.length) {
    try {
      const data = JSON.parse(result.preview);
      console.log("\nParsed:", Array.isArray(data) ? `array[${data.length}]` : typeof data);
      if (Array.isArray(data) && data.length > 0) {
        console.log("First item:", JSON.stringify(data[0]).substring(0, 200));
      }
    } catch {
      console.log("Not JSON, raw:", result.preview);
    }
  }
  
  await browser.close();
  process.exit(0);
})();

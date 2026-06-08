import puppeteerCore from "puppeteer-core";

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  
  // Inject script BEFORE page loads to capture AJAX responses
  await page.evaluateOnNewDocument(() => {
    // Override jQuery.ajax to capture responses
    const originalAjax = window.$.ajax;
    // @ts-ignore
    window.$.ajax = function(...args: any[]) {
      const config = typeof args[0] === 'object' ? args[0] : args;
      const originalSuccess = config.success;
      config.success = function(data: any) {
        // Capture the data
        // @ts-ignore
        if (!window.__capturedData) window.__capturedData = {};
        // @ts-ignore
        window.__capturedData[config.url] = data;
        if (originalSuccess) originalSuccess(data);
      };
      return originalAjax.apply(this, args);
    };
  });

  try {
    await page.goto("https://keos.avcilar.bel.tr/imardurumu/index.aspx", {
      waitUntil: "networkidle2",
      timeout: 20000,
    });
    await new Promise(r => setTimeout(r, 5000));

    // Check captured data
    const captured = await page.evaluate(() => {
      // @ts-ignore
      const data = window.__capturedData;
      if (!data) return null;
      const result: Record<string, unknown> = {};
      for (const [url, val] of Object.entries(data)) {
        if (Array.isArray(val)) {
          result[url] = { type: 'array', length: val.length, first: val[0] };
        } else {
          result[url] = val;
        }
      }
      return result;
    });
    
    console.log("Captured AJAX data:");
    console.log(JSON.stringify(captured, null, 2).substring(0, 2000));
    
  } catch (e: unknown) {
    console.error(`Error: ${e}`);
  } finally {
    await browser.close();
  }
})();

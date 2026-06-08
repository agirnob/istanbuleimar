import puppeteerCore from "puppeteer-core";

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    await page.goto("https://keos.avcilar.bel.tr/imardurumu/index.aspx", {
      waitUntil: "networkidle2",
      timeout: 20000,
    });
    await new Promise(r => setTimeout(r, 3000));

    // Check the populateMahalle function
    const funcInfo = await page.evaluate(() => {
      // @ts-ignore
      const fn = window.populateMahalle;
      return {
        type: typeof fn,
        toString: fn ? fn.toString().substring(0, 1000) : 'undefined',
      };
    });
    
    console.log("populateMahalle function:");
    console.log(funcInfo.toString);
    
    // Also check if there's data stored in the page's JS after loading
    const pageData = await page.evaluate(() => {
      // Look for arrays/objects that might contain mahalle data
      const results: Record<string, unknown> = {};
      
      // Check all script tags for embedded data
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        const text = script.textContent || '';
        if (text.includes('OBJECTID') && text.includes('ADI_NUMARASI')) {
          results['script_with_data'] = text.substring(0, 500);
          break;
        }
      }
      
      // Check for hidden inputs with data
      const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
      hiddenInputs.forEach((input, idx) => {
        const val = input.value;
        if (val && val.length > 50 && val.includes('{')) {
          results[`hidden_${idx}`] = val.substring(0, 300);
        }
      });
      
      return results;
    });
    
    console.log("\nPage data:");
    for (const [key, val] of Object.entries(pageData)) {
      console.log(`  ${key}: ${val}`);
    }
    
  } catch (e: unknown) {
    console.error(`Error: ${e}`);
  } finally {
    await browser.close();
  }
})();

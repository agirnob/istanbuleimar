import puppeteerCore from "puppeteer-core";

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  
  // Intercept jQuery AJAX
  await page.evaluateOnNewDocument(() => {
    const origSend = XMLHttpRequest.prototype.send;
    window.__captured = {};
    XMLHttpRequest.prototype.send = function() {
      this.addEventListener("load", function() {
        try {
          const data = JSON.parse(this.responseText);
          if (Array.isArray(data) && data.length > 0 && data[0].OBJECTID !== undefined) {
            window.__captured["mahalle"] = data;
          }
        } catch {}
      });
      return origSend.apply(this, arguments as any);
    };
  });

  await page.goto("https://keos.avcilar.bel.tr/imardurumu/index.aspx", {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  // Try clicking the mahalle dropdown to trigger data load
  const dropdowns = await page.$$('select');
  console.log(`Found ${dropdowns.length} select elements`);

  // Try clicking each dropdown
  for (const [i, dropdown] of dropdowns.entries()) {
    const id = await page.evaluate(el => el.getAttribute("id") || "", dropdown);
    const name = await page.evaluate(el => el.getAttribute("name") || "", dropdown);
    console.log(`  Select ${i}: id=${id}, name=${name}`);
    
    // Click the dropdown
    await dropdown.click();
    await new Promise(r => setTimeout(r, 500));
    
    // Check options
    const options = await page.evaluate(el => {
      return Array.from((el as HTMLSelectElement).options).map(o => o.text).slice(0, 5);
    }, dropdown);
    console.log(`    Options: ${options.join(", ")}`);
  }

  // Check captured data
  const captured = await page.evaluate(() => window.__captured || {});
  console.log("\nCaptured:", JSON.stringify(captured, null, 2).slice(0, 1000));

  await browser.close();
})();

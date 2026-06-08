import puppeteerCore from "puppeteer-core";

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  console.log("Navigating...");
  await page.goto("https://keos.avcilar.bel.tr/imardurumu/index.aspx", {
    waitUntil: "networkidle2",
    timeout: 20000,
  });
  await new Promise(r => setTimeout(r, 5000));

  // Check what's in the DOM
  const domInfo = await page.evaluate(() => {
    const results: Record<string, unknown> = {};
    
    // Check all listboxes
    const listboxes = document.querySelectorAll('[role="listbox"]');
    results['listbox_count'] = listboxes.length;
    
    listboxes.forEach((lb, idx) => {
      const links = lb.querySelectorAll('a');
      results[`listbox_${idx}_links`] = links.length;
      if (links.length > 0) {
        results[`listbox_${idx}_first3`] = Array.from(links).slice(0, 3).map(l => l.textContent?.trim());
      }
      // Check for data attributes
      const firstLink = links[0];
      if (firstLink) {
        results[`listbox_${idx}_attrs`] = Array.from(firstLink.attributes).map(a => `${a.name}=${a.value.substring(0, 50)}`);
      }
    });
    
    // Check if there are hidden fields with data
    const hiddenInputs = document.querySelectorAll('input[type="hidden"]');
    results['hidden_count'] = hiddenInputs.length;
    
    // Check scripts for embedded data
    const scripts = document.querySelectorAll('script');
    let embeddedData = false;
    for (const script of scripts) {
      const text = script.textContent || '';
      if (text.includes('OBJECTID') && text.includes('ADI_NUMARASI')) {
        embeddedData = true;
        results['embedded_data_preview'] = text.substring(text.indexOf('OBJECTID'), text.indexOf('OBJECTID') + 200);
        break;
      }
    }
    results['has_embedded_data'] = embeddedData;
    
    return results;
  });
  
  console.log("DOM info:");
  for (const [k, v] of Object.entries(domInfo)) {
    console.log(`  ${k}:`, typeof v === 'string' && v.length > 200 ? v.substring(0, 200) + '...' : v);
  }
  
  // Check page source for AJAX calls
  const html = await page.content();
  const ajaxMatches = html.match(/imarsvc[^"]*|serviceURL[^;]+/g);
  console.log("\nAJAX references in HTML:", ajaxMatches?.length || 0);
  if (ajaxMatches) {
    console.log("Samples:", ajaxMatches.slice(0, 5));
  }
  
  await browser.close();
  process.exit(0);
})();

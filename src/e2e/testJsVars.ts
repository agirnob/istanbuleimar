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

    // Check all global variables that might contain mahalle data
    const vars = await page.evaluate(() => {
      const results: Record<string, string> = {};
      
      // Check common KEOS variable names
      const varNames = [
        'mahalleList', 'mahalleData', 'mahalleArray', 'mahalleler',
        'neighborhoodList', 'neighborhoodData',
        '_mahalleList', '_mahalleData',
        'mahalleSelectData', 'mahalleOptions',
        'mahalleItems', 'mahalleDataList',
      ];
      
      for (const name of varNames) {
        // @ts-ignore
        if (typeof window[name] !== 'undefined') {
          // @ts-ignore
          const val = window[name];
          if (Array.isArray(val)) {
            results[name] = `array[${val.length}]`;
            if (val.length > 0) {
              results[`${name}[0]`] = JSON.stringify(val[0]).substring(0, 200);
            }
          } else if (typeof val === 'object') {
            results[name] = JSON.stringify(val).substring(0, 300);
          } else {
            results[name] = String(val).substring(0, 200);
          }
        }
      }
      
      // Check for Netcad/KEOS specific objects
      // @ts-ignore
      if (typeof Netcad !== 'undefined') {
        results['Netcad'] = 'exists';
      }
      // @ts-ignore
      if (typeof NC !== 'undefined') {
        results['NC'] = 'exists';
      }
      // @ts-ignore  
      if (typeof _mahalleData !== 'undefined') {
        // @ts-ignore
        results['_mahalleData'] = String(_mahalleData).substring(0, 300);
      }
      
      // Check for data in window.__data or similar patterns
      const allKeys = Object.keys(window).filter(k => 
        k.toLowerCase().includes('mahalle') || 
        k.toLowerCase().includes('neighborhood') ||
        k.toLowerCase().includes('mahalle')
      );
      results['matching_keys'] = allKeys.join(', ');
      
      return results;
    });
    
    console.log("Global variables:");
    for (const [key, val] of Object.entries(vars)) {
      console.log(`  ${key}: ${val}`);
    }
    
    // Try to find mahalle data in the page's JS context by looking at the listbox content
    const listboxData = await page.evaluate(() => {
      // Find the mahalle listbox and try to get data from it
      const listboxes = document.querySelectorAll('[role="listbox"]');
      const results: Array<{ index: number; itemCount: number; sampleItems: string[] }> = [];
      
      listboxes.forEach((lb, idx) => {
        const links = lb.querySelectorAll('a');
        if (links.length > 3) {
          const items = Array.from(links).map(l => (l.textContent || '').trim());
          results.push({
            index: idx,
            itemCount: items.length,
            sampleItems: items.slice(0, 5),
          });
        }
      });
      
      return results;
    });
    
    console.log("\nListbox data:");
    for (const lb of listboxData) {
      console.log(`  listbox[${lb.index}]: ${lb.itemCount} items - ${lb.sampleItems.join(', ')}`);
    }
    
  } catch (e: unknown) {
    console.error(`Error: ${e}`);
  } finally {
    await browser.close();
  }
})();

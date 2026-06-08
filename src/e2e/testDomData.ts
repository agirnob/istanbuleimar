import puppeteerCore from "puppeteer-core";

async function testDomData(baseUrl: string, name: string) {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 20000 });
    // Wait extra for JS to populate dropdowns
    await new Promise(r => setTimeout(r, 3000));
    
    console.log(`\n[${name}] Checking DOM for mahalle data...`);
    
    // Get all select elements and their options
    const selects = await page.evaluate(() => {
      const result: Array<{ tag: string; id: string; name: string; options: string[] }> = [];
      document.querySelectorAll('select').forEach(sel => {
        const options = Array.from(sel.querySelectorAll('option')).map(o => o.textContent || '');
        if (options.length > 1) {
          result.push({
            tag: 'select',
            id: sel.id,
            name: sel.name || '',
            options: options.slice(0, 10),
            total: options.length,
          });
        }
      });
      return result;
    });
    
    console.log(`  Found ${selects.length} populated selects`);
    for (const sel of selects) {
      console.log(`    select#${sel.id} name="${sel.name}" (${sel.total} options): ${sel.options.join(', ')}`);
    }
    
    // Check for data attributes or hidden inputs with JSON data
    const hiddenData = await page.evaluate(() => {
      const results: Array<{ attr: string; preview: string }> = [];
      document.querySelectorAll('[data-mahalle],[data-neighborhood],[data-options]').forEach(el => {
        results.push({
          attr: el.getAttribute('data-mahalle') || el.getAttribute('data-neighborhood') || el.getAttribute('data-options') || '',
          preview: (el.getAttribute('data-mahalle') || '').substring(0, 200),
        });
      });
      return results;
    });
    
    if (hiddenData.length) {
      console.log(`  Found ${hiddenData.length} elements with data attributes`);
    }
    
    // Check for Netcad-specific elements
    const netcadData = await page.evaluate(() => {
      // Check for combobox/dropdown components
      const comboboxes = document.querySelectorAll('.nc-combobox, .nc-dropdown, .combobox, [role="combobox"]');
      const listboxes = document.querySelectorAll('[role="listbox"], .listbox');
      
      // Check for embedded JSON in script tags
      const scripts = Array.from(document.querySelectorAll('script')).filter(s => 
        s.textContent?.includes('mahalle') || s.textContent?.includes('ADI_NUMARASI')
      );
      
      return {
        comboboxCount: comboboxes.length,
        listboxCount: listboxes.length,
        scriptsWithData: scripts.length,
        scriptPreview: scripts[0]?.textContent?.substring(0, 300) || 'none',
      };
    });
    
    console.log(`  Netcad: ${netcadData.comboboxCount} comboboxes, ${netcadData.listboxCount} listboxes, ${netcadData.scriptsWithData} scripts with data`);
    if (netcadData.scriptPreview !== 'none') {
      console.log(`  Script preview: ${netcadData.scriptPreview.substring(0, 200)}`);
    }
    
  } catch (e: unknown) {
    console.error(`[${name}] Error: ${e}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  await testDomData("https://keos.avcilar.bel.tr/imardurumu/index.aspx", "Avcilar");
  await testDomData("https://keos.bakirkoy.bel.tr/imardurumu/index.aspx", "Bakirkoy");
  await testDomData("https://webgis.kadikoy.bel.tr/imardurumu/index.aspx", "Kadikoy");
})();

import puppeteerCore from "puppeteer-core";

async function checkObjectId(baseUrl: string, name: string) {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise(r => setTimeout(r, 3000));
    
    console.log(`\n[${name}]`);
    
    // Check the <a> elements in the mahalle listbox for data attributes
    const result = await page.evaluate(() => {
      const listboxes = document.querySelectorAll('[role="listbox"]');
      for (const listbox of listboxes) {
        const links = listbox.querySelectorAll('a');
        if (links.length > 2) {
          // Found mahalle listbox - check first 3 links
          return Array.from(links).slice(0, 5).map(link => ({
            text: (link.textContent || '').trim(),
            href: link.getAttribute('href') || '',
            dataset: Object.fromEntries(Object.entries(link.dataset)),
            attributes: Array.from(link.attributes).map(a => `${a.name}="${a.value.substring(0, 100)}"`),
            onclick: link.onclick ? 'has-onclick' : 'no-onclick',
          }));
        }
      }
      return [];
    });
    
    for (const item of result) {
      console.log(`  "${item.text}"`);
      console.log(`    href: ${item.href}`);
      console.log(`    onclick: ${item.onclick}`);
      console.log(`    attributes: ${item.attributes.join(', ')}`);
      console.log(`    dataset: ${JSON.stringify(item.dataset)}`);
    }
    
    // Also check if there's embedded JSON data in script tags
    const scripts = await page.evaluate(() => {
      const results: string[] = [];
      document.querySelectorAll('script').forEach(script => {
        const text = script.textContent || '';
        if (text.includes('OBJECTID') || text.includes('mahalle') || text.includes('Mahalle')) {
          results.push(text.substring(0, 500));
        }
      });
      return results;
    });
    
    if (scripts.length) {
      console.log(`\n  Found ${scripts.length} scripts with mahalle/OBJECTID data`);
      for (const s of scripts.slice(0, 2)) {
        console.log(`    ${s.substring(0, 300)}...`);
      }
    }
    
  } catch (e: unknown) {
    console.error(`[${name}] Error: ${e}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  await checkObjectId("https://keos.avcilar.bel.tr/imardurumu/index.aspx", "Avcilar");
  await checkObjectId("https://keos.bakirkoy.bel.tr/imardurumu/index.aspx", "Bakirkoy");
})();

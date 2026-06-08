import puppeteerCore from "puppeteer-core";

interface MahalleItem {
  OBJECTID: number;
  ADI_NUMARASI: string;
}

async function extractMahalleFromDom(baseUrl: string, name: string): Promise<MahalleItem[]> {
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
    
    // Extract mahalle data from the listbox that contains neighborhood names
    const result = await page.evaluate(() => {
      const mahalleItems: Array<{ name: string; id: number }> = [];
      
      // Find the listbox with mahalle data (it contains <a> elements with neighborhood names)
      const listboxes = document.querySelectorAll('[role="listbox"]');
      for (const listbox of listboxes) {
        const links = listbox.querySelectorAll('a');
        if (links.length > 2) {
          // This is likely the mahalle listbox
          const seen = new Set<string>();
          links.forEach((link, idx) => {
            const text = (link.textContent || '').trim();
            if (text && !seen.has(text) && text.length > 1) {
              seen.add(text);
              mahalleItems.push({ name: text, id: idx + 1 });
            }
          });
        }
      }
      return mahalleItems;
    });
    
    await browser.close();
    return result.map((item, idx) => ({
      OBJECTID: item.id,
      ADI_NUMARASI: item.name,
    }));
  } catch (e: unknown) {
    await browser.close();
    throw e;
  }
}

(async () => {
  console.log("Testing DOM extraction for Avcilar...");
  const mahalleler = await extractMahalleFromDom(
    "https://keos.avcilar.bel.tr/imardurumu/index.aspx",
    "Avcilar"
  );
  console.log(`Found ${mahalleler.length} mahalleler:`);
  for (const m of mahalleler) {
    console.log(`  ${m.OBJECTID}: ${m.ADI_NUMARASI}`);
  }
  
  console.log("\nTesting DOM extraction for Bakirkoy...");
  const mahalleler2 = await extractMahalleFromDom(
    "https://keos.bakirkoy.bel.tr/imardurumu/index.aspx",
    "Bakirkoy"
  );
  console.log(`Found ${mahalleler2.length} mahalleler:`);
  for (const m of mahalleler2) {
    console.log(`  ${m.OBJECTID}: ${m.ADI_NUMARASI}`);
  }
  
  console.log("\nTesting DOM extraction for Kadikoy...");
  const mahalleler3 = await extractMahalleFromDom(
    "https://webgis.kadikoy.bel.tr/imardurumu/index.aspx",
    "Kadikoy"
  );
  console.log(`Found ${mahalleler3.length} mahalleler:`);
  for (const m of mahalleler3) {
    console.log(`  ${m.OBJECTID}: ${m.ADI_NUMARASI}`);
  }
})();

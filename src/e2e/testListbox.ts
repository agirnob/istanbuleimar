import puppeteerCore from "puppeteer-core";

async function testListbox(baseUrl: string, name: string) {
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
    
    // Check all listbox contents
    const listboxes = await page.evaluate(() => {
      const results: Array<{ role: string; text: string; children: string[] }> = [];
      document.querySelectorAll('[role="listbox"]').forEach((lb, i) => {
        const children = Array.from(lb.children).slice(0, 5).map(c => ({
          tag: c.tagName,
          text: (c.textContent || '').trim().substring(0, 100),
          role: c.getAttribute('role'),
          class: c.className?.substring(0, 50),
        }));
        results.push({
          role: lb.getAttribute('role') || '',
          text: (lb.textContent || '').trim().substring(0, 200),
          children: children.map(c => `${c.tag}(${c.role || 'no-role'}) "${c.text}"`),
        });
      });
      return results;
    });
    
    for (let i = 0; i < listboxes.length; i++) {
      console.log(`  listbox[${i}]: ${listboxes[i].text.substring(0, 100)}`);
      for (const child of listboxes[i].children) {
        console.log(`    ${child}`);
      }
    }
    
    // Check the page HTML structure for mahalle-related elements
    const pageStructure = await page.evaluate(() => {
      // Look for elements containing "Mahalle" text
      const allElements = document.querySelectorAll('*');
      const mahalleElements: Array<{ tag: string; text: string; id: string }> = [];
      allElements.forEach(el => {
        const text = el.textContent || '';
        if (text.includes('Mahalle') || text.includes('mahalle')) {
          // Only direct text, not nested
          const directText = Array.from(el.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE)
            .map(n => n.textContent)
            .join('');
          if (directText && directText.includes('Mahalle')) {
            mahalleElements.push({
              tag: el.tagName,
              text: directText.trim().substring(0, 100),
              id: el.id || '',
            });
          }
        }
      });
      return mahalleElements.slice(0, 10);
    });
    
    console.log(`  Mahalle elements: ${pageStructure.length}`);
    for (const el of pageStructure) {
      console.log(`    <${el.tag}> id="${el.id}" text="${el.text}"`);
    }
    
  } catch (e: unknown) {
    console.error(`[${name}] Error: ${e}`);
  } finally {
    await browser.close();
  }
}

(async () => {
  await testListbox("https://keos.avcilar.bel.tr/imardurumu/index.aspx", "Avcilar");
})();

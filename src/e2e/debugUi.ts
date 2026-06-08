import puppeteerCore from "puppeteer-core";

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: [
      "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
      "--disable-gpu",
    ],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  
  // Set viewport and user agent to avoid detection
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  // Override navigator.webdriver
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
    Object.defineProperty(navigator, 'languages', { get: () => ['tr-TR', 'tr', 'en-US', 'en'] });
  });

  console.log("Navigating...");
  await page.goto("https://keos.avcilar.bel.tr/imardurumu/index.aspx", {
    waitUntil: "networkidle2",
    timeout: 20000,
  });
  await new Promise(r => setTimeout(r, 5000));

  // Check DOM state
  const domInfo = await page.evaluate(() => {
    const results: Record<string, unknown> = {};
    const listboxes = document.querySelectorAll('[role="listbox"]');
    results['listbox_count'] = listboxes.length;
    
    listboxes.forEach((lb, idx) => {
      const links = lb.querySelectorAll('a');
      results[`listbox_${idx}_links`] = links.length;
      if (links.length > 0) {
        results[`listbox_${idx}_first5`] = Array.from(links).slice(0, 5).map(l => l.textContent?.trim());
      }
    });
    
    // Check all dropdowns/buttons
    const buttons = document.querySelectorAll('button, .btn, [class*="dropdown"]');
    results['buttons_count'] = buttons.length;
    results['buttons_text'] = Array.from(buttons).slice(0, 10).map(b => b.textContent?.trim());
    
    return results;
  });
  
  console.log("DOM info:");
  for (const [k, v] of Object.entries(domInfo)) {
    console.log(`  ${k}:`, v);
  }
  
  // Try clicking the mahalle dropdown button
  const clickResult = await page.evaluate(() => {
    // Find the mahalle button
    const buttons = document.querySelectorAll('button');
    for (const btn of buttons) {
      if (btn.textContent?.includes('Mahalle') || btn.textContent?.includes('Seçiniz')) {
        btn.click();
        return `Clicked: ${btn.textContent?.trim()}`;
      }
    }
    return 'No mahalle button found';
  });
  
  console.log("\nClick result:", clickResult);
  await new Promise(r => setTimeout(r, 5000));

  // Check DOM again
  const domInfo2 = await page.evaluate(() => {
    const listboxes = document.querySelectorAll('[role="listbox"]');
    const results: Record<string, unknown> = {};
    listboxes.forEach((lb, idx) => {
      const links = lb.querySelectorAll('a');
      if (links.length > 0) {
        results[`listbox_${idx}_links`] = links.length;
        results[`listbox_${idx}_first5`] = Array.from(links).slice(0, 5).map(l => l.textContent?.trim());
      }
    });
    return results;
  });
  
  console.log("\nAfter click:");
  for (const [k, v] of Object.entries(domInfo2)) {
    console.log(`  ${k}:`, v);
  }
  
  await browser.close();
  process.exit(0);
})();

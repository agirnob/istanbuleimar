import puppeteerCore from "puppeteer-core";

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  
  // Inject script BEFORE page loads to capture XHR responses
  await page.evaluateOnNewDocument(() => {
    const _xhrProto = XMLHttpRequest.prototype;
    const _originalOpen = _xhrProto.open;
    const _originalSend = _xhrProto.send;
    
    // @ts-ignore
    _xhrProto.open = function(method, url, ...rest) {
      // @ts-ignore
      this._capturedUrl = url;
      return _originalOpen.apply(this, [method, url, ...rest]);
    };
    
    // @ts-ignore
    _xhrProto.send = function(body) {
      // @ts-ignore
      const url = this._capturedUrl;
      // @ts-ignore
      const originalOnReadyStateChange = this.onreadystatechange;
      
      // @ts-ignore
      this.onreadystatechange = function() {
        if (this.readyState === 4 && url && url.includes('imarsvc')) {
          // @ts-ignore
          if (!window.__capturedData) window.__capturedData = {};
          try {
            // @ts-ignore
            window.__capturedData[url] = JSON.parse(this.responseText);
          } catch {
            // @ts-ignore
            window.__capturedData[url] = this.responseText;
          }
        }
        if (originalOnReadyStateChange) {
          originalOnReadyStateChange.apply(this, arguments);
        }
      };
      
      return _originalSend.apply(this, [body]);
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
        } else if (typeof val === 'string') {
          result[url] = { type: 'string', length: val.length, preview: val.substring(0, 200) };
        } else {
          result[url] = val;
        }
      }
      return result;
    });
    
    console.log("Captured XHR data:");
    console.log(JSON.stringify(captured, null, 2).substring(0, 2000));
    
  } catch (e: unknown) {
    console.error(`Error: ${e}`);
  } finally {
    await browser.close();
  }
})();

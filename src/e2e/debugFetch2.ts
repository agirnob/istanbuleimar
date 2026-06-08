import puppeteerCore from "puppeteer-core";

// Intercept BOTH XHR and fetch
const interceptor = `
(function() {
  console.log('INTERCEPTOR: Loading...');
  
  // Intercept fetch
  var _origFetch = window.fetch;
  window.fetch = function(...args) {
    console.log('INTERCEPTOR: fetch called:', args[0]);
    return _origFetch.apply(this, args).then(function(resp) {
      return resp.clone().text().then(function(text) {
        if (args[0] && args[0].indexOf('imarsvc') !== -1) {
          if (!window.__capturedData) window.__capturedData = {};
          try {
            window.__capturedData[args[0]] = JSON.parse(text);
            console.log('INTERCEPTOR: Captured fetch', args[0]);
          } catch(e) {
            window.__capturedData[args[0]] = text;
          }
        }
        return resp;
      });
    });
  };
  
  // Intercept XHR
  var _xhrProto = XMLHttpRequest.prototype;
  var _originalOpen = _xhrProto.open;
  var _originalSend = _xhrProto.send;

  _xhrProto.open = function(method, url) {
    this._capturedUrl = url;
    console.log('INTERCEPTOR: XHR open:', url);
    return _originalOpen.apply(this, arguments);
  };

  _xhrProto.send = function(body) {
    var capturedUrl = this._capturedUrl;
    var originalHandler = this.onreadystatechange;

    this.onreadystatechange = function() {
      if (this.readyState === 4 && capturedUrl && capturedUrl.indexOf('imarsvc') !== -1) {
        if (!window.__capturedData) window.__capturedData = {};
        try {
          window.__capturedData[capturedUrl] = JSON.parse(this.responseText);
          console.log('INTERCEPTOR: Captured XHR', capturedUrl);
        } catch(e) {
          window.__capturedData[capturedUrl] = this.responseText;
        }
      }
      if (originalHandler) {
        originalHandler.apply(this, arguments);
      }
    };

    return _originalSend.apply(this, arguments);
  };
  console.log('INTERCEPTOR: Ready');
})();
`;

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  
  page.on("console", (msg) => {
    if (msg.text().includes('INTERCEPTOR')) {
      console.log(`PAGE: ${msg.text()}`);
    }
  });

  await page.evaluateOnNewDocument(interceptor);

  console.log("Navigating...");
  await page.goto("https://keos.avcilar.bel.tr/imardurumu/index.aspx", {
    waitUntil: "networkidle2",
    timeout: 20000,
  });
  await new Promise(r => setTimeout(r, 3000));

  const captured = await page.evaluate(() => {
    // @ts-ignore
    return (window as any).__capturedData || null;
  });
  
  console.log("\nCaptured:", captured ? Object.keys(captured).length : 0, "responses");
  if (captured) {
    for (const [k, v] of Object.entries(captured)) {
      console.log(`  ${k}:`, Array.isArray(v) ? `array[${v.length}]` : typeof v);
    }
  }
  
  await browser.close();
  process.exit(0);
})();

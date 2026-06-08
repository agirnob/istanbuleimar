import puppeteerCore from "puppeteer-core";

const xhrInterceptor = `
(function() {
  console.log('INTERCEPTOR: Loading...');
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
          console.log('INTERCEPTOR: Captured', capturedUrl, 'length:', Array.isArray(window.__capturedData[capturedUrl]) ? window.__capturedData[capturedUrl].length : 'N/A');
        } catch(e) {
          window.__capturedData[capturedUrl] = this.responseText;
          console.log('INTERCEPTOR: Captured (raw)', capturedUrl);
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
  
  // Log all console messages
  page.on("console", (msg) => {
    if (msg.text().includes('INTERCEPTOR')) {
      console.log(`PAGE: ${msg.text()}`);
    }
  });

  // Skip heavy resources
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const resourceType = request.resourceType();
    if (resourceType === "image" || resourceType === "font" || resourceType === "media") {
      request.abort();
    } else {
      request.continue();
    }
  });

  await page.evaluateOnNewDocument(xhrInterceptor);

  console.log("Navigating...");
  await page.goto("https://keos.avcilar.bel.tr/imardurumu/index.aspx", {
    waitUntil: "networkidle0",
    timeout: 20000,
  });
  await new Promise(r => setTimeout(r, 3000));

  const captured = await page.evaluate(() => {
    // @ts-ignore
    return (window as any).__capturedData || null;
  });
  
  console.log("\nCaptured:", captured ? Object.keys(captured).length : 0, "responses");
  
  await browser.close();
  process.exit(0);
})();

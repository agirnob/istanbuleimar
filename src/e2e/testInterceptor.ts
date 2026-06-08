import puppeteerCore from "puppeteer-core";

const xhrInterceptor = `
(function() {
  console.log('XHR INTERCEPTOR LOADED');
  var _xhrProto = XMLHttpRequest.prototype;
  var _originalOpen = _xhrProto.open;
  var _originalSend = _xhrProto.send;

  _xhrProto.open = function(method, url) {
    this._capturedUrl = url;
    console.log('XHR OPEN:', url);
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
          console.log('CAPTURED:', capturedUrl, Array.isArray(window.__capturedData[capturedUrl]) ? 'array[' + window.__capturedData[capturedUrl].length + ']' : 'other');
        } catch(e) {
          window.__capturedData[capturedUrl] = this.responseText;
          console.log('CAPTURED (raw):', capturedUrl);
        }
      }
      if (originalHandler) {
        originalHandler.apply(this, arguments);
      }
    };

    return _originalSend.apply(this, arguments);
  };
})();
`;

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  // Capture console logs
  page.on("console", (msg) => {
    console.log(`PAGE: ${msg.text()}`);
  });

  await page.evaluateOnNewDocument(xhrInterceptor);

  try {
    await page.goto("https://keos.avcilar.bel.tr/imardurumu/index.aspx", {
      waitUntil: "networkidle2",
      timeout: 20000,
    });
    await new Promise(r => setTimeout(r, 5000));

    const captured = await page.evaluate(() => {
      // @ts-ignore
      return (window as any).__capturedData || null;
    });
    
    console.log("\nCaptured data:");
    console.log(JSON.stringify(captured, null, 2).substring(0, 500));
    
  } catch (e: unknown) {
    console.error(`Error: ${e}`);
  } finally {
    await browser.close();
  }
})();

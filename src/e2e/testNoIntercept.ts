import { getBrowser } from "@/services/puppeteer/browser";

const xhrInterceptor = `
(function() {
  var _xhrProto = XMLHttpRequest.prototype;
  var _originalOpen = _xhrProto.open;
  var _originalSend = _xhrProto.send;

  _xhrProto.open = function(method, url) {
    this._capturedUrl = url;
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
})();
`;

(async () => {
  const browser = await getBrowser();
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  
  // NO resource interception - just inject and navigate
  await page.evaluateOnNewDocument(xhrInterceptor);
  
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
  
  console.log("Captured:", captured ? Object.keys(captured).length : 0, "responses");
  if (captured) {
    for (const [key, val] of Object.entries(captured)) {
      if (Array.isArray(val)) {
        console.log(`  ${key}: array[${val.length}]`);
      }
    }
  }
  
  await page.close();
  process.exit(0);
})();

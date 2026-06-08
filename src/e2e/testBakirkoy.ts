import puppeteerCore from "puppeteer-core";

(async () => {
  const browser = await puppeteerCore.launch({
    executablePath: "/usr/bin/brave",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    
    // Intercept ALL XHR responses
    await page.evaluateOnNewDocument(`
      (function() {
        var _xhrProto = XMLHttpRequest.prototype;
        var _send = _xhrProto.send;
        window.__allData = [];
        _xhrProto.send = function() {
          var _onload = this.onload;
          this.onload = function() {
            try {
              var data = JSON.parse(this.responseText);
              if (Array.isArray(data)) {
                window.__allData.push({
                  url: this._url || "unknown",
                  count: data.length,
                  firstKeys: data[0] ? Object.keys(data[0]).join(",") : "empty"
                });
              }
            } catch(e) {}
            if (_onload) _onload.apply(this, arguments);
          };
          this._url = this._url || "";
          return _send.apply(this, arguments);
        };
      })();
    `);

    await page.goto("https://keos.bakirkoy.bel.tr/imardurumu/index.aspx", {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    await new Promise((r) => setTimeout(r, 5000));

    const result = await page.evaluate(() => {
      return (window as any).__allData || [];
    });

    console.log("All captured data:");
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
  }
})();

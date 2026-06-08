import puppeteerCore from "puppeteer-core";

export type PuppeteerBrowser = ReturnType<typeof puppeteerCore.launch> extends Promise<infer T>
  ? T
  : never;

let browserInstance: PuppeteerBrowser | null = null;

export async function getBrowser(): Promise<PuppeteerBrowser> {
  if (browserInstance) {
    try {
      await browserInstance.pages();
      return browserInstance;
    } catch {
      browserInstance = null;
    }
  }

  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/brave";

  browserInstance = await puppeteerCore.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--window-size=1920,1080",
    ],
  });

  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Comprehensive test for all Istanbul district KEOS API endpoints.
 * Uses Puppeteer to test districts that block direct fetch.
 * Tests mahalle (neighborhood) API endpoints for each district.
 *
 * Run with: npx vitest run src/e2e/districts.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getBrowser } from "@/services/puppeteer/browser";
import { MUNICIPALITIES, getMunicipality } from "@/lib/turkishFetch";
import { getScraper, resetRegistry } from "@/services/scraper/registry";
import { initAdapters } from "@/adapters";

interface MahalleResult {
  OBJECTID: number;
  ADI_NUMARASI: string;
}

interface TestResult {
  key: string;
  name: string;
  usePuppeteer: boolean;
  status: "pass" | "fail" | "skip";
  mahalleCount: number;
  error?: string;
  firstMahalle?: string;
}

describe("District API Endpoints - Full Coverage Test", () => {
  let browser: ReturnType<typeof getBrowser> extends Promise<infer T> ? T : never;
  const results: TestResult[] = [];

  beforeAll(async () => {
    // Initialize adapters registry
    await initAdapters();
    // Get browser instance
    browser = await getBrowser();
  });

  afterAll(async () => {
    resetRegistry();
  });

  it("should have all municipalities configured", () => {
    expect(MUNICIPALITIES.length).toBeGreaterThan(0);
    console.log(`Total municipalities configured: ${MUNICIPALITIES.length}`);
  });

  it("should have scrapers registered for all municipalities", () => {
    for (const muni of MUNICIPALITIES) {
      const scraper = getScraper(muni.key);
      expect(scraper).toBeDefined();
    }
  });

  // Test each district's mahalle API endpoint
  for (const muni of MUNICIPALITIES) {
    it(`should fetch mahalleler for ${muni.name} (${muni.key})`, async () => {
      const timeout = 30000; // 30s timeout per district
      const result: TestResult = {
        key: muni.key,
        name: muni.name,
        usePuppeteer: !!muni.usePuppeteer,
        status: "fail",
        mahalleCount: 0,
      };

      try {
        const page = await browser.newPage();
        
        // Set longer timeout for navigation
        page.setDefaultTimeout(15000);
        page.setDefaultNavigationTimeout(15000);

        // Navigate to base URL to establish session
        await page.goto(muni.baseUrl, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });

        // Fetch mahalle data from page context
        const apiUrl = `${muni.serviceUrl}?type=mahalle`;
        const fetchResult = await page.evaluate(
          async (url: string, referer: string) => {
            try {
              const resp = await fetch(url, {
                headers: {
                  Accept: "application/json",
                  Referer: referer,
                },
              });
              if (!resp.ok) {
                return { error: `HTTP ${resp.status}`, data: null };
              }
              const text = await resp.text();
              try {
                const data = JSON.parse(text);
                return { error: null, data };
              } catch {
                return { error: `JSON parse failed: ${text.substring(0, 200)}`, data: null };
              }
            } catch (e: unknown) {
              return {
                error: e instanceof Error ? e.message : String(e),
                data: null,
              };
            }
          },
          apiUrl,
          muni.refererUrl
        );

        if (fetchResult.error) {
          result.error = fetchResult.error;
          console.error(`❌ ${muni.name}: ${fetchResult.error}`);
        } else if (!Array.isArray(fetchResult.data)) {
          result.error = "Response is not an array";
          console.error(`❌ ${muni.name}: Response is not an array`);
        } else {
          const mahalleler: MahalleResult[] = fetchResult.data;
          result.mahalleCount = mahalleler.length;
          result.firstMahalle = mahalleler[0]?.ADI_NUMARASI;
          
          if (mahalleler.length > 0) {
            result.status = "pass";
            console.log(`✅ ${muni.name}: ${mahalleler.length} mahalleler (first: ${mahalleler[0].ADI_NUMARASI})`);
          } else {
            result.error = "Empty response array";
            console.log(`⚠️  ${muni.name}: Empty mahalle list`);
          }
        }

        await page.close();
      } catch (error: unknown) {
        result.error = error instanceof Error ? error.message : String(error);
        console.error(`❌ ${muni.name}: ${result.error}`);
      }

      results.push(result);

      // Assert that the request completed (even if it failed - we want to see all results)
      expect(result).toBeDefined();
    }, 30000);
  }

  // Summary report
  it("should print test summary", () => {
    const passCount = results.filter((r) => r.status === "pass").length;
    const failCount = results.filter((r) => r.status === "fail").length;
    const emptyCount = results.filter((r) => r.error === "Empty response array").length;

    console.log("\n" + "=".repeat(60));
    console.log("DISTRICT API TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total districts: ${results.length}`);
    console.log(`✅ Passing: ${passCount}`);
    console.log(`❌ Failing: ${failCount}`);
    console.log(`⚠️  Empty lists: ${emptyCount}`);
    console.log("-".repeat(60));

    if (failCount > 0) {
      console.log("\nFAILED DISTRICTS:");
      for (const r of results.filter((x) => x.status === "fail")) {
        console.log(`  ❌ ${r.name} (${r.key}): ${r.error}`);
      }
    }

    if (emptyCount > 0) {
      console.log("\nDISTRICTS WITH EMPTY LISTS:");
      for (const r of results.filter((x) => x.error === "Empty response array")) {
        console.log(`  ⚠️  ${r.name} (${r.key})`);
      }
    }

    console.log("-".repeat(60));
    console.log("PASSING DISTRICTS:");
    for (const r of results.filter((x) => x.status === "pass")) {
      console.log(`  ✅ ${r.name}: ${r.mahalleCount} mahalleler`);
    }
    console.log("=".repeat(60));

    // Assert all districts passed
    expect(failCount).toBe(0);
    expect(emptyCount).toBe(0);
  });
});

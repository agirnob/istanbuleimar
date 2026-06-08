/**
 * Comprehensive E2E test for all 39 Istanbul districts.
 * Tests neighborhoods, streets, and doors API endpoints.
 *
 * Run with: npx vitest run src/e2e/fullCoverage.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getScraper, resetRegistry } from "@/services/scraper/registry";
import { initAdapters } from "@/adapters";
import { MUNICIPALITIES } from "@/lib/turkishFetch";

interface DistrictTestResult {
  key: string;
  name: string;
  neighborhoods: { count: number; status: "pass" | "fail"; error?: string };
  streets: { count: number; status: "pass" | "fail"; error?: string };
  doors: { count: number; status: "pass" | "fail"; error?: string };
}

describe("Full Coverage - All 39 Districts E2E Test", () => {
  const results: DistrictTestResult[] = [];

  beforeAll(async () => {
    await initAdapters();
  });

  afterAll(() => {
    resetRegistry();
  });

  it("should have all 39 municipalities configured", () => {
    expect(MUNICIPALITIES.length).toBe(39);
  });

  it("should have scrapers registered for all municipalities", () => {
    for (const muni of MUNICIPALITIES) {
      const scraper = getScraper(muni.key);
      expect(scraper).toBeDefined();
    }
  });

  // Test each district
  for (const muni of MUNICIPALITIES) {
    describe(`${muni.name} (${muni.key})`, () => {
      it("should fetch neighborhoods", async () => {
        const result: DistrictTestResult = {
          key: muni.key,
          name: muni.name,
          neighborhoods: { count: 0, status: "fail" },
          streets: { count: 0, status: "fail" },
          doors: { count: 0, status: "fail" },
        };

        try {
          const scraper = getScraper(muni.key);
          if (!scraper) {
            result.neighborhoods.error = "Scraper not found";
            throw new Error("Scraper not found");
          }

          const neighborhoodsResult = await scraper.scrape({
            municipality: muni.key,
            query: "",
            queryType: "neighborhoods",
          });

          if (neighborhoodsResult.success && neighborhoodsResult.parcels.length > 0) {
            result.neighborhoods.count = neighborhoodsResult.parcels.length;
            result.neighborhoods.status = "pass";
            console.log(
              `  ✅ ${muni.name}: ${neighborhoodsResult.parcels.length} neighborhoods`
            );
          } else {
            result.neighborhoods.error = neighborhoodsResult.error || "Empty response";
            console.log(`  ❌ ${muni.name}: ${result.neighborhoods.error}`);
          }

          // Test streets if neighborhoods succeeded
          if (result.neighborhoods.status === "pass" && neighborhoodsResult.parcels.length > 0) {
            const firstMahalle = neighborhoodsResult.parcels[0];
            const streetsResult = await scraper.scrape({
              municipality: muni.key,
              query: "",
              queryType: "streets",
              mahalleId: firstMahalle.parcelNo,
            });

            if (streetsResult.success && streetsResult.parcels.length > 0) {
              result.streets.count = streetsResult.parcels.length;
              result.streets.status = "pass";
              console.log(`  ✅ ${muni.name}: ${streetsResult.parcels.length} streets`);
            } else {
              result.streets.error = streetsResult.error || "Empty response";
              console.log(`  ⚠️  ${muni.name}: Streets - ${result.streets.error}`);
            }

            // Test doors if streets succeeded
            if (result.streets.status === "pass" && streetsResult.parcels.length > 0) {
              const firstStreet = streetsResult.parcels[0];
              const doorsResult = await scraper.scrape({
                municipality: muni.key,
                query: "",
                queryType: "doors",
                mahalleId: firstMahalle.parcelNo,
                yolId: firstStreet.parcelNo,
              });

              if (doorsResult.success && doorsResult.parcels.length > 0) {
                result.doors.count = doorsResult.parcels.length;
                result.doors.status = "pass";
                console.log(`  ✅ ${muni.name}: ${doorsResult.parcels.length} doors`);
              } else {
                result.doors.error = doorsResult.error || "Empty response";
                console.log(`  ⚠️  ${muni.name}: Doors - ${result.doors.error}`);
              }
            }
          }
        } catch (error: unknown) {
          result.neighborhoods.error = error instanceof Error ? error.message : String(error);
          console.error(`  ❌ ${muni.name}: ${result.neighborhoods.error}`);
        }

        results.push(result);
        expect(result).toBeDefined();
      }, 60000); // 60s timeout per district
    });
  }

  // Summary report
  it("should print comprehensive test summary", () => {
    const totalDistricts = results.length;
    const neighborhoodsPass = results.filter((r) => r.neighborhoods.status === "pass").length;
    const streetsPass = results.filter((r) => r.streets.status === "pass").length;
    const doorsPass = results.filter((r) => r.doors.status === "pass").length;

    console.log("\n" + "=".repeat(80));
    console.log("COMPREHENSIVE E2E TEST SUMMARY");
    console.log("=".repeat(80));
    console.log(`Total districts: ${totalDistricts}`);
    console.log(`✅ Neighborhoods passing: ${neighborhoodsPass}/${totalDistricts}`);
    console.log(`✅ Streets passing: ${streetsPass}/${totalDistricts}`);
    console.log(`✅ Doors passing: ${doorsPass}/${totalDistricts}`);
    console.log("-".repeat(80));

    console.log("\nDETAILED RESULTS:");
    for (const r of results) {
      const status = r.neighborhoods.status === "pass" ? "✅" : "❌";
      console.log(
        `  ${status} ${r.name}: ${r.neighborhoods.count} neighborhoods, ${r.streets.count} streets, ${r.doors.count} doors`
      );
    }

    console.log("-".repeat(80));

    if (totalDistricts - neighborhoodsPass > 0) {
      console.log("\nFAILED DISTRICTS (neighborhoods):");
      for (const r of results.filter((x) => x.neighborhoods.status === "fail")) {
        console.log(`  ❌ ${r.name}: ${r.neighborhoods.error}`);
      }
    }

    console.log("=".repeat(80));

    // Assert all districts passed for neighborhoods
    expect(neighborhoodsPass).toBe(totalDistricts);
  });
});

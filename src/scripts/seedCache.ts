/**
 * Script to fetch and save district data to a local JSON cache.
 * Run with: npx tsx src/scripts/seedCache.ts
 */
import { MoskbilisimScraper } from "../adapters/moskbilisim.ts";
import fs from "fs";
import path from "path";
import { ScrapeQuery } from "../types/parcel.ts";

const CACHE_PATH = path.join(process.cwd(), "src", "data", "cache", "districts.json");

interface DistrictCache {
  neighborhoods: Array<{ id: string; name: string }>;
  streets: Record<string, Array<{ id: string; name: string }>>;
  doors: Record<string, Array<{ id: string; number: string }>>;
}

async function seedEsenyurt() {
  console.log("🌱 Seeding Esenyurt...");
  const scraper = new MoskbilisimScraper("esenyurt");
  const cache: DistrictCache = { neighborhoods: [], streets: {}, doors: {} };

  // 1. Fetch Neighborhoods
  const neighborhoodsResult = await scraper.scrape({
    queryType: "neighborhoods",
    municipality: "esenyurt",
    query: "esenyurt",
  });
  if (!neighborhoodsResult.success || !neighborhoodsResult.parcels.length) {
    console.error("❌ Failed to fetch neighborhoods for Esenyurt");
    return false;
  }

  for (const p of neighborhoodsResult.parcels) {
    cache.neighborhoods.push({ id: p.parcelNo, name: p.neighborhood || "Unknown" });
  }
  console.log(`✅ Fetched ${cache.neighborhoods.length} neighborhoods`);

  // 2. Fetch Streets for each neighborhood
  for (const n of cache.neighborhoods) {
    const streetsResult = await scraper.scrape({
      queryType: "streets",
      municipality: "esenyurt",
      query: n.id,
      mahalleId: n.id,
    });
    if (streetsResult.success && streetsResult.parcels.length) {
      cache.streets[n.id] = streetsResult.parcels.map((p: any) => ({
        id: p.parcelNo,
        name: p.neighborhood || "Unknown",
      }));
    }
  }
  console.log(`✅ Fetched streets for ${Object.keys(cache.streets).length} neighborhoods`);

  // 3. Fetch Doors (only for first neighborhood to keep cache small for demo)
  const firstN = cache.neighborhoods[0];
  if (firstN && cache.streets[firstN.id]) {
    for (const s of cache.streets[firstN.id]) {
      const doorsResult = await scraper.scrape({
        queryType: "doors",
        municipality: "esenyurt",
        query: `${firstN.id}_${s.id}`,
        mahalleId: firstN.id,
        yolId: s.id,
      });
      if (doorsResult.success && doorsResult.parcels.length) {
        cache.doors[`${firstN.id}_${s.id}`] = doorsResult.parcels.map((p: any) => ({
          id: p.parcelNo,
          number: p.parcelNo,
        }));
      }
    }
  }

  // Save to file
  fs.writeFileSync(CACHE_PATH, JSON.stringify({ esenyurt: cache }, null, 2));
  console.log("💾 Cache saved to src/data/cache/districts.json");
  return true;
}

async function main() {
  await seedEsenyurt();
}

main().catch(console.error);

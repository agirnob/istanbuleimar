// Script to pre-seed mahalle data for all configured municipalities
// Run: npx tsx src/scripts/seedMahalleData.ts

import { MUNICIPALITIES } from "@/lib/turkishFetch";
import fs from "fs";
import path from "path";

interface MahalleItem {
  OBJECTID: number;
  ADI_NUMARASI: string;
}

const CACHE_FILE = path.join(process.cwd(), "src", "data", "mahalle-cache.json");

function loadCache(): Record<string, MahalleItem[]> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
    }
  } catch {
    // Ignore
  }
  return {};
}

function saveCache(cache: Record<string, MahalleItem[]>): void {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function fetchDirect(config: { key: string; serviceUrl: string; refererUrl: string }): Promise<MahalleItem[]> {
  try {
    const resp = await fetch(`${config.serviceUrl}?type=mahalle`, {
      headers: {
        Accept: "application/json",
        Referer: config.refererUrl,
      },
    });
    if (!resp.ok) {
      console.log(`  ✗ ${config.key}: direct fetch HTTP ${resp.status}`);
      return [];
    }
    const arrayBuffer = await resp.arrayBuffer();
    const decoder = new TextDecoder("iso-8859-9");
    const text = decoder.decode(arrayBuffer);
    const data: MahalleItem[] = JSON.parse(text);
    console.log(`  ✓ ${config.key}: ${data.length} mahalle items (direct)`);
    return data;
  } catch (error) {
    console.log(`  ✗ ${config.key}: direct fetch error: ${error}`);
    return [];
  }
}

async function main() {
  console.log("Seeding mahalle data for all configured municipalities...\n");

  const cache = loadCache();
  let updated = 0;

  for (const municipality of MUNICIPALITIES) {
    // Skip if already cached
    if (cache[municipality.key] && cache[municipality.key].length > 0) {
      console.log(`  ⊘ ${municipality.key}: already cached (${cache[municipality.key].length} items)`);
      continue;
    }

    // Try direct fetch
    const data = await fetchDirect({
      key: municipality.key,
      serviceUrl: municipality.serviceUrl,
      refererUrl: municipality.refererUrl,
    });

    if (data.length > 0) {
      cache[municipality.key] = data;
      updated++;
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 1000));
  }

  saveCache(cache);
  console.log(`\nSaved cache with ${Object.keys(cache).length} districts (${updated} updated)`);
}

main().catch(console.error);

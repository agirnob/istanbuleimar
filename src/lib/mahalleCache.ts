import { MUNICIPALITIES, MunicipalityConfig } from "./turkishFetch";
import fs from "fs";
import path from "path";

const CACHE_FILE = path.join(process.cwd(), "src", "data", "mahalle-cache.json");

interface MahalleCache {
  [key: string]: Array<{ OBJECTID: number; ADI_NUMARASI: string }>;
}

/**
 * Load cached mahalle data from JSON file.
 */
export function loadMahalleCache(): MahalleCache {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, "utf-8");
      return JSON.parse(data) as MahalleCache;
    }
  } catch {
    // Ignore cache errors
  }
  return {};
}

/**
 * Get cached mahalle data for a municipality.
 * Returns null if not cached.
 */
export function getCachedMahalle(municipalityKey: string): Array<{ OBJECTID: number; ADI_NUMARASI: string }> | null {
  const cache = loadMahalleCache();
  return cache[municipalityKey] ?? null;
}

/**
 * Save mahalle data to cache file.
 */
export function saveMahalleToCache(municipalityKey: string, data: Array<{ OBJECTID: number; ADI_NUMARASI: string }>): void {
  try {
    const cache = loadMahalleCache();
    cache[municipalityKey] = data;
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error(`[mahalleCache] Failed to save cache: ${error}`);
  }
}

/**
 * Get mahalle data: try cache first, then fetch if needed.
 */
export async function getMahalleData(config: MunicipalityConfig): Promise<Array<{ OBJECTID: number; ADI_NUMARASI: string }>> {
  // Try cache first
  const cached = getCachedMahalle(config.key);
  if (cached && cached.length > 0) {
    console.log(`[mahalleCache] HIT for ${config.key} (${cached.length} items)`);
    return cached;
  }

  console.log(`[mahalleCache] MISS for ${config.key}, fetching...`);

  try {
    // Try Puppeteer fetch for districts that need it
    if (config.usePuppeteer) {
      const { puppeteerFetch } = await import("./puppeteerFetch");
      const data = await puppeteerFetch<{ OBJECTID: number; ADI_NUMARASI: string }>(config, "type=mahalle");
      saveMahalleToCache(config.key, data);
      return data;
    }

    // Direct fetch for standard KEOS districts
    const { getMahallelerFor } = await import("./turkishFetch");
    const data = await getMahallelerFor(config);
    saveMahalleToCache(config.key, data);
    return data;
  } catch (error) {
    console.error(`[mahalleCache] Fetch failed for ${config.key}: ${error}`);
    // Return empty array as last resort
    return [];
  }
}

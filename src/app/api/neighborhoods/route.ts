import { NextRequest, NextResponse } from "next/server";
import { validateMunicipality, rateLimiter, getClientIp } from "@/lib/sanitization";
import { getMunicipality, getMahallelerFor } from "@/lib/turkishFetch";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimiter.isAllowed(ip)) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen bekleyin" }, { status: 429 });
  }

  const searchParams = request.nextUrl.searchParams;
  const municipalityKey = validateMunicipality(searchParams.get("municipality")) || "eyupsultan";

  console.log(`[API/neighborhoods] Request: municipality=${municipalityKey}`);

  try {
    const config = getMunicipality(municipalityKey);
    if (!config) {
      return NextResponse.json({ error: `Belediye bulunamadı: ${municipalityKey}` }, { status: 404 });
    }

    // Check if this is a non-KEOS platform
    const isNonKeosPlatform =
      municipalityKey === "esenyurt" ||
      ["fatih", "sariyer", "beykoz", "beylikduzu", "sultanbeyli", "kagithane", "uskudar", "arnavutkoy"].includes(municipalityKey);

    if (isNonKeosPlatform) {
      // Use scraper for non-KEOS platforms
      const { getScraper } = await import("@/services/scraper/registry");
      const { initAdapters } = await import("@/adapters");

      await initAdapters();

      const scraper = getScraper(municipalityKey);
      if (!scraper) {
        return NextResponse.json({ error: `Belediye bulunamadı: ${municipalityKey}` }, { status: 404 });
      }

      const result = await scraper.scrape({
        municipality: municipalityKey,
        query: "",
        queryType: "neighborhoods",
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        neighborhoods: result.parcels.map((p) => ({
          id: p.parcelNo,
          name: p.neighborhood,
        })),
        count: result.parcels.length,
        municipality: municipalityKey,
      });
    }

    // Use KEOS-specific fetch for KEOS platforms
    const neighborhoods = await getMahallelerFor(config);

    return NextResponse.json({
      neighborhoods,
      count: neighborhoods.length,
      municipality: municipalityKey,
    });
  } catch (error) {
    console.error(`[API/neighborhoods] Error: ${error}`);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Mahalle bilgisi alınamadı" },
      { status: 500 }
    );
  }
}

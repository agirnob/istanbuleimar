import { NextRequest, NextResponse } from "next/server";
import { validateMunicipality, rateLimiter, getClientIp } from "@/lib/sanitization";
import { getMunicipality, getKapilarFor } from "@/lib/turkishFetch";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimiter.isAllowed(ip)) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen bekleyin" }, { status: 429 });
  }

  const searchParams = request.nextUrl.searchParams;
  const municipalityKey = validateMunicipality(searchParams.get("municipality")) || "eyupsultan";
  const mahalleId = searchParams.get("mahalleId");
  const sokakId = searchParams.get("sokakId");

  if (!mahalleId) {
    return NextResponse.json({ error: "Geçerli mahalle ID gerekli (mahalleId)" }, { status: 400 });
  }
  if (!sokakId) {
    return NextResponse.json({ error: "Geçerli sokak ID gerekli (sokakId)" }, { status: 400 });
  }

  console.log(`[API/kapilar] Request: municipality=${municipalityKey}, mahalleId=${mahalleId}, sokakId=${sokakId}`);

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
        queryType: "doors",
        mahalleId,
        yolId: sokakId,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({
        kapilar: result.parcels.map((p) => ({
          PARSEL_ID: parseInt(p.parcelNo, 10) || null,
          KAPI_NO: p.neighborhood,
        })),
        count: result.parcels.length,
        municipality: municipalityKey,
      });
    }

    // Use KEOS-specific fetch for KEOS platforms
    const mahalleIdNum = parseInt(mahalleId, 10);
    const sokakIdNum = parseInt(sokakId, 10);
    if (isNaN(mahalleIdNum) || mahalleIdNum <= 0) {
      return NextResponse.json({ error: "Geçerli mahalle ID gerekli (mahalleId)" }, { status: 400 });
    }
    if (isNaN(sokakIdNum) || sokakIdNum <= 0) {
      return NextResponse.json({ error: "Geçerli sokak ID gerekli (sokakId)" }, { status: 400 });
    }

    const kapilar = await getKapilarFor(config, mahalleIdNum, sokakIdNum);

    return NextResponse.json({
      kapilar,
      count: kapilar.length,
      municipality: municipalityKey,
    });
  } catch (error) {
    console.error(`[API/kapilar] Error: ${error}`);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Kapı bilgisi alınamadı" },
      { status: 500 }
    );
  }
}

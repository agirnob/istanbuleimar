import { NextRequest, NextResponse } from "next/server";
import { sanitizeInput, validateMunicipality, rateLimiter, getClientIp } from "@/lib/sanitization";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimiter.isAllowed(ip)) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen bekleyin" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const municipality = validateMunicipality(body.municipality) || "eyupsultan";
    const query = sanitizeInput(body.query);
    const queryType = (sanitizeInput(body.queryType) || "parcel") as "parcel" | "block" | "neighborhood";

    if (!query) {
      return NextResponse.json({ error: "Sorgu gerekli (query)" }, { status: 400 });
    }

    console.log(`[API/scrape] Request: municipality=${municipality}, query="${query}", type=${queryType}`);

    // Lazy import to avoid ESM issues during build
    const { getScraper } = await import("@/services/scraper/registry");
    const { initAdapters } = await import("@/adapters");

    await initAdapters();

    const scraper = getScraper(municipality);
    if (!scraper) {
      return NextResponse.json({ error: `Belediye bulunamadı: ${municipality}` }, { status: 404 });
    }

    const result = await scraper.scrape({ municipality, query, queryType });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      parcels: result.parcels,
      count: result.parcels.length,
      municipality,
    });
  } catch (error) {
    console.error(`[API/scrape] Error: ${error}`);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "İşlem hatası" },
      { status: 500 }
    );
  }
}

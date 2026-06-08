import { NextRequest, NextResponse } from "next/server";
import { getScraper } from "@/services/scraper/registry";
import { validateParcelId, validateMunicipality, rateLimiter, getClientIp } from "@/lib/sanitization";

export const dynamic = "force-dynamic";
import "@/adapters";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getClientIp(request);
  if (!rateLimiter.isAllowed(ip)) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen bekleyin" }, { status: 429 });
  }

  const parcelId = validateParcelId(params.id);
  if (!parcelId) {
    return NextResponse.json({ error: "Geçersiz parsel ID" }, { status: 400 });
  }

  const municipality = validateMunicipality(
    request.nextUrl.searchParams.get("municipality")
  ) || "eyupsultan";

  console.log(`[API/parcels/id] Request: id=${parcelId}, municipality=${municipality}`);

  const scraper = getScraper(municipality);
  if (!scraper) {
    return NextResponse.json({ error: `Belediye bulunamadı: ${municipality}` }, { status: 404 });
  }

  // Check cache first
  const cached = await import("@/lib/db").then(m => m.getParcelByObjectId(parcelId));
  if (cached) {
    return NextResponse.json({
      parcel: cached,
      _cached: true,
    });
  }

  const result = await scraper.scrape({
    municipality,
    query: String(parcelId),
    queryType: "parcel",
  });

  if (!result.success || !result.parcels.length) {
    return NextResponse.json({ error: result.error || "Parsel bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({
    parcels: result.parcels,
    count: result.parcels.length,
    municipality,
  });
}

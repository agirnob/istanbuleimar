import { NextRequest, NextResponse } from "next/server";
import { getScraper } from "@/services/scraper/registry";
import { sanitizeParcelQuery, validateMunicipality, rateLimiter, getClientIp } from "@/lib/sanitization";

export const dynamic = "force-dynamic";
import "@/adapters";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimiter.isAllowed(ip)) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen bekleyin" }, { status: 429 });
  }

  const searchParams = request.nextUrl.searchParams;
  const municipalityRaw = searchParams.get("municipality");
  const municipality = validateMunicipality(municipalityRaw) || "eyupsultan";
  const query = sanitizeParcelQuery(searchParams.get("q"));

  console.log(`[API/parcels] Request: municipality=${municipality}, q="${query}"`);

  if (!query) {
    return NextResponse.json({ error: "Sorgu parametresi gerekli (q)" }, { status: 400 });
  }

  const scraper = getScraper(municipality);
  if (!scraper) {
    console.log(`[API/parcels] No scraper for municipality: ${municipality}`);
    return NextResponse.json({ error: `Belediye bulunamadı: ${municipality}` }, { status: 404 });
  }

  const result = await scraper.scrape({ municipality, query, queryType: "parcel" });

  console.log(`[API/parcels] Result: success=${result.success}, parcels=${result.parcels?.length || 0}`);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    parcels: result.parcels,
    count: result.parcels.length,
    municipality,
  });
}

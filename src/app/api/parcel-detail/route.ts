import { NextRequest, NextResponse } from "next/server";
import { validateParcelId, validateMunicipality, rateLimiter, getClientIp } from "@/lib/sanitization";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimiter.isAllowed(ip)) {
    return NextResponse.json({ error: "Çok fazla istek, lütfen bekleyin" }, { status: 429 });
  }

  const searchParams = request.nextUrl.searchParams;
  const parcelId = validateParcelId(searchParams.get("id"));
  const municipality = validateMunicipality(searchParams.get("municipality")) || "eyupsultan";

  if (!parcelId) {
    return NextResponse.json({ error: "Parsel ID gerekli (id)" }, { status: 400 });
  }

  console.log(`[API/parcel-detail] Request: id=${parcelId}, municipality=${municipality}`);

  try {
    // Lazy import to avoid ESM issues during build
    const { scrapeImarDetail } = await import("@/services/puppeteer/imarDetailScraper");
    const result = await scrapeImarDetail(parcelId, municipality);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`[API/parcel-detail] Error: ${error}`);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "İmar detay alınamadı" },
      { status: 500 }
    );
  }
}

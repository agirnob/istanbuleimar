import { NextRequest, NextResponse } from "next/server";
import { getScraper, getAvailableMunicipalities } from "@/services/scraper/registry";
import "@/adapters";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { municipality, query, queryType } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Sorgu gerekli" },
        { status: 400 }
      );
    }

    const scraper = getScraper(municipality || "eyupsultan");
    if (!scraper) {
      return NextResponse.json(
        { error: "Belediye bulunamadı", available: getAvailableMunicipalities() },
        { status: 404 }
      );
    }

    const result = await scraper.scrape({
      municipality: scraper.municipality,
      query,
      queryType: queryType || "parcel",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      parcels: result.parcels,
      count: result.parcels.length,
      sourceUrl: result.sourceUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "İşlem hatası" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    municipalities: getAvailableMunicipalities(),
  });
}

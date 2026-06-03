import { NextRequest, NextResponse } from "next/server";
import {
  getMunicipality,
  getMahallelerFor,
  MUNICIPALITIES,
} from "@/lib/turkishFetch";
import { getMahallelerViaPuppeteer } from "@/services/puppeteer/mahallelerScraper";

// Municipalities that require Puppeteer due to 403 on direct fetch
const PUPPETEER_MUNICIPALITIES = new Set([
  "avcilar",
  "bakirkoy",
  "esenler",
  "kucukcekmece",
  "kadikoy",
  "atasehir",
  "umraniye",
  "basaksehir",
  "maltepe",
  "tuzla",
  "sultangazi",
  "catalca",
  "bcekmece",
]);

export async function GET(request: NextRequest) {
  const municipality =
    request.nextUrl.searchParams.get("municipality") || "eyupsultan";
  console.log(`[API/neighborhoods] Request: municipality=${municipality}`);

  const config = getMunicipality(municipality);
  if (!config) {
    return NextResponse.json(
      {
        error: `Belediye bulunamadı: ${municipality}`,
        neighborhoods: [],
      },
      { status: 404 }
    );
  }

  try {
    let neighborhoods;

    // Try direct fetch first (works for some municipalities)
    try {
      neighborhoods = await getMahallelerFor(config);
    } catch {
      // Fall back to Puppeteer for 403-protected municipalities
      if (PUPPETEER_MUNICIPALITIES.has(municipality)) {
        console.log(
          `[API/neighborhoods] Direct fetch failed, using Puppeteer for ${municipality}`
        );
        neighborhoods = await getMahallelerViaPuppeteer(municipality);
      } else {
        throw new Error("Mahalle listesi alınamadı");
      }
    }

    console.log(`[API/neighborhoods] Found ${neighborhoods.length} mahalleler`);
    return NextResponse.json({ neighborhoods });
  } catch (err) {
    console.error(`[API/neighborhoods] Error: ${err}`);
    return NextResponse.json(
      { error: "Mahalle listesi alınamadı" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ municipalities: MUNICIPALITIES });
}

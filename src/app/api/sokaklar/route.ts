import { NextRequest, NextResponse } from "next/server";
import { getMunicipality, getSokaklarFor } from "@/lib/turkishFetch";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const municipality = searchParams.get("municipality") || "eyupsultan";
  const mahalleId = searchParams.get("mahalleId");

  console.log(`[API/sokaklar] Request: municipality=${municipality}, mahalleId=${mahalleId}`);

  if (!mahalleId) {
    return NextResponse.json({ sokaklar: [] });
  }

  const config = getMunicipality(municipality);
  if (!config) {
    return NextResponse.json({ error: `Belediye bulunamadı: ${municipality}` }, { status: 404 });
  }

  try {
    const sokaklar = await getSokaklarFor(config, parseInt(mahalleId, 10));
    console.log(`[API/sokaklar] Found ${sokaklar.length} sokaklar`);
    return NextResponse.json({ sokaklar });
  } catch (err) {
    console.error(`[API/sokaklar] Error: ${err}`);
    return NextResponse.json({ error: "Sokak listesi alınamadı" }, { status: 500 });
  }
}

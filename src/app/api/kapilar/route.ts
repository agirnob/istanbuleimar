import { NextRequest, NextResponse } from "next/server";
import { getMunicipality, getKapilarFor } from "@/lib/turkishFetch";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const municipality = searchParams.get("municipality") || "eyupsultan";
  const mahalleId = searchParams.get("mahalleId");
  const sokakId = searchParams.get("sokakId");

  console.log(`[API/kapilar] Request: municipality=${municipality}, mahalleId=${mahalleId}, sokakId=${sokakId}`);

  if (!mahalleId || !sokakId) {
    return NextResponse.json({ kapilar: [] });
  }

  const config = getMunicipality(municipality);
  if (!config) {
    return NextResponse.json({ error: `Belediye bulunamadı: ${municipality}` }, { status: 404 });
  }

  try {
    const kapilar = await getKapilarFor(config, parseInt(mahalleId, 10), parseInt(sokakId, 10));
    console.log(`[API/kapilar] Found ${kapilar.length} kapilar`);
    return NextResponse.json({ kapilar });
  } catch (err) {
    console.error(`[API/kapilar] Error: ${err}`);
    return NextResponse.json({ error: "Kapı listesi alınamadı" }, { status: 500 });
  }
}

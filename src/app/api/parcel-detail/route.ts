import { NextRequest, NextResponse } from "next/server";
import { getMunicipality, getParcelInfoFor } from "@/lib/turkishFetch";
import { scrapeImarDetail } from "@/services/puppeteer/imarDetailScraper";
import { upsertParcel } from "@/lib/db";
import "@/adapters";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const municipality = searchParams.get("municipality") || "eyupsultan";

  console.log(`[API/parcel-detail] Request: id=${id}, municipality=${municipality}`);

  if (!id) {
    return NextResponse.json({ error: "Parsel ID gerekli (id)" }, { status: 400 });
  }

  const parcelId = parseInt(id, 10);
  if (isNaN(parcelId)) {
    return NextResponse.json({ error: "Geçersiz parsel ID" }, { status: 400 });
  }

  const config = getMunicipality(municipality);
  if (!config) {
    console.log(`[API/parcel-detail] Unknown municipality: ${municipality}`);
    return NextResponse.json({ error: `Belediye bulunamadı: ${municipality}` }, { status: 404 });
  }

  try {
    console.log(`[API/parcel-detail] Getting parcel detail for id=${parcelId}, municipality=${config.key}`);
    const data = await getParcelInfoFor(config, parcelId);

    if (!data.length) {
      console.log(`[API/parcel-detail] Parcel not found`);
      return NextResponse.json({ error: "Parsel bulunamadı" }, { status: 404 });
    }

    const item = data[0];
    const [ada, parsel] = item.ADAPARSEL.split("/").map((s) => s.trim());

    console.log(`[API/parcel-detail] Basic: ada=${ada}, parsel=${parsel}, mahalle=${item.TAPU_MAH_ADI}`);

    let planInfo = undefined;
    let kadastroInfo = undefined;
    let mapImage = undefined;

    try {
      console.log(`[API/parcel-detail] Starting Puppeteer scrape...`);
      const detailData = await scrapeImarDetail(parcelId, config.key);
      if (detailData.error) {
        console.log(`[API/parcel-detail] Puppeteer error: ${detailData.error}`);
      } else {
        planInfo = detailData.planInfo;
        kadastroInfo = detailData.kadastroInfo;
        mapImage = detailData.mapImage;
        console.log(`[API/parcel-detail] Puppeteer done. Plan: ${planInfo ? "yes" : "no"}, Kadastro: ${kadastroInfo ? "yes" : "no"}, MapImage: ${mapImage ? "yes" : "no"}`);
      }
    } catch (err) {
      console.error(`[API/parcel-detail] Puppeteer scrape failed: ${err}`);
    }

    try {
      await upsertParcel({
        objectId: parcelId,
        parcelNo: String(item.OBJECTID),
        plotNo: parsel || undefined,
        block: ada || undefined,
        neighborhood: item.TAPU_MAH_ADI || undefined,
        municipality: config.key,
        sourceUrl: `${config.detailUrl}?parselid=${item.OBJECTID}`,
        planInfo,
        kadastroInfo,
      });
      console.log(`[API/parcel-detail] Saved to DB`);
    } catch (dbErr) {
      console.error(`[API/parcel-detail] DB save failed: ${dbErr}`);
    }

    return NextResponse.json({
      parcelNo: String(item.OBJECTID),
      plotNo: parsel,
      block: ada,
      neighborhood: item.TAPU_MAH_ADI,
      municipality: config.key,
      district: config.name,
      sourceUrl: `${config.detailUrl}?parselid=${item.OBJECTID}`,
      planInfo,
      kadastroInfo,
      mapImage,
    });
  } catch (err) {
    console.error(`[API/parcel-detail] Unhandled error: ${err}`);
    return NextResponse.json({ error: "İşlem hatası" }, { status: 500 });
  }
}

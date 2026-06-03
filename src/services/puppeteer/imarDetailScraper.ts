import { getBrowser } from "./browser";
import { ZoningPlanInfo, ZoningKadastroInfo, parseDMSToDecimal } from "@/types/zoning";
import { getMunicipality, getDefaultMunicipality } from "@/lib/turkishFetch";

interface TablePair {
  label: string;
  value: string;
}

export async function scrapeImarDetail(
  parcelId: number,
  municipalityKey: string = "eyupsultan",
  timeout: number = 15000
): Promise<{
  planInfo?: ZoningPlanInfo;
  kadastroInfo?: ZoningKadastroInfo;
  mapImage?: string;
  error?: string;
}> {
  const config = getMunicipality(municipalityKey) || getDefaultMunicipality();
  console.log(`[imarDetailScraper] Starting scrape for parcelId=${parcelId}, municipality=${config.key}`);

  try {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    page.on("console", (msg) => {
      console.log(`[imarDetailScraper] [page-console] ${msg.text()}`);
    });

    page.on("pageerror", (err) => {
      console.log(`[imarDetailScraper] [page-error] ${err instanceof Error ? err.message : String(err)}`);
    });

    const url = `${config.detailUrl}?parselid=${parcelId}`;
    console.log(`[imarDetailScraper] Navigating to ${url}`);

    await page.goto(url, { waitUntil: "domcontentloaded", timeout });
    console.log(`[imarDetailScraper] Page loaded`);

    await page.waitForSelector(".divTableCellLabel", { timeout: 8000 }).catch(
      () => {
        console.log("[imarDetailScraper] Warning: .divTableCellLabel selector not found");
      }
    );

    // Extract pairs from the DOM
    let pairs: TablePair[] = await page.evaluate(() => {
      const labels = document.querySelectorAll(".divTableCellLabel");
      const contents = document.querySelectorAll(".divTableContent");
      const result: { label: string; value: string }[] = [];

      for (let i = 0; i < labels.length; i++) {
        const label = labels[i].textContent?.trim() || "";
        const value = contents[i] ? contents[i].textContent?.trim() || "" : "";
        result.push({ label, value });
      }

      return result;
    });

    console.log(`[imarDetailScraper] Extracted ${pairs.length} table pairs from DOM`);

    // Verify encoding: if replacement chars detected, fall back to raw HTML
    const hasEncodingIssues = pairs.some((p) => p.value.includes("\ufffd") || p.label.includes("\ufffd"));
    if (hasEncodingIssues) {
      console.log("[imarDetailScraper] Encoding issues detected, fetching raw HTML as fallback");
      const fetchResp = await fetch(url);
      const arrayBuffer = await fetchResp.arrayBuffer();
      const decoder = new TextDecoder("iso-8859-9");
      const html = decoder.decode(arrayBuffer);

      const labelRegex = /class="divTableCellLabel"[^>]*>([^<]*)/g;
      const valueRegex = /class="divTableContent"[^>]*>([^<]*)/g;
      const labels: string[] = [];
      const values: string[] = [];
      let m;
      while ((m = labelRegex.exec(html)) !== null) labels.push(m[1].trim());
      while ((m = valueRegex.exec(html)) !== null) values.push(m[1].trim());

      pairs = [];
      for (let i = 0; i < labels.length; i++) {
        pairs.push({ label: labels[i], value: values[i] || "" });
      }
      console.log(`[imarDetailScraper] Re-extracted ${pairs.length} pairs from raw HTML`);
    }

    // Wait for canvas and capture screenshot
    let mapImage: string | undefined;
    try {
      console.log(`[imarDetailScraper] Waiting for canvas#myCanvas...`);
      await page.waitForSelector("canvas#myCanvas", { timeout: 10000 });

      await new Promise((r) => setTimeout(r, 3000));

      const canvas = await page.$("canvas#myCanvas");
      if (canvas) {
        console.log(`[imarDetailScraper] Capturing canvas screenshot...`);
        const buf = await canvas.screenshot();
        mapImage = `data:image/png;base64,${Buffer.from(buf).toString("base64")}`;
        console.log(`[imarDetailScraper] Canvas screenshot captured (${(buf.length / 1024).toFixed(1)} KB)`);
      }
    } catch {
      console.log(`[imarDetailScraper] Warning: canvas#myCanvas not found`);
    }

    await page.close();

    const planInfo = parsePlanInfo(pairs);
    const kadastroInfo = parseKadastroInfo(pairs);

    console.log(`[imarDetailScraper] Scrape complete. Plan: ${planInfo ? "yes" : "no"}, Kadastro: ${kadastroInfo ? "yes" : "no"}`);
    return { planInfo, kadastroInfo, mapImage };
  } catch (error) {
    console.error(`[imarDetailScraper] Error: ${error instanceof Error ? error.message : String(error)}`);
    return {
      error: error instanceof Error ? error.message : "İmar detay sayfası alınamadı",
    };
  }
}

function parsePlanInfo(pairs: TablePair[]): ZoningPlanInfo {
  const get = (label: string): string => {
    const pair = pairs.find(
      (p) => p.label.toLowerCase().includes(label.toLowerCase()) && !p.label.includes("Projeksiyon")
    );
    return pair?.value || "";
  };

  return {
    planAdi: get("Mer'i İmar Planı") || get("İmar Planı"),
    fonksiyon: get("Fonksiyon"),
    tasdikTarihi: get("Tasdik Tarihi"),
    olcek: get("Ölçeği") || get("Ölçek"),
    ilce: get("İlçe"),
    mahalle: get("Mahalle"),
    pafta: get("Pafta"),
    parsel: get("Parsel"),
    hesapAlani: get("Hesap Alanı"),
    binaYuksekligi: get("Bina Yüksekliği"),
    onBahce: get("Ön Bahçe"),
    yanBahce: get("Yan Bahçe"),
    arkaBahce: get("Arka Bahçe"),
    binaDerinligi: get("Bina Derinliği"),
    katAdedi: get("Kat Adedi"),
    inaatNizami: get("İnşaat Nizamı"),
    taks: get("T.A.K.S"),
    kaks: get("K.A.K.S") || get("Emsal"),
    kotAlinacakNokta: get("Kot Alınacak Nokta"),
    aciklama: get("Açıklama"),
    kisitlama: get("Kısıtlama"),
    tadilatAciklama: get("Tadilat"),
  };
}

function parseKadastroInfo(pairs: TablePair[]): ZoningKadastroInfo {
  const get = (label: string): string => {
    const pair = pairs.find((p) => p.label.toLowerCase().includes(label.toLowerCase()));
    return pair?.value || "";
  };

  const cografiKoordinat = get("Coğrafi Koordinat");
  const coords = parseDMSToDecimal(cografiKoordinat);

  return {
    projeksiyon: get("Projeksiyon"),
    kartezyenKoordinat: get("Kartezyen Koordinat"),
    cografiKoordinat,
    lat: coords?.lat,
    lng: coords?.lng,
  };
}

export interface MunicipalityConfig {
  key: string;
  name: string;
  baseUrl: string;
  serviceUrl: string;
  detailUrl: string;
  refererUrl: string;
  defaultCenter: [number, number];
  usePuppeteer?: boolean; // true for districts that block direct fetch (403)
}

export const MUNICIPALITIES: MunicipalityConfig[] = [
  // === Original working municipalities (direct fetch) ===
  {
    key: "eyupsultan",
    name: "Eyüpsultan",
    baseUrl: "https://keos.eyupsultan.bel.tr/imardurumu",
    serviceUrl: "https://keos.eyupsultan.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.eyupsultan.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.eyupsultan.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8306, 41.0566],
  },
  {
    key: "pendik",
    name: "Pendik",
    baseUrl: "https://keos.pendik.bel.tr/imardurumu",
    serviceUrl: "https://keos.pendik.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.pendik.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.pendik.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.1200, 40.8700],
  },
  {
    key: "gaziosmanpasa",
    name: "Gaziosmanpaşa",
    baseUrl: "https://keos.gaziosmanpasa.bel.tr/imardurumu",
    serviceUrl: "https://keos.gaziosmanpasa.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.gaziosmanpasa.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.gaziosmanpasa.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8700, 41.0200],
  },
  // === Puppeteer required (403 on direct fetch) ===
  {
    key: "avcilar",
    name: "Avcılar",
    baseUrl: "https://keos.avcilar.bel.tr/imardurumu",
    serviceUrl: "https://keos.avcilar.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.avcilar.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.avcilar.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.7000, 40.9700],
    usePuppeteer: true,
  },
  {
    key: "bakirkoy",
    name: "Bakırköy",
    baseUrl: "https://keos.bakirkoy.bel.tr/imardurumu",
    serviceUrl: "https://keos.bakirkoy.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.bakirkoy.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.bakirkoy.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8300, 40.9800],
    usePuppeteer: true,
  },
  {
    key: "esenler",
    name: "Esenler",
    baseUrl: "https://keos.esenler.bel.tr/imardurumu",
    serviceUrl: "https://keos.esenler.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.esenler.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.esenler.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8500, 41.0200],
    usePuppeteer: true,
  },
  {
    key: "kucukcekmece",
    name: "Küçükçekmece",
    baseUrl: "https://keos.kucukcekmece.bel.tr/imardurumu",
    serviceUrl: "https://keos.kucukcekmece.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.kucukcekmece.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.kucukcekmece.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.7500, 41.0200],
    usePuppeteer: true,
  },
  // === webGIS platform - Puppeteer required ===
  {
    key: "kadikoy",
    name: "Kadıköy",
    baseUrl: "https://webgis.kadikoy.bel.tr/imardurumu",
    serviceUrl: "https://webgis.kadikoy.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.kadikoy.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.kadikoy.bel.tr/imardurumu/index.aspx",
    defaultCenter: [29.0300, 40.9900],
    usePuppeteer: true,
  },
  {
    key: "atasehir",
    name: "Ataşehir",
    baseUrl: "https://webgis.atasehir.bel.tr/imardurumu",
    serviceUrl: "https://webgis.atasehir.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.atasehir.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.atasehir.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8200, 40.9700],
    usePuppeteer: true,
  },
  {
    key: "umraniye",
    name: "Ümraniye",
    baseUrl: "https://webgis.umraniye.bel.tr/imardurumu",
    serviceUrl: "https://webgis.umraniye.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.umraniye.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.umraniye.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8800, 41.0100],
    usePuppeteer: true,
  },
  {
    key: "basaksehir",
    name: "Başakşehir",
    baseUrl: "https://webgis.basaksehir.bel.tr/imardurumu",
    serviceUrl: "https://webgis.basaksehir.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.basaksehir.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.basaksehir.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8700, 41.0800],
    usePuppeteer: true,
  },
  {
    key: "maltepe",
    name: "Maltepe",
    baseUrl: "https://webgis.maltepe.bel.tr/imardurumu",
    serviceUrl: "https://webgis.maltepe.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.maltepe.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.maltepe.bel.tr/imardurumu/index.aspx",
    defaultCenter: [29.0700, 40.9800],
    usePuppeteer: true,
  },
  {
    key: "tuzla",
    name: "Tuzla",
    baseUrl: "https://webgis.tuzla.bel.tr/imardurumu",
    serviceUrl: "https://webgis.tuzla.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.tuzla.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.tuzla.bel.tr/imardurumu/index.aspx",
    defaultCenter: [29.0500, 40.9500],
    usePuppeteer: true,
  },
  {
    key: "sultangazi",
    name: "Sultanğazi",
    baseUrl: "https://webgis.sultangazi.bel.tr/imardurumu",
    serviceUrl: "https://webgis.sultangazi.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.sultangazi.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.sultangazi.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8800, 41.0200],
    usePuppeteer: true,
  },
  // === KEOS with custom ports - Puppeteer required ===
  {
    key: "catalca",
    name: "Çatalca",
    baseUrl: "https://keos.catalca.bel.tr:10443/imardurumu",
    serviceUrl: "https://keos.catalca.bel.tr:10443/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.catalca.bel.tr:10443/imardurumu/imar.aspx",
    refererUrl: "https://keos.catalca.bel.tr:10443/imardurumu/index.aspx",
    defaultCenter: [28.5700, 40.9800],
    usePuppeteer: true,
  },
  {
    key: "bcekmece",
    name: "Büyükçekmece",
    baseUrl: "https://keos.bcekmece.bel.tr/imardurumu",
    serviceUrl: "https://keos.bcekmece.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.bcekmece.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.bcekmece.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.7300, 41.0200],
    usePuppeteer: true,
  },
  // === Puppeteer (PuppeteerKeosScraper) - standard KEOS 403 ===
  {
    key: "cekmekoy",
    name: "Çekmeköy",
    baseUrl: "https://webgis.cekmekoy.bel.tr/imardurumu",
    serviceUrl: "https://webgis.cekmekoy.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.cekmekoy.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.cekmekoy.bel.tr/imardurumu/index.aspx",
    defaultCenter: [29.0100, 41.0100],
    usePuppeteer: true,
  },
  // === Direct fetch (GenericKeosScraper) - custom ports/subdomains ===
  {
    key: "gungoren",
    name: "Güngören",
    baseUrl: "https://keos.gungoren.bel.tr:3443/imardurumu",
    serviceUrl: "https://keos.gungoren.bel.tr:3443/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.gungoren.bel.tr:3443/imardurumu/imar.aspx",
    refererUrl: "https://keos.gungoren.bel.tr:3443/imardurumu/index.aspx",
    defaultCenter: [28.9050, 41.0220],
  },
  {
    key: "zeytinburnu",
    name: "Zeytinburnu",
    baseUrl: "https://sehirrehberi.zeytinburnu.bel.tr/imardurumu",
    serviceUrl: "https://sehirrehberi.zeytinburnu.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://sehirrehberi.zeytinburnu.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://sehirrehberi.zeytinburnu.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8800, 41.0150],
  },
  // === Puppeteer (PuppeteerKeosScraper) - standard KEOS 403 ===
  {
    key: "besiktas",
    name: "Beşiktaş",
    baseUrl: "https://keos.besiktas.bel.tr/imardurumu",
    serviceUrl: "https://keos.besiktas.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.besiktas.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.besiktas.bel.tr/imardurumu/index.aspx",
    defaultCenter: [29.0050, 41.0610],
    usePuppeteer: true,
  },
  {
    key: "bayrampasa",
    name: "Bayrampaşa",
    baseUrl: "https://keos.bayrampasa.bel.tr:4443/imardurumu",
    serviceUrl: "https://keos.bayrampasa.bel.tr:4443/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.bayrampasa.bel.tr:4443/imardurumu/imar.aspx",
    refererUrl: "https://keos.bayrampasa.bel.tr:4443/imardurumu/index.aspx",
    defaultCenter: [28.8900, 41.0450],
    usePuppeteer: true,
  },
  {
    key: "bahcelievler",
    name: "Bahçelievler",
    baseUrl: "https://keos.bahcelievler.bel.tr/imardurumu",
    serviceUrl: "https://keos.bahcelievler.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.bahcelievler.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.bahcelievler.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8500, 41.0000],
    usePuppeteer: true,
  },
  // === Puppeteer (PuppeteerKeosScraper) - non-standard subdomains ===
  {
    key: "kartal",
    name: "Kartal",
    baseUrl: "https://belnet.kartal.bel.tr/imardurumu",
    serviceUrl: "https://belnet.kartal.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://belnet.kartal.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://belnet.kartal.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.7500, 40.9010],
    usePuppeteer: true,
  },
  {
    key: "silivri",
    name: "Silivri",
    baseUrl: "https://360.silivri.bel.tr/imardurumu",
    serviceUrl: "https://360.silivri.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://360.silivri.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://360.silivri.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.2650, 41.0050],
    usePuppeteer: true,
  },
  {
    key: "beyoglu",
    name: "Beyoğlu",
    baseUrl: "https://cbs.beyoglu.bel.tr/imardurumu",
    serviceUrl: "https://cbs.beyoglu.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://cbs.beyoglu.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://cbs.beyoglu.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.9700, 41.0330],
    usePuppeteer: true,
  },
  {
    key: "bagcilar",
    name: "Bağcılar",
    baseUrl: "https://bbgis.bagcilar.bel.tr/imardurumu",
    serviceUrl: "https://bbgis.bagcilar.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://bbgis.bagcilar.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://bbgis.bagcilar.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8550, 41.0230],
    usePuppeteer: true,
  },
  {
    key: "sile",
    name: "Şile",
    baseUrl: "https://kentrehberi.sile.bel.tr/imardurumu",
    serviceUrl: "https://kentrehberi.sile.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://kentrehberi.sile.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://kentrehberi.sile.bel.tr/imardurumu/index.aspx",
    defaultCenter: [29.2200, 41.1050],
    usePuppeteer: true,
  },
  // === Puppeteer (PuppeteerKeosScraper) - webGIS subdomain ===
  {
    key: "sancaktepe",
    name: "Sancaktepe",
    baseUrl: "https://webgis.sancaktepe.bel.tr/imardurumu",
    serviceUrl: "https://webgis.sancaktepe.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.sancaktepe.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.sancaktepe.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8500, 40.9000],
    usePuppeteer: true,
  },
  // === Puppeteer (PuppeteerKeosScraper) - kentrehberi subdomain ===
  {
    key: "sisli",
    name: "Şişli",
    baseUrl: "https://kentrehberi.sisli.bel.tr/imardurum",
    serviceUrl: "https://kentrehberi.sisli.bel.tr/imardurum/service/imarsvc.aspx",
    detailUrl: "https://kentrehberi.sisli.bel.tr/imardurum/imar.aspx",
    refererUrl: "https://kentrehberi.sisli.bel.tr/imardurum/index.aspx",
    defaultCenter: [28.9850, 41.0600],
    usePuppeteer: true,
  },
  // === Moskbilisim platform (Puppeteer) - esenyurt ===
  {
    key: "esenyurt",
    name: "Esenyurt",
    baseUrl: "https://e-imar.esenyurt.bel.tr",
    serviceUrl: "https://e-imar.esenyurt.bel.tr/Home/ParselleriGetir",
    detailUrl: "https://e-imar.esenyurt.bel.tr/ImarBelgesiNumarataj",
    refererUrl: "https://e-imar.esenyurt.bel.tr",
    defaultCenter: [28.8200, 41.0500],
    usePuppeteer: true,
  },
  // === GiSoft CBS platforms (Puppeteer) - require authentication ===
  {
    key: "fatih",
    name: "Fatih",
    baseUrl: "https://gis.fatih.bel.tr/webgis",
    serviceUrl: "https://gis.fatih.bel.tr/webgis/api",
    detailUrl: "https://gis.fatih.bel.tr/webgis",
    refererUrl: "https://gis.fatih.bel.tr/webgis",
    defaultCenter: [28.9500, 41.0150],
    usePuppeteer: true,
  },
  {
    key: "sariyer",
    name: "Sarıyer",
    baseUrl: "https://kentrehberi.sariyer.bel.tr",
    serviceUrl: "https://cbs.sariyer.bel.tr/GiSoftGis/api",
    detailUrl: "https://kentrehberi.sariyer.bel.tr",
    refererUrl: "https://kentrehberi.sariyer.bel.tr",
    defaultCenter: [29.0100, 41.0700],
    usePuppeteer: true,
  },
  {
    key: "beykoz",
    name: "Beykoz",
    baseUrl: "https://cbs.beykoz.bel.tr",
    serviceUrl: "https://cbs.beykoz.bel.tr/api",
    detailUrl: "https://cbs.beykoz.bel.tr",
    refererUrl: "https://cbs.beykoz.bel.tr",
    defaultCenter: [29.1000, 40.9700],
    usePuppeteer: true,
  },
  {
    key: "beylikduzu",
    name: "Beylikdüzü",
    baseUrl: "https://cbs.beylikduzu.istanbul",
    serviceUrl: "https://cbs.beylikduzu.istanbul/api",
    detailUrl: "https://cbs.beylikduzu.istanbul",
    refererUrl: "https://cbs.beylikduzu.istanbul",
    defaultCenter: [28.8000, 41.0400],
    usePuppeteer: true,
  },
  {
    key: "sultanbeyli",
    name: "Sultanbeyli",
    baseUrl: "https://cbs.sultanbeyli.bel.tr",
    serviceUrl: "https://cbs.sultanbeyli.bel.tr/api",
    detailUrl: "https://cbs.sultanbeyli.bel.tr",
    refererUrl: "https://cbs.sultanbeyli.bel.tr",
    defaultCenter: [28.7400, 40.9300],
    usePuppeteer: true,
  },
  {
    key: "kagithane",
    name: "Kağıthane",
    baseUrl: "https://cbs.kagithane.bel.tr",
    serviceUrl: "https://cbs.kagithane.bel.tr/api",
    detailUrl: "https://cbs.kagithane.bel.tr",
    refererUrl: "https://cbs.kagithane.bel.tr",
    defaultCenter: [28.9800, 41.0600],
    usePuppeteer: true,
  },
  {
    key: "uskudar",
    name: "Üsküdar",
    baseUrl: "https://cbs.uskudar.bel.tr/eharita",
    serviceUrl: "https://cbs.uskudar.bel.tr/eharita/api",
    detailUrl: "https://cbs.uskudar.bel.tr/eharita",
    refererUrl: "https://cbs.uskudar.bel.tr/eharita",
    defaultCenter: [29.0700, 41.0100],
    usePuppeteer: true,
  },
  // === Custom maps platform (Puppeteer) - arnavutkoy ===
  {
    key: "arnavutkoy",
    name: "Arnavutköy",
    baseUrl: "https://maps.arnavutkoy.bel.tr",
    serviceUrl: "https://maps.arnavutkoy.bel.tr/api",
    detailUrl: "https://maps.arnavutkoy.bel.tr",
    refererUrl: "https://maps.arnavutkoy.bel.tr",
    defaultCenter: [28.7800, 41.2400],
    usePuppeteer: true,
  },
];

export function getMunicipality(key: string): MunicipalityConfig | undefined {
  const lowerKey = key.toLocaleLowerCase("tr");
  return MUNICIPALITIES.find((m) => m.key.toLocaleLowerCase("tr") === lowerKey);
}

export function getDefaultMunicipality(): MunicipalityConfig {
  return MUNICIPALITIES[0];
}

export interface MahalleItem {
  OBJECTID: number;
  ADI_NUMARASI: string;
}

export interface SokakItem {
  OBJECTID: number;
  YOL_ADI: string;
}

export interface KapiItem {
  PARSEL_ID: number | null;
  KAPI_NO: string;
}

async function fetchTurkishJson<T>(serviceUrl: string, refererUrl: string, params: string): Promise<T[]> {
  const url = `${serviceUrl}?${params}`;
  console.log(`[turkishFetch] Fetching ${url}`);
  const resp = await fetch(url, {
    headers: {
      Accept: "application/json",
      Referer: refererUrl,
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}`);
  }

  const arrayBuffer = await resp.arrayBuffer();
  const decoder = new TextDecoder("iso-8859-9");
  const text = decoder.decode(arrayBuffer);
  console.log(`[turkishFetch] Decoded ${text.length} chars from iso-8859-9`);

  const data: T[] = JSON.parse(text);
  console.log(`[turkishFetch] Parsed ${data.length} items`);
  return data;
}

/**
 * Unified fetch that tries direct fetch first, then Puppeteer for v3 districts.
 * Falls back to cached data if both methods fail.
 */
async function fetchKeosData<T>(municipality: MunicipalityConfig, params: string): Promise<T[]> {
  // Try direct fetch first (works for v2, sometimes works for v3 with proper headers)
  try {
    return await fetchTurkishJson<T>(municipality.serviceUrl, municipality.refererUrl, params);
  } catch (directError) {
    console.log(`[fetchKeosData] Direct fetch failed for ${municipality.key}: ${directError}`);

    // Fall back to Puppeteer for v3 districts
    if (municipality.usePuppeteer) {
      try {
        console.log(`[fetchKeosData] Trying Puppeteer for ${municipality.key}`);
        const { puppeteerFetch } = await import("./puppeteerFetch");
        return await puppeteerFetch<T>(municipality, params);
      } catch (puppeteerError) {
        console.log(`[fetchKeosData] Puppeteer also failed for ${municipality.key}: ${puppeteerError}`);

        // Fall back to cached data for mahalle requests
        if (params.includes("type=mahalle")) {
          try {
            const { getCachedMahalle } = await import("./mahalleCache");
            const cached = getCachedMahalle(municipality.key);
            if (cached && cached.length > 0) {
              console.log(`[fetchKeosData] Using cached data for ${municipality.key} (${cached.length} items)`);
              return cached as T[];
            }
          } catch {
            // Ignore cache errors
          }
        }

        throw puppeteerError;
      }
    }

    // Re-throw if no fallback available
    throw directError;
  }
}

export async function getMahallelerFor(municipality: MunicipalityConfig): Promise<MahalleItem[]> {
  return fetchKeosData<MahalleItem>(municipality, "type=mahalle");
}

export async function getSokaklarFor(municipality: MunicipalityConfig, mahalleId: number): Promise<SokakItem[]> {
  return fetchKeosData<SokakItem>(municipality, `type=sokak&mahalle=${mahalleId}`);
}

export async function getKapilarFor(municipality: MunicipalityConfig, mahalleId: number, sokakId: number): Promise<KapiItem[]> {
  return fetchKeosData<KapiItem>(
    municipality,
    `type=kapi&mahalle=${mahalleId}&sokak=${sokakId}`
  );
}

export async function searchParcelFor(municipality: MunicipalityConfig, query: string): Promise<{ ADAPARSEL: string; TAPU_MAH_ADI: string; ADA: string; OBJECTID: number }[]> {
  return fetchKeosData<{ ADAPARSEL: string; TAPU_MAH_ADI: string; ADA: string; OBJECTID: number }>(
    municipality,
    `type=adaparsel&adaparsel=${encodeURIComponent(query)}`
  );
}

export async function getParcelInfoFor(municipality: MunicipalityConfig, parcelId: number): Promise<{ ADAPARSEL: string; TAPU_MAH_ADI: string; ADA: string; OBJECTID: number }[]> {
  return fetchKeosData<{ ADAPARSEL: string; TAPU_MAH_ADI: string; ADA: string; OBJECTID: number }>(
    municipality,
    `type=parsel&parselid=${parcelId}`
  );
}

export async function getTapuMahalleleriFor(municipality: MunicipalityConfig): Promise<{ TAPU_MAH_ADI: string }[]> {
  return fetchKeosData<{ TAPU_MAH_ADI: string }>(municipality, "type=tapuMahalle");
}

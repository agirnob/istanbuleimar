export interface MunicipalityConfig {
  key: string;
  name: string;
  baseUrl: string;
  serviceUrl: string;
  detailUrl: string;
  refererUrl: string;
  defaultCenter: [number, number];
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
  // === KEOS standard API (may need Puppeteer for 403) ===
  {
    key: "avcilar",
    name: "Avcılar",
    baseUrl: "https://keos.avcilar.bel.tr/imardurumu",
    serviceUrl: "https://keos.avcilar.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.avcilar.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.avcilar.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.7000, 40.9700],
  },
  {
    key: "bakirkoy",
    name: "Bakırköy",
    baseUrl: "https://keos.bakirkoy.bel.tr/imardurumu",
    serviceUrl: "https://keos.bakirkoy.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.bakirkoy.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.bakirkoy.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8300, 40.9800],
  },
  {
    key: "esenler",
    name: "Esenler",
    baseUrl: "https://keos.esenler.bel.tr/imardurumu",
    serviceUrl: "https://keos.esenler.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.esenler.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.esenler.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8500, 41.0200],
  },
  {
    key: "kucukcekmece",
    name: "Küçükçekmece",
    baseUrl: "https://keos.kucukcekmece.bel.tr/imardurumu",
    serviceUrl: "https://keos.kucukcekmece.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.kucukcekmece.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.kucukcekmece.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.7500, 41.0200],
  },
  // === webGIS platform (same API pattern) ===
  {
    key: "kadikoy",
    name: "Kadıköy",
    baseUrl: "https://webgis.kadikoy.bel.tr/imardurumu",
    serviceUrl: "https://webgis.kadikoy.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.kadikoy.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.kadikoy.bel.tr/imardurumu/index.aspx",
    defaultCenter: [29.0300, 40.9900],
  },
  {
    key: "atasehir",
    name: "Ataşehir",
    baseUrl: "https://webgis.atasehir.bel.tr/imardurumu",
    serviceUrl: "https://webgis.atasehir.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.atasehir.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.atasehir.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8200, 40.9700],
  },
  {
    key: "umraniye",
    name: "Ümraniye",
    baseUrl: "https://webgis.umraniye.bel.tr/imardurumu",
    serviceUrl: "https://webgis.umraniye.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.umraniye.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.umraniye.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8800, 41.0100],
  },
  {
    key: "basaksehir",
    name: "Başakşehir",
    baseUrl: "https://webgis.basaksehir.bel.tr/imardurumu",
    serviceUrl: "https://webgis.basaksehir.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.basaksehir.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.basaksehir.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8700, 41.0800],
  },
  {
    key: "maltepe",
    name: "Maltepe",
    baseUrl: "https://webgis.maltepe.bel.tr/imardurumu",
    serviceUrl: "https://webgis.maltepe.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.maltepe.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.maltepe.bel.tr/imardurumu/index.aspx",
    defaultCenter: [29.0700, 40.9800],
  },
  {
    key: "tuzla",
    name: "Tuzla",
    baseUrl: "https://webgis.tuzla.bel.tr/imardurumu",
    serviceUrl: "https://webgis.tuzla.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.tuzla.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.tuzla.bel.tr/imardurumu/index.aspx",
    defaultCenter: [29.0500, 40.9500],
  },
  {
    key: "sultangazi",
    name: "Sultanğazi",
    baseUrl: "https://webgis.sultangazi.bel.tr/imardurumu",
    serviceUrl: "https://webgis.sultangazi.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://webgis.sultangazi.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://webgis.sultangazi.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.8800, 41.0200],
  },
  // === KEOS with custom ports ===
  {
    key: "catalca",
    name: "Çatalca",
    baseUrl: "https://keos.catalca.bel.tr:10443/imardurumu",
    serviceUrl: "https://keos.catalca.bel.tr:10443/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.catalca.bel.tr:10443/imardurumu/imar.aspx",
    refererUrl: "https://keos.catalca.bel.tr:10443/imardurumu/index.aspx",
    defaultCenter: [28.5700, 40.9800],
  },
  {
    key: "bcekmece",
    name: "Büyükçekmece",
    baseUrl: "https://keos.bcekmece.bel.tr/imardurumu",
    serviceUrl: "https://keos.bcekmece.bel.tr/imardurumu/service/imarsvc.aspx",
    detailUrl: "https://keos.bcekmece.bel.tr/imardurumu/imar.aspx",
    refererUrl: "https://keos.bcekmece.bel.tr/imardurumu/index.aspx",
    defaultCenter: [28.7300, 41.0200],
  },
];

export function getMunicipality(key: string): MunicipalityConfig | undefined {
  return MUNICIPALITIES.find((m) => m.key === key.toLowerCase());
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

export async function getMahallelerFor(municipality: MunicipalityConfig): Promise<MahalleItem[]> {
  return fetchTurkishJson<MahalleItem>(municipality.serviceUrl, municipality.refererUrl, "type=mahalle");
}

export async function getSokaklarFor(municipality: MunicipalityConfig, mahalleId: number): Promise<SokakItem[]> {
  return fetchTurkishJson<SokakItem>(municipality.serviceUrl, municipality.refererUrl, `type=sokak&mahalle=${mahalleId}`);
}

export async function getKapilarFor(municipality: MunicipalityConfig, mahalleId: number, sokakId: number): Promise<KapiItem[]> {
  return fetchTurkishJson<KapiItem>(
    municipality.serviceUrl,
    municipality.refererUrl,
    `type=kapi&mahalle=${mahalleId}&sokak=${sokakId}`
  );
}

export async function searchParcelFor(municipality: MunicipalityConfig, query: string): Promise<{ ADAPARSEL: string; TAPU_MAH_ADI: string; ADA: string; OBJECTID: number }[]> {
  return fetchTurkishJson<{ ADAPARSEL: string; TAPU_MAH_ADI: string; ADA: string; OBJECTID: number }>(
    municipality.serviceUrl,
    municipality.refererUrl,
    `type=adaparsel&adaparsel=${encodeURIComponent(query)}`
  );
}

export async function getParcelInfoFor(municipality: MunicipalityConfig, parcelId: number): Promise<{ ADAPARSEL: string; TAPU_MAH_ADI: string; ADA: string; OBJECTID: number }[]> {
  return fetchTurkishJson<{ ADAPARSEL: string; TAPU_MAH_ADI: string; ADA: string; OBJECTID: number }>(
    municipality.serviceUrl,
    municipality.refererUrl,
    `type=parsel&parselid=${parcelId}`
  );
}

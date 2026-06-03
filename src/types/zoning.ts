export interface ZoningPlanInfo {
  planAdi: string;
  fonksiyon: string;
  tasdikTarihi: string;
  olcek: string;
  ilce: string;
  mahalle: string;
  pafta: string;
  parsel: string;
  hesapAlani: string;
  binaYuksekligi: string;
  onBahce: string;
  yanBahce: string;
  arkaBahce: string;
  binaDerinligi: string;
  katAdedi: string;
  inaatNizami: string;
  taks: string;
  kaks: string;
  kotAlinacakNokta: string;
  aciklama: string;
  kisitlama: string;
  tadilatAciklama: string;
}

export interface ZoningKadastroInfo {
  projeksiyon: string;
  kartezyenKoordinat: string;
  cografiKoordinat: string;
  lat?: number;
  lng?: number;
}

export interface ParcelDetail {
  parcelNo: string;
  plotNo?: string;
  block?: string;
  neighborhood?: string;
  municipality: string;
  sourceUrl?: string;
  planInfo?: ZoningPlanInfo;
  kadastroInfo?: ZoningKadastroInfo;
  mapImage?: string;
}

export function parseDMSToDecimal(dms: string): { lat: number; lng: number } | null {
  const regex =
    /(\d+)°(\d+)[''](\d+\.?\d*)[""]\s*(N|S)\s+(\d+)°(\d+)[''](\d+\.?\d*)[""]\s*(E|W)/;
  const match = dms.match(regex);
  if (!match) return null;

  const latDeg = parseInt(match[1]);
  const latMin = parseInt(match[2]);
  const latSec = parseFloat(match[3]);
  const latDir = match[4];

  const lngDeg = parseInt(match[5]);
  const lngMin = parseInt(match[6]);
  const lngSec = parseFloat(match[7]);
  const lngDir = match[8];

  let lat = latDeg + latMin / 60 + latSec / 3600;
  let lng = lngDeg + lngMin / 60 + lngSec / 3600;

  if (latDir === "S") lat = -lat;
  if (lngDir === "W") lng = -lng;

  return { lat, lng };
}

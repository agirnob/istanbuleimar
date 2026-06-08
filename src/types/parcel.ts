export interface RawParcel {
  parcelNo: string;
  plotNo?: string;
  block?: string;
  neighborhood?: string;
  municipality: string;
  district?: string;
  zoning?: string;
  usageType?: string;
  floorCount?: number;
  plotArea?: number;
  buildableArea?: number;
  geometry?: string;
  sourceUrl?: string;
}

export interface ScrapeQuery {
  municipality: string;
  query: string;
  queryType: "parcel" | "block" | "neighborhood" | "neighborhoods" | "streets" | "doors";
  mahalleId?: string;
  yolId?: string;
}

export interface ScrapeResult {
  success: boolean;
  parcels: RawParcel[];
  error?: string;
  sourceUrl?: string;
}

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ParcelMap from "@/components/map/ParcelMap";
import { ZoningPlanInfo, ZoningKadastroInfo } from "@/types/zoning";

interface ParcelDetailResponse {
  parcelNo: string;
  plotNo?: string;
  block?: string;
  neighborhood?: string;
  municipality: string;
  sourceUrl?: string;
  planInfo?: ZoningPlanInfo;
  kadastroInfo?: ZoningKadastroInfo;
  mapImage?: string;
  _cached?: boolean;
}

export default function ParcelDetailPage() {
  const params = useParams();
  const searchParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const parcelId = params.id as string;
  const municipality = searchParams.get("municipality") || "eyupsultan";

  const [detail, setDetail] = useState<ParcelDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(`[ParcelDetail] Loading detail for parcelId=${parcelId}, municipality=${municipality}`);
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/parcel-detail?id=${encodeURIComponent(parcelId)}&municipality=${municipality}`
        );
        const data = await res.json();

        if (!res.ok) {
          console.error(`[ParcelDetail] API error: ${data.error}`);
          setError(data.error || "Parsel detayı alınamadı");
          return;
        }

        console.log(`[ParcelDetail] Detail loaded: planInfo=${!!data.planInfo}, kadastro=${!!data.kadastroInfo}, mapImage=${!!data.mapImage}`);
        setDetail(data);
      } catch (err) {
        console.error(`[ParcelDetail] Request failed: ${err}`);
        setError("Bağlantı hatası");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [parcelId, municipality]);

  const defaultCenter: [number, number] = [28.8306, 41.0566];
  const mapCenter: [number, number] =
    detail?.kadastroInfo?.lng && detail?.kadastroInfo?.lat
      ? [detail.kadastroInfo.lng, detail.kadastroInfo.lat]
      : defaultCenter;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <a href="/" className="text-sm text-blue-600 hover:underline">
          ← Ana Sayfaya Dön
        </a>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <span className="ml-3 text-gray-500">
              Parsel bilgileri yükleniyor...
            </span>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {detail && !loading && (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Parsel Bilgileri
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Ada" value={detail.block || "-"} />
                  <InfoRow label="Parsel" value={detail.plotNo || "-"} />
                  <InfoRow label="Mahalle" value={detail.neighborhood || "-"} />
                  <InfoRow label="İlçe" value={municipality} />
                </div>
                {detail.sourceUrl && (
                  <div className="mt-4">
                    <a
                      href={detail.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Kaynak: Belediye Sayfası →
                    </a>
                  </div>
                )}
              </div>

              {detail.planInfo && <ZoningPlanSection plan={detail.planInfo} />}

              {detail.kadastroInfo && (
                <KadastroSection kadastro={detail.kadastroInfo} />
              )}

              {detail.mapImage && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Belediye Harita Görüntüsü
                  </h2>
                  <img
                    src={detail.mapImage}
                    alt="Parsel harita görüntüsü"
                    className="w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Harita
                  {detail?.kadastroInfo?.lng &&
                    detail?.kadastroInfo?.lat && (
                      <span className="ml-2 text-xs font-normal text-green-600">
                        GPS
                      </span>
                    )}
                </h3>
                <ParcelMap center={mapCenter} zoom={17} height="400px" />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500">{label}:</span>
      <span className="ml-2 font-medium text-gray-900">{value}</span>
    </div>
  );
}

function ZoningPlanSection({ plan }: { plan: ZoningPlanInfo }) {
  const rows: Array<{ label: string; value: string }> = [
    { label: "Plan", value: plan.planAdi },
    { label: "Fonksiyon", value: plan.fonksiyon },
    { label: "Tasdik Tarihi", value: plan.tasdikTarihi },
    { label: "Ölçek", value: plan.olcek },
    { label: "Pafta", value: plan.pafta },
    { label: "Hesap Alanı", value: plan.hesapAlani },
    { label: "Kat Adedi", value: plan.katAdedi },
    { label: "İnşaat Nizamı", value: plan.inaatNizami },
    { label: "T.A.K.S", value: plan.taks },
    { label: "K.A.K.S (Emsal)", value: plan.kaks },
    { label: "Bina Yüksekliği", value: plan.binaYuksekligi },
    { label: "Ön Bahçe", value: plan.onBahce },
    { label: "Yan Bahçe", value: plan.yanBahce },
    { label: "Arka Bahçe", value: plan.arkaBahce },
    { label: "Bina Derinliği", value: plan.binaDerinligi },
  ].filter((row) => row.value && row.value !== "-" && row.value !== "- (-)");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        İmar Planı Bilgileri
      </h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        {rows.map((row) => (
          <InfoRow key={row.label} label={row.label} value={row.value} />
        ))}
      </div>
      {plan.aciklama && plan.aciklama !== "-" && (
        <div className="mt-4 text-sm">
          <span className="text-gray-500">Açıklama:</span>
          <p className="mt-1 text-gray-700">{plan.aciklama}</p>
        </div>
      )}
      {plan.kisitlama && plan.kisitlama !== "-" && (
        <div className="mt-4 text-sm">
          <span className="text-gray-500">Kısıtlama:</span>
          <p className="mt-1 text-amber-700 bg-amber-50 rounded-lg p-3">
            {plan.kisitlama}
          </p>
        </div>
      )}
    </div>
  );
}

function KadastroSection({ kadastro }: { kadastro: ZoningKadastroInfo }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Kadastro Bilgileri
      </h2>
      <div className="space-y-3 text-sm">
        {kadastro.kartezyenKoordinat && (
          <InfoRow
            label="Kartezyen Koordinat"
            value={kadastro.kartezyenKoordinat}
          />
        )}
        {kadastro.cografiKoordinat && (
          <InfoRow
            label="Coğrafi Koordinat"
            value={kadastro.cografiKoordinat.split("Google")[0]?.trim() || kadastro.cografiKoordinat}
          />
        )}
        {kadastro.lat && kadastro.lng && (
          <InfoRow
            label="GPS"
            value={`${kadastro.lat.toFixed(6)}, ${kadastro.lng.toFixed(6)}`}
          />
        )}
      </div>
    </div>
  );
}
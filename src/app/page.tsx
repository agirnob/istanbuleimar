"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface MahalleItem {
  OBJECTID: number;
  ADI_NUMARASI: string;
}

interface SokakItem {
  OBJECTID: number;
  YOL_ADI: string;
}

interface KapiItem {
  PARSEL_ID: number | null;
  KAPI_NO: string;
}

interface MunicipalityConfig {
  key: string;
  name: string;
}

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"ada" | "adres">("ada");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [municipalities, setMunicipalities] = useState<MunicipalityConfig[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState("eyupsultan");

  const [mahalleList, setMahalleList] = useState<MahalleItem[]>([]);
  const [selectedMahalleId, setSelectedMahalleId] = useState<number | null>(null);
  const [selectedMahalleName, setSelectedMahalleName] = useState("");

  const [sokakList, setSokakList] = useState<SokakItem[]>([]);
  const [selectedSokakId, setSelectedSokakId] = useState<number | null>(null);
  const [selectedSokakName, setSelectedSokakName] = useState("");
  const [sokakLoading, setSokakLoading] = useState(false);

  const [kapiList, setKapiList] = useState<KapiItem[]>([]);
  const [selectedKapiParselId, setSelectedKapiParselId] = useState<number | null>(null);

  useEffect(() => {
    async function loadMunicipalities() {
      console.log("[Home] Loading municipalities...");
      try {
        const res = await fetch("/api/municipalities");
        if (res.ok) {
          const data = await res.json();
          setMunicipalities(data.municipalities || []);
          console.log(`[Home] Loaded ${data.municipalities?.length} municipalities`);
        }
      } catch (err) {
        console.error("[Home] Failed to load municipalities:", err);
      }
    }
    loadMunicipalities();
  }, []);

  useEffect(() => {
    resetAddressState();
    loadMahalleler(selectedMunicipality);
  }, [selectedMunicipality]);

  useEffect(() => {
    if (!selectedMahalleId) {
      setSokakList([]);
      setKapiList([]);
      setSelectedSokakId(null);
      setSelectedSokakName("");
      setSelectedKapiParselId(null);
      return;
    }
    loadSokaklar(selectedMunicipality, selectedMahalleId);
  }, [selectedMahalleId, selectedMunicipality]);

  useEffect(() => {
    if (!selectedMahalleId || !selectedSokakId) {
      setKapiList([]);
      setSelectedKapiParselId(null);
      return;
    }
    loadKapilar(selectedMunicipality, selectedMahalleId, selectedSokakId);
  }, [selectedSokakId, selectedMahalleId, selectedMunicipality]);

  function resetAddressState() {
    setMahalleList([]);
    setSokakList([]);
    setKapiList([]);
    setSelectedMahalleId(null);
    setSelectedMahalleName("");
    setSelectedSokakId(null);
    setSelectedSokakName("");
    setSelectedKapiParselId(null);
  }

  async function loadMahalleler(municipality: string) {
    console.log(`[Home] Loading mahalleler for ${municipality}...`);
    try {
      const res = await fetch(`/api/neighborhoods?municipality=${municipality}`);
      if (res.ok) {
        const data = await res.json();
        setMahalleList(data.neighborhoods || []);
        console.log(`[Home] Loaded ${data.neighborhoods?.length} mahalleler`);
      }
    } catch (err) {
      console.error("[Home] Failed to load mahalleler:", err);
    }
  }

  async function loadSokaklar(municipality: string, mahalleId: number) {
    setSokakLoading(true);
    console.log(`[Home] Loading sokaklar for ${municipality}, mahalleId=${mahalleId}`);
    try {
      const res = await fetch(`/api/sokaklar?municipality=${municipality}&mahalleId=${mahalleId}`);
      if (res.ok) {
        const data = await res.json();
        setSokakList(data.sokaklar || []);
        console.log(`[Home] Loaded ${data.sokaklar?.length} sokaklar`);
      }
    } catch (err) {
      console.error("[Home] Failed to load sokaklar:", err);
    } finally {
      setSokakLoading(false);
    }
  }

  async function loadKapilar(municipality: string, mahalleId: number, sokakId: number) {
    console.log(`[Home] Loading kapilar for ${municipality}, mahalleId=${mahalleId}, sokakId=${sokakId}`);
    try {
      const res = await fetch(`/api/kapilar?municipality=${municipality}&mahalleId=${mahalleId}&sokakId=${sokakId}`);
      if (res.ok) {
        const data = await res.json();
        setKapiList(data.kapilar || []);
        console.log(`[Home] Loaded ${data.kapilar?.length} kapilar`);
      }
    } catch (err) {
      console.error("[Home] Failed to load kapilar:", err);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (searchType === "ada") {
      if (!query.trim()) return;
      setLoading(true);

      try {
        const res = await fetch(
          `/api/parcels?q=${encodeURIComponent(query)}&municipality=${selectedMunicipality}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Bir hata oluştu");
          setLoading(false);
          return;
        }

        if (data.parcels && data.parcels.length > 0) {
          router.push(`/search?q=${encodeURIComponent(query)}&municipality=${selectedMunicipality}`);
          return;
        }

        setError("Sonuç bulunamadı. Farklı bir ada/parsel numarası deneyin.");
      } catch {
        setError("Bağlantı hatası");
      } finally {
        setLoading(false);
      }
    } else {
      if (!selectedMahalleId) {
        setError("Lütfen bir mahalle seçin");
        return;
      }

      if (selectedKapiParselId) {
        console.log(`[Home] Direct parsel from kapı: ${selectedKapiParselId}`);
        router.push(`/parcel/${selectedKapiParselId}?municipality=${selectedMunicipality}`);
        return;
      }

      setError("Lütfen kapı no seçin veya ada/parsel araması yapın");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold text-gray-900 mb-3">Eimar</h1>
        <p className="text-xl text-gray-500">
          Istanbul Imar ve Parsel Bilgi Platformu
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1 text-center">
            İlçe Seçin
          </label>
          <div className="flex gap-2 justify-center flex-wrap">
            {municipalities.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setSelectedMunicipality(m.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedMunicipality === m.key
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => setSearchType("ada")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              searchType === "ada"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Ada / Parsel
          </button>
          <button
            type="button"
            onClick={() => setSearchType("adres")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              searchType === "adres"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Adres
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {searchType === "ada" ? (
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ada/Parsel no girin (orn: 1/1, 5/3)..."
                className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-4 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-blue-600 px-8 py-4 text-white font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Aranıyor..." : "Ara"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Mahalle *
                </label>
                <select
                  value={selectedMahalleId ?? ""}
                  onChange={(e) => {
                    const id = parseInt(e.target.value, 10);
                    setSelectedMahalleId(id || null);
                    const item = mahalleList.find((m) => m.OBJECTID === id);
                    setSelectedMahalleName(item?.ADI_NUMARASI || "");
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Mahalle seçin...</option>
                  {mahalleList.map((m) => (
                    <option key={m.OBJECTID} value={m.OBJECTID}>
                      {m.ADI_NUMARASI}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Sokak / Cadde
                </label>
                <select
                  value={selectedSokakId ?? ""}
                  onChange={(e) => {
                    const id = parseInt(e.target.value, 10);
                    setSelectedSokakId(id || null);
                    const item = sokakList.find((s) => s.OBJECTID === id);
                    setSelectedSokakName(item?.YOL_ADI || "");
                  }}
                  disabled={!selectedMahalleId || sokakLoading}
                  className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                >
                  <option value="">Sokak seçin...</option>
                  {sokakList.map((s) => (
                    <option key={s.OBJECTID} value={s.OBJECTID}>
                      {s.YOL_ADI}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Kapı No
                </label>
                <select
                  value={selectedKapiParselId ?? ""}
                  onChange={(e) => {
                    const item = kapiList.find(
                      (k) => String(k.PARSEL_ID) === e.target.value
                    );
                    setSelectedKapiParselId(item?.PARSEL_ID || null);
                  }}
                  disabled={!selectedSokakId}
                  className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-lg shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                >
                  <option value="">Kapı no seçin...</option>
                  {kapiList
                    .filter((k) => k.PARSEL_ID !== null)
                    .map((k) => (
                      <option key={`${k.PARSEL_ID}-${k.KAPI_NO}`} value={k.PARSEL_ID!}>
                        Kapı {k.KAPI_NO}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedMahalleId}
                className="w-full rounded-xl bg-blue-600 px-8 py-4 text-white font-medium shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Aranıyor..." : "İmar Durumu"}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Ör:{" "}
            <code className="text-gray-500">
              {searchType === "ada" ? "1/1, 100/1" : "Mahalle → Sokak → Kapı No"}
            </code>
          </p>
        </div>
      </div>
    </main>
  );
}

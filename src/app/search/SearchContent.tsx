"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  parcelNo: string;
  plotNo?: string;
  block?: string;
  neighborhood?: string;
  municipality: string;
  sourceUrl?: string;
}

export default function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "ada";
  const municipality = searchParams.get("municipality") || "eyupsultan";
  const mahalle = searchParams.get("mahalle") || "";
  const sokak = searchParams.get("sokak") || "";
  const kapiNo = searchParams.get("kapiNo") || "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(`[SearchContent] q="${q}", type=${type}, municipality=${municipality}, mahalle="${mahalle}", sokak="${sokak}", kapiNo="${kapiNo}"`);

  const performSearch = useCallback(async () => {
    if (!q.trim()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (type === "adres") {
        console.log(`[SearchContent] Search for "${q}", municipality=${municipality}`);
        const res = await fetch(
          `/api/parcels?q=${encodeURIComponent(q)}&municipality=${municipality}`
        );
        const data = await res.json();

        if (!res.ok) {
          console.error(`[SearchContent] API error: ${data.error}`);
          setError(data.error || "Bir hata olu\u015ftu");
          setResults([]);
          return;
        }

        console.log(`[SearchContent] Found ${data.parcels?.length || 0} parcels`);
        setResults(data.parcels || []);
      } else {
        console.log(`[SearchContent] Ada/Parsel search for "${q}", municipality=${municipality}`);
        const res = await fetch(
          `/api/parcels?q=${encodeURIComponent(q)}&municipality=${municipality}`
        );
        const data = await res.json();

        if (!res.ok) {
          console.error(`[SearchContent] API error: ${data.error}`);
          setError(data.error || "Bir hata olu\u015ftu");
          setResults([]);
          return;
        }

        console.log(`[SearchContent] Found ${data.parcels?.length || 0} parcels`);
        setResults(data.parcels || []);
      }
    } catch (err) {
      console.error(`[SearchContent] Request failed: ${err}`);
      setError("Ba\u011flant\u0131 hatas\u0131");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [q, type]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <button
          onClick={() => router.push("/")}
          className="mb-6 text-sm text-blue-600 hover:underline"
        >
          \u2190 Ana Sayfaya D\u00f6n
        </button>

        <h1 className="text-2xl font-bold mb-2">Arama Sonu\u00e7lar\u0131</h1>
        <p className="text-gray-500 mb-6">
          Sorgu:{" "}
          <span className="font-medium text-gray-700">"{q}"</span>
          {type === "adres" && (
            <span className="ml-2 text-xs rounded bg-blue-100 px-2 py-0.5 text-blue-700">
              Adres
            </span>
          )}
          {mahalle && (
            <span className="ml-2 text-xs rounded bg-green-100 px-2 py-0.5 text-green-700">
              Mahalle: {mahalle}
            </span>
          )}
          {sokak && (
            <span className="ml-2 text-xs rounded bg-purple-100 px-2 py-0.5 text-purple-700">
              Sokak: {sokak}
            </span>
          )}
          {kapiNo && (
            <span className="ml-2 text-xs rounded bg-orange-100 px-2 py-0.5 text-orange-700">
              Kap\u0131: {kapiNo}
            </span>
          )}
        </p>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <span className="ml-3 text-gray-500">Parseller araniyor...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            Sonu\u00e7 bulunamad\u0131. Farkl\u0131 bir ada/parsel numaras\u0131
            deneyin.
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              {results.length} parsel bulundu
            </p>
            {results.map((parcel, i) => (
              <div
                key={`${parcel.parcelNo}-${i}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <div className="text-lg font-semibold text-gray-900">
                    Ada: {parcel.block || "-"} / Parsel:{" "}
                    {parcel.plotNo || "-"}
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {parcel.neighborhood && (
                      <span className="mr-4">
                        Mahalle: {parcel.neighborhood}
                      </span>
                    )}
                    <span>ID: {parcel.parcelNo}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    href={parcel.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    Kaynak \u2192
                  </a>
                  <a
                    href={`/parcel/${parcel.parcelNo}?municipality=${municipality}`}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Imar Durumu
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
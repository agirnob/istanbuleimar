"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface ParcelMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  parcelGeometry?: GeoJSON.Feature;
}

export default function ParcelMap({
  center = [28.8306, 41.0566],
  zoom = 15,
  height = "400px",
  parcelGeometry,
}: ParcelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  // Track pending center/zoom so we can apply them after style loads
  const pendingCenterRef = useRef<[number, number] | null>(null);
  const pendingZoomRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    console.log(`[ParcelMap] Initializing map at center=${JSON.stringify(center)}, zoom=${zoom}`);

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        name: "OpenStreetMap",
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: [
          {
            id: "osm-tiles-layer",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: center as maplibregl.LngLatLike,
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
      }),
      "bottom-right"
    );

    map.on("load", () => {
      console.log(`[ParcelMap] Style loaded`);
      setLoaded(true);

      // Apply pending center/zoom if it changed before style loaded
      if (pendingCenterRef.current) {
        console.log(`[ParcelMap] Applying pending center=${JSON.stringify(pendingCenterRef.current)}`);
        map.flyTo({
          center: pendingCenterRef.current as maplibregl.LngLatLike,
          zoom: pendingZoomRef.current ?? zoom,
          duration: 1500,
          essential: true,
        });
        addMarker(map, pendingCenterRef.current);
        pendingCenterRef.current = null;
        pendingZoomRef.current = null;
      }

      if (parcelGeometry && map.getSource("parcel")) {
        const source = map.getSource("parcel") as maplibregl.GeoJSONSource;
        source.setData(parcelGeometry);
      }
    });

    mapRef.current = map;

    return () => {
      console.log(`[ParcelMap] Cleanup`);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current || !parcelGeometry) return;

    console.log(`[ParcelMap] Applying parcel geometry`);
    const map = mapRef.current;

    if (!map.getSource("parcel")) {
      map.addSource("parcel", {
        type: "geojson",
        data: parcelGeometry,
      });

      map.addLayer({
        id: "parcel-fill",
        type: "fill",
        source: "parcel",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.3,
        },
      });

      map.addLayer({
        id: "parcel-outline",
        type: "line",
        source: "parcel",
        paint: {
          "line-color": "#2563eb",
          "line-width": 2,
        },
      });
    } else {
      const source = map.getSource("parcel") as maplibregl.GeoJSONSource;
      source.setData(parcelGeometry);
    }
  }, [loaded, parcelGeometry]);

  // Helper to add marker source+layer
  const addMarker = useCallback((map: maplibregl.Map, coords: [number, number]) => {
    if (map.isStyleLoaded() && !map.getSource("marker")) {
      const geojson: GeoJSON.Feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coords,
        },
        properties: {},
      };

      map.addSource("marker", {
        type: "geojson",
        data: geojson,
      });

      map.addLayer({
        id: "marker-layer",
        type: "circle",
        source: "marker",
        paint: {
          "circle-radius": 8,
          "circle-color": "#ef4444",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
      console.log(`[ParcelMap] Marker added at ${JSON.stringify(coords)}`);
    }
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;

    console.log(`[ParcelMap] Center effect: center=${JSON.stringify(center)}, zoom=${zoom}, styleLoaded=${map.isStyleLoaded()}`);

    if (!map.isStyleLoaded()) {
      // Queue the center change for after style loads
      console.log(`[ParcelMap] Style not loaded, queuing center change`);
      pendingCenterRef.current = center;
      pendingZoomRef.current = zoom || 17;
      return;
    }

    map.flyTo({
      center: center as maplibregl.LngLatLike,
      zoom: zoom || 17,
      duration: 1500,
      essential: true,
    });

    addMarker(map, center);
  }, [center, zoom, addMarker]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%", borderRadius: "0.75rem" }}
      className="overflow-hidden"
    />
  );
}
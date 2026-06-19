import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getThumbnailUrl } from "@/lib/imageUtils";

// District-level coordinates for each host (not exact addresses)
const HOST_COORDINATES: Record<number, [number, number]> = {
  1:      [121.3950, 31.0350], // Norika & Steven — Qingpu (Jiasong Middle Rd area)
  90002:  [121.4350, 31.1893], // Grace — Xuhui (Xujiahui area)
  150001: [121.2654, 31.3756], // Jiading Ayi — Jiading district
  180001: [121.4267, 31.1953], // Chuan — Xuhui (Jiaotong Uni area)
  210001: [121.5520, 31.2280], // Echo — Pudong (Yushan Rd area)
  240001: [121.3900, 31.2400], // Sookie — Putuo district-level
  330001: [114.0579, 22.5431], // Filbert — Longhua, Shenzhen district-level
  360001: [121.3680, 31.2050], // Eating (Yiting) — Gubei, Changning district-level
  390001: [104.0665, 30.5723], // Dragon — Wuhou, Chengdu district-level
};

// City view configs — Shanghai defaults to zoom 10.2 centered on metro area
const CITY_VIEWS: Record<string, { center: [number, number]; zoom: number }> = {
  all:      { center: [121.45, 31.18], zoom: 7.5 },
  shanghai: { center: [121.45, 31.18], zoom: 10.2 },
  shenzhen: { center: [114.0579, 22.5431], zoom: 11.5 },
  chengdu:  { center: [104.0665, 30.5723], zoom: 11.5 },
};

interface HostPin {
  id: number;
  hostName: string;
  cuisineStyle: string | null;
  district: string | null;
  pricePerPerson: number;
  profilePhotoUrl: string | null;
  discountPercentage: number;
}

interface HostMapViewProps {
  hosts: HostPin[];
  selectedCity: "all" | "shanghai" | "shenzhen" | "chengdu";
}

export default function HostMapView({ hosts, selectedCity }: HostMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const popupsRef = useRef<maplibregl.Popup[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map — starts immediately, tiles load in parallel with host data
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const { center, zoom } = CITY_VIEWS[selectedCity] ?? CITY_VIEWS.shanghai;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/positron",
      center,
      zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.once("load", () => setMapLoaded(true));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to city when selectedCity changes (after initial load)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const { center, zoom } = CITY_VIEWS[selectedCity] ?? CITY_VIEWS.shanghai;
    mapRef.current.flyTo({ center, zoom, duration: 800 });
  }, [selectedCity, mapLoaded]);

  // Add/update markers — runs as soon as BOTH map is loaded AND hosts data is ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear existing markers and popups
    markersRef.current.forEach(m => m.remove());
    popupsRef.current.forEach(p => p.remove());
    markersRef.current = [];
    popupsRef.current = [];

    hosts.forEach(host => {
      const coords = HOST_COORDINATES[host.id];
      if (!coords) return;

      const effectivePrice = host.discountPercentage > 0
        ? Math.round(host.pricePerPerson * (1 - host.discountPercentage / 100))
        : host.pricePerPerson;

      // Price pin element
      const el = document.createElement("div");
      el.className = "host-price-pin";
      el.innerHTML = `<span>¥${effectivePrice}</span>`;
      el.style.cssText = `
        background: #7f1d1d;
        color: white;
        font-size: 13px;
        font-weight: 700;
        padding: 5px 10px;
        border-radius: 20px;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        white-space: nowrap;
        transition: transform 0.15s, background 0.15s;
        font-family: inherit;
      `;
      el.addEventListener("mouseenter", () => {
        el.style.background = "#991b1b";
        el.style.transform = "scale(1.1)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.background = "#7f1d1d";
        el.style.transform = "scale(1)";
      });

      // Popup content
      const thumbUrl = host.profilePhotoUrl
        ? getThumbnailUrl(host.profilePhotoUrl, 120, 120)
        : "";

      const popupHtml = `
        <div style="width:220px;font-family:inherit;">
          ${thumbUrl ? `<img src="${thumbUrl}" alt="${host.hostName}" style="width:100%;height:120px;object-fit:cover;border-radius:8px 8px 0 0;display:block;" />` : ""}
          <div style="padding:12px;">
            <div style="font-weight:700;font-size:15px;margin-bottom:2px;">${host.hostName}</div>
            ${host.cuisineStyle ? `<div style="font-size:12px;color:#92400e;margin-bottom:4px;">${host.cuisineStyle}</div>` : ""}
            ${host.district ? `<div style="font-size:12px;color:#6b7280;margin-bottom:8px;">📍 ${host.district}</div>` : ""}
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span style="font-weight:700;font-size:16px;color:#7f1d1d;">¥${effectivePrice}<span style="font-size:11px;font-weight:400;color:#9ca3af;">/person</span></span>
              <a href="/hosts/${host.id}" style="background:#7f1d1d;color:white;padding:5px 12px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">View →</a>
            </div>
          </div>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 12,
        closeButton: true,
        maxWidth: "240px",
        className: "host-map-popup",
      }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
      popupsRef.current.push(popup);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      popupsRef.current.forEach(p => p.remove());
      markersRef.current = [];
      popupsRef.current = [];
    };
  }, [hosts, mapLoaded]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-border shadow-md">
      {/* Loading skeleton — shown until map tiles finish loading */}
      {!mapLoaded && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
          style={{ background: "#f0ede8" }}
        >
          {/* Animated skeleton grid mimicking map tiles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  width: "33.33%",
                  height: "33.33%",
                  left: `${(i % 3) * 33.33}%`,
                  top: `${Math.floor(i / 3) * 33.33}%`,
                  background: i % 2 === 0 ? "#e8e4de" : "#ede9e3",
                  animation: `pulse 1.5s ease-in-out ${(i * 0.1)}s infinite`,
                }}
              />
            ))}
          </div>
          {/* Spinner + label */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 rounded-full border-4 border-white"
              style={{
                borderTopColor: "#7f1d1d",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span className="text-sm font-medium" style={{ color: "#7f1d1d" }}>
              Loading map…
            </span>
          </div>
        </div>
      )}

      <div
        ref={mapContainer}
        style={{ height: "clamp(360px, 55vh, 560px)", width: "100%" }}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .maplibregl-popup-content {
          padding: 0 !important;
          border-radius: 12px !important;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
        }
        .maplibregl-popup-close-button {
          font-size: 18px;
          color: white;
          background: rgba(0,0,0,0.4);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          top: 6px;
          right: 6px;
          line-height: 1;
        }
        .maplibregl-popup-close-button:hover {
          background: rgba(0,0,0,0.6);
        }
        .maplibregl-ctrl-group {
          border-radius: 8px !important;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

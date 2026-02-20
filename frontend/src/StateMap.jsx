import { useEffect, useRef, useState } from "react";

const US_STATES_GEOJSON_URL = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";

// Sample state-level data: avg salary ($K), min, max, job count (for tooltip)
export const stateDataByName = {
  Alabama: { avgSalary: 95, minSalary: 62, maxSalary: 145, jobs: 1240 },
  Alaska: { avgSalary: 112, minSalary: 78, maxSalary: 165, jobs: 180 },
  Arizona: { avgSalary: 105, minSalary: 68, maxSalary: 155, jobs: 2180 },
  Arkansas: { avgSalary: 88, minSalary: 55, maxSalary: 128, jobs: 620 },
  California: { avgSalary: 142, minSalary: 85, maxSalary: 210, jobs: 18200 },
  Colorado: { avgSalary: 125, minSalary: 82, maxSalary: 178, jobs: 3450 },
  Connecticut: { avgSalary: 128, minSalary: 80, maxSalary: 185, jobs: 1920 },
  Delaware: { avgSalary: 118, minSalary: 72, maxSalary: 168, jobs: 480 },
  "District of Columbia": { avgSalary: 138, minSalary: 88, maxSalary: 195, jobs: 2100 },
  Florida: { avgSalary: 102, minSalary: 65, maxSalary: 152, jobs: 5200 },
  Georgia: { avgSalary: 108, minSalary: 70, maxSalary: 162, jobs: 4100 },
  Hawaii: { avgSalary: 98, minSalary: 62, maxSalary: 142, jobs: 340 },
  Idaho: { avgSalary: 92, minSalary: 58, maxSalary: 132, jobs: 520 },
  Illinois: { avgSalary: 118, minSalary: 75, maxSalary: 172, jobs: 4850 },
  Indiana: { avgSalary: 98, minSalary: 62, maxSalary: 142, jobs: 2100 },
  Iowa: { avgSalary: 94, minSalary: 60, maxSalary: 135, jobs: 880 },
  Kansas: { avgSalary: 96, minSalary: 61, maxSalary: 138, jobs: 720 },
  Kentucky: { avgSalary: 92, minSalary: 58, maxSalary: 132, jobs: 1150 },
  Louisiana: { avgSalary: 94, minSalary: 59, maxSalary: 138, jobs: 980 },
  Maine: { avgSalary: 98, minSalary: 62, maxSalary: 142, jobs: 420 },
  Maryland: { avgSalary: 125, minSalary: 78, maxSalary: 182, jobs: 3200 },
  Massachusetts: { avgSalary: 135, minSalary: 85, maxSalary: 198, jobs: 6100 },
  Michigan: { avgSalary: 105, minSalary: 68, maxSalary: 155, jobs: 2650 },
  Minnesota: { avgSalary: 115, minSalary: 72, maxSalary: 168, jobs: 2280 },
  Mississippi: { avgSalary: 85, minSalary: 52, maxSalary: 125, jobs: 540 },
  Missouri: { avgSalary: 99, minSalary: 63, maxSalary: 145, jobs: 1950 },
  Montana: { avgSalary: 92, minSalary: 58, maxSalary: 132, jobs: 280 },
  Nebraska: { avgSalary: 95, minSalary: 60, maxSalary: 138, jobs: 580 },
  Nevada: { avgSalary: 108, minSalary: 68, maxSalary: 158, jobs: 920 },
  "New Hampshire": { avgSalary: 118, minSalary: 74, maxSalary: 172, jobs: 620 },
  "New Jersey": { avgSalary: 128, minSalary: 80, maxSalary: 188, jobs: 4200 },
  "New Mexico": { avgSalary: 98, minSalary: 62, maxSalary: 142, jobs: 480 },
  "New York": { avgSalary: 132, minSalary: 82, maxSalary: 195, jobs: 11200 },
  "North Carolina": { avgSalary: 108, minSalary: 68, maxSalary: 158, jobs: 3850 },
  "North Dakota": { avgSalary: 96, minSalary: 60, maxSalary: 138, jobs: 220 },
  Ohio: { avgSalary: 100, minSalary: 64, maxSalary: 148, jobs: 3450 },
  Oklahoma: { avgSalary: 92, minSalary: 58, maxSalary: 132, jobs: 820 },
  Oregon: { avgSalary: 118, minSalary: 74, maxSalary: 172, jobs: 2180 },
  Pennsylvania: { avgSalary: 112, minSalary: 70, maxSalary: 165, jobs: 4250 },
  "Rhode Island": { avgSalary: 115, minSalary: 72, maxSalary: 168, jobs: 380 },
  "South Carolina": { avgSalary: 95, minSalary: 60, maxSalary: 138, jobs: 1180 },
  "South Dakota": { avgSalary: 88, minSalary: 55, maxSalary: 128, jobs: 240 },
  Tennessee: { avgSalary: 98, minSalary: 62, maxSalary: 145, jobs: 2280 },
  Texas: { avgSalary: 112, minSalary: 70, maxSalary: 168, jobs: 9200 },
  Utah: { avgSalary: 108, minSalary: 68, maxSalary: 158, jobs: 1250 },
  Vermont: { avgSalary: 105, minSalary: 66, maxSalary: 152, jobs: 280 },
  Virginia: { avgSalary: 122, minSalary: 76, maxSalary: 178, jobs: 4850 },
  Washington: { avgSalary: 132, minSalary: 82, maxSalary: 192, jobs: 4850 },
  "West Virginia": { avgSalary: 88, minSalary: 55, maxSalary: 125, jobs: 320 },
  Wisconsin: { avgSalary: 102, minSalary: 65, maxSalary: 148, jobs: 1850 },
  Wyoming: { avgSalary: 95, minSalary: 60, maxSalary: 138, jobs: 140 },
  "Puerto Rico": { avgSalary: 72, minSalary: 45, maxSalary: 105, jobs: 420 },
};

const BORDER_SUBTLE = "#1e293b";
const ACCENT = "#22c55e";
const PRIMARY = "#3b82f6";

function getCentroid(geom) {
  let coords = [];
  if (geom.type === "Polygon" && geom.coordinates?.[0]) {
    coords = geom.coordinates[0];
  } else if (geom.type === "MultiPolygon" && geom.coordinates?.[0]?.[0]) {
    coords = geom.coordinates[0][0];
  }
  if (coords.length === 0) return null;
  let sumLng = 0, sumLat = 0, n = 0;
  for (let i = 0; i < coords.length; i++) {
    sumLng += coords[i][0];
    sumLat += coords[i][1];
    n++;
  }
  return n ? [sumLng / n, sumLat / n] : null;
}

function buildLabelGeoJSON(geojson) {
  const features = (geojson.features || []).map((f) => {
    const name = f.properties?.name;
    const center = getCentroid(f.geometry);
    if (!name || !center) return null;
    return {
      type: "Feature",
      properties: { name },
      geometry: { type: "Point", coordinates: center },
    };
  }).filter(Boolean);
  return { type: "FeatureCollection", features };
}

export default function StateMap({ accentColor = PRIMARY }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const token = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!token || !containerRef.current) return;
    let cancelled = false;

    import("mapbox-gl/dist/mapbox-gl.css");
    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled) return;
      const map = new mapboxgl.default.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-98, 39],
      zoom: 3,
      attributionControl: false,
    });

      map.addControl(new mapboxgl.default.NavigationControl(), "bottom-right");

    map.on("load", () => {
      fetch(US_STATES_GEOJSON_URL)
        .then((r) => r.json())
        .then((geojson) => {
          if (!map.getSource("states")) {
            map.addSource("states", { type: "geojson", data: geojson });
            map.addLayer({
              id: "states-fill",
              type: "fill",
              source: "states",
              paint: {
                "fill-color": "rgba(30, 41, 59, 0.6)",
                "fill-outline-color": BORDER_SUBTLE,
              },
            });
            map.addLayer({
              id: "states-hover",
              type: "fill",
              source: "states",
              paint: {
                "fill-color": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  `${accentColor}44`,
                  "rgba(0,0,0,0)",
                ],
                "fill-outline-color": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  accentColor,
                  BORDER_SUBTLE,
                ],
              },
            });

            const labelGeoJSON = buildLabelGeoJSON(geojson);
            map.addSource("state-labels", { type: "geojson", data: labelGeoJSON });
            map.addLayer({
              id: "state-names",
              type: "symbol",
              source: "state-labels",
              layout: {
                "text-field": ["get", "name"],
                "text-size": 11,
                "text-anchor": "center",
                "text-justify": "center",
              },
              paint: {
                "text-color": "#e2e8f0",
                "text-halo-color": "rgba(15,23,42,0.9)",
                "text-halo-width": 1.5,
              },
            });

            let hoveredId = null;
            map.on("mousemove", "states-fill", (e) => {
              if (e.features.length > 0) {
                const f = e.features[0];
                const name = f.properties?.name;
                const data = stateDataByName[name];
                if (hoveredId !== null) map.setFeatureState({ source: "states", id: hoveredId }, { hover: false });
                hoveredId = f.id;
                map.setFeatureState({ source: "states", id: hoveredId }, { hover: true });
                map.getCanvas().style.cursor = "pointer";
                setTooltip({
                  name: name || "Unknown",
                  ...data,
                  x: e.point.x,
                  y: e.point.y,
                });
              }
            });
            map.on("mouseleave", "states-fill", () => {
              if (hoveredId !== null) {
                map.setFeatureState({ source: "states", id: hoveredId }, { hover: false });
                hoveredId = null;
              }
              map.getCanvas().style.cursor = "";
              setTooltip(null);
            });
          }
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [token, accentColor]);

  if (!token) {
    return (
      <div
        style={{
          height: 420,
          borderRadius: 14,
          border: `1px solid ${BORDER_SUBTLE}`,
          background: "rgba(15,23,42,0.75)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 14,
          padding: 24,
          textAlign: "center",
        }}
      >
        Add <code style={{ background: "rgba(30,41,59,0.8)", padding: "2px 8px", borderRadius: 6 }}>VITE_MAPBOX_ACCESS_TOKEN</code> to your <code style={{ background: "rgba(30,41,59,0.8)", padding: "2px 8px", borderRadius: 6 }}>.env</code> to show the map.
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: 420, borderRadius: 14, overflow: "hidden", border: `1px solid ${BORDER_SUBTLE}`, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15,23,42,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: 14,
          }}
        >
          Loading map…
        </div>
      )}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 12,
            top: tooltip.y + 12,
            pointerEvents: "none",
            zIndex: 100,
            background: "rgba(15,23,42,0.97)",
            border: `1px solid ${accentColor}`,
            borderRadius: 14,
            padding: "16px 18px",
            minWidth: 180,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            animation: "hoverPreviewIn 0.15s ease-out",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 10 }}>{tooltip.name}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: accentColor, fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em", marginBottom: 8 }}>
            {tooltip.jobs != null ? tooltip.jobs.toLocaleString() : "—"}
          </div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            Avg salary: <strong style={{ color: ACCENT }}>${tooltip.avgSalary}K</strong>
          </div>
        </div>
      )}
    </div>
  );
}

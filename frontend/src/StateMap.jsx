import { useEffect, useRef, useState, memo } from "react";
import data from "./data/talentscope.json";

const US_STATES_GEOJSON_URL = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json";

// State level figures computed from the 2023 US job postings (see scripts/build_data.py).
// Salary fields are null for states with fewer than 10 postings that list a salary.
export const stateDataByName = Object.fromEntries(
  Object.entries(data.stateData).map(([name, d]) => [
    name,
    { avgSalary: d.avgSalary, minSalary: d.minSalary, maxSalary: d.maxSalary, jobs: d.jobs },
  ]),
);

const BORDER_SUBTLE = "#1e293b";
const ACCENT = "#22c55e";
const PRIMARY = "#3b82f6";

function StateMap({ accentColor = PRIMARY }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const geojsonRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const tooltipRafRef = useRef(null);

  useEffect(() => {
    fetch(US_STATES_GEOJSON_URL).then((r) => r.json()).then((d) => { geojsonRef.current = d; }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    import("maplibre-gl/dist/maplibre-gl.css");
    import("maplibre-gl").then((maplibregl) => {
      if (cancelled) return;
      const maplibre = maplibregl.default;
      const map = new maplibre.Map({
        container: containerRef.current,
        // No basemap and no tokens: a plain dark background with the state shapes drawn on top.
        style: { version: 8, sources: {}, layers: [{ id: "bg", type: "background", paint: { "background-color": "#020617" } }] },
        center: [-98, 39],
        zoom: 3,
        attributionControl: false,
      });

      map.addControl(new maplibre.NavigationControl(), "bottom-right");
      map.on("error", (e) => {
        if (!cancelled) setError(e.error?.message || "Map failed to load");
      });

    map.on("load", () => {
      const useGeoJSON = (geojson) => {
          if (!map.getSource("states")) {
            geojson.features.forEach((f) => {
              f.properties = { ...f.properties, jobs: stateDataByName[f.properties?.name]?.jobs ?? 0 };
            });
            map.addSource("states", { type: "geojson", data: geojson });
            geojsonRef.current = null;
            map.addLayer({
              id: "states-fill",
              type: "fill",
              source: "states",
              paint: {
                // Darker means fewer postings, brighter blue means more.
                "fill-color": ["step", ["get", "jobs"], "#1e293b", 500, "#1e3a5f", 2000, "#1d4f91", 5000, "#2563eb", 10000, "#3b82f6", 20000, "#60a5fa"],
                "fill-outline-color": "transparent",
              },
            });
            map.addLayer({
              id: "states-outline",
              type: "line",
              source: "states",
              paint: {
                "line-color": "#475569",
                "line-width": 1.25,
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
                  accentColor,
                  "rgba(0,0,0,0)",
                ],
                "fill-opacity": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  0.27,
                  0,
                ],
                "fill-outline-color": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false],
                  accentColor,
                  "transparent",
                ],
              },
            });

            const nameToId = {};
            geojson.features.forEach((f) => {
              const id = f.id ?? f.properties?.id;
              if (f.properties?.name != null && id != null) nameToId[f.properties.name] = id;
            });
            let hoveredId = null;
            const showTooltip = (name, point) => {
              if (tooltipRafRef.current) cancelAnimationFrame(tooltipRafRef.current);
              tooltipRafRef.current = requestAnimationFrame(() => {
                tooltipRafRef.current = null;
                const data = stateDataByName[name];
                setTooltip({
                  name: name || "Unknown",
                  ...data,
                  x: point.x,
                  y: point.y,
                });
              });
            };
            const clearHover = () => {
              if (hoveredId !== null) {
                map.setFeatureState({ source: "states", id: hoveredId }, { hover: false });
                hoveredId = null;
              }
              map.getCanvas().style.cursor = "";
              setTooltip(null);
            };
            map.on("mousemove", (e) => {
              const features = map.queryRenderedFeatures(e.point);
              const fillF = features.find((f) => f.layer.id === "states-fill");
              const name = fillF?.properties?.name;
              if (!name) {
                clearHover();
                return;
              }
              map.getCanvas().style.cursor = "pointer";
              const id = fillF?.id ?? nameToId[name];
              if (id != null) {
                if (hoveredId !== null && hoveredId !== id) map.setFeatureState({ source: "states", id: hoveredId }, { hover: false });
                hoveredId = id;
                map.setFeatureState({ source: "states", id: hoveredId }, { hover: true });
              }
              showTooltip(name, e.point);
            });
            map.on("mouseleave", clearHover);
          }
          setLoaded(true);
        };
      if (geojsonRef.current) {
        useGeoJSON(geojsonRef.current);
      } else {
        fetch(US_STATES_GEOJSON_URL).then((r) => r.json()).then(useGeoJSON).catch((err) => {
          if (!cancelled) setError(err?.message || "Could not load map data");
          setLoaded(true);
        });
      }
    });

      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      if (tooltipRafRef.current) cancelAnimationFrame(tooltipRafRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [accentColor]);

  return (
    <div style={{ position: "relative", height: 420, borderRadius: 14, overflow: "hidden", border: `1px solid ${BORDER_SUBTLE}`, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15,23,42,0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            fontSize: 14,
            padding: 24,
            textAlign: "center",
          }}
        >
          <span style={{ color: "#f87171", marginBottom: 8 }}>Map failed to load</span>
          <span style={{ fontSize: 12, color: "#64748b" }}>{error}</span>
        </div>
      )}
      {!loaded && !error && (
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
            Median salary: <strong style={{ color: ACCENT }}>{tooltip.avgSalary != null ? `$${tooltip.avgSalary}K` : "not enough data"}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(StateMap);

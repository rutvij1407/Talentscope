import { useEffect, useMemo, useRef, useState, memo } from "react";
import data from "./data/talentscope.json";

// State figures computed from the 2023 US job postings (see scripts/build_data.py).
// Salary fields are null for states with fewer than 10 postings that list a salary.
export const stateDataByName = Object.fromEntries(
  Object.entries(data.stateData).map(([name, d]) => [
    name,
    { avgSalary: d.avgSalary, minSalary: d.minSalary, maxSalary: d.maxSalary, jobs: d.jobs, byRole: d.byRole },
  ]),
);

const ROLES = ["All roles", ...Object.keys(Object.values(data.stateData)[0].byRole || {})];
const METRICS = [
  { id: "jobs", label: "Postings" },
  { id: "salary", label: "Median salary" },
];
// One sequential ramp on a dark map: low values stay quiet, high values glow.
const RAMP = ["#12304f", "#16507c", "#1473a3", "#16a0b8", "#3cc7b2", "#a6f0c6"];
const BASEMAP = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";

const fmtJobs = (n) => (n >= 10000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString());

function valueOf(name, metric, role) {
  const d = stateDataByName[name];
  if (!d) return null;
  if (metric === "salary") return d.avgSalary;
  return role === "All roles" ? d.jobs : d.byRole?.[role] ?? 0;
}

function StateMap() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const geoRef = useRef(null);
  const [metric, setMetric] = useState("jobs");
  const [role, setRole] = useState("All roles");
  const [selected, setSelected] = useState("California");
  const [hover, setHover] = useState(null);
  const [status, setStatus] = useState("loading");
  const [showCities, setShowCities] = useState(true);

  const ranking = useMemo(
    () =>
      Object.keys(stateDataByName)
        .map((name) => ({ name, value: valueOf(name, metric, role) }))
        .filter((r) => r.value != null && r.value > 0)
        .sort((a, b) => b.value - a.value),
    [metric, role],
  );
  const max = ranking[0]?.value || 1;
  const min = ranking.length ? ranking[ranking.length - 1].value : 0;

  // Quantile breaks so a few huge states do not wash out the rest of the map.
  const breaks = useMemo(() => {
    const v = ranking.map((r) => r.value).sort((a, b) => a - b);
    if (v.length < 6) return [1, 2, 3, 4, 5];
    const q = (p) => v[Math.min(v.length - 1, Math.floor(p * v.length))];
    const raw = [q(0.2), q(0.4), q(0.6), q(0.8), q(0.93)];
    // step expressions need strictly ascending stops
    return raw.map((b, i) => (i > 0 && b <= raw[i - 1] ? raw[i - 1] + 0.001 * (i + 1) : b));
  }, [ranking]);

  const fmt = (n) => (n == null ? "n/a" : metric === "salary" ? `$${n}K` : fmtJobs(n));

  // Build the map once.
  useEffect(() => {
    let cancelled = false;
    import("maplibre-gl/dist/maplibre-gl.css");
    Promise.all([import("maplibre-gl"), fetch("/us-states.json").then((r) => r.json())])
      .then(([ml, geo]) => {
        if (cancelled || !containerRef.current) return;
        const maplibre = ml.default;
        geoRef.current = geo;
        const map = new maplibre.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {
              base: { type: "raster", tiles: [BASEMAP], tileSize: 256, attribution: "Tiles © Esri, HERE, Garmin, OpenStreetMap contributors", maxzoom: 16 },
            },
            layers: [
              { id: "bg", type: "background", paint: { "background-color": "#050b18" } },
              { id: "base", type: "raster", source: "base", paint: { "raster-opacity": 0.85 } },
            ],
          },
          bounds: [[-126, 23.5], [-65.5, 50.5]],
          fitBoundsOptions: { padding: 18 },
          minZoom: 2.5,
          maxZoom: 8,
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        const ro = new ResizeObserver(() => map.resize());
        ro.observe(containerRef.current);
        map.once("remove", () => ro.disconnect());
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "bottom-right");

        map.on("load", () => {
          if (cancelled) return;
          map.addSource("states", { type: "geojson", data: geo, promoteId: "name" });
          map.addLayer({
            id: "states-fill", type: "fill", source: "states",
            paint: {
              "fill-color": RAMP[0],
              "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.95, 0.78],
            },
          });
          map.addLayer({
            id: "states-line", type: "line", source: "states",
            paint: {
              "line-color": ["case", ["boolean", ["feature-state", "selected"], false], "#ffffff", "#0b1424"],
              "line-width": ["case", ["boolean", ["feature-state", "selected"], false], 2.4, 0.8],
            },
          });

          map.addSource("cities", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: data.cityPoints.map((c) => ({
                type: "Feature",
                properties: { city: c.city, state: c.state, jobs: c.jobs, salary: c.medianSalary ?? 0 },
                geometry: { type: "Point", coordinates: [c.lon, c.lat] },
              })),
            },
          });
          map.addLayer({
            id: "cities-glow", type: "circle", source: "cities",
            paint: { "circle-radius": ["interpolate", ["linear"], ["get", "jobs"], 600, 9, 8000, 34], "circle-color": "#f59e0b", "circle-opacity": 0.16, "circle-blur": 1 },
          });
          map.addLayer({
            id: "cities-dot", type: "circle", source: "cities",
            paint: {
              "circle-radius": ["interpolate", ["linear"], ["get", "jobs"], 600, 3, 8000, 11],
              "circle-color": "#fbbf24", "circle-opacity": 0.92, "circle-stroke-color": "#0b1424", "circle-stroke-width": 1.2,
            },
          });

          let hovered = null;
          const clear = () => {
            if (hovered) map.setFeatureState({ source: "states", id: hovered }, { hover: false });
            hovered = null;
            map.getCanvas().style.cursor = "";
            setHover(null);
          };
          map.on("mousemove", (e) => {
            const city = map.queryRenderedFeatures(e.point, { layers: ["cities-dot"] })[0];
            if (city) {
              map.getCanvas().style.cursor = "pointer";
              setHover({ city: city.properties, x: e.point.x, y: e.point.y });
              return;
            }
            const st = map.queryRenderedFeatures(e.point, { layers: ["states-fill"] })[0];
            const name = st?.properties?.name;
            if (!name) return clear();
            if (hovered && hovered !== name) map.setFeatureState({ source: "states", id: hovered }, { hover: false });
            hovered = name;
            map.setFeatureState({ source: "states", id: name }, { hover: true });
            map.getCanvas().style.cursor = "pointer";
            setHover({ name, x: e.point.x, y: e.point.y });
          });
          map.on("mouseout", clear);
          map.on("click", (e) => {
            const st = map.queryRenderedFeatures(e.point, { layers: ["states-fill"] })[0];
            if (st?.properties?.name) setSelected(st.properties.name);
          });
          setStatus("ready");
        });
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Recolor when the metric, role or breaks change.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready" || !geoRef.current) return;
    const g = geoRef.current;
    g.features.forEach((f) => {
      const v = valueOf(f.properties.name, metric, role);
      f.properties.v = v == null || v <= 0 ? -1 : v;
    });
    map.getSource("states").setData(g);
    const step = ["step", ["get", "v"], RAMP[0]];
    breaks.forEach((b, i) => step.push(b, RAMP[i + 1]));
    map.setPaintProperty("states-fill", "fill-color", ["case", ["==", ["get", "v"], -1], "#1b2433", step]);
  }, [metric, role, breaks, status]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    const v = showCities ? "visible" : "none";
    map.setLayoutProperty("cities-glow", "visibility", v);
    map.setLayoutProperty("cities-dot", "visibility", v);
  }, [showCities, status]);

  const prevSel = useRef(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    if (prevSel.current) map.setFeatureState({ source: "states", id: prevSel.current }, { selected: false });
    map.setFeatureState({ source: "states", id: selected }, { selected: true });
    prevSel.current = selected;
  }, [selected, status]);

  const sel = stateDataByName[selected];
  const selRank = ranking.findIndex((r) => r.name === selected) + 1;
  const roleMix = sel?.byRole ? Object.entries(sel.byRole).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 4) : [];
  const roleMax = roleMix[0]?.[1] || 1;

  const seg = (active) => ({
    padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "1px solid #223049",
    background: active ? "#2563eb" : "#0b1424", color: active ? "#fff" : "#94a3b8", transition: "all .15s",
  });

  return (
    <div className="ts-map">
      <style>{`
        .ts-map{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:14px}
        .ts-map-canvas{position:relative;height:560px;border-radius:14px;overflow:hidden;border:1px solid #1e293b;box-shadow:0 8px 30px rgba(0,0,0,.35)}
        .ts-map-side{display:flex;flex-direction:column;gap:12px;min-width:0}
        .ts-rank{display:flex;align-items:center;gap:8px;width:100%;background:none;border:0;padding:5px 6px;border-radius:8px;cursor:pointer;color:#cbd5e1;font-size:12px;text-align:left}
        .ts-rank:hover,.ts-rank.on{background:rgba(59,130,246,.14)}
        .ts-map .maplibregl-ctrl-group{background:#0b1424!important;border:1px solid #223049}
        .ts-map .maplibregl-ctrl-group button .maplibregl-ctrl-icon{filter:invert(.85)}
        .ts-map .maplibregl-ctrl-attrib{background:rgba(5,11,24,.7)!important;color:#64748b!important}
        .ts-map .maplibregl-ctrl-attrib a{color:#94a3b8!important}
        @media (max-width:900px){.ts-map{grid-template-columns:1fr}.ts-map-canvas{height:420px}}
      `}</style>

      <div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", borderRadius: 10, overflow: "hidden" }} role="tablist" aria-label="Map metric">
            {METRICS.map((m) => (
              <button key={m.id} role="tab" aria-selected={metric === m.id} style={seg(metric === m.id)} onClick={() => setMetric(m.id)}>{m.label}</button>
            ))}
          </div>
          <select
            aria-label="Role filter" value={role} onChange={(e) => setRole(e.target.value)} disabled={metric === "salary"}
            style={{ background: "#0b1424", color: "#e2e8f0", border: "1px solid #223049", borderRadius: 10, padding: "7px 10px", fontSize: 12, opacity: metric === "salary" ? 0.5 : 1 }}
          >
            {ROLES.map((r) => <option key={r}>{r}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 12, cursor: "pointer" }}>
            <input type="checkbox" checked={showCities} onChange={(e) => setShowCities(e.target.checked)} /> Top {data.cityPoints.length} cities
          </label>
        </div>

        <div className="ts-map-canvas">
          <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />
          {status === "loading" && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#94a3b8", fontSize: 14, background: "#050b18" }}>Loading map…</div>}
          {status === "error" && (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#94a3b8", fontSize: 13, background: "#050b18", textAlign: "center", padding: 24 }}>
              The map could not load. The ranked list still works.
            </div>
          )}
          {hover && (
            <div style={{ position: "absolute", left: hover.x + 14, top: hover.y + 14, pointerEvents: "none", zIndex: 5, background: "rgba(7,12,24,.96)", border: "1px solid #2b3b57", borderRadius: 12, padding: "10px 13px", minWidth: 150 }}>
              {hover.city ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24" }}>{hover.city.city}, {hover.city.state}</div>
                  <div style={{ fontSize: 12, color: "#cbd5e1", marginTop: 3 }}>{Number(hover.city.jobs).toLocaleString()} postings</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{Number(hover.city.salary) > 0 ? `Median $${hover.city.salary}K` : "Salary not listed"}</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{hover.name}</div>
                  <div style={{ fontSize: 12, color: "#7dd3fc", marginTop: 3 }}>{fmt(valueOf(hover.name, metric, role))} {metric === "jobs" ? "postings" : "median"}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Click for details</div>
                </>
              )}
            </div>
          )}
          <div style={{ position: "absolute", left: 12, bottom: 12, background: "rgba(7,12,24,.88)", border: "1px solid #223049", borderRadius: 10, padding: "8px 10px", zIndex: 4 }}>
            <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 5, letterSpacing: ".06em", textTransform: "uppercase" }}>{metric === "jobs" ? "Postings" : "Median salary"}</div>
            <div style={{ display: "flex", height: 8, width: 150, borderRadius: 4, overflow: "hidden" }}>{RAMP.map((c) => <span key={c} style={{ flex: 1, background: c }} />)}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8", marginTop: 4 }}><span>{fmt(min)}</span><span>{fmt(max)}</span></div>
          </div>
        </div>
      </div>

      <div className="ts-map-side">
        <div style={{ background: "rgba(15,23,42,.7)", border: "1px solid #1e293b", borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em" }}>Selected state</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: "2px 0 8px" }}>{selected}</div>
          <div style={{ display: "flex", gap: 18 }}>
            <div><div style={{ fontSize: 20, fontWeight: 800, color: "#3b82f6" }}>{sel?.jobs?.toLocaleString() ?? "n/a"}</div><div style={{ fontSize: 11, color: "#64748b" }}>postings</div></div>
            <div><div style={{ fontSize: 20, fontWeight: 800, color: "#22c55e" }}>{sel?.avgSalary != null ? `$${sel.avgSalary}K` : "n/a"}</div><div style={{ fontSize: 11, color: "#64748b" }}>median salary</div></div>
          </div>
          {sel?.minSalary != null && <div style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>Typical range ${sel.minSalary}K to ${sel.maxSalary}K (10th to 90th percentile)</div>}
          {selRank > 0 && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Rank {selRank} of {ranking.length} by {metric === "jobs" ? "postings" : "salary"}</div>}
          <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
            {roleMix.map(([r, n]) => (
              <div key={r} style={{ fontSize: 11, color: "#94a3b8" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span>{r}</span><span>{n.toLocaleString()}</span></div>
                <div style={{ height: 4, background: "#16213a", borderRadius: 2, marginTop: 3 }}><div style={{ width: `${(n / roleMax) * 100}%`, height: "100%", background: "#3b82f6", borderRadius: 2 }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "rgba(15,23,42,.7)", border: "1px solid #1e293b", borderRadius: 14, padding: 10, maxHeight: 300, overflowY: "auto" }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".08em", padding: "4px 6px 8px" }}>Ranking</div>
          {ranking.slice(0, 15).map((r, i) => (
            <button key={r.name} className={`ts-rank${r.name === selected ? " on" : ""}`} onClick={() => setSelected(r.name)}>
              <span style={{ width: 18, color: "#475569" }}>{i + 1}</span>
              <span style={{ flex: 1 }}>{r.name}</span>
              <span style={{ color: "#7dd3fc", fontWeight: 600 }}>{fmt(r.value)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(StateMap);

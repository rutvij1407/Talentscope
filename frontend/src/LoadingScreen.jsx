import { useState, useEffect } from "react";

const BG_DARK = "#020617";
const BORDER_SUBTLE = "#1e293b";
const PRIMARY = "#3b82f6";

export default function LoadingScreen({ onFinish, minDuration = 1200 }) {
  const [start] = useState(() => Date.now());
  const [done, setDone] = useState(false);

  useEffect(() => {
    const elapsed = () => Date.now() - start;
    const id = setInterval(() => {
      if (elapsed() >= minDuration) {
        setDone(true);
        onFinish?.();
        clearInterval(id);
      }
    }, 50);
    return () => clearInterval(id);
  }, [start, minDuration, onFinish]);

  if (done) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: BG_DARK,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${BORDER_SUBTLE}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: PRIMARY,
          fontFamily: "'Inter', system-ui, sans-serif",
          letterSpacing: "-0.02em",
          marginBottom: 24,
        }}
      >
        TalentScope
      </div>
      <div
        style={{
          width: 40,
          height: 40,
          border: `3px solid ${BORDER_SUBTLE}`,
          borderTopColor: PRIMARY,
          borderRadius: "50%",
          animation: "loadingSpin 0.8s linear infinite",
        }}
      />
      <div style={{ marginTop: 16, fontSize: 12, color: "#64748b" }}>Loading dashboard…</div>
      <style>{`
        @keyframes loadingSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

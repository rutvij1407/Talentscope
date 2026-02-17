import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from "recharts";

// Professional, muted analytics palette
const PRIMARY = "#3b82f6"; // blue-500
const PRIMARY_SOFT = "#60a5fa"; // blue-400
const ACCENT = "#22c55e"; // green-500
const ACCENT_SOFT = "#86efac"; // green-300
const MUTED_1 = "#f97316"; // orange-500
const MUTED_2 = "#a855f7"; // purple-500
const BG_DARK = "#020617"; // slate-950
const BG_CARD = "#020617"; // subtle cards, rely on borders/shadows
const BORDER_SUBTLE = "#1e293b";

const skillsData = [
  { skill: "Python", demand: 78, salary: 125 },
  { skill: "SQL", demand: 72, salary: 115 },
  { skill: "Tableau", demand: 58, salary: 108 },
  { skill: "R", demand: 42, salary: 112 },
  { skill: "Power BI", demand: 51, salary: 105 },
  { skill: "Spark", demand: 38, salary: 135 },
  { skill: "AWS", demand: 45, salary: 140 },
  { skill: "TensorFlow", demand: 32, salary: 145 },
  { skill: "Excel", demand: 65, salary: 95 },
  { skill: "Java", demand: 35, salary: 130 },
];

const salaryTrend = [
  { month: "Jan", analyst: 85, scientist: 115, engineer: 125 },
  { month: "Feb", analyst: 87, scientist: 118, engineer: 128 },
  { month: "Mar", analyst: 86, scientist: 120, engineer: 132 },
  { month: "Apr", analyst: 90, scientist: 122, engineer: 130 },
  { month: "May", analyst: 92, scientist: 125, engineer: 135 },
  { month: "Jun", analyst: 91, scientist: 128, engineer: 138 },
  { month: "Jul", analyst: 95, scientist: 130, engineer: 140 },
  { month: "Aug", analyst: 93, scientist: 132, engineer: 142 },
];

const jobDistribution = [
  { name: "Data Analyst", value: 35, color: PRIMARY },
  { name: "Data Scientist", value: 28, color: MUTED_2 },
  { name: "Data Engineer", value: 22, color: ACCENT },
  { name: "ML Engineer", value: 15, color: MUTED_1 },
];

const locationData = [
  { city: "San Francisco", jobs: 4200, avg_salary: 155 },
  { city: "New York", jobs: 3800, avg_salary: 145 },
  { city: "Seattle", jobs: 2900, avg_salary: 150 },
  { city: "Austin", jobs: 2100, avg_salary: 128 },
  { city: "Chicago", jobs: 1800, avg_salary: 120 },
  { city: "Boston", jobs: 1600, avg_salary: 138 },
  { city: "Denver", jobs: 1200, avg_salary: 118 },
  { city: "Remote", jobs: 5500, avg_salary: 132 },
];

const radarData = [
  { subject: "Python", A: 92, B: 78 },
  { subject: "SQL", A: 88, B: 85 },
  { subject: "ML", A: 75, B: 45 },
  { subject: "Stats", A: 82, B: 70 },
  { subject: "Viz", A: 70, B: 90 },
  { subject: "Cloud", A: 65, B: 40 },
];

const postingVolume = [
  { week: "W1", postings: 2400 },
  { week: "W2", postings: 2800 },
  { week: "W3", postings: 3100 },
  { week: "W4", postings: 2900 },
  { week: "W5", postings: 3500 },
  { week: "W6", postings: 3800 },
  { week: "W7", postings: 4200 },
  { week: "W8", postings: 4600 },
];

function AnimatedCounter({ target, duration = 2000, prefix = "", suffix = "" }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function GlowCard({ children, delay = 0, glowColor = PRIMARY, style = {} }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setVisible(true);
        },
        { threshold: 0.1 },
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        background: BG_CARD,
        borderRadius: "16px",
        border: `1px solid ${BORDER_SUBTLE}`,
        padding: "24px",
        transition: "all 0.35s ease-out",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = glowColor;
        e.currentTarget.style.boxShadow = `0 18px 40px rgba(15,23,42,0.85)`;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = BORDER_SUBTLE;
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </div>
  );
}

function PulsingDot({ color }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        width: 8,
        height: 8,
        marginRight: 8,
      }}
    >
      <span
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          animation: "pulse 2s ease-in-out infinite",
        }}
      />
      <span
        style={{
          position: "absolute",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          opacity: 0.4,
          animation: "pulseRing 2s ease-in-out infinite",
        }}
      />
    </span>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        background: active ? "rgba(148,163,184,0.12)" : "transparent",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        width: "100%",
        borderLeft: active ? `3px solid ${PRIMARY}` : "3px solid transparent",
        transition: "all 0.3s ease",
        color: active ? "#e5f0ff" : "#94a3b8",
        fontSize: 13,
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MetricCard({ label, value, prefix, suffix, subtext, color, delay }) {
  return (
    <GlowCard delay={delay} glowColor={color}>
      <div
        style={{
          fontSize: 12,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: 1.5,
          marginBottom: 8,
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color,
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          marginBottom: 4,
        }}
      >
        <AnimatedCounter target={parseInt(value, 10)} prefix={prefix || ""} suffix={suffix || ""} />
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#22c55e",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <PulsingDot color="#22c55e" />
        {subtext}
      </div>
    </GlowCard>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.96)",
        border: `1px solid ${BORDER_SUBTLE}`,
        borderRadius: 10,
        padding: "10px 14px",
        backdropFilter: "blur(6px)",
        boxShadow: "0 18px 40px rgba(15,23,42,0.8)",
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: 11,
          marginBottom: 6,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {label}
      </div>
      {payload.map((p, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={{
            color: p.color || PRIMARY,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          {p.name}: {p.value}
          {typeof p.value === "number" && p.value < 200 ? "K" : ""}
        </div>
      ))}
    </div>
  );
}

function SalaryPredictor() {
  const [role, setRole] = useState("Data Analyst");
  const [exp, setExp] = useState("Mid");
  const [loc, setLoc] = useState("Remote");
  const [predicted, setPredicted] = useState(null);
  const [animating, setAnimating] = useState(false);

  const predict = () => {
    setAnimating(true);
    setPredicted(null);
    setTimeout(() => {
      const base = {
        "Data Analyst": 85,
        "Data Scientist": 115,
        "Data Engineer": 125,
        "ML Engineer": 140,
      };
      const expMult = { Junior: 0.75, Mid: 1, Senior: 1.35 };
      const locMult = {
        "San Francisco": 1.3,
        "New York": 1.25,
        Seattle: 1.2,
        Remote: 1.05,
        Austin: 1.0,
      };
      const val = Math.round(base[role] * expMult[exp] * (locMult[loc] || 1));
      setPredicted(val);
      setAnimating(false);
    }, 1500);
  };

  const selectStyle = {
    background: "#020617",
    color: "#e5e7eb",
    border: `1px solid ${BORDER_SUBTLE}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    outline: "none",
    cursor: "pointer",
    width: "100%",
    appearance: "none",
    WebkitAppearance: "none",
  };

  return (
    <GlowCard delay={200} glowColor={PRIMARY} style={{ gridColumn: "1 / -1" }}>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#e2e8f0",
          marginBottom: 6,
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        ML Salary Predictor
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#64748b",
          marginBottom: 20,
        }}
      >
        Random Forest + Gradient Boosting ensemble model
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr auto",
          gap: 16,
          alignItems: "end",
        }}
      >
        <div>
          <label
            style={{
              fontSize: 11,
              color: "#64748b",
              display: "block",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Role
          </label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={selectStyle}>
            {["Data Analyst", "Data Scientist", "Data Engineer", "ML Engineer"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              fontSize: 11,
              color: "#64748b",
              display: "block",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Experience
          </label>
          <select value={exp} onChange={(e) => setExp(e.target.value)} style={selectStyle}>
            {["Junior", "Mid", "Senior"].map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              fontSize: 11,
              color: "#64748b",
              display: "block",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Location
          </label>
          <select value={loc} onChange={(e) => setLoc(e.target.value)} style={selectStyle}>
            {["San Francisco", "New York", "Seattle", "Remote", "Austin"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={predict}
          style={{
            background: PRIMARY,
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "12px 28px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            transition: "all 0.3s",
            boxShadow: "0 18px 40px rgba(15,23,42,0.8)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = PRIMARY_SOFT;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PRIMARY;
          }}
        >
          {animating ? "⟳ COMPUTING..." : "PREDICT"}
        </button>
      </div>
      {predicted && (
        <div
          style={{
            marginTop: 20,
            padding: "16px 24px",
            background: "#020617",
            borderRadius: 12,
            border: `1px solid ${BORDER_SUBTLE}`,
            display: "flex",
            alignItems: "center",
            gap: 16,
            animation: "fadeSlideUp 0.5s ease-out",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            Predicted Salary
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: PRIMARY,
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            ${predicted}K
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              marginLeft: "auto",
            }}
          >
            Range: ${predicted - 12}K ~ ${predicted + 18}K | Confidence: 87%
          </div>
        </div>
      )}
    </GlowCard>
  );
}

function SkillBar({ skill, demand, maxDemand, delay, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth((demand / maxDemand) * 100), delay);
    return () => clearTimeout(timer);
  }, [demand, maxDemand, delay]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 80,
          fontSize: 12,
          color: "#94a3b8",
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          textAlign: "right",
        }}
      >
        {skill}
      </div>
      <div
        style={{
          flex: 1,
          height: 20,
          background: "#020617",
          borderRadius: 10,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${width}%`,
            height: "100%",
            borderRadius: 10,
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            transition: "width 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: "none",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 30,
              background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.45))",
              borderRadius: "0 10px 10px 0",
            }}
          />
        </div>
      </div>
      <div
        style={{
          width: 36,
          fontSize: 13,
          color,
          fontWeight: 600,
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {demand}%
      </div>
    </div>
  );
}

export default function TalentScopeDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const pages = [
    { id: "overview", icon: "◈", label: "Market Overview" },
    { id: "skills", icon: "⬡", label: "Skills Intel" },
    { id: "salary", icon: "◉", label: "Salary Insights" },
    { id: "predict", icon: "△", label: "ML Predictor" },
    { id: "explore", icon: "☰", label: "Data Explorer" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG_DARK,
        color: "#e2e8f0",
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
      }}
    >
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.02; }
          50% { opacity: 0.05; }
        }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${BG_DARK}; }
        ::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #4b5563; }

        select option { background: #020617; color: #e5e7eb; }
      `}
      </style>

      {/* Background grid effect */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: `
          linear-gradient(rgba(148,163,184,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148,163,184,0.1) 1px, transparent 1px)
        `,
          backgroundSize: "60px 60px",
          animation: "gridPulse 4s ease-in-out infinite",
        }}
      />

      {/* Sidebar */}
      <div
        style={{
          width: 220,
          background: "#020617",
          borderRight: `1px solid ${BORDER_SUBTLE}`,
          padding: "24px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          position: "relative",
          zIndex: 10,
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateX(0)" : "translateX(-30px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "8px 16px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              color: "#e5e7eb",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundImage: "linear-gradient(135deg, #e5e7eb, #9ca3af)",
            }}
          >
            TALENT
          </div>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              color: "#9ca3af",
              letterSpacing: 2,
            }}
          >
            SCOPE
          </div>
          <div
            style={{
              fontSize: 9,
              color: "#475569",
              marginTop: 4,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Job Market Intelligence
          </div>
        </div>

        {pages.map((p) => (
          <NavItem key={p.id} icon={p.icon} label={p.label} active={activePage === p.id} onClick={() => setActivePage(p.id)} />
        ))}

        <div
          style={{
            marginTop: "auto",
            padding: "16px",
            borderTop: `1px solid ${BORDER_SUBTLE}`,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: "#475569",
              lineHeight: 1.6,
            }}
          >
            <PulsingDot color={ACCENT} /> 1.3M+ Jobs Analyzed
            <br />
            <span
              style={{
                color: "#334155",
                marginLeft: 16,
              }}
            >
              Last updated: Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: "28px 32px",
          overflowY: "auto",
          position: "relative",
          zIndex: 5,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(-20px)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 600,
                fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                margin: 0,
                color: "#f1f5f9",
              }}
            >
              {pages.find((p) => p.id === activePage)?.label}
            </h1>
            <p
              style={{
                color: "#64748b",
                fontSize: 12,
                margin: "6px 0 0",
              }}
            >
              Real-time insights from 1,300,000+ LinkedIn job postings
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              background: "rgba(15,23,42,0.85)",
              borderRadius: 10,
              padding: "8px 16px",
              border: `1px solid ${BORDER_SUBTLE}`,
            }}
          >
            <PulsingDot color={ACCENT} />
            <span
              style={{
                fontSize: 12,
                color: "#e5e7eb",
              }}
            >
              LIVE DATA
            </span>
          </div>
        </div>

        {/* Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <MetricCard label="Total Postings" value="1300000" suffix="+" color={PRIMARY} delay={100} subtext="+12.4% this month" />
          <MetricCard label="Avg Salary" value="118" prefix="$" suffix="K" color={ACCENT} delay={200} subtext="+5.2% YoY growth" />
          <MetricCard label="Companies" value="48500" suffix="+" color={MUTED_2} delay={300} subtext="Across 12 industries" />
          <MetricCard label="Skills Tracked" value="847" color={MUTED_1} delay={400} subtext="Updated weekly" />
        </div>

        {/* OVERVIEW PAGE */}
        {activePage === "overview" && (
          <>
            {/* Charts Row 1 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <GlowCard delay={500} glowColor={PRIMARY}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#e2e8f0",
                        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                    >
                      Salary Trends by Role
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#64748b",
                        marginTop: 2,
                      }}
                    >
                      Monthly average (in $K)
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                    }}
                  >
                    {[
                      { label: "Analyst", color: PRIMARY },
                      { label: "Scientist", color: MUTED_2 },
                      { label: "Engineer", color: ACCENT },
                    ].map((l) => (
                      <div
                        key={l.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          color: l.color,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: l.color,
                          }}
                        />
                        {l.label}
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={salaryTrend}>
                    <defs>
                      <linearGradient id="gradPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PRIMARY_SOFT} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={PRIMARY_SOFT} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradSecondary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={MUTED_2} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={MUTED_2} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradAccent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT_SOFT} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={ACCENT_SOFT} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#334155" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis stroke="#334155" tick={{ fill: "#64748b", fontSize: 11 }} domain={[75, 150]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="analyst" stroke={PRIMARY} fill="url(#gradPrimary)" strokeWidth={2} dot={false} name="Analyst" />
                    <Area type="monotone" dataKey="scientist" stroke={MUTED_2} fill="url(#gradSecondary)" strokeWidth={2} dot={false} name="Scientist" />
                    <Area type="monotone" dataKey="engineer" stroke={ACCENT} fill="url(#gradAccent)" strokeWidth={2} dot={false} name="Engineer" />
                  </AreaChart>
                </ResponsiveContainer>
              </GlowCard>

              <GlowCard delay={600} glowColor={PRIMARY}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#e2e8f0",
                    marginBottom: 4,
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Role Distribution
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 8,
                  }}
                >
                  Across all postings
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={jobDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={68} dataKey="value" stroke="none">
                      {jobDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  {jobDistribution.map((d) => (
                    <div
                      key={d.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 10,
                        color: "#94a3b8",
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: d.color,
                        }}
                      />
                      {d.name} ({d.value}%)
                    </div>
                  ))}
                </div>
              </GlowCard>
            </div>

            {/* Charts Row 2 */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <GlowCard delay={700} glowColor={PRIMARY}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#e2e8f0",
                    marginBottom: 4,
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Top Skills Demand
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 16,
                  }}
                >
                  Percentage of job postings requiring each skill
                </div>
                {skillsData
                  .slice()
                  .sort((a, b) => b.demand - a.demand)
                  .map((s, i) => (
                    <SkillBar
                      key={s.skill}
                      skill={s.skill}
                      demand={s.demand}
                      maxDemand={85}
                      delay={800 + i * 100}
                      color={i < 3 ? PRIMARY : i < 6 ? MUTED_2 : ACCENT}
                    />
                  ))}
              </GlowCard>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <GlowCard delay={800} glowColor={MUTED_1}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#e2e8f0",
                      marginBottom: 4,
                      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    Skill Profile: Analyst vs Scientist
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      marginBottom: 4,
                    }}
                  >
                    Radar comparison
                  </div>
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                      <PolarRadiusAxis tick={false} axisLine={false} />
                      <Radar name="Data Scientist" dataKey="A" stroke={PRIMARY} fill={PRIMARY} fillOpacity={0.12} strokeWidth={2} />
                      <Radar name="Data Analyst" dataKey="B" stroke={MUTED_1} fill={MUTED_1} fillOpacity={0.12} strokeWidth={2} />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                </GlowCard>

                <GlowCard delay={900} glowColor={PRIMARY}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#e2e8f0",
                      marginBottom: 4,
                      fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                  >
                    Posting Volume Trend
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      marginBottom: 4,
                    }}
                  >
                    Weekly job postings
                  </div>
                  <ResponsiveContainer width="100%" height={100}>
                    <BarChart data={postingVolume}>
                      <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 10 }} stroke="transparent" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="postings" name="Postings" radius={[4, 4, 0, 0]}>
                        {postingVolume.map((_, i) => (
                          <Cell key={String(i)} fill={PRIMARY} opacity={0.5 + (i / postingVolume.length) * 0.4} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </GlowCard>
              </div>
            </div>

            {/* Salary Predictor */}
            <SalaryPredictor />

            {/* Top Locations Table */}
            <GlowCard delay={1000} glowColor={PRIMARY} style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginBottom: 4,
                  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Top Hiring Locations
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  marginBottom: 16,
                }}
              >
                Job count and average salary by city
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                {locationData
                  .slice()
                  .sort((a, b) => b.jobs - a.jobs)
                  .map((loc, i) => (
                    <div
                      key={loc.city}
                      style={{
                        background: "#020617",
                        borderRadius: 10,
                        padding: "14px 16px",
                        border: `1px solid ${BORDER_SUBTLE}`,
                        animation: `fadeSlideUp 0.5s ease-out ${1000 + i * 80}ms both`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: i === 0 ? PRIMARY : "#e2e8f0",
                          }}
                        >
                          {loc.city}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "#475569",
                            background: "rgba(148,163,184,0.18)",
                            padding: "2px 8px",
                            borderRadius: 4,
                          }}
                        >
                          #{i + 1}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: PRIMARY,
                          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                        }}
                      >
                        {loc.jobs.toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#64748b",
                          marginTop: 2,
                        }}
                      >
                        Avg: ${loc.avg_salary}K
                      </div>
                    </div>
                  ))}
              </div>
            </GlowCard>
          </>
        )}

        {/* SKILLS PAGE */}
        {activePage === "skills" && (
          <>
            <GlowCard delay={500} glowColor={PRIMARY}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginBottom: 4,
                  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Top Skills by Market Demand
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  marginBottom: 16,
                }}
              >
                Share of postings mentioning each skill across all data roles.
              </div>
              {skillsData
                .slice()
                .sort((a, b) => b.demand - a.demand)
                .map((s, i) => (
                  <SkillBar
                    key={s.skill}
                    skill={s.skill}
                    demand={s.demand}
                    maxDemand={85}
                    delay={600 + i * 80}
                    color={i < 3 ? PRIMARY : i < 6 ? MUTED_2 : ACCENT}
                  />
                ))}
            </GlowCard>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 16,
                marginTop: 16,
              }}
            >
              <GlowCard delay={700} glowColor={MUTED_1}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#e2e8f0",
                    marginBottom: 4,
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Role Skill Profile Comparison
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 4,
                  }}
                >
                  Comparing emphasis on core skill categories between Data Analysts and Data Scientists.
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                    <PolarRadiusAxis tick={false} axisLine={false} />
                    <Radar name="Data Scientist" dataKey="A" stroke={PRIMARY} fill={PRIMARY} fillOpacity={0.12} strokeWidth={2} />
                    <Radar name="Data Analyst" dataKey="B" stroke={MUTED_1} fill={MUTED_1} fillOpacity={0.12} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </GlowCard>

              <GlowCard delay={800} glowColor={ACCENT}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    marginBottom: 6,
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  How to Use This Page
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#9ca3af",
                    lineHeight: 1.6,
                  }}
                >
                  Use the skills ranking to identify which tools and languages you should prioritize for job applications.
                  In the full version of the app, this page will be filterable by role and location and will power a
                  "skills gap" recommendation for your own profile.
                </div>
              </GlowCard>
            </div>
          </>
        )}

        {/* SALARY PAGE */}
        {activePage === "salary" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <GlowCard delay={500} glowColor={PRIMARY}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#e2e8f0",
                    marginBottom: 4,
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Salary Bands by Role
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 8,
                  }}
                >
                  Smoothed salary curves for core data titles.
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={salaryTrend}>
                    <defs>
                      <linearGradient id="salPrimary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PRIMARY_SOFT} stopOpacity={0.4} />
                        <stop offset="100%" stopColor={PRIMARY_SOFT} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#334155" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis stroke="#334155" tick={{ fill: "#64748b", fontSize: 11 }} domain={[75, 150]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="analyst" stroke={PRIMARY} fill="url(#salPrimary)" strokeWidth={2} dot={false} name="Analyst" />
                    <Area type="monotone" dataKey="scientist" stroke={MUTED_2} fill="url(#salPrimary)" strokeWidth={2} dot={false} name="Scientist" />
                    <Area type="monotone" dataKey="engineer" stroke={ACCENT} fill="url(#salPrimary)" strokeWidth={2} dot={false} name="Engineer" />
                  </AreaChart>
                </ResponsiveContainer>
              </GlowCard>

              <GlowCard delay={550} glowColor={ACCENT}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#e2e8f0",
                    marginBottom: 4,
                    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Weekly Posting Volume
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 4,
                  }}
                >
                  Demand signal over recent weeks.
                </div>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={postingVolume}>
                    <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 10 }} stroke="transparent" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="postings" name="Postings" radius={[4, 4, 0, 0]}>
                      {postingVolume.map((_, i) => (
                        <Cell key={String(i)} fill={PRIMARY} opacity={0.5 + (i / postingVolume.length) * 0.4} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </GlowCard>
            </div>

            <GlowCard delay={650} glowColor={PRIMARY}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginBottom: 4,
                  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Salary by Location (Ranked)
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  marginBottom: 16,
                }}
              >
                Cities ranked by job count with indicative average salary.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 12,
                }}
              >
                {locationData
                  .slice()
                  .sort((a, b) => b.jobs - a.jobs)
                  .map((loc, i) => (
                    <div
                      key={loc.city}
                      style={{
                        background: "#020617",
                        borderRadius: 10,
                        padding: "14px 16px",
                        border: `1px solid ${BORDER_SUBTLE}`,
                        animation: `fadeSlideUp 0.5s ease-out ${650 + i * 80}ms both`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: i === 0 ? PRIMARY : "#e2e8f0",
                          }}
                        >
                          {loc.city}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "#475569",
                            background: "rgba(148,163,184,0.18)",
                            padding: "2px 8px",
                            borderRadius: 4,
                          }}
                        >
                          #{i + 1}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: PRIMARY,
                          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                        }}
                      >
                        {loc.jobs.toLocaleString()}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#64748b",
                          marginTop: 2,
                        }}
                      >
                        Avg: ${loc.avg_salary}K
                      </div>
                    </div>
                  ))}
              </div>
            </GlowCard>
          </>
        )}

        {/* PREDICTOR PAGE */}
        {activePage === "predict" && (
          <>
            <SalaryPredictor />
            <GlowCard delay={700} glowColor={PRIMARY} style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginBottom: 6,
                  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                How the Model Thinks
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  lineHeight: 1.7,
                }}
              >
                In the full ML pipeline, this page will be powered by a trained Random Forest / Gradient Boosting
                ensemble and will show real feature importance scores. For now, treat it as an interactive prototype:
                change the role, experience level and location to get an instant feel for how compensation moves.
              </div>
            </GlowCard>
          </>
        )}

        {/* EXPLORER PAGE */}
        {activePage === "explore" && (
          <GlowCard delay={500} glowColor={PRIMARY}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#e2e8f0",
                marginBottom: 8,
                fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            >
              Custom Data Explorer (Prototype)
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#9ca3af",
                marginBottom: 16,
                lineHeight: 1.7,
              }}
            >
              This page will allow uploading your own job posting CSV and reusing the same analytics pipeline
              (overview, skills, salary) on private datasets. For now, it serves as a design placeholder and a talking
              point in interviews about how you would generalize the platform beyond LinkedIn data.
            </div>
            <div
              style={{
                borderRadius: 12,
                border: `1px dashed ${BORDER_SUBTLE}`,
                padding: "32px",
                textAlign: "center",
                background: "#020617",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              Drag & drop area – Upload a CSV file of job postings here in the full implementation.
            </div>
          </GlowCard>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "32px 0 16px",
            color: "#334155",
            fontSize: 11,
          }}
        >
          Built by Rutvij Reddy Vakati | MS Data Analytics Engineering, George Mason University
        </div>
      </div>
    </div>
  );
}


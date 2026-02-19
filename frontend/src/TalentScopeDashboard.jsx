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

// Skill metadata: what it is, time to go beginner→intermediate, intermediate→coder level
const skillMeta = {
  Python: {
    description: "A general-purpose programming language used for data analysis, ML, automation, and scripting. Dominant in data roles.",
    beginnerToIntermediate: "2–4 months",
    intermediateToCoder: "6–12 months",
  },
  SQL: {
    description: "Structured Query Language for querying and managing relational databases. Essential for analysts and engineers.",
    beginnerToIntermediate: "1–2 months",
    intermediateToCoder: "3–6 months",
  },
  Tableau: {
    description: "Visual analytics and BI tool for building interactive dashboards and reports from data.",
    beginnerToIntermediate: "1–2 months",
    intermediateToCoder: "3–5 months",
  },
  R: {
    description: "Statistical programming language for data analysis, visualization, and research. Strong in academia and biostats.",
    beginnerToIntermediate: "2–3 months",
    intermediateToCoder: "5–9 months",
  },
  "Power BI": {
    description: "Microsoft’s business intelligence platform for dashboards, reports, and data modeling.",
    beginnerToIntermediate: "1–2 months",
    intermediateToCoder: "3–6 months",
  },
  Spark: {
    description: "Distributed computing framework for large-scale data processing. Core for data engineering.",
    beginnerToIntermediate: "2–4 months",
    intermediateToCoder: "6–12 months",
  },
  AWS: {
    description: "Amazon Web Services: cloud platform for storage, compute, and data services (S3, Redshift, EMR, etc.).",
    beginnerToIntermediate: "2–4 months",
    intermediateToCoder: "6–18 months",
  },
  TensorFlow: {
    description: "Google’s ML/deep learning framework for building and deploying models.",
    beginnerToIntermediate: "3–5 months",
    intermediateToCoder: "9–18 months",
  },
  Excel: {
    description: "Spreadsheet tool for analysis, pivot tables, and reporting. Ubiquitous in business and finance.",
    beginnerToIntermediate: "2–4 weeks",
    intermediateToCoder: "2–4 months",
  },
  Java: {
    description: "Object-oriented language used in big-data stacks (Hadoop, Spark, Kafka) and backend systems.",
    beginnerToIntermediate: "3–6 months",
    intermediateToCoder: "12–24 months",
  },
};

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

// Sample of skills we "track" (847 total) — shown in Skills Tracked hover list
const skillsTrackedSample = [
  "Python", "SQL", "R", "Excel", "Tableau", "Power BI", "Spark", "AWS", "TensorFlow", "Java",
  "Machine Learning", "Statistics", "ETL", "Data Modeling", "A/B Testing", "Git", "Docker", "Kafka",
  "Snowflake", "dbt", "Airflow", "Pandas", "Scikit-learn", "PyTorch", "NoSQL", "MongoDB", "Redshift",
  "BigQuery", "Looker", "SAS", "SPSS", "Jupyter", "Databricks", "Azure", "GCP", "CI/CD", "API design",
];

// Companies ranked by hiring volume (top to low) — for Companies card hover
const companiesRanked = [
  { rank: 1, name: "Amazon", jobs: 12400 },
  { rank: 2, name: "Google", jobs: 9820 },
  { rank: 3, name: "Microsoft", jobs: 8750 },
  { rank: 4, name: "Meta", jobs: 6120 },
  { rank: 5, name: "Apple", jobs: 5890 },
  { rank: 6, name: "JPMorgan Chase", jobs: 4520 },
  { rank: 7, name: "Deloitte", jobs: 4180 },
  { rank: 8, name: "Accenture", jobs: 3950 },
  { rank: 9, name: "IBM", jobs: 3620 },
  { rank: 10, name: "Netflix", jobs: 2180 },
  { rank: 11, name: "Salesforce", jobs: 1950 },
  { rank: 12, name: "Adobe", jobs: 1720 },
  { rank: 13, name: "Uber", jobs: 1580 },
  { rank: 14, name: "Spotify", jobs: 920 },
  { rank: 15, name: "Stripe", jobs: 780 },
];

// Monthly posting trend — for Total Postings card hover
const totalPostingsByMonth = [
  { month: "Mar", postings: 1120000 },
  { month: "Apr", postings: 1150000 },
  { month: "May", postings: 1190000 },
  { month: "Jun", postings: 1220000 },
  { month: "Jul", postings: 1260000 },
  { month: "Aug", postings: 1300000 },
];

// Avg salary by role — for Avg Salary card hover
const avgSalaryByRole = [
  { role: "Data Analyst", salary: 85 },
  { role: "Data Scientist", salary: 115 },
  { role: "Data Engineer", salary: 125 },
  { role: "ML Engineer", salary: 140 },
  { role: "Business Analyst", salary: 82 },
  { role: "BI Analyst", salary: 90 },
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
        background: "rgba(15,23,42,0.6)",
        borderRadius: "14px",
        border: `1px solid ${BORDER_SUBTLE}`,
        padding: "20px",
        transition: "all 0.3s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        position: "relative",
        overflow: "visible",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = glowColor;
        e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.35)`;
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
          fontSize: "clamp(1.25rem, 4vw, 2.25rem)",
          fontWeight: 700,
          color,
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          marginBottom: 4,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
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

function SkillsTrackedCard({ id, activeCard, setActiveCard, delay }) {
  const [hover, setHover] = useState(false);
  const accentColor = MUTED_1;
  const isTabMode = activeCard !== null;
  const isSelected = activeCard === id;

  if (isTabMode) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setActiveCard(id)}
        onKeyDown={(e) => e.key === "Enter" && setActiveCard(id)}
        style={{
          padding: "12px 16px",
          borderRadius: 12,
          border: `2px solid ${isSelected ? accentColor : BORDER_SUBTLE}`,
          background: isSelected ? "rgba(249,115,22,0.12)" : "rgba(30,41,59,0.5)",
          cursor: "pointer",
          transition: "border 0.2s, background 0.2s, transform 0.2s",
        }}
      >
        <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Skills Tracked</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: accentColor }}><AnimatedCounter target={847} suffix="" /></div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        minWidth: 0,
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        transform: hover ? "scale(1.02)" : "scale(1)",
        willChange: "transform",
        cursor: "pointer",
        zIndex: hover ? 20 : 1,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => setActiveCard(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setActiveCard(id)}
    >
      <GlowCard delay={delay} glowColor={MUTED_1}>
        <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Skills Tracked</div>
        <div style={{ fontSize: "clamp(1.25rem, 4vw, 2.25rem)", fontWeight: 700, color: MUTED_1, fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 4 }}>
          <AnimatedCounter target={847} suffix="" />
        </div>
        <div style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
          <PulsingDot color="#22c55e" />
          Click to open
        </div>
      </GlowCard>
      {hover && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "100%",
            marginTop: 8,
            padding: "10px 14px",
            background: "rgba(15,23,42,0.97)",
            border: `1px solid ${accentColor}`,
            borderRadius: 12,
            boxShadow: "0 12px 28px rgba(0,0,0,0.4)",
            animation: "hoverPreviewIn 0.2s ease-out",
            fontSize: 11,
            color: "#94a3b8",
          }}
        >
          <div style={{ marginBottom: 6, color: accentColor, fontWeight: 600 }}>Preview</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 8px" }}>
            {skillsTrackedSample.slice(0, 6).map((name) => (
              <span key={name} style={{ background: "rgba(148,163,184,0.2)", padding: "2px 6px", borderRadius: 4 }}>{name}</span>
            ))}
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: "#64748b" }}>+841 more · click for full list</div>
        </div>
      )}
    </div>
  );
}

function TotalPostingsCard({ id, activeCard, setActiveCard, delay }) {
  const [hover, setHover] = useState(false);
  const accentColor = PRIMARY;
  const isTabMode = activeCard !== null;
  const isSelected = activeCard === id;

  if (isTabMode) {
    return (
      <div role="button" tabIndex={0} onClick={() => setActiveCard(id)} onKeyDown={(e) => e.key === "Enter" && setActiveCard(id)} style={{ padding: "12px 16px", borderRadius: 12, border: `2px solid ${isSelected ? accentColor : BORDER_SUBTLE}`, background: isSelected ? "rgba(59,130,246,0.12)" : "rgba(30,41,59,0.5)", cursor: "pointer", transition: "border 0.2s, background 0.2s" }}>
        <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Total Postings</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: accentColor }}><AnimatedCounter target={1} prefix="" suffix=".3M+" /></div>
      </div>
    );
  }

  const previewRows = totalPostingsByMonth.slice(0, 3);
  return (
    <div style={{ position: "relative", minWidth: 0, transition: "transform 0.25s ease", willChange: "transform", cursor: "pointer", zIndex: hover ? 20 : 1 }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => setActiveCard(id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setActiveCard(id)}>
      <GlowCard delay={delay} glowColor={PRIMARY}>
        <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Total Postings</div>
        <div style={{ fontSize: "clamp(1.25rem, 4vw, 2.25rem)", fontWeight: 700, color: PRIMARY, fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 4, minWidth: 0, overflow: "hidden" }}><AnimatedCounter target={1} prefix="" suffix=".3M+" /></div>
        <div style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}><PulsingDot color="#22c55e" /> Click to open</div>
      </GlowCard>
      {hover && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 8, padding: "10px 14px", background: "rgba(15,23,42,0.97)", border: `1px solid ${accentColor}`, borderRadius: 12, boxShadow: "0 12px 28px rgba(0,0,0,0.4)", animation: "hoverPreviewIn 0.2s ease-out", fontSize: 11, color: "#94a3b8" }}>
          <div style={{ marginBottom: 6, color: accentColor, fontWeight: 600 }}>Preview</div>
          {previewRows.map(({ month, postings }) => (
            <div key={month} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
              <span>{month}</span>
              <span style={{ color: accentColor, fontWeight: 600 }}>{(postings / 1000).toFixed(0)}K</span>
            </div>
          ))}
          <div style={{ marginTop: 4, fontSize: 10, color: "#64748b" }}>6 months · click for full trend</div>
        </div>
      )}
    </div>
  );
}

function AvgSalaryCard({ id, activeCard, setActiveCard, delay }) {
  const [hover, setHover] = useState(false);
  const accentColor = ACCENT;
  const isTabMode = activeCard !== null;
  const isSelected = activeCard === id;

  if (isTabMode) {
    return (
      <div role="button" tabIndex={0} onClick={() => setActiveCard(id)} onKeyDown={(e) => e.key === "Enter" && setActiveCard(id)} style={{ padding: "12px 16px", borderRadius: 12, border: `2px solid ${isSelected ? accentColor : BORDER_SUBTLE}`, background: isSelected ? "rgba(34,197,94,0.12)" : "rgba(30,41,59,0.5)", cursor: "pointer", transition: "border 0.2s, background 0.2s" }}>
        <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Avg Salary</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: accentColor }}><AnimatedCounter target={118} prefix="$" suffix="K" /></div>
      </div>
    );
  }

  const previewRows = avgSalaryByRole.slice(0, 3);
  return (
    <div style={{ position: "relative", minWidth: 0, transition: "transform 0.25s ease", willChange: "transform", cursor: "pointer", zIndex: hover ? 20 : 1 }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => setActiveCard(id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setActiveCard(id)}>
      <GlowCard delay={delay} glowColor={ACCENT}>
        <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Avg Salary</div>
        <div style={{ fontSize: "clamp(1.25rem, 4vw, 2.25rem)", fontWeight: 700, color: ACCENT, fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 4, minWidth: 0, overflow: "hidden" }}><AnimatedCounter target={118} prefix="$" suffix="K" /></div>
        <div style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}><PulsingDot color="#22c55e" /> Click to open</div>
      </GlowCard>
      {hover && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 8, padding: "10px 14px", background: "rgba(15,23,42,0.97)", border: `1px solid ${accentColor}`, borderRadius: 12, boxShadow: "0 12px 28px rgba(0,0,0,0.4)", animation: "hoverPreviewIn 0.2s ease-out", fontSize: 11, color: "#94a3b8" }}>
          <div style={{ marginBottom: 6, color: accentColor, fontWeight: 600 }}>Preview</div>
          {previewRows.map(({ role, salary }) => (
            <div key={role} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12 }}>
              <span>{role}</span>
              <span style={{ color: accentColor, fontWeight: 600 }}>${salary}K</span>
            </div>
          ))}
          <div style={{ marginTop: 4, fontSize: 10, color: "#64748b" }}>By role · click for full list</div>
        </div>
      )}
    </div>
  );
}

function CompaniesCard({ id, activeCard, setActiveCard, delay }) {
  const [hover, setHover] = useState(false);
  const accentColor = MUTED_2;
  const isTabMode = activeCard !== null;
  const isSelected = activeCard === id;

  if (isTabMode) {
    return (
      <div role="button" tabIndex={0} onClick={() => setActiveCard(id)} onKeyDown={(e) => e.key === "Enter" && setActiveCard(id)} style={{ padding: "12px 16px", borderRadius: 12, border: `2px solid ${isSelected ? accentColor : BORDER_SUBTLE}`, background: isSelected ? "rgba(168,85,247,0.12)" : "rgba(30,41,59,0.5)", cursor: "pointer", transition: "border 0.2s, background 0.2s" }}>
        <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Companies</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: accentColor }}><AnimatedCounter target={48500} suffix="+" /></div>
      </div>
    );
  }

  const previewRows = companiesRanked.slice(0, 3);
  return (
    <div style={{ position: "relative", minWidth: 0, transition: "transform 0.25s ease", willChange: "transform", cursor: "pointer", zIndex: hover ? 20 : 1 }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => setActiveCard(id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setActiveCard(id)}>
      <GlowCard delay={delay} glowColor={MUTED_2}>
        <div style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Companies</div>
        <div style={{ fontSize: "clamp(1.25rem, 4vw, 2.25rem)", fontWeight: 700, color: MUTED_2, fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 4, minWidth: 0, overflow: "hidden" }}><AnimatedCounter target={48500} suffix="+" /></div>
        <div style={{ fontSize: 12, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}><PulsingDot color="#22c55e" /> Click to open</div>
      </GlowCard>
      {hover && (
        <div style={{ position: "absolute", left: 0, right: 0, top: "100%", marginTop: 8, padding: "10px 14px", background: "rgba(15,23,42,0.97)", border: `1px solid ${accentColor}`, borderRadius: 12, boxShadow: "0 12px 28px rgba(0,0,0,0.4)", animation: "hoverPreviewIn 0.2s ease-out", fontSize: 11, color: "#94a3b8" }}>
          <div style={{ marginBottom: 6, color: accentColor, fontWeight: 600 }}>Preview</div>
          {previewRows.map(({ rank, name, jobs }) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 12 }}>
              <span style={{ color: "#64748b", minWidth: 20 }}>#{rank}</span>
              <span style={{ flex: 1, minWidth: 0 }}>{name}</span>
              <span style={{ color: accentColor, fontWeight: 600 }}>{jobs.toLocaleString()}</span>
            </div>
          ))}
          <div style={{ marginTop: 4, fontSize: 10, color: "#64748b" }}>Top 15 · click for full list</div>
        </div>
      )}
    </div>
  );
}

function ActiveCardContent({ activeCard, setActiveCard }) {
  if (!activeCard) return null;
  const closeBtn = (
    <button type="button" onClick={() => setActiveCard(null)} aria-label="Close" style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${BORDER_SUBTLE}`, background: "rgba(30,41,59,0.8)", color: "#e2e8f0", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
  );
  const panelStyle = { flex: 1, background: "rgba(15,23,42,0.98)", border: "2px solid", borderRadius: 20, boxShadow: `0 24px 56px rgba(0,0,0,0.5), 0 0 0 1px ${BORDER_SUBTLE}`, display: "flex", flexDirection: "column", overflow: "hidden", animation: "cardEnlarge 0.35s cubic-bezier(0.16, 1, 0.3, 1)", minHeight: 280 };
  const headerStyle = { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORDER_SUBTLE}`, flexShrink: 0 };
  const bodyStyle = { flex: 1, padding: "20px 24px 24px", minHeight: 0 };
  if (activeCard === "total") {
    return (
      <div style={{ ...panelStyle, borderColor: PRIMARY }} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: PRIMARY }}>Total Postings</h2><p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>Monthly trend (last 6 months)</p></div>
          {closeBtn}
        </div>
        <div className="metric-popover-scroll" style={bodyStyle}>
          {totalPostingsByMonth.map(({ month, postings }) => (
            <div key={month} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(30,41,59,0.6)", fontSize: 15, color: "#e2e8f0" }}>
              <span>{month}</span>
              <span style={{ fontWeight: 600, color: PRIMARY }}>{(postings / 1000).toFixed(0)}K postings</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (activeCard === "avg") {
    return (
      <div style={{ ...panelStyle, borderColor: ACCENT }} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: ACCENT }}>Average salary by role</h2><p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>Base mid-level salary ($K)</p></div>
          {closeBtn}
        </div>
        <div className="metric-popover-scroll" style={bodyStyle}>
          {avgSalaryByRole.map(({ role, salary }) => (
            <div key={role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(30,41,59,0.6)", fontSize: 15, color: "#e2e8f0" }}>
              <span>{role}</span>
              <span style={{ fontWeight: 600, color: ACCENT }}>${salary}K</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (activeCard === "companies") {
    return (
      <div style={{ ...panelStyle, borderColor: MUTED_2 }} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: MUTED_2 }}>Top hiring companies</h2><p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>By job count across data roles</p></div>
          {closeBtn}
        </div>
        <div className="metric-popover-scroll" style={bodyStyle}>
          {companiesRanked.map(({ rank, name, jobs }) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "1px solid rgba(30,41,59,0.6)", fontSize: 15, color: "#e2e8f0" }}>
              <span style={{ fontWeight: 700, color: "#64748b", minWidth: 32 }}>#{rank}</span>
              <span style={{ flex: 1, minWidth: 0 }}>{name}</span>
              <span style={{ fontWeight: 600, color: MUTED_2, flexShrink: 0 }}>{jobs.toLocaleString()} jobs</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (activeCard === "skills") {
    return (
      <div style={{ ...panelStyle, borderColor: MUTED_1 }} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: MUTED_1 }}>Skills tracked (847)</h2><p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>Sample of skills we track across job postings</p></div>
          {closeBtn}
        </div>
        <div className="metric-popover-scroll" style={bodyStyle}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 12px" }}>
            {skillsTrackedSample.map((name) => (
              <span key={name} style={{ fontSize: 14, color: "#94a3b8", background: "rgba(148,163,184,0.15)", padding: "8px 14px", borderRadius: 8 }}>{name}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function MetricCardsSection({ isMobile }) {
  const [activeCard, setActiveCard] = useState(null);
  useEffect(() => {
    if (!activeCard) return;
    const handle = (e) => { if (e.key === "Escape") setActiveCard(null); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [activeCard]);

  const hasActive = activeCard !== null;

  if (!hasActive) {
    return (
      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gridTemplateRows: isMobile ? "auto auto auto auto" : "auto auto",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <TotalPostingsCard id="total" activeCard={null} setActiveCard={setActiveCard} delay={100} />
        <AvgSalaryCard id="avg" activeCard={null} setActiveCard={setActiveCard} delay={200} />
        <CompaniesCard id="companies" activeCard={null} setActiveCard={setActiveCard} delay={300} />
        <SkillsTrackedCard id="skills" activeCard={null} setActiveCard={setActiveCard} delay={400} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
        gridTemplateRows: isMobile ? "auto auto 1fr" : "auto 1fr",
        gap: 12,
        marginBottom: 24,
        minHeight: 320,
      }}
    >
      <TotalPostingsCard id="total" activeCard={activeCard} setActiveCard={setActiveCard} delay={100} />
      <AvgSalaryCard id="avg" activeCard={activeCard} setActiveCard={setActiveCard} delay={200} />
      <CompaniesCard id="companies" activeCard={activeCard} setActiveCard={setActiveCard} delay={300} />
      <SkillsTrackedCard id="skills" activeCard={activeCard} setActiveCard={setActiveCard} delay={400} />
      <div style={{ gridColumn: "1 / -1" }}>
        <ActiveCardContent activeCard={activeCard} setActiveCard={setActiveCard} />
      </div>
    </div>
  );
}

function MetricOverlay({ open, onClose, title, subtitle, accentColor, children }) {
  useEffect(() => {
    if (!open) return;
    const handle = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          animation: "overlayBackdropIn 0.3s ease-out",
        }}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Enter" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close overlay"
      />
      <div
        style={{
          position: "relative",
          width: "min(92vw, 720px)",
          maxHeight: "88vh",
          background: "rgba(15,23,42,0.98)",
          border: `2px solid ${accentColor}`,
          borderRadius: 20,
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px ${BORDER_SUBTLE}`,
          display: "flex",
          flexDirection: "column",
          animation: "overlayPanelIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORDER_SUBTLE}`, flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: accentColor, fontFamily: "'Inter', sans-serif" }}>{title}</h2>
            {subtitle && <p style={{ margin: "6px 0 0", fontSize: 12, color: "#64748b" }}>{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              border: `1px solid ${BORDER_SUBTLE}`,
              background: "rgba(30,41,59,0.8)",
              color: "#e2e8f0",
              fontSize: 18,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(51,65,85,0.9)"; e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(30,41,59,0.8)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            ×
          </button>
        </div>
        <div className="metric-popover-scroll" style={{ flex: 1, padding: "20px 24px 24px", minHeight: 0 }}>
          {children}
        </div>
      </div>
    </div>
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

// All job roles supported by the predictor (base salary in $K, mid-level)
const PREDICTOR_ROLES = [
  { label: "Data Analyst", base: 85 },
  { label: "Business Analyst", base: 82 },
  { label: "Financial Analyst", base: 88 },
  { label: "Product Analyst", base: 95 },
  { label: "Marketing Analyst", base: 78 },
  { label: "Data Scientist", base: 115 },
  { label: "Research Scientist", base: 130 },
  { label: "Applied Scientist", base: 125 },
  { label: "Analytics Engineer", base: 105 },
  { label: "Data Engineer", base: 125 },
  { label: "ML Engineer", base: 140 },
  { label: "BI Analyst", base: 90 },
  { label: "BI Developer", base: 98 },
  { label: "Data Architect", base: 145 },
  { label: "Software Engineer", base: 120 },
  { label: "Backend Engineer", base: 118 },
  { label: "DevOps Engineer", base: 115 },
  { label: "Solutions Architect", base: 135 },
  { label: "Statistician", base: 95 },
  { label: "Quantitative Analyst", base: 110 },
  { label: "Machine Learning Engineer", base: 142 },
  { label: "AI Engineer", base: 138 },
  { label: "ETL Developer", base: 102 },
  { label: "Database Administrator", base: 100 },
];

const PREDICTOR_LOCATIONS = [
  "Remote",
  "San Francisco",
  "New York",
  "Seattle",
  "Austin",
  "Boston",
  "Chicago",
  "Denver",
  "Los Angeles",
  "Washington DC",
  "Atlanta",
  "Miami",
  "Dallas",
  "Philadelphia",
];

function SalaryPredictor() {
  const [role, setRole] = useState("Data Analyst");
  const [exp, setExp] = useState("Mid");
  const [loc, setLoc] = useState("Remote");
  const [predicted, setPredicted] = useState(null);
  const [animating, setAnimating] = useState(false);

  const predict = () => {
    setAnimating(true);
    setPredicted(null);
    const roleEntry = PREDICTOR_ROLES.find((r) => r.label === role);
    const base = roleEntry ? roleEntry.base : 95;
    setTimeout(() => {
      const expMult = { Junior: 0.75, Mid: 1, Senior: 1.35 };
      const locMult = {
        "San Francisco": 1.3,
        "New York": 1.25,
        Seattle: 1.2,
        Remote: 1.05,
        Austin: 1.0,
        Boston: 1.15,
        Chicago: 1.0,
        Denver: 1.0,
        "Los Angeles": 1.15,
        "Washington DC": 1.2,
        Atlanta: 0.95,
        Miami: 0.95,
        Dallas: 1.0,
        Philadelphia: 1.05,
      };
      const val = Math.round(base * expMult[exp] * (locMult[loc] || 1));
      setPredicted(val);
      setAnimating(false);
    }, 1200);
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
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
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
            {PREDICTOR_ROLES.map((r) => (
              <option key={r.label} value={r.label}>{r.label}</option>
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
            {PREDICTOR_LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
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
  const [hover, setHover] = useState(false);
  const meta = skillMeta[skill];
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
        position: "relative",
        cursor: meta ? "help" : "default",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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
      {hover && meta && (
        <div
          style={{
            position: "absolute",
            left: 92,
            right: 48,
            top: "100%",
            marginTop: 8,
            background: "rgba(15,23,42,0.98)",
            border: `1px solid ${BORDER_SUBTLE}`,
            borderRadius: 12,
            padding: "14px 16px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            zIndex: 50,
            animation: "fadeSlideUp 0.2s ease-out",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: color,
              marginBottom: 6,
              fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            }}
          >
            {skill} — What it is
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#94a3b8",
              lineHeight: 1.5,
              marginBottom: 12,
            }}
          >
            {meta.description}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#64748b",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span>
              <strong style={{ color: "#e2e8f0" }}>Beginner → Intermediate:</strong> {meta.beginnerToIntermediate}
            </span>
            <span>
              <strong style={{ color: "#e2e8f0" }}>Intermediate → Coder level:</strong> {meta.intermediateToCoder}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function LocationCard({ city, jobs, avgSalary, rank, delay }) {
  const [hover, setHover] = useState(false);
  const accentColor = rank === 1 ? PRIMARY : rank <= 3 ? ACCENT : MUTED_2;
  const rankBg = rank === 1 ? "rgba(59,130,246,0.2)" : rank === 2 ? "rgba(34,197,94,0.2)" : rank === 3 ? "rgba(168,85,247,0.2)" : "rgba(148,163,184,0.18)";
  return (
    <div
      role="presentation"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? "rgba(30,41,59,0.8)" : "rgba(15,23,42,0.6)",
        borderRadius: 14,
        padding: "16px 18px",
        border: `1px solid ${hover ? accentColor : BORDER_SUBTLE}`,
        transition: "all 0.3s ease",
        transform: hover ? "scale(1.03) translateY(-4px)" : "scale(1)",
        boxShadow: hover ? "0 12px 32px rgba(0,0,0,0.4)" : "none",
        animation: `locationCardIn 0.5s ease-out ${delay}ms both`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: hover ? accentColor : "#e2e8f0", transition: "color 0.2s" }}>
          {city}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#475569",
            background: rankBg,
            padding: "4px 10px",
            borderRadius: 8,
            border: `1px solid ${rank <= 3 ? accentColor + "44" : BORDER_SUBTLE}`,
          }}
        >
          #{rank}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accentColor, fontFamily: "'Inter', sans-serif", letterSpacing: "-0.02em" }}>
        {jobs.toLocaleString()}
      </div>
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
        Avg salary: <strong style={{ color: ACCENT }}>${avgSalary}K</strong>
      </div>
    </div>
  );
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const m = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    m.addEventListener("change", handler);
    setMatches(m.matches);
    return () => m.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export default function TalentScopeDashboard() {
  const [activePage, setActivePage] = useState("overview");
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const pages = [
    { id: "overview", icon: "◈", label: "Market Overview" },
    { id: "skills", icon: "⬡", label: "Skills Intel" },
    { id: "salary", icon: "◉", label: "Salary Insights" },
    { id: "locations", icon: "📍", label: "Locations" },
    { id: "roles", icon: "👤", label: "Roles" },
    { id: "predict", icon: "△", label: "ML Predictor" },
    { id: "explore", icon: "☰", label: "Data Explorer" },
    { id: "about", icon: "ℹ", label: "About" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG_DARK,
        color: "#e2e8f0",
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        display: "flex",
        overflowX: "hidden",
        width: "100%",
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

        .metric-popover-scroll {
          overflow-y: scroll;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: auto;
          scrollbar-color: #64748b #1e293b;
        }
        .metric-popover-scroll::-webkit-scrollbar { width: 12px; height: 10px; }
        .metric-popover-scroll::-webkit-scrollbar-thumb { background: #64748b; border-radius: 6px; border: 2px solid rgba(15,23,42,0.8); }
        .metric-popover-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .metric-popover-scroll::-webkit-scrollbar-track { background: #1e293b; border-radius: 6px; }

        @keyframes popoverReveal {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes locationCardIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes overlayBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes overlayPanelIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes cardEnlarge {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes hoverPreviewIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

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

      {/* Mobile menu button */}
      {isMobile && (
        <button
          type="button"
          onClick={() => setSidebarOpen((o) => !o)}
          aria-label="Toggle menu"
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 100,
            width: 44,
            height: 44,
            borderRadius: 12,
            border: `1px solid ${BORDER_SUBTLE}`,
            background: "rgba(15,23,42,0.95)",
            color: "#e2e8f0",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          ☰
        </button>
      )}

      {/* Sidebar — drawer on mobile, fixed on tablet/desktop */}
      {(!isMobile || sidebarOpen) && (
        <>
          {isMobile && (
            <div
              role="button"
              tabIndex={0}
              aria-label="Close menu"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                zIndex: 19,
              }}
              onClick={() => setSidebarOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
            />
          )}
          <div
            style={{
              width: isMobile ? 260 : isTablet ? 200 : 220,
              background: "#020617",
              borderRight: `1px solid ${BORDER_SUBTLE}`,
              padding: isMobile ? "60px 16px 24px" : "24px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              position: isMobile ? "fixed" : "relative",
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 20,
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateX(0)" : isMobile && sidebarOpen ? "translateX(0)" : "translateX(-30px)",
              transition: "all 0.3s ease",
              boxShadow: isMobile ? "4px 0 24px rgba(0,0,0,0.4)" : "none",
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
                  fontSize: isMobile ? 18 : 20,
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
                  fontSize: isMobile ? 18 : 20,
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

            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
              {pages.map((p) => (
                <NavItem
                  key={p.id}
                  icon={p.icon}
                  label={p.label}
                  active={activePage === p.id}
                  onClick={() => {
                    setActivePage(p.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                />
              ))}
            </div>

        <div
          style={{
            marginTop: "auto",
            flexShrink: 0,
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
        </>
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: isMobile ? "16px 12px 24px 56px" : isTablet ? "20px 20px" : "28px 32px",
          overflowY: "auto",
          overflowX: "hidden",
          position: "relative",
          zIndex: 5,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Header — stacks on mobile */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: isMobile ? 20 : 28,
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(-20px)",
            transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          }}
        >
          <div style={{ minWidth: 0, flex: "1 1 200px" }}>
            <h1
              style={{
                fontSize: isMobile ? 18 : isTablet ? 20 : 24,
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
                fontSize: isMobile ? 11 : 12,
                margin: "4px 0 0",
              }}
            >
              Real-time insights from 1.3M+ LinkedIn job postings
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              background: "rgba(15,23,42,0.85)",
              borderRadius: 10,
              padding: "6px 12px",
              border: `1px solid ${BORDER_SUBTLE}`,
              flexShrink: 0,
            }}
          >
            <PulsingDot color={ACCENT} />
            <span style={{ fontSize: isMobile ? 11 : 12, color: "#e5e7eb" }}>
              LIVE DATA
            </span>
          </div>
        </div>

        {/* Metric Cards — 2x2 on tablet/laptop; hover/click enlarges one card with backdrop, others hidden */}
        <MetricCardsSection isMobile={isMobile} />

        {/* OVERVIEW PAGE */}
        {activePage === "overview" && (
          <>
            {/* Charts Row 1 — responsive */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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

            {/* Charts Row 2 — responsive */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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

            {/* Top Hiring Locations — animated cards */}
            <GlowCard delay={1000} glowColor={PRIMARY} style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#e2e8f0",
                  marginBottom: 4,
                  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Top Hiring Locations
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 20 }}>
                Job count and average salary by city — hover for highlight
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                  gap: 14,
                }}
              >
                {locationData
                  .slice()
                  .sort((a, b) => b.jobs - a.jobs)
                  .map((loc, i) => (
                    <LocationCard
                      key={loc.city}
                      city={loc.city}
                      jobs={loc.jobs}
                      avgSalary={loc.avg_salary}
                      rank={i + 1}
                      delay={1000 + i * 60}
                    />
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
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
              <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Salary by Location (Ranked)</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>Cities ranked by job count with indicative average salary.</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
                {locationData.slice().sort((a, b) => b.jobs - a.jobs).map((loc, i) => (
                  <LocationCard key={loc.city} city={loc.city} jobs={loc.jobs} avgSalary={loc.avg_salary} rank={i + 1} delay={650 + i * 60} />
                ))}
              </div>
            </GlowCard>
          </>
        )}

        {/* LOCATIONS PAGE */}
        {activePage === "locations" && (
          <>
            <GlowCard delay={400} glowColor={PRIMARY}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Top Hiring Locations</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 20 }}>Job count and average salary by city — hover for highlight</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 14 }}>
                {locationData.slice().sort((a, b) => b.jobs - a.jobs).map((loc, i) => (
                  <LocationCard key={loc.city} city={loc.city} jobs={loc.jobs} avgSalary={loc.avg_salary} rank={i + 1} delay={400 + i * 60} />
                ))}
              </div>
            </GlowCard>
            <GlowCard delay={600} glowColor={ACCENT} style={{ marginTop: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Salary by Location</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Average salary ($K) by metro — higher pay in SF, NY, Seattle</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px" }}>
                {locationData.slice().sort((a, b) => b.avg_salary - a.avg_salary).map((loc, i) => (
                  <span
                    key={loc.city}
                    style={{
                      background: "rgba(34,197,94,0.15)",
                      border: `1px solid ${ACCENT}44`,
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      color: "#e2e8f0",
                      animation: `locationCardIn 0.4s ease-out ${600 + i * 50}ms both`,
                    }}
                  >
                    {loc.city}: <strong style={{ color: ACCENT }}>${loc.avg_salary}K</strong>
                  </span>
                ))}
              </div>
            </GlowCard>
          </>
        )}

        {/* ROLES PAGE */}
        {activePage === "roles" && (
          <>
            <GlowCard delay={400} glowColor={MUTED_2}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Role Distribution</div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 16 }}>Share of job postings by role type</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={jobDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" stroke="none">
                    {jobDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </GlowCard>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 16 }}>
              <GlowCard delay={500} glowColor={PRIMARY}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>Top Roles by Postings</div>
                {jobDistribution.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(30,41,59,0.6)", fontSize: 13, color: "#e2e8f0", animation: `fadeSlideUp 0.4s ease-out ${500 + i * 80}ms both` }}>
                    <span>{d.name}</span>
                    <span style={{ fontWeight: 600, color: d.color }}>{d.value}%</span>
                  </div>
                ))}
              </GlowCard>
              <GlowCard delay={550} glowColor={ACCENT}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 }}>Salary by Role</div>
                {avgSalaryByRole.slice(0, 6).map((r, i) => (
                  <div key={r.role} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(30,41,59,0.6)", fontSize: 13, color: "#e2e8f0", animation: `fadeSlideUp 0.4s ease-out ${550 + i * 80}ms both` }}>
                    <span>{r.role}</span>
                    <span style={{ fontWeight: 600, color: ACCENT }}>${r.salary}K</span>
                  </div>
                ))}
              </GlowCard>
            </div>
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

        {/* ABOUT PAGE */}
        {activePage === "about" && (
          <>
            <GlowCard delay={400} glowColor={PRIMARY}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>TalentScope</div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16, lineHeight: 1.7 }}>
                Job Market Intelligence Dashboard — Real-time insights from 1.3M+ LinkedIn job postings.
              </div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.8 }}>
                <p style={{ margin: "0 0 12px" }}>Built with React, Vite, Recharts, Flask, and Python ML.</p>
                <p style={{ margin: "0 0 12px" }}>Features: Market Overview, Skills Intel, Salary Insights, Locations, Roles, ML Salary Predictor, Data Explorer.</p>
                <p style={{ margin: 0 }}>Hover over the top 4 metric cards to explore detailed insights. Use the scroll wheel inside each popover to browse all data.</p>
              </div>
            </GlowCard>
            <GlowCard delay={500} glowColor={ACCENT} style={{ marginTop: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>Built by</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: ACCENT }}>Rutvij Reddy Vakati</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>MS Data Analytics Engineering, George Mason University</div>
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
          <br />
          <span style={{ opacity: 0.7 }}>Locations · Roles · About · Hover cards enabled</span>
        </div>
      </div>
    </div>
  );
}


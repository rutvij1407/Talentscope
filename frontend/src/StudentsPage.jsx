import { useMemo, useState } from "react";
import data from "./data/talentscope.json";

const roles = Object.keys(data.roleSkills);
const card = { background: "rgba(15,23,42,0.75)", border: "1px solid #1e293b", borderRadius: 14, padding: 20 };
const h = { fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 };
const sub = { fontSize: 12, color: "#64748b", marginBottom: 14, lineHeight: 1.6 };

// Whole-word match so "r" does not match every word that contains the letter r.
function mentions(text, skill) {
  const esc = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const alt = { "Power BI": "power ?bi", "scikit-learn": "scikit[- ]?learn", "Scikit-learn": "scikit[- ]?learn", "API design": "apis?\\b", NoSQL: "no-?sql" };
  const pat = alt[skill] || esc;
  return new RegExp(`(^|[^a-z0-9+#])${pat}(?![a-z0-9+#])`, "i").test(text);
}

const STEPS = [
  ["Check work authorization early", "Many postings ask whether you now or later need sponsorship. Answer the question the way the employer asks it, and know your OPT or STEM OPT dates before you apply."],
  ["Apply on the employer site when you can", "Job boards often redirect to the company careers page. Finish the application there so it lands in the employer system."],
  ["Match the posting, not a template", "Use the skills the posting names, in its words, and only for skills you can talk through in an interview."],
  ["Target the cities that hire most", "The Locations page shows where postings cluster. Metro areas with many postings give you more chances and more local contacts."],
  ["Keep a tracker", "Note the date, role, link and contact for every application so you can follow up after a week or two."],
];

export default function StudentsPage() {
  const [role, setRole] = useState(roles[0]);
  const [text, setText] = useState("");
  const list = data.roleSkills[role];

  const result = useMemo(() => {
    if (text.trim().length < 20) return null;
    const rows = list.map((s) => ({ ...s, hit: mentions(text, s.skill) }));
    const have = rows.filter((r) => r.hit);
    // Weighted by how often the skill is asked for, so missing SQL costs more than missing Docker.
    const total = rows.reduce((a, r) => a + r.share, 0);
    const got = have.reduce((a, r) => a + r.share, 0);
    return { rows, have, missing: rows.filter((r) => !r.hit), score: Math.round((100 * got) / total) };
  }, [text, list]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={card}>
        <div style={h}>Resume skill check</div>
        <div style={sub}>
          Paste your resume text to see how it lines up with the skills most often listed in 2023 US {role} postings. It runs in your
          browser and nothing is uploaded or stored.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <select
            aria-label="Target role" value={role} onChange={(e) => setRole(e.target.value)}
            style={{ background: "#0b1424", color: "#e2e8f0", border: "1px solid #223049", borderRadius: 10, padding: "8px 12px", fontSize: 13 }}
          >
            {roles.map((r) => <option key={r}>{r}</option>)}
          </select>
          <button
            onClick={() => setText("Data analyst with experience in SQL, Python, Tableau and Excel. Built dashboards and ETL pipelines on AWS, used Git for version control, and presented findings to stakeholders.")}
            style={{ background: "transparent", color: "#94a3b8", border: "1px solid #223049", borderRadius: 10, padding: "8px 12px", fontSize: 12, cursor: "pointer" }}
          >
            Try an example
          </button>
          {text && <button onClick={() => setText("")} style={{ background: "transparent", color: "#94a3b8", border: "1px solid #223049", borderRadius: 10, padding: "8px 12px", fontSize: 12, cursor: "pointer" }}>Clear</button>}
        </div>
        <textarea
          aria-label="Resume text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your resume or a skills section here"
          style={{ width: "100%", minHeight: 130, boxSizing: "border-box", background: "#070d1b", color: "#e2e8f0", border: "1px solid #223049", borderRadius: 10, padding: 12, fontSize: 13, fontFamily: "inherit", resize: "vertical" }}
        />
        {result ? (
          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "150px 1fr", gap: 20, alignItems: "start" }} className="ts-students-result">
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: result.score >= 60 ? "#22c55e" : result.score >= 35 ? "#f59e0b" : "#f87171", lineHeight: 1 }}>{result.score}%</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>weighted coverage of the top {list.length} skills</div>
            </div>
            <div style={{ display: "grid", gap: 7 }}>
              {result.rows.map((r) => (
                <div key={r.skill} style={{ display: "grid", gridTemplateColumns: "104px 1fr 48px", gap: 10, alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: r.hit ? "#e2e8f0" : "#94a3b8", fontWeight: r.hit ? 700 : 400 }}>{r.hit ? "✓ " : "+ "}{r.skill}</span>
                  <div style={{ height: 6, background: "#16213a", borderRadius: 3 }}><div style={{ width: `${r.share}%`, maxWidth: "100%", height: "100%", borderRadius: 3, background: r.hit ? "#22c55e" : "#334155" }} /></div>
                  <span style={{ color: "#64748b", textAlign: "right" }}>{r.share}%</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
                Bars show the share of {role} postings (with listed skills) that name each skill. Add a missing skill only if you really have it.
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "#475569", marginTop: 14 }}>Paste at least a few lines to see your match.</div>
        )}
      </div>

      <div style={card}>
        <div style={h}>Application checklist for international students</div>
        <div style={sub}>General practice, not legal advice. Confirm rules about OPT, STEM OPT and sponsorship with your school's international office.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {STEPS.map(([t, d], i) => (
            <div key={t} style={{ background: "#0b1424", border: "1px solid #1e293b", borderRadius: 12, padding: 14 }}>
              <div style={{ color: "#3b82f6", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>STEP {i + 1}</div>
              <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{t}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 14, lineHeight: 1.6 }}>
          This dataset has no visa or sponsorship field, so this page does not show H1B numbers. For sponsorship data use the US Department of Labor public disclosure files.
        </div>
      </div>
      <style>{`@media (max-width:700px){.ts-students-result{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

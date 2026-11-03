"""Build frontend/src/data/talentscope.json from the public job postings dataset.

Dataset: lukebarousse/data_jobs on Hugging Face (Apache 2.0), 785,741 data job postings from 2023.
Usage: python scripts/build_data.py path/to/data_jobs.csv

Everything the dashboard shows is computed here, so no backend or API key is needed.
"""
import ast
import json
import re
import sys
from pathlib import Path

import pandas as pd

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("data_jobs.csv")
OUT = Path(__file__).resolve().parent.parent / "frontend" / "src" / "data" / "talentscope.json"
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

STATES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado",
    "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts",
    "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana",
    "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico",
    "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota",
    "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia", "WA": "Washington",
    "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming",
}
SKILL_NAMES = {
    "sql": "SQL", "aws": "AWS", "gcp": "GCP", "r": "R", "sas": "SAS", "spss": "SPSS", "nosql": "NoSQL",
    "power bi": "Power BI", "powerbi": "Power BI", "dbt": "dbt", "c++": "C++", "c#": "C#", "api": "API design",
    "scikit-learn": "Scikit-learn", "pytorch": "PyTorch", "tensorflow": "TensorFlow", "bigquery": "BigQuery",
    "mongodb": "MongoDB", "postgresql": "PostgreSQL", "mysql": "MySQL", "git": "Git", "excel": "Excel",
    "tableau": "Tableau", "python": "Python", "java": "Java", "spark": "Spark", "azure": "Azure",
    "snowflake": "Snowflake", "airflow": "Airflow", "kafka": "Kafka", "docker": "Docker", "looker": "Looker",
}
nice = lambda s: SKILL_NAMES.get(s, s.title())

print("loading", SRC)
cols = ["job_title_short", "job_title", "job_location", "job_work_from_home", "job_posted_date",
        "job_country", "salary_year_avg", "company_name", "job_skills"]
raw = pd.read_csv(SRC, usecols=cols)
total_all = len(raw)
df = raw[raw["job_country"] == "United States"].copy()
print("all postings", total_all, "| United States", len(df))

df["date"] = pd.to_datetime(df["job_posted_date"])
df["month"] = df["date"].dt.month
df["week"] = df["date"].dt.isocalendar().week.astype(int)
df["role"] = df["job_title_short"].str.replace(r"^Senior ", "", regex=True)
df["salary_k"] = df["salary_year_avg"] / 1000.0
df["skills"] = df["job_skills"].apply(lambda s: ast.literal_eval(s) if isinstance(s, str) else [])
df["has_skills"] = df["skills"].str.len() > 0

senior = re.compile(r"\b(senior|sr\.?|lead|principal|staff|head|director|manager)\b", re.I)
junior = re.compile(r"\b(junior|jr\.?|entry|intern|associate|graduate|trainee)\b", re.I)
def seniority(row):
    t = str(row["job_title"])
    if row["job_title_short"].startswith("Senior ") or senior.search(t):
        return "Senior"
    if junior.search(t):
        return "Junior"
    return "Mid"
df["seniority"] = df.apply(seniority, axis=1)

loc = df["job_location"].fillna("")
df["city"] = loc.str.split(",").str[0].str.strip()
df["state_abbr"] = loc.str.extract(r",\s*([A-Z]{2})\s*$")[0]
df["state"] = df["state_abbr"].map(STATES)
df["remote"] = df["job_work_from_home"].fillna(False).astype(bool)

sal = df[df["salary_k"].notna()]
med = lambda s: round(float(s.median()), 1)

out = {}
skill_rows = df[df["has_skills"]]
exploded = skill_rows[["skills", "salary_k"]].explode("skills")
skill_counts = exploded["skills"].value_counts()
out["meta"] = {
    "source": "lukebarousse/data_jobs (Hugging Face, Apache 2.0)",
    "scope": "United States data job postings, 2023",
    "postingsUS": int(len(df)),
    "postingsAllCountries": int(total_all),
    "postingsWithSkills": int(len(skill_rows)),
    "postingsWithSalary": int(len(sal)),
    "distinctSkills": int(skill_counts.size),
    "distinctCompanies": int(df["company_name"].nunique()),
    "medianSalaryK": med(sal["salary_k"]),
    "dateFrom": str(df["date"].min().date()),
    "dateTo": str(df["date"].max().date()),
}

# Skills: demand = share of postings listing skills that mention the skill; salary = median salary of postings that list it
wanted = ["python", "sql", "tableau", "r", "power bi", "spark", "aws", "tensorflow", "excel", "java"]
skills = []
for s in wanted:
    mask = skill_rows["skills"].apply(lambda L: s in L)
    sk = skill_rows[mask]
    skills.append({"skill": nice(s), "demand": round(100.0 * mask.mean(), 1),
                   "salary": med(sk["salary_k"].dropna()) if sk["salary_k"].notna().sum() >= 30 else None,
                   "postings": int(mask.sum())})
out["skillsData"] = skills
out["skillsTrackedSample"] = [nice(s) for s in skill_counts.index[:37]]

top_companies = df["company_name"].value_counts().head(15)
out["companiesRanked"] = [{"rank": i + 1, "name": n, "jobs": int(c)} for i, (n, c) in enumerate(top_companies.items())]

monthly = df.groupby("month").size()
out["totalPostingsByMonth"] = [{"month": MONTHS[m - 1], "postings": int(monthly.get(m, 0))} for m in range(1, 13)]

roles_order = ["Data Analyst", "Data Scientist", "Data Engineer", "Machine Learning Engineer", "Business Analyst", "Software Engineer"]
label = {"Machine Learning Engineer": "ML Engineer"}
out["avgSalaryByRole"] = [{"role": label.get(r, r), "salary": med(sal[sal["role"] == r]["salary_k"]), "n": int((sal["role"] == r).sum())} for r in roles_order]
out["avgSalaryByRole"].sort(key=lambda x: -x["salary"])

trend = []
for m in range(1, 13):
    row = {"month": MONTHS[m - 1]}
    for key, r in (("analyst", "Data Analyst"), ("scientist", "Data Scientist"), ("engineer", "Data Engineer")):
        s = sal[(sal["month"] == m) & (sal["role"] == r)]["salary_k"]
        row[key] = med(s) if len(s) >= 15 else None
    trend.append(row)
out["salaryTrend"] = trend

role_counts = df["role"].value_counts()
top4 = list(role_counts.head(4).index)
dist = [{"name": label.get(r, r), "value": round(100.0 * role_counts.get(r, 0) / len(df), 1)} for r in top4]
dist.append({"name": "Other roles", "value": round(100.0 - sum(d["value"] for d in dist), 1)})
out["jobDistribution"] = dist

city_counts = df[~df["remote"] & df["state_abbr"].notna()].groupby(["city", "state_abbr"]).size().sort_values(ascending=False)
loc_rows = []
for (c, st), n in city_counts.head(7).items():
    s = sal[(sal["city"] == c) & (sal["state_abbr"] == st)]["salary_k"]
    loc_rows.append({"city": "Washington DC" if c == "Washington" else c, "jobs": int(n), "avg_salary": med(s) if len(s) >= 15 else None})
rs = sal[sal["remote"]]["salary_k"]
loc_rows.append({"city": "Remote", "jobs": int(df["remote"].sum()), "avg_salary": med(rs) if len(rs) >= 15 else None})
out["locationData"] = loc_rows

groups = {
    "Python": ["python"], "SQL": ["sql"], "ML": ["tensorflow", "pytorch", "scikit-learn", "keras"],
    "Stats": ["r", "sas", "spss", "matlab"], "Viz": ["tableau", "power bi", "looker", "qlik", "ggplot2"],
    "Cloud": ["aws", "azure", "gcp"],
}
def share(role, skills_):
    d = skill_rows[skill_rows["role"] == role]
    return round(100.0 * d["skills"].apply(lambda L: any(s in L for s in skills_)).mean(), 1)
out["radarData"] = [{"subject": k, "A": share("Data Scientist", v), "B": share("Data Analyst", v)} for k, v in groups.items()]
out["radarLegend"] = {"A": "Data Scientist", "B": "Data Analyst"}

weekly = df[df["date"].dt.year == 2023].groupby("week").size()
last_weeks = [w for w in sorted(weekly.index) if w <= 52][-8:]
out["postingVolume"] = [{"week": f"W{w}", "postings": int(weekly[w])} for w in last_weeks]

st = {}
us_state = df[df["state"].notna()]
for name, g in us_state.groupby("state"):
    s = g["salary_k"].dropna()
    st[name] = {"jobs": int(len(g)),
                "avgSalary": med(s) if len(s) >= 10 else None,
                "minSalary": round(float(s.quantile(0.1)), 1) if len(s) >= 10 else None,
                "maxSalary": round(float(s.quantile(0.9)), 1) if len(s) >= 10 else None,
                "salaryPostings": int(len(s))}
out["stateData"] = st

# Salary lookup for the predictor: role x seniority medians, adjusted by city
pred_roles = [r for r in roles_order if (sal["role"] == r).sum() >= 100]
base = {}
for r in pred_roles:
    rs_ = sal[sal["role"] == r]
    role_med = med(rs_["salary_k"])
    entry = {"median": role_med, "p25": round(float(rs_["salary_k"].quantile(0.25)), 1), "p75": round(float(rs_["salary_k"].quantile(0.75)), 1), "n": int(len(rs_)), "bySeniority": {}}
    for sn in ("Junior", "Mid", "Senior"):
        s = rs_[rs_["seniority"] == sn]["salary_k"]
        entry["bySeniority"][sn] = {"median": med(s) if len(s) >= 20 else None, "n": int(len(s))}
    base[label.get(r, r)] = entry
sen_factor = {}
for sn in ("Junior", "Mid", "Senior"):
    ratios = []
    for r in pred_roles:
        rs_ = sal[sal["role"] == r]
        a = rs_[rs_["seniority"] == sn]["salary_k"]
        if len(a) >= 20:
            ratios.append(a.median() / rs_["salary_k"].median())
    sen_factor[sn] = round(float(pd.Series(ratios).median()), 3) if ratios else 1.0

sal = sal.copy()
sal["ref"] = sal.groupby(["role", "seniority"])["salary_k"].transform("median")
sal["ratio"] = sal["salary_k"] / sal["ref"]
city_names = {"San Francisco": "San Francisco", "New York": "New York", "Seattle": "Seattle", "Austin": "Austin",
              "Boston": "Boston", "Chicago": "Chicago", "Denver": "Denver", "Los Angeles": "Los Angeles",
              "Washington": "Washington DC", "Atlanta": "Atlanta", "Miami": "Miami", "Dallas": "Dallas", "Philadelphia": "Philadelphia"}
loc_factor = {}
r_remote = sal[sal["remote"]]["ratio"]
if len(r_remote) >= 30:
    loc_factor["Remote"] = {"factor": round(float(r_remote.median()), 3), "n": int(len(r_remote))}
for raw_name, shown in city_names.items():
    r_ = sal[(sal["city"] == raw_name) & (~sal["remote"])]["ratio"]
    if len(r_) >= 30:
        loc_factor[shown] = {"factor": round(float(r_.median()), 3), "n": int(len(r_))}
out["predictor"] = {"roles": base, "seniorityFactor": sen_factor, "locations": loc_factor,
                    "note": "Median salary of postings with a listed salary, adjusted for seniority and city. A lookup, not a trained model."}

# Map layers: postings per state per role, and the biggest hiring cities as points
CITY_COORDS = {
    ("New York", "NY"): (40.71, -74.01), ("Atlanta", "GA"): (33.75, -84.39), ("Chicago", "IL"): (41.88, -87.63),
    ("Washington", "DC"): (38.91, -77.04), ("San Francisco", "CA"): (37.77, -122.42), ("Dallas", "TX"): (32.78, -96.80),
    ("Austin", "TX"): (30.27, -97.74), ("Charlotte", "NC"): (35.23, -80.84), ("Tampa", "FL"): (27.95, -82.46),
    ("Los Angeles", "CA"): (34.05, -118.24), ("Boston", "MA"): (42.36, -71.06), ("Irving", "TX"): (32.81, -96.95),
    ("Miami", "FL"): (25.76, -80.19), ("St. Louis", "MO"): (38.63, -90.20), ("Arlington", "VA"): (38.88, -77.10),
    ("San Jose", "CA"): (37.34, -121.89), ("San Antonio", "TX"): (29.42, -98.49), ("McLean", "VA"): (38.93, -77.18),
    ("Orlando", "FL"): (28.54, -81.38), ("Plano", "TX"): (33.02, -96.70), ("Jacksonville", "FL"): (30.33, -81.66),
    ("Philadelphia", "PA"): (39.95, -75.17), ("Houston", "TX"): (29.76, -95.37), ("Indianapolis", "IN"): (39.77, -86.16),
    ("Sunnyvale", "CA"): (37.37, -122.04), ("Reston", "VA"): (38.96, -77.36), ("Mountain View", "CA"): (37.39, -122.08),
    ("Fort Worth", "TX"): (32.76, -97.33), ("San Diego", "CA"): (32.72, -117.16), ("Jersey City", "NJ"): (40.72, -74.04),
    ("Alpharetta", "GA"): (34.08, -84.29), ("Baltimore", "MD"): (39.29, -76.61), ("Palo Alto", "CA"): (37.44, -122.14),
    ("Columbia", "SC"): (34.00, -81.03), ("Chantilly", "VA"): (38.89, -77.43), ("Irvine", "CA"): (33.68, -117.83),
    ("Herndon", "VA"): (38.97, -77.39), ("Santa Clara", "CA"): (37.35, -121.96), ("Fremont", "CA"): (37.55, -121.99),
    ("Cupertino", "CA"): (37.32, -122.03), ("Huntsville", "AL"): (34.73, -86.59), ("Raleigh", "NC"): (35.78, -78.64),
    ("Oakland", "CA"): (37.80, -122.27), ("Seattle", "WA"): (47.61, -122.33), ("Denver", "CO"): (39.74, -104.99),
}
by_role = us_state.groupby(["state", "role"]).size()
for name in out["stateData"]:
    out["stateData"][name]["byRole"] = {label.get(r, r): int(by_role.get((name, r), 0)) for r in roles_order}
cities = []
cc = df[~df["remote"] & df["state_abbr"].notna()].groupby(["city", "state_abbr"]).size()
for (c, st_), (lat, lon) in CITY_COORDS.items():
    n = int(cc.get((c, st_), 0))
    s = sal[(sal["city"] == c) & (sal["state_abbr"] == st_)]["salary_k"]
    cities.append({"city": c, "state": st_, "lat": lat, "lon": lon, "jobs": n, "medianSalary": med(s) if len(s) >= 15 else None})
out["cityPoints"] = sorted(cities, key=lambda x: -x["jobs"])

# Skill checklist per role, used by the resume matcher on the Students page
role_skills = {}
for r in roles_order:
    d = skill_rows[skill_rows["role"] == r]
    if len(d) < 200:
        continue
    cnt = d["skills"].explode().value_counts().head(20)
    role_skills[label.get(r, r)] = [{"skill": nice(k), "share": round(100.0 * v / len(d), 1)} for k, v in cnt.items()]
out["roleSkills"] = role_skills

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(out, indent=1))
print("wrote", OUT, OUT.stat().st_size, "bytes")
print(json.dumps(out["meta"], indent=1))

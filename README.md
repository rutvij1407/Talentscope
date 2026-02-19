TalentScope – Job Market Intelligence Dashboard
================================================

TalentScope is a full‑stack analytics project that helps job seekers and recruiters understand **which skills are in demand**, **how salaries vary by role/location**, and **what factors drive salary predictions** based on real job‑posting data.

This project is designed to look like a strong, polished **undergraduate‑level capstone** that you can confidently showcase in your resume, LinkedIn, and interviews.

High‑level features (target)
----------------------------
- **Interactive analytics dashboard**: modern dark UI with neon accents and smooth animations.
- **Job market overview**: counts and trends by role, location, company, and posting date.
- **Skill demand analysis**: top skills, co‑occurrence networks, and role‑wise skill breakdown.
- **Salary insights**: distributions, boxplots by role/location, and outlier analysis.
- **ML salary predictor (Python)**: predict salary range from features like role, location, experience level, and skills.
- **Upload your own data**: optional page where users upload a CSV of job postings and get the same analytics.

Tech stack
----------
- **Frontend**: React (with Vite), modern dark theme, animations (e.g. Framer Motion or CSS transitions).
- **Backend API**: Python + Flask.
- **ML / Data**: pandas, NumPy, scikit‑learn, joblib.
- **Data source**: public job‑posting dataset (e.g. Kaggle) downloaded manually as CSV.

No API keys required
--------------------
TalentScope is intentionally designed to **avoid paid APIs or keys**:
- You **download the dataset manually** (e.g. from Kaggle) and place the CSV in the backend `data/` folder.
- The **ML model trains locally** using scikit‑learn.
- The React frontend talks only to your Flask API (running on `http://localhost:5000` during development).

Repository layout (planned)
---------------------------
- `backend/`
  - `app.py` – Flask API entry point.
  - `models/` – trained model files (e.g. `salary_model.pkl`).
  - `data/` – raw and processed CSV files.
  - `notebooks/` – Jupyter notebooks for EDA and model training.
  - `requirements.txt` – Python dependencies.
- `frontend/`
  - React + Vite app for the animated dashboard UI.

Getting started
---------------

1. **Backend setup (Python + Flask)**
   - Create and activate a virtual environment:

     ```bash
     cd backend
     python3 -m venv .venv
     source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate
     ```

   - Install dependencies:

     ```bash
     pip install -r requirements.txt
     ```

   - Run the API:

     ```bash
     flask --app app run --debug
     # or: python app.py
     ```

2. **Frontend setup (React + Vite)**
   - From the project root:

     ```bash
     npm create vite@latest frontend -- --template react
     cd frontend
     npm install
     npm run dev
     ```

   - Later, we will:
     - Add a **dark neon design system**.
     - Implement animated cards, charts, and transitions.
     - Connect to Flask using `fetch`/`axios` (e.g. `http://localhost:5000/api/...`).

How this helps your job search
------------------------------
- **Strong story for interviews**: end‑to‑end project from data collection and EDA to ML and frontend.
- **Directly relevant to data roles**: talks about real business questions (skills, salaries, market trends).
- **Shows multiple skills at once**: Python, ML, data viz, API design, and React UI.

Deploy on Vercel (same as your portfolio)
----------------------------------------
1. Push your TalentScope repo to GitHub (if you haven’t already).
2. Go to [vercel.com](https://vercel.com) and sign in (same account you use for your portfolio).
3. Click **Add New…** → **Project** and import your **TalentScope** repository.
4. Configure the project:
   - **Root Directory**: click **Edit**, set to `frontend`, then **Continue**.
   - **Framework Preset**: Vite (should be auto-detected).
   - **Build Command**: `npm run build` (default).
   - **Output Directory**: `dist` (default).
   - **Install Command**: `npm install` (default).
5. Click **Deploy**. Vercel will build and host the dashboard.
6. Your live site will be at `https://your-project-name.vercel.app` (or your custom domain if you add one).

The `frontend/vercel.json` file is already set up so all routes serve the React app (SPA routing works).

Next steps
----------
- Set up the **Python backend** in the `backend/` folder (see `requirements.txt` and `app.py`).
- Set up the **React frontend** in the `frontend/` folder using Vite.
- Then we will iteratively:
  - In the backend: clean data, train a salary model, and expose analytics endpoints.
  - In the frontend: build each dashboard page with smooth animations and charts.


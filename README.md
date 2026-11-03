**TalentScope: US Data Job Market Dashboard**

An interactive dashboard built on 206,292 US data job postings from 2023. It shows which skills employers ask for, what roles pay, where the jobs are, and gives a salary estimate for a role, seniority level and city.

Live dashboard: https://talentscope-chi.vercel.app

**The problem**

Job seekers in data ask the same questions: which skills should I learn, what should I expect to be paid, and where are the jobs? The answers are scattered across job boards. TalentScope computes them from one large dataset and puts them in one place.

**The data**

* Source: the public lukebarousse/data_jobs dataset on Hugging Face, released under the Apache 2.0 license.
* Size: 785,741 data job postings worldwide in 2023. This dashboard uses the 206,292 in the United States.
* Skills: 182,167 US postings list skills, covering 241 distinct skills.
* Salaries: only 15,766 postings (7.6 percent) list a yearly salary, so every salary figure comes from that smaller group. The median is 119,200 dollars.

**Method**

1. scripts/build_data.py reads the dataset with pandas and computes every figure the dashboard shows.
2. It writes one small file, frontend/src/data/talentscope.json (about 16 KB).
3. The React app reads that file directly. There is no backend and no API key.

Salary medians for states and cities are only shown where there are enough salaried postings.

**Findings**

* SQL is the most requested skill, in 63.2 percent of postings that list skills. Python follows at 58.8 percent, then R at 28.1, Tableau at 27.2, Excel at 24.9 and AWS at 20.9.
* Skills tied to engineering and machine learning pay the most. Postings listing TensorFlow have a median salary of 150,000 dollars, Spark 142,500, Java 137,500 and AWS 136,400. Excel is lowest at 92,500.
* By role, Data Scientist (136,000 dollars) and Data Engineer (135,000) pay over 40 thousand dollars more than Data Analyst (92,500) and Business Analyst (90,000).
* Python marks the gap between scientist and analyst jobs. It appears in 82.5 percent of Data Scientist postings but only 33.4 percent of Data Analyst postings. Visualization tools show the reverse, at 45.5 percent for analysts and 30.8 percent for scientists.
* Remote work is the largest category, with 23,021 postings. Among cities, New York (7,891), Atlanta (6,994) and Chicago (5,368) lead on volume, while San Francisco pays the most at a median of 150,000 dollars.
* California (28,607 postings), Texas (20,277) and Florida (15,400) have the most postings.
* Hiring peaks in January (22,670 postings) and August (21,029) and is lowest in December (13,153).
* Each seniority step matters. For Data Scientists the median is about 94,000 dollars at junior level, 123,000 at mid level and 159,000 at senior level.

**Salary estimator**

The estimator is a lookup, not a trained model. It takes the median salary of postings for the chosen role and seniority, adjusts it for how much the chosen city pays above or below the norm, and shows the middle half of postings as a typical range, with the number of postings behind it. Seniority is read from the job title. ML Engineer and Software Engineer have few salaried postings, so treat those estimates as rough.

**Limits**

This is one year of data from one collection. It shows 2023, not today. Postings are not hires, and a company can post the same job many times. Salary data covers a small share of postings.

**Tech stack**

React, Vite, Recharts and MapLibre GL for the state map, with data prepared in Python and pandas. Deployed on Vercel.

**Run it locally**

1. In the frontend folder, run npm install and then npm run dev.
2. Open localhost on port 5173.

To rebuild the data, download data_jobs.csv from the Hugging Face dataset page, then run python scripts/build_data.py with the path to the file. You need pandas installed.

**Repository layout**

* frontend/src: the dashboard and the state map
* frontend/src/data/talentscope.json: all precomputed figures
* scripts/build_data.py: the script that builds that file

**Author**

Rutvij Reddy Vakati, MS in Data Analytics Engineering, George Mason University.
LinkedIn: https://linkedin.com/in/vakati-rutvij-1167rutvij
GitHub: https://github.com/rutvij1407

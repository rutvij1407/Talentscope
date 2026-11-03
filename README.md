**TalentScope: a Job Market Dashboard (Prototype)**

An interactive dashboard for exploring job market ideas such as skill demand, salaries by role, posting volume and activity by state.

**Important note on the data**

This is a front end prototype. The charts run on built in sample data and the Flask endpoint returns a fixed mock response, so the numbers do not describe the real job market. The next step is to connect a real public job postings dataset.

**What is built**

* A React dashboard of about 2,500 lines with a loading screen, animated charts and a salary range predictor demo.
* A map of the United States by state, drawn with Mapbox.
* A small Flask backend with a health check and a mock summary endpoint.

**Roadmap**

1. Load a real job postings dataset and compute the charts from it.
2. Train a salary model with scikit learn and serve it from the Flask API.
3. Add a page where users upload their own CSV.

**Tech stack**

React, Vite, Recharts, Mapbox GL, Flask, Python.

**Run it locally**

1. In the backend folder, install requirements.txt and run app.py. The API starts on port 5000.
2. In the frontend folder, run npm install and then npm run dev.

Author: Rutvij Reddy Vakati

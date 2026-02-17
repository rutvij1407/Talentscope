from flask import Flask, jsonify
from flask_cors import CORS


def create_app() -> Flask:
    """
    Application factory for the TalentScope backend.

    For now this only exposes a simple health check and a placeholder
    endpoint that the React frontend can call while you are learning
    the stack. We will gradually extend this with:
      - real dataset loading and cleaning
      - feature engineering
      - a trained salary prediction model
      - multiple analytics endpoints (overview, skills, salaries, etc.)
    """
    app = Flask(__name__)
    CORS(app)  # allow requests from your React dev server

    @app.get("/health")
    def health() -> tuple[dict, int]:
        """Simple health check."""
        return {"status": "ok", "service": "talentscope-backend"}, 200

    @app.get("/api/summary")
    def summary() -> tuple[dict, int]:
        """
        Temporary mock endpoint.

        The React UI can hit this route to render animated cards and charts
        even before the real ML/data pipeline is finished.
        """
        data = {
            "total_postings": 132456,
            "unique_roles": 185,
            "unique_companies": 4120,
            "top_locations": [
                {"location": "New York, NY", "count": 15432},
                {"location": "San Francisco, CA", "count": 13289},
                {"location": "Remote", "count": 11876},
            ],
            "top_roles": [
                {"title": "Data Analyst", "count": 25410},
                {"title": "Data Scientist", "count": 18976},
                {"title": "ML Engineer", "count": 8745},
            ],
        }
        return jsonify(data), 200

    return app


app = create_app()


if __name__ == "__main__":
    # Local dev only; for production you'll use a WSGI/ASGI server.
    app.run(host="0.0.0.0", port=5000, debug=True)


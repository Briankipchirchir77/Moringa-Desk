"""Entry point. Run the dev server with:  python run.py

In production a WSGI server runs `app` directly, e.g.:
    gunicorn "run:app"
"""
from server import create_app

app = create_app()

if __name__ == "__main__":
    # host=0.0.0.0 so it's reachable; port 4000 matches the frontend's
    # existing json-server port, so VITE_API_URL can stay the same.
    app.run(host="0.0.0.0", port=4000, debug=True)

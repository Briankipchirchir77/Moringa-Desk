"""Convenience for local dev/grading: starts a throwaway embedded Postgres
server (via `pgserver`, no root/apt/Docker required) and prints its
connection string to use as DATABASE_URL.

NOT for production — Render/Railway/Supabase/etc. provide real managed
Postgres there; this is purely so you can run `flask db upgrade` and
`python seed.py` immediately without installing/configuring Postgres.

Usage:
    pip install -r requirements-dev.txt
    python start_test_db.py
    # in another terminal, using the printed URL:
    #   DATABASE_URL=<printed URL> flask db upgrade
    #   DATABASE_URL=<printed URL> python seed.py
    #   DATABASE_URL=<printed URL> flask run --port 5000
"""
import sys
import time

try:
    import pgserver
except ImportError:
    print("pgserver isn't installed. Run: pip install -r requirements-dev.txt", file=sys.stderr)
    raise SystemExit(1)

db = pgserver.get_server("/tmp/moringadesk_pg_data")
print(db.get_uri())
sys.stdout.flush()

try:
    while True:
        time.sleep(3600)
except KeyboardInterrupt:
    pass

"""Application factory.

create_app() builds and configures the Flask app: it binds the extensions,
registers every route blueprint, sets up JWT error messages and CORS, and
exposes a tiny health-check at '/'. Keeping this in a factory makes testing
easy (the test suite builds an app with a throwaway database).
"""
from flask import Flask, jsonify

from .config import Config
from .extensions import db, migrate, jwt, bcrypt, cors


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # --- bind extensions to this app ---
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    # allow the React frontend (any origin in dev) to call the API
    cors.init_app(app, resources={r"/*": {"origins": "*"}})

    # --- register all route groups ---
    from .resources.auth import auth_bp
    from .resources.users import users_bp
    from .resources.tags import tags_bp
    from .resources.problems import problems_bp
    from .resources.answers import answers_bp
    from .resources.faqs import faqs_bp
    from .resources.notifications import notifications_bp
    from .resources.reports import reports_bp

    for bp in (auth_bp, users_bp, tags_bp, problems_bp,
               answers_bp, faqs_bp, notifications_bp, reports_bp):
        app.register_blueprint(bp)

    # --- friendly JWT error messages (instead of bare 401/422) ---
    @jwt.unauthorized_loader
    def _missing_token(reason):
        return jsonify({"message": "Missing or invalid Authorization header."}), 401

    @jwt.invalid_token_loader
    def _invalid_token(reason):
        return jsonify({"message": "Invalid token."}), 401

    @jwt.expired_token_loader
    def _expired_token(header, payload):
        return jsonify({"message": "Your session has expired, please log in again."}), 401

    @app.get("/")
    def index():
        return jsonify({"status": "ok", "service": "MoringaDesk API"}), 200

    return app

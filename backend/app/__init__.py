from flask import Flask, jsonify
from .extensions import db, migrate, jwt, cors
from config import Config


def create_app(config_object=Config):
    app = Flask(__name__)
    app.config.from_object(config_object)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}})

    from . import models  # noqa: F401  (register models with SQLAlchemy)

    from .routes.auth import auth_bp
    from .routes.users import users_bp
    from .routes.problems import problems_bp
    from .routes.answers import answers_bp
    from .routes.tags import tags_bp
    from .routes.faqs import faqs_bp
    from .routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(problems_bp, url_prefix="/problems")
    app.register_blueprint(answers_bp, url_prefix="/answers")
    app.register_blueprint(tags_bp, url_prefix="/tags")
    app.register_blueprint(faqs_bp, url_prefix="/faqs")
    app.register_blueprint(notifications_bp, url_prefix="/notifications")

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"})

    @app.errorhandler(404)
    def not_found(_err):
        return jsonify({"message": "Not found."}), 404

    @app.errorhandler(500)
    def server_error(_err):
        return jsonify({"message": "Internal server error."}), 500

    return app

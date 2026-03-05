from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(config_name="development"):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": [
    app.config["FRONTEND_URL"],
    "https://taskmanager-tawny-delta.vercel.app",
    "https://taskmanager-*-sudesh-kavindas-projects-dfa9c4d1.vercel.app"
]}})

    # Register blueprints
    from .auth import auth_bp
    from .tasks import tasks_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(tasks_bp, url_prefix="/api/tasks")

    # Health check route
    @app.route("/api/debug")
def debug():
    import os
    return {
        "jwt_key_set": bool(os.environ.get("JWT_SECRET_KEY")),
        "jwt_key_length": len(os.environ.get("JWT_SECRET_KEY", "")),
        "flask_env": os.environ.get("FLASK_ENV")
    }

    return app

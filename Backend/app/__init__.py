from flask import Flask
from flask_cors import CORS
from flasgger import Swagger

from app.database import get_connection

from app.routes.student_routes import student_bp
from app.routes.auth_routes import auth_bp
from app.routes.education_routes import education_bp
from app.routes.skills_routes import skills_bp
from app.routes.project_routes import project_bp
from app.routes.certification_routes import certification_bp
from app.routes.internship_routes import internship_bp
from app.routes.job_routes import job_bp
from app.routes.eligibility_routes import eligibility_bp
from app.routes.application_routes import application_bp
from app.routes.admin_routes import admin_bp


def create_app():

    app = Flask(__name__)

    CORS(app)

    # ============================================================
    # SWAGGER CONFIGURATION
    # ============================================================

    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec",
                "route": "/apispec.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/apidocs/"
    }

    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "CREMS API",
            "description": (
                "Campus Recruitment & Eligibility "
                "Management System REST API"
            ),
            "version": "1.0.0"
        },
        "host": "127.0.0.1:5000",
        "basePath": "/api",
        "schemes": ["http"]
    }

    Swagger(
        app,
        config=swagger_config,
        template=swagger_template
    )

    # ============================================================
    # REGISTER ALL BLUEPRINTS
    # ============================================================

    app.register_blueprint(
        student_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        auth_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        education_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        skills_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        project_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        certification_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        internship_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        job_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        eligibility_bp,
        url_prefix="/api"
    )

    # IMPORTANT:
    # Application routes must be registered here
    app.register_blueprint(
        application_bp,
        url_prefix="/api"
    )

    app.register_blueprint(
        admin_bp,
        url_prefix="/api"
    )

    # ============================================================
    # HOME
    # ============================================================

    @app.route("/")
    def home():

        return {
            "message": "CREMS API is running successfully!",
            "project": (
                "Campus Recruitment & "
                "Eligibility Management System"
            ),
            "status": "active"
        }

    # ============================================================
    # DATABASE HEALTH CHECK
    # ============================================================

    @app.route("/api/health/db")
    def database_health():

        connection = None

        try:

            connection = get_connection()

            return {
                "database": "connected",
                "database_name": "crems",
                "status": "healthy"
            }

        except Exception as e:

            return {
                "database": "disconnected",
                "status": "unhealthy",
                "error": str(e)
            }, 500

        finally:

            if connection:
                connection.close()

    return app
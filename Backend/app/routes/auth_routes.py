from flask import Blueprint, request, jsonify
import bcrypt
import pymysql
import jwt
import datetime

from app.database import get_connection
from app.config import JWT_SECRET


auth_bp = Blueprint("auth_bp", __name__)


# ============================================================
# REGISTER USER
# ============================================================
@auth_bp.route("/auth/register", methods=["POST"])
def register():
    """
    Register a new student user.

    ---
    tags:
      - Authentication

    consumes:
      - application/json

    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: student@example.com
            password:
              type: string
              example: student123

    responses:
      201:
        description: User registered successfully

      400:
        description: Invalid request

      409:
        description: Email already registered

      500:
        description: Registration failed
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    required_fields = [
        "email",
        "password"
    ]

    for field in required_fields:

        if field not in data or not data[field]:

            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400

    email = data["email"].strip().lower()
    password = data["password"]

    if len(password) < 6:

        return jsonify({
            "status": "error",
            "message": "Password must be at least 6 characters"
        }), 400

    connection = get_connection()

    try:

        cursor = connection.cursor()

        cursor.execute("""
            SELECT user_id
            FROM users
            WHERE email = %s
        """, (email,))

        existing_user = cursor.fetchone()

        if existing_user:

            return jsonify({
                "status": "error",
                "message": "Email already registered"
            }), 409

        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute("""
            INSERT INTO users
            (
                email,
                password_hash,
                role
            )
            VALUES (%s, %s, %s)
        """, (
            email,
            password_hash,
            "STUDENT"
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "User registered successfully",
            "user_id": cursor.lastrowid,
            "role": "STUDENT"
        }), 201

    except pymysql.err.IntegrityError as e:

        connection.rollback()

        if e.args[0] == 1062:

            return jsonify({
                "status": "error",
                "message": "Email already registered"
            }), 409

        return jsonify({
            "status": "error",
            "message": "Database integrity error"
        }), 400

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Registration failed",
            "error": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()


# ============================================================
# LOGIN USER
# ============================================================
@auth_bp.route("/auth/login", methods=["POST"])
def login():
    """
    Login user and generate JWT token.

    ---
    tags:
      - Authentication

    consumes:
      - application/json

    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: student@example.com
            password:
              type: string
              example: student123

    responses:
      200:
        description: Login successful

      400:
        description: Invalid request

      401:
        description: Invalid email or password

      500:
        description: Login failed
    """

    data = request.get_json()

    if not data:

        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email:

        return jsonify({
            "status": "error",
            "message": "Email is required"
        }), 400

    if not password:

        return jsonify({
            "status": "error",
            "message": "Password is required"
        }), 400

    email = email.strip().lower()

    connection = get_connection()

    try:

        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                user_id,
                email,
                password_hash,
                role
            FROM users
            WHERE email = %s
        """, (email,))

        user = cursor.fetchone()

        if not user:

            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        password_valid = bcrypt.checkpw(
            password.encode("utf-8"),
            user["password_hash"].encode("utf-8")
        )

        if not password_valid:

            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        payload = {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
            "exp": datetime.datetime.now(datetime.timezone.utc)
                  + datetime.timedelta(hours=2)
        }

        token = jwt.encode(
            payload,
            JWT_SECRET,
            algorithm="HS256"
        )

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
            "token": token
        }), 200

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": "Login failed",
            "error": str(e)
        }), 500

    finally:

        cursor.close()
        connection.close()
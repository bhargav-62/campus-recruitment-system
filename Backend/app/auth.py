import jwt

from functools import wraps

from flask import (
    request,
    jsonify
)

from app.config import JWT_SECRET
from app.database import get_connection


# ============================================================
# TOKEN AUTHENTICATION
# ============================================================

def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get(
            "Authorization"
        )

        if not auth_header:

            return jsonify({
                "status": "error",
                "message": "Authorization token is required"
            }), 401


        parts = auth_header.split()


        if (
            len(parts) != 2
            or parts[0].lower() != "bearer"
        ):

            return jsonify({
                "status": "error",
                "message": (
                    "Authorization header must use "
                    "Bearer token"
                )
            }), 401


        token = parts[1]


        try:

            payload = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=["HS256"]
            )

            request.user = payload


        except jwt.ExpiredSignatureError:

            return jsonify({
                "status": "error",
                "message": "Token has expired"
            }), 401


        except jwt.InvalidTokenError:

            return jsonify({
                "status": "error",
                "message": "Invalid token"
            }), 401


        return f(*args, **kwargs)


    return decorated


# ============================================================
# ADMIN AUTHORIZATION
# ============================================================

def admin_required(f):

    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):

        user = getattr(
            request,
            "user",
            None
        )


        if not user:

            return jsonify({
                "status": "error",
                "message": "Authentication required"
            }), 401


        if user.get("role") != "ADMIN":

            return jsonify({
                "status": "error",
                "message": "Admin access required"
            }), 403


        return f(*args, **kwargs)


    return decorated


# ============================================================
# STUDENT OWNERSHIP AUTHORIZATION
# ============================================================

def student_access_required(f):

    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):

        user = getattr(
            request,
            "user",
            None
        )


        if not user:

            return jsonify({
                "status": "error",
                "message": "Authentication required"
            }), 401


        # ----------------------------------------------------
        # ADMIN USERS
        # ----------------------------------------------------

        if user.get("role") == "ADMIN":

            return f(*args, **kwargs)


        # ----------------------------------------------------
        # STUDENT ROLE
        # ----------------------------------------------------

        if user.get("role") != "STUDENT":

            return jsonify({
                "status": "error",
                "message": "Student access required"
            }), 403


        connection = None


        try:

            connection = get_connection()

            cursor = connection.cursor()


            # ------------------------------------------------
            # FIND LOGGED-IN STUDENT
            # ------------------------------------------------

            cursor.execute(
                """
                SELECT
                    student_id
                FROM students
                WHERE user_id = %s
                """,
                (
                    user.get("user_id"),
                )
            )


            student = cursor.fetchone()


            if not student:

                return jsonify({
                    "status": "error",
                    "message": "Student profile not found"
                }), 404


            own_student_id = int(
                student["student_id"]
            )


            # ------------------------------------------------
            # CASE 1:
            # student_id IN URL
            # ------------------------------------------------

            requested_student_id = (
                kwargs.get("student_id")
            )


            if requested_student_id is not None:

                try:

                    requested_student_id = int(
                        requested_student_id
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    return jsonify({
                        "status": "error",
                        "message": "Invalid student ID"
                    }), 400


                if (
                    requested_student_id
                    != own_student_id
                ):

                    return jsonify({
                        "status": "error",
                        "message": (
                            "You can only access "
                            "your own student data"
                        )
                    }), 403


                return f(
                    *args,
                    **kwargs
                )


            # ------------------------------------------------
            # CASE 2:
            # student_id IN REQUEST BODY
            # ------------------------------------------------

            if request.is_json:

                data = (
                    request.get_json(
                        silent=True
                    )
                    or {}
                )


                body_student_id = (
                    data.get("student_id")
                )


                if body_student_id is not None:

                    try:

                        body_student_id = int(
                            body_student_id
                        )

                    except (
                        TypeError,
                        ValueError
                    ):

                        return jsonify({
                            "status": "error",
                            "message": (
                                "Invalid student ID"
                            )
                        }), 400


                    if (
                        body_student_id
                        != own_student_id
                    ):

                        return jsonify({
                            "status": "error",
                            "message": (
                                "You can only access "
                                "your own student data"
                            )
                        }), 403


                    return f(
                        *args,
                        **kwargs
                    )


            # ------------------------------------------------
            # CASE 3:
            # application_id IN URL
            # ------------------------------------------------

            application_id = (
                kwargs.get("application_id")
            )


            if application_id is not None:

                cursor.execute(
                    """
                    SELECT
                        a.application_id
                    FROM applications a
                    INNER JOIN students s
                        ON a.student_id =
                           s.student_id
                    WHERE a.application_id = %s
                    AND s.user_id = %s
                    """,
                    (
                        application_id,
                        user.get("user_id")
                    )
                )


                owned_application = (
                    cursor.fetchone()
                )


                if not owned_application:

                    return jsonify({
                        "status": "error",
                        "message": (
                            "You can only access "
                            "your own application"
                        )
                    }), 403


                return f(
                    *args,
                    **kwargs
                )


            # ------------------------------------------------
            # NO OWNERSHIP INFORMATION
            # ------------------------------------------------

            return jsonify({
                "status": "error",
                "message": (
                    "Student ownership "
                    "could not be verified"
                )
            }), 403


        finally:

            if connection:

                connection.close()


    return decorated
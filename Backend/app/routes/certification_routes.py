from flask import Blueprint, request, jsonify

from app.database import get_connection
from app.auth import token_required


certification_bp = Blueprint("certification_bp", __name__)


# ============================================================
# GET STUDENT CERTIFICATIONS
# ============================================================
@certification_bp.route(
    "/certifications/student/<int:student_id>",
    methods=["GET"]
)
@token_required
def get_student_certifications(student_id):
    """
    Get all certifications of a student.

    ---
    tags:
      - Certifications

    security:
      - Bearer: []

    parameters:
      - name: student_id
        in: path
        required: true
        type: integer
        example: 1

    responses:
      200:
        description: Student certifications retrieved successfully
      401:
        description: Authentication required
      404:
        description: Student not found
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT student_id
            FROM students
            WHERE student_id = %s
        """, (student_id,))

        student = cursor.fetchone()

        if not student:
            return jsonify({
                "status": "error",
                "message": "Student not found"
            }), 404

        cursor.execute("""
            SELECT
                certification_id,
                student_id,
                certification_name,
                issuing_organization,
                issue_date,
                credential_url
            FROM certifications
            WHERE student_id = %s
            ORDER BY certification_id
        """, (student_id,))

        certifications = cursor.fetchall()

        return jsonify({
            "status": "success",
            "count": len(certifications),
            "certifications": certifications
        })

    finally:
        cursor.close()
        connection.close()


# ============================================================
# ADD CERTIFICATION
# ============================================================
@certification_bp.route(
    "/certifications",
    methods=["POST"]
)
@token_required
def add_certification():
    """
    Add a certification for a student.

    ---
    tags:
      - Certifications

    security:
      - Bearer: []

    consumes:
      - application/json

    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - student_id
            - certification_name
          properties:
            student_id:
              type: integer
              example: 1
            certification_name:
              type: string
              example: Advanced Python Programming
            issuing_organization:
              type: string
              example: Infosys Springboard
            issue_date:
              type: string
              format: date
              example: "2026-08-20"
            credential_url:
              type: string
              example: https://example.com/certificate

    responses:
      201:
        description: Certification added successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      404:
        description: Student not found
      500:
        description: Failed to add certification
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    required_fields = [
        "student_id",
        "certification_name"
    ]

    for field in required_fields:

        if field not in data or data[field] in [None, ""]:

            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT student_id
            FROM students
            WHERE student_id = %s
        """, (data["student_id"],))

        student = cursor.fetchone()

        if not student:

            return jsonify({
                "status": "error",
                "message": "Student not found"
            }), 404

        cursor.execute("""
            INSERT INTO certifications
            (
                student_id,
                certification_name,
                issuing_organization,
                issue_date,
                credential_url
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data["student_id"],
            data["certification_name"],
            data.get("issuing_organization"),
            data.get("issue_date"),
            data.get("credential_url")
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Certification added successfully",
            "certification_id": cursor.lastrowid
        }), 201

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to add certification",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# UPDATE CERTIFICATION
# ============================================================
@certification_bp.route(
    "/certifications/<int:certification_id>",
    methods=["PUT"]
)
@token_required
def update_certification(certification_id):
    """
    Update a certification.

    ---
    tags:
      - Certifications

    security:
      - Bearer: []

    consumes:
      - application/json

    parameters:
      - name: certification_id
        in: path
        required: true
        type: integer
        example: 1

      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - certification_name
          properties:
            certification_name:
              type: string
              example: Advanced Python Programming
            issuing_organization:
              type: string
              example: Infosys Springboard
            issue_date:
              type: string
              format: date
              example: "2026-08-20"
            credential_url:
              type: string
              example: https://example.com/certificate

    responses:
      200:
        description: Certification updated successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      404:
        description: Certification not found
      500:
        description: Failed to update certification
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    if (
        "certification_name" not in data
        or not data["certification_name"]
    ):
        return jsonify({
            "status": "error",
            "message": "certification_name is required"
        }), 400

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT certification_id
            FROM certifications
            WHERE certification_id = %s
        """, (certification_id,))

        certification = cursor.fetchone()

        if not certification:

            return jsonify({
                "status": "error",
                "message": "Certification not found"
            }), 404

        cursor.execute("""
            UPDATE certifications
            SET
                certification_name = %s,
                issuing_organization = %s,
                issue_date = %s,
                credential_url = %s
            WHERE certification_id = %s
        """, (
            data["certification_name"],
            data.get("issuing_organization"),
            data.get("issue_date"),
            data.get("credential_url"),
            certification_id
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Certification updated successfully",
            "certification_id": certification_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to update certification",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# DELETE CERTIFICATION
# ============================================================
@certification_bp.route(
    "/certifications/<int:certification_id>",
    methods=["DELETE"]
)
@token_required
def delete_certification(certification_id):
    """
    Delete a certification.

    ---
    tags:
      - Certifications

    security:
      - Bearer: []

    parameters:
      - name: certification_id
        in: path
        required: true
        type: integer
        example: 1

    responses:
      200:
        description: Certification deleted successfully
      401:
        description: Authentication required
      404:
        description: Certification not found
      500:
        description: Failed to delete certification
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT certification_id
            FROM certifications
            WHERE certification_id = %s
        """, (certification_id,))

        certification = cursor.fetchone()

        if not certification:

            return jsonify({
                "status": "error",
                "message": "Certification not found"
            }), 404

        cursor.execute("""
            DELETE FROM certifications
            WHERE certification_id = %s
        """, (certification_id,))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Certification deleted successfully",
            "certification_id": certification_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to delete certification",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()
from flask import Blueprint, request, jsonify

from app.database import get_connection
from app.auth import token_required


internship_bp = Blueprint("internship_bp", __name__)


# ============================================================
# GET STUDENT INTERNSHIPS
# ============================================================
@internship_bp.route(
    "/internships/student/<int:student_id>",
    methods=["GET"]
)
@token_required
def get_student_internships(student_id):
    """
    Get all internships of a student.

    ---
    tags:
      - Internships

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
        description: Student internships retrieved successfully
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
                internship_id,
                student_id,
                company_name,
                role,
                start_date,
                end_date,
                description
            FROM internships
            WHERE student_id = %s
            ORDER BY internship_id
        """, (student_id,))

        internships = cursor.fetchall()

        return jsonify({
            "status": "success",
            "count": len(internships),
            "internships": internships
        })

    finally:
        cursor.close()
        connection.close()


# ============================================================
# ADD INTERNSHIP
# ============================================================
@internship_bp.route(
    "/internships",
    methods=["POST"]
)
@token_required
def add_internship():
    """
    Add an internship for a student.

    ---
    tags:
      - Internships

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
            - company_name
          properties:
            student_id:
              type: integer
              example: 1
            company_name:
              type: string
              example: Infosys Limited
            role:
              type: string
              example: Backend Developer Intern
            start_date:
              type: string
              format: date
              example: "2026-06-01"
            end_date:
              type: string
              format: date
              example: "2026-08-31"
            description:
              type: string
              example: Developed REST APIs using Flask and MySQL.

    responses:
      201:
        description: Internship added successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      404:
        description: Student not found
      500:
        description: Failed to add internship
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    required_fields = [
        "student_id",
        "company_name"
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
            INSERT INTO internships
            (
                student_id,
                company_name,
                role,
                start_date,
                end_date,
                description
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data["student_id"],
            data["company_name"],
            data.get("role"),
            data.get("start_date"),
            data.get("end_date"),
            data.get("description")
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Internship added successfully",
            "internship_id": cursor.lastrowid
        }), 201

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to add internship",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# UPDATE INTERNSHIP
# ============================================================
@internship_bp.route(
    "/internships/<int:internship_id>",
    methods=["PUT"]
)
@token_required
def update_internship(internship_id):
    """
    Update an internship.

    ---
    tags:
      - Internships

    security:
      - Bearer: []

    consumes:
      - application/json

    parameters:
      - name: internship_id
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
            - company_name
          properties:
            company_name:
              type: string
              example: Infosys Limited
            role:
              type: string
              example: Backend Developer Intern
            start_date:
              type: string
              format: date
              example: "2026-06-01"
            end_date:
              type: string
              format: date
              example: "2026-08-31"
            description:
              type: string
              example: Developed Flask REST APIs and integrated MySQL.

    responses:
      200:
        description: Internship updated successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      404:
        description: Internship not found
      500:
        description: Failed to update internship
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    if "company_name" not in data or not data["company_name"]:
        return jsonify({
            "status": "error",
            "message": "company_name is required"
        }), 400

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT internship_id
            FROM internships
            WHERE internship_id = %s
        """, (internship_id,))

        internship = cursor.fetchone()

        if not internship:
            return jsonify({
                "status": "error",
                "message": "Internship not found"
            }), 404

        cursor.execute("""
            UPDATE internships
            SET
                company_name = %s,
                role = %s,
                start_date = %s,
                end_date = %s,
                description = %s
            WHERE internship_id = %s
        """, (
            data["company_name"],
            data.get("role"),
            data.get("start_date"),
            data.get("end_date"),
            data.get("description"),
            internship_id
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Internship updated successfully",
            "internship_id": internship_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to update internship",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# DELETE INTERNSHIP
# ============================================================
@internship_bp.route(
    "/internships/<int:internship_id>",
    methods=["DELETE"]
)
@token_required
def delete_internship(internship_id):
    """
    Delete an internship.

    ---
    tags:
      - Internships

    security:
      - Bearer: []

    parameters:
      - name: internship_id
        in: path
        required: true
        type: integer
        example: 1

    responses:
      200:
        description: Internship deleted successfully
      401:
        description: Authentication required
      404:
        description: Internship not found
      500:
        description: Failed to delete internship
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT internship_id
            FROM internships
            WHERE internship_id = %s
        """, (internship_id,))

        internship = cursor.fetchone()

        if not internship:
            return jsonify({
                "status": "error",
                "message": "Internship not found"
            }), 404

        cursor.execute("""
            DELETE FROM internships
            WHERE internship_id = %s
        """, (internship_id,))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Internship deleted successfully",
            "internship_id": internship_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to delete internship",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()
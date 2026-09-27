from flask import Blueprint, request, jsonify
from app.database import get_connection
from app.auth import token_required

education_bp = Blueprint("education_bp", __name__)


# ============================================================
# GET EDUCATION FOR A STUDENT
# ============================================================
@education_bp.route(
    "/education/student/<int:student_id>",
    methods=["GET"]
)
@token_required
def get_student_education(student_id):
    """
    Get education records for a student.

    ---
    tags:
      - Education

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
        description: Education records retrieved successfully
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
                education_id,
                student_id,
                qualification,
                institution,
                specialization,
                start_year,
                end_year,
                percentage
            FROM education
            WHERE student_id = %s
            ORDER BY education_id
        """, (student_id,))

        education = cursor.fetchall()

        return jsonify({
            "status": "success",
            "count": len(education),
            "education": education
        })

    finally:
        cursor.close()
        connection.close()


# ============================================================
# ADD EDUCATION
# ============================================================
@education_bp.route("/education", methods=["POST"])
@token_required
def add_education():
    """
    Add an education record for a student.

    ---
    tags:
      - Education

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
            - qualification
            - institution
          properties:
            student_id:
              type: integer
              example: 1
            qualification:
              type: string
              example: B.Tech
            institution:
              type: string
              example: VR Siddhartha Engineering College
            specialization:
              type: string
              example: CSE AI ML
            start_year:
              type: integer
              example: 2023
            end_year:
              type: integer
              example: 2027
            percentage:
              type: number
              format: float
              example: 78.50

    responses:
      201:
        description: Education added successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      404:
        description: Student not found
      500:
        description: Failed to add education
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    required_fields = [
        "student_id",
        "qualification",
        "institution"
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
            INSERT INTO education
            (
                student_id,
                qualification,
                institution,
                specialization,
                start_year,
                end_year,
                percentage
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            data["student_id"],
            data["qualification"],
            data["institution"],
            data.get("specialization"),
            data.get("start_year"),
            data.get("end_year"),
            data.get("percentage")
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Education added successfully",
            "education_id": cursor.lastrowid
        }), 201

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to add education",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# UPDATE EDUCATION
# ============================================================
@education_bp.route(
    "/education/<int:education_id>",
    methods=["PUT"]
)
@token_required
def update_education(education_id):
    """
    Update an education record.

    ---
    tags:
      - Education

    security:
      - Bearer: []

    parameters:
      - name: education_id
        in: path
        required: true
        type: integer
        example: 1

      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            qualification:
              type: string
              example: B.Tech
            institution:
              type: string
              example: VR Siddhartha Engineering College
            specialization:
              type: string
              example: CSE AI ML
            start_year:
              type: integer
              example: 2023
            end_year:
              type: integer
              example: 2027
            percentage:
              type: number
              format: float
              example: 78.50

    responses:
      200:
        description: Education updated successfully
      400:
        description: Request body is required
      401:
        description: Authentication required
      404:
        description: Education record not found
      500:
        description: Failed to update education
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT education_id
            FROM education
            WHERE education_id = %s
        """, (education_id,))

        education = cursor.fetchone()

        if not education:
            return jsonify({
                "status": "error",
                "message": "Education record not found"
            }), 404

        cursor.execute("""
            UPDATE education
            SET
                qualification = %s,
                institution = %s,
                specialization = %s,
                start_year = %s,
                end_year = %s,
                percentage = %s
            WHERE education_id = %s
        """, (
            data.get("qualification"),
            data.get("institution"),
            data.get("specialization"),
            data.get("start_year"),
            data.get("end_year"),
            data.get("percentage"),
            education_id
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Education updated successfully",
            "education_id": education_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to update education",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# DELETE EDUCATION
# ============================================================
@education_bp.route(
    "/education/<int:education_id>",
    methods=["DELETE"]
)
@token_required
def delete_education(education_id):
    """
    Delete an education record.

    ---
    tags:
      - Education

    security:
      - Bearer: []

    parameters:
      - name: education_id
        in: path
        required: true
        type: integer
        example: 1

    responses:
      200:
        description: Education deleted successfully
      401:
        description: Authentication required
      404:
        description: Education record not found
      500:
        description: Failed to delete education
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT education_id
            FROM education
            WHERE education_id = %s
        """, (education_id,))

        education = cursor.fetchone()

        if not education:
            return jsonify({
                "status": "error",
                "message": "Education record not found"
            }), 404

        cursor.execute("""
            DELETE FROM education
            WHERE education_id = %s
        """, (education_id,))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Education deleted successfully",
            "education_id": education_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to delete education",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()
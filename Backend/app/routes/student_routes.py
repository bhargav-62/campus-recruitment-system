from flask import Blueprint, request, jsonify
from app.database import get_connection
import pymysql

from app.auth import token_required

student_bp = Blueprint("student_bp", __name__)


# ============================================================
# GET ALL STUDENTS
# ============================================================
@student_bp.route("/students", methods=["GET"])
@token_required
def get_students():
    """
    Get all students.

    ---
    tags:
      - Students

    security:
      - Bearer: []

    responses:
      200:
        description: List of all students
      401:
        description: Authentication required
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                student_id,
                user_id,
                full_name,
                phone,
                date_of_birth,
                gender,
                branch,
                graduation_year,
                cgpa,
                backlogs
            FROM students
            ORDER BY student_id
        """)

        students = cursor.fetchall()

        return jsonify({
            "status": "success",
            "count": len(students),
            "students": students
        })

    finally:
        cursor.close()
        connection.close()


# ============================================================
# GET STUDENT BY ID
# ============================================================
@student_bp.route("/students/<int:student_id>", methods=["GET"])
@token_required
def get_student(student_id):
    """
    Get a student by ID.

    ---
    tags:
      - Students

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
        description: Student details
      401:
        description: Authentication required
      404:
        description: Student not found
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                student_id,
                user_id,
                full_name,
                phone,
                date_of_birth,
                gender,
                branch,
                graduation_year,
                cgpa,
                backlogs
            FROM students
            WHERE student_id = %s
        """, (student_id,))

        student = cursor.fetchone()

        if not student:
            return jsonify({
                "status": "error",
                "message": "Student not found"
            }), 404

        return jsonify({
            "status": "success",
            "student": student
        })

    finally:
        cursor.close()
        connection.close()


# ============================================================
# ADD NEW STUDENT
# ============================================================
@student_bp.route("/students", methods=["POST"])
@token_required
def add_student():
    """
    Add a new student profile.

    ---
    tags:
      - Students

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
            - user_id
            - full_name
            - branch
            - graduation_year
            - cgpa
          properties:
            user_id:
              type: integer
              example: 3
            full_name:
              type: string
              example: Bhargav Updated
            phone:
              type: string
              example: "9999999999"
            date_of_birth:
              type: string
              format: date
              example: "2005-05-15"
            gender:
              type: string
              example: Male
            branch:
              type: string
              example: CSE AI ML
            graduation_year:
              type: integer
              example: 2027
            cgpa:
              type: number
              format: float
              example: 8.10
            backlogs:
              type: integer
              example: 0

    responses:
      201:
        description: Student added successfully
      400:
        description: Invalid request or database integrity error
      401:
        description: Authentication required
      409:
        description: Student profile already exists
      500:
        description: Failed to add student
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    required_fields = [
        "user_id",
        "full_name",
        "branch",
        "graduation_year",
        "cgpa"
    ]

    for field in required_fields:

        if field not in data:

            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO students
            (
                user_id,
                full_name,
                phone,
                date_of_birth,
                gender,
                branch,
                graduation_year,
                cgpa,
                backlogs
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data["user_id"],
            data["full_name"],
            data.get("phone"),
            data.get("date_of_birth"),
            data.get("gender"),
            data["branch"],
            data["graduation_year"],
            data["cgpa"],
            data.get("backlogs", 0)
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Student added successfully",
            "student_id": cursor.lastrowid
        }), 201

    except pymysql.err.IntegrityError as e:

        connection.rollback()

        if e.args[0] == 1062:

            return jsonify({
                "status": "error",
                "message": "Student profile already exists for this user"
            }), 409

        return jsonify({
            "status": "error",
            "message": "Database integrity error"
        }), 400

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to add student",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# UPDATE STUDENT
# ============================================================
@student_bp.route("/students/<int:student_id>", methods=["PUT"])
@token_required
def update_student(student_id):
    """
    Update an existing student profile.

    ---
    tags:
      - Students

    security:
      - Bearer: []

    consumes:
      - application/json

    parameters:
      - name: student_id
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
            full_name:
              type: string
              example: Bhargav Updated
            phone:
              type: string
              example: "9999999999"
            date_of_birth:
              type: string
              format: date
              example: "2005-05-15"
            gender:
              type: string
              example: Male
            branch:
              type: string
              example: CSE AI ML
            graduation_year:
              type: integer
              example: 2027
            cgpa:
              type: number
              format: float
              example: 8.10
            backlogs:
              type: integer
              example: 0

    responses:
      200:
        description: Student updated successfully
      400:
        description: Request body is required
      401:
        description: Authentication required
      404:
        description: Student not found
      500:
        description: Failed to update student
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
            UPDATE students
            SET
                full_name = %s,
                phone = %s,
                date_of_birth = %s,
                gender = %s,
                branch = %s,
                graduation_year = %s,
                cgpa = %s,
                backlogs = %s
            WHERE student_id = %s
        """, (
            data.get("full_name"),
            data.get("phone"),
            data.get("date_of_birth"),
            data.get("gender"),
            data.get("branch"),
            data.get("graduation_year"),
            data.get("cgpa"),
            data.get("backlogs", 0),
            student_id
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Student updated successfully",
            "student_id": student_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to update student",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# DELETE STUDENT
# ============================================================
@student_bp.route("/students/<int:student_id>", methods=["DELETE"])
@token_required
def delete_student(student_id):
    """
    Delete a student profile.

    ---
    tags:
      - Students

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
        description: Student deleted successfully
      401:
        description: Authentication required
      404:
        description: Student not found
      500:
        description: Failed to delete student
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
            DELETE FROM students
            WHERE student_id = %s
        """, (student_id,))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Student deleted successfully",
            "student_id": student_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to delete student",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()
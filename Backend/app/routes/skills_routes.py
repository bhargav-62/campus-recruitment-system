from flask import Blueprint, request, jsonify

from app.database import get_connection
from app.auth import token_required


skills_bp = Blueprint("skills_bp", __name__)


# ============================================================
# GET STUDENT SKILLS
# ============================================================
@skills_bp.route(
    "/skills/student/<int:student_id>",
    methods=["GET"]
)
@token_required
def get_student_skills(student_id):
    """
    Get all skills of a student.

    ---
    tags:
      - Skills

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
        description: Student skills retrieved successfully
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
                skill_id,
                student_id,
                skill_name
            FROM skills
            WHERE student_id = %s
            ORDER BY skill_id
        """, (student_id,))

        skills = cursor.fetchall()

        return jsonify({
            "status": "success",
            "count": len(skills),
            "skills": skills
        })

    finally:
        cursor.close()
        connection.close()


# ============================================================
# ADD SKILL
# ============================================================
@skills_bp.route("/skills", methods=["POST"])
@token_required
def add_skill():
    """
    Add a skill to a student.

    ---
    tags:
      - Skills

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
            - skill_name
          properties:
            student_id:
              type: integer
              example: 1
            skill_name:
              type: string
              example: Python Programming

    responses:
      201:
        description: Skill added successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      404:
        description: Student not found
      500:
        description: Failed to add skill
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    required_fields = [
        "student_id",
        "skill_name"
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
            INSERT INTO skills
            (
                student_id,
                skill_name
            )
            VALUES (%s, %s)
        """, (
            data["student_id"],
            data["skill_name"]
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Skill added successfully",
            "skill_id": cursor.lastrowid
        }), 201

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to add skill",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# UPDATE SKILL
# ============================================================
@skills_bp.route(
    "/skills/<int:skill_id>",
    methods=["PUT"]
)
@token_required
def update_skill(skill_id):
    """
    Update a student's skill.

    ---
    tags:
      - Skills

    security:
      - Bearer: []

    consumes:
      - application/json

    parameters:
      - name: skill_id
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
            - skill_name
          properties:
            skill_name:
              type: string
              example: Python Programming

    responses:
      200:
        description: Skill updated successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      404:
        description: Skill not found
      500:
        description: Failed to update skill
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    if "skill_name" not in data or not data["skill_name"]:

        return jsonify({
            "status": "error",
            "message": "skill_name is required"
        }), 400

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT skill_id
            FROM skills
            WHERE skill_id = %s
        """, (skill_id,))

        skill = cursor.fetchone()

        if not skill:
            return jsonify({
                "status": "error",
                "message": "Skill not found"
            }), 404

        cursor.execute("""
            UPDATE skills
            SET skill_name = %s
            WHERE skill_id = %s
        """, (
            data["skill_name"],
            skill_id
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Skill updated successfully",
            "skill_id": skill_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to update skill",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# DELETE SKILL
# ============================================================
@skills_bp.route(
    "/skills/<int:skill_id>",
    methods=["DELETE"]
)
@token_required
def delete_skill(skill_id):
    """
    Delete a student's skill.

    ---
    tags:
      - Skills

    security:
      - Bearer: []

    parameters:
      - name: skill_id
        in: path
        required: true
        type: integer
        example: 1

    responses:
      200:
        description: Skill deleted successfully
      401:
        description: Authentication required
      404:
        description: Skill not found
      500:
        description: Failed to delete skill
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT skill_id
            FROM skills
            WHERE skill_id = %s
        """, (skill_id,))

        skill = cursor.fetchone()

        if not skill:
            return jsonify({
                "status": "error",
                "message": "Skill not found"
            }), 404

        cursor.execute("""
            DELETE FROM skills
            WHERE skill_id = %s
        """, (skill_id,))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Skill deleted successfully",
            "skill_id": skill_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to delete skill",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()
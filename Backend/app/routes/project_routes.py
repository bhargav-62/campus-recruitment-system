from flask import Blueprint, request, jsonify

from app.database import get_connection
from app.auth import token_required


project_bp = Blueprint("project_bp", __name__)


# ============================================================
# GET STUDENT PROJECTS
# ============================================================
@project_bp.route(
    "/projects/student/<int:student_id>",
    methods=["GET"]
)
@token_required
def get_student_projects(student_id):
    """
    Get all projects of a student.

    ---
    tags:
      - Projects

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
        description: Student projects retrieved successfully
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
                project_id,
                student_id,
                project_name,
                description,
                technologies,
                project_url,
                created_at
            FROM projects
            WHERE student_id = %s
            ORDER BY project_id
        """, (student_id,))

        projects = cursor.fetchall()

        return jsonify({
            "status": "success",
            "count": len(projects),
            "projects": projects
        })

    finally:
        cursor.close()
        connection.close()


# ============================================================
# ADD PROJECT
# ============================================================
@project_bp.route("/projects", methods=["POST"])
@token_required
def add_project():
    """
    Add a project for a student.

    ---
    tags:
      - Projects

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
            - project_name
          properties:
            student_id:
              type: integer
              example: 1
            project_name:
              type: string
              example: Campus Recruitment Eligibility Management System
            description:
              type: string
              example: Full-stack recruitment management system using Flask and MySQL.
            technologies:
              type: string
              example: Python, Flask, MySQL, JWT, REST API
            project_url:
              type: string
              example: https://github.com/example/project

    responses:
      201:
        description: Project added successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      404:
        description: Student not found
      500:
        description: Failed to add project
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    required_fields = [
        "student_id",
        "project_name"
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
            INSERT INTO projects
            (
                student_id,
                project_name,
                description,
                technologies,
                project_url
            )
            VALUES (%s, %s, %s, %s, %s)
        """, (
            data["student_id"],
            data["project_name"],
            data.get("description"),
            data.get("technologies"),
            data.get("project_url")
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Project added successfully",
            "project_id": cursor.lastrowid
        }), 201

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to add project",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# UPDATE PROJECT
# ============================================================
@project_bp.route(
    "/projects/<int:project_id>",
    methods=["PUT"]
)
@token_required
def update_project(project_id):
    """
    Update a student project.

    ---
    tags:
      - Projects

    security:
      - Bearer: []

    consumes:
      - application/json

    parameters:
      - name: project_id
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
            - project_name
          properties:
            project_name:
              type: string
              example: Campus Recruitment Eligibility Management System
            description:
              type: string
              example: Full-stack recruitment management system.
            technologies:
              type: string
              example: Python, Flask, MySQL, JWT, REST API
            project_url:
              type: string
              example: https://github.com/example/project

    responses:
      200:
        description: Project updated successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      404:
        description: Project not found
      500:
        description: Failed to update project
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    if "project_name" not in data or not data["project_name"]:
        return jsonify({
            "status": "error",
            "message": "project_name is required"
        }), 400

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT project_id
            FROM projects
            WHERE project_id = %s
        """, (project_id,))

        project = cursor.fetchone()

        if not project:
            return jsonify({
                "status": "error",
                "message": "Project not found"
            }), 404

        cursor.execute("""
            UPDATE projects
            SET
                project_name = %s,
                description = %s,
                technologies = %s,
                project_url = %s
            WHERE project_id = %s
        """, (
            data["project_name"],
            data.get("description"),
            data.get("technologies"),
            data.get("project_url"),
            project_id
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Project updated successfully",
            "project_id": project_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to update project",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# DELETE PROJECT
# ============================================================
@project_bp.route(
    "/projects/<int:project_id>",
    methods=["DELETE"]
)
@token_required
def delete_project(project_id):
    """
    Delete a student project.

    ---
    tags:
      - Projects

    security:
      - Bearer: []

    parameters:
      - name: project_id
        in: path
        required: true
        type: integer
        example: 1

    responses:
      200:
        description: Project deleted successfully
      401:
        description: Authentication required
      404:
        description: Project not found
      500:
        description: Failed to delete project
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT project_id
            FROM projects
            WHERE project_id = %s
        """, (project_id,))

        project = cursor.fetchone()

        if not project:
            return jsonify({
                "status": "error",
                "message": "Project not found"
            }), 404

        cursor.execute("""
            DELETE FROM projects
            WHERE project_id = %s
        """, (project_id,))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Project deleted successfully",
            "project_id": project_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to delete project",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()
from flask import Blueprint, request, jsonify

from app.database import get_connection
from app.auth import token_required, admin_required


job_bp = Blueprint("job_bp", __name__)


# ============================================================
# GET ALL JOBS
# ============================================================
@job_bp.route("/jobs", methods=["GET"])
@token_required
def get_jobs():
    """
    Get all available jobs.

    ---
    tags:
      - Jobs

    security:
      - Bearer: []

    responses:
      200:
        description: Jobs retrieved successfully
      401:
        description: Authentication required
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                job_id,
                job_title,
                company_name,
                job_description,
                location,
                employment_type,
                minimum_cgpa,
                maximum_backlogs,
                graduation_year,
                created_at,
                application_deadline
            FROM jobs
            ORDER BY job_id DESC
        """)

        jobs = cursor.fetchall()

        return jsonify({
            "status": "success",
            "count": len(jobs),
            "jobs": jobs
        })

    finally:
        cursor.close()
        connection.close()


# ============================================================
# GET JOB BY ID
# ============================================================
@job_bp.route("/jobs/<int:job_id>", methods=["GET"])
@token_required
def get_job(job_id):
    """
    Get a job by ID.

    ---
    tags:
      - Jobs

    security:
      - Bearer: []

    parameters:
      - name: job_id
        in: path
        required: true
        type: integer
        example: 1

    responses:
      200:
        description: Job retrieved successfully
      401:
        description: Authentication required
      404:
        description: Job not found
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                job_id,
                job_title,
                company_name,
                job_description,
                location,
                employment_type,
                minimum_cgpa,
                maximum_backlogs,
                graduation_year,
                created_at,
                application_deadline
            FROM jobs
            WHERE job_id = %s
        """, (job_id,))

        job = cursor.fetchone()

        if not job:
            return jsonify({
                "status": "error",
                "message": "Job not found"
            }), 404

        return jsonify({
            "status": "success",
            "job": job
        })

    finally:
        cursor.close()
        connection.close()


# ============================================================
# CREATE JOB
# ============================================================
@job_bp.route("/jobs", methods=["POST"])
@admin_required
def create_job():
    """
    Create a new job.

    Admin access required.

    ---
    tags:
      - Jobs

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
            - job_title
            - company_name
          properties:
            job_title:
              type: string
              example: Graduate Software Engineer
            company_name:
              type: string
              example: LTI Mindtree
            job_description:
              type: string
              example: Entry-level software engineering role.
            location:
              type: string
              example: Bengaluru
            employment_type:
              type: string
              example: Full Time
            minimum_cgpa:
              type: number
              format: float
              example: 7.50
            maximum_backlogs:
              type: integer
              example: 0
            graduation_year:
              type: integer
              example: 2027
            application_deadline:
              type: string
              format: date
              example: "2026-10-20"

    responses:
      201:
        description: Job created successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      403:
        description: Admin access required
      500:
        description: Failed to create job
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    required_fields = [
        "job_title",
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
            INSERT INTO jobs
            (
                job_title,
                company_name,
                job_description,
                location,
                employment_type,
                minimum_cgpa,
                maximum_backlogs,
                graduation_year,
                application_deadline
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            data["job_title"],
            data["company_name"],
            data.get("job_description"),
            data.get("location"),
            data.get("employment_type"),
            data.get("minimum_cgpa", 0.00),
            data.get("maximum_backlogs", 0),
            data.get("graduation_year"),
            data.get("application_deadline")
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Job created successfully",
            "job_id": cursor.lastrowid
        }), 201

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to create job",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# UPDATE JOB
# ============================================================
@job_bp.route("/jobs/<int:job_id>", methods=["PUT"])
@admin_required
def update_job(job_id):
    """
    Update an existing job.

    Admin access required.

    ---
    tags:
      - Jobs

    security:
      - Bearer: []

    parameters:
      - name: job_id
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
            - job_title
            - company_name
          properties:
            job_title:
              type: string
              example: Graduate Software Engineer
            company_name:
              type: string
              example: LTI Mindtree
            job_description:
              type: string
              example: Entry-level software engineering role.
            location:
              type: string
              example: Bengaluru
            employment_type:
              type: string
              example: Full Time
            minimum_cgpa:
              type: number
              format: float
              example: 7.50
            maximum_backlogs:
              type: integer
              example: 0
            graduation_year:
              type: integer
              example: 2027
            application_deadline:
              type: string
              format: date
              example: "2026-10-20"

    responses:
      200:
        description: Job updated successfully
      400:
        description: Invalid request
      401:
        description: Authentication required
      403:
        description: Admin access required
      404:
        description: Job not found
      500:
        description: Failed to update job
    """

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    if "job_title" not in data or not data["job_title"]:
        return jsonify({
            "status": "error",
            "message": "job_title is required"
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
            SELECT job_id
            FROM jobs
            WHERE job_id = %s
        """, (job_id,))

        job = cursor.fetchone()

        if not job:
            return jsonify({
                "status": "error",
                "message": "Job not found"
            }), 404

        cursor.execute("""
            UPDATE jobs
            SET
                job_title = %s,
                company_name = %s,
                job_description = %s,
                location = %s,
                employment_type = %s,
                minimum_cgpa = %s,
                maximum_backlogs = %s,
                graduation_year = %s,
                application_deadline = %s
            WHERE job_id = %s
        """, (
            data["job_title"],
            data["company_name"],
            data.get("job_description"),
            data.get("location"),
            data.get("employment_type"),
            data.get("minimum_cgpa", 0.00),
            data.get("maximum_backlogs", 0),
            data.get("graduation_year"),
            data.get("application_deadline"),
            job_id
        ))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Job updated successfully",
            "job_id": job_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to update job",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()


# ============================================================
# DELETE JOB
# ============================================================
@job_bp.route("/jobs/<int:job_id>", methods=["DELETE"])
@admin_required
def delete_job(job_id):
    """
    Delete a job.

    Admin access required.

    ---
    tags:
      - Jobs

    security:
      - Bearer: []

    parameters:
      - name: job_id
        in: path
        required: true
        type: integer
        example: 1

    responses:
      200:
        description: Job deleted successfully
      401:
        description: Authentication required
      403:
        description: Admin access required
      404:
        description: Job not found
      500:
        description: Failed to delete job
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT job_id
            FROM jobs
            WHERE job_id = %s
        """, (job_id,))

        job = cursor.fetchone()

        if not job:
            return jsonify({
                "status": "error",
                "message": "Job not found"
            }), 404

        cursor.execute("""
            DELETE FROM jobs
            WHERE job_id = %s
        """, (job_id,))

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Job deleted successfully",
            "job_id": job_id
        })

    except Exception as e:

        connection.rollback()

        return jsonify({
            "status": "error",
            "message": "Failed to delete job",
            "error": str(e)
        }), 500

    finally:
        cursor.close()
        connection.close()
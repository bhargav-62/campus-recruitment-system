import re

from flask import Blueprint, request, jsonify

from app.database import get_connection
from app.auth import (
    token_required,
    admin_required,
    student_access_required
)


eligibility_bp = Blueprint(
    "eligibility_bp",
    __name__
)


# ============================================================
# HELPER - SKILL MATCHING
# ============================================================

def skill_matches(
    required_skill,
    student_skill
):
    """
    Match a required skill against a student's skill.

    Examples:

    Python
        -> Python Programming       True

    Python
        -> Advanced Python          True

    SQL
        -> SQL                      True

    Java
        -> JavaScript               False
    """

    required_skill = (
        str(required_skill)
        .strip()
        .lower()
    )

    student_skill = (
        str(student_skill)
        .strip()
        .lower()
    )

    if not required_skill or not student_skill:
        return False

    # Exact match
    if required_skill == student_skill:
        return True

    # Match required skill as a complete word/phrase
    # inside the student's skill.
    pattern = (
        r"(?<!\w)"
        + re.escape(required_skill)
        + r"(?!\w)"
    )

    return re.search(
        pattern,
        student_skill
    ) is not None


# ============================================================
# CREATE ELIGIBILITY RULES
# ============================================================

@eligibility_bp.route(
    "/jobs/<int:job_id>/eligibility",
    methods=["POST"]
)
@admin_required
def create_eligibility(job_id):
    """
    Create eligibility rules for a job.

    ---
    tags:
      - Eligibility

    security:
      - Bearer: []

    consumes:
      - application/json

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
          properties:
            allowed_branches:
              type: string
              example: CSE,CSE AI ML,IT

            required_skills:
              type: string
              example: Python,SQL

            minimum_percentage:
              type: number
              format: float
              example: 60.00

    responses:
      201:
        description: Eligibility rules created successfully

      400:
        description: Invalid request

      401:
        description: Authentication required

      403:
        description: Admin access required

      404:
        description: Job not found

      409:
        description: Eligibility rules already exist

      500:
        description: Failed to create eligibility rules
    """

    data = request.get_json()

    if not data:

        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_connection()
        cursor = connection.cursor()

        # ----------------------------------------------------
        # Check job exists
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT job_id
            FROM jobs
            WHERE job_id = %s
            """,
            (job_id,)
        )

        job = cursor.fetchone()

        if not job:

            return jsonify({
                "status": "error",
                "message": "Job not found"
            }), 404

        # ----------------------------------------------------
        # Check whether rules already exist
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT eligibility_id
            FROM job_eligibility
            WHERE job_id = %s
            """,
            (job_id,)
        )

        existing = cursor.fetchone()

        if existing:

            return jsonify({
                "status": "error",
                "message": (
                    "Eligibility rules already exist "
                    "for this job"
                )
            }), 409

        # ----------------------------------------------------
        # Create rules
        # ----------------------------------------------------

        cursor.execute(
            """
            INSERT INTO job_eligibility
            (
                job_id,
                allowed_branches,
                required_skills,
                minimum_percentage
            )
            VALUES (%s, %s, %s, %s)
            """,
            (
                job_id,
                data.get("allowed_branches"),
                data.get("required_skills"),
                data.get("minimum_percentage")
            )
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": (
                "Eligibility rules created successfully"
            ),
            "eligibility_id": cursor.lastrowid,
            "job_id": job_id
        }), 201

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": (
                "Failed to create eligibility rules"
            ),
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# GET ELIGIBILITY RULES
# ============================================================

@eligibility_bp.route(
    "/jobs/<int:job_id>/eligibility",
    methods=["GET"]
)
@token_required
def get_eligibility(job_id):
    """
    Get eligibility rules for a job.

    ---
    tags:
      - Eligibility

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
        description: Eligibility rules retrieved successfully

      401:
        description: Authentication required

      404:
        description: Eligibility rules not found
    """

    connection = None
    cursor = None

    try:

        connection = get_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                eligibility_id,
                job_id,
                allowed_branches,
                required_skills,
                minimum_percentage
            FROM job_eligibility
            WHERE job_id = %s
            """,
            (job_id,)
        )

        eligibility = cursor.fetchone()

        if not eligibility:

            return jsonify({
                "status": "error",
                "message": (
                    "Eligibility rules not found"
                )
            }), 404

        return jsonify({
            "status": "success",
            "eligibility": eligibility
        })

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# UPDATE ELIGIBILITY RULES
# ============================================================

@eligibility_bp.route(
    "/jobs/<int:job_id>/eligibility",
    methods=["PUT"]
)
@admin_required
def update_eligibility(job_id):
    """
    Update eligibility rules for a job.

    ---
    tags:
      - Eligibility

    security:
      - Bearer: []

    consumes:
      - application/json

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
          properties:
            allowed_branches:
              type: string
              example: CSE,CSE AI ML,IT

            required_skills:
              type: string
              example: Python,SQL

            minimum_percentage:
              type: number
              format: float
              example: 60.00

    responses:
      200:
        description: Eligibility rules updated successfully

      400:
        description: Invalid request

      401:
        description: Authentication required

      403:
        description: Admin access required

      404:
        description: Eligibility rules not found

      500:
        description: Failed to update eligibility rules
    """

    data = request.get_json()

    if not data:

        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400

    connection = None
    cursor = None

    try:

        connection = get_connection()
        cursor = connection.cursor()

        # ----------------------------------------------------
        # Check rules exist
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT eligibility_id
            FROM job_eligibility
            WHERE job_id = %s
            """,
            (job_id,)
        )

        eligibility = cursor.fetchone()

        if not eligibility:

            return jsonify({
                "status": "error",
                "message": (
                    "Eligibility rules not found"
                )
            }), 404

        # ----------------------------------------------------
        # Update rules
        # ----------------------------------------------------

        cursor.execute(
            """
            UPDATE job_eligibility
            SET
                allowed_branches = %s,
                required_skills = %s,
                minimum_percentage = %s
            WHERE job_id = %s
            """,
            (
                data.get("allowed_branches"),
                data.get("required_skills"),
                data.get("minimum_percentage"),
                job_id
            )
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": (
                "Eligibility rules updated successfully"
            ),
            "job_id": job_id
        })

    except Exception as e:

        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": (
                "Failed to update eligibility rules"
            ),
            "error": str(e)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()


# ============================================================
# CHECK STUDENT ELIGIBILITY FOR A JOB
# ============================================================

@eligibility_bp.route(
    "/jobs/<int:job_id>/eligibility/student/<int:student_id>",
    methods=["GET"]
)
@student_access_required
def check_student_eligibility(
    job_id,
    student_id
):
    """
    Check whether a student is eligible for a job.

    The system checks:
    - CGPA
    - Backlogs
    - Graduation year
    - Branch
    - Minimum percentage
    - Required skills

    ---
    tags:
      - Eligibility

    security:
      - Bearer: []

    parameters:
      - name: job_id
        in: path
        required: true
        type: integer
        example: 1

      - name: student_id
        in: path
        required: true
        type: integer
        example: 1

    responses:
      200:
        description: Eligibility result generated successfully

      401:
        description: Authentication required

      403:
        description: Student can only check own eligibility

      404:
        description: Student, job, or eligibility rules not found
    """

    connection = None
    cursor = None

    try:

        connection = get_connection()
        cursor = connection.cursor()

        # ----------------------------------------------------
        # Get student details
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT
                student_id,
                user_id,
                full_name,
                branch,
                graduation_year,
                cgpa,
                backlogs
            FROM students
            WHERE student_id = %s
            """,
            (student_id,)
        )

        student = cursor.fetchone()

        if not student:

            return jsonify({
                "status": "error",
                "message": "Student not found"
            }), 404

        # ----------------------------------------------------
        # Get job details
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT
                job_id,
                job_title,
                company_name,
                minimum_cgpa,
                maximum_backlogs,
                graduation_year
            FROM jobs
            WHERE job_id = %s
            """,
            (job_id,)
        )

        job = cursor.fetchone()

        if not job:

            return jsonify({
                "status": "error",
                "message": "Job not found"
            }), 404

        # ----------------------------------------------------
        # Get eligibility rules
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT
                allowed_branches,
                required_skills,
                minimum_percentage
            FROM job_eligibility
            WHERE job_id = %s
            """,
            (job_id,)
        )

        rules = cursor.fetchone()

        if not rules:

            return jsonify({
                "status": "error",
                "message": (
                    "Eligibility rules not found for this job"
                )
            }), 404

        # ====================================================
        # CHECK 1 - CGPA
        # ====================================================

        cgpa_check = (
            float(student["cgpa"])
            >= float(job["minimum_cgpa"])
        )

        # ====================================================
        # CHECK 2 - BACKLOGS
        # ====================================================

        backlog_check = (
            int(student["backlogs"])
            <= int(job["maximum_backlogs"])
        )

        # ====================================================
        # CHECK 3 - GRADUATION YEAR
        # ====================================================

        graduation_check = (
            student["graduation_year"]
            == job["graduation_year"]
        )

        # ====================================================
        # CHECK 4 - BRANCH
        # ====================================================

        allowed_branches = []

        if rules["allowed_branches"]:

            allowed_branches = [
                branch.strip().lower()
                for branch in
                rules["allowed_branches"].split(",")
                if branch.strip()
            ]

        student_branch = (
            student["branch"]
            .strip()
            .lower()
        )

        branch_check = (
            student_branch
            in allowed_branches
        )

        # ====================================================
        # CHECK 5 - PERCENTAGE
        # ====================================================

        percentage_check = True

        cursor.execute(
            """
            SELECT
                qualification,
                percentage
            FROM education
            WHERE student_id = %s
            ORDER BY education_id
            """,
            (student_id,)
        )

        education_records = (
            cursor.fetchall()
        )

        minimum_percentage = (
            rules["minimum_percentage"]
        )

        if minimum_percentage is not None:

            percentage_check = False

            for education in education_records:

                if education["percentage"] is not None:

                    if (
                        float(
                            education["percentage"]
                        )
                        >= float(
                            minimum_percentage
                        )
                    ):

                        percentage_check = True

                        break

        # ====================================================
        # GET STUDENT SKILLS
        # ====================================================

        cursor.execute(
            """
            SELECT skill_name
            FROM skills
            WHERE student_id = %s
            """,
            (student_id,)
        )

        student_skills_records = (
            cursor.fetchall()
        )

        student_skills = [
            skill["skill_name"]
            .strip()
            .lower()
            for skill in student_skills_records
            if skill["skill_name"]
        ]

        # ====================================================
        # CHECK 6 - REQUIRED SKILLS
        # ====================================================

        required_skills = []

        if rules["required_skills"]:

            required_skills = [
                skill.strip().lower()
                for skill in
                rules["required_skills"].split(",")
                if skill.strip()
            ]

        missing_skills = []

        for required_skill in required_skills:

            matched = any(
                skill_matches(
                    required_skill,
                    student_skill
                )
                for student_skill
                in student_skills
            )

            if not matched:

                missing_skills.append(
                    required_skill
                )

        skills_check = (
            len(missing_skills) == 0
        )

        # ====================================================
        # FINAL ELIGIBILITY
        # ====================================================

        eligible = (
            cgpa_check
            and backlog_check
            and graduation_check
            and branch_check
            and percentage_check
            and skills_check
        )

        # ====================================================
        # MISSING CHECKS
        # ====================================================

        missing_checks = []

        if not cgpa_check:

            missing_checks.append(
                "Minimum CGPA requirement"
            )

        if not backlog_check:

            missing_checks.append(
                "Maximum backlog requirement"
            )

        if not graduation_check:

            missing_checks.append(
                "Graduation year requirement"
            )

        if not branch_check:

            missing_checks.append(
                "Allowed branch requirement"
            )

        if not percentage_check:

            missing_checks.append(
                "Minimum percentage requirement"
            )

        if not skills_check:

            missing_checks.append(
                "Required skills: "
                + ", ".join(missing_skills)
            )

        # ====================================================
        # MESSAGE
        # ====================================================

        if eligible:

            message = (
                "Student is eligible for this opportunity."
            )

        else:

            message = (
                "Student is not eligible for this "
                "opportunity."
            )

        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify({

            "status": "success",

            "eligible": eligible,

            "message": message,

            "missing_checks": missing_checks,

            "missing_skills": missing_skills,

            "student": {

                "student_id":
                    student["student_id"],

                "full_name":
                    student["full_name"],

                "branch":
                    student["branch"],

                "graduation_year":
                    student["graduation_year"],

                "cgpa":
                    float(
                        student["cgpa"]
                    ),

                "backlogs":
                    int(
                        student["backlogs"]
                    )

            },

            "job": {

                "job_id":
                    job["job_id"],

                "job_title":
                    job["job_title"],

                "company_name":
                    job["company_name"]

            },

            "checks": {

                "cgpa":
                    cgpa_check,

                "backlogs":
                    backlog_check,

                "graduation_year":
                    graduation_check,

                "branch":
                    branch_check,

                "percentage":
                    percentage_check,

                "skills":
                    skills_check

            }

        })

    finally:

        if cursor:
            cursor.close()

        if connection:
            connection.close()
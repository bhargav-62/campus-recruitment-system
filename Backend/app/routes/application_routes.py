from flask import Blueprint, request, jsonify

from app.database import get_connection

from app.auth import (
    token_required,
    admin_required,
    student_access_required
)


application_bp = Blueprint(
    "application_bp",
    __name__
)


# ============================================================
# APPLY FOR A JOB
# ============================================================

@application_bp.route(
    "/applications",
    methods=["POST"]
)
@student_access_required
def apply_for_job():
    """
    Submit an application for a job.

    ---
    tags:
      - Applications
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - student_id
            - job_id
          properties:
            student_id:
              type: integer
              example: 1
            job_id:
              type: integer
              example: 1
    responses:
      201:
        description: Application submitted successfully
      400:
        description: Request body or required field is missing
      403:
        description: Student is not eligible for the job
      404:
        description: Student, job, or eligibility rules not found
      409:
        description: Student has already applied for this job
      500:
        description: Failed to submit application
    """

    data = request.get_json()

    if not data:

        return jsonify({
            "status": "error",
            "message": "Request body is required"
        }), 400


    required_fields = [
        "student_id",
        "job_id"
    ]


    for field in required_fields:

        if (
            field not in data
            or data[field] in [None, ""]
        ):

            return jsonify({
                "status": "error",
                "message": f"{field} is required"
            }), 400


    student_id = data["student_id"]
    job_id = data["job_id"]


    connection = get_connection()


    try:

        cursor = connection.cursor()


        # ----------------------------------------------------
        # CHECK STUDENT
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT
                student_id,
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
        # CHECK JOB
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
        # CHECK DUPLICATE APPLICATION
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT
                application_id,
                status
            FROM applications
            WHERE student_id = %s
            AND job_id = %s
            """,
            (
                student_id,
                job_id
            )
        )


        existing_application = cursor.fetchone()


        if existing_application:

            return jsonify({
                "status": "error",
                "message": (
                    "Student has already applied "
                    "for this job"
                ),
                "application_id": (
                    existing_application[
                        "application_id"
                    ]
                ),
                "current_status": (
                    existing_application[
                        "status"
                    ]
                )
            }), 409


        # ----------------------------------------------------
        # GET ELIGIBILITY RULES
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
                    "Eligibility rules not found "
                    "for this job"
                )
            }), 404


        # ----------------------------------------------------
        # CGPA CHECK
        # ----------------------------------------------------

        cgpa_check = (
            float(student["cgpa"])
            >= float(job["minimum_cgpa"])
        )


        # ----------------------------------------------------
        # BACKLOG CHECK
        # ----------------------------------------------------

        backlog_check = (
            int(student["backlogs"])
            <= int(job["maximum_backlogs"])
        )


        # ----------------------------------------------------
        # GRADUATION YEAR CHECK
        # ----------------------------------------------------

        graduation_check = (
            student["graduation_year"]
            == job["graduation_year"]
        )


        # ----------------------------------------------------
        # BRANCH CHECK
        # ----------------------------------------------------

        allowed_branches = []


        if rules["allowed_branches"]:

            allowed_branches = [

                branch.strip().lower()

                for branch
                in rules["allowed_branches"].split(",")

            ]


        branch_check = (
            student["branch"].strip().lower()
            in allowed_branches
        )


        # ----------------------------------------------------
        # PERCENTAGE CHECK
        # ----------------------------------------------------

        percentage_check = True


        cursor.execute(
            """
            SELECT percentage
            FROM education
            WHERE student_id = %s
            """,
            (student_id,)
        )


        education_records = cursor.fetchall()


        if rules["minimum_percentage"] is not None:

            percentage_check = False


            for education in education_records:

                if education["percentage"] is not None:

                    if (
                        float(
                            education["percentage"]
                        )
                        >= float(
                            rules[
                                "minimum_percentage"
                            ]
                        )
                    ):

                        percentage_check = True

                        break


        # ----------------------------------------------------
        # GET STUDENT SKILLS
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT skill_name
            FROM skills
            WHERE student_id = %s
            """,
            (student_id,)
        )


        skill_records = cursor.fetchall()


        student_skills = {

            skill["skill_name"]
            .strip()
            .lower()

            for skill
            in skill_records

        }


        # ----------------------------------------------------
        # REQUIRED SKILLS
        # ----------------------------------------------------

        required_skills = []


        if rules["required_skills"]:

            required_skills = [

                skill.strip().lower()

                for skill
                in rules["required_skills"].split(",")

            ]


        # ----------------------------------------------------
        # INTELLIGENT SKILL MATCHING
        # ----------------------------------------------------

        def skill_matches(
            required_skill,
            student_skill
        ):

            required_skill = (
                required_skill
                .strip()
                .lower()
            )


            student_skill = (
                student_skill
                .strip()
                .lower()
            )


            return (

                required_skill
                == student_skill

                or

                required_skill
                in student_skill

                or

                student_skill
                in required_skill

            )


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


        # ----------------------------------------------------
        # FINAL ELIGIBILITY
        # ----------------------------------------------------

        eligible = (

            cgpa_check

            and

            backlog_check

            and

            graduation_check

            and

            branch_check

            and

            percentage_check

            and

            skills_check

        )


        # ----------------------------------------------------
        # REJECT IF NOT ELIGIBLE
        # ----------------------------------------------------

        if not eligible:

            return jsonify({

                "status": "error",

                "message": (
                    "Student is not eligible "
                    "for this job"
                ),

                "eligible": False,

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

                },

                "missing_skills":
                    missing_skills

            }), 403


        # ----------------------------------------------------
        # CREATE APPLICATION
        # ----------------------------------------------------

        cursor.execute(
            """
            INSERT INTO applications
            (
                student_id,
                job_id,
                status
            )
            VALUES (%s, %s, %s)
            """,
            (
                student_id,
                job_id,
                "APPLIED"
            )
        )


        application_id = cursor.lastrowid


        # ----------------------------------------------------
        # CREATE INITIAL STATUS HISTORY
        # ----------------------------------------------------

        cursor.execute(
            """
            INSERT INTO application_status_history
            (
                application_id,
                old_status,
                new_status,
                remarks
            )
            VALUES (%s, %s, %s, %s)
            """,
            (
                application_id,
                None,
                "APPLIED",
                "Application submitted successfully"
            )
        )


        connection.commit()


        return jsonify({

            "status": "success",

            "message":
                "Application submitted successfully",

            "application_id":
                application_id,

            "job_id":
                job_id,

            "student_id":
                student_id,

            "application_status":
                "APPLIED"

        }), 201


    except Exception as e:

        connection.rollback()


        return jsonify({

            "status": "error",

            "message":
                "Failed to submit application",

            "error":
                str(e)

        }), 500


    finally:

        cursor.close()

        connection.close()


# ============================================================
# GET STUDENT APPLICATIONS
# ============================================================

@application_bp.route(
    "/applications/student/<int:student_id>",
    methods=["GET"]
)
@student_access_required
def get_student_applications(
    student_id
):
    """
    Get all applications submitted by a student.

    ---
    tags:
      - Applications
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
        description: Student applications retrieved successfully
      401:
        description: Authentication required
      403:
        description: Access denied
      404:
        description: Student profile not found
    """

    connection = get_connection()


    try:

        cursor = connection.cursor()


        cursor.execute(
            """
            SELECT
                a.application_id,
                a.student_id,
                a.job_id,
                j.job_title,
                j.company_name,
                j.location,
                a.application_date,
                a.status
            FROM applications a
            INNER JOIN jobs j
                ON a.job_id = j.job_id
            WHERE a.student_id = %s
            ORDER BY a.application_id DESC
            """,
            (student_id,)
        )


        applications = cursor.fetchall()


        return jsonify({

            "status": "success",

            "count":
                len(applications),

            "applications":
                applications

        })


    finally:

        cursor.close()

        connection.close()


# ============================================================
# GET APPLICATION BY ID
# ============================================================

@application_bp.route(
    "/applications/<int:application_id>",
    methods=["GET"]
)
@student_access_required
def get_application(
    application_id
):
    """
    Get a single application by application ID.

    ---
    tags:
      - Applications
    security:
      - Bearer: []
    parameters:
      - name: application_id
        in: path
        required: true
        type: integer
        example: 1
    responses:
      200:
        description: Application retrieved successfully
      401:
        description: Authentication required
      403:
        description: Access denied
      404:
        description: Application not found
    """

    connection = get_connection()


    try:

        cursor = connection.cursor()


        cursor.execute(
            """
            SELECT
                a.application_id,
                a.student_id,
                s.full_name,
                a.job_id,
                j.job_title,
                j.company_name,
                j.location,
                a.application_date,
                a.status
            FROM applications a
            INNER JOIN students s
                ON a.student_id = s.student_id
            INNER JOIN jobs j
                ON a.job_id = j.job_id
            WHERE a.application_id = %s
            """,
            (application_id,)
        )


        application = cursor.fetchone()


        if not application:

            return jsonify({

                "status": "error",

                "message":
                    "Application not found"

            }), 404


        return jsonify({

            "status": "success",

            "application":
                application

        })


    finally:

        cursor.close()

        connection.close()


# ============================================================
# UPDATE APPLICATION STATUS
# ADMIN ONLY
# ============================================================

@application_bp.route(
    "/applications/<int:application_id>/status",
    methods=["PUT"]
)
@admin_required
def update_application_status(
    application_id
):
    """
    Update the status of an application.

    ---
    tags:
      - Applications
    security:
      - Bearer: []
    parameters:
      - name: application_id
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
            - status
          properties:
            status:
              type: string
              enum:
                - APPLIED
                - SHORTLISTED
                - ASSESSMENT
                - INTERVIEW
                - SELECTED
                - REJECTED
              example: SHORTLISTED
            remarks:
              type: string
              example: Shortlisted for technical assessment
    responses:
      200:
        description: Application status updated successfully
      400:
        description: Invalid application status or request
      401:
        description: Authentication required
      403:
        description: Admin access required
      404:
        description: Application not found
      500:
        description: Failed to update application status
    """

    data = request.get_json()


    if not data:

        return jsonify({

            "status": "error",

            "message":
                "Request body is required"

        }), 400


    new_status = data.get(
        "status"
    )


    remarks = data.get(
        "remarks"
    )


    allowed_statuses = [

        "APPLIED",

        "SHORTLISTED",

        "ASSESSMENT",

        "INTERVIEW",

        "SELECTED",

        "REJECTED"

    ]


    if new_status not in allowed_statuses:

        return jsonify({

            "status": "error",

            "message":
                "Invalid application status",

            "allowed_statuses":
                allowed_statuses

        }), 400


    connection = get_connection()


    try:

        cursor = connection.cursor()


        # ----------------------------------------------------
        # GET CURRENT APPLICATION
        # ----------------------------------------------------

        cursor.execute(
            """
            SELECT
                application_id,
                status
            FROM applications
            WHERE application_id = %s
            """,
            (application_id,)
        )


        application = cursor.fetchone()


        if not application:

            return jsonify({

                "status": "error",

                "message":
                    "Application not found"

            }), 404


        old_status = application[
            "status"
        ]


        # ----------------------------------------------------
        # UPDATE APPLICATION
        # ----------------------------------------------------

        cursor.execute(
            """
            UPDATE applications
            SET status = %s
            WHERE application_id = %s
            """,
            (
                new_status,
                application_id
            )
        )


        # ----------------------------------------------------
        # RECORD STATUS HISTORY
        # ----------------------------------------------------

        cursor.execute(
            """
            INSERT INTO application_status_history
            (
                application_id,
                old_status,
                new_status,
                remarks
            )
            VALUES (%s, %s, %s, %s)
            """,
            (
                application_id,
                old_status,
                new_status,
                remarks
            )
        )


        connection.commit()


        return jsonify({

            "status": "success",

            "message":
                "Application status updated successfully",

            "application_id":
                application_id,

            "old_status":
                old_status,

            "new_status":
                new_status

        })


    except Exception as e:

        connection.rollback()


        return jsonify({

            "status": "error",

            "message":
                "Failed to update application status",

            "error":
                str(e)

        }), 500


    finally:

        cursor.close()

        connection.close()


# ============================================================
# GET APPLICATION STATUS HISTORY
# ============================================================

@application_bp.route(
    "/applications/<int:application_id>/history",
    methods=["GET"]
)
@student_access_required
def get_application_history(
    application_id
):
    """
    Get the status history of an application.

    ---
    tags:
      - Applications
    security:
      - Bearer: []
    parameters:
      - name: application_id
        in: path
        required: true
        type: integer
        example: 1
    responses:
      200:
        description: Application status history retrieved successfully
      401:
        description: Authentication required
      403:
        description: Access denied
      404:
        description: Application history not found
    """

    connection = get_connection()


    try:

        cursor = connection.cursor()


        cursor.execute(
            """
            SELECT
                history_id,
                application_id,
                old_status,
                new_status,
                changed_at,
                remarks
            FROM application_status_history
            WHERE application_id = %s
            ORDER BY history_id ASC
            """,
            (application_id,)
        )


        history = cursor.fetchall()


        if not history:

            return jsonify({

                "status": "error",

                "message":
                    "Application history not found"

            }), 404


        return jsonify({

            "status": "success",

            "application_id":
                application_id,

            "count":
                len(history),

            "history":
                history

        })


    finally:

        cursor.close()

        connection.close()
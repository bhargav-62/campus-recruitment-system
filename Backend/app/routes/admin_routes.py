from flask import Blueprint, jsonify

from app.database import get_connection
from app.auth import admin_required


admin_bp = Blueprint("admin_bp", __name__)


# ============================================================
# GET ALL APPLICATIONS - ADMIN
# ============================================================
@admin_bp.route(
    "/admin/applications",
    methods=["GET"]
)
@admin_required
def get_all_applications():
    """
    Get all job applications.

    Admin access required.

    ---
    tags:
      - Admin

    security:
      - Bearer: []

    responses:
      200:
        description: All applications retrieved successfully
      401:
        description: Authentication required
      403:
        description: Admin access required
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                a.application_id,
                a.student_id,
                s.full_name,
                s.branch,
                s.cgpa,
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

            ORDER BY a.application_id DESC
        """)

        applications = cursor.fetchall()

        return jsonify({
            "status": "success",
            "count": len(applications),
            "applications": applications
        })

    finally:
        cursor.close()
        connection.close()


# ============================================================
# GET ALL STUDENTS - ADMIN
# ============================================================
@admin_bp.route(
    "/admin/students",
    methods=["GET"]
)
@admin_required
def get_all_students():
    """
    Get all registered students.

    Admin access required.

    ---
    tags:
      - Admin

    security:
      - Bearer: []

    responses:
      200:
        description: All students retrieved successfully
      401:
        description: Authentication required
      403:
        description: Admin access required
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                s.student_id,
                s.user_id,
                s.full_name,
                u.email,
                s.phone,
                s.branch,
                s.graduation_year,
                s.cgpa,
                s.backlogs,
                s.created_at
            FROM students s
            INNER JOIN users u
                ON s.user_id = u.user_id
            ORDER BY s.student_id DESC
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
# GET ALL JOBS WITH ELIGIBILITY - ADMIN
# ============================================================
@admin_bp.route(
    "/admin/jobs",
    methods=["GET"]
)
@admin_required
def get_all_jobs():
    """
    Get all jobs with their eligibility rules.

    Admin access required.

    ---
    tags:
      - Admin

    security:
      - Bearer: []

    responses:
      200:
        description: All jobs and eligibility rules retrieved successfully
      401:
        description: Authentication required
      403:
        description: Admin access required
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        cursor.execute("""
            SELECT
                j.job_id,
                j.job_title,
                j.company_name,
                j.location,
                j.employment_type,
                j.minimum_cgpa,
                j.maximum_backlogs,
                j.graduation_year,
                j.application_deadline,
                e.allowed_branches,
                e.required_skills,
                e.minimum_percentage
            FROM jobs j
            LEFT JOIN job_eligibility e
                ON j.job_id = e.job_id
            ORDER BY j.job_id DESC
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
# ADMIN DASHBOARD STATISTICS
# ============================================================
@admin_bp.route(
    "/admin/dashboard",
    methods=["GET"]
)
@admin_required
def get_dashboard_statistics():
    """
    Get recruitment dashboard statistics.

    Admin access required.

    ---
    tags:
      - Admin

    security:
      - Bearer: []

    responses:
      200:
        description: Dashboard statistics retrieved successfully
      401:
        description: Authentication required
      403:
        description: Admin access required
    """

    connection = get_connection()

    try:
        cursor = connection.cursor()

        # Total students
        cursor.execute("""
            SELECT COUNT(*) AS total_students
            FROM students
        """)

        total_students = cursor.fetchone()["total_students"]

        # Total jobs
        cursor.execute("""
            SELECT COUNT(*) AS total_jobs
            FROM jobs
        """)

        total_jobs = cursor.fetchone()["total_jobs"]

        # Total applications
        cursor.execute("""
            SELECT COUNT(*) AS total_applications
            FROM applications
        """)

        total_applications = cursor.fetchone()["total_applications"]

        # Application status counts
        cursor.execute("""
            SELECT
                status,
                COUNT(*) AS count
            FROM applications
            GROUP BY status
        """)

        status_records = cursor.fetchall()

        status_counts = {
            "APPLIED": 0,
            "SHORTLISTED": 0,
            "ASSESSMENT": 0,
            "INTERVIEW": 0,
            "SELECTED": 0,
            "REJECTED": 0
        }

        for record in status_records:

            status_counts[record["status"]] = record["count"]

        return jsonify({
            "status": "success",

            "statistics": {
                "total_students": total_students,
                "total_jobs": total_jobs,
                "total_applications": total_applications,

                "applications": {
                    "applied": status_counts["APPLIED"],
                    "shortlisted": status_counts["SHORTLISTED"],
                    "assessment": status_counts["ASSESSMENT"],
                    "interview": status_counts["INTERVIEW"],
                    "selected": status_counts["SELECTED"],
                    "rejected": status_counts["REJECTED"]
                }
            }
        })

    finally:
        cursor.close()
        connection.close()
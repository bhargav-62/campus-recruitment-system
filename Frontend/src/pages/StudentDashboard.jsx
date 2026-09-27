import { useEffect, useState } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Briefcase,
  UserRound,
  GraduationCap,
  Code2,
  Award,
  Building2,
  FileText,
  LogOut,
  Bell,
  ChevronRight,
  CheckCircle2,
  Clock3,
  XCircle,
  Menu,
  X,
  Sparkles,
  MapPin,
  CalendarDays,
} from "lucide-react";

import {
  getStudents,
  getSkills,
  getProjects,
  getCertifications,
  getInternships,
} from "../services/studentApi";

import { getJobs } from "../services/jobApi";

import {
  getStudentApplications,
} from "../services/applicationApi";


// ============================================================
// STUDENT DASHBOARD
// ============================================================

function StudentDashboard() {

  const navigate = useNavigate();

  const location = useLocation();

  const [student, setStudent] = useState(null);

  const [skills, setSkills] = useState([]);

  const [projects, setProjects] = useState([]);

  const [certifications, setCertifications] =
    useState([]);

  const [internships, setInternships] =
    useState([]);

  const [jobs, setJobs] = useState([]);

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  useEffect(() => {

    const loadDashboard = async () => {

      try {

        const storedUser = JSON.parse(
          localStorage.getItem("crems_user") || "{}"
        );


        if (!storedUser.user_id) {

          navigate("/login");

          return;

        }


        // ------------------------------------------------------
        // FIND CURRENT STUDENT
        // ------------------------------------------------------

        const studentResponse =
          await getStudents();

        const allStudents =
          studentResponse.students || [];

        const currentStudent =
          allStudents.find(
            (item) =>
              item.user_id === storedUser.user_id
          );


        if (!currentStudent) {

          setError(
            "Student profile has not been created yet."
          );

          setLoading(false);

          return;

        }


        setStudent(currentStudent);


        // ------------------------------------------------------
        // LOAD STUDENT DATA
        // ------------------------------------------------------

        const [
          skillsResponse,
          projectsResponse,
          certificationsResponse,
          internshipsResponse,
          jobsResponse,
          applicationsResponse,
        ] = await Promise.all([

          getSkills(
            currentStudent.student_id
          ),

          getProjects(
            currentStudent.student_id
          ),

          getCertifications(
            currentStudent.student_id
          ),

          getInternships(
            currentStudent.student_id
          ),

          getJobs(),

          getStudentApplications(
            currentStudent.student_id
          ),

        ]);


        setSkills(
          skillsResponse.skills || []
        );

        setProjects(
          projectsResponse.projects || []
        );

        setCertifications(
          certificationsResponse.certifications || []
        );

        setInternships(
          internshipsResponse.internships || []
        );

        setJobs(
          jobsResponse.jobs || []
        );

        setApplications(
          applicationsResponse.applications || []
        );

      }

      catch (err) {

        console.error(err);


        if (
          err.response?.status === 401
        ) {

          localStorage.removeItem(
            "crems_token"
          );

          localStorage.removeItem(
            "crems_user"
          );

          navigate("/login");

          return;

        }


        setError(
          "Unable to load dashboard data."
        );

      }

      finally {

        setLoading(false);

      }

    };


    loadDashboard();

  }, [navigate]);


  // ==========================================================
  // PAGE NAVIGATION
  // ==========================================================

  const goTo = (path) => {

    setSidebarOpen(false);

    navigate(path);

  };


  // ==========================================================
  // ACTIVE SIDEBAR ITEM
  // ==========================================================

  const isActive = (path) => {

    return location.pathname === path;

  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "crems_token"
    );

    localStorage.removeItem(
      "crems_user"
    );

    navigate("/login");

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="dashboard-loading">

        <div className="loading-orbit"></div>

        <div className="loading-text">
          Preparing your CREMS workspace...
        </div>

      </div>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (

      <div className="dashboard-loading">

        <div className="dashboard-error-card">

          <XCircle size={35} />

          <h2>
            Profile unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            className="dashboard-primary-button"
            onClick={() =>
              navigate("/")
            }
          >
            Return Home
          </button>

        </div>

      </div>

    );

  }


  // ==========================================================
  // APPLICATION STATISTICS
  // ==========================================================

  const appliedCount =
    applications.filter(
      (item) =>
        item.status === "APPLIED"
    ).length;


  const shortlistedCount =
    applications.filter(
      (item) =>
        item.status === "SHORTLISTED"
    ).length;


  const interviewCount =
    applications.filter(
      (item) =>
        item.status === "INTERVIEW"
    ).length;


  const selectedCount =
    applications.filter(
      (item) =>
        item.status === "SELECTED"
    ).length;


  // ==========================================================
  // DASHBOARD
  // ==========================================================

  return (

    <div className="student-dashboard">


      {/* ====================================================
          MOBILE OVERLAY
      ==================================================== */}

      {sidebarOpen && (

        <div
          className="sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />

      )}


      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <aside
        className={
          sidebarOpen
            ? "dashboard-sidebar open"
            : "dashboard-sidebar"
        }
      >


        {/* ==================================================
            BRAND
        ================================================== */}

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            C
          </div>

          <div>

            <strong>
              CREMS
            </strong>

            <span>
              Student Portal
            </span>

          </div>


          <button
            className="mobile-close"
            onClick={() =>
              setSidebarOpen(false)
            }
          >

            <X size={20} />

          </button>

        </div>


        {/* ==================================================
            WORKSPACE
        ================================================== */}

        <div className="sidebar-section-title">
          WORKSPACE
        </div>


        <nav className="dashboard-nav">


          {/* DASHBOARD */}

          <button
            type="button"
            className={
              isActive("/dashboard")
                ? "dashboard-nav-item active"
                : "dashboard-nav-item"
            }
            onClick={() =>
              goTo("/dashboard")
            }
          >

            <LayoutDashboard size={17} />

            <span>
              Dashboard
            </span>

          </button>


          {/* OPPORTUNITIES */}

          <button
            type="button"
            className={
              isActive("/opportunities")
                ? "dashboard-nav-item active"
                : "dashboard-nav-item"
            }
            onClick={() =>
              goTo("/opportunities")
            }
          >

            <Briefcase size={17} />

            <span>
              Opportunities
            </span>

          </button>


          {/* APPLICATIONS */}

          <button
            type="button"
            className={
              isActive("/applications")
                ? "dashboard-nav-item active"
                : "dashboard-nav-item"
            }
            onClick={() =>
              goTo("/applications")
            }
          >

            <FileText size={17} />

            <span>
              Applications
            </span>

          </button>


          {/* MY PROFILE */}

          <button
            type="button"
            className={
              isActive("/profile")
                ? "dashboard-nav-item active"
                : "dashboard-nav-item"
            }
            onClick={() =>
              goTo("/profile")
            }
          >

            <UserRound size={17} />

            <span>
              My Profile
            </span>

          </button>

        </nav>


        {/* ==================================================
            PROFILE
        ================================================== */}

        <div className="sidebar-section-title">
          PROFILE
        </div>


        <nav className="dashboard-nav">


          {/* EDUCATION */}

          <button
            type="button"
            className={
              isActive("/education")
                ? "dashboard-nav-item active"
                : "dashboard-nav-item"
            }
            onClick={() =>
              goTo("/education")
            }
          >

            <GraduationCap size={17} />

            <span>
              Education
            </span>

          </button>


          {/* SKILLS */}

          <button
            type="button"
            className={
              isActive("/skills")
                ? "dashboard-nav-item active"
                : "dashboard-nav-item"
            }
            onClick={() =>
              goTo("/skills")
            }
          >

            <Code2 size={17} />

            <span>
              Skills
            </span>

          </button>


          {/* PROJECTS */}

          <button
            type="button"
            className={
              isActive("/projects")
                ? "dashboard-nav-item active"
                : "dashboard-nav-item"
            }
            onClick={() =>
              goTo("/projects")
            }
          >

            <Code2 size={17} />

            <span>
              Projects
            </span>

          </button>


          {/* CERTIFICATIONS */}

          <button
            type="button"
            className={
              isActive("/certifications")
                ? "dashboard-nav-item active"
                : "dashboard-nav-item"
            }
            onClick={() =>
              goTo("/certifications")
            }
          >

            <Award size={17} />

            <span>
              Certifications
            </span>

          </button>


          {/* INTERNSHIPS */}

          <button
            type="button"
            className={
              isActive("/internships")
                ? "dashboard-nav-item active"
                : "dashboard-nav-item"
            }
            onClick={() =>
              goTo("/internships")
            }
          >

            <Building2 size={17} />

            <span>
              Internships
            </span>

          </button>

        </nav>


        {/* ==================================================
            SIDEBAR USER
        ================================================== */}

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="sidebar-avatar">

              {student?.full_name
                ?.charAt(0)
                ?.toUpperCase() || "S"}

            </div>


            <div>

              <strong>
                {student?.full_name ||
                  "Student"}
              </strong>

              <span>
                {student?.branch ||
                  "Student"}
              </span>

            </div>

          </div>


          <button
            className="logout-button"
            onClick={handleLogout}
          >

            <LogOut size={16} />

            <span>
              Sign out
            </span>

          </button>

        </div>

      </aside>


      {/* ====================================================
          MAIN AREA
      ==================================================== */}

      <main className="dashboard-main">


        {/* ==================================================
            TOPBAR
        ================================================== */}

        <header className="dashboard-topbar">


          <button
            className="mobile-menu"
            onClick={() =>
              setSidebarOpen(true)
            }
          >

            <Menu size={21} />

          </button>


          <div className="topbar-title">

            <span>
              STUDENT WORKSPACE
            </span>

            <h1>
              Dashboard
            </h1>

          </div>


          <div className="topbar-actions">

            <button
              className="notification-button"
            >

              <Bell size={18} />

              <span></span>

            </button>


            <div className="topbar-avatar">

              {student?.full_name
                ?.charAt(0)
                ?.toUpperCase() || "S"}

            </div>

          </div>

        </header>


        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="dashboard-content">


          {/* ==================================================
              WELCOME
          ================================================== */}

          <section className="welcome-banner">

            <div className="welcome-glow"></div>


            <div className="welcome-content">

              <div className="welcome-eyebrow">

                <Sparkles size={14} />

                YOUR CAREER WORKSPACE

              </div>


              <h2>

                Welcome back,

                <br />

                <span>
                  {student?.full_name ||
                    "Student"}.
                </span>

              </h2>


              <p>

                Keep your profile updated
                and stay ready for your
                next campus opportunity.

              </p>

            </div>


            <div className="welcome-profile-card">

              <div className="profile-ring">

                <div>

                  {student?.full_name
                    ?.charAt(0)
                    ?.toUpperCase() || "S"}

                </div>

              </div>


              <div>

                <strong>
                  {student?.full_name}
                </strong>

                <span>
                  {student?.branch}
                </span>

              </div>

            </div>

          </section>


          {/* ==================================================
              STATISTICS
          ================================================== */}

          <section className="dashboard-stat-grid">


            {/* AVAILABLE JOBS */}

            <div className="dashboard-stat-card">

              <div className="stat-icon purple">

                <Briefcase size={18} />

              </div>

              <span>
                Available Jobs
              </span>

              <strong>
                {jobs.length}
              </strong>

              <small>
                Open opportunities
              </small>

            </div>


            {/* APPLICATIONS */}

            <div className="dashboard-stat-card">

              <div className="stat-icon cyan">

                <FileText size={18} />

              </div>

              <span>
                Applications
              </span>

              <strong>
                {applications.length}
              </strong>

              <small>
                Total submitted
              </small>

            </div>


            {/* SHORTLISTED */}

            <div className="dashboard-stat-card">

              <div className="stat-icon green">

                <CheckCircle2 size={18} />

              </div>

              <span>
                Shortlisted
              </span>

              <strong>
                {shortlistedCount}
              </strong>

              <small>
                Applications shortlisted
              </small>

            </div>


            {/* SELECTED */}

            <div className="dashboard-stat-card">

              <div className="stat-icon orange">

                <Sparkles size={18} />

              </div>

              <span>
                Selected
              </span>

              <strong>
                {selectedCount}
              </strong>

              <small>
                Final selections
              </small>

            </div>

          </section>


          {/* ==================================================
              PROFILE + APPLICATIONS
          ================================================== */}

          <section className="dashboard-two-column">


            {/* =================================================
                PROFILE
            ================================================= */}

            <div
              className="dashboard-panel"
              id="profile"
            >

              <div className="panel-header">

                <div>

                  <span>
                    PROFILE
                  </span>

                  <h3>
                    Academic Overview
                  </h3>

                </div>

                <UserRound size={19} />

              </div>


              <div className="academic-grid">


                <div>

                  <span>
                    Branch
                  </span>

                  <strong>
                    {student?.branch || "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Graduation
                  </span>

                  <strong>
                    {student?.graduation_year ||
                      "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    CGPA
                  </span>

                  <strong className="highlight-value">
                    {student?.cgpa || "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Backlogs
                  </span>

                  <strong>
                    {student?.backlogs ?? 0}
                  </strong>

                </div>

              </div>


              <div className="profile-status">

                <CheckCircle2 size={16} />

                <span>
                  Profile information available
                </span>

              </div>

            </div>


            {/* =================================================
                APPLICATION SUMMARY
            ================================================= */}

            <div className="dashboard-panel">

              <div className="panel-header">

                <div>

                  <span>
                    APPLICATIONS
                  </span>

                  <h3>
                    Recruitment Pipeline
                  </h3>

                </div>

                <FileText size={19} />

              </div>


              <div className="application-summary">


                <div>

                  <Clock3 size={17} />

                  <span>
                    Applied
                  </span>

                  <strong>
                    {appliedCount}
                  </strong>

                </div>


                <div>

                  <CheckCircle2 size={17} />

                  <span>
                    Shortlisted
                  </span>

                  <strong>
                    {shortlistedCount}
                  </strong>

                </div>


                <div>

                  <Briefcase size={17} />

                  <span>
                    Interview
                  </span>

                  <strong>
                    {interviewCount}
                  </strong>

                </div>


                <div>

                  <Award size={17} />

                  <span>
                    Selected
                  </span>

                  <strong>
                    {selectedCount}
                  </strong>

                </div>

              </div>

            </div>

          </section>


          {/* ==================================================
              JOB OPPORTUNITIES
          ================================================== */}

          <section
            className="dashboard-panel jobs-panel"
            id="jobs"
          >

            <div className="panel-header">

              <div>

                <span>
                  OPPORTUNITIES
                </span>

                <h3>
                  Available Jobs
                </h3>

              </div>

              <Briefcase size={19} />

            </div>


            {jobs.length === 0 ? (

              <div className="empty-state">

                <Briefcase size={28} />

                <p>
                  No job opportunities
                  available yet.
                </p>

              </div>

            ) : (

              <div className="jobs-list">

                {jobs
                  .slice(0, 6)
                  .map((job) => (

                    <div
                      className="job-row"
                      key={job.job_id}
                    >


                      <div className="job-company-icon">

                        {job.company_name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "C"}

                      </div>


                      <div className="job-info">

                        <strong>
                          {job.job_title}
                        </strong>

                        <span>
                          {job.company_name}
                        </span>

                      </div>


                      <div className="job-meta">

                        <span>

                          <MapPin size={13} />

                          {job.location ||
                            "India"}

                        </span>


                        <span>

                          <CalendarDays
                            size={13}
                          />

                          {job.application_deadline ||
                            "Open"}

                        </span>

                      </div>


                      <div className="job-cgpa">

                        <span>
                          MIN CGPA
                        </span>

                        <strong>
                          {job.minimum_cgpa}
                        </strong>

                      </div>


                      <button
                        className="job-view-button"
                        type="button"
                      >

                        View

                        <ChevronRight
                          size={15}
                        />

                      </button>

                    </div>

                  ))}

              </div>

            )}

          </section>


          {/* ==================================================
              PROFILE DATA
          ================================================== */}

          <section className="profile-data-grid">


            {/* =================================================
                SKILLS
            ================================================= */}

            <div
              className="dashboard-panel"
              id="skills"
            >

              <div className="panel-header">

                <div>

                  <span>
                    SKILLS
                  </span>

                  <h3>
                    Technical Skills
                  </h3>

                </div>

                <Code2 size={19} />

              </div>


              <div className="tag-list">

                {skills.length === 0 ? (

                  <span className="muted-text">
                    No skills added yet.
                  </span>

                ) : (

                  skills.map((skill) => (

                    <span
                      className="skill-tag"
                      key={skill.skill_id}
                    >

                      {skill.skill_name}

                    </span>

                  ))

                )}

              </div>

            </div>


            {/* =================================================
                PROJECTS
            ================================================= */}

            <div
              className="dashboard-panel"
              id="projects"
            >

              <div className="panel-header">

                <div>

                  <span>
                    PROJECTS
                  </span>

                  <h3>
                    Portfolio
                  </h3>

                </div>

                <Code2 size={19} />

              </div>


              <div className="mini-list">

                {projects.length === 0 ? (

                  <span className="muted-text">
                    No projects added yet.
                  </span>

                ) : (

                  projects
                    .slice(0, 3)
                    .map((project) => (

                      <div
                        className="mini-list-item"
                        key={project.project_id}
                      >

                        <strong>
                          {project.project_name}
                        </strong>

                        <span>
                          {project.technologies ||
                            "Technology"}
                        </span>

                      </div>

                    ))

                )}

              </div>

            </div>


            {/* =================================================
                CERTIFICATIONS
            ================================================= */}

            <div
              className="dashboard-panel"
              id="certifications"
            >

              <div className="panel-header">

                <div>

                  <span>
                    CERTIFICATIONS
                  </span>

                  <h3>
                    Credentials
                  </h3>

                </div>

                <Award size={19} />

              </div>


              <div className="mini-list">

                {certifications.length === 0 ? (

                  <span className="muted-text">
                    No certifications added yet.
                  </span>

                ) : (

                  certifications
                    .slice(0, 3)
                    .map((certificate) => (

                      <div
                        className="mini-list-item"
                        key={
                          certificate.certification_id
                        }
                      >

                        <strong>

                          {
                            certificate.certification_name
                          }

                        </strong>

                        <span>

                          {
                            certificate.issuing_organization
                          }

                        </span>

                      </div>

                    ))

                )}

              </div>

            </div>


            {/* =================================================
                INTERNSHIPS
            ================================================= */}

            <div
              className="dashboard-panel"
              id="internships"
            >

              <div className="panel-header">

                <div>

                  <span>
                    EXPERIENCE
                  </span>

                  <h3>
                    Internships
                  </h3>

                </div>

                <Building2 size={19} />

              </div>


              <div className="mini-list">

                {internships.length === 0 ? (

                  <span className="muted-text">
                    No internships added yet.
                  </span>

                ) : (

                  internships
                    .slice(0, 3)
                    .map((internship) => (

                      <div
                        className="mini-list-item"
                        key={
                          internship.internship_id
                        }
                      >

                        <strong>

                          {internship.role ||
                            "Intern"}

                        </strong>

                        <span>

                          {internship.company_name}

                        </span>

                      </div>

                    ))

                )}

              </div>

            </div>

          </section>


          {/* ==================================================
              FOOTER
          ================================================== */}

          <footer className="dashboard-footer">

            <span>
              CREMS · Student Workspace
            </span>

            <span>
              Campus Recruitment & Eligibility
              Management
            </span>

          </footer>

        </div>

      </main>

    </div>

  );

}


export default StudentDashboard;
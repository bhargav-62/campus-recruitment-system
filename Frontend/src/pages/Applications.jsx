import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  Menu,
  X,
  Clock3,
  CheckCircle2,
  XCircle,
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";

import { getStudents } from "../services/studentApi";
import { getStudentApplications } from "../services/applicationApi";


// ============================================================
// APPLICATIONS PAGE
// ============================================================

function Applications() {

  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [student, setStudent] = useState(null);

  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);


  // ==========================================================
  // LOAD APPLICATIONS
  // ==========================================================

  useEffect(() => {

    const loadApplications = async () => {

      try {

        const storedUser = JSON.parse(
          localStorage.getItem("crems_user") || "{}"
        );


        if (!storedUser.user_id) {

          navigate("/login");

          return;

        }


        // ----------------------------------------------------
        // GET STUDENT
        // ----------------------------------------------------

        const studentResponse =
          await getStudents();

        const students =
          studentResponse.students || [];

        const currentStudent =
          students.find(
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


        // ----------------------------------------------------
        // GET APPLICATIONS
        // ----------------------------------------------------

        const applicationResponse =
          await getStudentApplications(
            currentStudent.student_id
          );


        setApplications(
          applicationResponse.applications || []
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
          "Unable to load your applications."
        );

      }

      finally {

        setLoading(false);

      }

    };


    loadApplications();

  }, [navigate]);


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
  // NAVIGATION
  // ==========================================================

  const goTo = (path) => {

    setSidebarOpen(false);

    navigate(path);

  };


  // ==========================================================
  // STATUS CONFIGURATION
  // ==========================================================

  const getStatusClass = (status) => {

    switch (status) {

      case "APPLIED":
        return "application-status applied";

      case "SHORTLISTED":
        return "application-status shortlisted";

      case "ASSESSMENT":
        return "application-status assessment";

      case "INTERVIEW":
        return "application-status interview";

      case "SELECTED":
        return "application-status selected";

      case "REJECTED":
        return "application-status rejected";

      default:
        return "application-status";

    }

  };


  const getStatusIcon = (status) => {

    switch (status) {

      case "SELECTED":

        return (
          <CheckCircle2 size={15} />
        );

      case "REJECTED":

        return (
          <XCircle size={15} />
        );

      case "INTERVIEW":

        return (
          <BriefcaseBusiness size={15} />
        );

      case "ASSESSMENT":

        return (
          <Clock3 size={15} />
        );

      case "SHORTLISTED":

        return (
          <CheckCircle2 size={15} />
        );

      default:

        return (
          <Clock3 size={15} />
        );

    }

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="dashboard-loading">

        <LoaderCircle
          size={38}
          className="loading-spinner"
        />

        <div className="loading-text">
          Loading your applications...
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

          <XCircle size={38} />

          <h2>
            Applications unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            className="dashboard-primary-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Return to Dashboard
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


  const assessmentCount =
    applications.filter(
      (item) =>
        item.status === "ASSESSMENT"
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
  // PAGE
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

        {/* BRAND */}

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
            className="dashboard-nav-item"
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
            className="dashboard-nav-item"
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
            className="dashboard-nav-item active"
            onClick={() =>
              goTo("/applications")
            }
          >

            <FileText size={17} />

            <span>
              Applications
            </span>

          </button>


          {/* PROFILE */}

          <button
            type="button"
            className="dashboard-nav-item"
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

          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() =>
              goTo("/education")
            }
          >

            <GraduationCap size={17} />

            <span>
              Education
            </span>

          </button>


          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() =>
              goTo("/skills")
            }
          >

            <Code2 size={17} />

            <span>
              Skills
            </span>

          </button>


          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() =>
              goTo("/projects")
            }
          >

            <Code2 size={17} />

            <span>
              Projects
            </span>

          </button>


          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() =>
              goTo("/certifications")
            }
          >

            <Award size={17} />

            <span>
              Certifications
            </span>

          </button>


          <button
            type="button"
            className="dashboard-nav-item"
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
            USER
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
          MAIN
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
              Applications
            </h1>

          </div>


          <div className="topbar-actions">

            <button className="notification-button">

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
              PAGE INTRO
          ================================================== */}

          <section className="welcome-banner">

            <div className="welcome-glow"></div>


            <div className="welcome-content">

              <div className="welcome-eyebrow">

                <FileText size={14} />

                APPLICATION CENTER

              </div>


              <h2>

                Track your

                <br />

                <span>
                  applications.
                </span>

              </h2>


              <p>

                Follow every campus application
                from submission to final selection.

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


            <div className="dashboard-stat-card">

              <div className="stat-icon purple">

                <FileText size={18} />

              </div>

              <span>
                Total Applications
              </span>

              <strong>
                {applications.length}
              </strong>

              <small>
                Applications submitted
              </small>

            </div>


            <div className="dashboard-stat-card">

              <div className="stat-icon cyan">

                <Clock3 size={18} />

              </div>

              <span>
                Applied
              </span>

              <strong>
                {appliedCount}
              </strong>

              <small>
                Awaiting progress
              </small>

            </div>


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
                Shortlisted applications
              </small>

            </div>


            <div className="dashboard-stat-card">

              <div className="stat-icon orange">

                <Award size={18} />

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
              APPLICATION PIPELINE
          ================================================== */}

          <section className="dashboard-panel">

            <div className="panel-header">

              <div>

                <span>
                  APPLICATION PIPELINE
                </span>

                <h3>
                  Current Progress
                </h3>

              </div>

              <BriefcaseBusiness
                size={19}
              />

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

                <Clock3 size={17} />

                <span>
                  Assessment
                </span>

                <strong>
                  {assessmentCount}
                </strong>

              </div>


              <div>

                <BriefcaseBusiness
                  size={17}
                />

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

          </section>


          {/* ==================================================
              APPLICATION LIST
          ================================================== */}

          <section className="dashboard-panel applications-page-panel">

            <div className="panel-header">

              <div>

                <span>
                  YOUR APPLICATIONS
                </span>

                <h3>
                  Application History
                </h3>

              </div>

              <FileText size={19} />

            </div>


            {applications.length === 0 ? (

              <div className="empty-state">

                <FileText size={35} />

                <h3>
                  No applications yet
                </h3>

                <p>
                  Once you apply for a
                  recruitment opportunity,
                  it will appear here.
                </p>

                <button
                  type="button"
                  className="dashboard-primary-button"
                  onClick={() =>
                    navigate("/opportunities")
                  }
                >
                  Explore Opportunities
                </button>

              </div>

            ) : (

              <div className="applications-list">

                {applications.map(
                  (application) => (

                    <div
                      className="application-card"
                      key={
                        application.application_id
                      }
                    >

                      {/* COMPANY ICON */}

                      <div className="application-company-icon">

                        {application.company_name
                          ?.charAt(0)
                          ?.toUpperCase() || "C"}

                      </div>


                      {/* MAIN INFO */}

                      <div className="application-main-info">

                        <h4>
                          {application.job_title ||
                            "Job Opportunity"}
                        </h4>

                        <p>
                          {application.company_name ||
                            "Company"}
                        </p>


                        <div className="application-meta">

                          <span>

                            <MapPin
                              size={13}
                            />

                            {application.location ||
                              "India"}

                          </span>


                          <span>

                            <CalendarDays
                              size={13}
                            />

                            {application.application_date
                              ? new Date(
                                  application.application_date
                                ).toLocaleDateString()
                              : "Recently"}

                          </span>

                        </div>

                      </div>


                      {/* STATUS */}

                      <div className="application-status-wrapper">

                        <span
                          className={
                            getStatusClass(
                              application.status
                            )
                          }
                        >

                          {getStatusIcon(
                            application.status
                          )}

                          {application.status ||
                            "APPLIED"}

                        </span>

                      </div>


                      {/* VIEW */}

                      <button
                        type="button"
                        className="application-view-button"
                        onClick={() =>
                          navigate(
                            `/applications/${application.application_id}`
                          )
                        }
                      >

                        View

                        <ChevronRight
                          size={15}
                        />

                      </button>

                    </div>

                  )
                )}

              </div>

            )}

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


export default Applications;
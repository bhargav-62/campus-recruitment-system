import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  GraduationCap,
  MapPin,
  CalendarDays,
  ChevronDown,
  Activity,
} from "lucide-react";

import {
  getAdminDashboard,
  getAdminStudents,
  getAdminJobs,
  getAdminApplications,
  updateAdminApplicationStatus,
} from "../services/adminApi";


// ============================================================
// ADMIN DASHBOARD
// ============================================================

function AdminDashboard() {

  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] =
    useState("overview");

  const [updating, setUpdating] =
    useState(null);

  const [error, setError] =
    useState("");


  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  const token =
    localStorage.getItem("crems_token");

  const user = JSON.parse(
    localStorage.getItem("crems_user") || "{}"
  );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    if (
      !token ||
      user.role !== "ADMIN"
    ) {

      navigate("/login");

      return;
    }

    loadAdminData();

  }, []);


  // ==========================================================
  // LOAD ADMIN DATA
  // ==========================================================

  const loadAdminData = async () => {

    try {

      setLoading(true);
      setError("");


      const results =
        await Promise.all([
          getAdminDashboard(),
          getAdminStudents(),
          getAdminJobs(),
          getAdminApplications(),
        ]);


      // ------------------------------------------------------
      // STATISTICS
      // ------------------------------------------------------

      const statsResponse =
        results[0];

      const statsData =
        statsResponse?.data ||
        statsResponse?.statistics ||
        statsResponse ||
        {};


      // ------------------------------------------------------
      // STUDENTS
      // ------------------------------------------------------

      const studentsResponse =
        results[1];

      const studentsData =
        studentsResponse?.students ||
        studentsResponse?.data ||
        studentsResponse ||
        [];


      // ------------------------------------------------------
      // JOBS
      // ------------------------------------------------------

      const jobsResponse =
        results[2];

      const jobsData =
        jobsResponse?.jobs ||
        jobsResponse?.data ||
        jobsResponse ||
        [];


      // ------------------------------------------------------
      // APPLICATIONS
      // ------------------------------------------------------

      const applicationsResponse =
        results[3];

      const applicationsData =
        applicationsResponse?.applications ||
        applicationsResponse?.data ||
        applicationsResponse ||
        [];


      setStats(
        statsData &&
        typeof statsData === "object" &&
        !Array.isArray(statsData)
          ? statsData
          : {}
      );


      setStudents(
        Array.isArray(studentsData)
          ? studentsData
          : []
      );


      setJobs(
        Array.isArray(jobsData)
          ? jobsData
          : []
      );


      setApplications(
        Array.isArray(applicationsData)
          ? applicationsData
          : []
      );


    } catch (err) {

      console.error(
        "Admin dashboard error:",
        err
      );


      // ------------------------------------------------------
      // UNAUTHORIZED
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // FORBIDDEN
      // ------------------------------------------------------

      if (
        err.response?.status === 403
      ) {

        setError(
          "Admin access required."
        );

        return;
      }


      setError(
        err.response?.data?.message ||
        "Unable to load admin dashboard."
      );


    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // UPDATE APPLICATION STATUS
  // ==========================================================

  const updateApplicationStatus = async (
    applicationId,
    status
  ) => {

    try {

      setUpdating(applicationId);
      setError("");


      await updateAdminApplicationStatus(
        applicationId,
        status
      );


      await loadAdminData();


    } catch (err) {

      console.error(
        "Application status update error:",
        err.response?.data || err
      );


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


      if (
        err.response?.status === 403
      ) {

        setError(
          "Admin access required."
        );

        return;
      }


      setError(
        err.response?.data?.message ||
        "Unable to update application."
      );


    } finally {

      setUpdating(null);

    }

  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {

    localStorage.removeItem(
      "crems_token"
    );

    localStorage.removeItem(
      "crems_user"
    );

    navigate("/login");

  };


  // ==========================================================
  // SEARCH STUDENTS
  // ==========================================================

  const filteredStudents =
    students.filter((student) => {

      const value =
        search.toLowerCase().trim();


      return (
        student.full_name
          ?.toLowerCase()
          .includes(value) ||

        student.branch
          ?.toLowerCase()
          .includes(value) ||

        String(
          student.graduation_year || ""
        ).includes(value)
      );

    });


  // ==========================================================
  // SEARCH APPLICATIONS
  // ==========================================================

  const filteredApplications =
    applications.filter(
      (application) => {

        const value =
          search.toLowerCase().trim();


        return (
          application.student_name
            ?.toLowerCase()
            .includes(value) ||

          application.job_title
            ?.toLowerCase()
            .includes(value) ||

          application.company_name
            ?.toLowerCase()
            .includes(value)
        );

      }
    );


  // ==========================================================
  // GET STAT
  // ==========================================================

  const getStat = (...keys) => {

    for (const key of keys) {

      if (
        stats[key] !== undefined &&
        stats[key] !== null
      ) {

        return stats[key];

      }

    }

    return 0;

  };


  // ==========================================================
  // STATUS COUNT
  // ==========================================================

  const getApplicationCount = (
    status
  ) => {

    return applications.filter(
      (application) =>
        application.status === status
    ).length;

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="admin-loading">

        <div className="admin-spinner"></div>

        <p>
          Loading recruitment workspace...
        </p>

      </div>

    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="admin-page">


      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <aside className="admin-sidebar">


        {/* BRAND */}

        <div className="admin-brand">

          <div className="admin-brand-icon">
            C
          </div>


          <div>

            <strong>
              CREMS
            </strong>

            <span>
              Admin Portal
            </span>

          </div>

        </div>


        {/* SIDEBAR LABEL */}

        <div className="admin-section-label">

          WORKSPACE

        </div>


        {/* DASHBOARD */}

        <button
          className={
            activeTab === "overview"
              ? "admin-nav active"
              : "admin-nav"
          }
          onClick={() =>
            setActiveTab("overview")
          }
        >

          <LayoutDashboard
            size={18}
          />

          Dashboard

        </button>


        {/* STUDENTS */}

        <button
          className={
            activeTab === "students"
              ? "admin-nav active"
              : "admin-nav"
          }
          onClick={() =>
            setActiveTab("students")
          }
        >

          <Users size={18} />

          Students

        </button>


        {/* JOBS */}

        <button
          className={
            activeTab === "jobs"
              ? "admin-nav active"
              : "admin-nav"
          }
          onClick={() =>
            setActiveTab("jobs")
          }
        >

          <BriefcaseBusiness
            size={18}
          />

          Jobs

        </button>


        {/* APPLICATIONS */}

        <button
          className={
            activeTab === "applications"
              ? "admin-nav active"
              : "admin-nav"
          }
          onClick={() =>
            setActiveTab("applications")
          }
        >

          <FileText size={18} />

          Applications

        </button>


        {/* SIDEBAR BOTTOM */}

        <div className="admin-sidebar-bottom">


          <div className="admin-user">

            <div className="admin-user-avatar">
              A
            </div>


            <div>

              <strong>
                Administrator
              </strong>

              <span>
                {user.email || "Admin"}
              </span>

            </div>

          </div>


          <button
            className="admin-logout"
            onClick={logout}
          >

            <LogOut size={17} />

            Sign out

          </button>

        </div>

      </aside>



      {/* ====================================================
          MAIN
      ==================================================== */}

      <main className="admin-main">


        {/* TOPBAR */}

        <header className="admin-topbar">

          <div>

            <span>
              ADMINISTRATION
            </span>

            <h1>
              Recruitment Dashboard
            </h1>

          </div>


          <button
            className="admin-refresh"
            onClick={loadAdminData}
          >

            <RefreshCw size={16} />

            Refresh

          </button>

        </header>



        {/* ERROR */}

        {error && (

          <div className="admin-error">

            <XCircle size={18} />

            {error}

          </div>

        )}



        {/* ==================================================
            OVERVIEW
        ================================================== */}

        {activeTab === "overview" && (

          <div className="admin-content">


            {/* WELCOME */}

            <div className="admin-welcome">

              <div>

                <div className="admin-eyebrow">

                  <ShieldCheck
                    size={14}
                  />

                  RECRUITMENT COMMAND CENTER

                </div>


                <h2>

                  Manage your campus

                  <span>
                    {" "}recruitment.
                  </span>

                </h2>


                <p>

                  Monitor students,
                  opportunities,
                  applications, and
                  recruitment progress
                  from one workspace.

                </p>

              </div>


              <Activity
                className="admin-welcome-icon"
                size={80}
              />

            </div>



            {/* STATISTICS */}

            <div className="admin-stats">


              <AdminStat
                icon={
                  <Users size={20} />
                }
                label="Total Students"
                value={getStat(
                  "total_students",
                  "students",
                  "student_count"
                )}
              />


              <AdminStat
                icon={
                  <BriefcaseBusiness
                    size={20}
                  />
                }
                label="Total Jobs"
                value={getStat(
                  "total_jobs",
                  "jobs",
                  "job_count"
                )}
              />


              <AdminStat
                icon={
                  <FileText size={20} />
                }
                label="Applications"
                value={getStat(
                  "total_applications",
                  "applications",
                  "application_count"
                )}
              />


              <AdminStat
                icon={
                  <CheckCircle2
                    size={20}
                  />
                }
                label="Selected"
                value={getStat(
                  "selected",
                  "selected_students",
                  "selected_count"
                )}
              />

            </div>



            {/* APPLICATION STATUS */}

            <div className="admin-status-grid">


              <StatusCard
                label="Applied"
                value={
                  getApplicationCount(
                    "APPLIED"
                  )
                }
                icon={
                  <FileText size={18} />
                }
              />


              <StatusCard
                label="Shortlisted"
                value={
                  getApplicationCount(
                    "SHORTLISTED"
                  )
                }
                icon={
                  <CheckCircle2
                    size={18}
                  />
                }
              />


              <StatusCard
                label="Assessment"
                value={
                  getApplicationCount(
                    "ASSESSMENT"
                  )
                }
                icon={
                  <Clock3 size={18} />
                }
              />


              <StatusCard
                label="Interview"
                value={
                  getApplicationCount(
                    "INTERVIEW"
                  )
                }
                icon={
                  <BriefcaseBusiness
                    size={18}
                  />
                }
              />


              <StatusCard
                label="Rejected"
                value={
                  getApplicationCount(
                    "REJECTED"
                  )
                }
                icon={
                  <XCircle size={18} />
                }
              />

            </div>



            {/* RECENT APPLICATIONS */}

            <section className="admin-panel">


              <div className="admin-panel-header">

                <div>

                  <span>
                    RECRUITMENT ACTIVITY
                  </span>

                  <h3>
                    Recent Applications
                  </h3>

                </div>


                <button
                  onClick={() =>
                    setActiveTab(
                      "applications"
                    )
                  }
                >

                  View All

                </button>

              </div>


              {applications.length === 0 ? (

                <div className="admin-empty">

                  No applications found.

                </div>

              ) : (

                <div className="admin-table-wrap">

                  <table className="admin-table">

                    <thead>

                      <tr>

                        <th>
                          Student
                        </th>

                        <th>
                          Position
                        </th>

                        <th>
                          Company
                        </th>

                        <th>
                          Status
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {applications
                        .slice(0, 5)
                        .map(
                          (application) => (

                            <tr
                              key={
                                application.application_id
                              }
                            >

                              <td>

                                {
                                  application.student_name ||
                                  `Student #${application.student_id}`
                                }

                              </td>


                              <td>

                                {
                                  application.job_title ||
                                  "Job"
                                }

                              </td>


                              <td>

                                {
                                  application.company_name ||
                                  "Company"
                                }

                              </td>


                              <td>

                                <span
                                  className={`admin-status ${
                                    application.status?.toLowerCase()
                                  }`}
                                >

                                  {
                                    application.status
                                  }

                                </span>

                              </td>

                            </tr>

                          )
                        )}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          </div>

        )}



        {/* ==================================================
            STUDENTS
        ================================================== */}

        {activeTab === "students" && (

          <div className="admin-content">


            <AdminPageHeading
              eyebrow="STUDENT DIRECTORY"
              title="Students"
              description="View registered student profiles and academic information."
            />


            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search students or branches..."
            />


            <section className="admin-panel">

              <div className="admin-table-wrap">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        Student
                      </th>

                      <th>
                        Branch
                      </th>

                      <th>
                        Graduation
                      </th>

                      <th>
                        CGPA
                      </th>

                      <th>
                        Backlogs
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredStudents.length ===
                    0 ? (

                      <tr>

                        <td
                          colSpan="5"
                          style={{
                            textAlign:
                              "center",
                          }}
                        >

                          No students found.

                        </td>

                      </tr>

                    ) : (

                      filteredStudents.map(
                        (student) => (

                          <tr
                            key={
                              student.student_id
                            }
                          >

                            <td>

                              <div className="admin-student-cell">

                                <div>

                                  {student.full_name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    "S"}

                                </div>


                                <span>

                                  {
                                    student.full_name
                                  }

                                </span>

                              </div>

                            </td>


                            <td>

                              {student.branch}

                            </td>


                            <td>

                              {
                                student.graduation_year
                              }

                            </td>


                            <td>

                              <strong>

                                {student.cgpa}

                              </strong>

                            </td>


                            <td>

                              {student.backlogs ??
                                0}

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </section>

          </div>

        )}



        {/* ==================================================
            JOBS
        ================================================== */}

        {activeTab === "jobs" && (

          <div className="admin-content">


            <AdminPageHeading
              eyebrow="OPPORTUNITY MANAGEMENT"
              title="Jobs"
              description="Manage campus recruitment opportunities."
            />


            <section className="admin-jobs-grid">

              {jobs.map((job) => (

                <article
                  className="admin-job-card"
                  key={job.job_id}
                >


                  <div className="admin-job-logo">

                    {job.company_name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "C"}

                  </div>


                  <span className="admin-company">

                    {job.company_name}

                  </span>


                  <h3>

                    {job.job_title}

                  </h3>


                  <div className="admin-job-details">


                    <span>

                      <MapPin size={14} />

                      {job.location ||
                        "India"}

                    </span>


                    <span>

                      <GraduationCap
                        size={14}
                      />

                      CGPA{" "}

                      {job.minimum_cgpa ??
                        "0.00"}

                    </span>


                    <span>

                      <CalendarDays
                        size={14}
                      />

                      {job.application_deadline
                        ? new Date(
                            job.application_deadline
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "No deadline"}

                    </span>

                  </div>


                  <div className="admin-job-footer">

                    <span>

                      {job.employment_type ||
                        "Full Time"}

                    </span>


                    <span>

                      {job.maximum_backlogs ??
                        0}

                      {" "}backlogs

                    </span>

                  </div>

                </article>

              ))}

            </section>


            {jobs.length === 0 && (

              <div className="admin-empty">

                No jobs found.

              </div>

            )}

          </div>

        )}



        {/* ==================================================
            APPLICATIONS
        ================================================== */}

        {activeTab === "applications" && (

          <div className="admin-content">


            <AdminPageHeading
              eyebrow="APPLICATION MANAGEMENT"
              title="Applications"
              description="Review and update student recruitment progress."
            />


            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search students, jobs or companies..."
            />


            <section className="admin-panel">

              <div className="admin-table-wrap">

                <table className="admin-table">

                  <thead>

                    <tr>

                      <th>
                        Student
                      </th>

                      <th>
                        Position
                      </th>

                      <th>
                        Company
                      </th>

                      <th>
                        Applied
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Update
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredApplications.length ===
                    0 ? (

                      <tr>

                        <td
                          colSpan="6"
                          style={{
                            textAlign:
                              "center",
                          }}
                        >

                          No applications found.

                        </td>

                      </tr>

                    ) : (

                      filteredApplications.map(
                        (application) => (

                          <tr
                            key={
                              application.application_id
                            }
                          >

                            <td>

                              {
                                application.student_name ||
                                `Student #${application.student_id}`
                              }

                            </td>


                            <td>

                              {
                                application.job_title ||
                                "Job"
                              }

                            </td>


                            <td>

                              {
                                application.company_name ||
                                "Company"
                              }

                            </td>


                            <td>

                              {application.application_date
                                ? new Date(
                                    application.application_date
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "—"}

                            </td>


                            <td>

                              <span
                                className={`admin-status ${
                                  application.status?.toLowerCase()
                                }`}
                              >

                                {
                                  application.status
                                }

                              </span>

                            </td>


                            <td>

                              <div className="status-control">

                                <select
                                  value={
                                    application.status
                                  }
                                  disabled={
                                    updating ===
                                    application.application_id
                                  }
                                  onChange={(e) =>
                                    updateApplicationStatus(
                                      application.application_id,
                                      e.target.value
                                    )
                                  }
                                >

                                  <option value="APPLIED">
                                    Applied
                                  </option>

                                  <option value="SHORTLISTED">
                                    Shortlisted
                                  </option>

                                  <option value="ASSESSMENT">
                                    Assessment
                                  </option>

                                  <option value="INTERVIEW">
                                    Interview
                                  </option>

                                  <option value="SELECTED">
                                    Selected
                                  </option>

                                  <option value="REJECTED">
                                    Rejected
                                  </option>

                                </select>


                                <ChevronDown
                                  size={13}
                                />

                              </div>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </section>

          </div>

        )}

      </main>

    </div>

  );

}


// ============================================================
// ADMIN STAT
// ============================================================

function AdminStat({
  icon,
  label,
  value,
}) {

  return (

    <div className="admin-stat-card">

      <div className="admin-stat-icon">

        {icon}

      </div>


      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>

  );

}


// ============================================================
// STATUS CARD
// ============================================================

function StatusCard({
  icon,
  label,
  value,
}) {

  return (

    <div className="admin-status-card">

      {icon}

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>

  );

}


// ============================================================
// PAGE HEADING
// ============================================================

function AdminPageHeading({
  eyebrow,
  title,
  description,
}) {

  return (

    <div className="admin-page-heading">

      <span>
        {eyebrow}
      </span>


      <h2>
        {title}
      </h2>


      <p>
        {description}
      </p>

    </div>

  );

}


// ============================================================
// SEARCH
// ============================================================

function AdminSearch({
  value,
  onChange,
  placeholder,
}) {

  return (

    <div className="admin-search">

      <Search size={17} />


      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
      />

    </div>

  );

}


export default AdminDashboard;
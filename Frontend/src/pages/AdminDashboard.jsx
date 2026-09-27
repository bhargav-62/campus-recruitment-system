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
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Settings2,
} from "lucide-react";

import {
  getAdminDashboard,
  getAdminStudents,
  getAdminJobs,
  getAdminApplications,
  updateAdminApplicationStatus,
} from "../services/adminApi";

import {
  createAdminJob,
  updateAdminJob,
  deleteAdminJob,
  getAdminJobEligibility,
  updateJobEligibility,
} from "../services/jobAdminApi";

import api from "../services/api";


function AdminDashboard() {

  const navigate = useNavigate();

  // ============================================================
  // MAIN DATA
  // ============================================================

  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  // ============================================================
  // PAGE STATE
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  // ============================================================
  // JOB MANAGEMENT STATE
  // ============================================================

  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [deletingJob, setDeletingJob] = useState(null);

  const [jobForm, setJobForm] = useState({
    job_title: "",
    company_name: "",
    job_description: "",
    location: "",
    employment_type: "Full Time",
    minimum_cgpa: "",
    maximum_backlogs: 0,
    graduation_year: 2027,
    application_deadline: "",
    allowed_branches: "CSE,CSE AI ML,IT",
    required_skills: "Python,SQL",
    minimum_percentage: 60,
  });

  // ============================================================
  // ELIGIBILITY EDIT STATE
  // ============================================================

  const [showEligibilityForm, setShowEligibilityForm] =
    useState(false);

  const [eligibilityJob, setEligibilityJob] =
    useState(null);

  const [eligibilityForm, setEligibilityForm] =
    useState({
      allowed_branches: "",
      required_skills: "",
      minimum_percentage: "",
    });

  const [eligibilityLoading, setEligibilityLoading] =
    useState(false);

  // ============================================================
  // CURRENT USER
  // ============================================================

  const token = localStorage.getItem("crems_token");

  const user = JSON.parse(
    localStorage.getItem("crems_user") || "{}"
  );

  // ============================================================
  // LOAD ADMIN DATA
  // ============================================================

  useEffect(() => {

    if (!token || user.role !== "ADMIN") {
      navigate("/login");
      return;
    }

    loadAdminData();

  }, []);

  const loadAdminData = async () => {

    try {

      setLoading(true);
      setError("");

      const results = await Promise.all([
        getAdminDashboard(),
        getAdminStudents(),
        getAdminJobs(),
        getAdminApplications(),
      ]);

      const statsData =
        results[0]?.data ||
        results[0]?.statistics ||
        results[0] ||
        {};

      const studentsData =
        results[1]?.students ||
        results[1]?.data ||
        results[1] ||
        [];

      const jobsData =
        results[2]?.jobs ||
        results[2]?.data ||
        results[2] ||
        [];

      const applicationsData =
        results[3]?.applications ||
        results[3]?.data ||
        results[3] ||
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

      if (err.response?.status === 401) {

        localStorage.removeItem(
          "crems_token"
        );

        localStorage.removeItem(
          "crems_user"
        );

        navigate("/login");

        return;
      }

      if (err.response?.status === 403) {

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

  // ============================================================
  // UPDATE APPLICATION STATUS
  // ============================================================

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
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to update application."
      );

    } finally {

      setUpdating(null);

    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {

    localStorage.removeItem(
      "crems_token"
    );

    localStorage.removeItem(
      "crems_user"
    );

    navigate("/login");
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredStudents =
    students.filter((student) => {

      const value =
        search.toLowerCase();

      return (
        student.full_name
          ?.toLowerCase()
          .includes(value) ||

        student.branch
          ?.toLowerCase()
          .includes(value)
      );

    });

  const filteredApplications =
    applications.filter(
      (application) => {

        const value =
          search.toLowerCase();

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

  // ============================================================
  // STAT HELPER
  // ============================================================

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

  // ============================================================
  // OPEN CREATE JOB FORM
  // ============================================================

  const openCreateJobForm = () => {

    setEditingJob(null);

    setJobForm({
      job_title: "",
      company_name: "",
      job_description: "",
      location: "",
      employment_type: "Full Time",
      minimum_cgpa: "",
      maximum_backlogs: 0,
      graduation_year: 2027,
      application_deadline: "",
      allowed_branches:
        "CSE,CSE AI ML,IT",
      required_skills:
        "Python,SQL",
      minimum_percentage: 60,
    });

    setShowJobForm(true);
  };

  // ============================================================
  // OPEN EDIT JOB FORM
  // ============================================================

  const openEditJobForm = async (job) => {

    setEditingJob(job);

    setJobForm({
      job_title:
        job.job_title || "",

      company_name:
        job.company_name || "",

      job_description:
        job.job_description || "",

      location:
        job.location || "",

      employment_type:
        job.employment_type ||
        "Full Time",

      minimum_cgpa:
        job.minimum_cgpa ?? "",

      maximum_backlogs:
        job.maximum_backlogs ?? 0,

      graduation_year:
        job.graduation_year ||
        2027,

      application_deadline:
        job.application_deadline
          ? String(
              job.application_deadline
            ).substring(0, 10)
          : "",

      allowed_branches:
        "CSE,CSE AI ML,IT",

      required_skills:
        "Python,SQL",

      minimum_percentage:
        60,
    });

    setShowJobForm(true);

    try {

      const result =
        await getAdminJobEligibility(
          job.job_id
        );

      const eligibility =
        result?.eligibility ||
        result?.data ||
        result;

      if (eligibility) {

        setJobForm((previous) => ({
          ...previous,

          allowed_branches:
            eligibility.allowed_branches ||
            "",

          required_skills:
            eligibility.required_skills ||
            "",

          minimum_percentage:
            eligibility.minimum_percentage ??
            60,
        }));

      }

    } catch (err) {

      console.warn(
        "Could not load eligibility rules:",
        err
      );

    }
  };

  // ============================================================
  // JOB FORM INPUT
  // ============================================================

  const handleJobInputChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setJobForm((previous) => ({
      ...previous,
      [name]: value,
    }));

  };

  // ============================================================
  // CREATE / UPDATE JOB
  // ============================================================

  const handleJobSubmit = async (event) => {

    event.preventDefault();

    try {

      setJobLoading(true);
      setError("");

      if (!jobForm.job_title.trim()) {

        setError(
          "Job title is required."
        );

        return;
      }

      if (!jobForm.company_name.trim()) {

        setError(
          "Company name is required."
        );

        return;
      }

      const jobData = {

        job_title:
          jobForm.job_title.trim(),

        company_name:
          jobForm.company_name.trim(),

        job_description:
          jobForm.job_description.trim(),

        location:
          jobForm.location.trim(),

        employment_type:
          jobForm.employment_type,

        minimum_cgpa:
          Number(
            jobForm.minimum_cgpa || 0
          ),

        maximum_backlogs:
          Number(
            jobForm.maximum_backlogs || 0
          ),

        graduation_year:
          Number(
            jobForm.graduation_year
          ),

        application_deadline:
          jobForm.application_deadline ||
          null,
      };

      let jobId;

      if (editingJob) {

        await updateAdminJob(
          editingJob.job_id,
          jobData
        );

        jobId =
          editingJob.job_id;

      } else {

        const result =
          await createAdminJob(
            jobData
          );

        jobId =
          result?.job_id ||
          result?.data?.job_id;

      }

      if (jobId) {

        const eligibilityData = {

          allowed_branches:
            jobForm.allowed_branches
              .trim(),

          required_skills:
            jobForm.required_skills
              .trim(),

          minimum_percentage:
            Number(
              jobForm.minimum_percentage ||
              0
            ),
        };

        if (editingJob) {

          try {

            await updateJobEligibility(
              jobId,
              eligibilityData
            );

          } catch (eligibilityError) {

            console.warn(
              "Eligibility update failed:",
              eligibilityError
            );

          }

        } else {

          try {

            await api.post(
              `/jobs/${jobId}/eligibility`,
              eligibilityData
            );

          } catch (eligibilityError) {

            console.warn(
              "Eligibility creation failed:",
              eligibilityError
            );

          }

        }

      }

      setShowJobForm(false);
      setEditingJob(null);

      await loadAdminData();

      alert(
        editingJob
          ? "Job updated successfully!"
          : "Job created successfully!"
      );

    } catch (err) {

      console.error(
        "Job save error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to save job."
      );

    } finally {

      setJobLoading(false);

    }
  };

  // ============================================================
  // DELETE JOB
  // ============================================================

  const handleDeleteJob = async (
    jobId
  ) => {

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this job?"
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingJob(jobId);
      setError("");

      await deleteAdminJob(
        jobId
      );

      await loadAdminData();

      alert(
        "Job deleted successfully!"
      );

    } catch (err) {

      console.error(
        "Delete job error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to delete job."
      );

    } finally {

      setDeletingJob(null);

    }
  };

  // ============================================================
  // OPEN ELIGIBILITY FORM
  // ============================================================

  const openEligibilityForm =
    async (job) => {

      try {

        setEligibilityLoading(true);

        setEligibilityJob(job);

        const result =
          await getAdminJobEligibility(
            job.job_id
          );

        const eligibility =
          result?.eligibility ||
          result?.data ||
          result;

        setEligibilityForm({

          allowed_branches:
            eligibility?.allowed_branches ||
            "",

          required_skills:
            eligibility?.required_skills ||
            "",

          minimum_percentage:
            eligibility?.minimum_percentage ??
            60,
        });

        setShowEligibilityForm(
          true
        );

      } catch (err) {

        console.error(
          "Eligibility loading error:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Unable to load eligibility rules."
        );

      } finally {

        setEligibilityLoading(false);

      }
    };

  // ============================================================
  // UPDATE ELIGIBILITY
  // ============================================================

  const handleEligibilitySubmit =
    async (event) => {

      event.preventDefault();

      if (!eligibilityJob) {
        return;
      }

      try {

        setEligibilityLoading(true);

        await updateJobEligibility(
          eligibilityJob.job_id,
          {
            allowed_branches:
              eligibilityForm
                .allowed_branches
                .trim(),

            required_skills:
              eligibilityForm
                .required_skills
                .trim(),

            minimum_percentage:
              Number(
                eligibilityForm
                  .minimum_percentage ||
                0
              ),
          }
        );

        setShowEligibilityForm(
          false
        );

        setEligibilityJob(null);

        alert(
          "Eligibility rules updated successfully!"
        );

      } catch (err) {

        console.error(
          "Eligibility update error:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Unable to update eligibility rules."
        );

      } finally {

        setEligibilityLoading(false);

      }
    };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

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

  // ============================================================
  // MAIN UI
  // ============================================================

  return (

    <div className="admin-page">

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="admin-sidebar">

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


        <div className="admin-section-label">
          WORKSPACE
        </div>


        <button
          className={
            activeTab === "overview"
              ? "admin-nav active"
              : "admin-nav"
          }
          onClick={() =>
            setActiveTab(
              "overview"
            )
          }
        >

          <LayoutDashboard
            size={18}
          />

          Dashboard

        </button>


        <button
          className={
            activeTab === "students"
              ? "admin-nav active"
              : "admin-nav"
          }
          onClick={() =>
            setActiveTab(
              "students"
            )
          }
        >

          <Users size={18} />

          Students

        </button>


        <button
          className={
            activeTab === "jobs"
              ? "admin-nav active"
              : "admin-nav"
          }
          onClick={() =>
            setActiveTab(
              "jobs"
            )
          }
        >

          <BriefcaseBusiness
            size={18}
          />

          Jobs

        </button>


        <button
          className={
            activeTab === "applications"
              ? "admin-nav active"
              : "admin-nav"
          }
          onClick={() =>
            setActiveTab(
              "applications"
            )
          }
        >

          <FileText size={18} />

          Applications

        </button>


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


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="admin-main">

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


        {error && (

          <div className="admin-error">

            <XCircle size={18} />

            {error}

            <button
              onClick={() =>
                setError("")
              }
              style={{
                marginLeft: "auto",
                border: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>

          </div>

        )}


        {/* ====================================================
            OVERVIEW
        ==================================================== */}

        {activeTab === "overview" && (

          <div className="admin-content">

            <div className="admin-welcome">

              <div>

                <div className="admin-eyebrow">

                  <ShieldCheck
                    size={14}
                  />

                  RECRUITMENT COMMAND
                  CENTER

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


            <div className="admin-status-grid">

              <StatusCard
                label="Applied"
                value={
                  applications.filter(
                    (a) =>
                      a.status ===
                      "APPLIED"
                  ).length
                }
                icon={
                  <FileText size={18} />
                }
              />


              <StatusCard
                label="Shortlisted"
                value={
                  applications.filter(
                    (a) =>
                      a.status ===
                      "SHORTLISTED"
                  ).length
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
                  applications.filter(
                    (a) =>
                      a.status ===
                      "ASSESSMENT"
                  ).length
                }
                icon={
                  <Clock3 size={18} />
                }
              />


              <StatusCard
                label="Interview"
                value={
                  applications.filter(
                    (a) =>
                      a.status ===
                      "INTERVIEW"
                  ).length
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
                  applications.filter(
                    (a) =>
                      a.status ===
                      "REJECTED"
                  ).length
                }
                icon={
                  <XCircle size={18} />
                }
              />

            </div>


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
                          (
                            application
                          ) => (

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
                                  className={`admin-status ${application.status?.toLowerCase()}`}
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


        {/* ====================================================
            STUDENTS
        ==================================================== */}

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

                    {filteredStudents.map(
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
                                  ?.toUpperCase()}
                              </div>

                              <span>
                                {
                                  student.full_name
                                }
                              </span>

                            </div>

                          </td>

                          <td>
                            {
                              student.branch
                            }
                          </td>

                          <td>
                            {
                              student.graduation_year
                            }
                          </td>

                          <td>

                            <strong>
                              {
                                student.cgpa
                              }
                            </strong>

                          </td>

                          <td>
                            {
                              student.backlogs ??
                              0
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </section>

          </div>

        )}


        {/* ====================================================
            JOBS
        ==================================================== */}

        {activeTab === "jobs" && (

          <div className="admin-content">

            <div
              className="admin-page-heading"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >

              <div>

                <span>
                  OPPORTUNITY MANAGEMENT
                </span>

                <h2>
                  Jobs
                </h2>

                <p>
                  Create, edit and manage
                  campus recruitment
                  opportunities.
                </p>

              </div>


              <button
                className="admin-primary-button"
                onClick={
                  openCreateJobForm
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "11px 18px",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >

                <Plus size={17} />

                Create Job

              </button>

            </div>


            <section className="admin-jobs-grid">

              {jobs.map((job) => (

                <article
                  className="admin-job-card"
                  key={job.job_id}
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >

                    <div className="admin-job-logo">
                      {job.company_name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "C"}
                    </div>


                    {/* VISIBLE EDIT / DELETE BUTTONS */}

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >

                      <button
                        type="button"
                        title="Edit job"
                        aria-label="Edit job"
                        onClick={() =>
                          openEditJobForm(
                            job
                          )
                        }
                        style={{
                          border:
                            "1px solid #8b5cf6",
                          background:
                            "#1e1638",
                          color:
                            "#a78bfa",
                          cursor:
                            "pointer",
                          padding:
                            "8px",
                          borderRadius:
                            "8px",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                        }}
                      >

                        <Pencil
                          size={16}
                        />

                      </button>


                      <button
                        type="button"
                        title="Delete job"
                        aria-label="Delete job"
                        disabled={
                          deletingJob ===
                          job.job_id
                        }
                        onClick={() =>
                          handleDeleteJob(
                            job.job_id
                          )
                        }
                        style={{
                          border:
                            "1px solid #ef4444",
                          background:
                            "#35151a",
                          color:
                            "#f87171",
                          cursor:
                            deletingJob ===
                            job.job_id
                              ? "wait"
                              : "pointer",
                          padding:
                            "8px",
                          borderRadius:
                            "8px",
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "center",
                          opacity:
                            deletingJob ===
                            job.job_id
                              ? 0.6
                              : 1,
                        }}
                      >

                        <Trash2
                          size={16}
                        />

                      </button>

                    </div>

                  </div>


                  <span className="admin-company">
                    {
                      job.company_name
                    }
                  </span>


                  <h3>
                    {
                      job.job_title
                    }
                  </h3>


                  <div className="admin-job-details">

                    <span>

                      <MapPin
                        size={14}
                      />

                      {
                        job.location ||
                        "India"
                      }

                    </span>


                    <span>

                      <GraduationCap
                        size={14}
                      />

                      CGPA{" "}
                      {
                        job.minimum_cgpa
                      }

                    </span>


                    <span>

                      <CalendarDays
                        size={14}
                      />

                      {
                        job.application_deadline
                          ? new Date(
                              job.application_deadline
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "No deadline"
                      }

                    </span>

                  </div>


                  <div className="admin-job-footer">

                    <span>
                      {
                        job.employment_type ||
                        "Full Time"
                      }
                    </span>

                    <span>
                      {
                        job.maximum_backlogs ??
                        0
                      }{" "}
                      backlogs
                    </span>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      openEligibilityForm(
                        job
                      )
                    }
                    style={{
                      marginTop: "14px",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      gap: "7px",
                      padding: "9px",
                      borderRadius:
                        "8px",
                      border:
                        "1px solid #dbe2ea",
                      background:
                        "#f8fafc",
                      cursor:
                        "pointer",
                      fontWeight: 600,
                    }}
                  >

                    <Settings2
                      size={15}
                    />

                    Eligibility Rules

                  </button>

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


        {/* ====================================================
            APPLICATIONS
        ==================================================== */}

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

                    {filteredApplications.map(
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

                            {
                              application.application_date
                                ? new Date(
                                    application.application_date
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "—"
                            }

                          </td>

                          <td>

                            <span
                              className={`admin-status ${application.status?.toLowerCase()}`}
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
                    )}

                  </tbody>

                </table>

              </div>

            </section>

          </div>

        )}

      </main>


      {/* ======================================================
          CREATE / EDIT JOB MODAL
      ====================================================== */}

      {showJobForm && (

        <div
          className="admin-modal-overlay"
          onClick={() =>
            !jobLoading &&
            setShowJobForm(false)
          }
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >

          <div
            className="admin-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "min(760px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              padding: "26px",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.2)",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "22px",
              }}
            >

              <div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing:
                      "0.08em",
                  }}
                >
                  OPPORTUNITY MANAGEMENT
                </span>

                <h2
                  style={{
                    margin:
                      "5px 0 0",
                  }}
                >
                  {editingJob
                    ? "Edit Job"
                    : "Create Job"}
                </h2>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowJobForm(
                    false
                  )
                }
                disabled={jobLoading}
                style={{
                  border: "none",
                  background:
                    "#f1f5f9",
                  borderRadius: "8px",
                  padding: "8px",
                  cursor: "pointer",
                }}
              >

                <X size={18} />

              </button>

            </div>


            <form
              onSubmit={
                handleJobSubmit
              }
            >

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "16px",
                }}
              >

                <FormField
                  label="Job Title"
                  name="job_title"
                  value={
                    jobForm.job_title
                  }
                  onChange={
                    handleJobInputChange
                  }
                  placeholder="Graduate Software Engineer"
                  required
                />


                <FormField
                  label="Company Name"
                  name="company_name"
                  value={
                    jobForm.company_name
                  }
                  onChange={
                    handleJobInputChange
                  }
                  placeholder="LTI Mindtree"
                  required
                />


                <FormField
                  label="Location"
                  name="location"
                  value={
                    jobForm.location
                  }
                  onChange={
                    handleJobInputChange
                  }
                  placeholder="Bengaluru"
                />


                <FormField
                  label="Employment Type"
                  name="employment_type"
                  value={
                    jobForm.employment_type
                  }
                  onChange={
                    handleJobInputChange
                  }
                  placeholder="Full Time"
                />


                <FormField
                  label="Minimum CGPA"
                  name="minimum_cgpa"
                  type="number"
                  step="0.01"
                  value={
                    jobForm.minimum_cgpa
                  }
                  onChange={
                    handleJobInputChange
                  }
                  placeholder="7.50"
                />


                <FormField
                  label="Maximum Backlogs"
                  name="maximum_backlogs"
                  type="number"
                  value={
                    jobForm.maximum_backlogs
                  }
                  onChange={
                    handleJobInputChange
                  }
                  placeholder="0"
                />


                <FormField
                  label="Graduation Year"
                  name="graduation_year"
                  type="number"
                  value={
                    jobForm.graduation_year
                  }
                  onChange={
                    handleJobInputChange
                  }
                  placeholder="2027"
                />


                <FormField
                  label="Application Deadline"
                  name="application_deadline"
                  type="date"
                  value={
                    jobForm.application_deadline
                  }
                  onChange={
                    handleJobInputChange
                  }
                />

              </div>


              <div
                style={{
                  marginTop: "16px",
                }}
              >

                <label
                  style={{
                    display: "block",
                    fontWeight: 600,
                    marginBottom: "7px",
                  }}
                >
                  Job Description
                </label>

                <textarea
                  name="job_description"
                  value={
                    jobForm.job_description
                  }
                  onChange={
                    handleJobInputChange
                  }
                  rows={4}
                  placeholder="Describe the role, responsibilities and requirements..."
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding: "11px",
                    border:
                      "1px solid #dbe2ea",
                    borderRadius:
                      "9px",
                    resize: "vertical",
                    fontFamily:
                      "inherit",
                  }}
                />

              </div>


              <div
                style={{
                  marginTop: "22px",
                  paddingTop: "20px",
                  borderTop:
                    "1px solid #e5e7eb",
                }}
              >

                <h3
                  style={{
                    marginTop: 0,
                    marginBottom:
                      "15px",
                  }}
                >
                  Eligibility Rules
                </h3>


                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "16px",
                  }}
                >

                  <FormField
                    label="Allowed Branches"
                    name="allowed_branches"
                    value={
                      jobForm.allowed_branches
                    }
                    onChange={
                      handleJobInputChange
                    }
                    placeholder="CSE,CSE AI ML,IT"
                  />


                  <FormField
                    label="Required Skills"
                    name="required_skills"
                    value={
                      jobForm.required_skills
                    }
                    onChange={
                      handleJobInputChange
                    }
                    placeholder="Python,SQL"
                  />


                  <FormField
                    label="Minimum Percentage"
                    name="minimum_percentage"
                    type="number"
                    step="0.01"
                    value={
                      jobForm.minimum_percentage
                    }
                    onChange={
                      handleJobInputChange
                    }
                    placeholder="60"
                  />

                </div>


                <p
                  style={{
                    marginBottom: 0,
                    fontSize: "12px",
                    color: "#64748b",
                  }}
                >
                  Separate multiple branches
                  or skills with commas.
                </p>

              </div>


              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop: "24px",
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowJobForm(
                      false
                    )
                  }
                  disabled={jobLoading}
                  style={{
                    padding:
                      "10px 18px",
                    border:
                      "1px solid #dbe2ea",
                    background:
                      "#ffffff",
                    borderRadius: "9px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={jobLoading}
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "7px",
                    padding:
                      "10px 18px",
                    border: "none",
                    background:
                      "#111827",
                    color: "#ffffff",
                    borderRadius: "9px",
                    cursor:
                      jobLoading
                        ? "wait"
                        : "pointer",
                    fontWeight: 600,
                  }}
                >

                  <Save size={16} />

                  {jobLoading
                    ? "Saving..."
                    : editingJob
                    ? "Update Job"
                    : "Create Job"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          ELIGIBILITY MODAL
      ====================================================== */}

      {showEligibilityForm && (

        <div
          className="admin-modal-overlay"
          onClick={() =>
            !eligibilityLoading &&
            setShowEligibilityForm(
              false
            )
          }
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display: "flex",
            justifyContent:
              "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1001,
          }}
        >

          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width:
                "min(560px, 100%)",
              background:
                "#ffffff",
              borderRadius: "18px",
              padding: "26px",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.2)",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom:
                  "20px",
              }}
            >

              <div>

                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing:
                      "0.08em",
                  }}
                >
                  ELIGIBILITY
                </span>

                <h2
                  style={{
                    margin:
                      "5px 0 0",
                  }}
                >
                  Eligibility Rules
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#64748b",
                  }}
                >
                  {
                    eligibilityJob?.job_title
                  }
                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  setShowEligibilityForm(
                    false
                  )
                }
                disabled={
                  eligibilityLoading
                }
                style={{
                  border: "none",
                  background:
                    "#f1f5f9",
                  borderRadius: "8px",
                  padding: "8px",
                  cursor:
                    "pointer",
                }}
              >

                <X size={18} />

              </button>

            </div>


            <form
              onSubmit={
                handleEligibilitySubmit
              }
            >

              <FormField
                label="Allowed Branches"
                name="allowed_branches"
                value={
                  eligibilityForm.allowed_branches
                }
                onChange={(event) =>
                  setEligibilityForm(
                    (previous) => ({
                      ...previous,
                      allowed_branches:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="CSE,CSE AI ML,IT"
              />


              <div
                style={{
                  height: "14px",
                }}
              />


              <FormField
                label="Required Skills"
                name="required_skills"
                value={
                  eligibilityForm.required_skills
                }
                onChange={(event) =>
                  setEligibilityForm(
                    (previous) => ({
                      ...previous,
                      required_skills:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="Python,SQL"
              />


              <div
                style={{
                  height: "14px",
                }}
              />


              <FormField
                label="Minimum Percentage"
                name="minimum_percentage"
                type="number"
                step="0.01"
                value={
                  eligibilityForm.minimum_percentage
                }
                onChange={(event) =>
                  setEligibilityForm(
                    (previous) => ({
                      ...previous,
                      minimum_percentage:
                        event.target
                          .value,
                    })
                  )
                }
                placeholder="60"
              />


              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop:
                    "24px",
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowEligibilityForm(
                      false
                    )
                  }
                  disabled={
                    eligibilityLoading
                  }
                  style={{
                    padding:
                      "10px 18px",
                    border:
                      "1px solid #dbe2ea",
                    background:
                      "#ffffff",
                    borderRadius:
                      "9px",
                    cursor:
                      "pointer",
                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={
                    eligibilityLoading
                  }
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "7px",
                    padding:
                      "10px 18px",
                    border: "none",
                    background:
                      "#111827",
                    color:
                      "#ffffff",
                    borderRadius:
                      "9px",
                    cursor:
                      eligibilityLoading
                        ? "wait"
                        : "pointer",
                    fontWeight: 600,
                  }}
                >

                  <Save size={16} />

                  {eligibilityLoading
                    ? "Saving..."
                    : "Save Rules"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}


/* ============================================================
   FORM FIELD
============================================================ */

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  step,
}) {

  return (

    <div>

      <label
        style={{
          display: "block",
          fontWeight: 600,
          marginBottom: "7px",
        }}
      >
        {label}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        step={step}
        style={{
          width: "100%",
          boxSizing:
            "border-box",
          padding: "11px",
          border:
            "1px solid #dbe2ea",
          borderRadius: "9px",
          fontFamily:
            "inherit",
          outline: "none",
        }}
      />

    </div>

  );
}


/* ============================================================
   ADMIN STAT
============================================================ */

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


/* ============================================================
   STATUS CARD
============================================================ */

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


/* ============================================================
   PAGE HEADING
============================================================ */

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


/* ============================================================
   SEARCH
============================================================ */

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
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
      />

    </div>

  );

}


export default AdminDashboard;
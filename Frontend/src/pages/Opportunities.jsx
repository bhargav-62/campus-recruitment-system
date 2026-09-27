import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  Search,
  Sparkles,
  X,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import { getStudents } from "../services/studentApi";

import {
  getJobs,
  checkStudentEligibility,
} from "../services/jobApi";

import {
  applyForJob as submitApplication,
  getStudentApplications,
} from "../services/applicationApi";


// ============================================================
// OPPORTUNITIES PAGE
// ============================================================

function Opportunities() {

  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [jobs, setJobs] = useState([]);

  const [student, setStudent] = useState(null);

  const [applications, setApplications] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [applying, setApplying] = useState(null);

  const [checkingEligibility, setCheckingEligibility] =
    useState(null);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {

    loadData();

  }, []);


  const loadData = async () => {

    try {

      setLoading(true);

      setMessage("");


      // ------------------------------------------------------
      // GET LOGGED-IN USER
      // ------------------------------------------------------

      const token =
        localStorage.getItem("crems_token");

      const storedUser =
        JSON.parse(
          localStorage.getItem(
            "crems_user"
          ) || "{}"
        );


      if (
        !token ||
        !storedUser.user_id
      ) {

        navigate("/login");

        return;

      }


      // ------------------------------------------------------
      // GET STUDENTS
      // ------------------------------------------------------

      const studentsResponse =
        await getStudents();


      const students =
        studentsResponse.students ||
        studentsResponse.data ||
        studentsResponse ||
        [];


      const studentList =
        Array.isArray(students)
          ? students
          : [];


      const currentStudent =
        studentList.find(
          (item) =>
            Number(item.user_id) ===
            Number(storedUser.user_id)
        );


      if (!currentStudent) {

        setMessage(
          "Student profile not found."
        );

        setMessageType("error");

        return;

      }


      setStudent(currentStudent);


      // ------------------------------------------------------
      // GET JOBS + APPLICATIONS
      // ------------------------------------------------------

      const [
        jobsResponse,
        applicationsResponse
      ] = await Promise.all([

        getJobs(),

        getStudentApplications(
          currentStudent.student_id
        ),

      ]);


      const jobsData =
        jobsResponse.jobs ||
        jobsResponse.data ||
        jobsResponse ||
        [];


      const applicationsData =
        applicationsResponse.applications ||
        applicationsResponse.data ||
        applicationsResponse ||
        [];


      setJobs(
        Array.isArray(jobsData)
          ? jobsData
          : []
      );


      setApplications(
        Array.isArray(
          applicationsData
        )
          ? applicationsData
          : []
      );

    }

    catch (error) {

      console.error(
        "Opportunities loading error:",
        error
      );


      if (
        error.response?.status === 401
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


      setMessage(
        error.response?.data?.message ||
        "Unable to load opportunities."
      );

      setMessageType("error");

    }

    finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // CHECK ALREADY APPLIED
  // ==========================================================

  const hasApplied = (
    jobId
  ) => {

    return applications.some(
      (application) =>
        Number(
          application.job_id
        ) === Number(jobId)
    );

  };


  // ==========================================================
  // APPLY FOR JOB
  // ==========================================================

  const applyForJob = async (
    job
  ) => {

    if (!student) {

      setMessage(
        "Student profile not available."
      );

      setMessageType("error");

      return;

    }


    if (
      hasApplied(
        job.job_id
      )
    ) {

      setMessage(
        "You have already applied for this job."
      );

      setMessageType("info");

      return;

    }


    try {

      // ------------------------------------------------------
      // CHECK ELIGIBILITY USING BACKEND
      // ------------------------------------------------------

      setCheckingEligibility(
        job.job_id
      );

      setMessage("");


      const eligibilityResponse =
        await checkStudentEligibility(
          job.job_id,
          student.student_id
        );


      const eligible =
        eligibilityResponse.eligible === true;


      if (!eligible) {

        setMessage(
          eligibilityResponse.message ||
          "You are not eligible for this opportunity."
        );

        setMessageType("error");

        setCheckingEligibility(null);

        return;

      }


      // ------------------------------------------------------
      // SUBMIT APPLICATION
      // ------------------------------------------------------

      setCheckingEligibility(null);

      setApplying(
        job.job_id
      );


      await submitApplication(
        student.student_id,
        job.job_id
      );


      setMessage(
        `Application submitted successfully for ${job.job_title}.`
      );

      setMessageType("success");


      // ------------------------------------------------------
      // REFRESH APPLICATIONS
      // ------------------------------------------------------

      const applicationsResponse =
        await getStudentApplications(
          student.student_id
        );


      setApplications(
        applicationsResponse.applications ||
        []
      );

    }

    catch (error) {

      console.error(
        "Application error:",
        error
      );


      if (
        error.response?.status === 401
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


      setMessage(
        error.response?.data?.message ||
        "Unable to submit application."
      );

      setMessageType("error");

    }

    finally {

      setCheckingEligibility(null);

      setApplying(null);

    }

  };


  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredJobs =
    jobs.filter(
      (job) => {

        const value =
          search
            .trim()
            .toLowerCase();


        if (!value) {

          return true;

        }


        return (

          job.job_title
            ?.toLowerCase()
            .includes(value)

          ||

          job.company_name
            ?.toLowerCase()
            .includes(value)

          ||

          job.location
            ?.toLowerCase()
            .includes(value)

          ||

          job.employment_type
            ?.toLowerCase()
            .includes(value)

        );

      }
    );


  // ==========================================================
  // DATE FORMAT
  // ==========================================================

  const formatDate = (
    date
  ) => {

    if (!date) {

      return "Not specified";

    }


    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );

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
  // LOADING SCREEN
  // ==========================================================

  if (loading) {

    return (

      <div className="dashboard-loading">

        <LoaderCircle
          size={40}
          className="loading-spinner"
        />

        <div className="loading-text">
          Loading opportunities...
        </div>

      </div>

    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="opportunities-page">


      {/* ====================================================
          TOP BAR
      ==================================================== */}

      <header className="opportunities-header">


        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <ArrowLeft size={18} />

          Dashboard

        </button>


        <div className="opportunities-header-title">

          <span>
            STUDENT WORKSPACE
          </span>

          <h1>
            Opportunities
          </h1>

        </div>


        <div className="opportunities-header-right">

          <div className="opportunities-avatar">

            {student?.full_name
              ?.charAt(0)
              ?.toUpperCase() || "S"}

          </div>

        </div>

      </header>


      {/* ====================================================
          CONTENT
      ==================================================== */}

      <main className="opportunities-content">


        {/* ==================================================
            HERO
        ================================================== */}

        <section className="opportunities-hero">


          <div>

            <div className="opportunities-eyebrow">

              <Sparkles size={15} />

              CAREER OPPORTUNITIES

            </div>


            <h2>

              Find your next

              <span>
                {" "}opportunity.
              </span>

            </h2>


            <p>

              Explore recruitment opportunities
              available for your campus profile.

            </p>

          </div>


          <div className="opportunities-count">

            <strong>
              {jobs.length}
            </strong>

            <span>
              Open Jobs
            </span>

          </div>

        </section>


        {/* ==================================================
            SEARCH
        ================================================== */}

        <section className="opportunities-toolbar">

          <div className="opportunities-search">

            <Search size={18} />

            <input
              type="text"
              placeholder={
                "Search jobs, companies or locations..."
              }
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />


            {search && (

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >

                <X size={16} />

              </button>

            )}

          </div>

        </section>


        {/* ==================================================
            MESSAGE
        ================================================== */}

        {message && (

          <div
            className={
              `opportunities-message ${messageType}`
            }
          >

            {messageType === "success" && (

              <CheckCircle2
                size={18}
              />

            )}


            {messageType === "error" && (

              <AlertCircle
                size={18}
              />

            )}


            {message}

          </div>

        )}


        {/* ==================================================
            JOBS
        ================================================== */}

        {filteredJobs.length === 0 ? (

          <div className="opportunities-empty">

            <BriefcaseBusiness
              size={42}
            />

            <h3>
              No opportunities found
            </h3>

            <p>
              Try another search or check back later.
            </p>

          </div>

        ) : (

          <div className="jobs-grid">

            {filteredJobs.map(
              (job) => {

                const applied =
                  hasApplied(
                    job.job_id
                  );


                const isChecking =
                  checkingEligibility ===
                  job.job_id;


                const isApplying =
                  applying ===
                  job.job_id;


                return (

                  <article
                    className="opportunity-card"
                    key={job.job_id}
                  >


                    {/* ----------------------------------------
                        COMPANY
                    ----------------------------------------- */}

                    <div className="job-card-top">

                      <div className="company-logo">

                        {job.company_name
                          ?.charAt(0)
                          ?.toUpperCase() || "C"}

                      </div>


                      <div className="job-company">

                        <span>
                          {job.company_name}
                        </span>

                        <h3>
                          {job.job_title}
                        </h3>

                      </div>

                    </div>


                    {/* ----------------------------------------
                        META
                    ----------------------------------------- */}

                    <div className="job-meta">

                      <div>

                        <MapPin size={16} />

                        {job.location ||
                          "India"}

                      </div>


                      <div>

                        <BriefcaseBusiness
                          size={16}
                        />

                        {job.employment_type ||
                          "Full Time"}

                      </div>


                      <div>

                        <CalendarDays
                          size={16}
                        />

                        Deadline:{" "}

                        {formatDate(
                          job.application_deadline
                        )}

                      </div>

                    </div>


                    {/* ----------------------------------------
                        DESCRIPTION
                    ----------------------------------------- */}

                    <div className="job-description">

                      {job.job_description ||
                        "Explore this opportunity and check the recruitment requirements."}

                    </div>


                    {/* ----------------------------------------
                        REQUIREMENTS
                    ----------------------------------------- */}

                    <div className="job-requirements">


                      <div className="requirement">

                        <GraduationCap
                          size={16}
                        />

                        <div>

                          <span>
                            Minimum CGPA
                          </span>

                          <strong>

                            {Number(
                              job.minimum_cgpa || 0
                            ).toFixed(2)}

                          </strong>

                        </div>

                      </div>


                      <div className="requirement">

                        <Clock3
                          size={16}
                        />

                        <div>

                          <span>
                            Backlogs Allowed
                          </span>

                          <strong>

                            {job.maximum_backlogs ??
                              0}

                          </strong>

                        </div>

                      </div>

                    </div>


                    {/* ----------------------------------------
                        APPLICATION STATUS
                    ----------------------------------------- */}

                    <div className="job-status-row">

                      {applied ? (

                        <div className="already-applied">

                          <CheckCircle2
                            size={17}
                          />

                          Applied

                        </div>

                      ) : (

                        <div className="eligible-label">

                          <CheckCircle2
                            size={17}
                          />

                          Eligibility verified
                          when applying

                        </div>

                      )}

                    </div>


                    {/* ----------------------------------------
                        ACTIONS
                    ----------------------------------------- */}

                    <div className="job-actions">


                      <button
                        type="button"
                        className="job-view-button"
                        onClick={() =>
                          setSelectedJob(
                            job
                          )
                        }
                      >

                        View Details

                      </button>


                      <button
                        type="button"
                        className={
                          applied
                            ? "job-apply-button applied"
                            : "job-apply-button"
                        }
                        disabled={
                          applied ||
                          isChecking ||
                          isApplying
                        }
                        onClick={() =>
                          applyForJob(
                            job
                          )
                        }
                      >

                        {isChecking

                          ? "Checking..."

                          : isApplying

                          ? "Applying..."

                          : applied

                          ? "Applied"

                          : "Apply Now"

                        }

                      </button>

                    </div>

                  </article>

                );

              }
            )}

          </div>

        )}

      </main>


      {/* ====================================================
          DETAILS MODAL
      ==================================================== */}

      {selectedJob && (

        <div
          className="job-modal-overlay"
          onClick={() =>
            setSelectedJob(null)
          }
        >

          <div
            className="job-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            {/* CLOSE */}

            <button
              type="button"
              className="modal-close"
              onClick={() =>
                setSelectedJob(null)
              }
            >

              <X size={20} />

            </button>


            {/* COMPANY LOGO */}

            <div className="modal-company-logo">

              {selectedJob.company_name
                ?.charAt(0)
                ?.toUpperCase() || "C"}

            </div>


            <span className="modal-company">

              {selectedJob.company_name}

            </span>


            <h2>
              {selectedJob.job_title}
            </h2>


            {/* META */}

            <div className="modal-meta">

              <span>

                <MapPin size={15} />

                {selectedJob.location ||
                  "India"}

              </span>


              <span>

                <BriefcaseBusiness
                  size={15}
                />

                {selectedJob.employment_type ||
                  "Full Time"}

              </span>

            </div>


            {/* DESCRIPTION */}

            <div className="modal-section">

              <h3>
                About the opportunity
              </h3>

              <p>

                {selectedJob.job_description ||
                  "No detailed job description available."}

              </p>

            </div>


            {/* ELIGIBILITY */}

            <div className="modal-section">

              <h3>
                Eligibility
              </h3>


              <div className="modal-eligibility">


                <div>

                  <span>
                    Minimum CGPA
                  </span>

                  <strong>

                    {Number(
                      selectedJob.minimum_cgpa ||
                      0
                    ).toFixed(2)}

                  </strong>

                </div>


                <div>

                  <span>
                    Maximum Backlogs
                  </span>

                  <strong>

                    {selectedJob.maximum_backlogs ??
                      0}

                  </strong>

                </div>


                <div>

                  <span>
                    Graduation Year
                  </span>

                  <strong>

                    {selectedJob.graduation_year ||
                      "Any"}

                  </strong>

                </div>

              </div>

            </div>


            {/* DEADLINE */}

            <div className="modal-section">

              <h3>
                Application Deadline
              </h3>

              <p>

                {formatDate(
                  selectedJob.application_deadline
                )}

              </p>

            </div>


            {/* APPLY */}

            <button
              type="button"
              className="modal-apply-button"
              disabled={
                hasApplied(
                  selectedJob.job_id
                ) ||
                checkingEligibility ===
                  selectedJob.job_id ||
                applying ===
                  selectedJob.job_id
              }
              onClick={() => {

                applyForJob(
                  selectedJob
                );

                setSelectedJob(
                  null
                );

              }}
            >

              {hasApplied(
                selectedJob.job_id
              )

                ? "Already Applied"

                : checkingEligibility ===
                    selectedJob.job_id

                ? "Checking Eligibility..."

                : applying ===
                    selectedJob.job_id

                ? "Applying..."

                : "Apply for this Opportunity"

              }

            </button>

          </div>

        </div>

      )}

    </div>

  );

}


export default Opportunities;
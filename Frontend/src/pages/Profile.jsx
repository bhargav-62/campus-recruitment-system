import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  UserRound,
  Phone,
  CalendarDays,
  GraduationCap,
  Code2,
  Award,
  BriefcaseBusiness,
  FolderGit2,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Mail,
  Sparkles,
  Building2,
  ExternalLink,
} from "lucide-react";

import {
  getStudents,
  getEducation,
  getSkills,
  getProjects,
  getCertifications,
  getInternships,
  updateStudent,
} from "../services/studentApi";


// ============================================================
// PROFILE
// ============================================================

function Profile() {

  const navigate = useNavigate();

  const [student, setStudent] = useState(null);

  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [internships, setInternships] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");


  // ==========================================================
  // AUTH USER
  // ==========================================================

  const token = localStorage.getItem("crems_token");

  const user = JSON.parse(
    localStorage.getItem("crems_user") || "{}"
  );


  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    branch: "",
    graduation_year: "",
    cgpa: "",
    backlogs: 0,
  });


  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  useEffect(() => {
    loadProfile();
  }, []);


  const loadProfile = async () => {

    if (!token || !user.user_id) {

      navigate("/login");

      return;
    }

    try {

      setLoading(true);
      setMessage("");

      // ------------------------------------------------------
      // GET ALL STUDENTS
      // ------------------------------------------------------

      const studentsResponse = await getStudents();

      const students =
        studentsResponse?.students ||
        studentsResponse?.data ||
        studentsResponse ||
        [];

      const studentList = Array.isArray(students)
        ? students
        : [];


      // ------------------------------------------------------
      // FIND CURRENT STUDENT
      // ------------------------------------------------------

      const currentStudent = studentList.find(
        (item) =>
          Number(item.user_id) ===
          Number(user.user_id)
      );


      if (!currentStudent) {

        setMessage("Student profile not found.");
        setMessageType("error");

        return;
      }


      setStudent(currentStudent);


      // ------------------------------------------------------
      // SET FORM
      // ------------------------------------------------------

      setForm({
        full_name:
          currentStudent.full_name || "",

        phone:
          currentStudent.phone || "",

        date_of_birth:
          currentStudent.date_of_birth
            ? String(
                currentStudent.date_of_birth
              ).slice(0, 10)
            : "",

        gender:
          currentStudent.gender || "",

        branch:
          currentStudent.branch || "",

        graduation_year:
          currentStudent.graduation_year || "",

        cgpa:
          currentStudent.cgpa ?? "",

        backlogs:
          currentStudent.backlogs ?? 0,
      });


      const studentId =
        currentStudent.student_id;


      // ======================================================
      // LOAD RELATED DATA
      // ======================================================

      const results =
        await Promise.allSettled([

          getEducation(studentId),

          getSkills(studentId),

          getProjects(studentId),

          getCertifications(studentId),

          getInternships(studentId),

        ]);


      // ======================================================
      // EDUCATION
      // ======================================================

      if (results[0].status === "fulfilled") {

        const data = results[0].value;

        const educationData =
          data?.education ||
          data?.data ||
          data ||
          [];

        setEducation(
          Array.isArray(educationData)
            ? educationData
            : []
        );

      } else {

        setEducation([]);
      }


      // ======================================================
      // SKILLS
      // ======================================================

      if (results[1].status === "fulfilled") {

        const data = results[1].value;

        const skillsData =
          data?.skills ||
          data?.data ||
          data ||
          [];

        setSkills(
          Array.isArray(skillsData)
            ? skillsData
            : []
        );

      } else {

        setSkills([]);
      }


      // ======================================================
      // PROJECTS
      // ======================================================

      if (results[2].status === "fulfilled") {

        const data = results[2].value;

        const projectsData =
          data?.projects ||
          data?.data ||
          data ||
          [];

        setProjects(
          Array.isArray(projectsData)
            ? projectsData
            : []
        );

      } else {

        setProjects([]);
      }


      // ======================================================
      // CERTIFICATIONS
      // ======================================================

      if (results[3].status === "fulfilled") {

        const data = results[3].value;

        const certificationsData =
          data?.certifications ||
          data?.data ||
          data ||
          [];

        setCertifications(
          Array.isArray(certificationsData)
            ? certificationsData
            : []
        );

      } else {

        setCertifications([]);
      }


      // ======================================================
      // INTERNSHIPS
      // ======================================================

      if (results[4].status === "fulfilled") {

        const data = results[4].value;

        const internshipsData =
          data?.internships ||
          data?.data ||
          data ||
          [];

        setInternships(
          Array.isArray(internshipsData)
            ? internshipsData
            : []
        );

      } else {

        setInternships([]);
      }


    } catch (error) {

      console.error(
        "Profile loading error:",
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
        "Unable to load profile."
      );

      setMessageType("error");

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // FORM UPDATE
  // ==========================================================

  const updateField = (
    field,
    value
  ) => {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  };


  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const saveProfile = async () => {

    if (!student) {
      return;
    }


    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!form.full_name.trim()) {

      setMessage(
        "Full name is required."
      );

      setMessageType("error");

      return;
    }


    const cgpa =
      Number(form.cgpa);

    const graduationYear =
      Number(form.graduation_year);

    const backlogs =
      Number(form.backlogs);


    if (
      Number.isNaN(cgpa) ||
      cgpa < 0 ||
      cgpa > 10
    ) {

      setMessage(
        "CGPA must be between 0 and 10."
      );

      setMessageType("error");

      return;
    }


    if (
      Number.isNaN(graduationYear)
    ) {

      setMessage(
        "Please enter a valid graduation year."
      );

      setMessageType("error");

      return;
    }


    if (
      Number.isNaN(backlogs) ||
      backlogs < 0
    ) {

      setMessage(
        "Backlogs cannot be negative."
      );

      setMessageType("error");

      return;
    }


    try {

      setSaving(true);
      setMessage("");


      // ------------------------------------------------------
      // UPDATE STUDENT
      // ------------------------------------------------------

      const response =
        await updateStudent(
          student.student_id,
          {
            full_name:
              form.full_name.trim(),

            phone:
              form.phone.trim(),

            date_of_birth:
              form.date_of_birth || null,

            gender:
              form.gender.trim(),

            branch:
              form.branch.trim(),

            graduation_year:
              graduationYear,

            cgpa:
              cgpa,

            backlogs:
              backlogs,
          }
        );


      const updated =
        response?.student ||
        response?.data ||
        response;


      if (
        updated &&
        updated.student_id
      ) {

        setStudent(updated);


        setForm({
          full_name:
            updated.full_name || "",

          phone:
            updated.phone || "",

          date_of_birth:
            updated.date_of_birth
              ? String(
                  updated.date_of_birth
                ).slice(0, 10)
              : "",

          gender:
            updated.gender || "",

          branch:
            updated.branch || "",

          graduation_year:
            updated.graduation_year || "",

          cgpa:
            updated.cgpa ?? "",

          backlogs:
            updated.backlogs ?? 0,
        });

      } else {

        await loadProfile();

      }


      setEditing(false);

      setMessage(
        "Profile updated successfully."
      );

      setMessageType("success");


    } catch (error) {

      console.error(
        "Profile update error:",
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
        "Unable to update profile."
      );

      setMessageType("error");

    } finally {

      setSaving(false);

    }

  };


  // ==========================================================
  // CANCEL EDIT
  // ==========================================================

  const cancelEdit = () => {

    if (!student) {
      return;
    }


    setForm({

      full_name:
        student.full_name || "",

      phone:
        student.phone || "",

      date_of_birth:
        student.date_of_birth
          ? String(
              student.date_of_birth
            ).slice(0, 10)
          : "",

      gender:
        student.gender || "",

      branch:
        student.branch || "",

      graduation_year:
        student.graduation_year || "",

      cgpa:
        student.cgpa ?? "",

      backlogs:
        student.backlogs ?? 0,

    });


    setEditing(false);
    setMessage("");

  };


  // ==========================================================
  // SCROLL TO SECTION
  // ==========================================================

  const scrollToSection = (
    sectionId
  ) => {

    const element =
      document.getElementById(
        sectionId
      );

    if (element) {

      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="profile-loading-page">

        <div className="profile-spinner"></div>

        <p>
          Loading your profile...
        </p>

      </div>

    );

  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div className="profile-page">


      {/* ====================================================
          HEADER
      ==================================================== */}

      <header className="profile-header">

        <button
          className="profile-back"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <ArrowLeft size={18} />

          Dashboard

        </button>


        <div className="profile-header-title">

          <span>
            STUDENT WORKSPACE
          </span>

          <h1>
            My Profile
          </h1>

        </div>


        <div className="profile-avatar">

          {student?.full_name
            ?.charAt(0)
            ?.toUpperCase() || "B"}

        </div>

      </header>



      {/* ====================================================
          CONTENT
      ==================================================== */}

      <main className="profile-content">


        {/* ==================================================
            PROFILE HERO
        ================================================== */}

        <section className="profile-hero">

          <div className="profile-hero-left">

            <div className="large-profile-avatar">

              {student?.full_name
                ?.charAt(0)
                ?.toUpperCase() || "B"}

            </div>


            <div>

              <div className="profile-eyebrow">

                <Sparkles size={14} />

                CAREER PROFILE

              </div>


              <h2>

                {student?.full_name ||
                  "Student"}

              </h2>


              <p>

                {student?.branch ||
                  "Student"}

                {" · Class of "}

                {student?.graduation_year ||
                  "—"}

              </p>

            </div>

          </div>


          {!editing ? (

            <button
              className="profile-edit-button"
              onClick={() =>
                setEditing(true)
              }
            >

              <Edit3 size={16} />

              Edit Profile

            </button>

          ) : (

            <div className="profile-edit-actions">

              <button
                className="profile-cancel-button"
                onClick={cancelEdit}
              >

                <X size={16} />

                Cancel

              </button>


              <button
                className="profile-save-button"
                onClick={saveProfile}
                disabled={saving}
              >

                <Save size={16} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}

              </button>

            </div>

          )}

        </section>



        {/* ==================================================
            MESSAGE
        ================================================== */}

        {message && (

          <div
            className={`profile-message ${
              messageType
            }`}
          >

            {messageType ===
              "success" && (

              <CheckCircle2
                size={18}
              />

            )}

            {message}

          </div>

        )}



        {/* ==================================================
            QUICK NAVIGATION
        ================================================== */}

        <section className="profile-section">

          <div className="profile-section-heading">

            <div className="profile-section-icon">

              <Sparkles size={19} />

            </div>

            <div>

              <span>
                PROFILE SECTIONS
              </span>

              <h3>
                Career Overview
              </h3>

            </div>

          </div>


          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >

            <QuickNavButton
              label="Education"
              onClick={() =>
                scrollToSection(
                  "education-section"
                )
              }
            />

            <QuickNavButton
              label="Skills"
              onClick={() =>
                scrollToSection(
                  "skills-section"
                )
              }
            />

            <QuickNavButton
              label="Projects"
              onClick={() =>
                scrollToSection(
                  "projects-section"
                )
              }
            />

            <QuickNavButton
              label="Certifications"
              onClick={() =>
                scrollToSection(
                  "certifications-section"
                )
              }
            />

            <QuickNavButton
              label="Internships"
              onClick={() =>
                scrollToSection(
                  "internships-section"
                )
              }
            />

          </div>

        </section>



        {/* ==================================================
            PERSONAL INFORMATION
        ================================================== */}

        <section className="profile-section">

          <div className="profile-section-heading">

            <div className="profile-section-icon">

              <UserRound size={19} />

            </div>


            <div>

              <span>
                PERSONAL INFORMATION
              </span>

              <h3>
                Personal Details
              </h3>

            </div>

          </div>


          <div className="profile-grid">

            <ProfileField
              icon={
                <UserRound size={16} />
              }
              label="Full Name"
              value={form.full_name}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "full_name",
                  value
                )
              }
            />


            <ProfileField
              icon={
                <Mail size={16} />
              }
              label="Email"
              value={user.email || ""}
              editing={false}
            />


            <ProfileField
              icon={
                <Phone size={16} />
              }
              label="Phone"
              value={form.phone}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "phone",
                  value
                )
              }
            />


            <ProfileField
              icon={
                <CalendarDays
                  size={16}
                />
              }
              label="Date of Birth"
              value={
                form.date_of_birth
              }
              editing={editing}
              type="date"
              onChange={(value) =>
                updateField(
                  "date_of_birth",
                  value
                )
              }
            />


            <ProfileField
              icon={
                <UserRound size={16} />
              }
              label="Gender"
              value={form.gender}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "gender",
                  value
                )
              }
            />

          </div>

        </section>



        {/* ==================================================
            ACADEMIC INFORMATION
        ================================================== */}

        <section className="profile-section">

          <div className="profile-section-heading">

            <div className="profile-section-icon">

              <GraduationCap
                size={19}
              />

            </div>


            <div>

              <span>
                ACADEMIC INFORMATION
              </span>

              <h3>
                Academic Profile
              </h3>

            </div>

          </div>


          <div className="profile-grid">

            <ProfileField
              icon={
                <GraduationCap
                  size={16}
                />
              }
              label="Branch"
              value={form.branch}
              editing={editing}
              onChange={(value) =>
                updateField(
                  "branch",
                  value
                )
              }
            />


            <ProfileField
              icon={
                <GraduationCap
                  size={16}
                />
              }
              label="Graduation Year"
              value={
                form.graduation_year
              }
              editing={editing}
              type="number"
              onChange={(value) =>
                updateField(
                  "graduation_year",
                  value
                )
              }
            />


            <ProfileField
              icon={
                <Sparkles size={16} />
              }
              label="CGPA"
              value={form.cgpa}
              editing={editing}
              type="number"
              step="0.01"
              onChange={(value) =>
                updateField(
                  "cgpa",
                  value
                )
              }
            />


            <ProfileField
              icon={
                <CheckCircle2
                  size={16}
                />
              }
              label="Backlogs"
              value={form.backlogs}
              editing={editing}
              type="number"
              onChange={(value) =>
                updateField(
                  "backlogs",
                  value
                )
              }
            />

          </div>

        </section>



        {/* ==================================================
            PROFILE STATS
        ================================================== */}

        <section className="profile-stat-grid">

          <ProfileStat
            icon={
              <GraduationCap
                size={19}
              />
            }
            value={education.length}
            label="Education"
          />


          <ProfileStat
            icon={
              <Code2 size={19} />
            }
            value={skills.length}
            label="Technical Skills"
          />


          <ProfileStat
            icon={
              <FolderGit2
                size={19}
              />
            }
            value={projects.length}
            label="Projects"
          />


          <ProfileStat
            icon={
              <Award size={19} />
            }
            value={certifications.length}
            label="Certifications"
          />


          <ProfileStat
            icon={
              <BriefcaseBusiness
                size={19}
              />
            }
            value={internships.length}
            label="Internships"
          />

        </section>



        {/* ==================================================
            EDUCATION
        ================================================== */}

        <section
          id="education-section"
          className="profile-section"
        >

          <div className="profile-section-heading">

            <div className="profile-section-icon">

              <GraduationCap
                size={19}
              />

            </div>


            <div>

              <span>
                ACADEMIC HISTORY
              </span>

              <h3>
                Education
              </h3>

            </div>

          </div>


          <div className="profile-items">

            {education.length > 0 ? (

              education.map(
                (item, index) => (

                  <div
                    className="profile-item"
                    key={
                      item.education_id ||
                      index
                    }
                  >

                    <div className="profile-item-icon">

                      <GraduationCap
                        size={17}
                      />

                    </div>


                    <div>

                      <h4>

                        {item.qualification ||
                          "Qualification"}

                      </h4>


                      <p>

                        {item.institution ||
                          "Institution"}

                        {item.specialization
                          ? ` · ${item.specialization}`
                          : ""}

                      </p>


                      <p>

                        {item.start_year ||
                          "—"}

                        {" - "}

                        {item.end_year ||
                          "—"}

                        {item.percentage !==
                          null &&
                        item.percentage !==
                          undefined
                          ? ` · ${item.percentage}%`
                          : ""}

                      </p>

                    </div>

                  </div>

                )
              )

            ) : (

              <p className="profile-empty-text">

                No education records added yet.

              </p>

            )}

          </div>

        </section>



        {/* ==================================================
            SKILLS
        ================================================== */}

        <section
          id="skills-section"
          className="profile-section"
        >

          <div className="profile-section-heading">

            <div className="profile-section-icon">

              <Code2 size={19} />

            </div>


            <div>

              <span>
                TECHNICAL SKILLS
              </span>

              <h3>
                Skills
              </h3>

            </div>

          </div>


          <div className="profile-tags">

            {skills.length > 0 ? (

              skills.map(
                (skill, index) => (

                  <span
                    key={
                      skill.skill_id ||
                      index
                    }
                  >

                    {skill.skill_name ||
                      skill.name ||
                      skill}

                  </span>

                )
              )

            ) : (

              <p className="profile-empty-text">

                No skills added yet.

              </p>

            )}

          </div>

        </section>



        {/* ==================================================
            PROJECTS
        ================================================== */}

        <section
          id="projects-section"
          className="profile-section"
        >

          <div className="profile-section-heading">

            <div className="profile-section-icon">

              <FolderGit2 size={19} />

            </div>


            <div>

              <span>
                PROJECT PORTFOLIO
              </span>

              <h3>
                Projects
              </h3>

            </div>

          </div>


          <div className="profile-items">

            {projects.length > 0 ? (

              projects.map(
                (project, index) => (

                  <div
                    className="profile-item"
                    key={
                      project.project_id ||
                      index
                    }
                  >

                    <div className="profile-item-icon">

                      <FolderGit2
                        size={17}
                      />

                    </div>


                    <div>

                      <h4>

                        {project.project_name ||
                          "Project"}

                      </h4>


                      <p>

                        {project.description ||
                          project.technologies ||
                          "Project"}

                      </p>


                      {project.project_url && (

                        <a
                          href={
                            project.project_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "5px",
                            marginTop:
                              "6px",
                          }}
                        >

                          View Project

                          <ExternalLink
                            size={13}
                          />

                        </a>

                      )}

                    </div>

                  </div>

                )
              )

            ) : (

              <p className="profile-empty-text">

                No projects added yet.

              </p>

            )}

          </div>

        </section>



        {/* ==================================================
            CERTIFICATIONS
        ================================================== */}

        <section
          id="certifications-section"
          className="profile-section"
        >

          <div className="profile-section-heading">

            <div className="profile-section-icon">

              <Award size={19} />

            </div>


            <div>

              <span>
                PROFESSIONAL DEVELOPMENT
              </span>

              <h3>
                Certifications
              </h3>

            </div>

          </div>


          <div className="profile-items">

            {certifications.length > 0 ? (

              certifications.map(
                (certificate, index) => (

                  <div
                    className="profile-item"
                    key={
                      certificate.certification_id ||
                      index
                    }
                  >

                    <div className="profile-item-icon">

                      <Award size={17} />

                    </div>


                    <div>

                      <h4>

                        {
                          certificate.certification_name ||
                          "Certification"
                        }

                      </h4>


                      <p>

                        {
                          certificate.issuing_organization ||
                          "Certification"
                        }

                      </p>


                      {certificate.credential_url && (

                        <a
                          href={
                            certificate.credential_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "5px",
                            marginTop:
                              "6px",
                          }}
                        >

                          View Credential

                          <ExternalLink
                            size={13}
                          />

                        </a>

                      )}

                    </div>

                  </div>

                )
              )

            ) : (

              <p className="profile-empty-text">

                No certifications added yet.

              </p>

            )}

          </div>

        </section>



        {/* ==================================================
            INTERNSHIPS
        ================================================== */}

        <section
          id="internships-section"
          className="profile-section"
        >

          <div className="profile-section-heading">

            <div className="profile-section-icon">

              <BriefcaseBusiness
                size={19}
              />

            </div>


            <div>

              <span>
                EXPERIENCE
              </span>

              <h3>
                Internships
              </h3>

            </div>

          </div>


          <div className="profile-items">

            {internships.length > 0 ? (

              internships.map(
                (internship, index) => (

                  <div
                    className="profile-item"
                    key={
                      internship.internship_id ||
                      index
                    }
                  >

                    <div className="profile-item-icon">

                      <BriefcaseBusiness
                        size={17}
                      />

                    </div>


                    <div>

                      <h4>

                        {internship.role ||
                          "Internship"}

                      </h4>


                      <p>

                        {internship.company_name ||
                          "Company"}

                        {internship.description
                          ? ` · ${internship.description}`
                          : ""}

                      </p>


                      {(internship.start_date ||
                        internship.end_date) && (

                        <p>

                          {internship.start_date ||
                            "—"}

                          {" → "}

                          {internship.end_date ||
                            "Present"}

                        </p>

                      )}

                    </div>

                  </div>

                )
              )

            ) : (

              <p className="profile-empty-text">

                No internships added yet.

              </p>

            )}

          </div>

        </section>


      </main>

    </div>

  );

}


// ============================================================
// QUICK NAV BUTTON
// ============================================================

function QuickNavButton({
  label,
  onClick,
}) {

  return (

    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "9px 14px",
        borderRadius: "10px",
        border: "1px solid rgba(120, 100, 255, 0.2)",
        background: "rgba(120, 100, 255, 0.06)",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >

      {label}

    </button>

  );

}


// ============================================================
// PROFILE FIELD
// ============================================================

function ProfileField({
  icon,
  label,
  value,
  editing,
  type = "text",
  step,
  onChange,
}) {

  return (

    <div className="profile-field">

      <label>

        {icon}

        {label}

      </label>


      {editing ? (

        <input
          type={type}
          step={step}
          value={value ?? ""}
          onChange={(e) =>
            onChange?.(
              e.target.value
            )
          }
        />

      ) : (

        <div className="profile-field-value">

          {value !== null &&
          value !== undefined &&
          value !== ""
            ? value
            : "Not provided"}

        </div>

      )}

    </div>

  );

}


// ============================================================
// PROFILE STAT
// ============================================================

function ProfileStat({
  icon,
  value,
  label,
}) {

  return (

    <div className="profile-stat">

      {icon}

      <div>

        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>

      </div>

    </div>

  );

}


export default Profile;
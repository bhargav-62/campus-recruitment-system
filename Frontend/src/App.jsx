import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import Opportunities from "./pages/Opportunities";
import Applications from "./pages/Applications";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ApplicationDetails from "./pages/ApplicationDetails";

// ============================================================
// LANDING PAGE
// ============================================================

function Landing() {
  return (
    <div className="app">

      {/* ======================================================
          NAVBAR
      ====================================================== */}

      <nav className="navbar">

        <Link
          to="/"
          className="logo"
        >
          <span className="logo-mark">
            C
          </span>

          <span>
            CREMS
          </span>
        </Link>


        <div className="nav-links">

          <a href="#features">
            Features
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#about">
            About
          </a>

        </div>


        <div className="nav-actions">

          <Link
            to="/login"
            className="btn btn-ghost"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="btn btn-primary"
          >
            Get Started
          </Link>

        </div>

      </nav>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main>

        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="hero">

          <div className="hero-glow glow-one"></div>

          <div className="hero-glow glow-two"></div>


          {/* HERO CONTENT */}

          <div className="hero-content">

            <div className="eyebrow">

              <span className="eyebrow-dot"></span>

              CAMPUS RECRUITMENT PLATFORM

            </div>


            <h1>

              Where talent

              <br />

              meets{" "}

              <span>
                opportunity.
              </span>

            </h1>


            <p className="hero-description">

              A smarter campus recruitment experience
              built for students, recruiters, and
              institutions.

            </p>


            <div className="hero-actions">

              <Link
                to="/register"
                className="btn btn-primary btn-large"
              >

                Explore Opportunities

                <ArrowRight size={16} />

              </Link>


              <a
                href="#how-it-works"
                className="btn btn-outline btn-large"
              >

                See How It Works

              </a>

            </div>


            {/* HERO STATS */}

            <div className="hero-stats">

              <div>

                <strong>
                  1,240+
                </strong>

                <span>
                  Students
                </span>

              </div>


              <div>

                <strong>
                  86+
                </strong>

                <span>
                  Opportunities
                </span>

              </div>


              <div>

                <strong>
                  740+
                </strong>

                <span>
                  Applications
                </span>

              </div>

            </div>

          </div>


          {/* ==================================================
              HERO VISUAL
          ================================================== */}

          <div className="hero-visual">

            <div className="orbit orbit-one"></div>

            <div className="orbit orbit-two"></div>

            <div className="orbit orbit-three"></div>


            <div className="core-card">

              <div className="core-icon">
                C
              </div>


              <div className="core-title">
                CREMS
              </div>


              <div className="core-subtitle">
                Recruitment Intelligence
              </div>


              <div className="core-line"></div>


              <div className="core-items">

                <div>

                  <span className="status-dot"></span>

                  Eligibility Engine

                </div>


                <div>

                  <span className="status-dot"></span>

                  Smart Applications

                </div>


                <div>

                  <span className="status-dot"></span>

                  Career Tracking

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            TRUST
        ==================================================== */}

        <section className="trust-section">

          <p>
            POWERING THE NEXT GENERATION OF CAMPUS RECRUITMENT
          </p>

          <div className="trust-line"></div>

        </section>


        {/* ====================================================
            FEATURES
        ==================================================== */}

        <section
          className="features"
          id="features"
        >

          <div className="section-heading">

            <div className="eyebrow">

              <span className="eyebrow-dot"></span>

              PLATFORM

            </div>


            <h2>

              Everything recruitment.

              <br />

              <span>
                One intelligent platform.
              </span>

            </h2>

          </div>


          <div className="feature-grid">


            {/* FEATURE 1 */}

            <div className="feature-card feature-large">

              <div className="feature-number">
                01
              </div>


              <div className="feature-icon">
                <ShieldCheck size={20} />
              </div>


              <h3>
                Smart Eligibility
              </h3>


              <p>

                Automatically evaluate students against
                CGPA, branch, skills, graduation year,
                backlogs, and academic requirements.

              </p>


              <div className="feature-visual">

                <div className="check-row">

                  <span>
                    CGPA
                  </span>

                  <b>
                    8.10
                  </b>

                  <i>
                    ✓
                  </i>

                </div>


                <div className="check-row">

                  <span>
                    Branch
                  </span>

                  <b>
                    CSE AI ML
                  </b>

                  <i>
                    ✓
                  </i>

                </div>


                <div className="check-row">

                  <span>
                    Skills
                  </span>

                  <b>
                    Python · SQL
                  </b>

                  <i>
                    ✓
                  </i>

                </div>

              </div>

            </div>


            {/* FEATURE 2 */}

            <div className="feature-card">

              <div className="feature-number">
                02
              </div>


              <div className="feature-icon">
                <Briefcase size={20} />
              </div>


              <h3>
                Application Tracking
              </h3>


              <p>

                Follow every application from submission
                to assessment, interview, and final
                selection.

              </p>


              <div className="timeline-mini">

                <span className="active"></span>

                <span className="active"></span>

                <span className="active"></span>

                <span></span>

                <span></span>

              </div>

            </div>


            {/* FEATURE 3 */}

            <div className="feature-card">

              <div className="feature-number">
                03
              </div>


              <div className="feature-icon">
                <Users size={20} />
              </div>


              <h3>
                Recruiter Dashboard
              </h3>


              <p>

                Manage jobs, students, eligibility rules,
                applications, and recruitment statistics.

              </p>


              <div className="bars">

                <span
                  style={{ height: "35%" }}
                ></span>

                <span
                  style={{ height: "55%" }}
                ></span>

                <span
                  style={{ height: "45%" }}
                ></span>

                <span
                  style={{ height: "75%" }}
                ></span>

                <span
                  style={{ height: "90%" }}
                ></span>

              </div>

            </div>

          </div>

        </section>


        {/* ====================================================
            HOW IT WORKS
        ==================================================== */}

        <section
          className="how-section"
          id="how-it-works"
        >

          <div className="section-heading center">

            <div className="eyebrow">

              <span className="eyebrow-dot"></span>

              HOW IT WORKS

            </div>


            <h2>

              From profile to

              <br />

              <span>
                opportunity.
              </span>

            </h2>

          </div>


          <div className="process-grid">


            {/* STEP 1 */}

            <div className="process-card">

              <div className="process-number">
                01
              </div>

              <GraduationCap size={26} />

              <h3>
                Build Profile
              </h3>

              <p>
                Add your education, skills, projects,
                certifications, and internships.
              </p>

            </div>


            {/* STEP 2 */}

            <div className="process-card">

              <div className="process-number">
                02
              </div>

              <Briefcase size={26} />

              <h3>
                Discover Jobs
              </h3>

              <p>
                Explore campus opportunities and
                understand their eligibility requirements.
              </p>

            </div>


            {/* STEP 3 */}

            <div className="process-card">

              <div className="process-number">
                03
              </div>

              <ShieldCheck size={26} />

              <h3>
                Check Eligibility
              </h3>

              <p>
                CREMS evaluates your profile against
                the recruitment rules.
              </p>

            </div>


            {/* STEP 4 */}

            <div className="process-card">

              <div className="process-number">
                04
              </div>

              <Sparkles size={26} />

              <h3>
                Track Progress
              </h3>

              <p>
                Follow your application from applied
                through assessment and interview.
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            CTA
        ==================================================== */}

        <section
          className="cta"
          id="about"
        >

          <div className="cta-glow"></div>


          <div className="cta-content">

            <div className="eyebrow center-eyebrow">

              <span className="eyebrow-dot"></span>

              START YOUR JOURNEY

            </div>


            <h2>

              Your next opportunity

              <br />

              is{" "}

              <span>
                closer than you think.
              </span>

            </h2>


            <p>

              Discover opportunities, prove your
              eligibility, and take the next step
              in your career.

            </p>


            <Link
              to="/register"
              className="btn btn-primary btn-large"
            >

              Get Started

              <ArrowRight size={16} />

            </Link>

          </div>

        </section>

      </main>


      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer>

        <Link
          to="/"
          className="logo"
        >

          <span className="logo-mark">
            C
          </span>

          <span>
            CREMS
          </span>

        </Link>


        <p>
          Campus Recruitment & Eligibility Management System
        </p>


        <span>
          © 2026 CREMS
        </span>

      </footer>

    </div>
  );
}


// ============================================================
// APP ROUTER
// ============================================================

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ==================================================
            LANDING
        ================================================== */}

        <Route
          path="/"
          element={<Landing />}
        />


        {/* ==================================================
            AUTHENTICATION
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==================================================
            STUDENT
        ================================================== */}

        <Route
          path="/dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/opportunities"
          element={<Opportunities />}
        />

        <Route
          path="/applications"
          element={<Applications />}
        />
        <Route
          path="/applications/:applicationId"
          element={<ApplicationDetails />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />


        {/* ==================================================
            ADMIN
        ================================================== */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />


        {/* ==================================================
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={
            <div className="placeholder-page">

              <div className="placeholder-card">

                <div className="placeholder-icon">
                  <ShieldCheck size={28} />
                </div>

                <h1>
                  Page Not Found
                </h1>

                <p>
                  The page you are looking for does not exist.
                </p>

                <Link
                  to="/"
                  className="btn btn-primary"
                >
                  Back to CREMS
                </Link>

              </div>

            </div>
          }
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;
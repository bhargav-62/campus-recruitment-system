import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Lock,
  Mail,
  Sparkles,
  UserPlus
} from "lucide-react";

import { registerUser } from "../services/authApi";


function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  const handleChange = (event) => {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");


    if (
      formData.password !==
      formData.confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    if (formData.password.length < 6) {

      setError(
        "Password must be at least 6 characters."
      );

      return;
    }


    setLoading(true);


    try {

      await registerUser({
        email: formData.email,
        password: formData.password,
      });


      setSuccess(
        "Account created successfully. Redirecting to login..."
      );


      setTimeout(() => {

        navigate("/login");

      }, 1200);


    } catch (error) {

      const message =
        error.response?.data?.message ||
        "Unable to create your account.";

      setError(message);

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-page">

      <div className="auth-background-glow auth-glow-one"></div>
      <div className="auth-background-glow auth-glow-two"></div>


      {/* LOGO */}

      <Link
        to="/"
        className="auth-logo"
      >

        <span className="logo-mark">
          C
        </span>

        <span>
          CREMS
        </span>

      </Link>


      <div className="auth-layout">


        {/* SHOWCASE */}

        <div className="auth-showcase">

          <div className="auth-eyebrow">
            <Sparkles size={14} />
            BUILD YOUR CAREER PROFILE
          </div>

          <h1>
            Start your
            <br />
            <span>journey.</span>
          </h1>

          <p>
            Create your CREMS account and build
            a centralized profile for your campus
            recruitment journey.
          </p>


          <div className="auth-feature-list">

            <div>
              <span>01</span>
              Build your academic profile
            </div>

            <div>
              <span>02</span>
              Add skills and projects
            </div>

            <div>
              <span>03</span>
              Discover eligible opportunities
            </div>

          </div>

        </div>


        {/* REGISTER CARD */}

        <div className="auth-card">

          <div className="auth-card-header">

            <div className="auth-card-icon">
              <UserPlus size={20} />
            </div>

            <h2>
              Create account
            </h2>

            <p>
              Join the CREMS recruitment platform
            </p>

          </div>


          {error && (

            <div className="auth-error">
              {error}
            </div>

          )}


          {success && (

            <div className="auth-success">
              {success}
            </div>

          )}


          <form
            onSubmit={handleSubmit}
            className="auth-form"
          >


            {/* EMAIL */}

            <div className="input-group">

              <label>
                Email address
              </label>

              <div className="input-wrapper">

                <Mail size={17} />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="input-group">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <Lock size={17} />

                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="input-group">

              <label>
                Confirm password
              </label>

              <div className="input-wrapper">

                <Lock size={17} />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading
                ? "Creating account..."
                : "Create account"
              }

              {!loading && (
                <ArrowRight size={18} />
              )}

            </button>

          </form>


          <div className="auth-divider">
            <span></span>
            <p>ALREADY HAVE AN ACCOUNT?</p>
            <span></span>
          </div>


          <Link
            to="/login"
            className="auth-register-link"
          >
            Sign in
            <ArrowRight size={15} />
          </Link>

        </div>

      </div>

    </div>

  );
}


export default Register;
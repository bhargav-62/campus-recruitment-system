import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";

import { loginUser } from "../services/authApi";


function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


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
    setLoading(true);

    try {

      const result = await loginUser(formData);

      localStorage.setItem(
        "crems_token",
        result.token
      );

      localStorage.setItem(
        "crems_user",
        JSON.stringify({
          user_id: result.user_id,
          email: result.email,
          role: result.role,
        })
      );

      if (result.role === "ADMIN") {

        navigate("/admin");

      } else {

        navigate("/dashboard");

      }

    } catch (error) {

      const message =
        error.response?.data?.message ||
        "Unable to login. Please check your credentials.";

      setError(message);

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-page">

      <div className="auth-background-glow auth-glow-one"></div>
      <div className="auth-background-glow auth-glow-two"></div>


      {/* BACK TO HOME */}

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


        {/* LEFT SIDE */}

        <div className="auth-showcase">

          <div className="auth-eyebrow">
            <Sparkles size={14} />
            CAMPUS RECRUITMENT PLATFORM
          </div>

          <h1>
            Welcome
            <br />
            <span>back.</span>
          </h1>

          <p>
            Continue your journey with CREMS and
            discover opportunities designed around
            your skills and eligibility.
          </p>


          <div className="auth-feature-list">

            <div>
              <span>01</span>
              Smart eligibility matching
            </div>

            <div>
              <span>02</span>
              Real-time application tracking
            </div>

            <div>
              <span>03</span>
              Centralized career profile
            </div>

          </div>

        </div>


        {/* LOGIN CARD */}

        <div className="auth-card">

          <div className="auth-card-header">

            <div className="auth-card-icon">
              <Lock size={20} />
            </div>

            <h2>
              Sign in
            </h2>

            <p>
              Access your CREMS account
            </p>

          </div>


          {error && (

            <div className="auth-error">
              {error}
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
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

              </div>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Sign in"
              }

              {!loading && (
                <ArrowRight size={18} />
              )}

            </button>

          </form>


          <div className="auth-divider">
            <span></span>
            <p>NEW TO CREMS?</p>
            <span></span>
          </div>


          <Link
            to="/register"
            className="auth-register-link"
          >
            Create an account
            <ArrowRight size={15} />
          </Link>

        </div>

      </div>

    </div>

  );
}


export default Login;
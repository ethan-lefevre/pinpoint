import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!email || !password || !confirmPassword) {
        throw new Error("Please fill out all fields");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      setSubmitting(true);

      const res = await fetch("https://pinpoint-srng.onrender.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <div className="paywall-container">
      <div className="paywall-page">
        <div className="paywall-card">
          <div className="paywall-badge">PinPoint</div>
          <h1 className="paywall-title">Create Your Account</h1>
          <p className="paywall-subtitle">
            Sign up to access PinPoint and upgrade to Premium whenever you're ready.
          </p>

          <form onSubmit={handleSignup} className="signup-form">
            <input
              className="signup-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="signup-input"
              type="password"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className="signup-input"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="submit"
              className="subscribe-button"
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {error && <p className="paywall-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default Signup;
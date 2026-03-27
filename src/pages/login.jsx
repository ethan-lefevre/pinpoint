import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "../index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse login response:", jsonError);
      }

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        navigate("/rankings");
        return;
      }

      setError(data.message || data.error || "Login failed");
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="paywall-container">
      <div className="paywall-page">
        <div className="paywall-card">
          <div className="paywall-badge">PinPoint</div>

          <h1 className="paywall-title">Welcome Back</h1>

          <p className="paywall-subtitle">
            Log in to access rankings, results, and premium content.
          </p>

          <form onSubmit={handleLogin} className="signup-form">
            <input
              className="signup-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <input
              className="signup-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="submit"
              className="subscribe-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {error && <p className="paywall-error">{error}</p>}

          {/* 👇 SIGNUP BUTTON */}
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <p style={{ marginBottom: "0.5rem", color: "#aaa" }}>
              Don’t have an account?
            </p>

            <button
              className="secondary-button"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "../index.css";

function VerifyRequired() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleResendEmail() {
    try {
      setSending(true);
      setError("");
      setMessage("");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch(`${API_URL}/resend-verification-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend verification email");
      }

      setMessage("Verification email sent. Check your inbox and spam folder.");
    } catch (err) {
      console.error("Resend verification error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-badge">Email Verification</div>

        <h1 className="profile-title">Verify Your Email</h1>

        <p className="profile-subtitle">
          You need to verify your email before accessing premium content.
          Check your inbox, spam folder, or request a new verification email below.
        </p>

        {message && <p className="verify-success">{message}</p>}
        {error && <p className="profile-error">{error}</p>}

        <div className="profile-actions">
          <button
            className="profile-primary-btn"
            onClick={handleResendEmail}
            disabled={sending}
          >
            {sending ? "Sending..." : "Resend Verification Email"}
          </button>

          <button
            className="profile-secondary-btn"
            onClick={() => navigate("/profile")}
          >
            Go to Profile
          </button>

          <button
            className="profile-secondary-btn"
            onClick={() => navigate("/")}
          >
            Back Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyRequired;
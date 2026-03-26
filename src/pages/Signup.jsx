import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../index.css";

function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [stripeCustomerId, setStripeCustomerId] = useState("");
  const [stripeSubscriptionId, setStripeSubscriptionId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingSession, setLoadingSession] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("Missing Stripe session.");
      setLoadingSession(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const res = await fetch(
          `https://pinpoint-srng.onrender.com/api/stripe/checkout-session/${sessionId}`
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to verify payment");
        }

        if (data.paymentStatus !== "paid") {
          throw new Error("Payment was not completed");
        }

        if (!data.email) {
          throw new Error("No email found from Stripe");
        }

        setEmail(data.email);
        setStripeCustomerId(data.stripeCustomerId);
        setStripeSubscriptionId(data.stripeSubscriptionId);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoadingSession(false);
      }
    };

    fetchSession();
  }, [searchParams]);

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!password || !confirmPassword) {
        throw new Error("Please fill out all fields");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      setSubmitting(true);

      const res = await fetch("https://pinpoint-srng.onrender.com/api/auth/signup-after-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          stripeCustomerId,
          stripeSubscriptionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setSubmitting(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="paywall-container">
        <div className="paywall-page">
          <div className="paywall-card">
            <h1 className="paywall-title">Verifying payment...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="paywall-container">
      <div className="paywall-page">
        <div className="paywall-card">
          <div className="paywall-badge">PinPoint Premium</div>
          <h1 className="paywall-title">Create Your Account</h1>
          <p className="paywall-subtitle">
            Your subscription is active. Finish setting up your account below.
          </p>

          <form onSubmit={handleSignup} className="signup-form">
            <input
              className="signup-input"
              type="email"
              value={email}
              disabled
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
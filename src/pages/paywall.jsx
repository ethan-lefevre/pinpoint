import { useState } from "react";
import "../index.css";

function Paywall({ user }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You must be logged in to subscribe");
      }

      const res = await fetch(
        "https://pinpoint-srng.onrender.com/api/stripe/create-checkout-session",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to start checkout");
      }

      if (!data.url) {
        throw new Error("No checkout URL returned");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Subscribe error:", err);
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="paywall-container">
      <div className="paywall-page">
        <div className="paywall-card">
          <div className="paywall-badge">PinPoint Premium</div>

          <h1 className="paywall-title">Unlock Full Access</h1>

          <p className="paywall-subtitle">
            Get rankings, results, and exclusive wrestling content for just{" "}
            <strong>$8/month</strong>.
          </p>

          <ul className="paywall-features">
            <li>See every division and weight class ranking</li>
            <li>Stay up to date with tournament results</li>
            <li>Rankings breakdowns</li>
            <li>Access future premium content and features</li>
          </ul>

          <button
            className="subscribe-button"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "Redirecting..." : "Subscribe Now"}
          </button>

          {error && <p className="paywall-error">{error}</p>}

          <p className="paywall-note">
            Cancel anytime. Secure checkout powered by Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Paywall;
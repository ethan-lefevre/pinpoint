import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import "../index.css";

function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || data.error || "Failed to load profile");
        }

        setProfile(data);
      } catch (err) {
        console.error("Profile error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [token, navigate]);

  async function handleManageSubscription() {
    try {
      setManaging(true);
      setError("");

      const res = await fetch(`${API_URL}/api/stripe/create-billing-portal-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to open billing portal");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Billing portal error:", err);
      setError(err.message || "Something went wrong");
      setManaging(false);
    }
  }

  function handleGoSubscribe() {
    navigate("/subscribe");
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-card">
          <h1 className="profile-title">Loading profile...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-badge">Account</div>

        <h1 className="profile-title">Your Profile</h1>
        <p className="profile-subtitle">
          Manage your account and subscription settings.
        </p>

        {error && <p className="profile-error">{error}</p>}

        {profile && (
          <>
            <div className="profile-section">
              <div className="profile-row">
                <span className="profile-label">Email</span>
                <span className="profile-value">{profile.email}</span>
              </div>

              <div className="profile-row">
                <span className="profile-label">Subscription</span>
                <span
                  className={
                    profile.subscribed
                      ? "profile-status active"
                      : "profile-status inactive"
                  }
                >
                  {profile.subscribed ? "Premium Active" : "No Active Subscription"}
                </span>
              </div>

              {profile.subscriptionStatus && (
                <div className="profile-row">
                  <span className="profile-label">Stripe Status</span>
                  <span className="profile-value">{profile.subscriptionStatus}</span>
                </div>
              )}
            </div>

            <div className="profile-actions">
              {profile.subscribed ? (
                <button
                  className="profile-primary-btn"
                  onClick={handleManageSubscription}
                  disabled={managing}
                >
                  {managing ? "Opening Portal..." : "Manage Subscription"}
                </button>
              ) : (
                <button
                  className="profile-primary-btn"
                  onClick={handleGoSubscribe}
                >
                  Subscribe Now
                </button>
              )}

              <button
                className="profile-secondary-btn"
                onClick={() => navigate("/rankings")}
              >
                Go to Rankings
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
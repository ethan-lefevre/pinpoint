import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../index.css";

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [scrolled, setScrolled] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  }

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 80);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔥 fetch subscription status if logged in
  useEffect(() => {
    if (!token) return;

    async function fetchProfile() {
      try {
        const res = await fetch(
          "https://pinpoint-srng.onrender.com/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setSubscribed(data.subscribed);
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
      }
    }

    fetchProfile();
  }, [token]);

  return (
    <header className={scrolled ? "header collapsed" : "header"}>
      <div className="header-inner">
        <Link to="/" className="logo-area">
          <img src="/pplogo.png" alt="PinPoint Michigan" className="logo" />
          <span className="site-title">PinPoint Michigan</span>
        </Link>

        <nav className={scrolled ? "nav-links hidden" : "nav-links"}>
          <Link to="/rankings">Rankings</Link>
          <Link to="/results">Results</Link>
          <Link to="/lotw">Letter</Link>

          {/* 👇 NOT LOGGED IN */}
          {!token && (
            <>
              <Link to="/login">Login</Link>

              <Link to="/signup" className="secondary-button">
                Sign Up
              </Link>
            </>
          )}

          {/* 👇 SHOW SUBSCRIBE IF NOT SUBSCRIBED (regardless of login) */}
          {!subscribed && (
            <Link to="/subscribe" className="subscribe-btn">
              Subscribe
            </Link>
          )}

          {/* 👇 LOGGED IN */}
          {token && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
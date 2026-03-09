import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import "../index.css"

function Header() {

  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const [scrolled, setScrolled] = useState(false)

  function handleLogout() {
    localStorage.removeItem("token")
    navigate("/")
    window.location.reload()
  }

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 80)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (

    <header className={scrolled ? "header collapsed" : "header"}>

      <div className="header-inner">

        <Link to="/" className="logo-area">
          <img src="/pinpoint_michigan_transparent_smooth.png" alt="PinPoint Michigan" className="logo"/>
          <span className="site-title">PinPoint Michigan</span>
        </Link>

        <nav className={scrolled ? "nav-links hidden" : "nav-links"}>

          <Link to="/rankings">Rankings</Link>
          <Link to="/results">Results</Link>
          <Link to="/lotw">Letter</Link>

          {!token && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/subscribe" className="subscribe-btn">Subscribe</Link>
            </>
          )}

          {token && (
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          )}

        </nav>

      </div>

    </header>

  )
}

export default Header
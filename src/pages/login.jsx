import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {

    e.preventDefault();

    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (data.token) {

      localStorage.setItem("token", data.token);
      navigate("/rankings");

    } else {

      alert("Login failed");

    }

  }

  return (

    <div className="login-page">

      <div className="login-card">

        <h1 className="login-title">Member Login</h1>

        <p className="login-subtitle">
          Access rankings, tournament results, and Letter of the Week.
        </p>

        <form className="login-form" onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="login-input"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="login-input"
            required
          />

          <button type="submit" className="login-button">
            Login
          </button>

        </form>

        <div className="login-footer">

          <p>Don't have access yet?</p>

          <a
            href="/subscribe"
            className="subscribe-link"
          >
            Subscribe here
          </a>

        </div>

      </div>

    </div>

  );

}

export default Login;
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setMessage("Invalid verification link.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Verification failed");
        }

        setMessage("Email verified! Redirecting...");

        setTimeout(() => {
          navigate("/login");
        }, 2000);

      } catch (err) {
        setMessage(err.message || "Verification failed.");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        textAlign: "center",
        padding: "2rem"
      }}
    >
      <h1>{message}</h1>
    </div>
  );
}
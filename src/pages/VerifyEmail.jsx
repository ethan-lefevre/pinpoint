import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); 
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
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

        setStatus("success");
        setMessage("Your email has been verified!");

        // redirect after 3 sec
        setTimeout(() => {
          navigate("/login");
        }, 3000);

      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Something went wrong.");
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* Icon */}
        <div style={styles.icon}>
          {status === "loading" && "⏳"}
          {status === "success" && "✅"}
          {status === "error" && "❌"}
        </div>

        {/* Title */}
        <h1 style={styles.title}>
          {status === "loading" && "Verifying..."}
          {status === "success" && "Verified"}
          {status === "error" && "Verification Failed"}
        </h1>

        {/* Message */}
        <p style={styles.message}>{message}</p>

        {/* Button */}
        {status !== "loading" && (
          <button
            style={styles.button}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
}
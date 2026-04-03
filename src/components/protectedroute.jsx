import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function ProtectedRoute({ children, endpoint }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    async function checkAccess() {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        setAllowed(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let data = {};
        try {
          data = await response.json();
        } catch (err) {
          console.error("Failed to parse protected route response:", err);
        }

        if (response.status === 401) {
          navigate("/login");
          setAllowed(false);
          return;
        }

        if (response.status === 403) {
          const message = data.message || "";

          if (message.toLowerCase().includes("verify your email")) {
            navigate("/profile");
            setAllowed(false);
            return;
          }

          if (message.toLowerCase().includes("subscription")) {
            navigate("/subscribe");
            setAllowed(false);
            return;
          }

          navigate("/profile");
          setAllowed(false);
          return;
        }

        if (response.ok) {
          setAllowed(true);
          return;
        }

        setAllowed(false);
      } catch (error) {
        console.error("Access check failed:", error);
        setAllowed(false);
      }
    }

    checkAccess();
  }, [endpoint, navigate]);

  if (allowed === null) {
    return <div>Loading...</div>;
  }

  if (allowed === false) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
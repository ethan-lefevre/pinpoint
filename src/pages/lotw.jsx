import { useState, useEffect } from "react";
import { API_URL } from "../config";

function LetterOfTheWeek() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchArticle() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/letters`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch article: ${response.status}`);
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Letter fetch error:", error);
        setError("Failed to load article.");
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, []);

  if (loading) {
    return <div className="loading">Loading article...</div>;
  }

  if (error) {
    return <div className="loading">{error}</div>;
  }

  if (!data) {
    return <div className="loading">No article found.</div>;
  }

  return (
    <div className="container">
      <div className="article-container">
        <h1 className="article-title">{data.title}</h1>

        <div className="article-meta">
          By {data.author} | {data.school} | {data.date}
        </div>

        <div className="article-body">
          {data.body?.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>

      <div className="submit-box">
        <h2>Want to be featured?</h2>

        <p>
          We want to hear from <strong>YOU.</strong>
        </p>

        <p className="email">Email submissions to:</p>

        <p className="email-address">
          <em>submissions@pinpointsports.com</em>
        </p>
      </div>
    </div>
  );
}

export default LetterOfTheWeek;

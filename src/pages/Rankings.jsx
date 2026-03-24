import { useState, useEffect } from "react";
import { API_URL } from "../config";

function Rankings() {
  const divisions = ["D1", "D2", "D3", "D4"];
  const weights = [
    "106", "113", "120", "126", "132", "138", "144",
    "150", "157", "165", "175", "190", "215", "285"
  ];

  const [division, setDivision] = useState("D1");
  const [weight, setWeight] = useState("106");

  const [rankings, setRankings] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/rankings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch rankings: ${response.status}`);
        }

        const data = await response.json();

        setRankings(data.rankings);
        setLastUpdated(data.lastUpdated);
      } catch (error) {
        console.error("Failed to fetch rankings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRankings();
  }, []);

  if (loading) {
    return <div className="loading">Loading rankings...</div>;
  }

  const currentRankings = (rankings?.[division]?.[weight] || []).sort(
    (a, b) => a.rank - b.rank
  );

  return (
    <div className="container">
      <div className="button-row">
        {divisions.map((d) => (
          <button
            key={d}
            onClick={() => setDivision(d)}
            className={division === d ? "active" : ""}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="button-row">
        {weights.map((w) => (
          <button
            key={w}
            onClick={() => setWeight(w)}
            className={weight === w ? "active" : ""}
          >
            {w}
          </button>
        ))}
      </div>

      <div className="rankings-card">
        <div className="rankings-header">
          <span>{division} | {weight}</span>
          <span>Updated {lastUpdated}</span>
        </div>

        {Array.from({ length: 16 }).map((_, i) => {
          const wrestler = currentRankings[i];

          return (
            <div
              key={i}
              className={`rank-row
              ${i === 0 ? "gold" : ""}
              ${i === 1 ? "silver" : ""}
              ${i === 2 ? "bronze" : ""}`}
            >
              <span className="rank-number">#{i + 1}</span>
              <span>
                {wrestler
                  ? `${wrestler.name} - ${wrestler.school} (${wrestler.grade})`
                  : ""}
              </span>
            </div>
          );
        })}

        <div className="footer-note">
          We worked hard to give you these rankings, please no unauthorized sharing!
        </div>
      </div>
    </div>
  );
}

export default Rankings;

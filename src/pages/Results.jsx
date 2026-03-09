import { useEffect, useState } from "react"
import "../index.css"

function Results() {

  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function fetchResults() {

      try {

        const token = localStorage.getItem("token")

        const response = await fetch("http://localhost:5000/results", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (data.tournaments) {
          setTournaments(data.tournaments)
        }

        setLoading(false)

      } catch (error) {
        console.error("Results fetch error:", error)
      }

    }

    fetchResults()

  }, [])

  if (loading) {
    return <div className="results-loading">Loading results...</div>
  }

  return (

    <div className="results-page">

      <h1 className="results-title">Tournament Results</h1>

      {tournaments.map((tournament, index) => (

        <div key={index} className="tournament-card">

          <h2 className="tournament-name">{tournament.name}</h2>

          <p className="tournament-meta">
            {tournament.date} • {tournament.location}
          </p>

          <table className="results-table">

            <thead>
              <tr>
                <th>Weight</th>
                <th>Champion</th>
                <th>Runner-Up</th>
              </tr>
            </thead>

            <tbody>

              {tournament.matches?.map((match, i) => (
                <tr key={i}>
                  <td>{match.weight}</td>
                  <td>{match.champion}</td>
                  <td>{match.runnerUp}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      ))}

    </div>

  )

}

export default Results
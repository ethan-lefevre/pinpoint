import { useState, useEffect } from "react"

function Rankings() {

  const divisions = ["D1","D2","D3","D4"]
  const weights = [
    "106","113","120","126","132","138","144",
    "150","157","165","175","190","215","285"
  ]

  const [division,setDivision] = useState("D1")
  const [weight,setWeight] = useState("106")

  const [rankings,setRankings] = useState(null)
  const [lastUpdated,setLastUpdated] = useState("")
  const [loading,setLoading] = useState(true)

  useEffect(()=>{

    async function fetchRankings(){
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("http://localhost:5000/rankings",{
          headers:{
            Authorization:`Bearer ${token}`
          }
        })
        const data = await response.json()

        setRankings(data.rankings)
        setLastUpdated(data.lastUpdated)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch rankings:", error)
        setLoading(false)
      }
    }

    fetchRankings()

  },[])

  if(loading){
    return <div className="loading">Loading rankings...</div>
  }

  // Get the current rankings for the selected division and weight
  const currentRankings =
    (rankings?.[division]?.[weight] || [])
    .sort((a,b) => a.rank - b.rank) // ensure sorted by rank

  return (

    <div className="container">

      {/* Division buttons */}
      <div className="button-row">
        {divisions.map(d => (
          <button
            key={d}
            onClick={()=>setDivision(d)}
            className={division===d ? "active" : ""}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Weight buttons */}
      <div className="button-row">
        {weights.map(w => (
          <button
            key={w}
            onClick={()=>setWeight(w)}
            className={weight===w ? "active" : ""}
          >
            {w}
          </button>
        ))}
      </div>

      {/* Rankings card */}
      <div className="rankings-card">

        <div className="rankings-header">
          <span>{division} • {weight}</span>
          <span>Updated {lastUpdated}</span>
        </div>

        {Array.from({ length: 16 }).map((_,i)=>{

          const wrestler = currentRankings[i]

          return(
            <div
              key={i}
              className={`rank-row
              ${i===0?"gold":""}
              ${i===1?"silver":""}
              ${i===2?"bronze":""}`}
            >
              <span className="rank-number">#{i+1}</span>
              <span>
                {wrestler
                  ? `${wrestler.name} – ${wrestler.school} (${wrestler.grade})`
                  : ""}
              </span>
            </div>
          )
        })}

        <div className="footer-note">
          These rankings are free. Feel free to share!
        </div>

      </div>

    </div>

  )

}

export default Rankings
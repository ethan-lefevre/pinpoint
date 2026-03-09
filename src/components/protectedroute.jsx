import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function ProtectedRoute({ children, endpoint }) {

  const navigate = useNavigate()
  const [allowed, setAllowed] = useState(null)

  useEffect(() => {

    async function checkAccess() {

      const token = localStorage.getItem("token")

      if (!token) {
        navigate("/login")
        setAllowed(false)
        return
      }

      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 401) {
        navigate("/login")
        setAllowed(false)
        return
      }

      if (response.status === 403) {
        navigate("/subscribe")
        setAllowed(false)
        return
      }

      if (response.ok) {
        setAllowed(true)
      }

    }

    checkAccess()

  }, [endpoint, navigate])

  if (allowed === null) {
    return <div>Loading...</div>
  }

  if (allowed === false) {
    return null
  }

  return children
}

export default ProtectedRoute
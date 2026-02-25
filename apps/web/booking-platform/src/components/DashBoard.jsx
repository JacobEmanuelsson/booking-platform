import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashBoard() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
          await logout()
    } catch (error) {
      
    }finally {
        setLoading(false)

    navigate('/login')
  }     
    }

  return(
      <div>
          <h1>hello {user?.email}</h1>
          <button onClick={handleLogout} disabled={loading}>
              {loading ? 'Logging out...' : 'Logout'}
          </button>
      </div>
  )
}

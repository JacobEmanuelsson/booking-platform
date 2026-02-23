import { useState } from 'react'
import { login } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login: setAuth } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    // TODO: Add your login logic here
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
        await login(email, password)
        setSuccess(true)
        setEmail('')
        setPassword('')
        
    } catch (err) {
        setError(err.message)
    }
    finally {
        setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <h2>Login</h2>
      {success && <p className="success-message">Registration successful!</p>}
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  )
}

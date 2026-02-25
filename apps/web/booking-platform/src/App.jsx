import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import RegisterForm from './components/RegisterForm'
import LoginPage from './components/LoginPage'
import DashBoard from './components/DashBoard'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/" element={
            <div className="app-container">
              <h1>Welcome to Booking Platform</h1>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

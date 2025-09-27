import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import SpeakerDashboard from './pages/SpeakerDashboard'
import SessionForm from './pages/SessionForm'
import AgendaPage from './pages/AgendaPage'
import EventToolsPage from './pages/EventToolsPage'
import DatabaseTestPage from './pages/DatabaseTestPage'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <SpeakerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/session/submit" element={
            <ProtectedRoute>
              <SessionForm />
            </ProtectedRoute>
          } />
          
          <Route path="/session/edit/:sessionId" element={
            <ProtectedRoute>
              <SessionForm />
            </ProtectedRoute>
          } />
          
          <Route path="/agenda" element={
            <ProtectedRoute>
              <AgendaPage />
            </ProtectedRoute>
          } />
          
          <Route path="/tools" element={
            <ProtectedRoute>
              <EventToolsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/database-test" element={
            <ProtectedRoute>
              <DatabaseTestPage />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import App from './App.jsx'
import LoginPage from './pages/LoginPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Student from './pages/Student.jsx'
import KodeSiswa from './pages/KodeSiswa.jsx'
import Ujian from './pages/Ujian.jsx'
import './index.css'
import './styles/animations.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'guru']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <Student />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/kode-siswa" 
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <KodeSiswa />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ujian/:kode" 
            element={
              <ProtectedRoute allowedRoles={['siswa']}>
                <Ujian />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
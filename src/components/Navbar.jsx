import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const closeMenu = () => setOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    closeMenu()
  }

  const handleDashboard = () => {
    if (user?.role === 'siswa') {
      navigate('/student')
    } else {
      navigate('/dashboard')
    }
    closeMenu()
  }

  return (
    <nav className="fixed top-0 w-full z-50 navbar-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">
              <span className="text-blue-500">Ruang</span> Kelas
            </div>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#home" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Beranda</a>
              <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Fitur</a>
              {/* <a href="#stats" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Statistik</a> */}
              <a href="#contact" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Kontak</a>
              
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-300 text-sm">
                    {user?.namaLengkap || user?.username}
                  </span>
                  <button
                    onClick={handleDashboard}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Masuk
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen(o => !o)}
              className="text-gray-300 hover:text-white p-2"
            >
              {open ? (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${open ? '' : 'hidden'} bg-black bg-opacity-95`}>
        <div className="px-4 pt-2 pb-4 space-y-1">
          <a onClick={closeMenu} href="#home" className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium">Beranda</a>
          <a onClick={closeMenu} href="#features" className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium">Fitur</a>
          <a onClick={closeMenu} href="#stats" className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium">Statistik</a>
          <a onClick={closeMenu} href="#contact" className="block text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium">Kontak</a>
          
          {isAuthenticated ? (
            <div className="space-y-2 pt-2 border-t border-gray-700">
              <div className="text-gray-300 px-3 py-2 text-sm">
                {user?.namaLengkap || user?.username}
              </div>
              <button
                onClick={handleDashboard}
                className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium block"
              >
                Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-base font-medium block"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" onClick={closeMenu} className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-base font-medium mt-2 block">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}


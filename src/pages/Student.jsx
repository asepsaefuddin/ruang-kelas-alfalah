import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { studentService } from '../services/studentService'

export default function Student() {
  const { user, logout, isAuthenticated, token } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalSoal: 0,
    soalSelesai: 0,
    rataRataNilai: 0,
    totalNilai: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Redirect non-siswa to appropriate page
    if (user?.role !== 'siswa') {
      if (user?.role === 'admin' || user?.role === 'guru') {
        navigate('/dashboard')
      } else {
        navigate('/')
      }
      return
    }

    // Load student statistics
    loadStudentStats()
  }, [isAuthenticated, user, navigate, token])

  const loadStudentStats = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('📊 [Student] Loading profile data...')
      
      // Ambil statistik khusus akun siswa (server-side per user)
      const myStats = await studentService.getMyStatistics(token)
      console.log('📊 [Student] My stats:', myStats)
      setStats({
        totalSoal: myStats.totalSoal || 0,
        soalSelesai: myStats.soalSelesai || 0,
        rataRataNilai: myStats.rataRataNilai || 0,
        totalNilai: myStats.totalNilai || 0,
      })
      
    } catch (error) {
      console.error('❌ [Student] Error loading profile:', error)
      
      // Set default stats jika error
      setStats({
        totalSoal: 0,
        soalSelesai: 0,
        rataRataNilai: 0,
        totalNilai: 0,
        message: "Belum ada data statistik tersedia"
      })
      
      setError('Gagal memuat data profil')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user || user.role !== 'siswa') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-blue-600">Ruang</span> Kelas
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.namaLengkap || user.username}</span>
                <span className="ml-2 text-gray-400">({user.kelas || 'Kelas tidak tersedia'})</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Selamat Datang, {user.namaLengkap || user.username}!
              </h2>
              <p className="text-gray-600">
                Anda login sebagai siswa dari kelas <span className="font-semibold">{user.kelas || 'Tidak tersedia'}</span>
              </p>
            </div>
            <button
              onClick={loadStudentStats}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memuat...
                </span>
              ) : (
                'Refresh'
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ujian Diikuti</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.totalSoal
                  )}
                </p>
                {!loading && stats.totalSoal === 0 && (
                  <p className="text-xs text-gray-500">Belum ikuti ujian</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ujian Selesai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    stats.soalSelesai
                  )}
                </p>
                {!loading && stats.soalSelesai === 0 && (
                  <p className="text-xs text-gray-500">Belum ada yang selesai</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata Nilai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : stats.rataRataNilai > 0 ? (
                    <span className={`${stats.rataRataNilai >= 75 ? 'text-green-600' : stats.rataRataNilai >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {stats.rataRataNilai}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </p>
                {!loading && stats.rataRataNilai === 0 && (
                  <p className="text-xs text-gray-500">Belum ada nilai</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Message */}
        {!loading && stats.message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <span className="text-blue-400 mr-2">💡</span>
              {stats.message}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Available Tests */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Akses Ujian</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => navigate('/kode-siswa')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-sm transition-colors duration-200 text-left"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-500 rounded-lg mr-4">
                  <span className="text-2xl">🔑</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg">Masukkan Kode Ujian</h4>
                  <p className="text-blue-100 text-sm">Akses ujian dengan kode dari guru</p>
                </div>
              </div>
            </button>
            
            <div className="bg-gray-100 p-6 rounded-lg text-left opacity-50">
              <div className="flex items-center">
                <div className="p-3 bg-gray-300 rounded-lg mr-4">
                  <span className="text-2xl">📋</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-gray-600">Riwayat Ujian</h4>
                  <p className="text-gray-500 text-sm">Lihat hasil ujian sebelumnya</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Available Tests List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Soal Tersedia</h3>
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📝</span>
            <h4 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Soal</h4>
            <p className="text-gray-500 mb-4">
              Saat ini belum ada soal yang tersedia untuk dikerjakan. 
              Silakan hubungi guru Anda untuk informasi lebih lanjut.
            </p>
            <p className="text-blue-600 font-medium">
              💡 Gunakan tombol "Masukkan Kode Ujian" di atas untuk memulai ujian
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
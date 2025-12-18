import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { userService } from '../services/userService'
import { statisticsService } from '../services/statisticsService'
import { soalService } from '../services/soalService'
import { reportsService } from '../services/reportsService'
import ReportDetailModal from '../components/ReportDetailModal'
import Swal from 'sweetalert2'
import { BarChart3, Users, HelpCircle, FileText, TrendingUp, LogOut, Menu, Calendar, Award, Activity, Zap, BookOpen, Target, Plus, Edit2, Trash2, Eye, Upload, X } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import '../styles/template3.css'
import SoalImport from '../components/SoalImport'
import * as XLSX from 'xlsx'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Dashboard() {
  const [activePage, setActivePage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  // Fungsi untuk menampilkan SweetAlert sukses
  const showSuccessAlert = (message) => {
    Swal.fire({
      title: 'Berhasil!',
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
      confirmButtonColor: '#22c55e',
      timer: 3000,
      timerProgressBar: true
    });
  }
  
  // Fungsi untuk menampilkan SweetAlert error
  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Oops!',
      text: message,
      icon: 'error',
      confirmButtonText: 'Coba Lagi',
      confirmButtonColor: '#ef4444',
      timer: 5000,
      timerProgressBar: true
    });
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    // Redirect siswa to student page
    if (user?.role === 'siswa') {
      navigate('/student')
      return
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
  }, [mobileOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Menu items based on role
  const getMenuItems = () => {
    const baseItems = [
      { key: 'dashboard', icon: <BarChart3 size={18} />, label: 'Dashboard' }
    ]

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { key: 'users', icon: <Users size={18} />, label: 'Management User' },
        { key: 'questions', icon: <HelpCircle size={18} />, label: 'Buat Soal' },
        { key: 'reports', icon: <FileText size={18} />, label: 'Laporan Penilaian' },
        { key: 'statistics', icon: <TrendingUp size={18} />, label: 'Statistik' },
      ]
    } else if (user?.role === 'guru') {
      return [
        ...baseItems,
        { key: 'questions', icon: <HelpCircle size={18} />, label: 'Buat Soal' },
        { key: 'reports', icon: <FileText size={18} />, label: 'Laporan Penilaian' },
        // Note: Statistics removed for guru as per requirements
      ]
    }

    return baseItems
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <button className="mobile-menu-toggle" onClick={() => setMobileOpen(v => !v)}>
        <Menu size={20} />
      </button>
      <div className={`mobile-overlay ${mobileOpen ? 'active' : ''}`} onClick={() => setMobileOpen(false)}></div>

      <nav className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo"><span className="nav-text">EduAdmin</span></div>
          <div className="user-info" style={{ padding: '10px', borderTop: '1px solid #e5e7eb', marginTop: '10px' }}>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '0' }}>
              {user.namaLengkap || user.username}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '10px', margin: '0', textTransform: 'capitalize' }}>
              {user.role}
            </p>
          </div>
        </div>
        <ul className="nav-menu">
          {getMenuItems().map(item => (
            <li key={item.key} className="nav-item">
              <a href="#" className={`nav-link ${activePage === item.key ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActivePage(item.key); setMobileOpen(false) }}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.label}</span>
              </a>
            </li>
          ))}
          <li className="nav-item" style={{ marginTop: 'auto', borderTop: '1px solid #e5e7eb', paddingTop: '10px' }}>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); handleLogout() }}>
              <span className="nav-icon"><LogOut size={18} /></span>
              <span className="nav-text">Logout</span>
            </a>
          </li>
        </ul>
      </nav>

      <main className="main-content">
        {/* Dashboard Page */}
        <DashboardOverview activePage={activePage} user={user} />

        {/* Users Page */}
        <UserManagementPage activePage={activePage} user={user} />

        {/* Questions Page */}
        <QuestionManagementPage activePage={activePage} user={user} />

        {/* Reports Page */}
        <ReportsPage activePage={activePage} user={user} />

        {/* Statistics Page - Admin Only */}
        {user?.role === 'admin' && <StatisticsPage activePage={activePage} user={user} />}
      </main>
    </div>
  )
}

// User Management Component
function UserManagementPage({ activePage, user }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [filters, setFilters] = useState({ role: '', kelas: '', mataPelajaran: '', search: '' })
  const [editingUser, setEditingUser] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploadingExcel, setUploadingExcel] = useState(false)
  
  // Form data state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    namaLengkap: '',
    nipNim: '',
    role: '',
    status: 'aktif',
    kelas: '',
    mataPelajaran: ''
  })

  const { token } = useAuth()

  // Load users on component mount and filter changes (debounced for search)
  useEffect(() => {
    if (activePage === 'users') {
      // Debounce search input to avoid too many API calls
      const timer = setTimeout(() => {
        loadUsers()
      }, filters.search ? 500 : 0) // 500ms delay for search, immediate for other filters
      
      return () => clearTimeout(timer)
    }
  }, [activePage, pagination.page, filters])

  // Clear messages sudah ditangani oleh SweetAlert2 dengan timer

  const loadUsers = async () => {
    setLoading(true)
    
    try {
      const result = await userService.getAllUsers(token, pagination.page, pagination.limit, filters)
      setUsers(result.data)
      setPagination(prev => ({ ...prev, ...result.pagination }))
    } catch (error) {
      showErrorAlert('Tidak dapat memuat daftar pengguna. Mungkin koneksi internet terputus atau server sedang sibuk. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  // Download template Excel sederhana (satu sheet, header tebal)
  const handleDownloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new()

      // Header langsung di baris pertama agar backend bisa membaca dengan benar
      const data = [
        ['username', 'password', 'namaLengkap', 'nipNim', 'role', 'status', 'kelas', 'mataPelajaran'],
        ['siswa001', 'password123', 'Ahmad Rizki Maulana', '20230001', 'siswa', 'aktif', '10A', ''],
        ['siswa002', 'password123', 'Budi Santoso', '20230002', 'siswa', 'aktif', '10B', ''],
        ['guru001', 'password123', 'Siti Nurhaliza S.Pd', '198501001', 'guru', 'aktif', '', 'Matematika'],
        ['guru002', 'password123', 'Budi Hartono M.Pd', '198502002', 'guru', 'aktif', '', 'Fisika'],
        ['admin001', 'password123', 'Muhammad Fadli', '197001001', 'admin', 'aktif', '', ''],
      ]

      const ws = XLSX.utils.aoa_to_sheet(data)

      // Set lebar kolom
      ws['!cols'] = [
        { wch: 18 },{ wch: 18 },{ wch: 30 },{ wch: 18 },{ wch: 12 },{ wch: 15 },{ wch: 18 },{ wch: 25 }
      ]

      XLSX.utils.book_append_sheet(wb, ws, 'Template Import User')
      XLSX.writeFile(wb, 'Template_Import_User.xlsx')
      showSuccessAlert('Template Excel berhasil didownload! Pastikan header di baris pertama dan jangan ubah nama kolom.')
    } catch (error) {
      showErrorAlert('Gagal membuat template: ' + error.message)
    }
  }

  // Upload file Excel untuk generate users
  const handleUploadExcel = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    
    if (!validTypes.includes(file.type)) {
      showErrorAlert('Format file tidak valid. Gunakan file Excel (.xlsx atau .xls)')
      // Reset all file inputs
      const uploadInput = document.getElementById('excel-upload')
      const generateInput = document.getElementById('excel-generate')
      if (uploadInput) uploadInput.value = ''
      if (generateInput) generateInput.value = ''
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      showErrorAlert('Ukuran file terlalu besar. Maksimal 5MB')
      // Reset all file inputs
      const uploadInput = document.getElementById('excel-upload')
      const generateInput = document.getElementById('excel-generate')
      if (uploadInput) uploadInput.value = ''
      if (generateInput) generateInput.value = ''
      return
    }

    setUploadingExcel(true)
    
    try {
      const result = await userService.bulkCreateUsers(token, file)
      
      // Show detailed result
      let resultHtml = `
        <div style="text-align: left; margin: 15px 0;">
          <h3 style="margin: 10px 0; color: #1f2937;">📊 Hasil Upload & Generate User:</h3>
          <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 10px 0;">
            <p style="margin: 5px 0;"><strong>Total:</strong> ${result.summary.total} user</p>
            <p style="margin: 5px 0; color: #059669;"><strong>✅ Berhasil:</strong> ${result.summary.created} user</p>
            <p style="margin: 5px 0; color: #dc2626;"><strong>❌ Gagal:</strong> ${result.summary.failed} user</p>
          </div>
      `

      if (result.results.created.length > 0) {
        resultHtml += `
          <div style="margin: 15px 0;">
            <h4 style="color: #059669; margin: 8px 0;">✅ User Berhasil Dibuat:</h4>
            <div style="max-height: 150px; overflow-y: auto; background: #f0fdf4; padding: 10px; border-radius: 6px; border-left: 4px solid #059669;">
              ${result.results.created.map((u, i) => `
                <p style="margin: 4px 0; font-size: 13px;">${i + 1}. ${u.namaLengkap} (${u.username}) - ${u.role}</p>
              `).join('')}
            </div>
          </div>
        `
      }

      if (result.results.failed.length > 0) {
        resultHtml += `
          <div style="margin: 15px 0;">
            <h4 style="color: #dc2626; margin: 8px 0;">❌ User Gagal Dibuat:</h4>
            <div style="max-height: 150px; overflow-y: auto; background: #fef2f2; padding: 10px; border-radius: 6px; border-left: 4px solid #dc2626;">
              ${result.results.failed.map(f => `
                <p style="margin: 4px 0; font-size: 13px;">
                  <strong>Baris ${f.row}:</strong> ${f.namaLengkap || f.username || 'Data tidak lengkap'}<br/>
                  <span style="color: #991b1b;">Error: ${f.error}</span>
                </p>
              `).join('')}
            </div>
          </div>
        `
      }

      resultHtml += '</div>'

      await Swal.fire({
        title: result.summary.failed === 0 ? 'Berhasil! 🎉' : 'Selesai dengan Peringatan',
        html: resultHtml,
        icon: result.summary.failed === 0 ? 'success' : 'warning',
        confirmButtonText: 'OK',
        width: '600px'
      })

      // Reload user list
      loadUsers()
      
    } catch (error) {
      showErrorAlert(error.message || 'Gagal mengupload file Excel dan generate users')
    } finally {
      setUploadingExcel(false)
      // Reset all file inputs after processing
      const uploadInput = document.getElementById('excel-upload')
      const generateInput = document.getElementById('excel-generate')
      if (uploadInput) uploadInput.value = ''
      if (generateInput) generateInput.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate form data
      const isEdit = !!editingUser
      const validation = userService.validateUserData(formData, isEdit)
      if (!validation.isValid) {
        showErrorAlert(validation.errors.join(', '))
        setLoading(false)
        return
      }

      // Format data for API
      const userData = userService.formatUserData(formData, isEdit)

      let result
      if (editingUser) {
        // Update existing user
        result = await userService.updateUser(token, editingUser._id, userData)
        showSuccessAlert('Data pengguna berhasil diperbarui!')
      } else {
        // Create new user
        result = await userService.createUser(token, userData)
        showSuccessAlert('Pengguna baru berhasil dibuat!')
      }

      // Reset form and reload users
      resetForm()
      loadUsers()
      
    } catch (error) {
      showErrorAlert('Hmm, sepertinya ada masalah saat menyimpan data pengguna. Koneksi internet mungkin terputus atau server sedang sibuk. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username || '',
      password: '', // Don't pre-fill password for security
      namaLengkap: user.namaLengkap || '',
      nipNim: user.nipNim || '',
      role: user.role || '',
      status: user.status || 'aktif',
      kelas: user.kelas || '',
      mataPelajaran: user.mataPelajaran || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (userId) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data pengguna yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    
    if (!result.isConfirmed) return;

    setLoading(true)
    
    try {
      await userService.deleteUser(token, userId)
      
      // Perbarui state lokal dengan filter untuk respons yang lebih cepat
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
      
      showSuccessAlert('Pengguna berhasil dihapus dari sistem!')
      
      // Muat ulang data dari server untuk memastikan sinkronisasi
      setTimeout(() => {
        if (users.length <= 1 && pagination.page > 1) {
          handlePageChange(pagination.page - 1);
        } else {
          loadUsers();
        }
      }, 300);
    } catch (error) {
      showErrorAlert('Gagal menghapus pengguna. Server mungkin sedang sibuk atau terjadi masalah dengan koneksi. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      namaLengkap: '',
      nipNim: '',
      role: '',
      status: 'aktif',
      kelas: '',
      mataPelajaran: ''
    })
    setEditingUser(null)
    setShowForm(false)
  }

  const downloadExcelTemplate = () => {
    // Create template content
    const templateContent = `username,password,namaLengkap,nipNim,role,status,kelas,mataPelajaran
siswa001,password123,Ahmad Budiman,2024001,siswa,aktif,10A,
siswa002,password123,Siti Nurhaliza,2024002,siswa,aktif,10B,
guru001,password123,Dr. Budi Santoso,1990001,guru,aktif,,Matematika
guru002,password123,Ir. Siti Aminah,1990002,guru,aktif,,Fisika
admin001,password123,Super Admin,1980001,admin,aktif,,`

    // Create blob and download
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_user.csv')
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showSuccessAlert('Template berhasil diunduh! Silakan isi data user dan upload kembali.')
  }

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  if (activePage !== 'users') return null

  return (
    <div id="users" className="page active">
      <div className="page-header">
        <h1 className="page-title">Management User</h1>
        <p className="page-subtitle">Kelola pengguna sistem pembelajaran</p>
      </div>
      
      {/* Error and Success Messages sekarang ditangani oleh SweetAlert2 */}

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '❌ Tutup Form' : '➕ Tambah User Baru'}
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={loadUsers}
          disabled={loading}
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>

        {/* Download Template Button */}
        <button 
          className="btn btn-success" 
          onClick={handleDownloadTemplate}
          disabled={uploadingExcel}
          style={{ 
            backgroundColor: '#10b981', 
            color: '#fff', 
            borderColor: '#10b981',
            cursor: uploadingExcel ? 'not-allowed' : 'pointer',
            opacity: uploadingExcel ? 0.6 : 1
          }}
        >
          📥 Download Template Excel
        </button>

        {/* Upload Excel & Generate Users Button */}
        <label 
          htmlFor="excel-upload" 
          className="btn btn-info" 
          style={{ 
            backgroundColor: '#3b82f6',
            color: '#fff',
            borderColor: '#3b82f6',
            cursor: uploadingExcel ? 'not-allowed' : 'pointer',
            opacity: uploadingExcel ? 0.6 : 1,
            margin: 0 
          }}
        >
          {uploadingExcel ? '⏳ Uploading & Generating...' : '📤 Upload Excel & Generate Users'}
          <input 
            id="excel-upload" 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleUploadExcel} 
            disabled={uploadingExcel} 
            style={{ display: 'none' }} 
          />
        </label>

        {/* Generate User Button (Alternative - same function as upload) */}
        <label 
          htmlFor="excel-generate" 
          className="btn btn-warning" 
          style={{ 
            backgroundColor: '#f59e0b',
            color: '#fff',
            borderColor: '#f59e0b',
            cursor: uploadingExcel ? 'not-allowed' : 'pointer',
            opacity: uploadingExcel ? 0.6 : 1,
            margin: 0 
          }}
        >
          {uploadingExcel ? '⚡ Generating...' : '⚡ Generate User dari Excel'}
          <input 
            id="excel-generate" 
            type="file" 
            accept=".xlsx,.xls" 
            onChange={handleUploadExcel} 
            disabled={uploadingExcel} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>

      {/* User Form */}
      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#1f2937', marginBottom: 20 }}>
            {editingUser ? 'Edit User' : 'Tambah User Baru'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Username */}
              <div className="form-group">
                <label className="form-label">Username *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Masukkan username" 
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  required 
                />
              </div>
              
              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder={editingUser ? "Kosongkan jika tidak diubah" : "Masukkan password"} 
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={!editingUser}
                />
              </div>
              
              {/* Nama Lengkap */}
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Masukkan nama lengkap" 
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData(prev => ({ ...prev, namaLengkap: e.target.value }))}
                  required 
                />
              </div>
              
              {/* NIP/NIM */}
              <div className="form-group">
                <label className="form-label">NIP/NIM *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Masukkan NIP/NIM" 
                  value={formData.nipNim}
                  onChange={(e) => setFormData(prev => ({ ...prev, nipNim: e.target.value }))}
                  required 
                />
              </div>
              
              {/* Role */}
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select 
                  className="form-select" 
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  required
                >
                  <option value="">Pilih Role</option>
                  <option value="siswa">Siswa</option>
                  <option value="guru">Guru</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              {/* Status */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select" 
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="aktif">Aktif</option>
                  <option value="tidak aktif">Tidak Aktif</option>
                </select>
              </div>
              
              {/* Kelas - Only for Siswa */}
              {formData.role === 'siswa' && (
                <div className="form-group">
                  <label className="form-label">Kelas *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: 10A, 11IPA1" 
                    value={formData.kelas}
                    onChange={(e) => setFormData(prev => ({ ...prev, kelas: e.target.value }))}
                    required 
                  />
                </div>
              )}
              
              {/* Mata Pelajaran - Only for Guru */}
              {formData.role === 'guru' && (
                <div className="form-group">
                  <label className="form-label">Mata Pelajaran *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: Matematika, Fisika" 
                    value={formData.mataPelajaran}
                    onChange={(e) => setFormData(prev => ({ ...prev, mataPelajaran: e.target.value }))}
                    required 
                  />
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ marginRight: '10px' }}
              >
                {loading ? 'Menyimpan...' : (editingUser ? 'Update User' : 'Tambah User')}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={resetForm}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="form-container" style={{ marginBottom: '20px' }}>
        <h3 style={{ color: '#1f2937', marginBottom: 15 }}>Cari & Filter Users</h3>
        
        {/* Global Search */}
        <div style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">🔍 Pencarian Global</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Cari berdasarkan username, nama, NIP/NIM, kelas, atau mata pelajaran..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ fontSize: '16px', padding: '12px' }}
            />
            <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px', display: 'block' }}>
              Tip: Ketik sebagian kata saja, pencarian tidak sensitif huruf besar/kecil
            </small>
          </div>
        </div>

        {/* Specific Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select 
              className="form-select" 
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">Semua Role</option>
              <option value="siswa">Siswa</option>
              <option value="guru">Guru</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Kelas (sebagian)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Contoh: 10, IPA, A"
              value={filters.kelas}
              onChange={(e) => handleFilterChange('kelas', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mata Pelajaran (sebagian)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Contoh: Mat, Fis, Indo"
              value={filters.mataPelajaran}
              onChange={(e) => handleFilterChange('mataPelajaran', e.target.value)}
            />
          </div>
        </div>
        
        {/* Clear Filters Button */}
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setFilters({ role: '', kelas: '', mataPelajaran: '', search: '' })}
            style={{ padding: '8px 16px' }}
          >
            🗑️ Bersihkan Filter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <h3 style={{ color: '#1f2937', marginBottom: 20 }}>
          Daftar User ({pagination.total} total)
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: '#6b7280' }}>🔄 Memuat data users...</div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: '#6b7280' }}>Tidak ada data user</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Nama Lengkap</th>
                <th>NIP/NIM</th>
                <th>Role</th>
                <th>Kelas/Mapel</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.namaLengkap}</td>
                  <td>{user.nipNim}</td>
                  <td>
                    <span style={{ 
                      background: user.role === 'admin' ? '#dc2626' : user.role === 'guru' ? '#059669' : '#3b82f6',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{user.kelas || user.mataPelajaran || '-'}</td>
                  <td>
                    <span style={{ 
                      background: user.status === 'aktif' ? '#22c55e' : '#6b7280',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ marginRight: 5, padding: '5px 10px' }}
                      onClick={() => handleEdit(user)}
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '5px 10px' }}
                      onClick={() => handleDelete(user._id)}
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '10px', 
            marginTop: '20px' 
          }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{ padding: '8px 12px' }}
            >
              ← Prev
            </button>
            
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              style={{ padding: '8px 12px' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Statistics Page Component - Admin Only
function StatisticsPage({ activePage, user }) {
  const [statistics, setStatistics] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { token } = useAuth()

  // Load statistics when page is active
  useEffect(() => {
    console.log('🔍 StatisticsPage useEffect triggered:', { activePage, userRole: user?.role });
    if (activePage === 'statistics' && user?.role === 'admin') {
      loadStatistics()
    }
  }, [activePage, user])

  const loadStatistics = async () => {
    console.log('📊 Loading statistics...');
    setLoading(true)
    
    try {
      const result = await statisticsService.getAllStatistics(token, user.role)
      console.log('✅ Statistics loaded:', result);
      setStatistics(result.data)
    } catch (error) {
      console.error('❌ Statistics error:', error);
      showErrorAlert('Gagal memuat data statistik. Coba muat ulang halaman ini.')
    } finally {
      setLoading(false)
    }
  }

  console.log('🎯 StatisticsPage render:', { activePage, userRole: user?.role, shouldShow: activePage === 'statistics' && user?.role === 'admin' });

  if (activePage !== 'statistics' || user?.role !== 'admin') {
    console.log('🚫 StatisticsPage not showing:', { activePage, userRole: user?.role });
    return null;
  }

  return (
    <div id="statistics" className="page active">
      <div className="page-header">
        <h1 className="page-title">Statistik</h1>
        <p className="page-subtitle">Analisis mendalam performa sistem dan pengguna</p>
      </div>

      {/* Debug Info */}
      {/* <div style={{ 
        background: 'rgba(59, 130, 246, 0.1)', 
        border: '1px solid rgba(59, 130, 246, 0.3)', 
        color: '#1d4ed8', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <div>Debug: Page={activePage}, Role={user?.role}, Loading={loading.toString()}, Error={error || 'none'}</div>
        <div>Statistics Keys: {Object.keys(statistics).join(', ') || 'none'}</div>
        <div>General Keys: {statistics.general ? Object.keys(statistics.general).join(', ') : 'none'}</div>
        <div>Activity Keys: {statistics.activity ? Object.keys(statistics.activity).join(', ') : 'none'}</div>
        <div>Performance Keys: {statistics.performance ? Object.keys(statistics.performance).join(', ') : 'none'}</div>
        <div>Quick Keys: {statistics.quick ? Object.keys(statistics.quick).join(', ') : 'none'}</div>
        <div style={{ marginTop: '8px', fontSize: '12px', fontFamily: 'monospace', maxHeight: '200px', overflow: 'auto' }}>
          {(() => {
            try {
              return JSON.stringify(statistics, null, 2);
            } catch (e) {
              return 'Unable to stringify statistics: ' + e.message;
            }
          })()}
        </div>
      </div> */}

      {/* Error Message sekarang ditangani oleh SweetAlert2 */}

      {/* Refresh Button */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={loadStatistics}
          disabled={loading}
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh Data'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ color: '#6b7280' }}>🔄 Memuat data statistik...</div>
        </div>
      ) : Object.keys(statistics).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ color: '#6b7280' }}>Tidak ada data statistik. Klik "Refresh Data" untuk memuat ulang.</div>
        </div>
      ) : (
        <>
          {/* General Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-trend"><Users size={24} /></span>
              <span className="stat-number">{typeof statistics.general?.userStats?.totalUsers === 'number' ? statistics.general.userStats.totalUsers : 0}</span>
              <span className="stat-label">Total User</span>
            </div>
            <div className="stat-card">
              <span className="stat-trend"><Users size={24} color="#059669" /></span>
              <span className="stat-number">{typeof statistics.general?.userStats?.totalGuru === 'number' ? statistics.general.userStats.totalGuru : 0}</span>
              <span className="stat-label">Guru</span>
            </div>
            <div className="stat-card">
              <span className="stat-trend"><Users size={24} color="#3b82f6" /></span>
              <span className="stat-number">{typeof statistics.general?.userStats?.totalSiswa === 'number' ? statistics.general.userStats.totalSiswa : 0}</span>
              <span className="stat-label">Siswa</span>
            </div>
            <div className="stat-card">
              <span className="stat-trend"><Users size={24} color="#dc2626" /></span>
              <span className="stat-number">{typeof statistics.general?.userStats?.totalAdmin === 'number' ? statistics.general.userStats.totalAdmin : 0}</span>
              <span className="stat-label">Admin</span>
            </div>
            <div className="stat-card">
              <span className="stat-trend"><TrendingUp size={24} color="#22c55e" /></span>
              <span className="stat-number">{typeof statistics.general?.userStats?.usersByStatus?.aktif === 'number' ? statistics.general.userStats.usersByStatus.aktif : 0}</span>
              <span className="stat-label">User Aktif</span>
            </div>
            <div className="stat-card">
              <span className="stat-trend"><TrendingUp size={24} color="#6b7280" /></span>
              <span className="stat-number">{typeof statistics.general?.userStats?.usersByStatus?.tidakAktif === 'number' ? statistics.general.userStats.usersByStatus.tidakAktif : 0}</span>
              <span className="stat-label">User Tidak Aktif</span>
            </div>
          </div>

          {/* AI Summary and Activity */}
          <div className="card-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">AI Analitik Insights</h3>
                <span className="card-icon"><BarChart3 size={20} /></span>
              </div>
              <div className="card-content">
                <div className="chart-container" style={{ height: 'auto', minHeight: 150, padding: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>🤖 Gemini AI Summary</p>
                    <p style={{ fontSize: '.9rem', opacity: .8, margin: '0 0 15px 0', lineHeight: '1.4' }}>
                      {typeof statistics.aiSummary?.summary === 'string' ? statistics.aiSummary.summary : 'Ringkasan AI tidak tersedia'}
                    </p>
                    {statistics.aiSummary?.keyInsights && Array.isArray(statistics.aiSummary.keyInsights) && (
                      <div style={{ marginTop: 15 }}>
                        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#4f46e5', fontWeight: '600' }}>Key Insights:</h4>
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: '8px', 
                          justifyContent: 'center',
                          maxWidth: '100%',
                          margin: '0 auto'
                        }}>
                          {statistics.aiSummary.keyInsights.map((insight, index) => (
                            <span 
                              key={index}
                              style={{ 
                                background: ['#4f46e5', '#7c3aed', '#ec4899'][index % 3], 
                                padding: '6px 12px', 
                                borderRadius: 16, 
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '500',
                                display: 'inline-block',
                                maxWidth: '200px',
                                textAlign: 'center',
                                lineHeight: '1.3',
                                wordBreak: 'break-word'
                              }}
                            >
                              {typeof insight === 'string' ? insight : JSON.stringify(insight)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Activity Statistics</h3>
                <span className="card-icon"><TrendingUp size={20} /></span>
              </div>
              <div className="card-content">
                <div style={{ marginBottom: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>User Registrations</span>
                    <span>{Array.isArray(statistics.activity?.userRegistrations) ? statistics.activity.userRegistrations.reduce((sum, item) => sum + item.count, 0) : 0}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', height: 8, borderRadius: 4 }}>
                    <div style={{ 
                      background: '#4f46e5', 
                      height: '100%', 
                      width: `${Math.min((Array.isArray(statistics.activity?.userRegistrations) ? statistics.activity.userRegistrations.reduce((sum, item) => sum + item.count, 0) : 0) / 20 * 100, 100)}%`, 
                      borderRadius: 4 
                    }}></div>
                  </div>
                </div>
                
                <div style={{ marginBottom: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Soal Creations</span>
                    <span>{Array.isArray(statistics.activity?.soalCreations) ? statistics.activity.soalCreations.reduce((sum, item) => sum + item.count, 0) : 0}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', height: 8, borderRadius: 4 }}>
                    <div style={{ 
                      background: '#7c3aed', 
                      height: '100%', 
                      width: `${Math.min((Array.isArray(statistics.activity?.soalCreations) ? statistics.activity.soalCreations.reduce((sum, item) => sum + item.count, 0) : 0) / 10 * 100, 100)}%`, 
                      borderRadius: 4 
                    }}></div>
                  </div>
                </div>
                
                <div style={{ marginBottom: 15 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Answer Submissions</span>
                    <span>{Array.isArray(statistics.activity?.answerSubmissions) ? statistics.activity.answerSubmissions.reduce((sum, item) => sum + item.count, 0) : 0}</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.1)', height: 8, borderRadius: 4 }}>
                    <div style={{ 
                      background: '#ec4899', 
                      height: '100%', 
                      width: `${Math.min((Array.isArray(statistics.activity?.answerSubmissions) ? statistics.activity.answerSubmissions.reduce((sum, item) => sum + item.count, 0) : 0) / 15 * 100, 100)}%`, 
                      borderRadius: 4 
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance and Quick Stats */}
          <div className="card-grid">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Performance Statistics</h3>
                <span className="card-icon"><BarChart3 size={20} /></span>
              </div>
              <div className="card-content">
                <p><strong>Total Ujian Selesai:</strong> {typeof statistics.performance?.studentsWithScores === 'number' ? statistics.performance.studentsWithScores : 0}</p>
                <p><strong>Rata-rata Nilai:</strong> {typeof statistics.performance?.averageScore === 'number' ? statistics.performance.averageScore : 0}</p>
                <p><strong>Tingkat Kelulusan:</strong> {typeof statistics.performance?.passRate === 'number' ? statistics.performance.passRate : 0}%</p>
                <p><strong>Nilai Tertinggi:</strong> {typeof statistics.performance?.highestScore === 'number' ? statistics.performance.highestScore : 0}</p>
                <p><strong>Total Siswa:</strong> {typeof statistics.performance?.totalStudents === 'number' ? statistics.performance.totalStudents : 0}</p>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Recent Activity</h3>
                <span className="card-icon"><TrendingUp size={20} /></span>
              </div>
              <div className="card-content">
                <p><strong>Total Users:</strong> {typeof statistics.quick?.summary?.totalUsers === 'number' ? statistics.quick.summary.totalUsers : 0}</p>
                <p><strong>Total Soal:</strong> {typeof statistics.quick?.summary?.totalSoals === 'number' ? statistics.quick.summary.totalSoals : 0}</p>
                <p><strong>Total Answers:</strong> {typeof statistics.quick?.summary?.totalAnswers === 'number' ? statistics.quick.summary.totalAnswers : 0}</p>
                <p><strong>User Registrations (7 hari):</strong> {typeof statistics.quick?.recentActivity?.last7Days?.userRegistrations === 'number' ? statistics.quick.recentActivity.last7Days.userRegistrations : 0}</p>
                <p><strong>Soal Created (7 hari):</strong> {typeof statistics.quick?.recentActivity?.last7Days?.soalCreations === 'number' ? statistics.quick.recentActivity.last7Days.soalCreations : 0}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Dashboard Overview Component - Admin & Guru
function DashboardOverview({ activePage, user }) {
  const [dashboardData, setDashboardData] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { token } = useAuth()

  // Load dashboard data when page is active
  useEffect(() => {
    if (activePage === 'dashboard' && (user?.role === 'admin' || user?.role === 'guru')) {
      loadDashboardData()
    }
  }, [activePage, user])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      const promises = []
      
      // Load data based on user role
      if (user.role === 'admin' || user.role === 'guru') {
        promises.push(
          statisticsService.getQuickStatistics(token).then(result => ({ type: 'quick', data: result.data })),
          statisticsService.getPerformanceStatistics(token).then(result => ({ type: 'performance', data: result.data })),
          statisticsService.getActivityStatistics(token).then(result => ({ type: 'activity', data: result.data })),
          statisticsService.getAISummary(token).then(result => ({ type: 'aiSummary', data: result.data }))
        )
      }

      const results = await Promise.allSettled(promises)
      const data = {}
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          data[result.value.type] = result.value.data
        }
      })

      setDashboardData(data)
    } catch (error) {
      showErrorAlert('Gagal memuat data dashboard. Coba muat ulang halaman ini.')
    } finally {
      setLoading(false)
    }
  }

  if (activePage !== 'dashboard') return null

  // Chart configurations
  const activityChartData = {
    labels: ['User Registrations', 'Soal Created', 'Answer Submissions'],
    datasets: [{
      label: 'Activity Count',
      data: [
        Array.isArray(dashboardData.activity?.userRegistrations) ? dashboardData.activity.userRegistrations.reduce((sum, item) => sum + item.count, 0) : 0,
        Array.isArray(dashboardData.activity?.soalCreations) ? dashboardData.activity.soalCreations.reduce((sum, item) => sum + item.count, 0) : 0,
        Array.isArray(dashboardData.activity?.answerSubmissions) ? dashboardData.activity.answerSubmissions.reduce((sum, item) => sum + item.count, 0) : 0
      ],
      backgroundColor: ['rgba(79, 70, 229, 0.8)', 'rgba(124, 58, 237, 0.8)', 'rgba(236, 72, 153, 0.8)'],
      borderColor: ['#4f46e5', '#7c3aed', '#ec4899'],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  }

  const performanceChartData = {
    labels: ['Total Students', 'With Scores', 'Pass Rate %'],
    datasets: [{
      data: [
        dashboardData.performance?.totalStudents || 0,
        dashboardData.performance?.studentsWithScores || 0,
        dashboardData.performance?.passRate || 0
      ],
      backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b'],
      borderWidth: 3,
      borderColor: '#ffffff',
    }]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12, weight: 'bold' },
          color: 'rgba(255,255,255,0.95)'
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.3)' },
        ticks: { color: 'rgba(255,255,255,0.9)', font: { weight: 'bold' } }
      },
      x: {
        grid: { color: 'rgba(255,255,255,0.3)' },
        ticks: { color: 'rgba(255,255,255,0.9)', font: { weight: 'bold' } }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          usePointStyle: true,
          font: { size: 11, weight: 'bold' },
          color: 'rgba(255,255,255,0.95)'
        }
      }
    }
  }

  return (
    <div id="dashboard" className={`page ${activePage === 'dashboard' ? 'active' : ''}`}>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Selamat datang di sistem manajemen pembelajaran</p>
      </div>

      {/* Error Message sekarang ditangani oleh SweetAlert2 */}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ color: '#6b7280', fontSize: '18px' }}>
            <Activity className="animate-spin" size={32} style={{ margin: '0 auto 16px' }} />
            Memuat data dashboard...
          </div>
        </div>
      ) : (
        <>
          {/* Quick Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <span className="stat-trend"><Users size={24} color="white" /></span>
              <span className="stat-number" style={{ color: 'white' }}>
                {dashboardData.quick?.summary?.totalUsers || 0}
              </span>
              <span className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Users</span>
            </div>
            
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
              <span className="stat-trend"><BookOpen size={24} color="white" /></span>
              <span className="stat-number" style={{ color: 'white' }}>
                {dashboardData.quick?.summary?.totalSoals || 0}
              </span>
              <span className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Soal</span>
            </div>
            
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <span className="stat-trend"><Target size={24} color="white" /></span>
              <span className="stat-number" style={{ color: 'white' }}>
                {dashboardData.quick?.summary?.totalAnswers || 0}
              </span>
              <span className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Total Answers</span>
            </div>
            
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
              <span className="stat-trend"><Award size={24} color="white" /></span>
              <span className="stat-number" style={{ color: 'white' }}>
                {dashboardData.performance?.averageScore || 0}
              </span>
              <span className="stat-label" style={{ color: 'rgba(255,255,255,0.9)' }}>Rata-rata Nilai</span>
            </div>
          </div>

          {/* Charts Section */}
          <div className="card-grid">
            {/* Activity Chart */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <div className="card-header">
                <h3 className="card-title" style={{ color: 'white' }}>Aktivitas Platform</h3>
                <span className="card-icon"><Activity size={20} color="white" /></span>
              </div>
              <div className="card-content">
                <div style={{ height: 250, position: 'relative' }}>
                  <Bar data={activityChartData} options={chartOptions} />
                </div>
              </div>
            </div>

            {/* Performance Doughnut Chart */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <div className="card-header">
                <h3 className="card-title" style={{ color: 'white' }}>Performance Overview</h3>
                <span className="card-icon"><BarChart3 size={20} color="white" /></span>
              </div>
              <div className="card-content">
                <div style={{ height: 250, position: 'relative' }}>
                  <Doughnut data={performanceChartData} options={doughnutOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary & Recent Activity */}
          <div className="card-grid">
            {/* AI Summary */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <div className="card-header">
                <h3 className="card-title" style={{ color: 'white' }}>🤖 AI Insights</h3>
                <span className="card-icon"><Zap size={20} color="white" /></span>
              </div>
              <div className="card-content">
                <div style={{ marginBottom: '15px' }}>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'rgba(255,255,255,0.95)', fontWeight: '500' }}>
                    {dashboardData.aiSummary?.summary || 'Ringkasan AI tidak tersedia'}
                  </p>
                </div>
                
                {dashboardData.aiSummary?.keyInsights && Array.isArray(dashboardData.aiSummary.keyInsights) && (
                  <div>
                    <h4 style={{ fontSize: '12px', marginBottom: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: 'bold' }}>Key Insights:</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {dashboardData.aiSummary.keyInsights.map((insight, index) => (
                        <span 
                          key={index}
                          style={{ 
                            background: 'rgba(255,255,255,0.25)', 
                            padding: '4px 8px', 
                            borderRadius: 12, 
                            fontSize: '10px',
                            maxWidth: '180px',
                            display: 'inline-block',
                            color: 'rgba(0,0,0,0.8)',
                            fontWeight: '600',
                            border: '1px solid rgba(255,255,255,0.3)'
                          }}
                        >
                          {typeof insight === 'string' ? insight : JSON.stringify(insight)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <div className="card-header">
                <h3 className="card-title" style={{ color: 'white' }}>Aktivitas 7 Hari Terakhir</h3>
                <span className="card-icon"><Calendar size={20} color="white" /></span>
              </div>
              <div className="card-content">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                      {dashboardData.quick?.recentActivity?.last7Days?.userRegistrations || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>User Registrations</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                      {dashboardData.quick?.recentActivity?.last7Days?.soalCreations || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Soal Created</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                      {dashboardData.performance?.totalStudents || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Total Students</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                      {dashboardData.performance?.passRate || 0}%
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Pass Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Details */}
          <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ color: 'white' }}>Detail Performance</h3>
              <span className="card-icon"><TrendingUp size={20} color="white" /></span>
            </div>
            <div className="card-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {dashboardData.performance?.studentsWithScores || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Students with Scores</div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {dashboardData.performance?.highestScore || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Highest Score</div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {dashboardData.performance?.lowestScore || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Lowest Score</div>
                </div>
                
                <div style={{ textAlign: 'center', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {Array.isArray(dashboardData.performance?.performanceByClass) ? dashboardData.performance.performanceByClass.length : 0}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>Active Classes</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Question Management Component - Admin & Guru
function QuestionManagementPage({ activePage, user }) {
  const [soals, setSoals] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [editingSoal, setEditingSoal] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [viewingSoal, setViewingSoal] = useState(null)
  
  // Form data state
  const [formData, setFormData] = useState({
    kode: '',
    judul: '',
    durasi: 90,
    minimalNilai: 70,
    soal: [
      {
        type: 'pilihan ganda',
        soal: '',
        gambar: '',
        list_jawaban: ['', '', '', ''],
        jawaban_benar: '',
        kunci_jawaban: ''
      }
    ]
  })

  // Handler to receive generated questions from SoalImport and inject into the form
  const handleGeneratedQuestions = (questions) => {
    if (!Array.isArray(questions)) return

    const mapped = questions.map(q => {
      const text = q.soal || q.pertanyaan || q.question || q.text || ''
      const hasChoices = Boolean(
        q.list_jawaban && q.list_jawaban.length > 0 ||
        q.pilihan_a || q.option_a || (q.choices && q.choices.length)
      )

      if (hasChoices) {
        const list = [
          q.pilihan_a || q.option_a || (q.choices && q.choices[0]) || (q.list_jawaban && q.list_jawaban[0]) || '',
          q.pilihan_b || q.option_b || (q.choices && q.choices[1]) || (q.list_jawaban && q.list_jawaban[1]) || '',
          q.pilihan_c || q.option_c || (q.choices && q.choices[2]) || (q.list_jawaban && q.list_jawaban[2]) || '',
          q.pilihan_d || q.option_d || (q.choices && q.choices[3]) || (q.list_jawaban && q.list_jawaban[3]) || ''
        ]

        let correct = (q.jawaban_benar || q.jawaban || q.correct_option || q.answer || '')
        correct = String(correct || '').trim()

        // If correct is a letter (A-D) or number (1-4), map it to the actual option text
        if (correct.length === 1) {
          const c = correct.toUpperCase()
          if (c >= 'A' && c <= 'D') {
            const idx = c.charCodeAt(0) - 65
            correct = (list[idx] || '').trim()
          } else if (/[1-4]/.test(c)) {
            const idx = parseInt(c, 10) - 1
            correct = (list[idx] || '').trim()
          }
        } else {
          // sometimes the template might include like 'C.' or 'c)'
          const m = correct.match(/[A-D]/i)
          if (m) {
            const idx = m[0].toUpperCase().charCodeAt(0) - 65
            correct = (list[idx] || '').trim()
          }
        }

        return {
          type: 'pilihan ganda',
          soal: String(text || '').trim(),
          gambar: q.gambar || q.image || '' ,
          list_jawaban: list,
          jawaban_benar: String(correct || '').trim(),
          kunci_jawaban: ''
        }
      }

      // default -> essay
      return {
        type: 'essay',
        soal: String(text || '').trim(),
        gambar: q.gambar || q.image || '',
        list_jawaban: [],
        jawaban_benar: '',
        kunci_jawaban: String(q.kunci_jawaban || q.jawaban || q.answer || '').trim()
      }
    })

    setFormData(prev => ({ ...prev, soal: mapped }))
    setShowForm(true)
  }

  // Image files for upload
  const [imageFiles, setImageFiles] = useState([])

  const { token } = useAuth()

  // Load soals on component mount
  useEffect(() => {
    if (activePage === 'questions') {
      loadSoals()
    }
  }, [activePage, pagination.page])

  // Clear messages sudah ditangani oleh SweetAlert2 dengan timer

  const loadSoals = async () => {
    setLoading(true)
    
    try {
      const result = await soalService.getAllSoals(token, pagination.page, pagination.limit)
      setSoals(result.data)
      setPagination(prev => ({ ...prev, total: result.total }))
    } catch (error) {
      showErrorAlert('Gagal memuat daftar soal. Mungkin koneksi internet terputus atau server sedang sibuk. Silakan refresh halaman.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate form data
      const validation = soalService.validateSoalData(formData)
      if (!validation.isValid) {
        showErrorAlert(validation.errors.join(', '))
        setLoading(false)
        return
      }

      // Format data for API
      const soalData = soalService.formatSoalData(formData)

      let result
      if (editingSoal) {
        // Update existing soal
        result = await soalService.updateSoal(token, editingSoal._id, soalData, imageFiles)
        showSuccessAlert('Soal berhasil diperbarui! Semua perubahan telah disimpan.')
      } else {
        // Create new soal
        result = await soalService.createSoal(token, soalData, imageFiles)
        showSuccessAlert('Soal baru berhasil dibuat! Siswa dapat mengakses soal ini setelah Anda membagikan kodenya.')
      }

      // Reset form and reload soals
      resetForm()
      loadSoals()
      
    } catch (error) {
      showErrorAlert('Hmm, ada masalah saat menyimpan soal. Pastikan semua gambar berukuran kurang dari 5MB dan koneksi internet Anda stabil.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (soal) => {
    setEditingSoal(soal)
    setFormData({
      kode: soal.kode || '',
      judul: soal.judul || '',
      durasi: soal.durasi || 90,
      minimalNilai: soal.minimalNilai || 70,
      soal: soal.soal.map(item => ({
        type: item.type || 'pilihan ganda',
        soal: item.soal || '',
        // PERBAIKAN: Hanya set gambar jika benar-benar ada, tidak set string kosong
        gambar: (item.gambar && item.gambar.trim() !== '') ? item.gambar : '',
        // If backend returns an empty array ([]) we should still show 4 empty inputs.
        list_jawaban: (item.list_jawaban && item.list_jawaban.length > 0) ? item.list_jawaban : ['', '', '', ''],
        // Backend schema uses `jawaban` for the correct answer / essay key.
        // Accept either shape when editing so the form pre-fills correctly.
        jawaban_benar: item.jawaban_benar || item.jawaban || '',
        kunci_jawaban: item.kunci_jawaban || item.jawaban || ''
      }))
    })
    setShowForm(true)
  }

  const handleDelete = async (soalId) => {
    // Enhanced confirmation dialog with more details
    const result = await Swal.fire({
      title: 'Hapus Soal?',
      html: `
        <div style="text-align: left; margin: 10px 0;">
          <p><strong>⚠️ Peringatan:</strong></p>
          <ul style="text-align: left; margin: 10px 0; padding-left: 20px;">
            <li>Soal yang dihapus tidak dapat dikembalikan</li>
            <li>Semua data ujian dan jawaban siswa terkait akan hilang</li>
            <li>Statistik dan laporan terkait soal ini akan dihapus</li>
          </ul>
          <p style="color: #dc2626; font-weight: bold;">Apakah Anda yakin ingin melanjutkan?</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus soal!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      focusCancel: true
    });
    
    if (!result.isConfirmed) return;

    // Show loading state immediately
    setLoading(true);
    
    try {
      console.log(`🗑️ Menghapus soal dengan ID: ${soalId}`);
      
      // Optimistic update - remove from UI immediately for better UX
      const originalSoals = [...soals];
      setSoals(prevSoals => {
        const filtered = prevSoals.filter(soal => soal._id !== soalId);
        console.log(`📊 Soal tersisa setelah hapus optimistic: ${filtered.length}`);
        return filtered;
      });
      
      // Update pagination count optimistically
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
      
      // Call API to delete from server
      await soalService.deleteSoal(token, soalId);
      
      console.log('✅ Soal berhasil dihapus dari server');
      showSuccessAlert('Soal berhasil dihapus dari sistem!');
      
      // Check if current page becomes empty and we're not on page 1
      const remainingCount = originalSoals.length - 1;
      const itemsPerPage = pagination.limit;
      const currentPageStartIndex = (pagination.page - 1) * itemsPerPage;
      const isCurrentPageEmpty = remainingCount <= currentPageStartIndex && pagination.page > 1;
      
      if (isCurrentPageEmpty) {
        console.log('📄 Halaman saat ini kosong, pindah ke halaman sebelumnya');
        const newPage = pagination.page - 1;
        setPagination(prev => ({ ...prev, page: newPage }));
        
        // Load the previous page
        setTimeout(() => {
          console.log(`🔄 Memuat halaman ${newPage}`);
          loadSoals();
        }, 100);
      } else {
        // Reload current page to ensure data consistency
        setTimeout(() => {
          console.log('🔄 Memuat ulang halaman saat ini untuk sinkronisasi');
          loadSoals();
        }, 100);
      }
      
    } catch (error) {
      console.error('❌ Error menghapus soal:', error);
      
      // Revert optimistic update on error
      console.log('🔄 Mengembalikan data karena error');
      setSoals(originalSoals);
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1
      }));
      
      // Show specific error message
      if (error.message.includes('404')) {
        showErrorAlert('Soal tidak ditemukan. Mungkin sudah dihapus sebelumnya. Halaman akan dimuat ulang.');
        setTimeout(() => loadSoals(), 1000);
      } else if (error.message.includes('403')) {
        showErrorAlert('Anda tidak memiliki izin untuk menghapus soal ini.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        showErrorAlert('Gagal menghapus soal karena masalah koneksi. Periksa koneksi internet Anda dan coba lagi.');
      } else {
        showErrorAlert('Gagal menghapus soal. Server mungkin sedang sibuk. Silakan coba lagi dalam beberapa saat.');
      }
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      kode: '',
      judul: '',
      durasi: 90,
      minimalNilai: 70,
      soal: [
        {
          type: 'pilihan ganda',
          soal: '',
          gambar: '',
          list_jawaban: ['', '', '', ''],
          jawaban_benar: '',
          kunci_jawaban: ''
        }
      ]
    })
    setEditingSoal(null)
    setShowForm(false)
    setImageFiles([])
  }

  const addNewQuestion = () => {
    setFormData(prev => ({
      ...prev,
      soal: [
        ...prev.soal,
        {
          type: 'pilihan ganda',
          soal: '',
          gambar: '',
          list_jawaban: ['', '', '', ''],
          jawaban_benar: '',
          kunci_jawaban: ''
        }
      ]
    }))
  }

  const removeQuestion = (index) => {
    if (formData.soal.length <= 1) {
      showErrorAlert('Minimal harus ada 1 soal')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      soal: prev.soal.filter((_, i) => i !== index)
    }))
  }

  const updateQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      soal: prev.soal.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const updateOption = (questionIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      soal: prev.soal.map((item, i) => 
        i === questionIndex ? {
          ...item,
          list_jawaban: item.list_jawaban.map((opt, j) => 
            j === optionIndex ? value : opt
          )
        } : item
      )
    }))
  }

  const handleImageUpload = (questionIndex, file) => {
    if (file) {
      // Update image files array
      const newImageFiles = [...imageFiles]
      newImageFiles[questionIndex] = file
      setImageFiles(newImageFiles)

      // Preview URL for display
      const previewUrl = URL.createObjectURL(file)
      updateQuestion(questionIndex, 'gambar', previewUrl)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  if (activePage !== 'questions') return null

  return (
    // sebelum ubah
    <div id="questions" className="page active">
      <div className="page-header">
        <h1 className="page-title">Buat Soal</h1>
        <p className="page-subtitle">Buat dan kelola soal ujian</p>
      </div>
      <div style={{ marginBottom: '20px' }}>
        <SoalImport token={token} onGenerated={handleGeneratedQuestions} />
      </div>
      
      {/* Error and Success Messages sekarang ditangani oleh SweetAlert2 */}

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
          style={{ marginRight: '10px' }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          <span style={{ marginLeft: '8px' }}>
            {showForm ? 'Tutup Form' : 'Tambah Soal Baru'}
          </span>
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={loadSoals}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Soal Form */}
      {showForm && (
        <div className="form-container" style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#1f2937', marginBottom: 20 }}>
            {editingSoal ? 'Edit Soal' : 'Tambah Soal Baru'}
          </h3>
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 30 }}>
              <div className="form-group">
                <label className="form-label">Kode Ujian *</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: MIXED001" 
                    value={formData.kode}
                    onChange={(e) => setFormData(prev => ({ ...prev, kode: e.target.value }))}
                    required 
                    style={{ flex: 1 }}
                  />
                  <button 
                    type="button"
                    className="btn"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease',
                      minWidth: '120px'
                    }}
                    onClick={() => {
                      // Generate kode based on current timestamp and random text
                      const now = new Date();
                      const hh = String(now.getHours()).padStart(2, '0');
                      const mm = String(now.getMinutes()).padStart(2, '0');
                      const ss = String(now.getSeconds()).padStart(2, '0');
                      const randomText = Math.random().toString(36).substring(2, 5).toUpperCase();
                      const generatedCode = `${hh}${mm}${ss}-${randomText}`;
                      
                      // Update form data
                      setFormData(prev => ({ ...prev, kode: generatedCode }));
                      showSuccessAlert(`Kode berhasil di-generate: ${generatedCode}`);
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 15px -3px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <span>🎲</span>
                    Generate Kode
                  </button>
                </div>
                <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  💡 Tip: Klik "Generate Kode" untuk membuat kode unik secara otomatis
                </small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Judul Ujian *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Masukkan judul ujian" 
                  value={formData.judul}
                  onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Durasi (menit) *</label>
                <div style={{ 
                  background: '#f0f9ff', 
                  border: '1px solid #0ea5e9', 
                  borderRadius: '6px', 
                  padding: '8px 12px', 
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: '#0c4a6e'
                }}>
                  💡 <strong>Waktu pengerjaan ujian:</strong> Berapa lama siswa dapat mengerjakan soal (contoh: 90 menit = 1.5 jam)
                </div>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="90" 
                  min="1"
                  value={formData.durasi}
                  onChange={(e) => setFormData(prev => ({ ...prev, durasi: parseInt(e.target.value) || 90 }))}
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Minimal Nilai (0-100) *</label>
                <div style={{ 
                  background: '#fef3c7', 
                  border: '1px solid #f59e0b', 
                  borderRadius: '6px', 
                  padding: '8px 12px', 
                  marginBottom: '8px',
                  fontSize: '13px',
                  color: '#92400e'
                }}>
                  🎯 <strong>Batas kelulusan:</strong> Nilai minimum yang harus dicapai siswa untuk dinyatakan lulus (contoh: 70% = lulus jika nilai ≥ 70)
                </div>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="70" 
                  min="0"
                  max="100"
                  value={formData.minimalNilai}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimalNilai: parseInt(e.target.value) || 70 }))}
                  required 
                />
              </div>
            </div>

            {/* Questions */}
            <h3 style={{ color: '#1f2937', marginBottom: 20 }}>Soal-soal</h3>
            
            {formData.soal.map((question, questionIndex) => (
              <div key={questionIndex} className="question-item" style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '20px', 
                marginBottom: '20px',
                background: '#f9fafb'
              }}>
                <div className="question-header" style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                      <div className="question-number" style={{ 
                        background: '#3b82f6', 
                        color: 'white', 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }}>
                        {questionIndex + 1}
                      </div>
                      
                      {/* Button Hapus dipindahkan ke sini */}
                      {formData.soal.length > 1 && (
                        <button 
                          type="button" 
                          className="btn btn-danger" 
                          onClick={() => removeQuestion(questionIndex)}
                          style={{ 
                            padding: '8px 12px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          <Trash2 size={14} />
                          Hapus
                        </button>
                      )}

                      {/* Fancy Question Type Selector */}
                      <div style={{ position: 'relative' }}>
                        <label style={{ 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: '#6b7280',
                          display: 'block',
                          marginBottom: '6px'
                        }}>
                          📝 Tipe Soal
                        </label>
                        <div style={{ 
                          background: question.type === 'pilihan ganda' || question.type === 'pilihan ganda + image'
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          borderRadius: '12px',
                          padding: '2px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}>
                          <select 
                            className="form-select" 
                            value={question.type}
                            onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                            style={{ 
                              width: '220px',
                              background: 'white',
                              border: 'none',
                              borderRadius: '10px',
                              padding: '8px 12px',
                              fontSize: '13px',
                              fontWeight: '600',
                              color: '#1f2937',
                              appearance: 'none',
                              backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMuNSA1LjI1TDcgOC43NUwxMC41IDUuMjUiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K")',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 12px center',
                              paddingRight: '36px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <option value="pilihan ganda">🔘 Pilihan Ganda</option>
                            <option value="essay">📝 Essay</option>
                            <option value="pilihan ganda + image">🔘📸 PG + Gambar</option>
                            <option value="essay + image">📝📸 Essay + Gambar</option>
                          </select>
                        </div>
                        
                        {/* Type Badge */}
                        <div style={{ 
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: question.type === 'pilihan ganda' || question.type === 'pilihan ganda + image' ? '#10b981' : '#f59e0b',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                        }}>
                          {question.type.includes('image') ? '📸' : (question.type === 'pilihan ganda' ? '🔘' : '📝')}
                        </div>
                      </div>
                    </div>
                    
                  </div>
                  
                  {/* Question Input and Image Upload Layout */}
                  <div style={{ 
                    display: question.type.includes('image') ? 'grid' : 'block', 
                    gridTemplateColumns: question.type.includes('image') ? '2fr 1fr' : 'none', 
                    gap: question.type.includes('image') ? '20px' : '0',
                    alignItems: 'start'
                  }}>
                    
                    {/* Question Text Input */}
                    <div className="form-group" style={{
                      width: question.type.includes('image') ? 'auto' : '100%',
                      maxWidth: question.type.includes('image') ? 'none' : '100%'
                    }}>
                      <label className="form-label" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        <span style={{ 
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px'
                        }}>
                          ❓ PERTANYAAN
                        </span>
                        Masukkan pertanyaan soal *
                      </label>
                      <div style={{ 
                        position: 'relative',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: '12px',
                        padding: '3px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}>
                        <textarea 
                          className="form-textarea" 
                          placeholder="Tulis pertanyaan yang jelas dan mudah dipahami siswa..."
                          value={question.soal}
                          onChange={(e) => updateQuestion(questionIndex, 'soal', e.target.value)}
                          style={{ 
                            minHeight: question.type.includes('image') ? 120 : 150,
                            width: '100%',
                            background: 'white',
                            border: 'none',
                            borderRadius: '9px',
                            padding: question.type.includes('image') ? '16px' : '20px',
                            fontSize: question.type.includes('image') ? '14px' : '15px',
                            lineHeight: '1.6',
                            resize: 'vertical',
                            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.2s ease'
                          }}
                          onFocus={(e) => {
                            e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 3px rgba(139, 92, 246, 0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.boxShadow = 'inset 0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                          required
                        />
                        
                        {/* Character Counter */}
                        <div style={{ 
                          position: 'absolute',
                          bottom: '8px',
                          right: '12px',
                          fontSize: '11px',
                          color: '#6b7280',
                          background: 'rgba(255, 255, 255, 0.9)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {question.soal.length} karakter
                        </div>
                      </div>
                      
                      {/* Question Guidelines */}
                      <div style={{ 
                        marginTop: '8px',
                        fontSize: '11px',
                        color: '#6b7280',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <span>💡 Gunakan bahasa yang jelas</span>
                        <span>🎯 Fokus pada 1 konsep</span>
                        <span>📏 Hindari pertanyaan terlalu panjang</span>
                      </div>
                    </div>

                    {/* Image Upload - Compact Design - Only show for image types */}
                    {question.type.includes('image') && (
                    <div className="form-group">
                      <label className="form-label" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        marginBottom: '8px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        <span style={{ 
                          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                          color: 'white',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          fontSize: '10px'
                        }}>
                          📸 GAMBAR
                        </span>
                        Upload Pendukung
                      </label>
                      
                      {/* Compact Upload Area */}
                      <div style={{ 
                        border: question.gambar ? '2px solid #22c55e' : '2px dashed #cbd5e1',
                        borderRadius: '12px',
                        background: question.gambar ? 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        padding: '16px',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        minHeight: '100px'
                      }}>
                        
                        {/* Hidden File Input */}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(questionIndex, e.target.files[0])}
                          style={{ display: 'none' }}
                          id={`image-upload-${questionIndex}`}
                        />
                        
                        {/* Upload State */}
                        {!question.gambar ? (
                          <label 
                            htmlFor={`image-upload-${questionIndex}`}
                            style={{ 
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '8px',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <div style={{ 
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                              color: 'white',
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}>
                              <Upload size={16} />
                            </div>
                            
                            <div style={{ 
                              fontSize: '12px', 
                              fontWeight: '600', 
                              color: '#1f2937'
                            }}>
                              Klik Upload
                            </div>
                            
                            <div style={{ 
                              fontSize: '10px', 
                              color: '#6b7280'
                            }}>
                              PNG, JPG (Max 5MB)
                            </div>
                          </label>
                        ) : (
                          /* Preview State */
                          <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            
                            {/* Image Thumbnail */}
                            <div style={{ 
                              position: 'relative',
                              borderRadius: '8px',
                              overflow: 'hidden'
                            }}>
                              <img 
                                src={question.gambar} 
                                alt="Preview" 
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover',
                                  border: '2px solid #22c55e'
                                }}
                              />
                              
                              {/* Success Badge */}
                              <div style={{ 
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                background: '#22c55e',
                                color: 'white',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px'
                              }}>
                                ✓
                              </div>
                            </div>
                            
                            {/* Status */}
                            <div style={{ 
                              background: '#22c55e',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '9px',
                              fontWeight: '600'
                            }}>
                              ✅ Berhasil
                            </div>
                            
                            {/* Action Buttons */}
                            <div style={{ 
                              display: 'flex', 
                              gap: '4px'
                            }}>
                              <label 
                                htmlFor={`image-upload-${questionIndex}`}
                                style={{ 
                                  cursor: 'pointer',
                                  background: '#3b82f6',
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '9px',
                                  fontWeight: '600',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Edit2 size={8} />
                                Ganti
                              </label>
                              
                              <button 
                                type="button"
                                onClick={() => updateQuestion(questionIndex, 'gambar', '')}
                                style={{ 
                                  background: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '4px',
                                  fontSize: '9px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Trash2 size={8} />
                                Hapus
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Helper Text */}
                      <div style={{ 
                        marginTop: '6px',
                        fontSize: '10px',
                        color: '#6b7280',
                        textAlign: 'center'
                      }}>
                        💡 Gambar opsional
                      </div>
                    </div>
                    )}
                  </div>
                </div>

                {/* Multiple Choice Options */}
                {question.type.includes('pilihan ganda') && (
                  <div className="option-group">
                    <label className="form-label">Pilihan Jawaban *</label>
                    {[0,1,2,3].map((optionIndex) => (
                      <div key={optionIndex} className="option-item" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10, 
                        marginBottom: 10 
                      }}>
                        <span style={{ 
                          minWidth: '20px', 
                          color: '#1f2937', 
                          fontWeight: 'bold' 
                        }}>
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <input 
                          type="text" 
                          className="form-input option-input" 
                          placeholder={`Pilihan ${String.fromCharCode(65 + optionIndex)}`}
                          value={(formData.soal[questionIndex].list_jawaban && formData.soal[questionIndex].list_jawaban[optionIndex]) || ''}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          style={{ flex: 1 }}
                        />
                        <input 
                          type="radio" 
                          name={`correct-${questionIndex}`} 
                          value={(formData.soal[questionIndex].list_jawaban && formData.soal[questionIndex].list_jawaban[optionIndex]) || ''}
                          checked={formData.soal[questionIndex].jawaban_benar === ((formData.soal[questionIndex].list_jawaban && formData.soal[questionIndex].list_jawaban[optionIndex]) || '')}
                          onChange={(e) => updateQuestion(questionIndex, 'jawaban_benar', e.target.value)}
                        />
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Benar</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Essay Answer Key */}
                {question.type.includes('essay') && (
                  <div className="form-group">
                    <label className="form-label">Kunci Jawaban *</label>
                    <textarea 
                      className="form-textarea" 
                      placeholder={editingSoal ? "Kosongkan jika tidak ingin diubah" : "Masukkan kunci jawaban untuk soal essay..."}
                      value={formData.soal[questionIndex].kunci_jawaban}
                      onChange={(e) => updateQuestion(questionIndex, 'kunci_jawaban', e.target.value)}
                      style={{ minHeight: 100 }}
                      required={!editingSoal && question.type.includes('essay')}
                    />
                  </div>
                )}
              </div>
            ))}
            
            {/* Add Question Button */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={addNewQuestion}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
              >
                <Plus size={16} />
                Tambah Soal
              </button>
            </div>
            
            {/* Submit Buttons */}
            <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ marginRight: '10px' }}
              >
                {loading ? 'Menyimpan...' : (editingSoal ? 'Update Soal' : 'Simpan Soal')}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={resetForm}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Soals Table */}
      <div className="table-container">
        <h3 style={{ color: '#1f2937', marginBottom: 20 }}>
          Daftar Soal ({pagination.total} total)
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: '#6b7280' }}>Loading data soal...</div>
          </div>
        ) : soals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: '#6b7280' }}>Tidak ada data soal</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Judul</th>
                <th>Durasi</th>
                <th>Jumlah Soal</th>
                <th>Minimal Nilai</th>
                <th>Tanggal Dibuat</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {soals.map((soal) => (
                <tr key={soal._id}>
                  <td>
                    <span style={{ 
                      background: '#3b82f6', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {soal.kode}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{soal.judul}</div>
                  </td>
                  <td>{soal.durasi} menit</td>
                  <td>
                    <span style={{ 
                      background: '#059669', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '12px' 
                    }}>
                      {soal.soal?.length || 0} soal
                    </span>
                  </td>
                  <td>{soal.minimalNilai}%</td>
                  <td>{new Date(soal.createdAt).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '5px 8px' }}
                        onClick={() => setViewingSoal(soal)}
                        title="Lihat Detail"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '5px 8px' }}
                        onClick={() => handleEdit(soal)}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '5px 8px' }}
                        onClick={() => handleDelete(soal._id)}
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '10px', 
            marginTop: '20px' 
          }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{ padding: '8px 12px' }}
            >
              ← Prev
            </button>
            
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              style={{ padding: '8px 12px' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* View Soal Modal */}
      {viewingSoal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            padding: '30px', 
            maxWidth: '800px', 
            maxHeight: '80vh', 
            overflow: 'auto',
            width: '90%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1f2937' }}>Detail Soal</h3>
              <button 
                onClick={() => setViewingSoal(null)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '24px', 
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <p><strong>Kode:</strong> {viewingSoal.kode}</p>
              <p><strong>Judul:</strong> {viewingSoal.judul}</p>
              <p><strong>Durasi:</strong> {viewingSoal.durasi} menit</p>
              <p><strong>Minimal Nilai:</strong> {viewingSoal.minimalNilai}%</p>
              <p><strong>Jumlah Soal:</strong> {viewingSoal.soal?.length || 0}</p>
            </div>

            <div>
              <h4 style={{ color: '#1f2937', marginBottom: '15px' }}>Soal-soal:</h4>
              {viewingSoal.soal?.map((item, index) => (
                <div key={index} style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  marginBottom: '15px',
                  background: '#f9fafb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ 
                      background: '#3b82f6', 
                      color: 'white', 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ 
                      background: item.type === 'pilihan ganda' ? '#059669' : '#f59e0b', 
                      color: 'white', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      fontSize: '11px' 
                    }}>
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>{item.soal}</p>
                  
                  {item.gambar && (
                    <div style={{ marginBottom: '10px' }}>
                      <img 
                        src={item.gambar} 
                        alt="Soal" 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '150px', 
                          objectFit: 'contain',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  )}
                  
                  {item.type === 'pilihan ganda' && item.list_jawaban && (
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Pilihan:</p>
                      {item.list_jawaban.map((option, optIndex) => (
                        <div key={optIndex} style={{ 
                          padding: '5px 0', 
                          color: (item.jawaban_benar || item.jawaban) === option ? '#059669' : '#6b7280',
                          fontWeight: (item.jawaban_benar || item.jawaban) === option ? 'bold' : 'normal'
                        }}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                          {(item.jawaban_benar || item.jawaban) === option && ' ✓'}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {item.type === 'essay' && (item.kunci_jawaban || item.jawaban) && (
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>Kunci Jawaban:</p>
                      <p style={{ color: '#6b7280', fontSize: '14px' }}>{item.kunci_jawaban || item.jawaban}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
    // akhir sebelum ubah
  )
}

// Reports Page Component - Admin & Guru
function ReportsPage({ activePage, user }) {
  // REPORTS_PAGE_UNIQUE_MARKER - ReportsPage with Detail Modal
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 })
  const [filters, setFilters] = useState({ kelas: '', mataPelajaran: '', soalKode: '' })
  const [viewingReport, setViewingReport] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  
  const { token } = useAuth()

  // Load reports on component mount and filter changes
  useEffect(() => {
    if (activePage === 'reports') {
      console.log("Reports tab active - loading data");
      loadReports();
    }
  }, [activePage, filters]) // Removed pagination.page dependency to prevent double loading

  // Clear messages sudah ditangani oleh SweetAlert2 dengan timer

  const loadReports = async () => {
    setLoading(true)
    console.log('📥 Memuat laporan untuk halaman:', pagination.page)
    
    try {
      // Tambahkan parameter nocache untuk memaksa browser mengambil data baru
      const nocache = new Date().getTime();
      const result = await reportsService.getAllReports(token, pagination.page, pagination.limit, {...filters, _nocache: nocache})
      console.log('🔍 Raw API Response:', result)
      console.log('📊 Reports Data:', result.data)
      console.log('📄 Pagination:', result.pagination)
      
      // Verifikasi data yang diterima
      if (result.data && Array.isArray(result.data)) {
        // Reset state reports dengan data baru yang sudah diverifikasi
        setReports(result.data)
      } else {
        console.error('Format data tidak valid:', result)
        setReports([])
      }
      
      // Update pagination info
      setPagination(prev => ({ ...prev, total: result.pagination?.totalItems || 0 }))
    } catch (error) {
      console.error('Error loading reports:', error)
      showErrorAlert('Gagal memuat data laporan. Mungkin koneksi internet terputus atau server sedang sibuk. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reportId, userId, soalKode) => {
    const result = await Swal.fire({
      title: 'Hapus Laporan?',
      text: "Laporan yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, hapus laporan!',
      cancelButtonText: 'Batal'
    });
    
    if (!result.isConfirmed) return;

    setLoading(true)
    
    try {
      console.log(`🗑️ Menghapus laporan ID: ${reportId}, UserId: ${userId}, SoalKode: ${soalKode}`);
      
      // Perbarui state lokal segera untuk respons UI yang cepat
      setReports(prevReports => prevReports.filter(report => report._id !== reportId));
      
      // Delete report and related user answers in parallel
      const deleteResults = await Promise.allSettled([
        reportsService.deleteReport(token, reportId),
        reportsService.deleteUserAnswers(token, userId, soalKode)
      ]);
      
      // Check for any failures
      const failures = deleteResults.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Some delete operations failed:', failures);
        failures.forEach(failure => console.error(failure.reason));
      }
      
      showSuccessAlert('Laporan berhasil dihapus dari sistem!');
      
      // Force reload data to ensure our UI is in sync with server
      console.log("Memuat ulang data setelah penghapusan");
      const currentReportsCount = reports.length - 1; // Estimate count after deletion
      
      // If this page would be empty and we're not on the first page, go back a page
      if (currentReportsCount <= 0 && pagination.page > 1) {
        console.log("Halaman akan kosong, kembali ke halaman sebelumnya");
        const newPage = pagination.page - 1;
        setPagination(prev => ({ ...prev, page: newPage }));
        
        // Schedule data load with slight delay to ensure state update completes first
        setTimeout(() => {
          console.log(`Memuat data untuk halaman ${newPage}`);
          loadReports();
        }, 100);
      } else {
        // If there's still data on this page, just reload current page
        console.log("Memuat ulang halaman saat ini");
        setTimeout(() => loadReports(), 100);
      }
    } catch (error) {
      console.error('Error deleting report:', error)
      showErrorAlert('Gagal menghapus laporan. Server mungkin sedang sibuk atau terjadi masalah dengan koneksi. Silakan coba lagi.')
      
      // Reload data anyway to ensure our UI is in sync with server
      setTimeout(() => loadReports(), 100);
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (reportId) => {
    console.log(`[DEBUG] handleViewDetail: Attempting to view detail for reportId: ${reportId}`);
    try {
      const result = await reportsService.getReportById(token, reportId);
      console.log("[DEBUG] handleViewDetail: Successfully fetched report details:", result);
      
      if (result && result.data) {
        setViewingReport(result.data);
        console.log("[DEBUG] handleViewDetail: Set viewingReport with data:", result.data);
      } else {
        console.error("[DEBUG] handleViewDetail: Fetched data is invalid or empty.", result);
        showErrorAlert('Data laporan yang diterima tidak valid.');
      }

    } catch (error) {
      console.error('[DEBUG] handleViewDetail: Error loading report detail:', error);
      
      if (error.message.includes('404')) {
        showErrorAlert('Laporan tidak ditemukan. Mungkin sudah dihapus.');
        setReports(prevReports => prevReports.filter(report => report._id !== reportId));
        loadReports();
      } else {
        showErrorAlert('Gagal memuat detail laporan. Silakan coba lagi.');
      }
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page
  }

  const handlePageChange = (newPage) => {
    console.log(`Changing to page ${newPage}`);
    setPagination(prev => ({ ...prev, page: newPage }));
    // Force reload after pagination change to ensure fresh data
    setTimeout(() => {
      console.log(`Reloading data after page change to ${newPage}`);
      loadReports();
    }, 50);
  }

  const calculateSummary = () => {
    if (!reports.length) return { avgScore: 0, highest: 0, lowest: 0, total: 0, passRate: 0 }
    
    const scores = reports.map(r => r.nilai || 0)
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const highest = Math.max(...scores)
    const lowest = Math.min(...scores)
    const passed = reports.filter(r => (r.nilai || 0) >= (r.minimalNilai || 70)).length
    const passRate = (passed / reports.length) * 100
    
    return {
      avgScore: Math.round(avgScore * 10) / 10,
      highest,
      lowest,
      total: reports.length,
      passRate: Math.round(passRate * 10) / 10
    }
  }

  if (activePage !== 'reports') return null

  const summary = calculateSummary()

  return (
    <div id="reports" className="page active">
      <div className="page-header">
        <h1 className="page-title">Laporan Penilaian</h1>
        <p className="page-subtitle">Lihat dan analisis hasil ujian siswa</p>
      </div>
      {/* REPORTS_SECTION_START */}

      {/* Report Detail Modal */}
      <ReportDetailModal 
        viewingReport={viewingReport}
        onClose={() => {
          setViewingReport(null);
          // Reload data when modal is closed to ensure fresh data
          setTimeout(() => loadReports(), 100);
        }}
      />
      
      {/* Error and Success Messages sekarang ditangani oleh SweetAlert2 */}

      {/* Action Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            // Force a full reload of the data with fresh timestamp
            const timestamp = new Date().getTime();
            console.log(`Manual refresh triggered at ${timestamp}`);
            loadReports();
          }}
          disabled={loading}
          title="Muat ulang data dari server"
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh Data'}
        </button>
        
        <button
          className="btn btn-primary"
          onClick={() => {
            // Force reset all state to ensure clean slate
            setReports([]);
            setPagination(prev => ({ ...prev, page: 1 }));
            setFilters({ kelas: '', mataPelajaran: '', soalKode: '' });
            setTimeout(() => loadReports(), 50);
          }}
          disabled={loading}
          title="Reset semua filter dan muat ulang data"
        >
          🗑️ Reset Filter
        </button>
      </div>

      <div className="card-grid">
        {/* Filter Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Filter Laporan</h3>
            <span className="card-icon">🔍</span>
          </div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
              <div className="form-group">
                <label className="form-label">Kelas</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cari Kelas"
                  value={filters.kelas}
                  onChange={(e) => handleFilterChange('kelas', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mata Pelajaran</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cari mapel"
                  value={filters.mataPelajaran}
                  onChange={(e) => handleFilterChange('mataPelajaran', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kode Soal</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cari kode"
                  value={filters.soalKode}
                  onChange={(e) => handleFilterChange('soalKode', e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setFilters({ kelas: '', mataPelajaran: '', soalKode: '' })}
                style={{ padding: '8px 16px' }}
              >
                🗑️ Bersihkan Filter
              </button>
            </div>
          </div>
        </div>
        
        {/* Summary Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ringkasan Nilai</h3>
            <span className="card-icon">📊</span>
          </div>
          <div className="card-content">
            <p><strong>Rata-rata Kelas:</strong> {summary.avgScore}</p>
            <p><strong>Nilai Tertinggi:</strong> {summary.highest}</p>
            <p><strong>Nilai Terendah:</strong> {summary.lowest}</p>
            <p><strong>Jumlah Siswa:</strong> {summary.total}</p>
            <p><strong>Tingkat Kelulusan:</strong> {summary.passRate}%</p>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="table-container">
        <h3 style={{ color: '#1f2937', marginBottom: 20 }}>
          Hasil Ujian ({pagination.total} total)
        </h3>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: '#6b7280' }}>🔄 Memuat data laporan...</div>
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ color: '#6b7280' }}>Tidak ada data laporan</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Kelas</th>
                <th>Kode Ujian</th>
                <th>Judul Ujian</th>
                <th>Nilai</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => {
                console.log(`📋 Report ${index + 1}:`, report)
                const isPass = (report.nilai || 0) >= (report.minimalNilai || 70)
                return (
                  <tr key={report._id}>
                    <td>
                      {report.namaSiswa || report.namaLengkap || report.username || 'DATA KOSONG'}
                    </td>
                    <td>
                      {report.kelas || 'KELAS KOSONG'}
                    </td>
                    <td>
                      <span style={{ 
                        background: '#3b82f6', 
                        color: 'white', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {report.kodeSoal || report.soalKode || 'KODE KOSONG'}
                      </span>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                        {report.judulUjian || report.judulSoal || 'JUDUL KOSONG'}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        background: isPass ? '#22c55e' : '#ef4444',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {report.nilai !== null && report.nilai !== undefined ? report.nilai : 'NO SCORE'}
                      </span>
                    </td>
                    <td>{new Date(report.tanggal || Date.now()).toLocaleDateString('id-ID')}</td>
                    <td>
                      <span style={{
                        background: isPass ? '#22c55e' : '#ef4444',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px'
                      }}>
                        {isPass ? 'Lulus' : 'Tidak Lulus'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '5px 8px' }}
                          title="Lihat Detail"
                          onClick={() => handleViewDetail(report._id)}
                          disabled={loadingDetail}
                        >
                          <Eye size={14} />
                        </button>
                        {/* Only show delete button for admin */}
                        {user?.role === 'admin' && (
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '5px 8px' }}
                            onClick={() => handleDelete(report._id, report.userId, report.soalKode)}
                            title="Hapus Laporan"
                            disabled={loading}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        
        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '10px', 
            marginTop: '20px' 
          }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              style={{ padding: '8px 12px' }}
            >
              ← Prev
            </button>
            
            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
            </span>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              style={{ padding: '8px 12px' }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

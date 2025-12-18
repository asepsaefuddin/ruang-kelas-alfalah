import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const ACCOUNTS = [
  { email: 'admin@ruangkelas.id', password: 'admin123', role: 'admin' },
  { email: 'guru@ruangkelas.id', password: 'guru123', role: 'guru' },
  { email: 'siswa@ruangkelas.id', password: 'siswa123', role: 'siswa' },
]

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    const found = ACCOUNTS.find(a => a.email === email && a.password === password)
    setTimeout(() => {
      setLoading(false)
      if (!found) {
        setError('Email atau kata sandi salah')
        return
      }
      setSuccess(true)
      sessionStorage.setItem('rk_role', found.role)
      if (found.role === 'siswa') navigate('/student')
      else navigate('/dashboard')
    }, 600)
  }

  return (
    <div className="login-container">
      <Link to="/" className="back-button">← Kembali</Link>

      {/* Decorative bubbles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="bubble"
          style={{
            width: `${12 + (i % 6) * 10}px`,
            height: `${12 + (i % 6) * 10}px`,
            left: `${(i * 7) % 100}%`,
            bottom: `${(i * 9) % 100}px`,
            animationDelay: `${(i % 5) * 0.6}s`,
            opacity: 0.8,
          }}
        />
      ))}

      <div className="glass-container">
        <h1 className="login-title"><span style={{ color: '#3b82f6' }}>Ruang</span> Kelas</h1>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="login-input" placeholder="nama@sekolah.sch.id" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Kata Sandi</label>
            <input className="login-input" placeholder="••••••••" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <button className={`submit-btn ${loading ? 'loading' : ''} ${success ? 'success' : ''}`} type="submit">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        {error && <div className="success-message" style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.35)', color: '#ef4444' }}>{error}</div>}
        {success && <div className="success-message">Berhasil masuk</div>}
      </div>
    </div>
  )
}



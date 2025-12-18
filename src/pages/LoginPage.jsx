import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Menentukan tujuan pengalihan default
  const from = location.state?.from?.pathname || '/';

  // Redirect jika sudah terautentikasi
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Hapus error saat pengguna mulai mengetik
    if (error) setError('');
    // Sembunyikan pesan sukses jika pengguna mulai mengetik ulang
    if (showSuccess) setShowSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Bersihkan error sebelumnya
    setShowSuccess(false); // Bersihkan pesan sukses sebelumnya
    
    // Sembunyikan tombol dengan setting isLoading menjadi true
    setIsLoading(true); 
    
    try {
      // Tunggu sebentar untuk memberi kesan "loading" yang lebih baik
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      const result = await login(formData);
      
      if (result.success) {
        setShowSuccess(true);
        
        // Atur pengalihan setelah penundaan singkat
        setTimeout(() => {
          // Tentukan peran pengguna untuk pengalihan
          const userRole = result.user?.role; // Gunakan optional chaining untuk keamanan
          
          let redirectPath = '/';
          if (userRole === 'admin' || userRole === 'guru') {
            redirectPath = '/dashboard';
          } else if (userRole === 'siswa') {
            redirectPath = '/student';
          } 
          
          navigate(redirectPath, { replace: true });
        }, 1500); // Tunda 1.5 detik setelah berhasil
        
        // Penting: Jangan set setIsLoading(false) di sini agar tombol tetap hilang
      } else {
        // Gagal: Tampilkan error dan kembalikan tombol
        setError(result.message || 'Login gagal. Username atau password sepertinya salah.');
        setIsLoading(false); // Tampilkan kembali tombol
      }
    } catch (error) {
      // Terjadi kesalahan: Tampilkan error dan kembalikan tombol
      setError(error.message || 'Terjadi kesalahan. Mohon coba beberapa saat lagi.');
      setIsLoading(false); // Tampilkan kembali tombol
    }
    // Catatan: setIsLoading(false) hanya dipanggil saat gagal. 
    // Jika berhasil, pengalihan akan terjadi.
  };

  // Logika createParticles dan useEffect yang terkait telah dihapus
  // untuk menghilangkan animasi partikel/putaran.

  // Komponen Tombol Login terpisah untuk kemudahan
  const LoginButton = () => {
    if (isLoading) {
      // Saat loading, tombol hilang, mungkin digantikan dengan teks sederhana atau spinner non-berputar
      return (
        <div className="loading-state" style={{ 
          padding: '12px 20px', 
          backgroundColor: '#eff6ff', 
          color: '#3b82f6', 
          borderRadius: '8px', 
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Sedang Memproses...
        </div>
      );
    }

    if (showSuccess) {
      // Saat sukses, tampilkan pesan sukses
      return (
        <div className="success-btn" style={{
          padding: '12px 20px',
          backgroundColor: '#10b981', 
          color: 'white', 
          borderRadius: '8px', 
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          Berhasil! ✓
        </div>
      );
    }
    
    // Kondisi normal: Tampilkan tombol Masuk
    return (
      <button
        type="submit"
        className="submit-btn"
      >
        Masuk
      </button>
    );
  };

  return (
    <div className="login-container">
      {/* Animated bubbles dan back-button (tetap dipertahankan) */}
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="bubble"
          style={{
            width: [80, 60, 100, 40, 70, 90, 50][i] + 'px',
            height: [80, 60, 100, 40, 70, 90, 50][i] + 'px',
            left: [10, 20, 35, 50, 65, 80, 90][i] + '%',
            animationDelay: [0, 1, 2, 3, 1.5, 4, 2.5][i] + 's',
            animationDuration: [6, 8, 7, 9, 6.5, 8.5, 7.5][i] + 's'
          }}
        />
      ))}

      <Link to="/" className="back-button">
        ← Kembali ke Beranda
      </Link>

      {/* Glass container */}
      <div className="glass-container">
        <h1 className="login-title">
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Ruang</span> Kelas
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan username Anda"
              required
              className="login-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password Anda"
              required
              className="login-input"
            />
          </div>

          {error && (
            <div className="error-message" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Mengganti tombol lama dengan komponen LoginButton baru */}
          <LoginButton />

          {showSuccess && (
            <div className="success-message" style={{
              marginTop: '15px',
              color: '#10b981',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              🎉 Login berhasil! Mengalihkan ke beranda...
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
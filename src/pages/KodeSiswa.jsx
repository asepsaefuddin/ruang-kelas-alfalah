import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { examService } from '../services/examService';
import '../styles/template4.css';

export default function KodeSiswa() {
  const [code, setCode] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Redirect non-siswa to appropriate page
    if (user?.role !== 'siswa') {
      if (user?.role === 'admin' || user?.role === 'guru') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
      return;
    }
    
    document.body.classList.add('student-body');
    
    // Add small CSS animations (spin used elsewhere, plus simple loading dots)
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes dotFade {
        0%, 20% { opacity: 0.25; transform: translateY(0); }
        50% { opacity: 1; transform: translateY(-3px); }
        100% { opacity: 0.25; transform: translateY(0); }
      }

      .loading-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        background: white;
        border-radius: 50%;
        margin-left: 6px;
        vertical-align: middle;
        animation: dotFade 0.9s infinite ease-in-out;
      }
      .loading-dot.delay-1 { animation-delay: 0s; }
      .loading-dot.delay-2 { animation-delay: 0.12s; }
      .loading-dot.delay-3 { animation-delay: 0.24s; }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.body.classList.remove('student-body');
      document.head.removeChild(style);
    };
  }, [isAuthenticated, user, navigate]);

  // Helper function to read a cookie by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Rely on server-side history check (server returns `sudah_submit` if user already submitted)

    try {
      console.log('🔍 Validating exam code:', code);
      const result = await examService.getUjianByKode(code, token);
      
      if (result.success) {
        // Cek apakah server menandakan ujian sudah pernah dikerjakan
        if (result.data?.sudah_submit === true) {
          console.warn('🚫 Ujian ini sudah pernah dikerjakan oleh pengguna ini.');
          setError('Anda sudah pernah mengerjakan ujian ini.');
          setIsLoading(false);
          return; // Hentikan proses
        }

        setSuccess(true);
        console.log('✅ Exam found:', result.data);
        
        setTimeout(() => {
          console.log('Navigate to exam with code:', code);
          navigate(`/ujian/${code}`, { state: { examData: result.data } });
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Validation error:', error);
      
      // Use the enhanced error message from examService
      let displayError = error.message;
      
      // If it's a network error, provide additional guidance
      if (error.isNetworkError) {
        displayError = `${error.message}\n\n💡 Tips:\n• Periksa koneksi Wi-Fi/data seluler\n• Coba refresh halaman\n• Tunggu beberapa saat lalu coba lagi`;
      }
      
      setError(displayError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStudent = () => {
    navigate('/student');
  };

  if (!user || user.role !== 'siswa') {
    // Show a non-rotating, subtle pulsing loader while auth/user is not ready
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '4px solid rgba(255,255,255,0.12)',
            boxSizing: 'border-box',
            // simple pulsing via transform and opacity (no rotation)
            animation: 'pulseLoader 1.2s infinite ease-in-out'
          }}
        />
        <style>{`@keyframes pulseLoader { 0% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); opacity: 0.6; } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Animated bubbles */}
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

      {/* Back button */}
      <button 
        onClick={handleBackToStudent}
        className="back-button"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '10px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          zIndex: 1000
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        ← Kembali ke Dashboard
      </button>

      {/* Glass container */}
      <div className="glass-container">
        <h1 style={{ textAlign: 'center' }}>
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Masukkan</span> <span style={{ color: 'white' }}>Kode Ujian</span>
        </h1>
        
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontSize: '16px', 
            margin: '0 0 5px 0',
            fontWeight: '500'
          }}>
            Halo, <strong style={{ color: '#60a5fa' }}>{user.namaLengkap || user.username}</strong>
          </p>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '13px', 
            margin: '0',
            background: 'rgba(59, 130, 246, 0.15)',
            padding: '6px 12px',
            borderRadius: '20px',
            display: 'inline-block',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            📚 Kelas: {user.kelas || 'Tidak tersedia'}
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label style={{
              display: 'block',
              color: 'white',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'left'
            }}>Kode Ujian</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Masukkan kode ujian.."
              required
              className="login-input"
              style={{
                width: '100%',
                padding: '15px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                color: 'white',
                outline: 'none',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
                e.target.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              marginBottom: '20px',
              padding: '16px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Kode tidak tersedia
              </div>
            </div>
          )}

          <button
  type="submit"
  disabled={isLoading || !code.trim()}
  className={`submit-btn ${success ? 'success' : ''} ${isLoading ? 'btn-loading' : ''}`}
  style={{
    width: '100%',
    padding: '15px 20px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '12px',
    border: 'none',
    cursor: isLoading || !code.trim() ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s ease',
    background: success 
      ? 'linear-gradient(135deg, #10b981, #059669)' 
      : isLoading || !code.trim()
      ? 'rgba(107, 114, 128, 0.6)'
      : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    boxShadow: success 
      ? '0 8px 25px rgba(16, 185, 129, 0.4)'
      : isLoading || !code.trim()
      ? 'none'
      : '0 8px 25px rgba(59, 130, 246, 0.4)',
    backdropFilter: 'blur(10px)'
  }}
  aria-busy={isLoading}
  aria-live="polite"
>
  {isLoading
    ? 'Memvalidasi...'
    : success
    ? '✓ Berhasil! Mengarahkan...'
    : '🚀 Mulai Ujian'}
</button>


          {success && (
            <div style={{
              marginTop: '20px',
              padding: '15px 20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              color: '#10b981',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.1)'
            }}>
              🎉 Kode valid! Mengarahkan ke halaman ujian...
            </div>
          )}
        </form>

        <div style={{ 
          marginTop: '25px', 
          padding: '18px 20px', 
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))', 
          borderRadius: '15px',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          backdropFilter: 'blur(15px)',
          boxShadow: '0 8px 25px rgba(59, 130, 246, 0.1)'
        }}>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontSize: '13px', 
            margin: '0', 
            textAlign: 'center',
            lineHeight: '1.5'
          }}>
            <span style={{ fontSize: '16px', marginRight: '8px' }}>💡</span>
            <strong style={{ color: '#60a5fa' }}>Tips:</strong> Pastikan kode ujian yang dimasukkan sesuai dengan yang diberikan oleh guru Anda. Kode bersifat case-sensitive.
          </p>
        </div>
      </div>
    </div>
  );
}
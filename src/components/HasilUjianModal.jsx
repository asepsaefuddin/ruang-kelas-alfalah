import React from 'react';

const HasilUjianModal = ({ result, onClose, hasEssay }) => {
  if (!result) return null;

  const {
    percentage,
    is_lulus,
    keterangan
  } = result;

  const isLulus = is_lulus;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }}>
      <div style={{
        background: 'white', borderRadius: '16px', padding: '40px',
        maxWidth: '500px', width: '90%', textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        borderTop: `8px solid ${isLulus ? '#22c55e' : '#ef4444'}`
      }}>
        <h2 style={{
          color: isLulus ? '#166534' : '#991b1b',
          fontSize: '28px', margin: '0 0 10px 0'
        }}>
          {isLulus ? '🎉 Selamat, Anda Lulus!' : '😔 Tetap Semangat, Coba Lagi!'}
        </h2>

        <div style={{
          fontSize: '72px', fontWeight: 'bold',
          color: isLulus ? '#16a34a' : '#dc2626',
          margin: '20px 0'
        }}>
          {percentage}%
        </div>

        <div style={{
          background: '#f8fafc', border: '1px solid #e2e8f0',
          borderRadius: '12px', padding: '20px',
          marginBottom: '25px'
        }}>
          <p style={{
            margin: '0 0 15px 0', fontSize: '16px',
            color: '#334155', lineHeight: '1.5'
          }}>
            "{keterangan?.saran || keterangan?.feedback_ai || 'Kerja bagus!'}"
          </p>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontSize: '12px', color: '#64748b'
          }}>
            <span>♊ Feedback oleh AI</span>
          </div>
        </div>

        {hasEssay && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '10px', borderRadius: '8px',
            fontSize: '13px', color: '#1e40af',
            marginBottom: '25px'
          }}>
            💡 Penilaian soal essay dievaluasi secara otomatis oleh AI.
          </div>
        )}

        <div style={{
          display: 'flex', justifyContent: 'space-around',
          fontSize: '14px', color: '#475569',
          marginBottom: '30px'
        }}>
          <div>
            <strong>Nilai Anda:</strong> <span style={{ color: '#1f2937', fontWeight: 'bold' }}>{percentage}%</span>
          </div>
          <div>
            <strong>Minimal Lulus:</strong> <span style={{ color: '#1f2937', fontWeight: 'bold' }}>{keterangan?.minimal_untuk_lulus || 'N/A'}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '15px',
            background: isLulus ? '#22c55e' : '#3b82f6',
            color: 'white', border: 'none', borderRadius: '12px',
            fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            transition: 'background 0.3s ease'
          }}
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};

export default HasilUjianModal;
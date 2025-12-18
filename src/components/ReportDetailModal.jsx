import React from 'react'

const ReportDetailModal = ({ viewingReport, onClose }) => {
  console.log('ReportDetailModal - viewingReport:', viewingReport)
  
  // Return null if no report or invalid report structure
  if (!viewingReport) return null
  
  // Check for valid data structure to prevent errors when data is invalid
  if (!viewingReport.detailJawaban || !Array.isArray(viewingReport.detailJawaban)) {
    return (
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
          borderRadius: '12px', 
          padding: '30px', 
          maxWidth: '600px',
          width: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}>⚠️ Error</h3>
            <button 
              onClick={onClose}
              style={{ 
                background: '#ef4444', 
                border: 'none', 
                color: 'white',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '18px', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
          <p style={{ fontSize: '16px', color: '#4b5563', marginBottom: '20px' }}>
            Data laporan tidak valid atau tidak dapat diakses. Laporan ini mungkin sudah dihapus dari server.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={onClose}
              style={{ 
                background: '#ef4444', 
                border: 'none', 
                color: 'white',
                borderRadius: '6px',
                padding: '10px 16px',
                fontSize: '14px', 
                cursor: 'pointer',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
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
        borderRadius: '12px', 
        padding: '30px', 
        maxWidth: '800px', 
        maxHeight: '90vh', 
        overflow: 'auto',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#1f2937', fontSize: '24px', fontWeight: 'bold' }}>📊 Detail Laporan Ujian</h3>
          <button 
            onClick={onClose}
            style={{ 
              background: '#ef4444', 
              border: 'none', 
              color: 'white',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              fontSize: '18px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
        
        {/* Student Information */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          color: 'white'
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>👤 Informasi Siswa</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Nama:</strong> {viewingReport.namaSiswa || '-'}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Kelas:</strong> {viewingReport.kelas || '-'}</p>
            </div>
            <div>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>NIM/NIS:</strong> {viewingReport.nipNim || '-'}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Tanggal Ujian:</strong> {new Date(viewingReport.tanggal || Date.now()).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Exam Information */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          color: 'white'
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>📝 Informasi Ujian</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Kode Ujian:</strong> {viewingReport.kodeSoal || '-'}</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Judul:</strong> {viewingReport.judulUjian || '-'}</p>
            </div>
            <div>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Durasi:</strong> {viewingReport.durasi || 0} menit</p>
              <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Minimal Nilai:</strong> {viewingReport.minimalNilai || 70}%</p>
            </div>
          </div>
        </div>

        {/* Score Information */}
        <div style={{ 
          background: (typeof viewingReport.nilai === 'number' ? viewingReport.nilai : 0) >= (viewingReport.minimalNilai || 70) 
            ? 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' 
            : 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          color: 'white',
          textAlign: 'center'
        }}>
          <h4 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>🎯 Hasil Ujian</h4>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
            {typeof viewingReport.nilai === 'number' ? viewingReport.nilai : 'NO SCORE'}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>
            {(typeof viewingReport.nilai === 'number' ? viewingReport.nilai : 0) >= (viewingReport.minimalNilai || 70) ? '✅ LULUS' : '❌ TIDAK LULUS'}
          </div>
          <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.9 }}>
            Batas kelulusan: {viewingReport.minimalNilai || 70}%
          </div>
        </div>

        {/* Detailed Answers */}
        {viewingReport.detailJawaban && Array.isArray(viewingReport.detailJawaban) && (
          <div style={{ 
            background: '#f8fafc', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '18px' }}>📋 Detail Jawaban</h4>
                                    {viewingReport.detailJawaban.map((answer, index) => {
                                        // Normalize and compare answers more robustly (trim, lower-case, handle arrays/multiple choices)
                                        const normalizeToArray = (v) => {
                                        if (v == null || v === undefined) return []
                                        if (Array.isArray(v)) return v.map(x => String(x).trim().toLowerCase()).filter(Boolean)
                                        const s = String(v || '').trim()
                                        if (!s || s === 'null' || s === 'undefined') return []
                                        // split common separators for multi-select answers
                                        return s.split(/[,|;\/]+/).map(x => x.trim().toLowerCase()).filter(Boolean)
                                        }

                                        const arraysEqualAsSets = (a, b) => {
                                        const sa = new Set(a)
                                        const sb = new Set(b)
                                        if (sa.size !== sb.size) return false
                                        for (const x of sa) if (!sb.has(x)) return false
                                        return true
                                        }

                                        const stuArr = normalizeToArray(answer.jawabanSiswa)
                                        const corrArr = normalizeToArray(answer.jawabanBenar)

                                        // Determine correctness: prioritize isCorrect from server, fallback to score/comparison
                                        let isCorrect = false
                                        
                                        // First, check if server provided isCorrect field (most reliable)
                                        if (answer.isCorrect !== undefined) {
                                        isCorrect = answer.isCorrect
                                        } 
                                        // Fallback: use score (for pilihan ganda, score is 0 or 100)
                                        else if (answer.skor !== undefined && answer.skor !== null) {
                                        isCorrect = answer.skor === 100
                                        } 
                                        // Final fallback: compare answers directly
                                        else if (corrArr.length > 0) {
                                        if (corrArr.length === 1) {
                                          // single correct answer: any student selection that matches it counts
                                          isCorrect = stuArr.some(s => s === corrArr[0])
                                        } else {
                                          // multiple correct answers: require sets to match
                                          isCorrect = arraysEqualAsSets(stuArr, corrArr)
                                        }
                                        }
                                        // For essay questions without correct answer, check if answered and scored
                                        else if (corrArr.length === 0 && stuArr.length > 0) {
                                        isCorrect = answer.skor !== undefined && answer.skor !== null && answer.skor > 0
                                        }

                                        return (
                                        <div key={index} style={{
                                          background: 'white',
                                          padding: '15px',
                                          borderRadius: '8px',
                                          marginBottom: '15px',
                                          border: '1px solid #e5e7eb',
                                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                          <span style={{
                                            background: '#3b82f6',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '50%',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            minWidth: '24px',
                                            textAlign: 'center'
                                          }}>
                                            {index + 1}
                                          </span>
                                          <span style={{
                                            background: isCorrect ? '#22c55e' : '#ef4444',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                          }}>
                                            {isCorrect ? '✓ BENAR' : '✗ SALAH'}
                                          </span>
                                          </div>

                                          <p style={{ margin: '5px 0', fontSize: '14px', color: '#374151' }}>
                                          <strong>Pertanyaan:</strong> {answer.pertanyaan || 'Pertanyaan tidak tersedia'}
                                          </p>

                                          <p style={{ margin: '5px 0', fontSize: '14px', color: '#374151' }}>
                                          <strong>Jawaban Siswa:</strong>
                                          <span style={{
                                            background: isCorrect ? '#dcfce7' : '#fee2e2',
                                            color: isCorrect ? '#166534' : '#991b1b',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            marginLeft: '8px',
                                            fontWeight: '500'
                                          }}>
                                            {answer.jawabanSiswa && answer.jawabanSiswa.trim() !== '' ? answer.jawabanSiswa : 'Tidak dijawab'}
                                          </span>
                                          </p>

                                          {answer.jawabanBenar && answer.jawabanBenar !== null && String(answer.jawabanBenar).trim() !== '' && (
                                          <p style={{ margin: '5px 0', fontSize: '14px', color: '#374151' }}>
                                            <strong>Jawaban Benar:</strong>
                                            <span style={{
                                            background: '#dcfce7',
                                            color: '#166534',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            marginLeft: '8px',
                                            fontWeight: '500'
                                            }}>
                                            {answer.jawabanBenar}
                                            </span>
                                          </p>
                                          )}
                                        </div>
                                        )
                                    })}          </div>
        )}
      </div>
    </div>
  )
}

export default ReportDetailModal
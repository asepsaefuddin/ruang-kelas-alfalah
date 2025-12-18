const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ruang-kelas-server-2jhz.vercel.app'
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // Use backend URL from env or default to backend port

class SoalService {
  // Get all soals with pagination
  async getAllSoals(token, page = 1, limit = 10) {
    try {
      console.log('🔍 Fetching soals:', { page, limit })
      
      const response = await fetch(`${API_BASE_URL}/soals?page=${page}&limit=${limit}&_t=${new Date().getTime()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      })

      const result = await response.json()
      console.log('✅ Soals fetched:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch soals')
      }

      return result
    } catch (error) {
      console.error('❌ Error fetching soals:', error)
      throw error
    }
  }

  // Get single soal by ID
  async getSoalById(token, id) {
    try {
      console.log('🔍 Fetching soal by ID:', id)
      
      const response = await fetch(`${API_BASE_URL}/soals/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()
      console.log('✅ Soal fetched:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch soal')
      }

      return result
    } catch (error) {
      console.error('❌ Error fetching soal:', error)
      throw error
    }
  }

  // Create new soal with optional image upload
  async createSoal(token, soalData, imageFiles = []) {
    try {
      console.log('📝 Creating soal:', soalData)
      console.log('🖼️ Image files:', imageFiles.length)

      const formData = new FormData()
      
      // Add soal data as JSON string
      formData.append('data', JSON.stringify(soalData))
      
      // Add image files
      imageFiles.forEach((file, index) => {
        formData.append('images', file)
      })

      const response = await fetch(`${API_BASE_URL}/soals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: formData,
      })

      const result = await response.json()
      console.log('✅ Soal created:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create soal')
      }

      return result
    } catch (error) {
      console.error('❌ Error creating soal:', error)
      throw error
    }
  }

  // Update soal with optional image upload
  async updateSoal(token, id, soalData, imageFiles = []) {
    try {
      console.log('📝 Updating soal:', id, soalData)
      console.log('🖼️ Image files:', imageFiles.length)

      const formData = new FormData()
      
      // Add soal data as JSON string
      formData.append('data', JSON.stringify(soalData))
      
      // Add image files
      imageFiles.forEach((file, index) => {
        formData.append('images', file)
      })

      const response = await fetch(`${API_BASE_URL}/soals/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData
        },
        body: formData,
      })

      const result = await response.json()
      console.log('✅ Soal updated:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update soal')
      }

      return result
    } catch (error) {
      console.error('❌ Error updating soal:', error)
      throw error
    }
  }

  // Import soal file (CSV/Excel). Expects backend endpoint POST /soals/import
  // Import soal file (CSV/Excel/Docx). Expects backend endpoint POST /soals/import
  // Accepts optional meta object to create the soal directly: { kode, judul, durasi, minimalNilai }
  async importSoals(token, file, meta = null, save = false) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (save && meta) {
        formData.append('save', 'true')
        formData.append('data', JSON.stringify(meta))
      }

      const response = await fetch(`${API_BASE_URL}/soals/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to import soal file')
      }

      return result
    } catch (error) {
      console.error('❌ Error importing soal file:', error)
      throw error
    }
  }

  // Delete soal
  async deleteSoal(token, id) {
    try {
      console.log('🗑️ Deleting soal:', id)
      
      const response = await fetch(`${API_BASE_URL}/soals/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()
      console.log('✅ Soal deleted:', result)

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete soal')
      }

      return result
    } catch (error) {
      console.error('❌ Error deleting soal:', error)
      throw error
    }
  }

  // Validate soal data
  validateSoalData(data) {
    const errors = []

    if (!data.kode || data.kode.trim() === '') {
      errors.push('Kode ujian harus diisi')
    }

    if (!data.judul || data.judul.trim() === '') {
      errors.push('Judul ujian harus diisi')
    }

    if (!data.durasi || data.durasi < 1) {
      errors.push('Durasi ujian minimal 1 menit')
    }

    if (!data.minimalNilai || data.minimalNilai < 0 || data.minimalNilai > 100) {
      errors.push('Minimal nilai harus antara 0-100')
    }

    if (!data.soal || data.soal.length === 0) {
      errors.push('Minimal harus ada 1 soal')
    } else {
      data.soal.forEach((item, index) => {
        if (!item.soal || item.soal.trim() === '') {
          errors.push(`Soal nomor ${index + 1} harus diisi`)
        }

        if (!item.type || !['pilihan ganda', 'essay', 'pilihan ganda + image', 'essay + image'].includes(item.type)) {
          errors.push(`Tipe soal nomor ${index + 1} harus dipilih`)
        }

        if (item.type.includes('pilihan ganda')) {
          if (!item.list_jawaban || item.list_jawaban.length < 2) {
            errors.push(`Soal pilihan ganda nomor ${index + 1} minimal harus ada 2 pilihan`)
          }

          if (!item.jawaban_benar || item.jawaban_benar.trim() === '') {
            errors.push(`Soal pilihan ganda nomor ${index + 1} harus ada jawaban benar`)
          }
        }

        if (item.type.includes('essay')) {
          if (!item.kunci_jawaban || item.kunci_jawaban.trim() === '') {
            errors.push(`Soal essay nomor ${index + 1} harus ada kunci jawaban`)
          }
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Format soal data for API
  formatSoalData(data) {
    return {
      kode: data.kode.trim(),
      judul: data.judul.trim(),
      durasi: parseInt(data.durasi),
      minimalNilai: parseInt(data.minimalNilai),
      soal: data.soal.map(item => {
        const questionData = {
          type: item.type,
          soal: item.soal.trim(), // Pastikan soal di-trim
        };
        
        // KUNCI: Hanya tambahkan gambar jika benar-benar ada dan bukan string kosong
        if (item.gambar && typeof item.gambar === 'string' && item.gambar.trim() !== '') {
          questionData.gambar = item.gambar.trim();
        }
        
        const typeSpecificData = item.type.includes('pilihan ganda') ? {
          list_jawaban: (item.list_jawaban || []).map(opt => opt.trim()).filter(opt => opt !== ''),
          // Backend expects `jawaban` field for the correct answer. Also keep jawaban_benar if present.
          jawaban: (item.jawaban_benar ?? item.jawaban ?? '').trim() || undefined,
          jawaban_benar: item.jawaban_benar?.trim() || undefined
        } : {
          // For essay, backend uses `jawaban` as well (kunci jawaban)
          jawaban: (item.kunci_jawaban ?? item.jawaban ?? '').trim() || undefined,
          kunci_jawaban: item.kunci_jawaban?.trim() || undefined
        };
        
        return { ...questionData, ...typeSpecificData };
      })
    }
  }
}

export const soalService = new SoalService()
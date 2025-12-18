// userService.js - Service untuk menghandle API calls terkait user management
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ruang-kelas-alfalah-server.vercel.app'; // Use backend URL from env or default to backend port

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ruang-kelas-server-2jhz.vercel.app';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // Use backend URL from env or default to backend port

class UserService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/users`;
  }

  // Helper method untuk headers dengan token
  getHeaders(token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get all users dengan pagination dan filter
  async getAllUsers(token, page = 1, limit = 10, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      console.log('🔍 Fetching users with params:', params.toString());
      
      const response = await fetch(`${this.baseURL}?${params}&_t=${new Date().getTime()}`, {
        method: 'GET',
        headers: this.getHeaders(token),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Users fetched successfully:', result);
      
      return {
        success: true,
        data: result.data || [],
        pagination: {
          page: result.page || page,
          limit: result.limit || limit,
          total: result.total || 0,
          count: result.count || 0
        }
      };
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      throw new Error(error.message || 'Gagal mengambil data users');
    }
  }

  // Create new user
  async createUser(token, userData) {
    try {
      console.log('🔥 Creating user with data:', userData);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getHeaders(token),
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ User created successfully:', result);
      return {
        success: true,
        data: result.data,
        message: result.message || 'User berhasil dibuat'
      };
    } catch (error) {
      console.error('❌ Error creating user:', error);
      throw new Error(error.message || 'Gagal membuat user');
    }
  }

  // Update user
  async updateUser(token, userId, userData) {
    try {
      console.log('📝 Updating user:', userId, 'with data:', userData);
      
      // Log what's being sent to help debug
      if (userData.password) {
        console.log('🔐 Password will be updated');
      } else {
        console.log('🔐 Password will NOT be updated (keeping existing password)');
      }
      
      const response = await fetch(`${this.baseURL}/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(token),
        body: JSON.stringify(userData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ User updated successfully:', result);
      return {
        success: true,
        data: result.data,
        message: result.message || 'User berhasil diupdate'
      };
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw new Error(error.message || 'Gagal mengupdate user');
    }
  }

  // Delete user
  async deleteUser(token, userId) {
    try {
      console.log('🗑️ Deleting user:', userId);
      
      const response = await fetch(`${this.baseURL}/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders(token),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ User deleted successfully:', result);
      return {
        success: true,
        message: result.message || 'User berhasil dihapus'
      };
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      throw new Error(error.message || 'Gagal menghapus user');
    }
  }

  /**
   * Bulk create users from Excel file
   * Upload file Excel dan generate multiple users sekaligus
   * @param {string} token - Auth token
   * @param {File} excelFile - File Excel (.xlsx or .xls)
   * @returns {Promise} Response dengan summary dan detail hasil
   */
  async bulkCreateUsers(token, excelFile) {
    try {
      console.log('📤 Uploading Excel file for bulk user creation');
      
      // Validate file
      if (!excelFile) {
        throw new Error('File Excel tidak ditemukan');
      }

      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!validTypes.includes(excelFile.type)) {
        throw new Error('Format file tidak valid. Gunakan file Excel (.xlsx atau .xls)');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (excelFile.size > maxSize) {
        throw new Error('Ukuran file terlalu besar. Maksimal 5MB');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', excelFile);

      // Send request
      const response = await fetch(`${this.baseURL}/bulk-create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, browser will set it with boundary for FormData
        },
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      console.log('✅ Bulk users created successfully:', result);
      return {
        success: result.success,
        message: result.message,
        summary: result.summary,
        results: result.results
      };
    } catch (error) {
      console.error('❌ Error bulk creating users:', error);
      throw new Error(error.message || 'Gagal membuat users dari Excel');
    }
  }

  // Get user by ID
  async getUserById(token, userId) {
    try {
      console.log('🔍 Fetching user by ID:', userId);
      
      const response = await fetch(`${this.baseURL}/${userId}`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ User fetched successfully:', result);
      
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('❌ Error fetching user:', error);
      throw new Error(error.message || 'Gagal mengambil data user');
    }
  }

  // Validate user data based on role
  validateUserData(userData, isEdit = false) {
    const errors = [];

    // Basic validation
    if (!userData.username || userData.username.trim().length < 3) {
      errors.push('Username minimal 3 karakter');
    }

    // Password validation - skip if editing and password is empty (means no change)
    if (!isEdit && (!userData.password || userData.password.length < 6)) {
      errors.push('Password minimal 6 karakter');
    } else if (isEdit && userData.password && userData.password.length < 6) {
      errors.push('Jika ingin mengubah password, minimal 6 karakter');
    }

    if (!userData.namaLengkap || userData.namaLengkap.trim().length < 2) {
      errors.push('Nama lengkap minimal 2 karakter');
    }

    if (!userData.nipNim || userData.nipNim.trim().length < 3) {
      errors.push('NIP/NIM minimal 3 karakter');
    }

    if (!userData.role || !['admin', 'guru', 'siswa'].includes(userData.role)) {
      errors.push('Role harus dipilih (admin, guru, atau siswa)');
    }

    // Role-specific validation
    if (userData.role === 'siswa' && (!userData.kelas || userData.kelas.trim().length < 1)) {
      errors.push('Kelas wajib diisi untuk siswa');
    }

    if (userData.role === 'guru' && (!userData.mataPelajaran || userData.mataPelajaran.trim().length < 2)) {
      errors.push('Mata pelajaran wajib diisi untuk guru');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Format user data for API
  formatUserData(formData, isEdit = false) {
    const userData = {
      username: formData.username.trim(),
      namaLengkap: formData.namaLengkap.trim(),
      nipNim: formData.nipNim.trim(),
      role: formData.role,
      status: formData.status || 'aktif'
    };

    // Only include password if it's not empty (for edits) or if it's a new user
    if (!isEdit) {
      // For new users, password is always required
      userData.password = formData.password;
    } else if (isEdit && formData.password && formData.password.trim() !== '') {
      // For edits, only include password if it's provided and not empty
      userData.password = formData.password.trim();
    }
    // If editing and password is empty/undefined, don't include it in userData

    // Add role-specific fields
    if (formData.role === 'siswa' && formData.kelas) {
      userData.kelas = formData.kelas.trim();
    }

    if (formData.role === 'guru' && formData.mataPelajaran) {
      userData.mataPelajaran = formData.mataPelajaran.trim();
    }

    return userData;
  }

  // Download template Excel sederhana (satu sheet, header tebal)
  handleDownloadTemplate() {
    try {
      const wb = XLSX.utils.book_new()

      // Sheet 1: Keterangan/Panduan
      const guideData = [
        ['📋 PANDUAN IMPORT USER - BACA INI TERLEBIH DAHULU!'],
        [''],
        ['✅ INSTRUKSI:'],
        ['1. Isi data user mulai dari Baris 8 (jangan ubah header di Baris 7)'],
        ['2. Kolom yang wajib diisi: username, password, namaLengkap, nipNim, role'],
        ['3. Role hanya boleh: siswa, guru, atau admin (huruf kecil)'],
        ['4. Status hanya boleh: aktif atau tidak aktif (huruf kecil)'],
        ['5. Untuk siswa: wajib isi kolom kelas'],
        ['6. Untuk guru: wajib isi kolom mataPelajaran'],
        ['7. Untuk admin: kolom kelas dan mataPelajaran kosong saja'],
        [''],
        ['⚠️ JANGAN:'],
        ['- Ubah nama header kolom'],
        ['- Hapus kolom apapun'],
        ['- Tambah kolom baru'],
        ['- Gunakan spasi di awal/akhir data'],
        ['- Biarkan sel kosong untuk field wajib'],
        [''],
        ['💾 CARA EXPORT:'],
        ['1. Setelah isi data, pilih Sheet "Data User"'],
        ['2. Save file sebagai .xlsx (Excel format)'],
        ['3. Upload kembali ke sistem'],
        [''],
        ['❓ CONTOH PENGISIAN:'],
        ['Lihat di Sheet "Data User" baris 8-12 untuk contoh data']
      ]

      const guideWs = XLSX.utils.aoa_to_sheet(guideData)
      guideWs['!cols'] = [{ wch: 80 }]
      XLSX.utils.book_append_sheet(wb, guideWs, 'Panduan')

      // Sheet 2: Data user dengan header dan contoh
      const userData = [
        ['username', 'password', 'namaLengkap', 'nipNim', 'role', 'status', 'kelas', 'mataPelajaran'],
        ['siswa001', 'password123', 'Ahmad Rizki Maulana', '20230001', 'siswa', 'aktif', '10A', ''],
        ['siswa002', 'password123', 'Budi Santoso', '20230002', 'siswa', 'aktif', '10B', ''],
        ['siswa003', 'password123', 'Citra Dewi Kusuma', '20230003', 'siswa', 'aktif', '10C', ''],
        ['guru001', 'password123', 'Siti Nurhaliza S.Pd', '198501001', 'guru', 'aktif', '', 'Matematika'],
        ['guru002', 'password123', 'Budi Hartono M.Pd', '198502002', 'guru', 'aktif', '', 'Fisika'],
        ['guru003', 'password123', 'Eka Suryanto S.Pd', '198503003', 'guru', 'aktif', '', 'Bahasa Indonesia'],
        ['admin001', 'password123', 'Muhammad Fadli', '197001001', 'admin', 'aktif', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ]

      const userWs = XLSX.utils.aoa_to_sheet(userData)
      userWs['!cols'] = [
        { wch: 15 },{ wch: 15 },{ wch: 25 },{ wch: 15 },{ wch: 12 },{ wch: 15 },{ wch: 12 },{ wch: 20 }
      ]

      // Style header (baris pertama)
      for (let col = 0; col < 8; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: col })
        if (!userWs[cellRef]) userWs[cellRef] = {}
        userWs[cellRef].fill = { patternType: 'solid', fgColor: { rgb: '366092' } }
        userWs[cellRef].font = { bold: true, color: { rgb: 'FFFFFF' } }
        userWs[cellRef].alignment = { horizontal: 'center', vertical: 'center', wrapText: true }
      }

      XLSX.utils.book_append_sheet(wb, userWs, 'Data User')

      // Sheet 3: Referensi validasi
      const refData = [
        ['REFERENSI VALIDASI DATA'],
        [''],
        ['Role yang valid:', 'siswa, guru, admin'],
        ['Status yang valid:', 'aktif, tidak aktif'],
        [''],
        ['PENJELASAN FIELD:'],
        ['username', 'Login name (minimal 3 karakter, unik)'],
        ['password', 'Password (minimal 6 karakter)'],
        ['namaLengkap', 'Nama lengkap user (minimal 2 karakter)'],
        ['nipNim', 'NIP untuk guru/admin, NIM untuk siswa (minimal 3 karakter)'],
        ['role', 'Peran: siswa, guru, atau admin'],
        ['status', 'Status aktif: aktif atau tidak aktif'],
        ['kelas', 'Kelas (wajib untuk siswa, kosong untuk guru/admin)'],
        ['mataPelajaran', 'Mata pelajaran (wajib untuk guru, kosong untuk siswa/admin)']
      ]

      const refWs = XLSX.utils.aoa_to_sheet(refData)
      refWs['!cols'] = [{ wch: 25 }, { wch: 50 }]
      XLSX.utils.book_append_sheet(wb, refWs, 'Referensi')

      XLSX.writeFile(wb, 'Template_Import_User.xlsx')
      showSuccessAlert('Template Excel berhasil didownload! Baca panduan di Sheet "Panduan" terlebih dahulu.')
    } catch (error) {
      showErrorAlert('Gagal membuat template: ' + error.message)
    }
  }
}

export const userService = new UserService();
export default userService;
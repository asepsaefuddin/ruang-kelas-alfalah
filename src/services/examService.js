const API_URL = import.meta.env.VITE_API_URL || 'https://ruang-kelas-server-2jhz.vercel.app';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // Use backend URL from env or default to backend port

class ExamService {
  async getUjianByKode(kode, token) {
    try {
      console.log('🔍 [ExamService] Fetching exam with code:', kode);
      console.log('🔍 [ExamService] API URL:', `${API_URL}/answer/${kode}`);
      console.log('🔍 [ExamService] Token present:', !!token);
      
      const response = await fetch(`${API_URL}/answer/${kode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('🔍 [ExamService] Response status:', response.status);
      console.log('🔍 [ExamService] Response ok:', response.ok);
 
      // Handle different error scenarios with user-friendly messages
      if (!response.ok) {
        let errorMessage = '';
        
        if (response.status === 404) {
          errorMessage = `Oops! Kode ujian "${kode}" tidak ditemukan. 🤔\n\nPastikan kode yang Anda masukkan benar atau hubungi guru Anda untuk mendapatkan kode yang tepat.`;
        } else if (response.status === 401) {
          errorMessage = `Sesi Anda telah berakhir. 🔒\n\nSilakan login ulang untuk melanjutkan.`;
        } else if (response.status === 403) {
          errorMessage = `Maaf, Anda tidak memiliki akses ke ujian ini. �\n\nPastikan Anda memiliki izin untuk mengikuti ujian dengan kode "${kode}".`;
        } else if (response.status >= 500) {
          errorMessage = `Server sedang mengalami gangguan. 🛠️\n\nCoba lagi dalam beberapa saat atau hubungi administrator.`;
        } else {
          // Try to get message from response
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || `Terjadi kesalahan saat mengakses ujian. 😅\n\nSilakan coba lagi atau hubungi bantuan teknis.`;
          } catch {
            errorMessage = `Terjadi kesalahan yang tidak terduga. 😅\n\nSilakan coba lagi atau hubungi bantuan teknis.`;
          }
        }
        
        console.error('❌ [ExamService] Response not ok:', response.status, errorMessage);
        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      console.log('🔍 [ExamService] Response data:', data);
      return data;
      
    } catch (error) {
      console.error('❌ [ExamService] Error fetching exam by code:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error(`Tidak dapat terhubung ke server. 📡\n\nPastikan koneksi internet Anda stabil dan coba lagi.`);
        networkError.isNetworkError = true;
        throw networkError;
      }
      
      // If it's already our custom error, throw as is
      if (error.status) {
        throw error;
      }
      
      // Generic error
      throw new Error(`Terjadi kesalahan saat mengakses ujian. 😅\n\nSilakan coba lagi atau hubungi bantuan teknis.\n\nDetail: ${error.message}`);
    }
  }

  async submitUjian(kode, submissionData, token) {
    try {
      const response = await fetch(`${API_URL}/answer/${kode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });
 
      const data = await response.json();
 
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim jawaban');
      }
 
      return data;
    } catch (error) {
      console.error('Error submitting exam:', error);
      throw error;
    }
  }

  async getHasilUjian(kode, token) {
    try {
      const response = await fetch(`${API_URL}/reports/user/${user.id}/soal/${kode}`, { // Example of a more specific endpoint
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal mengambil hasil ujian');
      }

      return await response.json();
    } catch (error) {
      console.error('Get hasil ujian error:', error);
      throw error;
    }
  }
}

export const examService = new ExamService();
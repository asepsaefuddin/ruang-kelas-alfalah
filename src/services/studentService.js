// const API_URL = import.meta.env.VITE_API_URL || 'https://ruang-kelas-server-2jhz.vercel.app';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // Use backend URL from env or default to backend port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ruang-kelas-alfalah-server.vercel.app'; // Use backend URL from env or default to backend port

class StudentService {
  async getProfileData(token) {
    try {
      console.log('🔍 [StudentService] Fetching profile data');
      
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('🔍 [StudentService] Profile response status:', response.status);
      
      const data = await response.json();
      
      console.log('🔍 [StudentService] Profile data:', data);
      
      if (!response.ok) {
        console.error('❌ [StudentService] Profile response not ok:', data);
        throw new Error(data.message || 'Gagal mengambil data profil');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [StudentService] Error fetching profile:', error);
      throw error;
    }
  }

  async getMyStatistics(token) {
    try {
      const response = await fetch(`${API_URL}/statistics/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengambil statistik siswa');
      }

      // Expect shape: { success, message, data: { totalSoal, soalSelesai, rataRataNilai, totalNilai, riwayat } }
      return data.data;
    } catch (error) {
      console.error('❌ [StudentService] Error fetching my statistics:', error);
      throw error;
    }
  }

  async getExamByCode(kode, token) {
    try {
      console.log('🔍 [StudentService] Fetching exam data for code:', kode);
      
      const response = await fetch(`${API_URL}/answer/${kode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('🔍 [StudentService] Exam response status:', response.status);
      
      const data = await response.json();
      
      console.log('🔍 [StudentService] Exam data:', data);
      
      if (!response.ok) {
        console.error('❌ [StudentService] Exam response not ok:', data);
        // Jika 404, berarti kode tidak valid atau belum ada ujian
        if (response.status === 404) {
          return null;
        }
        throw new Error(data.message || 'Gagal mengambil data ujian');
      }
      
      return data;
    } catch (error) {
      console.error('❌ [StudentService] Error fetching exam:', error);
      throw error;
    }
  }

  // Process profile data to extract basic statistics
  processProfileStats(profileData) {
    if (!profileData || !profileData.data) {
      return {
        totalExamsAttempted: 0,
        averageScore: 0,
        lastActivity: null
      };
    }

    const profile = profileData.data;
    
    // Jika ada field statistics di profile, gunakan itu
    // Jika tidak, return default values
    return {
      totalExamsAttempted: profile.totalExamsAttempted || 0,
      averageScore: profile.averageScore || 0,
      lastActivity: profile.lastActivity || null,
      completedExams: profile.completedExams || 0
    };
  }

  // Simulate basic statistics since we're only using profile endpoint
  generateBasicStats() {
    return {
      totalSoal: 0,
      soalSelesai: 0,
      rataRataNilai: 0,
      totalNilai: 0,
      message: "Untuk melihat statistik lengkap, silakan ikuti ujian terlebih dahulu"
    };
  }
}

export const studentService = new StudentService();
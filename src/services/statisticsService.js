// statisticsService.js - Service untuk menghandle API calls terkait statistics

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ruang-kelas-server-2jhz.vercel.app';
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // Use backend URL from env or default to backend port

class StatisticsService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/statistics`;
  }

  // Helper method untuk headers dengan token
  getHeaders(token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // GET /statistics -> admin only
  async getGeneralStatistics(token) {
    try {
      console.log('🔍 Fetching general statistics (admin only)');
      
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ General statistics fetched successfully:', result);
      
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error('❌ Error fetching general statistics:', error);
      throw new Error(error.message || 'Gagal mengambil statistik umum');
    }
  }

  // GET /statistics/quick -> admin dan guru
  async getQuickStatistics(token) {
    try {
      console.log('🔍 Fetching quick statistics (admin & guru)');
      
      const response = await fetch(`${this.baseURL}/quick`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Quick statistics fetched successfully:', result);
      
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error('❌ Error fetching quick statistics:', error);
      throw new Error(error.message || 'Gagal mengambil statistik cepat');
    }
  }

  // GET /statistics/users -> admin only
  async getUserStatistics(token) {
    try {
      console.log('🔍 Fetching user statistics (admin only)');
      
      const response = await fetch(`${this.baseURL}/users`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ User statistics fetched successfully:', result);
      
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error('❌ Error fetching user statistics:', error);
      throw new Error(error.message || 'Gagal mengambil statistik user');
    }
  }

  // GET /statistics/performance -> admin dan guru
  async getPerformanceStatistics(token) {
    try {
      console.log('🔍 Fetching performance statistics (admin & guru)');
      
      const response = await fetch(`${this.baseURL}/performance`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Performance statistics fetched successfully:', result);
      
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error('❌ Error fetching performance statistics:', error);
      throw new Error(error.message || 'Gagal mengambil statistik performa');
    }
  }

  // GET /statistics/activity -> admin dan guru
  async getActivityStatistics(token) {
    try {
      console.log('🔍 Fetching activity statistics (admin & guru)');
      
      const response = await fetch(`${this.baseURL}/activity`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Activity statistics fetched successfully:', result);
      
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error('❌ Error fetching activity statistics:', error);
      throw new Error(error.message || 'Gagal mengambil statistik aktivitas');
    }
  }

  // GET /statistics/ai-summary -> admin dan guru
  async getAISummary(token) {
    try {
      console.log('🔍 Fetching AI summary (admin & guru)');
      
      const response = await fetch(`${this.baseURL}/ai-summary`, {
        method: 'GET',
        headers: this.getHeaders(token),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ AI summary fetched successfully:', result);
      
      return {
        success: true,
        data: result.data || result
      };
    } catch (error) {
      console.error('❌ Error fetching AI summary:', error);
      throw new Error(error.message || 'Gagal mengambil ringkasan AI');
    }
  }

  // Method untuk mengambil semua statistik sekaligus berdasarkan role
  async getAllStatistics(token, userRole) {
    try {
      console.log('🔍 getAllStatistics called with:', { userRole, tokenExists: !!token });
      
      const promises = [];
      const statistics = {};

      if (userRole === 'admin') {
        // Admin dapat mengakses semua endpoint
        console.log('🔑 Admin role detected, fetching all endpoints...');
        promises.push(
          this.getGeneralStatistics(token).then(result => ({ type: 'general', data: result.data })).catch(err => ({ type: 'general', error: err.message })),
          this.getUserStatistics(token).then(result => ({ type: 'users', data: result.data })).catch(err => ({ type: 'users', error: err.message })),
          this.getQuickStatistics(token).then(result => ({ type: 'quick', data: result.data })).catch(err => ({ type: 'quick', error: err.message })),
          this.getPerformanceStatistics(token).then(result => ({ type: 'performance', data: result.data })).catch(err => ({ type: 'performance', error: err.message })),
          this.getActivityStatistics(token).then(result => ({ type: 'activity', data: result.data })).catch(err => ({ type: 'activity', error: err.message })),
          this.getAISummary(token).then(result => ({ type: 'aiSummary', data: result.data })).catch(err => ({ type: 'aiSummary', error: err.message }))
        );
      } else if (userRole === 'guru') {
        // Guru hanya dapat mengakses endpoint tertentu
        console.log('👨‍🏫 Guru role detected, fetching limited endpoints...');
        promises.push(
          this.getQuickStatistics(token).then(result => ({ type: 'quick', data: result.data })).catch(err => ({ type: 'quick', error: err.message })),
          this.getPerformanceStatistics(token).then(result => ({ type: 'performance', data: result.data })).catch(err => ({ type: 'performance', error: err.message })),
          this.getActivityStatistics(token).then(result => ({ type: 'activity', data: result.data })).catch(err => ({ type: 'activity', error: err.message })),
          this.getAISummary(token).then(result => ({ type: 'aiSummary', data: result.data })).catch(err => ({ type: 'aiSummary', error: err.message }))
        );
      }

      const results = await Promise.allSettled(promises);
      console.log('📊 Promise results:', results);
      
      let hasData = false;
      let errors = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          if (result.value.data) {
            statistics[result.value.type] = result.value.data;
            hasData = true;
            console.log(`✅ ${result.value.type} data loaded successfully`);
          } else if (result.value.error) {
            errors.push(`${result.value.type}: ${result.value.error}`);
            console.warn(`❌ ${result.value.type} failed:`, result.value.error);
          }
        } else {
          errors.push(`Promise ${index} rejected: ${result.reason}`);
          console.warn(`❌ Promise ${index} rejected:`, result.reason);
        }
      });

      if (!hasData && errors.length > 0) {
        throw new Error(`Semua endpoint gagal: ${errors.join(', ')}`);
      }

      console.log('📈 Final statistics:', statistics);
      return {
        success: true,
        data: statistics,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('❌ Error fetching all statistics:', error);
      throw new Error(error.message || 'Gagal mengambil data statistik');
    }
  }
}

export const statisticsService = new StatisticsService();
export default statisticsService;
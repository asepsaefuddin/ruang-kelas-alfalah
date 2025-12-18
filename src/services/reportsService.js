const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ruang-kelas-server-2jhz.vercel.app'
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // Use backend URL from env or default to backend port

export const reportsService = {
  async getAllReports(token, page = 1, limit = 10, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      })

      // Tambahkan timestamp pada URL untuk menghindari cache
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/reports?${params}&_t=${timestamp}`, {
        method: 'GET',
headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching reports:', error)
      throw error
    }
  },

  async getReportById(token, reportId) {
    try {
      // Tambahkan timestamp pada URL untuk menghindari cache
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}?_t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching report detail:', error)
      throw error
    }
  },

  async deleteReport(token, reportId) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  },

  async deleteUserAnswers(token, userId, soalKode) {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/user/${userId}/soal/${soalKode}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error deleting user answers:', error)
      throw error
    }
  }
}
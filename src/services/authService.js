const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ruang-kelas-alfalah-server.vercel.app'; // Use backend URL from env or default to backend port
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // Use backend URL from env or default to backend port

class AuthService {
  async login(credentials) {
    console.log('🔄 Attempting login with:', { username: credentials.username, password: '***' });
    console.log('🌐 API URL:', `${API_BASE_URL}/auth/login`);
    
    try {
      const requestBody = {
        username: credentials.username,
        password: credentials.password,
      };
      
      console.log('📤 Request body:', { ...requestBody, password: '***' });
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'include', // Include credentials
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response text:', errorText);
        
        try {
          const error = JSON.parse(errorText);
          console.error('❌ Error JSON:', error);
          throw new Error(error.message || `HTTP ${response.status}: ${error.error || 'Login gagal'}`);
        } catch (parseError) {
          console.error('❌ Failed to parse error JSON:', parseError);
          throw new Error(`HTTP ${response.status}: ${errorText || 'Login gagal'}`);
        }
      }

      const result = await response.json();
      console.log('✅ Login success:', { ...result, data: result.data ? { ...result.data, access_token: '***' } : undefined });
      return result;
    } catch (error) {
      console.error('🚨 Login error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Oops! Gagal terhubung ke server. Mohon periksa koneksi internet Anda dan coba lagi.');
      }
      
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registrasi gagal');
      }

      return await response.json();
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.');
      }

      return await response.json();
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  async getProfile(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Oops, gagal mengambil data profil Anda. Coba muat ulang halaman.');
      }

      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(token, userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal update profil');
      }

      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
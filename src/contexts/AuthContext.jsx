import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        const response = await authService.verifyToken(storedToken);
        if (response.success) {
          setUser(response.data);
          setToken(storedToken);
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        const { access_token, user: userData } = response.data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: error.message || 'Login gagal' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isGuru: user?.role === 'guru',
    isSiswa: user?.role === 'siswa'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
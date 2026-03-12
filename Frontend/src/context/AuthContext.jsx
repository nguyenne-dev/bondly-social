import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('nexchat_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('nexchat_token') || '');
  const [loading, setLoading] = useState(true);

  // Sync token & user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('nexchat_token');
      if (savedToken) {
        try {
          const res = await api.get('user/profile');
          if (res?.data) {
            setUser(res.data);
            localStorage.setItem('nexchat_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Phiên đăng nhập hết hạn hoặc lỗi token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (account, password) => {
    const res = await api.post('auth/login', { account, password });
    if (res?.data?.token) {
      const authToken = res.data.token;
      const userData = res.data.user || res.data;

      setToken(authToken);
      setUser(userData);
      localStorage.setItem('nexchat_token', authToken);
      localStorage.setItem('nexchat_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res?.message || 'Đăng nhập không thành công');
  };

  const register = async (formData) => {
    const res = await api.post('auth/register', formData);
    return res;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('auth/verify-otp', { email, otp });
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('nexchat_token');
    localStorage.removeItem('nexchat_user');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('nexchat_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        register,
        verifyOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

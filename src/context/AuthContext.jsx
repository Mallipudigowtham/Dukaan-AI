import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, shopAPI } from '../api';
import i18n from '../i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('dukaanai_token'));
  const [shop, setShop] = useState(() => {
    const saved = localStorage.getItem('dukaanai_shop');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync token and shop in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('dukaanai_token', token);
    } else {
      localStorage.removeItem('dukaanai_token');
    }
  }, [token]);

  useEffect(() => {
    if (shop) {
      localStorage.setItem('dukaanai_shop', JSON.stringify(shop));
      if (shop.preferred_language) {
        i18n.changeLanguage(shop.preferred_language);
      }
    } else {
      localStorage.removeItem('dukaanai_shop');
    }
  }, [shop]);

  // Fetch fresh profile on mount if token exists
  useEffect(() => {
    async function loadShopProfile() {
      if (token) {
        try {
          const res = await shopAPI.getProfile();
          setShop(res.data);
          if (res.data.preferred_language) {
            i18n.changeLanguage(res.data.preferred_language);
          }
        } catch (err) {
          console.error('Failed to load profile:', err);
          if (err.response?.status === 401) {
            setToken(null);
            setShop(null);
          }
        }
      }
      setLoading(false);
    }
    loadShopProfile();
  }, [token]);

  // Listen to 401 unauth events from api.js
  useEffect(() => {
    const handleUnauth = () => {
      setToken(null);
      setShop(null);
    };
    window.addEventListener('dukaanai_unauthorized', handleUnauth);
    return () => window.removeEventListener('dukaanai_unauthorized', handleUnauth);
  }, []);

  const login = async (phone, password, extra = {}) => {
    const res = await authAPI.login(phone, password, extra);
    const { token: receivedToken, shop: receivedShop } = res.data;
    setToken(receivedToken);
    setShop(receivedShop);
    if (receivedShop?.preferred_language) {
      i18n.changeLanguage(receivedShop.preferred_language);
    }
    return receivedShop;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    const { token: receivedToken, shop: receivedShop } = res.data;
    setToken(receivedToken);
    setShop(receivedShop);
    if (receivedShop.preferred_language) {
      i18n.changeLanguage(receivedShop.preferred_language);
    }
    return receivedShop;
  };

  const logout = () => {
    setToken(null);
    setShop(null);
    localStorage.removeItem('dukaanai_token');
    localStorage.removeItem('dukaanai_shop');
  };

  const updateProfileState = (updatedFields) => {
    setShop((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        shop,
        loading,
        isAuthenticated: !!token && !!shop,
        login,
        register,
        logout,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

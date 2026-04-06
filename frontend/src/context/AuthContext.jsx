import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axiosInstance.get('/users/auth/v1/fetch');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/users/auth/v1/login', { email, password });
    setUser(res.data.User);
    return res.data;
  };

  const register = async (data) => {
    const res = await axiosInstance.post('/users/auth/v1/register', data);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    document.cookie = 'Token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

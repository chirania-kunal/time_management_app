import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load user if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API}/api/auth/me`);
          setUser(res.data.user);
          setIsAuthenticated(true);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError('Authentication failed. Please login again.');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API}/api/auth/register`, formData);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.post(`${API}/api/auth/login`, formData);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.put(`${API}/api/auth/me`, formData);
      
      setUser(res.data.user);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  // Update password
  const updatePassword = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await axios.put(`${API}/api/auth/password`, formData);
      
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Password update failed');
      throw err;
    }
  };

  // Clear errors
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
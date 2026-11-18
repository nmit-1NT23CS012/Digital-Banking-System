import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await authService.getProfile();
          setUser(response.data.data);
          setIsAuthenticated(true);
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const refreshProfile = async () => {
      try {
        const response = await authService.getProfile();
        setUser(response.data.data);
      } catch (error) {
        console.error('Failed to refresh profile:', error.message);
      }
    };

    window.addEventListener('refreshProfile', refreshProfile);
    return () => window.removeEventListener('refreshProfile', refreshProfile);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { token, refreshToken, user } = response.data.data;
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  }, []);

  const register = useCallback(async (fullName, email, password, confirmPassword) => {
    try {
      const response = await authService.register({ fullName, email, password, confirmPassword });
      toast.success('Registration successful! Please login.');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout API error (still proceeding):', error.message);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

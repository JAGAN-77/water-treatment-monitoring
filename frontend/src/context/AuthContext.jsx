import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('wt_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('wt_auth_token'));
  const [loading, setLoading] = useState(true);

  // Restore & verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('wt_auth_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('wt_auth_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed:', err.response?.data?.error || err.message);
          localStorage.removeItem('wt_auth_token');
          localStorage.removeItem('wt_auth_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async ({ email, password, role }) => {
    try {
      const res = await api.post('/auth/login', { email, password, role });
      if (res.data?.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setUser(receivedUser);
        setToken(receivedToken);
        localStorage.setItem('wt_auth_token', receivedToken);
        localStorage.setItem('wt_auth_user', JSON.stringify(receivedUser));
        return { success: true, user: receivedUser };
      }
      throw new Error(res.data?.error || 'Authentication failed');
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('wt_auth_token');
      localStorage.removeItem('wt_auth_user');
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => {
      const updated = { ...prev, ...updatedUserData };
      localStorage.setItem('wt_auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        updateUser,
        hasRole
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

export default AuthContext;

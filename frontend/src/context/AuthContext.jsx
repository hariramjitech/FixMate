import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Immediate recovery from localStorage to prevent flash of unauth
    const saved = localStorage.getItem('urban_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(() => {
    // Start as loading if there's a saved session so we sync before rendering
    const saved = localStorage.getItem('urban_user');
    return Boolean(saved);
  });
  const [socket, setSocket] = useState(null);

  // Set default axios base URL
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

  // Sync auth header whenever user changes
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  // On every app load, re-sync user profile from server to pick up any
  // changes made while offline (e.g. admin verified worker, profile edits).
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      const isWorker = user.role === 'worker';
      const endpoint = isWorker ? '/workers/profile' : '/auth/me';
      axios.get(endpoint)
        .then(res => {
          const updatedData = { ...user, ...res.data };
          if (!updatedData.role) updatedData.role = isWorker ? 'worker' : 'user';
          setUser(updatedData);
          localStorage.setItem('urban_user', JSON.stringify(updatedData));
        })
        .catch(err => {
          if (err.response?.status === 401) {
            setUser(null);
            localStorage.removeItem('urban_user');
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      const serverUrl = import.meta.env.VITE_SOCKET_URL || 'http://100.31.66.227';
      const newSocket = io(serverUrl, {
        auth: { token: user.token }
      });
      
      newSocket.on('connect', () => {
         newSocket.emit('join', user._id);
      });
      
      setSocket(newSocket);
      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const login = async (email, password, type = 'user') => {
    const endpoint = type === 'worker' ? '/auth/worker/login' : '/auth/login';
    const response = await axios.post(endpoint, { email, password });
    const userData = { ...response.data, role: type === 'worker' ? 'worker' : (response.data.role || 'user') };
    
    setUser(userData);
    localStorage.setItem('urban_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (formData, type = 'user') => {
    const endpoint = type === 'worker' ? '/auth/worker/register' : '/auth/register';
    const response = await axios.post(endpoint, formData);
    const userData = { ...response.data, role: type === 'worker' ? 'worker' : (response.data.role || 'user') };
    
    setUser(userData);
    localStorage.setItem('urban_user', JSON.stringify(userData));
    return userData;
  };

  const refreshUser = async () => {
    if (!user) return;
    try {
      const isWorker = user.role === 'worker';
      const endpoint = isWorker ? '/workers/profile' : '/auth/me';
      const response = await axios.get(endpoint);
      
      // Merge with existing user to keep token and other local state
      const updatedData = { ...user, ...response.data };
      
      // Ensure role is preserved if backend doesn't return it
      if (!updatedData.role) updatedData.role = isWorker ? 'worker' : 'user';
      
      setUser(updatedData);
      localStorage.setItem('urban_user', JSON.stringify(updatedData));
      return updatedData;
    } catch (error) {
      console.error('Failed to refresh user data', error);
      // If unauthorized, logout
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('urban_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, loading, socket }}>
      {children}
    </AuthContext.Provider>
  );
};

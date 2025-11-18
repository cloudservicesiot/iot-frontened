import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }, []);

  // Validate token on mount and periodically
  useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Decode JWT token to check expiration (basic check)
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          
          if (payload.exp && payload.exp < currentTime) {
            // Token expired
            logout();
          } else {
            setAuthToken(token);
          }
        } catch (error) {
          // Invalid token format
          console.error('Token validation error:', error);
          logout();
        }
      }
    };

    validateToken();
    
    // Check token validity every 5 minutes
    const interval = setInterval(validateToken, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [logout]);

  const login = (token, userData = null) => {
    setAuthToken(token);
    localStorage.setItem('authToken', token);
    
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      // Try to extract user info from token if available
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.username || payload.email) {
          const userInfo = {
            username: payload.username || payload.email?.split('@')[0] || 'User',
            email: payload.email || '',
          };
          setUser(userInfo);
          localStorage.setItem('user', JSON.stringify(userInfo));
        }
      } catch (error) {
        console.error('Error extracting user info from token:', error);
      }
    }
  };

  const isAuthenticated = !!authToken;

  return (
    <AuthContext.Provider value={{ 
      authToken, 
      user,
      login, 
      logout, 
      isAuthenticated,
      setUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

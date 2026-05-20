import React, { createContext, useState, useEffect } from 'react';
import SecureStorage from 'react-secure-storage';
import Cookies from 'js-cookie';
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = SecureStorage.getItem('localToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token) => {
    SecureStorage.setItem('localToken', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    SecureStorage.removeItem('localToken');
 
    Cookies.remove('jwtToken', { path: '/' });
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };

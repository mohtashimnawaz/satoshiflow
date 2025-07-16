import React, { createContext, useContext, useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [walletType, setWalletType] = useState(null); // 'plug' or null

  useEffect(() => {
    // Check for existing Plug connection
    const checkPlug = async () => {
      if (window.ic && window.ic.plug) {
        const isConnected = await window.ic.plug.isConnected();
        if (isConnected) {
          const principal = await window.ic.plug.getPrincipal();
          setUser(principal);
          setIsAuthenticated(true);
          setWalletType('plug');
        }
      }
      setIsLoading(false);
    };
    checkPlug();
  }, []);

  const login = async (principal) => {
    try {
      setUser(principal);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  };

  const loginWithPlug = async () => {
    try {
      if (!window.ic || !window.ic.plug) {
        alert('Plug Wallet is not installed!');
        return false;
      }
      const connected = await window.ic.plug.requestConnect();
      if (connected) {
        const principal = await window.ic.plug.getPrincipal();
        setUser(principal);
        setIsAuthenticated(true);
        setWalletType('plug');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Plug login failed:', error);
      return false;
    }
  };

  const logoutPlug = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setWalletType(null);
    // Plug does not have a disconnect method; just clear app state
    return true;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    walletType,
    login,
    logout,
    loginWithPlug,
    logoutPlug,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

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
  const [walletType, setWalletType] = useState(null); // 'plug', 'ii', or null

  useEffect(() => {
    // Check for existing Plug or II connection
    const checkAuth = async () => {
      // Plug
      if (window.ic && window.ic.plug) {
        const isConnected = await window.ic.plug.isConnected();
        if (isConnected) {
          const principal = await window.ic.plug.getPrincipal();
          setUser(principal);
          setIsAuthenticated(true);
          setWalletType('plug');
          setIsLoading(false);
          return;
        }
      }
      // Internet Identity
      const authClient = await AuthClient.create();
      const isAuthenticatedII = await authClient.isAuthenticated();
      if (isAuthenticatedII) {
        const identity = authClient.getIdentity();
        const principal = identity.getPrincipal();
        setUser(principal);
        setIsAuthenticated(true);
        setWalletType('ii');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
    };
    checkAuth();
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

  // Plug login/logout (existing)
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
    return true;
  };

  // Internet Identity login/logout
  const loginWithII = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: process.env.DFX_NETWORK === 'ic'
          ? 'https://identity.ic0.app/#authorize'
          : 'http://uzt4z-lp777-77774-qaabq-cai.localhost:4943/',
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal();
          setUser(principal);
          setIsAuthenticated(true);
          setWalletType('ii');
        },
      });
      return true;
    } catch (error) {
      console.error('Internet Identity login failed:', error);
      return false;
    }
  };

  const logoutII = async () => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    setUser(null);
    setIsAuthenticated(false);
    setWalletType(null);
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
    loginWithII,
    logoutII,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

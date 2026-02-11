
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Page } from '../types';
import { DB } from '../services/db';

interface AuthContextType {
  user: User | null;
  login: (email: string, token: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (username: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onNavigate: (p: Page) => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, onNavigate }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check session
    const storedUser = localStorage.getItem('sf_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, token: string) => {
    const validUser = DB.login(email, token);
    if (validUser) {
      setUser(validUser);
      localStorage.setItem('sf_session', JSON.stringify(validUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sf_session');
    onNavigate(Page.AUTH);
  };

  const updateProfile = (username: string) => {
      if (user) {
          const updated = DB.updateUser(user.id, { username });
          if (updated) {
              setUser(updated);
              localStorage.setItem('sf_session', JSON.stringify(updated));
          }
      }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

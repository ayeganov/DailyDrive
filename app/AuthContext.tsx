"use client";
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = async (username: string, password: string) =>
  {
    console.log('Logging in with:', username, password);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () =>
{
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const withAuth = (WrappedComponent: React.FC) =>
{
  return (props: any) => {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() =>
    {
      if(!isAuthenticated)
      {
        router.replace('/login');
      }
      else
      {
        router.replace('/');
      }
    }, [isAuthenticated, router]);

    if (!isAuthenticated)
    {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };
};

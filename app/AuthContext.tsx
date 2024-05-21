"use client";
import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from "axios";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';


interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const login = async (username: string, password: string) =>
  {
    console.log('Logging in with:', username, password);
    try
    {
      const form_data = new FormData();
      form_data.set('username', username);
      form_data.set('password', password);

      const login_info = await axios.post('/backend/auth/jwt/login',
                                          form_data,
          {headers: {'Content-Type': 'multipart/form-data'}});

      const auth_token = login_info.data.access_token;
      localStorage.setItem('auth_token', auth_token);
      setIsAuthenticated(true);
      return true;
    }
    catch (error)
    {
      console.error('Error logging in:', error);
      return false;
    }
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
    }, [isAuthenticated, router]);

    if (!isAuthenticated)
    {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };
};

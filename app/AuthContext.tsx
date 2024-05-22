"use client";
import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from "axios";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';


interface AuthContextType {
  is_authenticated: boolean;
  active_user: string;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


const save_auth_token = (auth_token: string) =>
{
  localStorage.setItem('auth_token', auth_token);
}


const get_auth_token = () =>
{
  return localStorage.getItem('auth_token');
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [is_authenticated, set_is_authenticated] = useState<boolean>(false);

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
      save_auth_token(auth_token);
      set_is_authenticated(true);
      return true;
    }
    catch (error)
    {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = () => {
    set_is_authenticated(false);
  };

  return (
    <AuthContext.Provider value={{ is_authenticated, login, logout }}>
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
    const { is_authenticated } = useAuth();
    const router = useRouter();

    useEffect(() =>
    {
      if(!is_authenticated)
      {
        router.replace('/login');
      }
    }, [is_authenticated, router]);

    if (!is_authenticated)
    {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };
};

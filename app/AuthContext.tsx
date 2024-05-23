"use client";
import React, { createContext, useState, useContext, ReactNode } from 'react';
import axios from "axios";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';


interface User
{
  username: string;
  token: string;
}


interface AuthContextType
{
  users: User[];
  activeUser: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: (username: string) => void;
  switchUser: (username: string) => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


const saveAuthTokens = (users: User[]) =>
{
  if (typeof window !== 'undefined')
  {
    localStorage.setItem('auth_tokens', JSON.stringify(users));
  }
};


const getAuthTokens = (): User[] =>
{
  if (typeof window !== 'undefined')
  {
    const storedTokens = localStorage.getItem('auth_tokens');
    return storedTokens ? JSON.parse(storedTokens) : [];
  }
  return [];
};


const get_active_user = (users: User[]): string | null =>
{
  if (typeof window !== 'undefined')
  {
    const active_user = localStorage.getItem('active_user');
    if (storedTokens)
    {
      const activeToken = users.find((user) => user.username === JSON.parse(storedTokens));
      return activeToken ? activeToken.username : null;
    }
  }
  return null;
}


export const AuthProvider = ({ children }: { children: ReactNode }) =>
{
  const [users, setUsers] = useState<User[]>(getAuthTokens());
  const [activeUser, setActiveUser] = useState<string | null>(null);

  useEffect(() => {
    const activeToken = users.find((user) => user.username === activeUser);
    if (activeToken)
    {
      axios.defaults.headers.common.Authorization = `Bearer ${activeToken.token}`;
    }
  }, [activeUser, users]);

  useEffect(() => {
    const stored_users = getAuthTokens();
    setUsers(stored_users);
  }, []);


  const login = async (username: string, password: string) => {
    console.log('Logging in with:', username, password);
    try {
      const formData = new FormData();
      formData.set('username', username);
      formData.set('password', password);

      const loginInfo = await axios.post('/backend/auth/jwt/login', formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const authToken = loginInfo.data.access_token;
      const updatedUsers = [...users, { username, token: authToken }];
      setUsers(updatedUsers);
      saveAuthTokens(updatedUsers);
      setActiveUser(username);
      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = (username: string) =>
  {
    const updatedUsers = users.filter((user) => user.username !== username);
    setUsers(updatedUsers);
    saveAuthTokens(updatedUsers);
    if (activeUser === username) {
      setActiveUser(null);
    }
  };

  const switchUser = (username: string) => {
    setActiveUser(username);
  };

  return (
    <AuthContext.Provider value={{ users, activeUser, login, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () =>
{
  const context = useContext(AuthContext);
  if (context === undefined)
  {
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

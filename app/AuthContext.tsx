"use client";
import { createContext, useState, useContext, ReactNode } from 'react';
import axios from "axios";
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { User } from './types';


interface AuthContextType {
  users: Map<string, User>;
  active_user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: (email: string) => void;
  switch_user: (user: User|null) => void;
  user_initialized: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

const save_users_to_local_storage = (users: Map<string, User>) => {
  if (typeof window !== 'undefined') {
    const usersArray = Array.from(users.values());
//    console.log("Saving users to local storage:", usersArray);
    localStorage.setItem('users', JSON.stringify(usersArray));
  }
};

const get_users_from_local_storage = (): User[] => {
  if (typeof window !== 'undefined') {
    const stored_users = localStorage.getItem('users');
//    console.log("Stored users:", stored_users);
    return stored_users ? JSON.parse(stored_users) : [];
  }
  console.log("No window object, returning empty array.");
  return [];
};


const is_token_expired = (token: string): boolean => {
  const decoded_token = jwtDecode(token);
  if (decoded_token === undefined) {
    return true;
  }

  const now = Date.now() / 1000;

  if (decoded_token.exp === undefined)
  {
    return true;
  }

  return decoded_token.exp < now;
};

const restore_logged_users = (): Map<string, User> => {
  const users = get_users_from_local_storage();
  const valid_users = users.filter((user) => !is_token_expired(user.token));
//  console.log("Valid users:", valid_users);
  return new Map(valid_users.map(user => [user.name, user]));
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<Map<string, User>>(restore_logged_users());
  const [active_user, setActiveUser] = useState<User | null>(null);
  const [user_initialized, setUserInitialized] = useState(false);

  useEffect(() => {
//    console.log('1 Active user:', active_user);
    if (active_user && active_user.token) {
//      console.log("3 Setting axios token:", active_user.token);

      const interceptor = axios.interceptors.request.use(
        (config) => {
          config.headers["Authorization"] = `Bearer ${active_user.token}`;
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      setUserInitialized(true);
      return () => {
        axios.interceptors.request.eject(interceptor);
      };
    }
    else
    {
//      console.log("No active user, not setting axios token.");
      setUserInitialized(true);
    }
  }, [active_user]);

  useEffect(() => {
//    console.info('2 Saving users to long term storage:', users);
    save_users_to_local_storage(users);
  }, [users]);

  const login = async (username: string, password: string) => {
    try {
      const formData = new FormData();
      formData.set('username', username);
      formData.set('password', password);

      const loginInfo = await axios.post('/backend/auth/jwt/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const auth_token = loginInfo.data.access_token;
      const user_response = await axios.get('/backend/api/v1/users/me', {
        headers: { Authorization: `Bearer ${auth_token}` },
      });

      if (user_response.status !== 200) {
        console.error('Error logging in:', user_response);
        return false;
      }

      const current_user = user_response.data;
      current_user.token = auth_token;
      const updated_users = new Map(users);
      updated_users.set(current_user.email, current_user);

      setUsers(updated_users);
//      console.log("Setting active user:", current_user);
      setActiveUser(current_user);

      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = (email: string) => {
//    console.log("Removing user from local storage:", email);
    const updated_users = new Map(users);
    updated_users.delete(email);
    setUsers(updated_users);

    if (active_user !== null && active_user.email === email) {
      setActiveUser(null);
    }

    setUserInitialized(false);
  };

  const switch_user = (user: User | null) => {
    setUserInitialized(false);
//    console.log("Switching user to:", user);
    setActiveUser(user);
  };

  return (
    <AuthContext.Provider value={{ users, active_user, login, logout, switch_user, user_initialized }}>
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

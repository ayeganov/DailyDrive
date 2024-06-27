"use client";
import { createContext, useState, useContext, ReactNode } from 'react';
import axios from "axios";
import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  username: string;
  token: string;
  email: string;
}

interface AuthContextType {
  users: Map<string, User>;
  active_user: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: (username: string) => void;
  switch_user: (username: string|null) => void;
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
  return new Map(valid_users.map(user => [user.username, user]));
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<Map<string, User>>(restore_logged_users());
  const [active_user, setActiveUser] = useState<string | null>(null);
  const [user_initialized, setUserInitialized] = useState(false);

  useEffect(() => {
    const current_active_user = users.get(active_user || '');
    if (current_active_user) {
//      console.log("3 Setting axios token:", current_active_user.token);
      axios.defaults.headers.common.Authorization = `Bearer ${current_active_user.token}`;
      setUserInitialized(true);
    }
  }, [active_user, users]);

  useEffect(() => {
//    console.info('2 Saving users to long term storage:', users);
    save_users_to_local_storage(users);
  }, [users]);

  const login = async (username: string, password: string) => {
//    console.log('Logging in with:', username, password);
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
      const updated_users = new Map(users);
      updated_users.set(current_user.email, { username: current_user.name, token: auth_token, email: current_user.email});

      setUsers(updated_users);
      setActiveUser(username);

      return true;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = (username: string) => {
    const updated_users = new Map(users);
    updated_users.delete(username);
    setUsers(updated_users);

    if (active_user === username) {
      setActiveUser(null);
    }

    setUserInitialized(false);
  };

  const switch_user = (username: string | null) => {
    setUserInitialized(false);
    setActiveUser(username);
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

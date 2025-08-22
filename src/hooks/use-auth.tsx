
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getUsers, saveUsers } from '@/lib/data';
import type { User, Role } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: Role) => boolean;
  logout: () => void;
  register: (data: Omit<User, 'id' | 'avatarUrl'|'attendance'>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client
    const allUsers = getUsers();
    setUsers(allUsers);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string, role: Role): boolean => {
    const allUsers = getUsers();
    const foundUser = allUsers.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = (data: Omit<User, 'id' | 'avatarUrl' | 'attendance'>): boolean => {
    const allUsers = getUsers();
    const existingUser = allUsers.find(u => u.email === data.email);

    if (existingUser) {
        return false;
    }

    const newUser: User = {
        id: `user${allUsers.length + 1}`,
        ...data,
        avatarUrl: `https://placehold.co/100x100.png`
    };
    
    const updatedUsers = [...allUsers, newUser];
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    
    return true;
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

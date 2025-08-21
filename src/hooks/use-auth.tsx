
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getUsers, saveUsers, mockUsers } from '@/lib/data';
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
    try {
      const allUsers = getUsers();
      setUsers(allUsers);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
        console.error("Failed to parse from storage", error)
        localStorage.removeItem('user');
        sessionStorage.removeItem('users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, password: string, role: Role): boolean => {
    const allUsers = getUsers(); // Always get the latest list
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
    const allUsers = getUsers(); // Start with the definitive list from storage
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
    setUsers(updatedUsers); // Update the state right after saving
    
    return true;
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

// Wrap layout with AuthProvider
export function AppWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}


export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This will happen if you are trying to use this hook outside of an AuthProvider
    // For this app, we will assume it's loading and there is no user
    return {
        user: null,
        isLoading: true,
        login: () => false,
        logout: () => {},
        register: () => false,
    }
  }
  return context;
};

// This wrapping is a workaround for client component context usage in root layout
const OriginalRootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    // This is a placeholder for the original RootLayout content
    return <>{children}</>
}


export const AuthWrappedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
    return <AuthProvider><OriginalRootLayout>{children}</OriginalRootLayout></AuthProvider>
}

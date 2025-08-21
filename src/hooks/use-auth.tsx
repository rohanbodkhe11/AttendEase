
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { users as mockUsers } from '@/lib/data';
import type { User, Role } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: Role) => boolean;
  logout: () => void;
  register: (data: Omit<User, 'id' | 'avatarUrl'|'attendance'>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a simple in-memory store for users that gets reset on page refresh.
// In a real app, you would use a database.
let users = [...mockUsers];


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error)
        localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, password: string, role: Role): boolean => {
    const foundUser = users.find(
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
    const existingUser = users.find(u => u.email === data.email);
    if (existingUser) {
        return false;
    }
    const newUser: User = {
        id: `user${users.length + 1}`,
        ...data,
        avatarUrl: `https://placehold.co/100x100.png`
    };
    users.push(newUser); 
    // In a real app, this would be an API call.
    // We don't log them in automatically.
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

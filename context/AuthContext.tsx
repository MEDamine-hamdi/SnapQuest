import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: string;
  email: string;
  token?: string;
};

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
  const bootstrapAsync = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      setUser(null);
    } catch (e) {
      console.error('Failed to restore token', e);
    } finally {
      setIsLoading(false);
    }
  };
  bootstrapAsync();
}, []);

  const signIn = async (email: string, password: string) => {
  const response = await fetch('http://192.168.1.13:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Erreur de connexion');
  }
  const data = await response.json();
  const userData = { id: data.user.id, email: data.user.email, token: data.token };
  setUser(userData);
  await SecureStore.setItemAsync('userToken', JSON.stringify(userData));
};

  const signUp = async (email: string, password: string, username: string) => {
  const response = await fetch('http://192.168.1.13:8000/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: username }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Erreur inscription');
  }
};
  const logout = async () => {
    setUser(null);
    await SecureStore.deleteItemAsync('userToken');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}